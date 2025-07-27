
#!/usr/bin/env python3
"""
WINCH-proof startup script dla TOP-INSTAL Calculator
Blokuje wszystkie problematyczne sygnały przed startem Gunicorn
"""
import os
import sys
import signal
import subprocess
import time

def disable_all_winch():
    """Totalnie wyłącz WINCH na poziomie procesu"""
    print("🛡️ Disabling WINCH signals globally...")
    
    # Ignoruj WINCH
    signal.signal(signal.SIGWINCH, signal.SIG_IGN)
    
    # Ustaw zmienne środowiskowe
    os.environ['REPLIT_DISABLE_WINCH'] = '1'
    os.environ['PYTHONUNBUFFERED'] = '1'
    os.environ['GUNICORN_NO_WINCH'] = '1'
    
    # Dodaj do PYTHONPATH
    current_dir = os.path.dirname(os.path.abspath(__file__))
    src_dir = os.path.join(current_dir, 'src')
    os.environ['PYTHONPATH'] = f"{src_dir}:{current_dir}:{os.environ.get('PYTHONPATH', '')}"
    
    print("✅ WINCH protection activated")

def main():
    print("🚀 TOP-INSTAL Calculator - WINCH-FREE Startup")
    
    # Wyłącz WINCH globalnie
    disable_all_winch()
    
    # Krótkie opóźnienie dla stabilności
    time.sleep(2)
    
    print("🎯 Starting Gunicorn with WINCH protection...")
    
    # Uruchom Gunicorn z zabezpieczeniem
    cmd = [
        'gunicorn',
        '-c', 'gunicorn.conf.py',
        'main:app'
    ]
    
    try:
        # Uruchom z wyłączonym WINCH
        result = subprocess.run(cmd, env=os.environ)
        sys.exit(result.returncode)
    except KeyboardInterrupt:
        print("🛑 Graceful shutdown")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
