
from datetime import date, timedelta

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

from models import db, Invoice, Subscription

invoices_bp = Blueprint("invoices", __name__, url_prefix="/api/invoices")


def error(message, status):
    return jsonify({"error": message}), status


# GENERATE INVOICES FOR DUE SUBSCRIPTIONS
@invoices_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_invoices():
    if get_jwt().get("role") not in ("admin", "staff"):
        return error("Access denied", 403)

    today = date.today()

    due_subscriptions = Subscription.query.filter(
        Subscription.status == "active",
        Subscription.next_billing_date <= today
    ).all()

    created = []

    try:
        for sub in due_subscriptions:
            billing_date = sub.next_billing_date

            # Prevent duplicate invoice for the same billing date
            existing = Invoice.query.filter_by(
                subscription_id=sub.id,
                issue_date=billing_date
            ).first()

            if existing:
                continue

            invoice = Invoice(
                subscription_id=sub.id,
                amount=sub.total_amount,
                status="draft",
                issue_date=billing_date,
                due_date=billing_date + timedelta(days=7)
            )

            db.session.add(invoice)
            created.append(invoice)

            # Advance the next billing date
            cycle = sub.plan.billing_cycle

            days = {
                "daily": 1,
                "weekly": 7,
                "monthly": 30,
                "yearly": 365
            }

            sub.next_billing_date = billing_date + timedelta(
                days=days[cycle]
            )

        db.session.commit()

        return jsonify({
            "message": "Invoice generation completed",
            "created_count": len(created),
            "invoices": [i.to_dict() for i in created]
        }), 201

    except (SQLAlchemyError, KeyError, ValueError):
        db.session.rollback()
        return error("Could not generate invoices", 500)


# LIST INVOICES
@invoices_bp.route("", methods=["GET"])
@jwt_required()
def list_invoices():
    role = get_jwt().get("role")
    user_id = int(get_jwt_identity())

    query = Invoice.query

    if role == "customer":
        query = query.join(Subscription).filter(
            Subscription.customer_id == user_id
        )

    invoices = query.order_by(Invoice.id.desc()).all()

    return jsonify({
        "count": len(invoices),
        "invoices": [i.to_dict() for i in invoices]
    }), 200


# GET ONE INVOICE
@invoices_bp.route("/<int:invoice_id>", methods=["GET"])
@jwt_required()
def get_invoice(invoice_id):
    invoice = db.session.get(Invoice, invoice_id)

    if not invoice:
        return error("Invoice not found", 404)

    role = get_jwt().get("role")
    user_id = int(get_jwt_identity())

    if role == "customer" and invoice.subscription.customer_id != user_id:
        return error("Access denied", 403)

    return jsonify({"invoice": invoice.to_dict()}), 200
