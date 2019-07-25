import LogicNode from './LogicNode';

export default class VectorNode extends LogicNode {

    public value: number[];

    public get(from: number): number[] {
        if (this.inputs.length > 0) {
            return this.inputs[0].get();
        }
        return this.value;
    }

    public set(value: number[]) {
        if (this.inputs.length > 0) {
            this.inputs[0].set(value);
        } else if (!this.value) {
            this.value = value;
        } else {
            this.value = [0, 0, 0];
        }
        return this;
    }

}
