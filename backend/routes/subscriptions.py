
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy.exc import SQLAlchemyError
from datetime import date

from models import db, User, Plan, Subscription

subscriptions_bp = Blueprint(
    "subscriptions", __name__, url_prefix="/api/subscriptions"
)


def error(message, status):
    return jsonify({"error": message}), status


# CREATE SUBSCRIPTION
@subscriptions_bp.route("", methods=["POST"])
@jwt_required()
def create_subscription():
    data = request.get_json(silent=True) or {}

    try:
        plan_id = data.get("plan_id")
        quantity = data.get("quantity", 1)

        if isinstance(plan_id, bool) or not isinstance(plan_id, int):
            return error("Valid plan_id is required", 400)

        if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
            return error("Quantity must be a positive whole number", 400)

        plan = db.session.get(Plan, plan_id)
        if not plan or not plan.is_active:
            return error("Plan not found or inactive", 404)

        if quantity < plan.min_quantity:
            return error(
                f"Minimum quantity is {plan.min_quantity}", 400
            )

        user_id = int(get_jwt_identity())
        role = get_jwt().get("role")

        # Customers can only create subscriptions for themselves.
        # Admin/staff can optionally provide customer_id.
        customer_id = user_id
        if role in ("admin", "staff") and "customer_id" in data:
            customer_id = data["customer_id"]

        customer = db.session.get(User, customer_id)
        if not customer or customer.role != "customer":
            return error("Customer not found", 404)

        subscription = Subscription(
            customer_id=customer_id,
            plan_id=plan.id,
            quantity=quantity,
            status="active",
            start_date=date.today(),
        )

        subscription.next_billing_date = (
            subscription.calculate_next_billing_date()
        )

        db.session.add(subscription)
        db.session.commit()

        return jsonify({
            "message": "Subscription created",
            "subscription": subscription.to_dict(),
            "total_amount": float(subscription.total_amount)
        }), 201

    except (ValueError, TypeError):
        db.session.rollback()
        return error("Invalid subscription data", 400)
    except SQLAlchemyError:
        db.session.rollback()
        return error("Could not create subscription", 500)


# LIST SUBSCRIPTIONS
@subscriptions_bp.route("", methods=["GET"])
@jwt_required()
def list_subscriptions():
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")

    query = Subscription.query

    if role == "customer":
        query = query.filter_by(customer_id=user_id)
    elif role == "staff" and request.args.get("customer_id"):
        try:
            query = query.filter_by(
                customer_id=int(request.args["customer_id"])
            )
        except ValueError:
            return error("Invalid customer_id", 400)

    subscriptions = query.order_by(Subscription.id.desc()).all()

    return jsonify({
        "count": len(subscriptions),
        "subscriptions": [s.to_dict() for s in subscriptions]
    }), 200


# GET ONE SUBSCRIPTION
@subscriptions_bp.route("/<int:subscription_id>", methods=["GET"])
@jwt_required()
def get_subscription(subscription_id):
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")

    subscription = db.session.get(Subscription, subscription_id)

    if not subscription:
        return error("Subscription not found", 404)

    if role == "customer" and subscription.customer_id != user_id:
        return error("Access denied", 403)

    return jsonify({"subscription": subscription.to_dict()}), 200


# UPDATE SUBSCRIPTION STATUS
@subscriptions_bp.route("/<int:subscription_id>", methods=["PUT"])
@jwt_required()
def update_subscription(subscription_id):
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")

    subscription = db.session.get(Subscription, subscription_id)

    if not subscription:
        return error("Subscription not found", 404)

    if role == "customer":
        if subscription.customer_id != user_id:
            return error("Access denied", 403)

        allowed = ["paused", "active", "cancelled"]
    elif role in ("admin", "staff"):
        allowed = ["active", "paused", "cancelled", "expired"]
    else:
        return error("Access denied", 403)

    if role == "customer" and subscription.status in ("cancelled", "expired"):
        return error("This subscription cannot be changed", 400)

    data = request.get_json(silent=True) or {}
    new_status = data.get("status")

    if new_status not in allowed:
        return error("Invalid subscription status", 400)

    subscription.status = new_status

    if new_status in ("cancelled", "expired"):
        subscription.end_date = date.today()

    try:
        db.session.commit()
        return jsonify({
            "message": "Subscription updated",
            "subscription": subscription.to_dict()
        }), 200
    except SQLAlchemyError:
        db.session.rollback()
        return error("Could not update subscription", 500)
