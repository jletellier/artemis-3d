import LogicNode from './LogicNode';
import { Node, TransformNode } from '@babylonjs/core';

export default class GetScaleNode extends LogicNode {

    public get(from: number): number[] {
        let node: Node = this.inputs[0].get();
        
        if (!node) {
            node = this.tree.target;
        }

        if (node instanceof TransformNode) {
            const tmpVec = node.scaling.asArray();
            // Convert coordinate system: glTF 2.0 -> Blender
            return [tmpVec[0], tmpVec[2], tmpVec[1]];
        }

        return [1, 1, 1];
    }

}
