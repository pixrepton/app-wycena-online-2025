"""
API Routes for Heat Pump Calculator
"""
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os

from src.services.pdf_analyzer import pdf_analyzer

# Import for status checking
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    from groq import Groq
except ImportError:
    Groq = None

api_bp = Blueprint('api', __name__)

@api_bp.route('/analyze-pdf', methods=['POST'])
def analyze_pdf():
    """API endpoint for PDF analysis with AI"""
    try:
        current_app.logger.info("PDF analysis request received")
        
        # Check if PDF analyzer is available
        if not pdf_analyzer.is_available():
            current_app.logger.error("PDF analyzer service not available")
            return jsonify({
                'status': 'error',
                'error': 'Serwis analizy PDF nie jest dostępny. Sprawdź konfigurację GROQ_API_KEY.'
            }), 503
        
        # Check if file was uploaded - accept both 'file' and 'pdf_file' field names
        pdf_file = None
        if 'file' in request.files:
            pdf_file = request.files['file']
        elif 'pdf_file' in request.files:
            pdf_file = request.files['pdf_file']
        
        if pdf_file is None:
            return jsonify({
                'error': 'Nie przesłano pliku PDF',
                'status': 'error'
            }), 400
        
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
        current_app.logger.info(f"Processing PDF file: {filename}")
        
        # Process PDF with AI
        result = pdf_analyzer.process_pdf_file(pdf_file)
        
        if result['processing_status'] == 'success':
            current_app.logger.info("PDF analysis completed successfully")
            return jsonify({
                'status': 'success',
                'data': result,
                'message': 'Analiza PDF zakończona pomyślnie'
            })
        else:
            current_app.logger.error(f"PDF analysis failed: {result.get('error_message', 'Unknown error')}")
            return jsonify({
                'status': 'error',
                'error': result.get('error_message', 'Błąd analizy PDF'),
                'data': result
            }), 500
            
    except Exception as e:
        current_app.logger.error(f"PDF analysis endpoint error: {e}")
        return jsonify({
            'status': 'error',
            'error': f'Błąd serwera: {str(e)}'
        }), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Heat Pump Calculator API is running',
        'pdf_analyzer_available': pdf_analyzer.is_available(),
        'groq_api_configured': bool(pdf_analyzer.api_key)
    })

@api_bp.route('/pdf-status', methods=['GET'])
def pdf_status():
    """PDF analyzer status endpoint"""
    return jsonify({
        'pdf_analyzer_available': pdf_analyzer.is_available(),
        'groq_api_configured': bool(pdf_analyzer.api_key),
        'model': pdf_analyzer.model,
        'dependencies_ok': {
            'pypdf2': bool(PyPDF2),
            'groq': bool(Groq)
        }
    })