import LogicNode from './LogicNode';
import { Node, TransformNode, WebXRCamera, Tags, Camera, ShadowLight } from '@babylonjs/core';

export default class GetLocationNode extends LogicNode {

    public get(from: number): number[] {
        let node: Node = this.inputs[0].get();
        
        if (!node) {
            node = this.tree.target;
        }

        if (Tags.MatchesQuery(node, 'mainCamera') &&
            this.tree.scene.activeCamera instanceof WebXRCamera) {
            node = this.tree.scene.activeCamera;
            const tmpVec = this.tree.scene.activeCamera.globalPosition.asArray();
            // Convert coordinate system: engine -> Blender
            return [tmpVec[0], tmpVec[2], tmpVec[1]];
        }

        if (node instanceof Camera ||
            node instanceof ShadowLight ||
            node instanceof TransformNode) {
            const tmpVec = node.position.asArray();
            // Convert coordinate system: glTF 2.0 -> Blender
            return [tmpVec[0], -tmpVec[2], tmpVec[1]];
        }

        return [0, 0, 0];
    }

}
