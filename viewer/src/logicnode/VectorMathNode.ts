import LogicNode from './LogicNode';
import LogicTree from './LogicTree';
import { Vector3 } from '@babylonjs/core';

export default class VectorMathNode extends LogicNode {

    private _tmpVec0: Vector3 = Vector3.Zero();
    private _tmpVec1: Vector3 = Vector3.Zero();

    public get(from: number): number[] {
        const vec0: Float3 = this.inputs[0].get();
        const vec1: Float3 = this.inputs[1].get();

        this._tmpVec0.copyFromFloats(...vec0);
        this._tmpVec1.copyFromFloats(...vec1);

        const state = this.properties[0];

        switch (state) {
                case 'Add':
                    return this._tmpVec0.add(this._tmpVec1).asArray();
        }

        return [0, 0, 0];
    }

}

type Float3 = [number, number, number];
