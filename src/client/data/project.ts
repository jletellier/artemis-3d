import { Scene, Mesh, StandardMaterial, Texture } from 'babylonjs';

class Project {
    
    _id: string = null;
    _markers: Set<string> = new Set();

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
        this._markers.add(file.name);

        let plane = Mesh.CreatePlane('plane', 20.0, this.scene);
        let material = new StandardMaterial('marker', this.scene);
        let texture = new Texture(window.URL.createObjectURL(file), this.scene);
        material.diffuseTexture = texture;
        material.diffuseTexture.hasAlpha = true;
        material.backFaceCulling = false;
        plane.material = material;
    }

    getMarkerNames() {
        return Array.from(this._markers.values());
    }

    _loadFromServer() {
        console.log('load new content');
    }

}

export default new Project();
