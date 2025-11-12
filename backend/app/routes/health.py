"""
Health Check Route
"""
from flask import Blueprint, jsonify
from datetime import datetime

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint

    Returns:
        JSON response with server status
    """
    return jsonify({
        "success": True,
        "data": {
            "status": "healthy",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }), 200
