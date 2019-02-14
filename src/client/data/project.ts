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

    _initScene() {
        this._clearScene();
        this._loadSceneAsync().catch(() => {});
    }

    addMarker(file: File) {
        if (!this._markerContainer) {
            return;
        }

        this._saveFile(file);
        const uploadUrl = this._uploadPath + file.name;

        const plane = Mesh.CreatePlane(file.name, 20.0, this._scene);
        plane.setParent(this._markerContainer);
        const material = new StandardMaterial('MarkerMaterial', this._scene);
        const texture = new Texture(uploadUrl, this._scene);
        // texture.url = window.URL.createObjectURL(file);
        material.diffuseTexture = texture;
        material.diffuseTexture.hasAlpha = true;
        material.backFaceCulling = false;
        plane.material = material;

        this._saveScene();
        this.onMarkerChangedObservable.notifyObservers();
    }

    getMarkerNames() {
        if (this._markerContainer) {
            const nodes = this._markerContainer.getChildTransformNodes(true);
            return nodes.map(value => value.name);
        }
        return [];
    }

    addGlTFNode(file: File, markerID: string) {
        this._saveFile(file);
        const uploadUrl = this._uploadPath + file.name;

        SceneLoader.LoadAssetContainer('../', uploadUrl, this._scene, (container) => {
            const markerMesh = this._scene.getMeshByName(markerID);
            const rootMesh = container.createRootMesh();
            rootMesh.name = file.name;
            rootMesh.setParent(markerMesh);
            container.addAllToScene();

            this._saveScene();
        });
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
                    console.log(err);
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
                            glTFMesh.scaling = new Vector3(1, 1, 1);
                            glTFMesh.rotationQuaternion = new Quaternion();
                            glTFMesh.setParent(mesh);
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

    _saveScene() {
        const meshes: AbstractMesh[] = [];
        this._markerContainer.getChildMeshes(true).forEach((child) => {
            meshes.push(child);
            meshes.push(...child.getChildMeshes(true));
        });
        
        const serializedMeshes = SceneSerializer.SerializeMesh(meshes, false, false);
        
        fetch(`/api/p/${this._id}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(serializedMeshes),
        });
    }

    _saveFile(file: File) {
        const formData = new FormData();
        formData.append('content', file);

        fetch(`/api/p/${this._id}/upload`, {
            method: 'PUT',
            body: formData,
        });
    }

}

export default new Project();
