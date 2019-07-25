import { Behavior, Node } from '@babylonjs/core';

export default class LogicTree implements Behavior<Node> {

    private _target: Node;
    private _init: (() => void)[] = [];

    public get name(): string {
        return this.constructor.name;
    }

    public get target(): Node {
        return this._target;
    }

    public init() {
        console.info(`${this.name} initialized...`);
    }

    public attach(target: Node) {
        console.info(`${this.name} behavior attached...`);

        this._target = target;

        for (const fn of this._init) {
            fn();
        }
    }

    public detach() {
        console.info(`${this.name} behavior detached...`);
    }

    public notifyOnInit(fn: () => void) {
        this._init.push(fn);
    }

}
