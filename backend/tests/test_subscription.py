
import requests

BASE = "http://127.0.0.1:5000"

# 1. Register a test customer
customer = {
    "name": "Test Customer",
    "email": "testcustomer1@gmail.com",
    "password": "Test@12345"
}

register = requests.post(BASE + "/api/register", json=customer)
print("Registration:", register.status_code, register.json())

# 2. Login as customer
login = requests.post(
    BASE + "/api/login",
    json={
        "email": customer["email"],
        "password": customer["password"]
    }
)

print("Login:", login.status_code)

if login.status_code != 200:
    print(login.json())
    raise SystemExit

token = login.json()["access_token"]

headers = {
    "Authorization": "Bearer " + token
}

# 3. Subscribe to plan ID 1
subscription = requests.post(
    BASE + "/api/subscriptions",
    json={
        "plan_id": 1,
        "quantity": 1
    },
    headers=headers
)

print("Subscription:", subscription.status_code)
print("Response:", subscription.text)
