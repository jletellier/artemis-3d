import LogicNode from './LogicNode';
import LogicTree from './LogicTree';

export default class OnUpdateNode extends LogicNode {

    constructor(tree: LogicTree) {
        super(tree);

        tree.notifyOnUpdate(this._update.bind(this));
    }

    private _update() {
        this.runOutput(0);
    }

}
