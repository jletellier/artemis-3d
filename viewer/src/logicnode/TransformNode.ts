import LogicNode from './LogicNode';
import { Matrix, Quaternion, Vector3 } from '@babylonjs/core';

export default class TransformNode extends LogicNode {

    public value: Matrix = Matrix.Identity();

    private tmpLoc: Vector3 = Vector3.Zero();
    private tmpEuler: Vector3 = Vector3.Zero();
    private tmpQuat: Quaternion = Quaternion.Identity();
    private tmpScale: Vector3 = Vector3.One();

    public get(from: number): Matrix {
        const loc: Float3 = this.inputs[0].get();
        const euler: Float3 = this.inputs[1].get();
        const scale: Float3 = this.inputs[2].get();

        this.tmpLoc.copyFromFloats(...loc);
        this.tmpEuler.copyFromFloats(...euler);
        Quaternion.FromEulerVectorToRef(this.tmpEuler, this.tmpQuat);
        this.tmpScale.copyFromFloats(...scale);

        Matrix.ComposeToRef(this.tmpScale, this.tmpQuat, this.tmpLoc, this.value);

        return this.value;
    }

    public set(value: Matrix) {
        value.decompose(this.tmpScale, this.tmpQuat, this.tmpLoc);

        this.inputs[0].set(this.tmpLoc.asArray());
        this.tmpQuat.toEulerAnglesToRef(this.tmpEuler);
        this.inputs[1].set(this.tmpEuler.asArray());
        this.inputs[2].set(this.tmpScale.asArray());

        return this;
    }

}

type Float3 = [number, number, number];
