"""
Brightloop - authentication routes.

POST /api/register  -> create a customer account
POST /api/login     -> verify credentials and return a JWT access token
"""
import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError

from models import db, User

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

SPECIAL_CHARS = r"""!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def error(message, status):
    return jsonify({"error": message}), status


def validate_password(password):
    """Return an error message if the password is weak, otherwise None."""
    if len(password) <= 8:
        return "Password must be longer than 8 characters"
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"
    if not re.search(f"[{SPECIAL_CHARS}]", password):
        return "Password must contain at least one special character"
    return None


# ---------------------------------------------------------------------------
# POST /api/register
# ---------------------------------------------------------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON", 400)

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # All three fields are required and must be text
    if not all(isinstance(v, str) and v.strip() for v in (name, email, password)):
        return error("name, email and password are required", 400)

    name = name.strip()
    email = email.strip().lower()

    if len(name) > 100:
        return error("Name must be 100 characters or fewer", 400)
    if len(email) > 120:
        return error("Email must be 120 characters or fewer", 400)

    password_problem = validate_password(password)
    if password_problem:
        return error(password_problem, 400)

    if User.query.filter_by(email=email).first():
        return error("An account with this email already exists", 409)

    try:
        # The "role" field in the request is deliberately ignored:
        # public registration can only ever create customers.
        user = User(name=name, email=email, role="customer")
        user.set_password(password)
    except ValueError as e:  # e.g. invalid email format from the model
        return error(str(e), 400)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        # Two people registering the same email at the same moment
        db.session.rollback()
        return error("An account with this email already exists", 409)

    return jsonify({
        "message": "Registration successful",
        "user": user.to_dict(),
    }), 201


# ---------------------------------------------------------------------------
# POST /api/login
# ---------------------------------------------------------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON", 400)

    email = data.get("email")
    password = data.get("password")

    if not all(isinstance(v, str) and v.strip() for v in (email, password)):
        return error("email and password are required", 400)

    user = User.query.filter_by(email=email.strip().lower()).first()

    # Same message for "no such user" and "wrong password" so that
    # attackers can't tell which emails are registered.
    if user is None or not user.check_password(password):
        return error("Invalid email or password", 401)

    if not user.is_active:
        return error("This account has been deactivated", 403)

    # JWT identity must be a string; the role is added as an extra claim
    # so later routes can check permissions without another database query.
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role},
    )

    return jsonify({
        "message": "Login successful",
        "access_token": token,
        "user": user.to_dict(),  # never includes password_hash
    }), 200