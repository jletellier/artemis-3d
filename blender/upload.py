import requests
import json


IS_DEV_MODE = True
API_URL = 'https://localhost:8443/api'


def upload_scene(gltf_scene):
    path = '/scene/upload'
    upload_dict(gltf_scene, path)


def upload_logic(logic_canvas):
    path = '/logic/upload'
    upload_dict(logic_canvas, path)


def upload_dict(serializable_dict, path):
    url = API_URL + path
    headers = { 'Content-type': 'application/json', 'Authorization': 'Bearer 1234' }
    json_encoded = json.dumps(serializable_dict, separators = (',', ':'))
    r = requests.post(url, data = json_encoded, headers = headers, verify = not IS_DEV_MODE)
