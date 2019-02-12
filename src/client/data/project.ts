import { Scene, Mesh, StandardMaterial, Texture, TransformNode } from 'babylonjs';

class Project {
    
    _id: string = null;

    scene: Scene;

    set id(newID: string) {
        if (this._id !== newID) {
            this._loadFromServer();
        }
    }

    get id() {
        return this._id;
    }

    addMarker(file: File) {
        let markerContainer = this.scene.getTransformNodeByName('MarkerContainer');
        if (!markerContainer) {
            markerContainer = new TransformNode('MarkerContainer', this.scene);
        }

        const plane = Mesh.CreatePlane(file.name, 20.0, this.scene);
        plane.setParent(markerContainer);
        const material = new StandardMaterial('MarkerMaterial', this.scene);
        const texture = new Texture(window.URL.createObjectURL(file), this.scene);
        material.diffuseTexture = texture;
        material.diffuseTexture.hasAlpha = true;
        material.backFaceCulling = false;
        plane.material = material;
    }

    getMarkerNames() {
        const markerContainer = this.scene.getTransformNodeByName('MarkerContainer');
        if (markerContainer) {
            const nodes = markerContainer.getChildTransformNodes(true);
            return nodes.map(value => value.name);
        }
        return [];
    }

    _loadFromServer() {
        console.log('load new content');
    }

}

export default new Project();
