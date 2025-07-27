"""
New main entry point for gunicorn
"""
import os
import sys

# Add src directory to Python path  
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.app import create_app

# Create app instance for gunicorn
app = create_app()