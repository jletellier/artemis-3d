import LogicNode from './LogicNode';

export default class VectorNode extends LogicNode {

    public value: number[];

    public get(from: number): number[] {
        if (this.inputs.length === 3) {
            return [
                this.inputs[0].get(),
                this.inputs[1].get(),
                this.inputs[2].get(),
            ];
        }
        return this.value;
    }

    public set(value: number[]) {
        if (this.inputs.length === 3) {
            this.inputs[0].set(value[0]);
            this.inputs[1].set(value[1]);
            this.inputs[2].set(value[2]);
        } else if (!this.value) {
            this.value = value;
        } else {
            this.value = [0, 0, 0];
        }
        return this;
    }

}
