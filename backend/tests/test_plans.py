"""
Brightloop - manual test script for the Plans API.

1. Start the server in one terminal:   python app.py
2. Run this in another terminal:       python test_plans.py

Needs:  pip install requests
Assumes the admin from create_admin.py and Product ID 1 exist.
"""
import requests

BASE = "http://127.0.0.1:5000"
ADMIN = {"email": "admin@brightloop.com", "password": "Admin@12345"}
CUSTOMER = {"name": "Test Customer", "email": "customer@example.com", "password": "Strong#Pass1"}

passed = 0
failed = 0


def check(label, response, expected_status):
    global passed, failed
    ok = response.status_code == expected_status
    passed += ok
    failed += (not ok)
    print(f"[{'PASS' if ok else 'FAIL'}] {label} -> {response.status_code} (expected {expected_status})")
    if not ok:
        print("       ", response.text)
    return response


def login(creds):
    r = requests.post(f"{BASE}/api/login", json={"email": creds["email"], "password": creds["password"]})
    r.raise_for_status()
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


# --- Setup: tokens ---------------------------------------------------------
admin = login(ADMIN)
requests.post(f"{BASE}/api/register", json=CUSTOMER)  # 409 if it already exists - fine
customer = login(CUSTOMER)

# --- 1. Create the monthly plan for Product 1 (Rs 999, min quantity 1) -----
r = check("Create monthly plan (Product 1, 999, min qty 1)",
          requests.post(f"{BASE}/api/plans", headers=admin, json={
              "name": "Brightloop Premium Monthly",
              "product_id": 1,
              "billing_cycle": "monthly",
              "price": 999,
              "min_quantity": 1,
          }), 201)
plan_id = r.json()["plan"]["id"] if r.status_code == 201 else None
print("       created plan:", r.json().get("plan"))

# --- 2. Validation errors --------------------------------------------------
base_body = {"name": "Bad", "product_id": 1, "billing_cycle": "monthly", "price": 100}
check("Missing name", requests.post(f"{BASE}/api/plans", headers=admin,
      json={k: v for k, v in base_body.items() if k != "name"}), 400)
check("Invalid billing cycle", requests.post(f"{BASE}/api/plans", headers=admin,
      json={**base_body, "billing_cycle": "fortnightly"}), 400)
check("Price is zero", requests.post(f"{BASE}/api/plans", headers=admin,
      json={**base_body, "price": 0}), 400)
check("Price is text", requests.post(f"{BASE}/api/plans", headers=admin,
      json={**base_body, "price": "abc"}), 400)
check("Min quantity is 0", requests.post(f"{BASE}/api/plans", headers=admin,
      json={**base_body, "min_quantity": 0}), 400)
check("Product does not exist", requests.post(f"{BASE}/api/plans", headers=admin,
      json={**base_body, "product_id": 9999}), 404)

# --- 3. Permissions on create ----------------------------------------------
check("Customer cannot create", requests.post(f"{BASE}/api/plans", headers=customer, json=base_body), 403)
check("No token cannot create", requests.post(f"{BASE}/api/plans", json=base_body), 401)

# --- 4. Read ---------------------------------------------------------------
r = check("List all plans (admin)", requests.get(f"{BASE}/api/plans", headers=admin), 200)
print("       plan count:", r.json().get("count"))
r = check("Filter by product_id=1 & billing_cycle=monthly",
          requests.get(f"{BASE}/api/plans", headers=admin,
                       params={"product_id": 1, "billing_cycle": "monthly"}), 200)
print("       matching plans:", r.json().get("count"))
check("Filter with invalid billing_cycle",
      requests.get(f"{BASE}/api/plans", headers=admin, params={"billing_cycle": "nope"}), 400)
check("List plans (customer)", requests.get(f"{BASE}/api/plans", headers=customer), 200)
check("List plans (no token)", requests.get(f"{BASE}/api/plans"), 401)
if plan_id:
    check("Get plan by id", requests.get(f"{BASE}/api/plans/{plan_id}", headers=customer), 200)
check("Get plan that does not exist", requests.get(f"{BASE}/api/plans/99999", headers=admin), 404)

# --- 5. Update -------------------------------------------------------------
if plan_id:
    r = check("Update price to 1099", requests.put(f"{BASE}/api/plans/{plan_id}", headers=admin,
              json={"price": 1099}), 200)
    print("       new price:", r.json()["plan"]["price"])
    check("Update with empty body", requests.put(f"{BASE}/api/plans/{plan_id}", headers=admin, json={}), 400)
    check("Update with invalid cycle", requests.put(f"{BASE}/api/plans/{plan_id}", headers=admin,
          json={"billing_cycle": "never"}), 400)
    check("Cannot change product_id", requests.put(f"{BASE}/api/plans/{plan_id}", headers=admin,
          json={"product_id": 2}), 400)
    check("Customer cannot update", requests.put(f"{BASE}/api/plans/{plan_id}", headers=customer,
          json={"price": 1}), 403)
    # Put the price back to the original value
    check("Restore price to 999", requests.put(f"{BASE}/api/plans/{plan_id}", headers=admin,
          json={"price": 999}), 200)

    # Inactive plans are hidden from customers
    check("Deactivate plan", requests.put(f"{BASE}/api/plans/{plan_id}", headers=admin,
          json={"is_active": False}), 200)
    check("Customer cannot see inactive plan", requests.get(f"{BASE}/api/plans/{plan_id}", headers=customer), 404)
    check("Reactivate plan", requests.put(f"{BASE}/api/plans/{plan_id}", headers=admin,
          json={"is_active": True}), 200)

# --- 6. Delete (uses a throwaway plan so the real one is kept) -------------
r = requests.post(f"{BASE}/api/plans", headers=admin, json={
    "name": "Throwaway Plan", "product_id": 1, "billing_cycle": "weekly", "price": 50})
throwaway_id = r.json()["plan"]["id"]
check("Customer cannot delete", requests.delete(f"{BASE}/api/plans/{throwaway_id}", headers=customer), 403)
check("Admin deletes throwaway plan", requests.delete(f"{BASE}/api/plans/{throwaway_id}", headers=admin), 200)
check("Delete again -> not found", requests.delete(f"{BASE}/api/plans/{throwaway_id}", headers=admin), 404)

print(f"\nDone: {passed} passed, {failed} failed")
print("Not covered yet: deleting a plan that has subscriptions (409) - test it once subscriptions exist.")