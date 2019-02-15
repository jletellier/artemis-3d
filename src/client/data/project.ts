import { Scene, Mesh, StandardMaterial, Texture, TransformNode, SceneSerializer, SceneLoader,
    AssetsManager, Observable, AbstractMesh, TextFileAssetTask, Vector3,
    Quaternion } from 'babylonjs';
import 'babylonjs-loaders';
import ImageMarkerScript from '../ImageMarkerScript';

class Project {

    _id: string = null;
    _scene: Scene;
    _hasXR: boolean = false;
    _markerContainer: TransformNode;
    _uploadPath: string;
    _assetsManager: AssetsManager = null;

    onMarkerChangedObservable = new Observable<void>();
    onHasXRChangedObservable = new Observable<void>();

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
        this._clearScene();
        this._loadSceneAsync().catch(() => {});
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
        await this._saveFileAsync(file);
        const uploadUrl = this._uploadPath + file.name;

        await new Promise((resolve) => {
            SceneLoader.LoadAssetContainer('../', uploadUrl, this._scene, (container) => {
                const markerMesh = this._scene.getMeshByName(markerID);
                const rootMesh = container.createRootMesh();
                rootMesh.name = file.name;
                rootMesh.setParent(markerMesh);
                rootMesh.scaling.set(0.1, 0.1, 0.1);
                container.addAllToScene();
                resolve();
            });
        });

        this._saveSceneAsync();
    }

    async _saveMarkerAsync(file: File) {
        this._scene.getEngine().displayLoadingUI();

        await this._saveFileAsync(file);
        const uploadUrl = this._uploadPath + file.name;
        const objectUrl = window.URL.createObjectURL(file);

        const plane = Mesh.CreatePlane(file.name, 1.0, this._scene);
        plane.setParent(this._markerContainer);
        const material = new StandardMaterial('MarkerMaterial', this._scene);
        const texture = new Texture(objectUrl, this._scene);
        texture.name = uploadUrl;
        texture.url = uploadUrl;
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

        const sceneUrl = `${this._uploadPath}scene.babylon`;
        const sceneTask = this.assetsManager.addMeshTask('', '', '../', sceneUrl);

        await new Promise((resolve, reject) => {
            sceneTask.run(
                this._scene,
                () => {
                    resolve();
                },
                (err) => {
                    console.log('Scene does not exist');
                    // TODO: FIXME
                    this._scene.getEngine().hideLoadingUI();
                    this.onMarkerChangedObservable.notifyObservers();
                    reject();
                },
            );
        });

        const promises = sceneTask.loadedMeshes.map((mesh) => {
            if (mesh.parent === this._markerContainer) {
                const material = <StandardMaterial>mesh.material;
                const texture = <Texture>material.diffuseTexture;

                return new Promise((resolve) => {
                    texture.onLoadObservable.add(resolve);
                });
            }

            if (mesh.name.endsWith('.glb') || mesh.name.endsWith('.gltf')) {
                if (mesh.getChildMeshes(true, n => n.name === '__root__').length) {
                    return;
                }

                const uploadUrl = this._uploadPath + mesh.name;
                const task = this.assetsManager.addMeshTask('', '', '../', uploadUrl);

                return new Promise((resolve, reject) => {
                    task.run(
                        this._scene,
                        () => {
                            const glTFMesh = task.loadedMeshes.find(o => o.name === '__root__');
                            glTFMesh.setParent(mesh);
                            glTFMesh.scaling.set(1, 1, 1);
                            glTFMesh.rotationQuaternion = new Quaternion();
                            resolve();
                        },
                        (err) => {
                            console.log(err);
                            reject();
                        },
                    );
                });
            }
        });

        await Promise.all(promises);

        this._markerContainer.getChildren().forEach((child) => {
            const behavior = new ImageMarkerScript();
            behavior.enabled = true;
            child.addBehavior(behavior);
        });

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
        
        return fetch(`/api/p/${this._id}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(serializedMeshes),
        });
    }

    async _saveFileAsync(file: File) {
        const formData = new FormData();
        formData.append('content', file);

        return fetch(`/api/p/${this._id}/upload`, {
            method: 'PUT',
            body: formData,
        });
    }

}

export default new Project();
