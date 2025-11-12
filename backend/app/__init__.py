"""
Flask Application Factory
"""
from flask import Flask
from flask_cors import CORS
from flask_session import Session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman

from config import get_config
from app.extensions import db, ma


def create_app(config_name=None):
    """
    Application factory pattern

    Args:
        config_name: Configuration name (development, production, testing)

    Returns:
        Flask application instance
    """
    app = Flask(__name__)

    # Load configuration
    if config_name:
        from config import config as config_dict
        app.config.from_object(config_dict[config_name])
    else:
        app.config.from_object(get_config())

    # Initialize extensions
    init_extensions(app)

    # Register blueprints
    register_blueprints(app)

    # Register error handlers
    register_error_handlers(app)

    # Create database tables
    with app.app_context():
        db.create_all()

    return app


def init_extensions(app):
    """Initialize Flask extensions"""

    # Database
    db.init_app(app)
    ma.init_app(app)

    # CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config["CORS_ORIGINS"],
            "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })

    # Session
    Session(app)

    # Rate Limiting
    Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=[app.config["RATELIMIT_DEFAULT"]],
        storage_uri=app.config["RATELIMIT_STORAGE_URL"]
    )

    # Security headers (disabled in development for easier testing)
    if not app.config["DEBUG"]:
        csp = {
            'default-src': "'self'",
            'script-src': ["'self'", "https://cdn.jsdelivr.net"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", "data:", "https:"],
            'connect-src': [
                "'self'",
                "https://generativelanguage.googleapis.com"
            ],
            'font-src': [
                "'self'",
                "https://fonts.googleapis.com",
                "https://fonts.gstatic.com"
            ]
        }
        Talisman(app, content_security_policy=csp)


def register_blueprints(app):
    """Register application blueprints"""

    from app.routes.health import health_bp
    from app.routes.session import session_bp
    from app.routes.calculation import calculation_bp
    from app.routes.goals import goals_bp
    from app.routes.ai import ai_bp

    # Register blueprints with /api/v1 prefix
    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(session_bp, url_prefix="/api/v1")
    app.register_blueprint(calculation_bp, url_prefix="/api/v1")
    app.register_blueprint(goals_bp, url_prefix="/api/v1")
    app.register_blueprint(ai_bp, url_prefix="/api/v1")


def register_error_handlers(app):
    """Register error handlers"""

    from flask import jsonify

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "error": {
                "code": "BAD_REQUEST",
                "message": "リクエストが不正です"
            }
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": "リソースが見つかりません"
            }
        }), 404

    @app.errorhandler(429)
    def ratelimit_handler(error):
        return jsonify({
            "success": False,
            "error": {
                "code": "RATE_LIMIT_EXCEEDED",
                "message": "リクエスト制限を超えました。しばらく待ってから再試行してください"
            }
        }), 429

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "サーバーエラーが発生しました"
            }
        }), 500
