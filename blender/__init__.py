bl_info = {
    "name": "ARtemis",
    "category": "Import-Export",
    "location": "File > Import-Export",
    "description": "Authoring tools for AR",
    "author": "Julien Letellier",
    "version": (0, 3, 0),
    "blender": (2, 80, 0)
}

import os
import bpy
from bpy.app.handlers import save_post
from bpy.app.handlers import persistent

from . import make_logic
from . import upload


@persistent
def artemis_export_scene(scene):
    print('Saving ARtemis scene...')
    try:
        filepath = bpy.context.blend_data.filepath

        # Remove .blend extension:
        filepath = os.path.splitext(filepath)[0]

        bpy.ops.export_scene.gltf(
            export_format = 'GLTF_SEPARATE',
            export_cameras = True,
            export_extras = True,
            export_lights = True,
            filepath = filepath,
        )
    except AttributeError:
        print('ERROR: glTF 2.0 addon ist not installed')


@persistent
def artemis_export_logic(scene):
    print('Saving ARtemis logic...')
    make_logic.build()
    upload.upload_scene()


class ExportArtemis(bpy.types.Operator):
    bl_idname = 'export_scene.artemis'
    bl_label = 'Export ARtemis scene and logic'

    def execute(self, context):
        artemis_export_scene(bpy.context.scene)
        artemis_export_logic(bpy.context.scene)
        return {'FINISHED'}


def register():
    bpy.utils.register_class(ExportArtemis)

    save_post.append(artemis_export_scene)
    save_post.append(artemis_export_logic)


def unregister():
    bpy.utils.unregister_class(ExportArtemis)


if __name__ == "__main__":
    register()
