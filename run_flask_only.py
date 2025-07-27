#!/usr/bin/env python3
"""
Flask-only startup script - no Gunicorn, no SIGWINCH issues
Based on Polish instructions for simplified Replit workflow
"""
import os
import sys
import signal
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [FLASK] %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

def setup_signals():
    """Setup signal handling for clean Replit operation"""
    signal.signal(signal.SIGWINCH, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)
    logger.info("✅ Signals configured - WINCH ignored")

def main():
    """Main entry point"""
    setup_signals()
    
    print("🚀 TOP-INSTAL Calculator - Flask Direct Mode")
    logger.info("Starting simplified Flask application without Gunicorn")
    
    # Import the main app (with all features)
    try:
        from main import app
        logger.info("✅ Main application imported successfully")
    except Exception as e:
        logger.error(f"❌ Failed to import main app: {e}")
        # Fallback to simple app
        from simple_main import app
        logger.info("✅ Using simplified application as fallback")
    
    # Start Flask development server
    PORT = int(os.environ.get("PORT", 5000))
    logger.info(f"🌐 Starting on 0.0.0.0:{PORT}")
    
    try:
        app.run(
            host="0.0.0.0", 
            port=PORT, 
            debug=False,  # Disable debug to prevent reload issues
            threaded=True,
            use_reloader=False  # Prevent SIGWINCH issues
        )
    except Exception as e:
        logger.error(f"❌ Server startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()