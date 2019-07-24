bl_info = {
    "name": "ARtemis",
    "category": "Import-Export",
    "location": "File > Import-Export",
    "description": "Authoring tools for AR",
    "author": "Julien Letellier",
    "version": (0, 2, 0),
    "blender": (2, 80, 0)
}

import bpy
from . import make_logic


class ExportArtemis(bpy.types.Operator):
    bl_idname = 'export_artemis.json'
    bl_label = 'Export Logic Nodes'

    def execute(self, context):
        make_logic.build()
        return {'FINISHED'}


def register():
    bpy.utils.register_class(ExportArtemis)


def unregister():
    bpy.utils.unregister_class(ExportArtemis)


if __name__ == "__main__":
    register()
