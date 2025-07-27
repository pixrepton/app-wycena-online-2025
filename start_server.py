#!/usr/bin/env python3
"""
Alternatywny start script dla Replit z sleep delay
Eliminuje problemy z wykrywaniem portu przez dodanie opóźnienia
"""
import time
import subprocess
import sys
import os

def main():
    print("🔊 START_SERVER: Sleep 3 sekundy przed startem Gunicorn...")
    time.sleep(3)
    
    print("🚀 START_SERVER: Uruchamiam Gunicorn z konfiguracją...")
    
    # Zmienne środowiskowe dla Gunicorn
    env = os.environ.copy()
    env['PYTHONPATH'] = '/home/runner/workspace/src:/home/runner/workspace'
    
    # Uruchom Gunicorn z konfiguracją
    cmd = ['gunicorn', '-c', 'gunicorn.conf.py', 'main:app']
    
    try:
        result = subprocess.run(cmd, env=env)
        sys.exit(result.returncode)
    except KeyboardInterrupt:
        print("🛑 START_SERVER: Przerwano przez użytkownika")
        sys.exit(0)
    except Exception as e:
        print(f"❌ START_SERVER: Błąd: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()