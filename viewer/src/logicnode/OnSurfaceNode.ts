import LogicNode from './LogicNode';
import LogicTree from './LogicTree';
import { PointerInfo, Observer, PointerEventTypes } from '@babylonjs/core';

export default class OnSurfaceNode extends LogicNode {

    private _pointerObserver: Observer<PointerInfo>;

    constructor(tree: LogicTree) {
        super(tree);

        tree.notifyOnInit(this._init.bind(this));
        tree.notifyOnDetach(this._detach.bind(this));
    }

    private _init() {
        this._pointerObserver = this.tree.scene.onPointerObservable.add(this._onPointer.bind(this));
    }

    private _detach() {
        this.tree.scene.onPointerObservable.remove(this._pointerObserver);
    }

    private _onPointer(info: PointerInfo) {
        const pointerType = info.type;
        const state = this.properties[0];

        if ((pointerType === PointerEventTypes.POINTERDOWN && state === 'Started') ||
            (pointerType === PointerEventTypes.POINTERUP && state === 'Released') ||
            (pointerType === PointerEventTypes.POINTERTAP && state === 'Touched') ||
            (pointerType === PointerEventTypes.POINTERMOVE && state === 'Moved')) {
            this.runOutput(0);
        }
    }

}
