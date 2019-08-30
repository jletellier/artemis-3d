import LogicNode from './LogicNode';
import { TransformNode, Quaternion } from '@babylonjs/core';

export default class RotateObjectNode extends LogicNode {

    // private tmpQuaternion: Quaternion;

    run(from: number) {
        let node: TransformNode = this.inputs[1].get();
        const vec: number[] = this.inputs[2].get();
        
        if (!node) {
            node = this.tree.target as TransformNode;
        }

        // Quaternion.FromEulerAnglesToRef(vec[0], vec[1], vec[2], this.tmpQuaternion);
        // node.rotationQuaternion.addInPlace(this.tmpQuaternion);
        node.addRotation(vec[0], vec[1], vec[2]);

        this.runOutput(0);
    }

}
