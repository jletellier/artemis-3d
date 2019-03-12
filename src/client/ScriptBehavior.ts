import { Behavior, Node } from '@babylonjs/core';

export default class ScriptBehavior implements Behavior<Node> {
 
    private _enabled: boolean;
    private _target: Node;
    private _boundUpdate: () => void;

    public get name(): string {
        return this.constructor.name;
    }

    public get enabled(): boolean {
        return this._enabled;
    }

    public set enabled(val: boolean) {
        if (this._enabled !== val) {
            this._enabled = val;

            if (this._target) {
                this._setEnabled(this._enabled);
            }
        }
    }

    public get target(): Node {
        return this._target;
    }

    public init(): void {
        console.info(`${this.name} Behavior initialized...`);

        if (typeof this.onUpdate === 'function') {
            this._boundUpdate = this.onUpdate.bind(this);
        }
    }

    public attach(target: Node): void {
        console.info(`${this.name} Behavior attached...`);

        this._target = target;

        if (typeof this.onAwake === 'function') {
            this.onAwake();
        }

        if (this._enabled) {
            this._setEnabled(true);
        }
    }

    public detach(): void {
        if (this._enabled) {
            this._setEnabled(false);
        }

        console.info(`${this.name} Behavior detached...`);
    }

    private _setEnabled(doEnable: boolean): void {
        if (doEnable) {
            if (typeof this.onUpdate === 'function') {
                this._target.getScene().registerBeforeRender(this._boundUpdate);
            }

            if (typeof this.onEnabled === 'function') {
                this.onEnabled();
            }
        } else {
            if (typeof this.onUpdate === 'function') {
                this._target.getScene().unregisterBeforeRender(this._boundUpdate);
            }

            if (typeof this.onDisabled === 'function') {
                this.onDisabled();
            }
        }
    }

    public onAwake?(): void;
    public onUpdate?(): void;
    public onEnabled?(): void;
    public onDisabled?(): void;
    
}
