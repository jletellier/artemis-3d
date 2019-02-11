import { Scene } from 'babylonjs';

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

    _loadFromServer() {
        console.log('load new content');
    }

}

export default new Project();
