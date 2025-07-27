"""
Main entry point for TOP-INSTAL Heat Pump Calculator
DevOps-optimized structure with absolute imports
"""
import os
import sys
import logging
from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add src directory to Python path - ONLY here, not in other files
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Debug info
logger.info(f"PYTHONPATH: {sys.path}")
logger.info(f"CWD: {os.getcwd()}")

def create_app():
    """Create and configure Flask application - moved from src/app.py"""
    app = Flask(__name__, static_folder='static', template_folder='templates')
    
    # Configuration
    app.secret_key = os.environ.get("SESSION_SECRET", "top-instal-calculator-2025")
    
    # Import PDF analyzer with proper error handling
    try:
        from src.services.pdf_analyzer import PDFAIAnalyzer
        pdf_analyzer = PDFAIAnalyzer()
        logger.info("✅ PDF Analyzer loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ PDF Analyzer not available: {e}")
        pdf_analyzer = None
    
    # Register API blueprint
    try:
        from src.api.routes import api_bp
        app.register_blueprint(api_bp, url_prefix='/api')
        logger.info("✅ API blueprint registered")
    except Exception as e:
        logger.error(f"❌ Failed to register API blueprint: {e}")
    
    return app, pdf_analyzer

# Create app instance for Gunicorn
app, pdf_analyzer = create_app()

# Main routes
@app.route('/')
def index():
    """Serve the main calculator page"""
    try:
        # Serve index.html from root directory
        index_path = os.path.join(app.root_path, 'index.html')
        logger.info(f"Looking for index.html at: {index_path}")
        
        if not os.path.exists(index_path):
            logger.error(f"index.html not found at {index_path}")
            # List files in root directory for debugging
            files = os.listdir(app.root_path)
            logger.info(f"Files in root directory: {files}")
            return f"Calculator not found. Files in directory: {files}", 404
            
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
        logger.info("Successfully served index.html")
        return content
    except Exception as e:
        logger.error(f"Error serving index.html: {e}")
        return f"Error loading calculator: {str(e)}", 500

@app.route('/<filename>.css')
def serve_css(filename):
    """Serve CSS files from root directory"""
    try:
        css_path = os.path.join(app.root_path, f"{filename}.css")
        if os.path.exists(css_path):
            with open(css_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'text/css; charset=utf-8'}
        else:
            return "CSS file not found", 404
    except Exception as e:
        logger.error(f"Error serving CSS {filename}: {e}")
        return f"Error serving CSS: {str(e)}", 500

@app.route('/<filename>.js')
def serve_js(filename):
    """Serve JS files from root directory"""
    try:
        js_path = os.path.join(app.root_path, f"{filename}.js")
        if os.path.exists(js_path):
            with open(js_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'application/javascript; charset=utf-8'}
        else:
            return "JS file not found", 404
    except Exception as e:
        logger.error(f"Error serving JS {filename}: {e}")
        return f"Error serving JS: {str(e)}", 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    static_dir = os.path.join(app.root_path, 'static')
    return send_from_directory(static_dir, filename)

# API routes
@app.route('/api/analyze-pdf', methods=['POST'])
def analyze_pdf():
    """API endpoint for PDF analysis with AI"""
    try:
        logger.info("PDF analysis request received")

        # Check if PDF analyzer is available
        if not pdf_analyzer or not pdf_analyzer.is_available():
            logger.error("PDF analyzer service not available")
            return jsonify({
                'status': 'error',
                'error': 'Serwis analizy PDF nie jest dostępny. Sprawdź konfigurację GROQ_API_KEY.'
            }), 503

        # Check if file was uploaded
        if 'pdf_file' not in request.files:
            return jsonify({
                'error': 'Nie przesłano pliku PDF',
                'status': 'error'
            }), 400

        pdf_file = request.files['pdf_file']

        # Validate file
        if pdf_file.filename == '':
            return jsonify({
                'error': 'Nie wybrano pliku',
                'status': 'error'
            }), 400

        if not pdf_file.filename or not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({
                'error': 'Dozwolone są tylko pliki PDF',
                'status': 'error'
            }), 400

        # Security: sanitize filename
        filename = secure_filename(pdf_file.filename)
        logger.info(f"Processing PDF file: {filename}")

        # Process PDF with AI
        result = pdf_analyzer.process_pdf_file(pdf_file)

        if result['processing_status'] == 'success':
            logger.info("PDF analysis completed successfully")
            return jsonify({
                'status': 'success',
                'data': result,
                'message': 'Analiza PDF zakończona pomyślnie'
            })
        else:
            logger.error(f"PDF analysis failed: {result.get('error_message', 'Unknown error')}")
            return jsonify({
                'status': 'error',
                'error': result.get('error_message', 'Błąd analizy PDF'),
                'data': result
            }), 500

    except Exception as e:
        logger.error(f"PDF analysis endpoint error: {e}")
        return jsonify({
            'status': 'error',
            'error': f'Błąd serwera: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def api_health():
    """API Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Heat Pump Calculator API is running',
        'pdf_analyzer_available': pdf_analyzer.is_available() if pdf_analyzer else False,
        'groq_api_configured': bool(pdf_analyzer.api_key) if pdf_analyzer else False
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'TOP-INSTAL Heat Pump Calculator',
        'pdf_analyzer': pdf_analyzer.is_available() if pdf_analyzer else False
    })

@app.route('/test')
def test():
    """Simple test endpoint"""
    return "<h1>TOP-INSTAL Calculator - Server działa!</h1><p>Port 5000 jest aktywny</p>"

if __name__ == '__main__':
    try:
        logger.info("🚀 Starting TOP-INSTAL Calculator...")
        # Use Flask development server instead of Gunicorn for debugging
        app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        sys.exit(1)