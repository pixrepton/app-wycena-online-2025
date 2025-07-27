
"""
Debug endpoints for TOP-INSTAL Calculator troubleshooting
"""
from flask import Blueprint, jsonify, request
import os
import sys

debug_bp = Blueprint('debug', __name__)

@debug_bp.route('/debug/info')
def debug_info():
    """Comprehensive debug information"""
    return jsonify({
        'python_version': sys.version,
        'python_path': sys.path[:3],  # First 3 entries
        'cwd': os.getcwd(),
        'env_vars': {
            'GROQ_API_KEY': 'SET' if os.environ.get('GROQ_API_KEY') else 'NOT_SET',
            'FLASK_ENV': os.environ.get('FLASK_ENV', 'not_set'),
            'PORT': os.environ.get('PORT', 'not_set')
        },
        'files_exist': {
            'index.html': os.path.exists('index.html'),
            'main.py': os.path.exists('main.py'),
            'kalkulator_style.css': os.path.exists('kalkulator_style.css')
        }
    })

@debug_bp.route('/debug/test-ai')
def test_ai():
    """Test AI service availability"""
    try:
        from src.services.pdf_analyzer import pdf_analyzer
        return jsonify({
            'ai_available': pdf_analyzer.is_available(),
            'groq_key': 'SET' if os.environ.get('GROQ_API_KEY') else 'NOT_SET'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
