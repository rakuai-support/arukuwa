"""
API Routes
"""
from app.routes.health import health_bp
from app.routes.session import session_bp
from app.routes.calculation import calculation_bp
from app.routes.goals import goals_bp
from app.routes.ai import ai_bp

__all__ = [
    "health_bp",
    "session_bp",
    "calculation_bp",
    "goals_bp",
    "ai_bp"
]
