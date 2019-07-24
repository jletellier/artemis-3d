import { Behavior, Node } from '@babylonjs/core';

export default class LogicTree implements Behavior<Node> {

    private _target: Node;
    private _init: (() => void)[] = [];

    public get name(): string {
        return this.constructor.name;
    }

    public init() {
        console.info(`LogicTree ${this.name} initialized...`);

        for (const fn of this._init) {
            fn();
        }
    }

    public attach(target: Node) {
        console.info(`LogicTree ${this.name} Behavior attached...`);

        this._target = target;
    }

    public detach() {
        console.info(`LogicTree ${this.name} Behavior detached...`);
    }

    public notifyOnInit(fn: () => void) {
        this._init.push(fn);
    }

}
