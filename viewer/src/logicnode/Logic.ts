import LogicTree from './LogicTree';
import LogicNode from './LogicNode';

import OnInitNode from './OnInitNode';
import PrintNode from './PrintNode';
import FloatNode from './FloatNode';
import VectorNode from './VectorNode';
import StringNode from './StringNode';
import SetLocationNode from './SetLocationNode';

const NODE_CLASSES: any = {
    OnInitNode,
    PrintNode,
    FloatNode,
    StringNode,
    VectorNode,
    SetLocationNode,
};

export default class Logic {

    private static _nodes: TNode[];
    private static _links: TNodeLink[];

    private static _parsedNodes: string[];
    private static _parsedLabels: Map<string, string>;
    private static _nodeMap: Map<string, LogicNode>;

    private static _tree: LogicTree;

    public static parse(canvas: TNodeCanvas) {
        console.log(canvas.name);
        this._convertFromJson(canvas);

        this._parsedNodes = [];
        this._parsedLabels = new Map<string, string>();
        this._nodeMap = new Map<string, LogicNode>();

        const rootNodes = this._getRootNodes();

        this._tree = new LogicTree();

        for (const node of rootNodes) {
            this._buildNode(node);
        }

        return this._tree;
    }

    private static _convertFromJson(canvas: TNodeCanvas) {
        this._nodes = canvas.nodes;
        this._links = canvas.links;

        this._nodes.forEach((node, i) => {
            node.id = i;
            node.inputs.forEach((socket) => {
                socket.node_id = node.id;
            });
            node.outputs.forEach((socket) => {
                socket.node_id = node.id;
            });
        });
    }

    private static _getRootNodes(): TNode[] {
        return this._nodes.filter((node) => {
            let linked = false;

            for (const out of node.outputs) {
                const outputLinks = this._getOutputLinks(out);
                if (outputLinks.length > 0) {
                    linked = true;
                    break;
                }
            }
            
            return (!linked);
        });
    }

    private static _getOutputLinks(out: TNodeSocket): TNodeLink[] {
        return this._links.filter((link) => {
            if (link.from_id !== out.node_id) {
                return false;
            }
            const node = this._nodes[out.node_id];
            return (this._getSocket(node.outputs, link.from_socket) === out);
        });
    }

    private static _getInputLink(input: TNodeSocket): TNodeLink {
        return this._links.find((link) => {
            if (link.to_id !== input.node_id) {
                return false;
            }
            const node = this._nodes[input.node_id];
            return (this._getSocket(node.inputs, link.to_socket) === input);
        });
    }

    private static _getSocket(sockets: TNodeSocket[], identifier: string): TNodeSocket {
        return sockets.find((out) => {
            return (out.name === identifier);
        });
    }

    private static _uniqueNodeName(node: TNode): string {
        return node.name + node.id;
    }

    private static _buildNode(node: TNode): string {
        const uniqueNodeName = this._uniqueNodeName(node);
        if (this._parsedNodes.indexOf(uniqueNodeName) !== -1) {
            return uniqueNodeName;
        }
        this._parsedNodes.push(uniqueNodeName);

        const instance = this._createClassInstance(node.type);
        if (!instance) {
            return;
        }

        this._nodeMap.set(uniqueNodeName, instance);

        // TODO: Properties/Buttons

        // Create inputs
        let inputNode: LogicNode;
        let inputFrom: number;

        node.inputs.forEach((input) => {
            const link = this._getInputLink(input);
            if (link) {
                const fromNode = this._nodes[link.from_id];
                const fromSocket = this._getSocket(fromNode.outputs, link.from_socket);
                inputNode = this._nodeMap.get(this._buildNode(fromNode));
                for (let i = 0; i < fromNode.outputs.length; i++) {
                    if (fromNode.outputs[i] === fromSocket) {
                        inputFrom = i;
                        break;
                    }
                }
            } else {
                inputNode = this._buildDefaultNode(input);
                inputFrom = 0;
            }

            instance.addInput(inputNode, inputFrom);
        });

        // Create outputs
        node.outputs.forEach((output) => {
            const outNodes: LogicNode[] = [];
            const links = this._getOutputLinks(output);

            if (links.length > 0) {
                for (const link of links) {
                    const toNode = this._nodes[link.to_id];
                    const outName = this._buildNode(toNode);
                    outNodes.push(this._nodeMap.get(outName));
                }
            } else {
                outNodes.push(this._buildDefaultNode(output));
            }

            instance.addOutputs(outNodes);
        });

        console.log(instance);

        return uniqueNodeName;
    }

    private static _buildDefaultNode(input: TNodeSocket): LogicNode {
        // if (input.type === 'OBJECT') {
        //     v = createClassInstance('ObjectNode', [tree, inp.default_value]);
        // }
        // else if (inp.type == 'ANIMACTION') {
        //     v = createClassInstance('StringNode', [tree, inp.default_value]);
        // }
        // else if (inp.type == 'VECTOR') {
        //     if (inp.default_value == null) inp.default_value = [0, 0, 0]; // TODO
        //     v = createClassInstance('VectorNode', [tree, inp.default_value]);
        // }
        if (input.type === 'VECTOR') {
            return this._createClassInstance('VectorNode').set(input.default_value);
        }
        // else if (inp.type == 'RGBA') {
        //     if (inp.default_value == null) inp.default_value = [0, 0, 0]; // TODO
        //     v = createClassInstance('ColorNode', [tree, inp.default_value]);
        // }
        // else if (inp.type == 'RGB') {
        //     if (inp.default_value == null) inp.default_value = [0, 0, 0]; // TODO
        //     v = createClassInstance('ColorNode', [tree, inp.default_value]);
        // }
        if (input.type === 'VALUE') {
            return this._createClassInstance('FloatNode').set(input.default_value);
        }
        // else if (inp.type == 'INT') {
        //     v = createClassInstance('IntegerNode', [tree, inp.default_value]);
        // }
        // else if (inp.type == 'BOOLEAN') {
        //     v = createClassInstance('BooleanNode', [tree, inp.default_value]);
        // }
        if (input.type === 'STRING') {
            return this._createClassInstance('StringNode').set(input.default_value);
        }
        // else { // ACTION, ARRAY
        //     v = createClassInstance('NullNode', [tree]);
        // }

        return null;
    }

    private static _createClassInstance(className: string): any {
        const dynamicClass = NODE_CLASSES[className];
        if (!dynamicClass || !(dynamicClass.prototype instanceof LogicNode)) {
            return null;
        }

        return new NODE_CLASSES[className](this._tree);
    }

}

interface TNodeCanvas {
    name: string;
    nodes: TNode[];
    links: TNodeLink[];
}

interface TNode {
    id: number;
    name: string;
    type: string;
    inputs: TNodeSocket[];
    outputs: TNodeSocket[];
    buttons?: TNodeButton[];
    x?: number;
    y?: number;
    color?: number;
}

interface TNodeSocket {
    // id: number;
    node_id: number;
    name: string;
    type: string;
    default_value?: any;
    color?: number;
    min?: number;
    max?: number;
}

interface TNodeLink {
    id: number;
    from_id: number;
    from_socket: string;
    to_id: number;
    to_socket: string;
}

interface TNodeButton {
    name: string;
    type: string;
    output?: number;
    default_value?: any;
    data?: any;
    min?: number;
    max?: number;
}
