
from datetime import date
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from sqlalchemy import func

from models import db, User, Subscription, Invoice, Payment

dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)


@dashboard_bp.route("", methods=["GET"])
@jwt_required()
def get_dashboard():

    role = get_jwt().get("role")
    user_id = int(get_jwt_identity())

    # ---------------- SUBSCRIPTIONS ----------------

    subscriptions = Subscription.query

    if role == "customer":
        subscriptions = subscriptions.filter_by(customer_id=user_id)

    total_subscriptions = subscriptions.count()

    active_subscriptions = subscriptions.filter_by(
        status="active"
    ).count()

    status_query = db.session.query(
        Subscription.status,
        func.count(Subscription.id)
    )

    if role == "customer":
        status_query = status_query.filter(
            Subscription.customer_id == user_id
        )

    status_counts = dict(
        status_query.group_by(Subscription.status).all()
    )

    # ---------------- INVOICES ----------------

    invoices = Invoice.query.join(Subscription)

    if role == "customer":
        invoices = invoices.filter(
            Subscription.customer_id == user_id
        )

    total_invoices = invoices.count()

    # ---------------- REVENUE ----------------

    revenue_query = db.session.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).join(
        Invoice, Payment.invoice_id == Invoice.id
    ).join(
        Subscription, Invoice.subscription_id == Subscription.id
    ).filter(
        Payment.status == "completed"
    )

    if role == "customer":
        revenue_query = revenue_query.filter(
            Subscription.customer_id == user_id
        )

    total_revenue = revenue_query.scalar() or 0

    # ---------------- OUTSTANDING AMOUNT ----------------

    paid_amounts = db.session.query(
        Payment.invoice_id.label("invoice_id"),
        func.sum(Payment.amount).label("paid")
    ).filter(
        Payment.status == "completed"
    ).group_by(
        Payment.invoice_id
    ).subquery()

    outstanding_query = db.session.query(
        func.coalesce(
            func.sum(
                Invoice.amount -
                func.coalesce(paid_amounts.c.paid, 0)
            ),
            0
        )
    ).outerjoin(
        paid_amounts,
        Invoice.id == paid_amounts.c.invoice_id
    ).join(
        Subscription,
        Invoice.subscription_id == Subscription.id
    ).filter(
        Invoice.status != "cancelled"
    )

    if role == "customer":
        outstanding_query = outstanding_query.filter(
            Subscription.customer_id == user_id
        )

    outstanding = outstanding_query.scalar() or 0

    # ---------------- OVERDUE INVOICES ----------------

    overdue_count = invoices.filter(
        Invoice.due_date < date.today(),
        Invoice.status != "paid",
        Invoice.status != "cancelled"
    ).count()

    # ---------------- TOTAL CUSTOMERS ----------------

    total_customers = 0

    if role in ("admin", "staff"):
        total_customers = User.query.filter_by(
            role="customer"
        ).count()

    # ---------------- RESPONSE ----------------

    return jsonify({
        "total_subscriptions": total_subscriptions,
        "active_subscriptions": active_subscriptions,
        "subscription_status": status_counts,
        "total_invoices": total_invoices,
        "total_revenue": float(total_revenue),
        "outstanding_amount": float(outstanding),
        "overdue_invoices": overdue_count,
        "total_customers": total_customers
    }), 200
