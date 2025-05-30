from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # autoriser requêtes JS

SCORE_FILE = "scores.json"

def load_scores():
    if not os.path.exists(SCORE_FILE):
        return []
    with open(SCORE_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_scores(scores):
    with open(SCORE_FILE, "w") as f:
        json.dump(scores, f, indent=2)

@app.route("/")
def home():
    return "🎮 API Tetris - Accède à /scores pour voir les scores."

@app.route("/scores", methods=["GET"])
def get_scores():
    scores = load_scores()
    scores = sorted(scores, key=lambda s: s["score"], reverse=True)
    return jsonify(scores[:10])  # top 10

@app.route("/scores", methods=["POST"])
def post_score():
    data = request.json
    if "name" not in data or "score" not in data:
        return jsonify({"error": "Invalid data"}), 400
    scores = load_scores()
    scores.append({"name": data["name"], "score": data["score"]})
    save_scores(scores)
    return jsonify({"message": "Score added"}), 201

if __name__ == "__main__":
    app.run(debug=True)
