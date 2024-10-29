# administrator/admin_server.py

import os
import random
import string
import json
from flask import Flask, render_template, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__, template_folder='web_ui', static_folder='web_ui')

# Pfad zur Firebase-Service-Account-Schlüsseldatei
SERVICE_ACCOUNT_PATH = os.path.join(os.getcwd(), 'config', 'serviceAccountKey.json')

# Firebase initialisieren
cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)
db = firestore.client()

def generate_token(length=12):
    """Generiert ein zufälliges Token im Format 'xxxx-xxxx-xxxx'."""
    characters = string.ascii_lowercase + string.digits
    segments = [''.join(random.choices(characters, k=4)) for _ in range(3)]
    return '-'.join(segments)

@app.route('/')
def index():
    return render_template('admin.html')

@app.route('/start_game', methods=['POST'])
def start_game():
    data = request.form
    template_name = data.get('template')
    difficulty = data.get('difficulty', 'normal')
    timer = int(data.get('timer', 60))  # Standard 60 Minuten

    # Pfad zum ausgewählten Template
    template_path = os.path.join(os.getcwd(), 'templates_json', f"{template_name}.json")
    if not os.path.exists(template_path):
        return jsonify({'status': 'error', 'message': 'Template nicht gefunden.'}), 400

    # Template auslesen
    with open(template_path, 'r') as f:
        template_data = json.load(f)

    # Token generieren
    token = generate_token()

    # Daten für Firebase
    session_data = {
        'token': token,
        'template': template_name,
        'template_data': template_data,
        'settings': {
            'difficulty': difficulty,
            'timer': timer  # Minuten
        },
        'created_at': firestore.SERVER_TIMESTAMP,
        'progress_updates': {}
    }

    # In Firebase speichern
    try:
        db.collection('game_sessions').document(token).set(session_data)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

    return jsonify({'status': 'success', 'token': token}), 200

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
