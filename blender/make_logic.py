import json
import os
import bpy
import numpy as np

def get_logic_trees():
    ar = []
    for node_group in bpy.data.node_groups:
        if node_group.bl_idname == 'ArmLogicTreeType':
            node_group.use_fake_user = True # Keep fake references for now
            ar.append(node_group)
    return ar


# Generating node sources
def build():
    trees = get_logic_trees()
    if len(trees) > 0:
        # Export node scripts
        for tree in trees:
            build_node_tree(tree)


def build_node_tree(node_group):
    path = './'
    group_name = safesrc(node_group.name[0].upper() + node_group.name[1:])
    file = path + group_name + '.json'

    if node_group.arm_cached and os.path.isfile(file):
        return

    nodes = gather_nodes(node_group)
    links = gather_links(node_group)

    json_serializable = {'name': group_name, 'nodes': nodes, 'links': links}
    trait_encoded = json.dumps(json_serializable, indent=4)

    file = open(file, 'w', encoding='utf8', newline='\n')
    file.write(trait_encoded)
    file.write('\n')
    file.close()

    node_group.arm_cached = True


def gather_nodes(nodetree):
    nodes = []
    nodeList = list(nodetree.nodes)
    for node in nodeList:
        node_name = '_' + safesrc(node.name)
        node_type = node.bl_idname[2:] # Discard 'LN'TimeNode prefix
        nodes.append({'name': node_name, 
            'type': node_type,
            'inputs': gather_node_io(nodeList, node.inputs), 
            'outputs': gather_node_io(nodeList, node.outputs)})
    
    return nodes


def gather_node_io(nodeList, io_nodes):
    sockets = []
    for idx, node in enumerate(io_nodes):
        socket = {'name': node.identifier, 'type': node.type}
    
        if (hasattr(node, 'default_value')):
            if hasattr(node.default_value, '__len__') and (not isinstance(node.default_value, str)):
                socket['default_value'] = np.asarray(node.default_value).tolist()
            else:
                socket['default_value'] = node.default_value

        sockets.append(socket)
    
    return sockets


def gather_links(nodetree):
    links = []
    nodeList = list(nodetree.nodes)
    for idx, link in enumerate(nodetree.links):
        links.append({'from_id': nodeList.index(link.from_node), 
            'to_id': nodeList.index(link.to_node), 
            'from_socket': link.from_socket.identifier, 
            'to_socket': link.to_socket.identifier})
    
    return links


def safesrc(s):
    s = safestr(s).replace('.', '_').replace('-', '_').replace(' ', '')
    if s[0].isdigit():
        s = '_' + s
    return s

def safestr(s):
    for c in r'[]/\;,><&*:%=+@!#^()|?^':
        s = s.replace(c, '_')
    return ''.join([i if ord(i) < 128 else '_' for i in s])
