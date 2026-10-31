import requests

BASE_URL = "http://127.0.0.1:5000"

# Admin login
login = requests.post(
    f"{BASE_URL}/api/login",
    json={
        "email": "admin@brightloop.com",
        "password": "Admin@12345"
    }
)

print("Login:", login.status_code)

token = login.json()["access_token"]

headers = {
    "Authorization": f"Bearer {token}"
}

# Generate invoices
response = requests.post(
    f"{BASE_URL}/api/invoices/generate",
    headers=headers
)

print("Invoice Generation:", response.status_code)
print("Response:", response.text)