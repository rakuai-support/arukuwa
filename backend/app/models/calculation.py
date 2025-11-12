"""
Calculation Models
"""
from datetime import datetime
from sqlalchemy import String, DateTime, Integer, BigInteger, ForeignKey

from app.extensions import db


class Calculation(db.Model):
    """Calculation model for storing life plan calculations"""

    __tablename__ = "calculations"

    id = db.Column(Integer, primary_key=True)
    calculation_id = db.Column(
        String(50),
        unique=True,
        nullable=False
    )
    session_id = db.Column(
        String(36),
        ForeignKey("sessions.session_id", ondelete="CASCADE"),
        nullable=False
    )
    input_data = db.Column(
        db.JSON,
        nullable=False
    )
    result_data = db.Column(
        db.JSON,
        nullable=False
    )
    ai_analysis = db.Column(
        db.JSON,
        nullable=True
    )
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
        back_populates="calculations"
    )
    yearly_data = db.relationship(
        "CalculationYearlyData",
        back_populates="calculation",
        cascade="all, delete-orphan",
        order_by="CalculationYearlyData.year"
    )
    goals = db.relationship(
        "Goal",
        back_populates="calculation"
    )

    def __repr__(self):
        return f"<Calculation {self.calculation_id}>"

    def to_dict(self, include_yearly_data=False):
        """Convert calculation to dictionary"""
        data = {
            "calculation_id": self.calculation_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "input": self.input_data,
            "result": self.result_data,
            "ai_analysis": self.ai_analysis
        }

        if include_yearly_data:
            data["yearly_data"] = [yd.to_dict() for yd in self.yearly_data]

        return data


class CalculationYearlyData(db.Model):
    """Yearly data for calculations"""

    __tablename__ = "calculation_yearly_data"

    id = db.Column(Integer, primary_key=True)
    calculation_id = db.Column(
        String(50),
        ForeignKey("calculations.calculation_id", ondelete="CASCADE"),
        nullable=False
    )
    year = db.Column(Integer, nullable=False)
    age = db.Column(Integer, nullable=False)
    balance = db.Column(BigInteger, nullable=False)
    annual_income = db.Column(BigInteger, nullable=False)
    annual_expenses = db.Column(BigInteger, nullable=False)
    net_change = db.Column(BigInteger, nullable=False)

    # Relationships
    calculation = db.relationship(
        "Calculation",
        back_populates="yearly_data"
    )

    # Unique constraint for calculation_id and year
    __table_args__ = (
        db.UniqueConstraint('calculation_id', 'year', name='unique_calculation_year'),
    )

    def __repr__(self):
        return f"<CalculationYearlyData {self.calculation_id} - {self.year}>"

    def to_dict(self):
        """Convert yearly data to dictionary"""
        return {
            "year": self.year,
            "age": self.age,
            "balance": self.balance,
            "annual_income": self.annual_income,
            "annual_expenses": self.annual_expenses,
            "net_change": self.net_change
        }
