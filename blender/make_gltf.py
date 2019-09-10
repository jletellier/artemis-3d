import json
import os
import bpy
import datetime
import numpy as np

from collections import OrderedDict

from io_scene_gltf2.blender.exp import gltf2_blender_gather
from io_scene_gltf2.blender.exp.gltf2_blender_gltf2_exporter import GlTF2Exporter
from io_scene_gltf2.blender.com import gltf2_blender_json


def make():
    directory_path = os.path.dirname(bpy.context.blend_data.filepath)
    filename = bpy.path.basename(bpy.context.blend_data.filepath)
    filename = os.path.splitext(filename)[0]

    export_settings = {
        'timestamp': datetime.datetime.now(),
        'gltf_filepath': directory_path + '/' + bpy.path.ensure_ext(filename, '.gltf'),
        'gltf_filedirectory': directory_path + '/',
        'gltf_format': 'GLTF_SEPARATE',
        'gltf_image_format': 'NAME',
        'gltf_copyright': '',
        'gltf_texcoords': True,
        'gltf_normals': True,
        'gltf_tangents': False,
        'gltf_draco_mesh_compression': False,
        'gltf_materials': True,
        'gltf_colors': True,
        'gltf_cameras': True,
        'gltf_selected': False,
        'gltf_layers': True,
        'gltf_extras': True,
        'gltf_yup': True,
        'gltf_apply': False,
        'gltf_current_frame': False,
        'gltf_animations': True,
        'gltf_frame_range': True,
        'gltf_force_sampling': False,
        'gltf_skins': True,
        'gltf_all_vertex_influences': False,
        'gltf_frame_step': 1,
        'gltf_morph': True,
        'gltf_morph_normal': True,
        'gltf_morph_tangent': False,
        'gltf_lights': True,
        'gltf_displacement': False,
        'gltf_binary': bytearray(),
        'gltf_binaryfilename': bpy.path.ensure_ext(filename, '.bin'),
        'gltf_channelcache': dict(),
    }

    if bpy.context.active_object is not None:
        bpy.ops.object.mode_set(mode='OBJECT')

    original_frame = bpy.context.scene.frame_current
    if not export_settings['gltf_current_frame']:
        bpy.context.scene.frame_set(0)

    exporter = GlTF2Exporter()

    active_scene_idx = 0
    scenes = []
    animations = []
    gather = gltf2_blender_gather.gather_gltf2(export_settings)

    if gather.__len__() > 2:
        active_scene_idx, scenes, animations = gather
    else:
        scenes, animations = gather

    for idx, scene in enumerate(scenes):
        exporter.add_scene(scene, idx == active_scene_idx)
    for animation in animations:
        exporter.add_animation(animation)

    # exporter.finalize_buffer(
    #     export_settings['gltf_filedirectory'], export_settings['gltf_binaryfilename'])
    buffer = exporter.finalize_buffer(export_settings['gltf_filedirectory'], is_glb=True)
    exporter.finalize_images(export_settings['gltf_filedirectory'])

    gltf = __fix_json(exporter.glTF.to_dict())

    if not export_settings['gltf_current_frame']:
        bpy.context.scene.frame_set(original_frame)

    return gltf, buffer


def get_json(gltf, indent=None, separators=None):
    encoder = gltf2_blender_json.BlenderJSONEncoder

    sort_order = [
        "asset",
        "extensionsUsed",
        "extensionsRequired",
        "extensions",
        "extras",
        "scene",
        "scenes",
        "nodes",
        "cameras",
        "animations",
        "materials",
        "meshes",
        "textures",
        "images",
        "skins",
        "accessors",
        "bufferViews",
        "samplers",
        "buffers"
    ]

    gltf_ordered = OrderedDict(sorted(gltf.items(), key=lambda item: sort_order.index(item[0])))
    gltf_encoded = json.dumps(
        gltf_ordered, indent=indent, separators=separators, cls=encoder, allow_nan=False)

    return gltf_encoded


# Copied from: https://github.com/KhronosGroup/glTF-Blender-IO/blob/master/addons/io_scene_gltf2/blender/exp/gltf2_blender_export.py
def __fix_json(obj):
    # TODO: move to custom JSON encoder
    fixed = obj
    if isinstance(obj, dict):
        fixed = {}
        for key, value in obj.items():
            if not __should_include_json_value(key, value):
                continue
            fixed[key] = __fix_json(value)
    elif isinstance(obj, list):
        fixed = []
        for value in obj:
            fixed.append(__fix_json(value))
    elif isinstance(obj, float):
        # force floats to int, if they are integers (prevent INTEGER_WRITTEN_AS_FLOAT validator warnings)
        if int(obj) == obj:
            return int(obj)
    return fixed


# Copied from: https://github.com/KhronosGroup/glTF-Blender-IO/blob/master/addons/io_scene_gltf2/blender/exp/gltf2_blender_export.py
def __should_include_json_value(key, value):
    allowed_empty_collections = ["KHR_materials_unlit"]

    if value is None:
        return False
    elif __is_empty_collection(value) and key not in allowed_empty_collections:
        return False
    return True


# Copied from: https://github.com/KhronosGroup/glTF-Blender-IO/blob/master/addons/io_scene_gltf2/blender/exp/gltf2_blender_export.py
def __is_empty_collection(value):
    return (isinstance(value, dict) or isinstance(value, list)) and len(value) == 0
