#!/usr/bin/env python3
"""
Simple startup script without Gunicorn - based on Polish instructions
"""
import os
import signal
import sys

# Ignore WINCH signal completely
signal.signal(signal.SIGWINCH, signal.SIG_IGN)

if __name__ == "__main__":
    print("🚀 Uruchamiam prostą wersję TOP-INSTAL Calculator")
    
    # Import and run the simple app
    from simple_main import app
    
    PORT = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=PORT, debug=False)