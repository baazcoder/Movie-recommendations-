from flask import Flask, render_template, jsonify, request
import pickle
import pandas as pd
from pathlib import Path

app = Flask(__name__, static_folder='static', template_folder='templates')

# Load data once at startup
movies_df = pd.read_pickle("movies.pkl")
with open("similarity.pkl", "rb") as f:
    similarity = pickle.load(f)

movie_titles = movies_df["title"].tolist()

@app.route("/")
def home():
    return render_template("index.html", movies=movie_titles)

@app.route("/recommend", methods=["POST"])
def recommend():
    selected_movie = request.json.get("movie")
    if selected_movie not in movies_df["title"].values:
        return jsonify({"error": "Movie not found"}), 404

    idx = movies_df[movies_df["title"] == selected_movie].index[0]
    scores = list(enumerate(similarity[idx]))
    top5 = sorted(scores, key=lambda x: x[1], reverse=True)[1:6]

    recommendations = []
    for i, score in top5:
        title = movies_df.iloc[i]["title"]
        recommendations.append({"title": title, "similarity": round(score, 3)})

    return jsonify({
        "selected": selected_movie,
        "recommendations": recommendations
    })

if __name__ == "__main__":
    app.run(debug=True)