
bind = "0.0.0.0:5000"
workers = 1
timeout = 90
worker_class = "sync"

def on_starting(server):
    import signal
    server.log.info("🔒 Ignoring WINCH")
    signal.signal(signal.SIGWINCH, signal.SIG_IGN)
