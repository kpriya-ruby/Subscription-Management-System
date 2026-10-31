
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

from models import db, Invoice, Payment, Subscription

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


def error(message, status):
    return jsonify({"error": message}), status


@payments_bp.route("", methods=["POST"])
@jwt_required()
def create_payment():
    data = request.get_json(silent=True) or {}

    invoice_id = data.get("invoice_id")
    amount = data.get("amount")
    method = data.get("method")

    # Validate invoice ID
    if isinstance(invoice_id, bool) or not isinstance(invoice_id, int):
        return error("Valid invoice_id required", 400)

    # Validate amount
    if isinstance(amount, bool) or not isinstance(amount, (int, float)):
        return error("Valid amount required", 400)

    if amount <= 0:
        return error("Amount must be greater than zero", 400)

    # Validate payment method
    if method not in ("card", "bank_transfer", "upi", "cash"):
        return error("Invalid payment method", 400)

    # Find invoice
    invoice = db.session.get(Invoice, invoice_id)

    if not invoice:
        return error("Invoice not found", 404)

    # Check user permissions
    role = get_jwt().get("role")
    user_id = int(get_jwt_identity())

    if role == "customer" and invoice.subscription.customer_id != user_id:
        return error("Access denied", 403)

    if role not in ("admin", "staff", "customer"):
        return error("Access denied", 403)

    # Check invoice balance
    if amount > float(invoice.balance_due):
        return error("Payment exceeds invoice balance", 400)

    try:
        payment = Payment(
            invoice_id=invoice.id,
            amount=amount,
            method=method,
            status="completed"
        )

        # Add payment to invoice relationship
        invoice.payments.append(payment)

        db.session.flush()

        # Update invoice status when fully paid
        if invoice.balance_due <= 0:
            invoice.status = "paid"

        db.session.commit()

        return jsonify({
            "message": "Payment recorded",
            "payment": payment.to_dict(),
            "invoice": invoice.to_dict()
        }), 201

    except (ValueError, TypeError):
        db.session.rollback()
        return error("Invalid payment data", 400)

    except SQLAlchemyError:
        db.session.rollback()
        return error("Could not record payment", 500)


@payments_bp.route("", methods=["GET"])
@jwt_required()
def list_payments():
    role = get_jwt().get("role")
    user_id = int(get_jwt_identity())

    query = Payment.query.join(Invoice)

    if role == "customer":
        query = query.join(Subscription).filter(
            Subscription.customer_id == user_id
        )

    payments = query.order_by(Payment.id.desc()).all()

    return jsonify({
        "count": len(payments),
        "payments": [p.to_dict() for p in payments]
    }), 200
