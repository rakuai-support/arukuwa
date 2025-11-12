"""
Session Model
"""
import uuid
from datetime import datetime, timedelta
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy import String, DateTime, Integer

from app.extensions import db


class Session(db.Model):
    """Session model for anonymous user tracking"""

    __tablename__ = "sessions"

    id = db.Column(Integer, primary_key=True)
    session_id = db.Column(
        String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4())
    )
    created_at = db.Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )
    last_accessed = db.Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    expires_at = db.Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.utcnow() + timedelta(days=1)
    )
    client_info = db.Column(
        db.JSON if db.engine.name != 'postgresql' else JSONB,
        nullable=True
    )

    # Relationships
    calculations = db.relationship(
        "Calculation",
        back_populates="session",
        cascade="all, delete-orphan"
    )
    goals = db.relationship(
        "Goal",
        back_populates="session",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Session {self.session_id}>"

    def to_dict(self):
        """Convert session to dictionary"""
        return {
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_accessed": self.last_accessed.isoformat() if self.last_accessed else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "has_calculations": len(self.calculations) > 0,
            "has_goals": len(self.goals) > 0
        }

    @property
    def is_expired(self):
        """Check if session is expired"""
        return datetime.utcnow() > self.expires_at

    def extend_expiry(self, hours=24):
        """Extend session expiry"""
        self.expires_at = datetime.utcnow() + timedelta(hours=hours)
        self.last_accessed = datetime.utcnow()
