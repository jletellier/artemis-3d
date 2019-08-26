import LogicNode from './LogicNode';
import { Node } from '@babylonjs/core';

export default class ObjectNode extends LogicNode {

    public objectName: string;
    public value: Node;

    public get(from: number): Node {
        if (this.inputs.length > 0) {
            return this.inputs[0].get();
        }

        if (!this.value) {
            const target = this.tree.target;
            const scene = target.getScene();
            this.value = (this.objectName.length ? scene.getNodeByName(this.objectName) : target);
        }

        return this.value;
    }

    public set(objectName: string) {
        if (this.inputs.length > 0) {
            this.inputs[0].set(objectName);
        } else {
            this.objectName = objectName;
        }
        return this;
    }

}
