import requests
import json

from . import make_gltf


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
    headers = {'Content-type': 'application/json', 'Authorization': 'Bearer 1234'}
    r = requests.post(url, data=json_encoded, headers=headers, verify=not IS_DEV_MODE)
