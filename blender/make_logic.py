import json
import os
import bpy
import numpy as np


def get_logic_canvases():
    canvases = []
    for node_group in bpy.data.node_groups:
        if node_group.bl_idname == 'ArmLogicTreeType':
            node_group.use_fake_user = True # Keep fake references for now
            # TODO: Check if cached
            # if not node_group.arm_cached or not os.path.isfile(file):
            canvases.append(node_group)
    return canvases


def serialize():
    serialized = []
    canvases = get_logic_canvases()

    for canvas in canvases:
        serialized.append(serialize_logic_canvas(canvas))

    return serialized


def serialize_logic_canvas(canvas):
    canvas_name = safesrc(canvas.name[0].upper() + canvas.name[1:])

    nodes = gather_nodes(canvas)
    links = gather_links(canvas)

    serialized = {'name': canvas_name, 'nodes': nodes, 'links': links}
    return serialized


def gather_nodes(canvas):
    nodes = []
    nodeList = list(canvas.nodes)
    for node in nodeList:
        node_name = '_' + safesrc(node.name)
        node_type = node.bl_idname[2:] # Discard 'LN'TimeNode prefix
        nodes.append({'name': node_name, 
            'type': node_type,
            'properties': gather_properties(node),
            'inputs': gather_node_io(nodeList, node.inputs), 
            'outputs': gather_node_io(nodeList, node.outputs)})
    
    return nodes


def gather_properties(node):
    properties = []
    for i in range(0, 5):
        prop_name = 'property' + str(i) + '_get'
        prop_found = hasattr(node, prop_name)
        if not prop_found:
            prop_name = 'property' + str(i)
            prop_found = hasattr(node, prop_name)
        if prop_found:
            prop = getattr(node, prop_name)
            if hasattr(prop, 'name'): # PointerProperty
                prop = str(prop.name)
            else:
                prop = str(prop)
            properties.append(prop)

    return properties


def gather_node_io(nodeList, io_nodes):
    sockets = []
    for idx, node in enumerate(io_nodes):
        socket = {'name': node.identifier, 'type': node.type}
    
        values = node.values()
        if (values.__len__() > 0):
            socket['type'] = 'OBJECT'
            if hasattr(values[0], 'name'):
                socket['default_value'] = values[0].name
            else:
                socket['default_value'] = None
        elif (hasattr(node, 'default_value')):
            if hasattr(node.default_value, '__len__') and (not isinstance(node.default_value, str)):
                socket['default_value'] = np.asarray(node.default_value).tolist()
            else:
                socket['default_value'] = node.default_value

        sockets.append(socket)
    
    return sockets


def gather_links(canvas):
    links = []
    nodeList = list(canvas.nodes)
    for idx, link in enumerate(canvas.links):
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
