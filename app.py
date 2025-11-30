from flask import Flask, render_template, jsonify, request
import pickle
import pandas as pd
import httpx

app = Flask(__name__, static_folder='static', template_folder='templates')

# Load data
movies_df = pd.read_pickle("movies.pkl")
with open("similarity.pkl", "rb") as f:
    similarity = pickle.load(f)

movie_titles = movies_df["title"].tolist()

# TMDB API Key
TMDB_API_KEY = "85a024e477abab988a19b7546497a3c5"

# HTTP Client (sync)
HTTP_CLIENT = httpx.Client(timeout=10.0)
MOVIE_CACHE = {}

def get_movie_details(title, year=None):
    cache_key = f"{title}_{year}"
    if cache_key in MOVIE_CACHE:
        return MOVIE_CACHE[cache_key]

    fallback = {
        "poster": "/static/no_poster.png",
        "overview": "No overview available.",
        "rating": 0.0,
        "trailer": "",
    }

    try:
        search_url = "https://api.themoviedb.org/3/search/movie"
        params = {"api_key": TMDB_API_KEY, "query": title}
        if year:
            params["year"] = year

        search_res = HTTP_CLIENT.get(search_url, params=params)
        results = search_res.json().get("results", [])

        if not results:
            return fallback

        movie = results[0]
        movie_id = movie.get("id")
        poster_path = movie.get("poster_path")
        poster = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else fallback["poster"]
        overview = movie.get("overview", fallback["overview"])
        rating = movie.get("vote_average", fallback["rating"])

        trailer = ""
        if movie_id:
            details_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
            params = {"api_key": TMDB_API_KEY, "append_to_response": "videos"}
            details_res = HTTP_CLIENT.get(details_url, params=params)
            details = details_res.json()
            for vid in details.get("videos", {}).get("results", []):
                if vid.get("site") == "YouTube" and vid.get("type") == "Trailer":
                    trailer = f"https://www.youtube.com/watch?v={vid['key']}"
                    break

        result = {"poster": poster, "overview": overview, "rating": rating, "trailer": trailer}
        MOVIE_CACHE[cache_key] = result
        return result

    except Exception as e:
        print("DETAILS ERROR:", e)
        return fallback

@app.route("/")
def home():
    return render_template("index.html", movies=movie_titles)

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        selected_movie = data.get("movie")
        if not selected_movie:
            return jsonify({"error": "No movie selected"}), 400
        if selected_movie not in movie_titles:
            return jsonify({"error": "Movie not found"}), 404

        idx = movies_df[movies_df["title"] == selected_movie].index[0]
        scores = list(enumerate(similarity[idx] * 100))
        top10 = sorted(scores, key=lambda x: x[1], reverse=True)[1:11]  # FIXED slicing

        recommendations = []
        for i, score in top10:
            movie_row = movies_df.iloc[i]
            title = movie_row["title"]
            release_date = str(movie_row.get("release_date", ""))
            year = int(release_date[:4]) if release_date and release_date[:4].isdigit() else None

            details = get_movie_details(title, year)
            recommendations.append({
                "title": title,
                "year": year if year else "Unknown",
                "poster": details.get("poster", "/static/no_poster.png"),
                "overview": details.get("overview", "No overview available."),
                "rating": details.get("rating", 0.0),
                "trailer": details.get("trailer", ""),
                "similarity": round(score, 2)
            })

        return jsonify({"selected": selected_movie, "recommendations": recommendations})

    except Exception as e:
        print("SERVER ERROR:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
