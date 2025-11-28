# movie-recommender
# Movie Recommendation Web App 🎬

This is a movie‑recommendation web application built using the TMDB dataset. The app allows users to search for movies, view details, and get recommendations for similar movies.  

## 📂 Project Structure

- `tmdb_5000_movies.csv` — Dataset containing movie metadata.  
- `tmdb_5000_credits.csv` — Dataset containing cast/crew/credits metadata.  
- `static/style.css` — CSS for front‑end styling (web interface).  
- `templates/index.html` — HTML template for the main web page.  
- `app.py` (or main script) — Backend logic for recommendation + web server.  
- Other code files and configuration files required to run the app.  

> **Important:** The pre‑computed model file `similarity.pkl` is *not* included in this repository (too large for GitHub).

---

## 📥 Download the Model File

Because `similarity.pkl` is large, it’s stored separately.  
Download it from the following link:  

**[Download similarity.pkl (Google Drive)](https://drive.google.com/file/d/1b4nZknW3tvm4GZRK7OZ1i3Mkl6GzY834/view?usp=drive_link)**

After downloading, place the `similarity.pkl` file inside the project root folder (same level as `app.py`) before running the app.  

---

## ⚙️ Setup & Run

1. Clone this repository  
   ```bash
   git clone https://github.com/baazcoder/MovieRecommendation.git
   cd MovieRecommendation

