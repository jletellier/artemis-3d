import LogicNode from './LogicNode';
import { Node, Tags, WebXRCamera, TransformNode } from '@babylonjs/core';

/**
 * Node to rotate the object in local space. Only works with TransformNodes.
 * Input 0 connects to an ObjectNode and defaults to the current target.
 * Input 1 contains the vector to add in radians.
 */
export default class RotateObjectNode extends LogicNode {

    run(from: number) {
        let node: Node = this.inputs[1].get();
        const vec: number[] = this.inputs[2].get();
        
        if (!node) {
            node = this.tree.target;
        }

        if (Tags.MatchesQuery(node, 'mainCamera') &&
            this.tree.scene.activeCamera instanceof WebXRCamera) {
            node = this.tree.scene.activeCamera.parent;
        }

        if (node instanceof TransformNode) {
            // Blender uses a right-handed z up coordinate system
            // glTF 2.0 uses a right-handed y up coordinate system
            // Babylon.js uses a left-handed y up coordinate system
            // This converts Blender -> glTF 2.0
            node.addRotation(vec[0], vec[2], -vec[1]);
        }

        this.runOutput(0);
    }

}
