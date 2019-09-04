bl_info = {
    "name": "ARtemis",
    "category": "Import-Export",
    "location": "File > Import-Export",
    "description": "Authoring tools for AR",
    "author": "Julien Letellier",
    "version": (0, 4, 0),
    "blender": (2, 80, 0)
}

import os
import bpy
from bpy.app.handlers import save_post
from bpy.app.handlers import persistent

from . import make_gltf
from . import make_logic
from . import export
from . import upload


def artemis_export():
    print('Exporting ARtemis scene...')

    # Export blender scene as glTF
    export.export_scene()

    # Export node_groups as logic canvases
    serialized_canvases = make_logic.serialize()
    for canvas in serialized_canvases:
        export.export_logic(canvas)


def artemis_upload():
    print('Uploading ARtemis scene...')

    # Upload blender scene as glTF
    gltf_scene = make_gltf.make()
    upload.upload_scene(gltf_scene)

    # Upload node_groups as logic canvases
    serialized_canvases = make_logic.serialize()
    for canvas in serialized_canvases:
        upload.upload_logic(canvas)


class ExportArtemis(bpy.types.Operator):
    bl_idname = 'export_scene.artemis'
    bl_label = 'Export ARtemis scene and logic'

    def execute(self, context):
        artemis_export()
        return {'FINISHED'}


@persistent
def save_post_handler(scene):
    artemis_upload()


def register():
    bpy.utils.register_class(ExportArtemis)

    save_post.append(save_post_handler)


def unregister():
    bpy.utils.unregister_class(ExportArtemis)

    save_post.remove(save_post_handler)


if __name__ == "__main__":
    register()
