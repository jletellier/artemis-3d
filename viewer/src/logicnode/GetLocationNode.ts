import LogicNode from './LogicNode';
import { TransformNode, WebXRCamera, Tags, Camera, Vector3 } from '@babylonjs/core';

export default class GetLocationNode extends LogicNode {

    public get(from: number): number[] {
        const node: Node = this.inputs[0].get();
        
        if (!node) {
            return [0, 0, 0];
        }

        if (Tags.MatchesQuery(node, 'mainCamera') &&
            this.tree.scene.activeCamera instanceof WebXRCamera) {
            return this.tree.scene.activeCamera.globalPosition.asArray();
        }

        if (node instanceof Camera) {
            return node.globalPosition.asArray();
        }

        if (node instanceof TransformNode) {
            return node.absolutePosition.asArray();
        }

        return [0, 0, 0];
    }

}
