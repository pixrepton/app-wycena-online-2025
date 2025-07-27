#!/usr/bin/env python3
"""
WSGI entry point for Gunicorn - simplified version
Zgodnie z wytycznymi z dokumentacji użytkownika
"""
from main import app

# Simple WSGI callable for Gunicorn
application = app

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)