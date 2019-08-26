import LogicNode from './LogicNode';

export default class BooleanNode extends LogicNode {

    public value: boolean = false;

    public get(from: number): boolean {
        if (this.inputs.length > 0) {
            return this.inputs[0].get();
        }
        return this.value;
    }

    public set(value: boolean) {
        if (this.inputs.length > 0) {
            this.inputs[0].set(value);
        } else {
            this.value = value;
        }
        return this;
    }

}
