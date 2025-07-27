from flask import Flask
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "intelligent-calculator-key")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)