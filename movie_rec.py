import streamlit as st
import pandas as pd
import pickle
from pathlib import Path

@st.cache_data
def load_data(pkl_name):
    path = Path(__file__).parent / pkl_name
    if not path.exists():
        st.error(f"❌ Missing file: {pkl_name} in {path.parent}")
        st.stop()
    with open(path, "rb") as f:
        return pickle.load(f)

# Load pickled dataframes
movies_df = load_data("movies.pkl")
similarity = load_data("similarity.pkl")  # should be a 2D numpy array

movie_titles = movies_df["title"].values

st.title("🎬 Movie Recommender System")

selected_movie = st.selectbox(
    "Choose a movie:",
    options=movie_titles,
    index=0
)

if st.button("Recommend"):
    idx = movies_df.index[movies_df["title"] == selected_movie][0]
    scores = list(enumerate(similarity[idx]))
    top5 = sorted(scores, key=lambda x: x[1], reverse=True)[1:6]
    
    rec_titles = [movies_df.iloc[i]["title"] for i, _ in top5]
    scores_display = [round(score, 3) for _, score in top5]

    st.subheader(f"Top 5 movies similar to **{selected_movie}**:")
    for title, score in zip(rec_titles, scores_display):
        st.write(f"- {title} (similarity: {score})")

    