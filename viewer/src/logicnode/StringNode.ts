import LogicNode from './LogicNode';

export default class StringNode extends LogicNode {

    public value: string = '';

    public get(from: number): string {
        if (this.inputs.length > 0) {
            return this.inputs[0].get();
        }
        return this.value;
    }

    public set(value: string) {
        if (this.inputs.length > 0) {
            this.inputs[0].set(value);
        } else {
            this.value = value;
        }
        return this;
    }

}
