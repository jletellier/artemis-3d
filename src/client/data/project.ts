import { Scene, Mesh, StandardMaterial, Texture, TransformNode, SceneSerializer, SceneLoader,
    AssetsManager, Observable } from 'babylonjs';

class Project {

    _id: string = null;
    _scene: Scene;
    _markerContainer: TransformNode;

    onMarkerChangedObservable = new Observable<void>();

    set id(newID: string) {
        if (this._id !== newID) {
            this._id = newID;
            if (this._scene) {
                this._loadScene();
            }
        }
    }

    get id() {
        return this._id;
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
        const uploadUrl = `/upload/${this._id}/${file.name}`;

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

    _loadScene() {
        const assetsManager = new AssetsManager(this._scene);

        this._markerContainer.getChildren().forEach((child) => {
            child.dispose(false, true);
        });

        const sceneUrl = `upload/${this._id}/scene.babylon`;

        assetsManager.addMeshTask('marker-container-task', '', '../', sceneUrl);
        assetsManager.onTasksDoneObservable.addOnce((tasks) => {
            this.onMarkerChangedObservable.notifyObservers();
        });
        assetsManager.load();
    }

    _saveScene() {
        const serializedMesh = SceneSerializer.SerializeMesh(this._markerContainer, false, true);
        
        fetch(`/api/p/${this._id}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(serializedMesh),
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
