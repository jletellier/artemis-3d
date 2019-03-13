import { Scene, Mesh, StandardMaterial, Texture, TransformNode, SceneSerializer, SceneLoader,
    AssetsManager, Observable, AbstractMesh, Angle, Node } from '@babylonjs/core';
import '@babylonjs/loaders/glTF/2.0';
import 'pouchdb';
import ImageMarkerScript from '../ImageMarkerScript';

class Project {

    _id: string = null;
    _scene: Scene;
    _hasXR: boolean = false;
    _markerContainer: TransformNode;
    _selectedMarker: string;
    _selectedNode: string;
    _uploadPath: string;
    _assetsManager: AssetsManager = null;
    _socket: WebSocket;
    _throttledSaveScene: Function;

    onSceneChangedObservable = new Observable<void>();
    onHasXRChangedObservable = new Observable<void>();
    db: PouchDB.Database;
    remoteDB: PouchDB.Database;

    constructor() {
        this._throttledSaveScene = throttle(this._saveSceneAsync.bind(this), 1000);

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

    setSelectedMarker(markerName: string) {
        if (markerName === this._selectedMarker && !this._selectedNode) {
            return;
        }

        const markers = this._markerContainer.getChildTransformNodes(true, (node) => {
            node.setEnabled(false);
            return (node.name === markerName);
        });

        if (!markers.length) {
            return;
        }

        markers[0].setEnabled(true);
        this._selectedMarker = markerName;
        this._selectedNode = null;
        this.onSceneChangedObservable.notifyObservers();
    }

    setSelectedNode(nodeName: string) {
        if (nodeName !== this._selectedNode) {
            this._selectedNode = nodeName;
            this.onSceneChangedObservable.notifyObservers();
        }
    }

    getSelectedMarker() {
        return this._selectedMarker;
    }

    getSelectedNode() {
        return this._selectedNode;
    }

    getSelectedMeshAttributes(): MeshAttributes {
        const markerMesh = this._scene.getMeshByName(this._selectedMarker);
        const nodeMesh = this._scene.getMeshByName(this._selectedNode);
        
        // NOTE: The following terribly ugly and will soon be replaced with a generic system

        if (nodeMesh) {
            return {
                type: 'node',
                name: nodeMesh.name,
                realWidth: nodeMesh.scaling.x,
                posX: nodeMesh.position.x,
                posY: nodeMesh.position.y,
                posZ: nodeMesh.position.z,
                scaleX: nodeMesh.scaling.x,
                scaleY: nodeMesh.scaling.y,
                scaleZ: nodeMesh.scaling.z,
                rotationX: Angle.FromRadians(nodeMesh.rotation.x).degrees(),
                rotationY: Angle.FromRadians(nodeMesh.rotation.y).degrees(),
                rotationZ: Angle.FromRadians(nodeMesh.rotation.z).degrees(),
            };
        }
        
        if (markerMesh) {
            return {
                type: 'marker',
                name: markerMesh.name,
                realWidth: markerMesh.scaling.x,
                posX: markerMesh.position.x,
                posY: markerMesh.position.y,
                posZ: markerMesh.position.z,
                scaleX: markerMesh.scaling.x,
                scaleY: markerMesh.scaling.y,
                scaleZ: markerMesh.scaling.z,
                rotationX: markerMesh.rotation.x,
                rotationY: markerMesh.rotation.y,
                rotationZ: markerMesh.rotation.z,
            };
        }
    }

    setSelectedMeshAttribute(type: string, value: number) {
        const meshName = this._selectedNode || this._selectedMarker;
        const mesh = this._scene.getMeshByName(meshName);
        
        // NOTE: The following terribly ugly and will soon be replaced with a generic system

        if (mesh) {
            if (type === 'realWidth') {
                const material = <StandardMaterial>mesh.material;
                const texture = <Texture>material.diffuseTexture;
                const size = texture.getSize();
                const ppm = size.width / value; // Pixel per meter
                mesh.scaling.set(size.width / ppm, size.height / ppm, size.width / ppm);
                mesh.refreshBoundingInfo();
            } else if (type === 'posX') {
                mesh.position.x = value;
            } else if (type === 'posY') {
                mesh.position.y = value;
            } else if (type === 'posZ') {
                mesh.position.z = value;
            } else if (type === 'scaleX') {
                mesh.scaling.x = value;
            } else if (type === 'scaleY') {
                mesh.scaling.y = value;
            } else if (type === 'scaleZ') {
                mesh.scaling.z = value;
            } else if (type === 'rotationX') {
                mesh.rotation.x = Angle.FromDegrees(value).radians();
            } else if (type === 'rotationY') {
                mesh.rotation.y = Angle.FromDegrees(value).radians();
            } else if (type === 'rotationZ') {
                mesh.rotation.z = Angle.FromDegrees(value).radians();
            }

            this._throttledSaveScene();
        }
    }

    getNodeNames(markerName: string) {
        if (!this._markerContainer) {
            return [];
        }

        const marker = this._markerContainer.getChildTransformNodes(true, (node) => {
            return (node.name === markerName);
        });

        if (!marker.length) {
            return [];
        }

        const nodes = marker[0].getChildTransformNodes(true);
        return nodes.map(value => value.name);
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
        rootMesh.id = file.name;
        rootMesh.name = file.name;
        // rootMesh.setParent(markerMesh);
        rootMesh.parent = markerMesh;
        container.addAllToScene();

        await this._saveSceneAsync();

        this._scene.getEngine().hideLoadingUI();
        this.onSceneChangedObservable.notifyObservers();
    }

    async _saveMarkerAsync(file: File) {
        this._scene.getEngine().displayLoadingUI();

        await this._saveFileAsync(file);
        const objectUrl = window.URL.createObjectURL(file);

        const plane = Mesh.CreatePlane(file.name, 1.0, this._scene);
        plane.setParent(this._markerContainer);
        plane.rotation.x = Angle.FromDegrees(90).radians();
        const material = new StandardMaterial(`${file.name}Material`, this._scene);
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

        const ppm = 192 / 0.0254; // Default pixel per meter
        plane.scaling.set(tmpImage.width / ppm, tmpImage.height / ppm, tmpImage.width / ppm);
        plane.refreshBoundingInfo();

        await this._saveSceneAsync();

        this._scene.getEngine().hideLoadingUI();
        this.setSelectedMarker(plane.name);
    }

    _clearScene() {
        this._markerContainer.getChildren().forEach((child) => {
            child.dispose(false, true);
        });
    }

    async _loadSceneAsync() {
        this._scene.getEngine().displayLoadingUI();
        let firstMarker: AbstractMesh;

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
                    if (!firstMarker) {
                        firstMarker = mesh;
                    }
                    const material = <StandardMaterial>mesh.material;
                    const texture = <Texture>material.diffuseTexture;

                    return new Promise((resolve) => {
                        this._loadFileAsync(texture.name).then((file) => {
                            const objectUrl = window.URL.createObjectURL(file);
                            texture.updateURL(objectUrl);
                            resolve();
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
                            glTFMesh.parent = mesh;
                            // glTFMesh.scaling.set(1, 1, 1);
                            // glTFMesh.rotationQuaternion = new Quaternion();
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

        if (this._hasXR) {
            this._markerContainer.getChildMeshes(true).forEach((child) => {
                const behavior = new ImageMarkerScript();
                behavior.enabled = true;
                child.addBehavior(behavior);
            });

            return;
        }

        if (firstMarker) {
            this.setSelectedMarker(firstMarker.name);
            return;
        }

        this.onSceneChangedObservable.notifyObservers();
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

export interface MeshAttributes {
    type: string;
    name: string;
    realWidth: number;
    posX: number;
    posY: number;
    posZ: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
}

// Based on:
// https://gist.github.com/beaucharman/e46b8e4d03ef30480d7f4db5a78498ca#gistcomment-2230205
function throttle(callback: Function, delay: number) {
    let isThrottled = false;
    let args: any;
    let context: any;
  
    function wrapper() {
        if (isThrottled) {
            args = arguments;
            context = this;
            return;
        }
  
        isThrottled = true;
        callback.apply(this, arguments);
      
        setTimeout(
            () => {
                isThrottled = false;
                if (args) {
                    wrapper.apply(context, args);
                    args = context = null;
                }
            },
            delay,
        );
    }
  
    return wrapper;
}

export default new Project();
