import LogicNode from './LogicNode';
import { Node } from '@babylonjs/core';

export default class SelfNode extends LogicNode {

    public get(from: number): Node {
        return this.tree.target;
    }

}
