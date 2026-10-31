import requests

BASE_URL = "http://127.0.0.1:5000"

# Customer login
login = requests.post(
    f"{BASE_URL}/api/login",
    json={
        "email": "testcustomer1@gmail.com",
        "password": "Test@12345"
    }
)

print("Login:", login.status_code)

token = login.json()["access_token"]

headers = {
    "Authorization": f"Bearer {token}"
}

# Make payment
payment = requests.post(
    f"{BASE_URL}/api/payments",
    headers=headers,
    json={
        "invoice_id": 1,
        "amount": 999,
        "method": "upi"
    }
)

print("Payment:", payment.status_code)
print("Response:", payment.text)