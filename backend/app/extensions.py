"""
Flask Extensions

Initialize extensions separately to avoid circular imports
"""
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

# SQLAlchemy instance
db = SQLAlchemy()

# Marshmallow instance
ma = Marshmallow()
