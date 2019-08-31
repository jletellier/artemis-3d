import LogicNode from './LogicNode';
import { Node, TransformNode } from '@babylonjs/core';

/**
 * Node to scale the object in local space. Only works with TransformNodes.
 * Input 0 connects to an ObjectNode and defaults to the current target.
 * Input 1 contains the vector to add.
 */
export default class ScaleObjectNode extends LogicNode {

    run(from: number) {
        let node: Node = this.inputs[1].get();
        const vec: number[] = this.inputs[2].get();
        
        if (!node) {
            node = this.tree.target;
        }

        if (node instanceof TransformNode) {
            // This converts the coordinate system: Blender -> glTF 2.0
            node.scaling.addInPlaceFromFloats(vec[0], vec[2], vec[1]);
        }

        this.runOutput(0);
    }

}
