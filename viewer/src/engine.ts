import { AssetsManager, Camera, Engine as BabylonEngine, Scene, SceneLoader, WebXREnterExitUI,
    Vector3, WebXRExperienceHelper, WebXRManagedOutputCanvas, WebXRState,
    PointerEventTypes, PickingInfo, PointerInfo } from '@babylonjs/core';
import '@babylonjs/loaders/glTF/2.0';
import { GLTFFileLoader } from '@babylonjs/loaders/glTF/glTFFileLoader';
import * as GLTF2 from 'babylonjs-gltf2interface';
import Logic from './logicnode/Logic';
import LogicTree from './logicnode/LogicTree';

export default class Engine {

    private _engine: BabylonEngine;
    private _scene: Scene;
    private _logicFiles: Set<string> = new Set();
    private _logicAttachments: Map<string, number> = new Map();
    private _logicMap: Map<string, LogicTree> = new Map();

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

            this._loadLogic(newScene);
        });

        const gltfPlugin = plugin as GLTFFileLoader;
        gltfPlugin.onParsedObservable.add((gltfBabylon) => {
            const gltfRoot = gltfBabylon.json as GLTF2.IGLTF;

            gltfRoot.nodes.forEach((node, i) => {
                if (node.extras && node.extras['arm_traitlist']
                        && node.extras['arm_traitlist'].length) {
                    // FIXME: Add type definition for arm_traitlist and trait
                    node.extras['arm_traitlist'].forEach((trait: any) => {
                        this._logicFiles.add(trait.name);
                        this._logicAttachments.set(trait.name, i);
                    });
                }
            });
        });
    }

    private _loadLogic(newScene: Scene) {
        const assetsManager = new AssetsManager(this._scene);
            
        this._logicFiles.forEach((logicFile) => {
            if (this._logicMap.has(logicFile)) {
                return;
            }

            const task = assetsManager.addTextFileTask(logicFile, `./${logicFile}.json`);
            task.onSuccess = (assetTask) => {
                const logicJson = JSON.parse(assetTask.text);
                const tree = Logic.parse(logicJson);
                this._logicMap.set(logicFile, tree);
            };
        });

        assetsManager.onTasksDoneObservable.add(() => {
            this._logicAttachments.forEach((nodeId, logicFile) => {
                newScene.meshes.find((mesh) => {
                    if (mesh.metadata && mesh.metadata.gltf
                            && mesh.metadata.gltf.pointers.indexOf(`/nodes/${nodeId}`) !== 1) {
                        const behavior = this._logicMap.get(logicFile);
                        mesh.addBehavior(behavior);
                    }
                });
            });

            this._scene.dispose();
            this._scene = newScene;

            this._prepareARScene();
        });

        assetsManager.load();
    }

    private async _prepareARScene() {
        const xrHelper = await WebXRExperienceHelper.CreateAsync(this._scene);

        if (!await xrHelper.sessionManager.supportsSessionAsync('immersive-ar')) {
            alert('immersive-ar xr session not supported');
            return;
        }

        const renderingCanvas = this._engine.getRenderingCanvas();
        const outputCanvas = new WebXRManagedOutputCanvas(xrHelper, renderingCanvas);

        this._scene.onPointerUp = async (e) => {
            if (xrHelper.state === WebXRState.NOT_IN_XR) {
                await xrHelper.enterXRAsync('immersive-ar', 'local', outputCanvas);

                xrHelper.sessionManager.session.addEventListener('select', (e: PointerEvent) => {
                    const pickInfo = new PickingInfo();
                    const data = new PointerInfo(PointerEventTypes.POINTERTAP, e, pickInfo);
                    this._scene.onPointerObservable.notifyObservers(data);
                });

                xrHelper.sessionManager.session.addEventListener(
                    'selectstart',
                    (e: PointerEvent) => {
                        const pickInfo = new PickingInfo();
                        const data = new PointerInfo(PointerEventTypes.POINTERDOWN, e, pickInfo);
                        this._scene.onPointerObservable.notifyObservers(data);
                    },
                );

                xrHelper.sessionManager.session.addEventListener('selectend', (e: PointerEvent) => {
                    const pickInfo = new PickingInfo();
                    const data = new PointerInfo(PointerEventTypes.POINTERUP, e, pickInfo);
                    this._scene.onPointerObservable.notifyObservers(data);
                });
            } else if (xrHelper.state === WebXRState.IN_XR) {
                xrHelper.exitXRAsync();
            }
        };
    }

}
