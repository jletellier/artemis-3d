import LogicNode from './LogicNode';
import LogicTree from './LogicTree';

export default class OnTimerNode extends LogicNode {

    duration: number = 0.0;
    repeat: boolean = false;

    constructor(tree: LogicTree) {
        super(tree);

        tree.notifyOnUpdate(this._update.bind(this));
    }

    private _update() {
        if (this.duration < Number.EPSILON) {
            this.duration = this.inputs[0].get();
            this.repeat = this.inputs[1].get();
        }

        this.duration -= this.tree.target.getEngine().getDeltaTime() / 1000;

        if (this.duration < Number.EPSILON) {
            this.runOutput(0);
        }
    }

}
