"""
Brightloop - Flask application entry point.

Run from the backend folder with:  python app.py
"""
import os
from datetime import timedelta

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp
# Import the existing db object (do NOT create a second SQLAlchemy instance).
# Importing the model classes also registers their tables with db,
# which is what lets db.create_all() find them.
from models import db, User, Product, Plan, Subscription, Invoice, Payment  # noqa: F401
from routes.products import products_bp
from routes.plans import plans_bp
from routes.subscriptions import subscriptions_bp
from routes.invoices import invoices_bp
from routes.payments import payments_bp
from routes.dashboard import dashboard_bp
# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "brightloop.db")

# ---------------------------------------------------------------------------
# App + configuration
# ---------------------------------------------------------------------------
app = Flask(__name__)

# SQLite database file stored at backend/brightloop.db
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# JWT: read the secret from the environment, fall back to a dev-only value.
# Always set JWT_SECRET_KEY to something long and random outside of development.
app.config["JWT_SECRET_KEY"] = os.environ.get(
    "JWT_SECRET_KEY", "dev-only-secret-change-me-in-production-32b"
)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)

# ---------------------------------------------------------------------------
# Extensions
# ---------------------------------------------------------------------------
db.init_app(app)   # connect the existing db object to this app
CORS(app)          # allow the frontend (a different port) to call this API
jwt = JWTManager(app)

# ---------------------------------------------------------------------------
# Create tables
# ---------------------------------------------------------------------------
# create_all() only creates tables that don't exist yet; it never alters
# existing ones. If you change a model later, delete brightloop.db and restart.
with app.app_context():
    db.create_all()

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Brightloop Backend is running!"})

# Register the authentication routes
app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(plans_bp)
app.register_blueprint(subscriptions_bp)
app.register_blueprint(invoices_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(dashboard_bp)
print(app.url_map)

# Start the server
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True) 