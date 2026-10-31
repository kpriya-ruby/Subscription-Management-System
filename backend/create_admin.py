"""
Brightloop - create a development admin account.

Run from the backend folder:   python create_admin.py

Safe to run more than once: it never creates a duplicate and never
changes an existing account.

FOR DEVELOPMENT ONLY. Do not use this password in a real deployment.
"""
from sqlalchemy.exc import IntegrityError

# Importing app gives us the SAME Flask app and the SAME database file
# (backend/brightloop.db) that the server uses. It does not start the server,
# because app.run() only happens when you run app.py directly.
from app import app
from models import db, User

ADMIN_NAME = "Brightloop Admin"
ADMIN_EMAIL = "admin@brightloop.com"
ADMIN_PASSWORD = "Admin@12345"


def create_admin():
    # Database access needs a Flask application context
    with app.app_context():
        existing = User.query.filter_by(email=ADMIN_EMAIL.lower()).first()

        if existing:
            print(f"No changes made: {ADMIN_EMAIL} already exists (role: {existing.role}).")
            if existing.role != "admin":
                print("Warning: that account is NOT an admin. "
                      "Delete it or change its role manually if you want it to be.")
            return

        admin = User(name=ADMIN_NAME, email=ADMIN_EMAIL, role="admin")
        admin.set_password(ADMIN_PASSWORD)  # stores a hash, never the plain password

        try:
            db.session.add(admin)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            print(f"No changes made: {ADMIN_EMAIL} already exists.")
            return

        print("Admin account created successfully.")
        print(f"  Email:    {ADMIN_EMAIL}")
        print(f"  Password: {ADMIN_PASSWORD}")
        print(f"  Role:     {admin.role}")


if __name__ == "__main__":
    create_admin()