import requests
import json


IS_DEV_MODE = True
API_URL = 'https://localhost:8443/api'


def upload_scene():
    path = '/scene/upload'
    upload_json(json)


def upload_logic(logic_canvas):
    path = '/logic/upload'
    json_encoded = json.dumps(logic_canvas, separators = (',', ':'))
    upload_json(json_encoded, path)


def upload_json(json, path):
    url = API_URL + path
    headers = { 'Content-type': 'application/json', 'Authorization': 'Bearer 1234' }
    r = requests.post(url, data = json, headers = headers, verify = not IS_DEV_MODE)
