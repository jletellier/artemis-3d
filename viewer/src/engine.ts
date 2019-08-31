import { AssetsManager, Camera, Engine as BabylonEngine, Scene, SceneLoader, Tags,
    Vector3, WebXRExperienceHelper, WebXRManagedOutputCanvas, WebXRState,
    PointerEventTypes, PickingInfo, PointerInfo, Node } from '@babylonjs/core';
import '@babylonjs/loaders/glTF/2.0';
import Logic from './logicnode/Logic';

export default class Engine {

    private _engine: BabylonEngine;
    private _scene: Scene;
    private _logicFiles: Set<string> = new Set();
    private _logicAttachments: Map<Node, Set<string>> = new Map();

    public init(canvas: HTMLCanvasElement) {
        this._engine = new BabylonEngine(canvas, true);
        this._scene = new Scene(this._engine);
        this._scene.useRightHandedSystem = true;

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
        SceneLoader.Load('./', file, this._engine, (newScene) => {
            if (newScene.cameras.length > 0) {
                newScene.activeCamera = newScene.cameras[0];
                const mainCamera = newScene.getNodeByName(newScene.activeCamera.name);
                Tags.AddTagsTo(mainCamera, 'mainCamera');
            }

            this._loadLogic(newScene);
        });
    }

    private _loadLogic(newScene: Scene) {
        const assetsManager = new AssetsManager(this._scene);

        const nodes: Node[] = [...newScene.transformNodes, ...newScene.meshes];
        nodes.forEach((node) => {
            if (node.metadata && node.metadata.gltf && node.metadata.gltf.extras) {
                const extras = node.metadata.gltf.extras;
                console.log('name:', node.name);
                console.log(extras);
                
                if (extras['arm_traitlist'] && extras['arm_traitlist'].length) {
                    // FIXME: Add type definition for arm_traitlist and trait
                    extras['arm_traitlist'].forEach((trait: any) => {
                        this._logicFiles.add(trait.name);
                        let nodeLogicFiles = this._logicAttachments.get(node);
                        if (!nodeLogicFiles) {
                            nodeLogicFiles = new Set();
                        }
                        nodeLogicFiles.add(trait.name);
                        this._logicAttachments.set(node, nodeLogicFiles);
                    });
                }
                
                if (extras['arm_spawn'] === 0) {
                    node.setEnabled(false);
                }
            }
        });
            
        this._logicFiles.forEach((logicFile) => {
            const task = assetsManager.addTextFileTask(logicFile, `./${logicFile}.json`);
            task.onSuccess = (assetTask) => {
                const logicJson = JSON.parse(assetTask.text);
                Logic.addCanvas(logicJson);
            };
        });

        assetsManager.onTasksDoneObservable.add(() => {
            this._logicAttachments.forEach((nodeLogicFiles, node) => {
                nodeLogicFiles.forEach((logicFile) => {
                    const behavior = Logic.getLogicTreeInstanceByName(logicFile);
                    node.addBehavior(behavior);
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
            console.error('immersive-ar xr session not supported');
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

                console.log(xrHelper.container);
            } else if (xrHelper.state === WebXRState.IN_XR) {
                xrHelper.exitXRAsync();
            }
        };
    }

}
