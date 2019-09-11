import requests
import json

from . import make_gltf
from . import props


IS_DEV_MODE = False
API_URL = 'https://localhost:8443/api' if IS_DEV_MODE else 'https://ar3d.work/api'


def upload_gltf(gltf, buffer):
    if 'buffers' in gltf:
        buffer_uri = 'buffer0.bin'
        gltf['buffers'][0]['uri'] = buffer_uri
        __upload_buffer(buffer, '/buffer/upload/' + buffer_uri)

    if 'images' in gltf:
        for image in gltf['images']:
            __upload_file(image['uri'], '/buffer/upload/' + image['uri'])
    
    json_encoded = make_gltf.get_json(gltf, indent=None, separators=(',', ':'))
    upload_json(json_encoded, '/gltf/upload')


def upload_logic(logic_canvas):
    json_encoded = json.dumps(logic_canvas, separators=(',', ':'))
    upload_json(json_encoded, '/logic/upload')


def upload_json(json_encoded, path):
    url = API_URL + path
    token = __get_project_token()
    headers = {'Content-type': 'application/json', 'Authorization': token}
    r = requests.post(url, data=json_encoded, headers=headers, verify=not IS_DEV_MODE)


def __upload_buffer(buffer, path):
    url = API_URL + path
    token = __get_project_token()
    headers = {'Content-type': 'application/octet-stream', 'Authorization': token}
    r = requests.post(url, data=buffer, headers=headers, verify=not IS_DEV_MODE)


def __upload_file(filename, path):
    file = open(filename, 'rb')
    buffer = file.read()
    __upload_buffer(buffer, path)


def __get_project_token():
    world = props.get_world()
    if not 'artemis_project_token' in world:
        r = requests.get(API_URL + '/project/generate', verify=not IS_DEV_MODE)
        json = r.json()
        world.artemis_project_token = json['token']
        world.artemis_project_name = json['name']

    return world.artemis_project_token
