"""
Simplified Flask app for TOP-INSTAL Calculator
Based on Polish instructions for clean Replit setup
"""
import os
from flask import Flask, send_from_directory, jsonify

app = Flask(__name__)

@app.route("/")
def hello():
    """Main page - serve index.html or fallback"""
    try:
        index_path = os.path.join(app.root_path, 'index.html')
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            return "✅ Wycena 2025 działa poprawnie!"
    except Exception as e:
        return f"✅ Wycena 2025 działa poprawnie! (Błąd ładowania: {str(e)})"

@app.route('/<filename>.css')
def serve_css(filename):
    """Serve CSS files"""
    try:
        css_path = os.path.join(app.root_path, f"{filename}.css")
        if os.path.exists(css_path):
            with open(css_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'text/css; charset=utf-8'}
        return "CSS not found", 404
    except Exception:
        return "CSS error", 500

@app.route('/<filename>.js')
def serve_js(filename):
    """Serve JS files"""
    try:
        js_path = os.path.join(app.root_path, f"{filename}.js")
        if os.path.exists(js_path):
            with open(js_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'application/javascript; charset=utf-8'}
        return "JS not found", 404
    except Exception:
        return "JS error", 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    static_dir = os.path.join(app.root_path, 'static')
    return send_from_directory(static_dir, filename)

@app.route('/health')
def health():
    """Health check"""
    return jsonify({'status': 'healthy', 'service': 'TOP-INSTAL Calculator'})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Uruchamiam TOP-INSTAL Calculator na porcie {port}")
    app.run(host="0.0.0.0", port=port, debug=True)