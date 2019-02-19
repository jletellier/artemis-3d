import { Scene, Mesh, StandardMaterial, Texture, TransformNode, SceneSerializer, SceneLoader,
    AssetsManager, Observable, AbstractMesh, TextFileAssetTask, Vector3,
    Quaternion } from '@babylonjs/core';
import '@babylonjs/loaders/glTF/2.0';
import 'pouchdb';

class Project {

    _id: string = null;
    _scene: Scene;
    _hasXR: boolean = false;
    _markerContainer: TransformNode;
    _uploadPath: string;
    _assetsManager: AssetsManager = null;
    _socket: WebSocket;

    onMarkerChangedObservable = new Observable<void>();
    onHasXRChangedObservable = new Observable<void>();
    db: PouchDB.Database;
    remoteDB: PouchDB.Database;

    constructor() {
        let socketUrl = `${(location.protocol === 'https:') ? 'wss:' : 'ws:'}//`;
        socketUrl += location.hostname;
        socketUrl += (location.port) ? `:${location.port}` : '';

        this._socket = new WebSocket(socketUrl);
        this._socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.info(data.msg);

            if (data.type === 'BUNDLE_END') {
                this._handleBundleReady();
            }
        });
    }

    remoteLog(msg: string) {
        const data = {
            msg,
            type: 'REMOTE_LOG',
        };
        this._socket.send(JSON.stringify(data));
    }

    _handleBundleReady() {
        location.reload(true);
    }

    set id(newID: string) {
        if (this._id !== newID) {
            this._id = newID;

            this._uploadPath = `upload/${this._id}/`;

            if (this._scene) {
                this._initScene();
            }
        }
    }

    get id() {
        return this._id;
    }

    set hasXR(value: boolean) {
        if (this._hasXR !== value) {
            this._hasXR = value;
            this.onHasXRChangedObservable.notifyObservers();
        }
    }

    get hasXR() {
        return this._hasXR;
    }

    set scene(newScene: Scene) {
        this._scene = newScene;

        this._markerContainer = this._scene.getTransformNodeByName('MarkerContainer');
        if (!this._markerContainer) {
            this._markerContainer = new TransformNode('MarkerContainer', this._scene);
        }

        if (this._id) {
            this._initScene();
        }
    }

    get assetsManager() {
        if (!this._assetsManager) {
            this._assetsManager = new AssetsManager(this._scene);
        }
        return this._assetsManager;
    }

    generateID(): string {
        function uuidv4() {
            // @ts-ignore: Copied from https://stackoverflow.com/a/2117523
            // tslint:disable-next-line
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16),
            );
        }
        return uuidv4();
    }

    _initScene() {
        this.db = new PouchDB(this._id);

        const remoteUrl = `${location.protocol}//${location.host}/db/${this._id}`;
        this.remoteDB = new PouchDB(remoteUrl);

        PouchDB.sync(this.db, this.remoteDB);

        this._clearScene();
        this._loadSceneAsync();
    }

    addMarker(file: File) {
        if (!this._markerContainer) {
            return;
        }

        this._saveMarkerAsync(file);
    }

    getMarkerNames() {
        if (this._markerContainer) {
            const nodes = this._markerContainer.getChildTransformNodes(true);
            return nodes.map(value => value.name);
        }
        return [];
    }

    addGlTFNode(file: File, markerID: string) {
        this._saveGlTFNodeAsync(file, markerID);
    }

    async _saveGlTFNodeAsync(file: File, markerID: string) {
        this._scene.getEngine().displayLoadingUI();

        await this._saveFileAsync(file);
        const objectUrl = window.URL.createObjectURL(file);

        const container = await SceneLoader.LoadAssetContainerAsync(
            '', objectUrl, this._scene, null, '.glb',
        );
        const markerMesh = this._scene.getMeshByName(markerID);
        const rootMesh = container.createRootMesh();
        rootMesh.name = file.name;
        rootMesh.setParent(markerMesh);
        rootMesh.scaling.set(0.1, 0.1, 0.1);
        container.addAllToScene();

        await this._saveSceneAsync();

        this._scene.getEngine().hideLoadingUI();
    }

    async _saveMarkerAsync(file: File) {
        this._scene.getEngine().displayLoadingUI();

        await this._saveFileAsync(file);
        const objectUrl = window.URL.createObjectURL(file);

        const plane = Mesh.CreatePlane(file.name, 1.0, this._scene);
        plane.setParent(this._markerContainer);
        const material = new StandardMaterial('MarkerMaterial', this._scene);
        const texture = new Texture(objectUrl, this._scene);
        texture.name = file.name;
        material.diffuseTexture = texture;
        material.diffuseTexture.hasAlpha = true;
        material.backFaceCulling = false;
        plane.material = material;

        const tmpImage = new Image();
        tmpImage.src = objectUrl;
        if (!tmpImage.width) {
            await new Promise((resolve) => {
                tmpImage.onload = resolve;
            });
        }

        // TODO: Determine PPI
        // const ppi = 212.5;
        const ppi = 192;

        const ppm = ppi / 0.0254; // Pixel per meter
        plane.scaling.set(tmpImage.width / ppm, tmpImage.height / ppm, tmpImage.width / ppm);
        plane.refreshBoundingInfo();

        await this._saveSceneAsync();

        this._scene.getEngine().hideLoadingUI();
        this.onMarkerChangedObservable.notifyObservers();
    }

    _clearScene() {
        this._markerContainer.getChildren().forEach((child) => {
            child.dispose(false, true);
        });
    }

    async _loadSceneAsync() {
        this._scene.getEngine().displayLoadingUI();

        const doc = await this.db.get('scene').catch((err) => {
            if (err.name === 'not_found') {
                return null;
            }
            throw err;
        });

        if (doc) {
            this._scene.useDelayedTextureLoading = true;

            const assetContainer = await SceneLoader.LoadAssetContainerAsync(
                '', `data:${JSON.stringify(doc)}`, this._scene,
            );

            const promises = assetContainer.meshes.map((mesh) => {
                if (mesh.parent === this._markerContainer) {
                    const material = <StandardMaterial>mesh.material;
                    const texture = <Texture>material.diffuseTexture;

                    return new Promise((resolve) => {
                        texture.onLoadObservable.add(resolve);
                        this._loadFileAsync(texture.name).then((file) => {
                            const objectUrl = window.URL.createObjectURL(file);
                            texture.updateURL(objectUrl);
                        });
                    });
                }

                if (mesh.name.endsWith('.glb')) {
                    if (mesh.getChildMeshes(true, n => n.name === '__root__').length) {
                        return;
                    }

                    return new Promise((resolve) => {
                        this._loadFileAsync(mesh.name).then((file) => {
                            const objectUrl = window.URL.createObjectURL(file);
                            return SceneLoader.LoadAssetContainerAsync(
                                '', objectUrl, this._scene, null, '.glb',
                            );
                        }).then((container) => {
                            const glTFMesh = container.meshes.find(o => o.name === '__root__');
                            glTFMesh.setParent(mesh);
                            glTFMesh.scaling.set(1, 1, 1);
                            glTFMesh.rotationQuaternion = new Quaternion();
                            container.addAllToScene();
                            resolve();
                        });
                    });
                }
            });

            await Promise.all(promises);
            assetContainer.addAllToScene();
        }

        this._scene.getEngine().hideLoadingUI();
        this.onMarkerChangedObservable.notifyObservers();
    }

    async _saveSceneAsync() {
        const meshes: AbstractMesh[] = [];
        this._markerContainer.getChildMeshes(true).forEach((child) => {
            meshes.push(child);
            meshes.push(...child.getChildMeshes(true));
        });
        
        const serializedMeshes = SceneSerializer.SerializeMesh(meshes, false, false);
        
        await this.db.get('scene').catch((err) => {
            if (err.name === 'not_found') {
                return {
                    _id: 'scene',
                    _rev: null,
                };
            }
            throw err;
        }).then((doc) => {
            serializedMeshes._id = doc._id;
            serializedMeshes._rev = doc._rev;
            return this.db.put(serializedMeshes);
        }).catch((err) => {
            throw err;
        });
    }

    async _saveFileAsync(file: File) {
        const mimeType = file.type || 'application/octet-stream';
        return this.db.putAttachment(file.name, 'file', file, mimeType).catch((err) => {
            throw err;
        });
    }

    async _loadFileAsync(name: string) {
        return this.db.getAttachment(name, 'file').catch((err) => {
            throw err;
        });
    }

}

export default new Project();
