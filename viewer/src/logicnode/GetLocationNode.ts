import LogicNode from './LogicNode';
import { TransformNode, WebXRCamera, Tags } from '@babylonjs/core';

export default class GetLocationNode extends LogicNode {

    public get(from: number): number[] {
        const node: TransformNode = this.inputs[0].get();
        
        if (!node) {
            return null;
        }

        if (Tags.MatchesQuery(node, 'mainCamera') &&
            this.tree.scene.activeCamera instanceof WebXRCamera) {
            return this.tree.scene.activeCamera.globalPosition.asArray();
        }

        return node.absolutePosition.asArray();
    }

}
