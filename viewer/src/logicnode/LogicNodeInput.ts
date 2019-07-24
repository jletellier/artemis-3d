import LogicNode from './LogicNode';

export default class LogicNodeInput {

    public node: LogicNode;
    public from: number;

    constructor(node: LogicNode, from: number) {
        this.node = node;
        this.from = from;
    }

    public get(): any {
        return this.node.get(this.from);
    }

    public set(value: any) {
        this.node.set(value);
    }

}
