import LogicNode from './LogicNode';
import { Matrix, Node, Tags, Camera, ShadowLight } from '@babylonjs/core';

/**
 * Node to get the transformation matrix in world space and engine's coordinate system.
 * Input 0 connects to an ObjectNode and defaults to the current target.
 */
export default class GetTransformNode extends LogicNode {

    public get(from: number): Matrix {
        let node: Node = this.inputs[0].get();
        
        if (!node) {
            node = this.tree.target;
        }

        return node.getWorldMatrix();
    }

}
