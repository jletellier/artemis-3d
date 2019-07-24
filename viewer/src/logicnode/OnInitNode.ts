import LogicNode from './LogicNode';
import LogicTree from './LogicTree';

export default class OnInitNode extends LogicNode {

    constructor(tree: LogicTree) {
        super(tree);

        tree.notifyOnInit(this._init.bind(this));
    }

    private _init() {
        this.runOutput(0);
    }

}
