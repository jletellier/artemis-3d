import { Scene, Mesh, StandardMaterial, Texture, TransformNode, SceneSerializer } from 'babylonjs';

class Project {
    
    _id: string = null;
    _scene: Scene;
    _markerContainer: TransformNode;

    set id(newID: string) {
        if (this._id !== newID) {
            this._id = newID;
            this._loadScene();
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
    }

    addMarker(file: File) {
        if (!this._markerContainer) {
            return;
        }

        this._saveFile(file);

        const plane = Mesh.CreatePlane(file.name, 20.0, this._scene);
        plane.setParent(this._markerContainer);
        const material = new StandardMaterial('MarkerMaterial', this._scene);
        const texture = new Texture(window.URL.createObjectURL(file), this._scene);
        material.diffuseTexture = texture;
        material.diffuseTexture.hasAlpha = true;
        material.backFaceCulling = false;
        plane.material = material;

        this._saveScene();
    }

    getMarkerNames() {
        if (this._markerContainer) {
            const nodes = this._markerContainer.getChildTransformNodes(true);
            return nodes.map(value => value.name);
        }
        return [];
    }

    _loadScene() {
        console.log('load new content');
    }

    _saveScene() {
        const serializedScene = SceneSerializer.Serialize(this._scene);
        // console.log(JSON.stringify(serializedScene));
    }

    _saveFile(file: File) {
        const formData = new FormData();
        formData.append('content', file);

        fetch(`/api/p/${this._id}/upload`, {
            method: 'POST',
            body: formData,
        });
    }

}

export default new Project();
