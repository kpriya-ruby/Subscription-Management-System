import requests

BASE_URL = "http://127.0.0.1:5000"

# Admin login
login = requests.post(
    BASE_URL + "/api/login",
    json={
        "email": "admin@brightloop.com",
        "password": "Admin@12345"
    }
)

print("Login:", login.status_code)

token = login.json()["access_token"]

headers = {
    "Authorization": "Bearer " + token
}

# Create a product
product = {
    "name": "Brightloop Premium",
    "type": "service",
    "sales_price": 999,
    "cost_price": 500,
    "notes": "Demo subscription product"
}

response = requests.post(
    BASE_URL + "/api/products",
    json=product,
    headers=headers
)

print("Product creation:", response.status_code)
print(response.json())