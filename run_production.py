#!/usr/bin/env python3
"""
Production runner dla TOP-INSTAL Calculator
Alternatywa dla Gunicorn która bypassa problemy z WINCH signals na Replit
"""
import os
import sys
import time
import signal
import logging
from main import app, pdf_analyzer

# Configure production logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [PROD] %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

def setup_signal_handlers():
    """Setup proper signal handling for Replit"""
    def signal_handler(signum, frame):
        logger.info(f"🛑 Received signal {signum}, shutting down gracefully...")
        sys.exit(0)
    
    # Ignore problematic signals
    signal.signal(signal.SIGWINCH, signal.SIG_IGN)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)
    
    # Handle shutdown signals gracefully
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

def main():
    setup_signal_handlers()
    
    PORT = int(os.environ.get("PORT", 5000))
    
    logger.info("🚀 PRODUCTION: TOP-INSTAL Calculator starting...")
    logger.info(f"📡 Port: {PORT}")
    logger.info(f"🤖 PDF Analyzer: {'✅ Available' if (pdf_analyzer and pdf_analyzer.is_available()) else '❌ Not Available'}")
    logger.info(f"🔧 Python: {sys.version}")
    
    try:
        # Use Waitress WSGI server for better stability
        try:
            from waitress import serve
            logger.info("🎯 Using Waitress WSGI server")
            serve(
                app,
                host='0.0.0.0',
                port=PORT,
                threads=4,
                cleanup_interval=30,
                channel_timeout=120
            )
        except ImportError:
            logger.warning("⚠️ Waitress not available, falling back to Flask dev server")
            # Fallback to Flask dev server with production settings
            app.run(
                host='0.0.0.0',
                port=PORT,
                debug=False,
                threaded=True,
                use_reloader=False,
                processes=1
            )
            
    except KeyboardInterrupt:
        logger.info("🛑 PRODUCTION: Shutdown by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"❌ PRODUCTION: Critical error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()