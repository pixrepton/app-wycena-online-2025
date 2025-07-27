"""
Application Configuration
"""
import os
from pathlib import Path

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get("SESSION_SECRET", "top-instal-calculator-2025")
    DEBUG = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    
    # API Keys - with fallback handling
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    
    # Validate critical environment variables
    @classmethod
    def validate_environment(cls):
        """Validate required environment variables"""
        missing = []
        if not cls.GROQ_API_KEY:
            missing.append("GROQ_API_KEY")
        
        if missing:
            print(f"⚠️  Missing environment variables: {', '.join(missing)}")
            print("   PDF analysis functionality will be disabled")
        
        return len(missing) == 0
    
    # Application Settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file upload
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../uploads')
    
    # Logging
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    
    # Deployment settings
    HOST = os.environ.get("HOST", "0.0.0.0")
    PORT = int(os.environ.get("PORT", 5000))
    
    @staticmethod
    def init_app(app):
        """Initialize application with this config"""
        try:
            # Ensure upload folder exists
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
            app.logger.info(f"✅ Upload folder created: {Config.UPLOAD_FOLDER}")
        except Exception as e:
            app.logger.warning(f"⚠️ Could not create upload folder: {e}")

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}