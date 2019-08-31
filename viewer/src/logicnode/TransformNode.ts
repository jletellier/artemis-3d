import LogicNode from './LogicNode';
import { Matrix, Quaternion, Vector3 } from '@babylonjs/core';

/**
 * Node that holds a transformation matrix.
 * The location uses the engine's coordinate system.
 * Input 0 connects to a location vector.
 * Input 1 connects to a rotation (euler) vector.
 * Input 2 connects to a scaling vector.
 */
export default class TransformNode extends LogicNode {

    public value: Matrix = Matrix.Identity();

    private tmpLoc: Vector3 = Vector3.Zero();
    private tmpEuler: Vector3 = Vector3.Zero();
    private tmpQuat: Quaternion = Quaternion.Identity();
    private tmpScale: Vector3 = Vector3.One();

    public get(from: number): Matrix {
        const loc: number[] = this.inputs[0].get();
        const euler: number[] = this.inputs[1].get();
        const scale: number[] = this.inputs[2].get();

        // Convert coordinate system: Blender -> engine
        this.tmpLoc.copyFromFloats(loc[0], loc[2], loc[1]);
        // Convert coordinate system: Blender -> glTF 2.0
        this.tmpEuler.copyFromFloats(euler[0], euler[2], -euler[1]);
        Quaternion.FromEulerVectorToRef(this.tmpEuler, this.tmpQuat);
        // Convert coordinate system: Blender -> glTF 2.0
        this.tmpScale.copyFromFloats(scale[0], scale[2], scale[1]);

        Matrix.ComposeToRef(this.tmpScale, this.tmpQuat, this.tmpLoc, this.value);

        return this.value;
    }

}
