
#!/usr/bin/env python3
"""
TOP-INSTAL Heat Pump Calculator - Main Application Entry Point
Consolidated Flask app with all functionality
"""
import os
import sys
import logging
from flask import Flask, render_template, send_from_directory, jsonify, request

# Add src directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(current_dir, 'src')
sys.path.insert(0, src_dir)

# Import nowych modułów zgodnie z README-WYCENA2025-v2
try:
    from backend_python.api.cieplo import register_cieplo_routes
except ImportError:
    register_cieplo_routes = None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.environ.get("SESSION_SECRET", "top-instal-calculator-2025")

# Initialize PDF analyzer
pdf_analyzer = None
try:
    from src.services.pdf_analyzer import PDFAIAnalyzer
    pdf_analyzer = PDFAIAnalyzer()
    logger.info("✅ PDF Analyzer loaded successfully")
except Exception as e:
    logger.warning(f"⚠️ PDF Analyzer not available: {e}")

# Routes
@app.route("/")
def index():
    """Main calculator page"""
    try:
        return render_template('index.html')
    except:
        # Fallback to serve from root directory
        return send_from_directory('.', 'index.html')

@app.route("/ping")
def ping():
    """Ultra-lightweight health check for port detection"""
    return "OK", 200

@app.route("/api/health")
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "TOP-INSTAL Calculator",
        "pdf_analyzer": pdf_analyzer is not None and pdf_analyzer.is_available() if pdf_analyzer else False
    }), 200

@app.route("/api/analyze-pdf", methods=['POST'])
def analyze_pdf():
    """PDF analysis endpoint"""
    if not pdf_analyzer or not pdf_analyzer.is_available():
        return jsonify({
            "status": "error",
            "message": "PDF analyzer not available"
        }), 503
    
    try:
        # Get file from request
        if 'file' not in request.files:
            return jsonify({
                "status": "error", 
                "message": "No file uploaded"
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                "status": "error",
                "message": "No file selected"
            }), 400
        
        # Analyze PDF
        result = pdf_analyzer.analyze_pdf(file)
        
        return jsonify({
            "status": "success",
            "data": result
        }), 200
        
    except Exception as e:
        logger.error(f"❌ PDF analysis error: {e}")
        return jsonify({
            "status": "error",
            "message": f"Analysis failed: {str(e)}"
        }), 500

@app.route("/test")
def test():
    """Test endpoint"""
    return jsonify({
        "message": "TOP-INSTAL Calculator API is working!",
        "pdf_analyzer_available": pdf_analyzer is not None and pdf_analyzer.is_available() if pdf_analyzer else False
    }), 200

# Static file serving
@app.route('/<path:filename>')
def serve_static_files(filename):
    """Serve static files from root directory"""
    if filename.endswith('.js'):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'application/javascript; charset=utf-8'}
        except:
            return "File not found", 404
    elif filename.endswith('.css'):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'text/css; charset=utf-8'}
        except:
            return "File not found", 404
    else:
        return send_from_directory('.', filename)

# Register new API routes zgodnie z README-WYCENA2025-v2
if register_cieplo_routes:
    register_cieplo_routes(app)
    logger.info("✅ Cieplo API routes registered")

if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 5000))
    logger.info(f"🚀 Starting TOP-INSTAL Calculator on port {PORT}")
    logger.info(f"🤖 PDF Analyzer: {'✅ Available' if (pdf_analyzer and pdf_analyzer.is_available()) else '❌ Not Available'}")
    
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=False,
        threaded=True
    )
