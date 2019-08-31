import LogicNode from './LogicNode';
import { Angle } from '@babylonjs/core';

export default class DegToRadNode extends LogicNode {

    public get(from: number): number {
        const deg: number = this.inputs[0].get();
        return Angle.FromDegrees(deg).radians();
    }

}
