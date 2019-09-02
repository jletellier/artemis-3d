import bpy
import os
import json


def export_scene():
    try:
        file_path = bpy.context.blend_data.filepath

        # Remove .blend extension:
        file_path = os.path.splitext(file_path)[0]

        bpy.ops.export_scene.gltf(
            export_format = 'GLTF_SEPARATE',
            export_cameras = True,
            export_extras = True,
            export_lights = True,
            filepath = file_path,
        )
    except AttributeError:
        print('ERROR: glTF 2.0 addon ist not installed')


def export_logic(logic_canvas):
    file_path = logic_canvas['name'] + '.json'
    json_encoded = json.dumps(logic_canvas, indent = 4)
    save_json(json_encoded, file_path)


def save_json(json, file_path):
    directory_path = os.path.dirname(bpy.context.blend_data.filepath)
    path = os.path.join(directory_path, file_path)
    
    file = open(path, 'w', encoding = 'utf8', newline = '\n')
    file.write(json)
    file.write('\n')
    file.close()
