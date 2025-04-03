document.addEventListener("DOMContentLoaded", () => {

    // ----------------------------
    // Gestion du modal et de la navigation
    // ----------------------------

    const modalWindow = document.getElementById("modal_window");
    const closeModalBtn = document.getElementById("close_modal");
    const closeModalSpan = document.querySelector(".close");
    const modalImg = document.getElementById("imgfilm");

    // Sélecteurs pour le grid de films et le select de genres
    const movieGrid = document.getElementById("list_film");
    const genreSelect = document.getElementById("genre_select");
    const titreGenre = document.getElementById("titre_genre");

    const sciFiMovies = document.getElementById("sci-fi_movies");
    const comedyMovies = document.getElementById("comedy_movies");

    // ----------------------------
    // Fonctions pour le modal
    // ----------------------------

    async function fetchMovieDetails(movieId) {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/titles/${movieId}`);
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Erreur", error);
            alert("Impossible de récupérer les détails du film.");
        }
    }

    async function openModal(movieId) {
        const movie = await fetchMovieDetails(movieId);
        if (!movie) return;

        document.getElementById("modal_title").innerText = movie.title || "Titre inconnu";
        document.getElementById("modal_year").innerText = movie.year || "Année inconnue";
        document.getElementById("modal_genre").innerText = movie.genres ? movie.genres.join(", ") : "Genres inconnus";
        document.getElementById("modal_duration").innerText = movie.duration ? `${movie.duration} min` : "Durée inconnue";
        document.getElementById("modal_score").innerText = movie.imdb_score || "Score inconnu";
        document.getElementById("modal_director").innerText = movie.directors ? movie.directors.join(", ") : "Réalisateur inconnu";
        document.getElementById("modal_description").innerText = movie.description || "Description non disponible";
        document.getElementById("modal_cast").innerText = movie.actors ? movie.actors.join(", ") : "Casting inconnu";

        modalImg.src = "";
        modalImg.src = movie.image_url;

        modalWindow.style.display = "flex";
        modalWindow.classList.add("fade-in");
    }

    async function closeModal() {
        modalWindow.classList.remove("fade-in");
        modalWindow.classList.add("fade-out");
        setTimeout(() => {
            modalWindow.style.display = "none";
            modalWindow.classList.remove("fade-out");
        }, 300);
    }

    document.body.addEventListener("click", (event) => {
        const target = event.target;

        // Ouvrir le modal si on clique sur une image ou sur un bouton "Details"
        if (target.tagName === "IMG" && target.dataset.id) {
            openModal(target.dataset.id);
        }
        if (target.classList.contains("details-btn")) {
            openModal(target.dataset.id);
        }

        // Fermer le modal si on clique en dehors ou sur les éléments de fermeture
        if (target === modalWindow || target === closeModalBtn || target === closeModalSpan) {
            closeModal();
        }
    });

    // ----------------------------
    // Chargement des films par genre
    // ----------------------------

    async function loadMoviesByGenre(genre, targetDiv) {
        const apiUrlPage1 = `http://localhost:8000/api/v1/titles/?genre=${genre}&page=1`;
        const apiUrlPage2 = `http://localhost:8000/api/v1/titles/?genre=${genre}&page=2`;

        try {
            const response1 = await fetch(apiUrlPage1);
            const data1 = await response1.json();

            let movies = data1.results;

            if (movies.length < 6) {
                const response2 = await fetch(apiUrlPage2);
                const data2 = await response2.json();
                if (data2.results.length > 0) {
                    movies.push(data2.results[0]);
                }
            }
            updateMovieList(movies.slice(0, 6), targetDiv);
        } catch (error) {
            console.error("Erreur lors de la récupération des films :", error);
        }
    }

    function updateMovieList(movies, targetDiv) {
        targetDiv.innerHTML = "";

        // Mise à jour du titre de la catégorie pour le select
        if (titreGenre.querySelector("h2")) {
            titreGenre.querySelector("h2").remove();
        }
        const movieGenre = document.createElement("h2");
        movieGenre.innerHTML = genreSelect.value;
        titreGenre.appendChild(movieGenre);

        const movieGridContainer = document.createElement("div");
        movieGridContainer.classList.add("movie-grid");

        movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.innerHTML = `
                <img src="${movie.image_url}" alt="${movie.title}" data-id="${movie.id}">
            `;
            movieGridContainer.appendChild(movieCard);
            addHoverEffect(movieCard.querySelector("img"));
        });

        targetDiv.appendChild(movieGridContainer);
    }

    function addHoverEffect(img) {
        img.addEventListener("mouseover", () => {
            img.style.transform = "scale(1.1)";
            img.style.transition = "0.3s ease-in-out";
        });
        img.addEventListener("mouseout", () => {
            img.style.transform = "scale(1)";
        });
    }

    genreSelect.addEventListener("change", () => {
        loadMoviesByGenre(genreSelect.value, movieGrid);
    });

    // Chargement initial pour le select de genre
    loadMoviesByGenre(genreSelect.value, movieGrid);

    // ----------------------------
    // Gestion du carrousel pour la catégorie sélectionnée
    // ----------------------------

    async function loadMoviesCarousel(genre, targetDiv, page) {
        const apiUrl = `http://localhost:8000/api/v1/titles/?genre=${genre}&page=${page}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            let movies = data.results;

            if (movies.length < 6) {
                const nextPage = page + 1;
                const response2 = await fetch(`http://localhost:8000/api/v1/titles/?genre=${genre}&page=${nextPage}`);
                const data2 = await response2.json();
                while (movies.length < 6 && data2.results.length > 0) {
                    movies.push(data2.results.shift());
                }
            }

            if (!movies || movies.length === 0) {
                targetDiv.innerHTML = '<p>Aucun film disponible pour cette catégorie.</p>';
                const nextBtn = document.getElementById(`next-${genre}`);
                if (nextBtn) nextBtn.disabled = true;
            } else {
                updateCarouselMovies(movies.slice(0, 6), targetDiv);
                const nextBtn = document.getElementById(`next-${genre}`);
                if (nextBtn) nextBtn.disabled = false;
            }
            const prevBtn = document.getElementById(`prev-${genre}`);
            if (prevBtn) {
                prevBtn.disabled = (page === 1);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des films :", error);
        }
    }

    function updateCarouselMovies(movies, targetDiv) {
        targetDiv.innerHTML = "";

        const movieGridContainer = document.createElement("div");
        movieGridContainer.classList.add("movie-grid");

        movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.innerHTML = `
                <img src="${movie.image_url}" alt="${movie.title}" data-id="${movie.id}">
            `;
            movieGridContainer.appendChild(movieCard);
            addHoverEffect(movieCard.querySelector("img"));
        });

        targetDiv.appendChild(movieGridContainer);
    }

    let currentPageSelected = 1;

    async function loadSelectedCategoryCarousel(genre, targetDiv, page) {
        const apiUrl = `http://localhost:8000/api/v1/titles/?genre=${genre}&page=${page}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            let movies = data.results;

            if (movies.length < 6) {
                const nextPage = page + 1;
                const response2 = await fetch(`http://localhost:8000/api/v1/titles/?genre=${genre}&page=${nextPage}`);
                const data2 = await response2.json();
                while (movies.length < 6 && data2.results.length > 0) {
                    movies.push(data2.results.shift());
                }
            }

            const selectedCategoryTitle = document.getElementById("selected-category-title");
            if (selectedCategoryTitle) {
                selectedCategoryTitle.textContent = genre;
            }

            if (!movies || movies.length === 0) {
                targetDiv.innerHTML = '<p>Aucun film disponible pour cette catégorie.</p>';
                document.getElementById("next-selected").disabled = true;
            } else {
                updateCarouselMovies(movies.slice(0, 6), targetDiv);
                document.getElementById("next-selected").disabled = false;
            }

            document.getElementById("prev-selected").disabled = (page === 1);
        } catch (error) {
            console.error("Erreur lors de la récupération des films :", error);
        }
    }

    const nextSelectedBtn = document.getElementById("next-selected");
    const prevSelectedBtn = document.getElementById("prev-selected");
    const selectedDiv = document.getElementById("list_film");

    nextSelectedBtn.addEventListener("click", () => {
        currentPageSelected++;
        loadSelectedCategoryCarousel(genreSelect.value, selectedDiv, currentPageSelected);
    });
    prevSelectedBtn.addEventListener("click", () => {
        if (currentPageSelected > 1) {
            currentPageSelected--;
            loadSelectedCategoryCarousel(genreSelect.value, selectedDiv, currentPageSelected);
        }
    });

    genreSelect.addEventListener("change", () => {
        currentPageSelected = 1;
        loadSelectedCategoryCarousel(genreSelect.value, selectedDiv, currentPageSelected);
    });

    loadSelectedCategoryCarousel(genreSelect.value, selectedDiv, currentPageSelected);

    let currentPageSciFi = 1;
    let currentPageComedy = 1;

    if (sciFiMovies) {
        const nextSciFiBtn = document.getElementById("next-sci-fi");
        const prevSciFiBtn = document.getElementById("prev-sci-fi");

        loadMoviesCarousel("sci-fi", sciFiMovies, currentPageSciFi);

        if (nextSciFiBtn && prevSciFiBtn) {
            nextSciFiBtn.addEventListener("click", () => {
                currentPageSciFi++;
                loadMoviesCarousel("sci-fi", sciFiMovies, currentPageSciFi);
            });
            prevSciFiBtn.addEventListener("click", () => {
                if (currentPageSciFi > 1) {
                    currentPageSciFi--;
                    loadMoviesCarousel("sci-fi", sciFiMovies, currentPageSciFi);
                }
            });
        }
    }

    if (comedyMovies) {
        const nextComedyBtn = document.getElementById("next-comedy");
        const prevComedyBtn = document.getElementById("prev-comedy");

        loadMoviesCarousel("comedy", comedyMovies, currentPageComedy);

        if (nextComedyBtn && prevComedyBtn) {
            nextComedyBtn.addEventListener("click", () => {
                currentPageComedy++;
                loadMoviesCarousel("comedy", comedyMovies, currentPageComedy);
            });
            prevComedyBtn.addEventListener("click", () => {
                if (currentPageComedy > 1) {
                    currentPageComedy--;
                    loadMoviesCarousel("comedy", comedyMovies, currentPageComedy);
                }
            });
        }
    }

    // ----------------------------
    // Affichage dynamique du meilleur film
    // ----------------------------

    fetch("http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page_size=1")
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const bestMovie = data.results[0];

                const movieImg = document.querySelector(".best-movie .movie-card img");
                if (movieImg) {
                    movieImg.src = bestMovie.image_url;
                    movieImg.alt = bestMovie.title;
                }

                const movieTitle = document.querySelector(".best-movie .movie-card h3");
                if (movieTitle) {
                    movieTitle.textContent = bestMovie.title;
                }

                // Pour récupérer la description complète, effectuer un appel à l'endpoint de détail du film
                const movieDescription = document.querySelector(".best-movie .movie-card p");
                if (movieDescription) {
                    fetch(`http://localhost:8000/api/v1/titles/${bestMovie.id}`)
                        .then(response => response.json())
                        .then(movieDetail => {
                            // Affiche la description complète
                            movieDescription.textContent = movieDetail.description || "Description non disponible";
                        })
                        .catch(error => console.error("Erreur lors de la récupération de la description:", error));
                    }

                const detailsBtn = document.querySelector(".best-movie .movie-card button.details-btn");
                if (detailsBtn) {
                    detailsBtn.setAttribute("data-id", bestMovie.id);
                }
            }
        })
        .catch(error => console.error("Erreur lors de la récupération du meilleur film :", error));
});
