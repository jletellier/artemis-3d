import LogicTree from './LogicTree';
import LogicNodeInput from './LogicNodeInput';

export default class LogicNode {

    public tree: LogicTree;
    public properties: string[];
    public inputs: LogicNodeInput[] = [];
    public outputs: LogicNode[][] = [];

    constructor(tree: LogicTree) {
        this.tree = tree;
    }

    public addInput(node: LogicNode, from: number) {
        this.inputs.push(new LogicNodeInput(node, from));
    }

    public addOutputs(nodes: LogicNode[]) {
        this.outputs.push(nodes);
    }

    public run(from: number) {}

    public runOutput(i: number) {
        if (i >= this.outputs.length) {
            return;
        }

        for (const o of this.outputs[i]) {
            for (let j = 0; j < o.inputs.length; j++) {
                if (o.inputs[j].node === this) {
                    o.run(j);
                    break;
                }
            }
        }
    }

    public get(from: number): any {
        return this;
    }

    public set(value: any): LogicNode {
        return this;
    }

}
