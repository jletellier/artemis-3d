import Logic from './Logic';
import { Behavior, Node, Scene, Observer } from '@babylonjs/core';

export default class LogicTree implements Behavior<Node> {

    private _canvasName: string;
    private _target: Node;
    private _scene: Scene;
    private _initFns: (() => void)[] = [];
    private _detachFns: (() => void)[] = [];
    private _updateFns: (() => void)[] = [];
    private _initObserver: Observer<Scene>;
    private _updateObserver: Observer<Scene>;

    public get name(): string {
        return this.constructor.name;
    }

    public get canvasName(): string {
        return this._canvasName;
    }

    public get target(): Node {
        return this._target;
    }

    public get scene(): Scene {
        return this._scene;
    }

    constructor(canvasName: string) {
        this._canvasName = canvasName;
    }

    public clone() {
        return Logic.getLogicTreeInstanceByName(this._canvasName);
    }

    public init() {
        console.info(`${this.name} initialized...`);
    }

    public attach(target: Node) {
        const scene = target.getScene();
        this._target = target;
        this._scene = scene;

        this._initObserver = scene.onReadyObservable.add(this._onInit.bind(this));
        this._updateObserver = scene.onBeforeAnimationsObservable.add(this._onUpdate.bind(this));

        console.info(`${this.name} behavior attached...`);
    }

    public detach() {
        this._scene.onReadyObservable.remove(this._initObserver);
        this._scene.onBeforeAnimationsObservable.remove(this._updateObserver);

        for (const fn of this._detachFns) {
            fn();
        }

        console.info(`${this.name} behavior detached...`);
    }

    public notifyOnInit(fn: () => void) {
        this._initFns.push(fn);
    }

    public notifyOnDetach(fn: () => void) {
        this._detachFns.push(fn);
    }

    public notifyOnUpdate(fn: () => void) {
        this._updateFns.push(fn);
    }

    private _onInit() {
        for (const fn of this._initFns) {
            fn();
        }
    }

    private _onUpdate() {
        for (const fn of this._updateFns) {
            fn();
        }
    }

}
