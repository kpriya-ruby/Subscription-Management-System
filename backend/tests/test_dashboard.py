
import requests

BASE = "http://127.0.0.1:5000"

login = requests.post(
    BASE + "/api/login",
    json={
        "email": "admin@brightloop.com",
        "password": "Admin@12345"
    }
)

token = login.json()["access_token"]

response = requests.get(
    BASE + "/api/dashboard",
    headers={
        "Authorization": "Bearer " + token
    }
)

print("Status:", response.status_code)
print("Dashboard:", response.json())
