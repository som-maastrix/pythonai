"""
WSGI entry point for Gunicorn / production deployment.
Usage: gunicorn wsgi:app
"""
from devex_full.app import app

if __name__ == "__main__":
    app.run()
