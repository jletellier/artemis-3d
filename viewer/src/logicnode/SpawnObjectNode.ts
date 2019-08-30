import LogicNode from './LogicNode';
import { TransformNode, Matrix, Vector3 } from '@babylonjs/core';

export default class SpawnObjectNode extends LogicNode {

    run(from: number) {
        const protoNode: TransformNode = this.inputs[1].get();
        const transform: Matrix = this.inputs[2].get();
        const cloneChildren: boolean = this.inputs[3].get();

        const newNode = protoNode.clone(`${protoNode.name}_Instance`, null, !cloneChildren);

        transform.decompose(
            newNode.scaling,
            newNode.rotationQuaternion,
            newNode.position,
        );

        const scene = this.tree.target.getScene();
        scene.addTransformNode(newNode);

        this.runOutput(0);
    }

}
