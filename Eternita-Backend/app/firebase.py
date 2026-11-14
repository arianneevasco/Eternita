import firebase_admin
from firebase_admin import credentials, firestore

from app.config import firebase_key_path

try:
    firebase_app = firebase_admin.get_app()
except ValueError:
    firebase_app = firebase_admin.initialize_app(
        credentials.Certificate(str(firebase_key_path()))
    )

db = firestore.client(app=firebase_app)