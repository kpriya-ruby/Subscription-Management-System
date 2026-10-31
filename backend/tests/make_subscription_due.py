from app import app
from models import db, Subscription
from datetime import date

with app.app_context():
    subscription = db.session.get(Subscription, 1)

    if subscription:
        subscription.next_billing_date = date.today()
        db.session.commit()
        print("Subscription marked as due today!")
    else:
        print("Subscription not found!")