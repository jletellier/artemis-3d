bl_info = {
    "name": "ARtemis",
    "category": "Import-Export",
    "location": "File > Import-Export",
    "description": "Authoring tools for AR",
    "author": "Julien Letellier",
    "version": (0, 3, 0),
    "blender": (2, 80, 0)
}

import bpy
from bpy.app.handlers import save_post
from bpy.app.handlers import persistent

from . import make_logic


@persistent
def artemis_export_logic(scene):
    print('saving scene')
    make_logic.build()


class ExportArtemis(bpy.types.Operator):
    bl_idname = 'artemis_export_logic.json'
    bl_label = 'Export Logic'

    def execute(self, context):
        artemis_export_logic(bpy.context.scene)
        return {'FINISHED'}


def register():
    bpy.utils.register_class(ExportArtemis)

    save_post.append(artemis_export_logic)


def unregister():
    bpy.utils.unregister_class(ExportArtemis)


if __name__ == "__main__":
    register()
