import { AssetsManager, Camera, Engine as BabylonEngine, Scene, SceneLoader,
    Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF/2.0';
import { GLTFFileLoader } from '@babylonjs/loaders/glTF/glTFFileLoader';
import * as GLTF2 from 'babylonjs-gltf2interface';

class Engine {

    private _engine: BabylonEngine;
    private _scene: Scene;
    private _traits: string[];

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
        this._loadGltfScene(file);
    }

    private _loadGltfScene(file: string) {
        const plugin = SceneLoader.Load('./', file, this._engine, (newScene) => {
            if (newScene.cameras.length > 0) {
                newScene.activeCamera = newScene.cameras[0];
            }

            this._loadTraits(newScene);
        });

        const gltfPlugin = plugin as GLTFFileLoader;
        gltfPlugin.onParsedObservable.add((gltfBabylon) => {
            const gltfRoot = gltfBabylon.json as GLTF2.IGLTF;
            this._traits = [];

            gltfRoot.nodes.forEach((node) => {
                if (node.extras && node.extras['arm_traitlist']
                        && node.extras['arm_traitlist'].length) {
                    // FIXME: Add type definition for arm_traitlist and trait
                    node.extras['arm_traitlist'].forEach((trait: any) => {
                        this._traits.push(trait.name);
                    });
                }
            });
        });
    }

    private _loadTraits(newScene: Scene) {
        const assetsManager = new AssetsManager(this._scene);
            
        this._traits.forEach((trait) => {
            const task = assetsManager.addTextFileTask(trait, `./${trait}.json`);
            task.onSuccess = (assetTask) => {
                const traitJson = JSON.parse(assetTask.text);
                console.log(traitJson);
            };
        });

        assetsManager.onTasksDoneObservable.add(() => {
            console.log('Done with loading!!!');

            this._scene.dispose();
            this._scene = newScene;
        });

        assetsManager.load();
    }

}

export default new Engine();
