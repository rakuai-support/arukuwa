"""
Goal Model
"""
from datetime import datetime
from sqlalchemy import String, DateTime, Integer, Text, CheckConstraint, ForeignKey

from app.extensions import db


class Goal(db.Model):
    """Goal model for user action goals"""

    __tablename__ = "goals"

    id = db.Column(Integer, primary_key=True)
    goal_id = db.Column(
        String(50),
        unique=True,
        nullable=False
    )
    session_id = db.Column(
        String(36),
        ForeignKey("sessions.session_id", ondelete="CASCADE"),
        nullable=False
    )
    calculation_id = db.Column(
        String(50),
        ForeignKey("calculations.calculation_id", ondelete="SET NULL"),
        nullable=True
    )
    title = db.Column(String(200), nullable=False)
    description = db.Column(Text, nullable=True)
    category = db.Column(String(50), nullable=True)
    frequency = db.Column(String(50), nullable=True)
    status = db.Column(
        String(20),
        nullable=False,
        default="active"
    )
    progress = db.Column(
        Integer,
        nullable=False,
        default=0
    )
    start_date = db.Column(DateTime, nullable=True)
    completed_at = db.Column(DateTime, nullable=True)
    created_at = db.Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )
    updated_at = db.Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    session = db.relationship(
        "Session",
        back_populates="goals"
    )
    calculation = db.relationship(
        "Calculation",
        back_populates="goals"
    )

    # Constraints
    __table_args__ = (
        CheckConstraint('progress >= 0 AND progress <= 100', name='check_progress_range'),
        CheckConstraint(
            "status IN ('active', 'completed', 'archived', 'paused')",
            name='check_status_values'
        ),
    )

    def __repr__(self):
        return f"<Goal {self.goal_id}: {self.title}>"

    def to_dict(self):
        """Convert goal to dictionary"""
        return {
            "goal_id": self.goal_id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "frequency": self.frequency,
            "status": self.status,
            "progress": self.progress,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def mark_completed(self):
        """Mark goal as completed"""
        self.status = "completed"
        self.progress = 100
        self.completed_at = datetime.utcnow()

    def is_completed(self):
        """Check if goal is completed"""
        return self.status == "completed"
