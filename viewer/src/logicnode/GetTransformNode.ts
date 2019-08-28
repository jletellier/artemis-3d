import LogicNode from './LogicNode';
import { Matrix, TransformNode } from '@babylonjs/core';

export default class GetTransformNode extends LogicNode {

    public get(from: number): Matrix {
        const node: TransformNode = this.inputs[0].get();
        
        if (!node) {
            return null;
        }

        return node.getWorldMatrix();
    }

}

type Float3 = [number, number, number];
