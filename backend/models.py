"""
Brightloop - database models.

Tables:  users, products, plans, subscriptions, invoices, payments

Relationships:
    Product 1 --- * Plan
    User    1 --- * Subscription (as customer)
    Plan    1 --- * Subscription
    Subscription 1 --- * Invoice
    Invoice 1 --- * Payment
"""
import re
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()

# ---------------------------------------------------------------------------
# Allowed values (kept in one place so routes can reuse them)
# ---------------------------------------------------------------------------
USER_ROLES = ("admin", "staff", "customer")
PRODUCT_TYPES = ("service", "physical", "digital")
BILLING_CYCLES = ("daily", "weekly", "monthly", "yearly")
SUBSCRIPTION_STATUSES = ("draft", "active", "paused", "cancelled", "expired")
INVOICE_STATUSES = ("draft", "sent", "paid", "overdue", "cancelled")
PAYMENT_METHODS = ("card", "bank_transfer", "upi", "cash")
PAYMENT_STATUSES = ("pending", "completed", "failed", "refunded")

# Rough length of each billing cycle, used to work out the next billing date.
CYCLE_DAYS = {"daily": 1, "weekly": 7, "monthly": 30, "yearly": 365}

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def utcnow():
    return datetime.now(timezone.utc)


def _to_money(value, field_name, allow_zero=True):
    """Convert input to a non-negative Decimal, or raise ValueError."""
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError(f"{field_name} must be a number")
    if amount < 0 or (amount == 0 and not allow_zero):
        raise ValueError(f"{field_name} must be {'greater than' if not allow_zero else 'at least'} 0")
    return amount.quantize(Decimal("0.01"))


def _check_choice(value, allowed, field_name):
    if value not in allowed:
        raise ValueError(f"{field_name} must be one of: {', '.join(allowed)}")
    return value


def _money_out(value):
    """Decimal -> float so it can be returned as JSON."""
    return float(value) if value is not None else None


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)  # never store plaintext
    role = db.Column(db.String(20), nullable=False, default="customer")
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    subscriptions = db.relationship("Subscription", back_populates="customer", lazy=True)

    @validates("email")
    def validate_email(self, key, value):
        value = (value or "").strip().lower()
        if not EMAIL_REGEX.match(value):
            raise ValueError("Invalid email address")
        return value

    @validates("role")
    def validate_role(self, key, value):
        return _check_choice(value, USER_ROLES, "role")

    def set_password(self, password):
        if not password or len(password) < 6:
            raise ValueError("Password must be at least 6 characters")
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        # password_hash is deliberately left out
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# Product
# ---------------------------------------------------------------------------
class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(20), nullable=False, default="service")
    sales_price = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    cost_price = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    plans = db.relationship("Plan", back_populates="product", lazy=True,
                            cascade="all, delete-orphan")

    @validates("name")
    def validate_name(self, key, value):
        value = (value or "").strip()
        if not value:
            raise ValueError("Product name is required")
        return value

    @validates("type")
    def validate_type(self, key, value):
        return _check_choice(value, PRODUCT_TYPES, "type")

    @validates("sales_price", "cost_price")
    def validate_prices(self, key, value):
        return _to_money(value, key)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "sales_price": _money_out(self.sales_price),
            "cost_price": _money_out(self.cost_price),
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# Plan
# ---------------------------------------------------------------------------
class Plan(db.Model):
    __tablename__ = "plans"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    billing_cycle = db.Column(db.String(20), nullable=False, default="monthly")
    price = db.Column(db.Numeric(10, 2), nullable=False)
    min_quantity = db.Column(db.Integer, nullable=False, default=1)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    product = db.relationship("Product", back_populates="plans")
    subscriptions = db.relationship("Subscription", back_populates="plan", lazy=True)

    @validates("name")
    def validate_name(self, key, value):
        value = (value or "").strip()
        if not value:
            raise ValueError("Plan name is required")
        return value

    @validates("billing_cycle")
    def validate_cycle(self, key, value):
        return _check_choice(value, BILLING_CYCLES, "billing_cycle")

    @validates("price")
    def validate_price(self, key, value):
        return _to_money(value, "price")

    @validates("min_quantity")
    def validate_min_quantity(self, key, value):
        value = int(value)
        if value < 1:
            raise ValueError("min_quantity must be at least 1")
        return value

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "billing_cycle": self.billing_cycle,
            "price": _money_out(self.price),
            "min_quantity": self.min_quantity,
            "product_id": self.product_id,
            "is_active": self.is_active,
        }


# ---------------------------------------------------------------------------
# Subscription
# ---------------------------------------------------------------------------
class Subscription(db.Model):
    __tablename__ = "subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey("plans.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    status = db.Column(db.String(20), nullable=False, default="draft")
    start_date = db.Column(db.Date, nullable=False, default=lambda: utcnow().date())
    next_billing_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    customer = db.relationship("User", back_populates="subscriptions")
    plan = db.relationship("Plan", back_populates="subscriptions")
    invoices = db.relationship("Invoice", back_populates="subscription", lazy=True)

    @validates("status")
    def validate_status(self, key, value):
        return _check_choice(value, SUBSCRIPTION_STATUSES, "status")

    @validates("quantity")
    def validate_quantity(self, key, value):
        value = int(value)
        if value < 1:
            raise ValueError("quantity must be at least 1")
        return value

    @property
    def total_amount(self):
        """Amount billed each cycle: plan price x quantity."""
        return (self.plan.price * self.quantity).quantize(Decimal("0.01"))

    def calculate_next_billing_date(self, from_date=None):
        """Next billing date = from_date (or start date) + one billing cycle."""
        base = from_date or self.start_date
        return base + timedelta(days=CYCLE_DAYS[self.plan.billing_cycle])

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "plan_id": self.plan_id,
            "quantity": self.quantity,
            "status": self.status,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "next_billing_date": self.next_billing_date.isoformat() if self.next_billing_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
        }


# ---------------------------------------------------------------------------
# Invoice
# ---------------------------------------------------------------------------
def generate_invoice_number():
    return f"INV-{uuid.uuid4().hex[:8].upper()}"


class Invoice(db.Model):
    __tablename__ = "invoices"

    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(30), unique=True, nullable=False,
                               default=generate_invoice_number)
    subscription_id = db.Column(db.Integer, db.ForeignKey("subscriptions.id"), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="draft")
    issue_date = db.Column(db.Date, nullable=False, default=lambda: utcnow().date())
    due_date = db.Column(db.Date, nullable=False,
                         default=lambda: utcnow().date() + timedelta(days=14))
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    subscription = db.relationship("Subscription", back_populates="invoices")
    payments = db.relationship("Payment", back_populates="invoice", lazy=True)

    @validates("status")
    def validate_status(self, key, value):
        return _check_choice(value, INVOICE_STATUSES, "status")

    @validates("amount")
    def validate_amount(self, key, value):
        return _to_money(value, "amount", allow_zero=False)

    @property
    def amount_paid(self):
        total = sum((p.amount for p in self.payments if p.status == "completed"), Decimal("0"))
        return Decimal(total).quantize(Decimal("0.01"))

    @property
    def balance_due(self):
        return (self.amount - self.amount_paid).quantize(Decimal("0.01"))

    def to_dict(self):
        return {
            "id": self.id,
            "invoice_number": self.invoice_number,
            "subscription_id": self.subscription_id,
            "amount": _money_out(self.amount),
            "amount_paid": _money_out(self.amount_paid),
            "balance_due": _money_out(self.balance_due),
            "status": self.status,
            "issue_date": self.issue_date.isoformat() if self.issue_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
        }


# ---------------------------------------------------------------------------
# Payment
# ---------------------------------------------------------------------------
class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.id"), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    method = db.Column(db.String(20), nullable=False, default="card")
    status = db.Column(db.String(20), nullable=False, default="pending")
    transaction_ref = db.Column(db.String(100))  # id from a payment gateway (mock for MVP)
    paid_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    invoice = db.relationship("Invoice", back_populates="payments")

    @validates("method")
    def validate_method(self, key, value):
        return _check_choice(value, PAYMENT_METHODS, "method")

    @validates("status")
    def validate_status(self, key, value):
        return _check_choice(value, PAYMENT_STATUSES, "status")

    @validates("amount")
    def validate_amount(self, key, value):
        return _to_money(value, "amount", allow_zero=False)

    def to_dict(self):
        return {
            "id": self.id,
            "invoice_id": self.invoice_id,
            "amount": _money_out(self.amount),
            "method": self.method,
            "status": self.status,
            "transaction_ref": self.transaction_ref,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
        }