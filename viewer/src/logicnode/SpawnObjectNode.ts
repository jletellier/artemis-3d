import LogicNode from './LogicNode';
import LogicTree from './LogicTree';
import { Node, TransformNode, Matrix, ShadowLight } from '@babylonjs/core';

/**
 * Clones a prototype node and spawns it into the current scene.
 * Input 0 connects to an ObjectNode used as a prototype.
 * Input 1 connects to a TransformNode used as the new world matrix.
 * Input 2 connects to a BooleanNode indicating whether to clone all children of the prototype.
 */
export default class SpawnObjectNode extends LogicNode {

    run(from: number) {
        let protoNode: Node = this.inputs[1].get();
        const transform: Matrix = this.inputs[2].get();
        const cloneChildren: boolean = this.inputs[3].get();

        if (!protoNode) {
            protoNode = this.tree.target;
        }

        if (protoNode instanceof ShadowLight || protoNode instanceof TransformNode) {
            const scene = this.tree.target.getScene();
            const newNode = protoNode.clone(`${protoNode.name}_Instance`, null, !cloneChildren);

            protoNode.behaviors.forEach((behavior) => {
                if (behavior instanceof LogicTree) {
                    newNode.addBehavior(behavior.clone());
                }
            });

            if (newNode instanceof ShadowLight) {
                transform.getTranslationToRef(newNode.position);
                scene.addLight(newNode);
            } else if (newNode instanceof TransformNode) {
                transform.decompose(
                    newNode.scaling,
                    newNode.rotationQuaternion,
                );
                newNode.setAbsolutePosition(transform.getTranslation());
                scene.addTransformNode(newNode);
            }
        }

        this.runOutput(0);
    }

}
