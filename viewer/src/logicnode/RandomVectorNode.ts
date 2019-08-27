import LogicNode from './LogicNode';

export default class RandomVectorNode extends LogicNode {

    public value: number[];

    public get(from: number): number[] {
        const min = this.inputs[0].get();
        const max = this.inputs[1].get();

        const x = min[0] + (Math.random() * (max[0] - min[0]));
        const y = min[1] + (Math.random() * (max[1] - min[1]));
        const z = min[2] + (Math.random() * (max[2] - min[2]));

        this.value = [x, y, z];

        return this.value;
    }

}
