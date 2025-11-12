"""
Session Management Routes
"""
from flask import Blueprint, jsonify, request
import uuid
from datetime import datetime, timedelta

from app.extensions import db
from app.models import Session

session_bp = Blueprint("session", __name__)


@session_bp.route("/session", methods=["POST"])
def create_session():
    """
    Create a new session

    Request Body:
        {
            "client_info": {
                "user_agent": "string",
                "screen_width": int,
                "screen_height": int
            }
        }

    Returns:
        JSON response with session_id and expiry
    """
    try:
        data = request.get_json() or {}
        client_info = data.get("client_info")

        # Create new session
        new_session = Session(
            session_id=str(uuid.uuid4()),
            client_info=client_info,
            expires_at=datetime.utcnow() + timedelta(days=1)
        )

        db.session.add(new_session)
        db.session.commit()

        return jsonify({
            "success": True,
            "data": {
                "session_id": new_session.session_id,
                "expires_at": new_session.expires_at.isoformat() + "Z"
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": {
                "code": "SESSION_CREATE_ERROR",
                "message": "セッションの作成に失敗しました"
            }
        }), 500


@session_bp.route("/session/<session_id>", methods=["GET"])
def get_session(session_id):
    """
    Get session information

    Args:
        session_id: Session ID

    Returns:
        JSON response with session data
    """
    try:
        session = Session.query.filter_by(session_id=session_id).first()

        if not session:
            return jsonify({
                "success": False,
                "error": {
                    "code": "SESSION_NOT_FOUND",
                    "message": "セッションが見つかりません"
                }
            }), 404

        # Check if session is expired
        if session.is_expired:
            return jsonify({
                "success": False,
                "error": {
                    "code": "SESSION_EXPIRED",
                    "message": "セッションの有効期限が切れています"
                }
            }), 401

        # Update last accessed time
        session.last_accessed = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "success": True,
            "data": session.to_dict()
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "内部エラーが発生しました"
            }
        }), 500


@session_bp.route("/session/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    """
    Delete a session and all associated data

    Args:
        session_id: Session ID

    Returns:
        JSON response
    """
    try:
        session = Session.query.filter_by(session_id=session_id).first()

        if not session:
            return jsonify({
                "success": False,
                "error": {
                    "code": "SESSION_NOT_FOUND",
                    "message": "セッションが見つかりません"
                }
            }), 404

        # Delete session (cascade will delete related data)
        db.session.delete(session)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "セッションを削除しました"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "内部エラーが発生しました"
            }
        }), 500
