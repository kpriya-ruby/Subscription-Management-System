"""
Brightloop - product routes.

POST   /api/products        admin, staff   create a product
GET    /api/products        any logged-in  list products
GET    /api/products/<id>   any logged-in  get one product
PUT    /api/products/<id>   admin, staff   update a product
DELETE /api/products/<id>   admin only     delete a product (blocked if it has plans)
"""
from decimal import Decimal, InvalidOperation
from functools import wraps

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, jwt_required
from sqlalchemy.exc import SQLAlchemyError

from models import db, Product, PRODUCT_TYPES

products_bp = Blueprint("products", __name__, url_prefix="/api/products")

MAX_PRICE = Decimal("99999999.99")  # fits the Numeric(10, 2) column


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def error(message, status, **extra):
    return jsonify({"error": message, **extra}), status


def role_required(*allowed_roles):
    """
    Allow the request only if the JWT's role claim is in allowed_roles.
    Always put @jwt_required() ABOVE this decorator so the token is
    verified first.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            role = get_jwt().get("role")
            if role not in allowed_roles:
                return error("You do not have permission to do this", 403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def serialize(product):
    """Product as a dict. Customers must not see our internal cost price."""
    data = product.to_dict()
    if get_jwt().get("role") == "customer":
        data.pop("cost_price", None)
    return data


def parse_price(value, field):
    """Turn input into a Decimal with 2 decimal places, or raise ValueError."""
    if isinstance(value, bool) or not isinstance(value, (int, float, str)):
        raise ValueError(f"{field} must be a number")
    try:
        amount = Decimal(str(value).strip())
    except InvalidOperation:
        raise ValueError(f"{field} must be a number")
    if not amount.is_finite():
        raise ValueError(f"{field} must be a number")
    if amount < 0:
        raise ValueError(f"{field} cannot be negative")
    if amount > MAX_PRICE:
        raise ValueError(f"{field} is too large")
    return amount.quantize(Decimal("0.01"))


def clean_product_data(data, creating):
    """
    Validate the request body and return a dict of clean values.
    creating=True  -> name and sales_price are required
    creating=False -> only the fields that were sent are validated (partial update)
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

    if "type" in data:
        ptype = data.get("type")
        if not isinstance(ptype, str) or ptype.strip().lower() not in PRODUCT_TYPES:
            raise ValueError(f"type must be one of: {', '.join(PRODUCT_TYPES)}")
        clean["type"] = ptype.strip().lower()

    if creating or "sales_price" in data:
        if "sales_price" not in data:
            raise ValueError("sales_price is required")
        clean["sales_price"] = parse_price(data["sales_price"], "sales_price")

    if "cost_price" in data:
        clean["cost_price"] = parse_price(data["cost_price"], "cost_price")

    if "notes" in data:
        notes = data["notes"]
        if notes is not None and not isinstance(notes, str):
            raise ValueError("notes must be text")
        clean["notes"] = notes.strip() if notes else None

    return clean


# ---------------------------------------------------------------------------
# POST /api/products
# ---------------------------------------------------------------------------
@products_bp.route("", methods=["POST"])
@jwt_required()
@role_required("admin", "staff")
def create_product():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON", 400)

    try:
        clean = clean_product_data(data, creating=True)
        product = Product(**clean)  # defaults: type="service", cost_price=0
    except ValueError as e:
        return error(str(e), 400)

    try:
        db.session.add(product)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return error("Could not save the product", 500)

    return jsonify({"message": "Product created", "product": serialize(product)}), 201


# ---------------------------------------------------------------------------
# GET /api/products
# ---------------------------------------------------------------------------
@products_bp.route("", methods=["GET"])
@jwt_required()
def list_products():
    products = Product.query.order_by(Product.id).all()
    return jsonify({
        "count": len(products),
        "products": [serialize(p) for p in products],
    }), 200


# ---------------------------------------------------------------------------
# GET /api/products/<id>
# ---------------------------------------------------------------------------
@products_bp.route("/<int:product_id>", methods=["GET"])
@jwt_required()
def get_product(product_id):
    product = db.session.get(Product, product_id)
    if product is None:
        return error("Product not found", 404)
    return jsonify({"product": serialize(product)}), 200


# ---------------------------------------------------------------------------
# PUT /api/products/<id>
# ---------------------------------------------------------------------------
@products_bp.route("/<int:product_id>", methods=["PUT"])
@jwt_required()
@role_required("admin", "staff")
def update_product(product_id):
    product = db.session.get(Product, product_id)
    if product is None:
        return error("Product not found", 404)

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON", 400)

    try:
        clean = clean_product_data(data, creating=False)
        if not clean:
            return error(
                "Nothing to update. Send at least one of: "
                "name, type, sales_price, cost_price, notes", 400)
        for field, value in clean.items():
            setattr(product, field, value)
    except ValueError as e:
        db.session.rollback()
        return error(str(e), 400)

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return error("Could not update the product", 500)

    return jsonify({"message": "Product updated", "product": serialize(product)}), 200


# ---------------------------------------------------------------------------
# DELETE /api/products/<id>
# ---------------------------------------------------------------------------
@products_bp.route("/<int:product_id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_product(product_id):
    product = db.session.get(Product, product_id)
    if product is None:
        return error("Product not found", 404)

    # Safety check: a product that has plans cannot be deleted.
    # Deleting it would also delete its plans, and any subscriptions that
    # use those plans would be left pointing at plans that no longer exist.
    plan_count = len(product.plans)
    if plan_count > 0:
        return error(
            "This product has plans and cannot be deleted. "
            "Remove its plans first.", 409, plan_count=plan_count)

    try:
        db.session.delete(product)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return error("Could not delete the product", 500)

    return jsonify({"message": "Product deleted"}), 200