import LogicNode from './LogicNode';
import { Node, TransformNode, Vector3, Tags, Camera, WebXRCamera,
    ShadowLight } from '@babylonjs/core';

export default class SetLocationNode extends LogicNode {

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

        if (node instanceof Camera ||
            node instanceof ShadowLight ||
            node instanceof TransformNode) {
            const tmpY = vec[1];
            vec[1] = vec[2];
            vec[2] = -tmpY;
            node.position = Vector3.FromArray(vec);
        }

        this.runOutput(0);
    }

}
