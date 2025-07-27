"""
Main application routes
"""
from flask import Blueprint, render_template, send_from_directory, current_app
import os

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Serve the main calculator page"""
    try:
        # Serve index.html from root directory
        index_path = os.path.join(current_app.root_path, '..', 'index.html')
        with open(index_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        current_app.logger.error("index.html not found")
        return "Calculator not found", 404

@main_bp.route('/<filename>.css')
def serve_css(filename):
    """Serve CSS files from root directory"""
    try:
        css_path = os.path.join(current_app.root_path, '..', f"{filename}.css")
        if os.path.exists(css_path):
            with open(css_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'text/css; charset=utf-8'}
        else:
            return "CSS file not found", 404
    except Exception as e:
        current_app.logger.error(f"Error serving CSS {filename}: {e}")
        return f"Error serving CSS: {str(e)}", 500

@main_bp.route('/<filename>.js')
def serve_js(filename):
    """Serve JS files from root directory"""
    try:
        js_path = os.path.join(current_app.root_path, '..', f"{filename}.js")
        if os.path.exists(js_path):
            with open(js_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'application/javascript; charset=utf-8'}
        else:
            return "JS file not found", 404
    except Exception as e:
        current_app.logger.error(f"Error serving JS {filename}: {e}")
        return f"Error serving JS: {str(e)}", 500

@main_bp.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    static_dir = os.path.join(current_app.root_path, '..', 'static')
    return send_from_directory(static_dir, filename)