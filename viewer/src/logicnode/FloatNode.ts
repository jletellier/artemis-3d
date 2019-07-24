import LogicNode from './LogicNode';

export default class FloatNode extends LogicNode {

    public value: number = 0;

    public get(from: number): number {
        if (this.inputs.length > 0) {
            return this.inputs[0].get();
        }
        return this.value;
    }

    public set(value: number) {
        if (this.inputs.length > 0) {
            this.inputs[0].set(value);
        } else {
            this.value = value;
        }
        return this;
    }

}
