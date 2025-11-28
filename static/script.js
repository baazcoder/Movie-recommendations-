// script.js
document.getElementById("recommend-btn").addEventListener("click", async () => {
  const movieSelect = document.getElementById("movie-select");
  const selectedMovie = movieSelect.value;

  const loading = document.getElementById("loading");
  const results = document.getElementById("results");
  const errorDiv = document.getElementById("error");
  const recommendationsList = document.getElementById("recommendations");
  const selectedMovieSpan = document.getElementById("selected-movie");

  // Reset
  results.classList.add("hidden");
  errorDiv.classList.add("hidden");
  loading.classList.remove("hidden");

  try {
    const response = await fetch("/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ movie: selectedMovie })
    });

    loading.classList.add("hidden");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch recommendations");
    }

    const data = await response.json();
    selectedMovieSpan.textContent = data.selected;

    recommendationsList.innerHTML = "";
    data.recommendations.forEach(rec => {
      const li = document.createElement("li");
      li.textContent = `- ${rec.title} (similarity: ${rec.similarity})`;
      recommendationsList.appendChild(li);
    });

    results.classList.remove("hidden");
  } catch (err) {
    errorDiv.textContent = "❗ " + err.message;
    errorDiv.classList.remove("hidden");
  }
});