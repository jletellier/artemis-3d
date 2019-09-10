import bpy
import os
import json

from . import make_gltf


def export_gltf(gltf, buffer):
    filename = bpy.path.basename(bpy.context.blend_data.filepath)
    filename = os.path.splitext(filename)[0]
    gltf_filename = bpy.path.ensure_ext(filename, '.gltf')

    if 'buffers' in gltf:
        bin_filename = bpy.path.ensure_ext(filename, '.bin')
        gltf['buffers'][0]['uri'] = bin_filename
        __save_buffer(buffer, bin_filename)

    json_encoded = make_gltf.get_json(gltf, indent=4)
    __save_json(json_encoded, gltf_filename)


def export_logic(logic_canvas):
    filename = logic_canvas['name'] + '.json'
    json_encoded = json.dumps(logic_canvas, indent=4)
    __save_json(json_encoded, filename)


def __save_json(json, filename):
    directory_path = os.path.dirname(bpy.context.blend_data.filepath)
    path = os.path.join(directory_path, filename)
    
    file = open(path, 'w', encoding='utf8', newline='\n')
    file.write(json)
    file.write('\n')
    file.close()


def __save_buffer(buffer, filename):
    directory_path = os.path.dirname(bpy.context.blend_data.filepath)
    path = os.path.join(directory_path, filename)

    file = open(path, 'wb')
    file.write(buffer)
    file.close()
