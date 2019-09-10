import bpy


def get_world():
    if not 'Artemis' in bpy.data.worlds:
        __init_properties()
        __create_world()
    
    return bpy.data.worlds['Artemis']


def __create_world():
    world = bpy.data.worlds.new('Artemis')
    world.use_fake_user = True


def __init_properties():
    bpy.types.World.artemis_project_name = bpy.props.StringProperty(
        name="Name", description="Artemis 3D project name", default="")
