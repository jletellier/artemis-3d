import LogicNode from './LogicNode';
import { TransformNode } from '@babylonjs/core';

export default class GetLocationNode extends LogicNode {

    public get(from: number): number[] {
        const node: TransformNode = this.inputs[0].get();
        
        if (!node) {
            return null;
        }

        return node.absolutePosition.asArray();
    }

}
