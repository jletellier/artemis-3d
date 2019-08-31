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
            return this.tree.scene.activeCamera.globalPosition.asArray();
        }

        if (node instanceof Camera ||
            node instanceof ShadowLight ||
            node instanceof TransformNode) {
            const tmpVec = node.position.asArray();
            const tmpY = tmpVec[2];
            tmpVec[2] = tmpVec[1];
            tmpVec[1] = -tmpY;
            return tmpVec;
        }

        return [0, 0, 0];
    }

}
