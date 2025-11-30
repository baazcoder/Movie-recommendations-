// static/script.js

// Global variable to store the original, unfiltered list of recommendations
let currentRecommendations = [];

/**
 * Display error messages
 */
function displayError(message) {
    const errorDiv = document.getElementById("error");
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
}

$(document).ready(function() {

    // Initialize Select2 for movie selection
    $('#movie-select').select2({
        placeholder: "Search for a movie...",
        allowClear: true,
        width: '100%'
    });

    const recommendBtn = document.getElementById("recommend-btn");
    const loading = document.getElementById("loading");
    const results = document.getElementById("results");
    const listContainer = document.getElementById("recommendations");
    const selectedMovieDisplay = document.getElementById("selected-movie");

    // Trailer Modal
    const trailerModalElement = document.getElementById('trailerModal');
    const iframeContainer = document.getElementById('trailer-iframe-container');

    // Recommend button click
    recommendBtn.addEventListener("click", async () => {
        const movie = $('#movie-select').val();
        if (!movie) {
            alert("Please select a movie.");
            return;
        }

        results.classList.add("hidden");
        document.getElementById("error").classList.add("hidden");
        loading.classList.remove("hidden");
        listContainer.innerHTML = "";
        currentRecommendations = [];

        try {
            const res = await fetch("/recommend", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ movie })
            });

            loading.classList.add("hidden");

            if (!res.ok) {
                const contentType = res.headers.get("content-type");
                let errorText = `Server returned status ${res.status}.`;

                if (contentType && contentType.includes("application/json")) {
                    const err = await res.json();
                    errorText = err.error || errorText;
                } else {
                    const rawText = await res.text();
                    console.error("Server Crash Response:", rawText);
                    errorText += " The server crashed.";
                }
                throw new Error(errorText);
            }

            const data = await res.json();
            selectedMovieDisplay.textContent = data.selected;
            currentRecommendations = data.recommendations;
            renderRecommendations(currentRecommendations);
            results.classList.remove("hidden");

        } catch (err) {
            loading.classList.add("hidden");
            displayError("❗ " + err.message);
        }
    });

    // Sort & filter
    document.getElementById("sort-by").addEventListener("change", applyFiltersAndSort);
    document.getElementById("rating-filter").addEventListener("input", applyFiltersAndSort);

    // Trailer button click
    $(document).on('click', '.trailer-btn', function() {
        const trailerUrl = $(this).data('trailer-url');
        const videoId = new URL(trailerUrl).searchParams.get('v');

        iframeContainer.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
                    frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="w-100 h-100">
            </iframe>`;
    });

    // Clear iframe when modal closes
    if (trailerModalElement) {
        trailerModalElement.addEventListener('hidden.bs.modal', () => {
            iframeContainer.innerHTML = '';
        });
    }

    // Apply filters and sorting
    function applyFiltersAndSort() {
        let filtered = [...currentRecommendations];

        const minRating = parseFloat(document.getElementById("rating-filter").value) || 0;
        filtered = filtered.filter(rec => rec.rating >= minRating);

        const sortBy = document.getElementById("sort-by").value;
        filtered.sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
            return b.similarity - a.similarity;
        });

        renderRecommendations(filtered);
    }

    // Render recommendation cards
    function renderRecommendations(recommendations) {
        listContainer.innerHTML = '';

        if (!recommendations || recommendations.length === 0) {
            listContainer.innerHTML = `
                <li class="col-12">
                    <div class="alert alert-warning text-center">No movies found.</div>
                </li>`;
            return;
        }

        recommendations.forEach(item => {
            const trailerButton = item.trailer
                ? `<button class="btn btn-sm btn-outline-danger trailer-btn"
                          data-bs-toggle="modal" data-bs-target="#trailerModal"
                          data-trailer-url="${item.trailer}">
                      🎬 Watch Trailer
                  </button>`
                : `<span class="badge bg-secondary">No Trailer</span>`;

            const li = document.createElement("li");
            li.className = "col-md-4 col-lg-3 mb-4";

            li.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${item.poster || '/static/no_poster.png'}"
                         class="card-img-top"
                         onerror="this.onerror=null; this.src='/static/no_poster.png';"
                         style="height: 300px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${item.title} (${item.year || "N/A"})</h5>
                        <p class="card-text"><strong>⭐ ${item.rating.toFixed(1)}</strong> / 10</p>
                        <p class="text-muted small">${item.overview ? item.overview.slice(0, 90) : ""}...</p>
                        <div class="mt-auto">${trailerButton}</div>
                    </div>
                </div>`;

            listContainer.appendChild(li);
        });
    }

});
