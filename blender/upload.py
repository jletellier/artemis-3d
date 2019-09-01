import requests
import json


def upload_scene():
    url = 'https://localhost:8443/api/scene/upload'
    headers = { 'Content-type': 'application/json', 'Authorization': 'Bearer 1234' }
    payload = { 'some': 'data' }
    r = requests.post(url, data = json.dumps(payload), headers = headers, verify = False)
