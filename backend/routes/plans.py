"""
Brightloop - plan routes.

POST   /api/plans        admin, staff   create a plan
GET    /api/plans        any logged-in  list plans (filters: product_id, billing_cycle, is_active)
GET    /api/plans/<id>   any logged-in  get one plan
PUT    /api/plans/<id>   admin, staff   update a plan
DELETE /api/plans/<id>   admin only     delete a plan (blocked if subscriptions use it)

Customers only see ACTIVE plans. Admin and staff see everything.
"""
from decimal import Decimal, InvalidOperation
from functools import wraps

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, jwt_required
from sqlalchemy.exc import SQLAlchemyError

from models import db, Plan, Product, Subscription, BILLING_CYCLES

plans_bp = Blueprint("plans", __name__, url_prefix="/api/plans")

MAX_PRICE = Decimal("99999999.99")  # fits the Numeric(10, 2) column
MAX_QUANTITY = 100000


# ---------------------------------------------------------------------------
# Helpers (same style as routes/products.py)
# ---------------------------------------------------------------------------
def error(message, status, **extra):
    return jsonify({"error": message, **extra}), status


def role_required(*allowed_roles):
    """Allow the request only if the JWT role claim is in allowed_roles.
    Always put @jwt_required() ABOVE this decorator."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if get_jwt().get("role") not in allowed_roles:
                return error("You do not have permission to do this", 403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def is_customer():
    return get_jwt().get("role") == "customer"


def serialize(plan):
    """Plan as a dict, plus the fields the model's to_dict() does not include."""
    data = plan.to_dict()
    data["product_name"] = plan.product.name if plan.product else None
    data["created_at"] = plan.created_at.isoformat() if plan.created_at else None
    return data


def parse_price(value, field):
    """Turn input into a Decimal with 2 places. Must be greater than 0."""
    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        raise ValueError(f"{field} must be a number")
    try:
        amount = Decimal(str(value).strip())
    except InvalidOperation:
        raise ValueError(f"{field} must be a number")
    if not amount.is_finite():
        raise ValueError(f"{field} must be a number")
    # Greater than 0 because invoices cannot have a zero amount.
    if amount <= 0:
        raise ValueError(f"{field} must be greater than 0")
    if amount > MAX_PRICE:
        raise ValueError(f"{field} is too large")
    return amount.quantize(Decimal("0.01"))


def clean_plan_data(data, creating):
    """
    Validate the request body and return a dict of clean values.
    creating=True  -> name, product_id, billing_cycle and price are required
    creating=False -> only the fields that were sent are validated
    Raises ValueError with a friendly message if something is wrong.
    """
    clean = {}

    if creating or "name" in data:
        name = data.get("name")
        if not isinstance(name, str) or not name.strip():
            raise ValueError("name is required")
        name = name.strip()
        if len(name) > 120:
            raise ValueError("name must be 120 characters or fewer")
        clean["name"] = name

    if creating:
        product_id = data.get("product_id")
        if isinstance(product_id, bool) or not isinstance(product_id, int):
            raise ValueError("product_id is required and must be a whole number")
        clean["product_id"] = product_id

    if creating or "billing_cycle" in data:
        cycle = data.get("billing_cycle")
        if not isinstance(cycle, str) or cycle.strip().lower() not in BILLING_CYCLES:
            raise ValueError(
                f"billing_cycle is required and must be one of: {', '.join(BILLING_CYCLES)}")
        clean["billing_cycle"] = cycle.strip().lower()

    if creating or "price" in data:
        if "price" not in data:
            raise ValueError("price is required")
        clean["price"] = parse_price(data["price"], "price")

    if "min_quantity" in data:
        qty = data["min_quantity"]
        if isinstance(qty, bool) or not isinstance(qty, int):
            raise ValueError("min_quantity must be a whole number")
        if qty < 1:
            raise ValueError("min_quantity must be at least 1")
        if qty > MAX_QUANTITY:
            raise ValueError("min_quantity is too large")
        clean["min_quantity"] = qty

    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            raise ValueError("is_active must be true or false")
        clean["is_active"] = data["is_active"]

    return clean


# ---------------------------------------------------------------------------
# POST /api/plans
# ---------------------------------------------------------------------------
@plans_bp.route("", methods=["POST"])
@jwt_required()
@role_required("admin", "staff")
def create_plan():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON", 400)

    try:
        clean = clean_plan_data(data, creating=True)
    except ValueError as e:
        return error(str(e), 400)

    # The product the plan belongs to must exist
    if db.session.get(Product, clean["product_id"]) is None:
        return error("Product not found", 404)

    try:
        plan = Plan(**clean)  # defaults: min_quantity=1, is_active=True
        db.session.add(plan)
        db.session.commit()
    except ValueError as e:
        db.session.rollback()
        return error(str(e), 400)
    except SQLAlchemyError:
        db.session.rollback()
        return error("Could not save the plan", 500)

    return jsonify({"message": "Plan created", "plan": serialize(plan)}), 201


# ---------------------------------------------------------------------------
# GET /api/plans
#   optional filters: ?product_id=1&billing_cycle=monthly&is_active=true
# ---------------------------------------------------------------------------
@plans_bp.route("", methods=["GET"])
@jwt_required()
def list_plans():
    query = Plan.query

    product_id = request.args.get("product_id")
    if product_id is not None:
        try:
            query = query.filter(Plan.product_id == int(product_id))
        except ValueError:
            return error("product_id must be a whole number", 400)

    cycle = request.args.get("billing_cycle")
    if cycle is not None:
        cycle = cycle.strip().lower()
        if cycle not in BILLING_CYCLES:
            return error(f"billing_cycle must be one of: {', '.join(BILLING_CYCLES)}", 400)
        query = query.filter(Plan.billing_cycle == cycle)

    if is_customer():
        query = query.filter(Plan.is_active.is_(True))  # customers: active plans only
    else:
        active = request.args.get("is_active")
        if active is not None:
            if active.lower() not in ("true", "false"):
                return error("is_active must be true or false", 400)
            query = query.filter(Plan.is_active.is_(active.lower() == "true"))

    plans = query.order_by(Plan.id).all()
    return jsonify({"count": len(plans), "plans": [serialize(p) for p in plans]}), 200


# ---------------------------------------------------------------------------
# GET /api/plans/<id>
# ---------------------------------------------------------------------------
@plans_bp.route("/<int:plan_id>", methods=["GET"])
@jwt_required()
def get_plan(plan_id):
    plan = db.session.get(Plan, plan_id)
    if plan is None or (is_customer() and not plan.is_active):
        return error("Plan not found", 404)
    return jsonify({"plan": serialize(plan)}), 200


# ---------------------------------------------------------------------------
# PUT /api/plans/<id>
# ---------------------------------------------------------------------------
@plans_bp.route("/<int:plan_id>", methods=["PUT"])
@jwt_required()
@role_required("admin", "staff")
def update_plan(plan_id):
    plan = db.session.get(Plan, plan_id)
    if plan is None:
        return error("Plan not found", 404)

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON", 400)

    # A plan cannot be moved to a different product (subscriptions rely on it).
    if "product_id" in data:
        sent = data["product_id"]
        if isinstance(sent, bool) or sent != plan.product_id:
            return error("product_id cannot be changed", 400)

    try:
        clean = clean_plan_data(data, creating=False)
        if not clean:
            return error(
                "Nothing to update. Send at least one of: "
                "name, billing_cycle, price, min_quantity, is_active", 400)
        for field, value in clean.items():
            setattr(plan, field, value)
    except ValueError as e:
        db.session.rollback()
        return error(str(e), 400)

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return error("Could not update the plan", 500)

    return jsonify({"message": "Plan updated", "plan": serialize(plan)}), 200


# ---------------------------------------------------------------------------
# DELETE /api/plans/<id>
# ---------------------------------------------------------------------------
@plans_bp.route("/<int:plan_id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_plan(plan_id):
    plan = db.session.get(Plan, plan_id)
    if plan is None:
        return error("Plan not found", 404)

    # Safety check: never delete a plan that subscriptions point at.
    subscription_count = Subscription.query.filter_by(plan_id=plan.id).count()
    if subscription_count > 0:
        return error(
            "This plan is used by subscriptions and cannot be deleted. "
            "Set is_active to false instead to stop new sign-ups.",
            409, subscription_count=subscription_count)

    try:
        db.session.delete(plan)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return error("Could not delete the plan", 500)

    return jsonify({"message": "Plan deleted"}), 200