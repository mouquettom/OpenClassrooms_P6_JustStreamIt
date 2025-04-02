document.addEventListener("DOMContentLoaded", () => {

    const modalWindow = document.getElementById("modal_window");
    const closeModalBtn = document.getElementById("close_modal");
    const closeModalSpan = document.querySelector(".close");
    const modalImg = document.getElementById("imgfilm");

    const movieGrid = document.getElementById("list_film");
    const genreSelect = document.getElementById("genre_select");
    const titreGenre = document.getElementById("titre_genre");

    const sciFiMovies = document.getElementById("sci-fi_movies");
    const comedyMovies = document.getElementById("comedy_movies");

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

    // Chargement des films pour le select genre
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

    // Pour le carrousel, nous définissons une fonction dédiée qui gère la pagination.
    // Elle utilise l'URL avec le paramètre page et met à jour l'affichage.
    async function loadMoviesCarousel(genre, targetDiv, page) {
        const apiUrl = `http://localhost:8000/api/v1/titles/?genre=${genre}&page=${page}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            let movies = data.results;

            // Si le nombre de films est inférieur à 6, récupérer des films supplémentaires depuis la page suivante
            if (movies.length < 6) {
                const nextPage = page + 1;
                const response2 = await fetch(`http://localhost:8000/api/v1/titles/?genre=${genre}&page=${nextPage}`);
                const data2 = await response2.json();
                // Ajouter les films de la page suivante jusqu'à atteindre 6 films (si disponibles)
                while (movies.length < 6 && data2.results.length > 0) {
                    movies.push(data2.results.shift());
                }
            }

            // Si aucun film n'est disponible, afficher un message et désactiver le bouton "Suivant"
            if (!movies || movies.length === 0) {
                targetDiv.innerHTML = '<p>Aucun film disponible pour cette catégorie.</p>';
                const nextBtn = document.getElementById(`next-${genre}`);
                if (nextBtn) nextBtn.disabled = true;
            } else {
                updateCarouselMovies(movies.slice(0, 6), targetDiv);
                const nextBtn = document.getElementById(`next-${genre}`);
                if (nextBtn) nextBtn.disabled = false;
            }
            // Désactiver le bouton "Précédent" si on est sur la première page
            const prevBtn = document.getElementById(`prev-${genre}`);
            if (prevBtn) {
                prevBtn.disabled = (page === 1);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des films :", error);
        }
    }

    function updateCarouselMovies(movies, targetDiv, titleText = "") {
        // Effacer le contenu précédent
        targetDiv.innerHTML = "";

        // Créer la grille des films
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

    // Variables pour suivre la page du carrousel de la catégorie sélectionnée
    let currentPageSelected = 1;

    async function loadSelectedCategoryCarousel(genre, targetDiv, page) {
        // Convertir le genre en minuscules pour correspondre à l’API
        const genreParam = genre.toLowerCase();
        const apiUrl = `http://localhost:8000/api/v1/titles/?genre=${genre}&page=${page}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            let movies = data.results;

            // Si moins de 6 films sont retournés, compléter avec la page suivante
            if (movies.length < 6) {
                const nextPage = page + 1;
                const response2 = await fetch(`http://localhost:8000/api/v1/titles/?genre=${genre}&page=${nextPage}`);
                const data2 = await response2.json();
                while (movies.length < 6 && data2.results.length > 0) {
                    movies.push(data2.results.shift());
                }
            }

            // Mettre à jour le <h2> au-dessus des boutons
            const selectedCategoryTitle = document.getElementById("selected-category-title");
            if (selectedCategoryTitle) {
                // On affiche le genre tel qu'il apparaît dans le select (avec la casse d'origine)
                selectedCategoryTitle.textContent = genre;
            }

            // Gestion de l'affichage
            if (!movies || movies.length === 0) {
                targetDiv.innerHTML = '<p>Aucun film disponible pour cette catégorie.</p>';
                document.getElementById("next-selected").disabled = true;
            } else {
                updateCarouselMovies(movies.slice(0, 6), targetDiv, genre);
                document.getElementById("next-selected").disabled = false;
            }

            // Désactiver le bouton "Précédent" sur la première page
            document.getElementById("prev-selected").disabled = (page === 1);
        } catch (error) {
            console.error("Erreur lors de la récupération des films :", error);
        }
    }

    // Gestion des boutons pour la catégorie sélectionnée
    const nextSelectedBtn = document.getElementById("next-selected");
    const prevSelectedBtn = document.getElementById("prev-selected");
    const selectedDiv = document.getElementById("list_film");

    nextSelectedBtn.addEventListener("click", () => {
        currentPageSelected++;
        // Ici, on récupère la valeur du genre sélectionné dans le select
        loadSelectedCategoryCarousel(genreSelect.value, selectedDiv, currentPageSelected);
    });
    prevSelectedBtn.addEventListener("click", () => {
        if (currentPageSelected > 1) {
            currentPageSelected--;
            loadSelectedCategoryCarousel(genreSelect.value, selectedDiv, currentPageSelected);
        }
    });

    // Lorsque l'utilisateur change la catégorie via le select, réinitialiser la page et charger le carrousel
    genreSelect.addEventListener("change", () => {
        currentPageSelected = 1;
        loadSelectedCategoryCarousel(genreSelect.value, selectedDiv, currentPageSelected);
    });

    // Chargement initial de la catégorie sélectionnée au démarrage (ici Action par défaut)
    loadSelectedCategoryCarousel(genreSelect.value, selectedDiv, currentPageSelected);


    // Variables pour suivre la page courante dans le carrousel
    let currentPageSciFi = 1;
    let currentPageComedy = 1;

    // Gestion du carrousel pour la catégorie "sci-fi" si les boutons existent
    if (sciFiMovies) {
        const nextSciFiBtn = document.getElementById("next-sci-fi");
        const prevSciFiBtn = document.getElementById("prev-sci-fi");

        // Chargement initial du carrousel pour sci-fi
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

    // Gestion du carrousel pour la catégorie "comedy" si les boutons existent
    if (comedyMovies) {
        const nextComedyBtn = document.getElementById("next-comedy");
        const prevComedyBtn = document.getElementById("prev-comedy");

        // Chargement initial du carrousel pour comedy
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
});