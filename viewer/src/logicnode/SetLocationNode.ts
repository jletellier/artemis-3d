import LogicNode from './LogicNode';
import { TransformNode, Vector3 } from '@babylonjs/core';

export default class SetLocationNode extends LogicNode {

    run(from: number) {
        const object: any = this.inputs[1].get();
        const vec: number[] = this.inputs[2].get();
        
        const node = this.tree.target as TransformNode;
        node.position = Vector3.FromArray(vec);

        this.runOutput(0);
    }

}
