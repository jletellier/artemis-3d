import { Scene, Mesh, StandardMaterial, Texture, TransformNode, SceneSerializer, SceneLoader,
    AssetsManager, Observable, AbstractMesh } from 'babylonjs';
import 'babylonjs-loaders';

class Project {

    _id: string = null;
    _scene: Scene;
    _hasXR: boolean = false;
    _markerContainer: TransformNode;
    _uploadPath: string;

    onMarkerChangedObservable = new Observable<void>();
    onHasXRChangedObservable = new Observable<void>();

    set id(newID: string) {
        if (this._id !== newID) {
            this._id = newID;
            this._uploadPath = `upload/${this._id}/`;

            if (this._scene) {
                this._loadScene();
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
            this._loadScene();
        }
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

    _loadScene() {
        // const assetsManager = new AssetsManager(this._scene);

        this._markerContainer.getChildren().forEach((child) => {
            child.dispose(false, true);
        });

        const sceneUrl = `${this._uploadPath}scene.babylon`;

        SceneLoader.LoadAssetContainer('../', sceneUrl, this._scene, (container) => {
            container.addAllToScene();
            container.meshes.forEach((mesh) => {
                if (mesh.name.endsWith('.glb') || mesh.name.endsWith('.gltf')) {
                    const uploadUrl = this._uploadPath + mesh.name;
                    SceneLoader.LoadAssetContainer('../', uploadUrl, this._scene, (container) => {
                        const rootMesh = container.createRootMesh();
                        rootMesh.setParent(mesh);
                        container.addAllToScene();

                        this.onMarkerChangedObservable.notifyObservers();
                    });
                }
            });
            
            this.onMarkerChangedObservable.notifyObservers();
        });

        // const task = assetsManager.addMeshTask('marker-container-task', '', '../', sceneUrl);
        // assetsManager.onTasksDoneObservable.add((tasks) => {
        //     this.onMarkerChangedObservable.notifyObservers();
        // });
        // assetsManager.load();
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
