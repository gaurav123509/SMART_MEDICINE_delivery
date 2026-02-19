import os

from flask import Flask, jsonify, send_from_directory, abort, make_response
from flask_cors import CORS
from config import DevelopmentConfig
from db import init_db

from routes.auth_routes import auth
from routes.pharmacies_routes import pharmacies
from routes.medicines_routes import medicines
from routes.orders_routes import orders
from routes.seller_routes import seller
from routes.delivery_routes import delivery
from routes.admin_routes import admin
from routes.support_routes import support

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST_DIR = os.path.join(BASE_DIR, "..", "frontend", "dist")

app = Flask(__name__, static_folder=FRONTEND_DIST_DIR, static_url_path="/")
app.config.from_object(DevelopmentConfig)
CORS(app)
init_db()

# Register blueprints with prefixes
app.register_blueprint(auth, url_prefix='/auth')
app.register_blueprint(pharmacies, url_prefix='/pharmacies')
app.register_blueprint(medicines, url_prefix='/medicines')
app.register_blueprint(orders, url_prefix='/orders')
app.register_blueprint(seller, url_prefix='/seller')
app.register_blueprint(delivery, url_prefix='/delivery')
app.register_blueprint(admin, url_prefix='/admin')
app.register_blueprint(support, url_prefix='/support')


@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'Backend Running'})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    api_prefixes = ('auth', 'pharmacies', 'medicines', 'orders', 'seller', 'delivery', 'admin', 'support')
    if path.split('/')[0] in api_prefixes:
        abort(404)

    index_file = os.path.join(FRONTEND_DIST_DIR, 'index.html')
    if not os.path.exists(index_file):
        return (
            jsonify(
                {
                    'ok': False,
                    'message': 'Frontend build not found. Build frontend first.',
                    'required_file': index_file,
                    'steps': [
                        'cd frontend',
                        'npm install',
                        'npm run build',
                    ],
                }
            ),
            503,
        )

    if path and os.path.exists(os.path.join(app.static_folder, path)):
        response = make_response(send_from_directory(app.static_folder, path))
        # Fingerprinted asset files can be cached aggressively.
        if path.startswith('assets/'):
            response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        return response

    response = make_response(send_from_directory(app.static_folder, 'index.html'))
    # Avoid stale HTML so latest CSS/JS chunk filenames are always fetched.
    response.headers['Cache-Control'] = 'no-store'
    return response


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
