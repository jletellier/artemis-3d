import json
import os
import bpy
import numpy as np
import importlib

from io_scene_gltf2.blender.exp import gltf2_blender_gather
from io_scene_gltf2.blender.exp.gltf2_blender_gltf2_exporter import GlTF2Exporter


def make():
    export_settings = {
        'gltf_current_frame': False,
        'gltf_format': 'GLTF_SEPARATE',
        'gltf_cameras': True,
        'gltf_extras': True,
        'gltf_lights': True,
    }

    if bpy.context.active_object is not None:
        bpy.ops.object.mode_set(mode='OBJECT')

    original_frame = bpy.context.scene.frame_current
    if not export_settings['gltf_current_frame']:
        bpy.context.scene.frame_set(0)

    exporter = GlTF2Exporter(None)

    active_scene_idx, scenes, animations = gltf2_blender_gather.gather_gltf2(export_settings)
    for idx, scene in enumerate(scenes):
        exporter.add_scene(scene, idx==active_scene_idx)
    for animation in animations:
        exporter.add_animation(animation)

    buffer = bytes()
    # buffer = exporter.finalize_buffer(FILE_DIRECTORY, is_glb=True)

    if not export_settings['gltf_current_frame']:
        bpy.context.scene.frame_set(original_frame)

    return {'name': 'bla'}
