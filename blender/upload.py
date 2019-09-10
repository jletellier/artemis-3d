import requests
import json

from . import make_gltf
from . import props


IS_DEV_MODE = True
API_URL = 'https://localhost:8443/api'


def upload_gltf(gltf):
    path = '/gltf/upload'
    json_encoded = make_gltf.get_json(gltf, indent=None, separators=(',', ':'))
    upload_json(json_encoded, path)


def upload_logic(logic_canvas):
    path = '/logic/upload'
    json_encoded = json.dumps(logic_canvas, separators=(',', ':'))
    upload_json(json_encoded, path)


def upload_json(json_encoded, path):
    url = API_URL + path
    token = __get_project_token()
    headers = {'Content-type': 'application/json', 'Authorization': token}
    r = requests.post(url, data=json_encoded, headers=headers, verify=not IS_DEV_MODE)


def __get_project_token():
    world = props.get_world()
    if not 'artemis_project_token' in world:
        r = requests.get(API_URL + '/project/generate', verify=not IS_DEV_MODE)
        json = r.json()
        world.artemis_project_token = json['token']
        world.artemis_project_name = json['name']

    return world.artemis_project_token
