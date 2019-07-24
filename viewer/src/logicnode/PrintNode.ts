import LogicNode from './LogicNode';

export default class PrintNode extends LogicNode {

    run(from: number) {
        const value = this.inputs[1].get();

        console.log(value);

        this.runOutput(0);
    }

}
