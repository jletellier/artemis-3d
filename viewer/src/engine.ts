import { Camera, Engine as BabylonEngine, Scene, SceneLoader, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF/2.0';
import { GLTFFileLoader } from '@babylonjs/loaders/glTF/glTFFileLoader';

class Engine {

    private _engine: BabylonEngine;
    private _scene: Scene;

    public init(canvas: HTMLCanvasElement) {
        this._engine = new BabylonEngine(canvas, true);
        this._scene = new Scene(this._engine);

        const camera = new Camera('MainCamera', new Vector3(0, 0.8, 100), this._scene, true);

        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    
        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    public loadFile(file: string) {
        const plugin = SceneLoader.Load('./', file, this._engine, (newScene) => {
            if (newScene.cameras.length > 0) {
                newScene.activeCamera = newScene.cameras[0];
            }

            this._scene.dispose();
            this._scene = newScene;
        });

        const gltfPlugin = plugin as GLTFFileLoader;
        gltfPlugin.onParsedObservable.add((gltfBabylon) => {
            // console.log(gltfBabylon.json.nodes[0].extras.script);
        });
    }

}

export default new Engine();
