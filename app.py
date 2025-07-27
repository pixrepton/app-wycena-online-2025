"""
Main Flask Application Factory
"""
from flask import Flask
import logging
import os

from src.config import config
from src.api.routes import api_bp
from src.services.pdf_analyzer import pdf_analyzer


def create_app(config_name=None):
    """Create and configure Flask application"""

    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')

    app = Flask(__name__, static_folder='../static', template_folder='../templates')

    try:
        # Load configuration
        app.config.from_object(config[config_name])
        config[config_name].init_app(app)

        # Configure logging
        logging.basicConfig(
            level=getattr(logging, app.config.get('LOG_LEVEL', 'INFO')),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )

        # Initialize services with graceful fallback
        try:
            pdf_analyzer.init_app(app)
            app.logger.info("✅ PDF Analyzer service initialized")
        except Exception as e:
            app.logger.warning(f"⚠️ PDF Analyzer initialization failed: {e}")
            app.logger.info("🔄 Calculator will work in basic mode without AI analysis")

        # Register blueprints
        app.register_blueprint(api_bp, url_prefix='/api')

        # Register main routes
        from src.main.routes import main_bp
        app.register_blueprint(main_bp)

        # Add health check route
        @app.route('/health')
        def health_check():
            return {
                'status': 'healthy',
                'service': 'TOP-INSTAL Heat Pump Calculator',
                'config': config_name,
                'pdf_analyzer': pdf_analyzer.is_available()
            }

        app.logger.info(f"✅ TOP-INSTAL Calculator created with config: {config_name}")

    except Exception as e:
        app.logger.error(f"❌ Critical error during app creation: {e}")
        raise

    return app