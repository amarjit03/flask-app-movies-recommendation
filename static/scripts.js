function validateForm() {
    var movie = document.getElementById("movie").value;
    if (movie == "") {
        alert("Movie name must be filled out");
        return false;
    }
    return true;
}

function autocomplete(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-suggestions");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV");
                b.setAttribute("class", "autocomplete-suggestion");
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                b.addEventListener("click", function(e) {
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-suggestions");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

function displayMovieDetails(movieDetails) {
    var movieDetailsDiv = document.getElementById('movie-details');
    movieDetailsDiv.innerHTML = `
        <img src="${movieDetails.Poster}" alt="${movieDetails.Title} Poster" class="movie-poster">
        <div class="movie-info">
            <p><strong>Title:</strong> ${movieDetails.Title}</p>
            <p><strong>Year:</strong> ${movieDetails.Year}</p>
            <p><strong>Genre:</strong> ${movieDetails.Genre}</p>
            <p><strong>Director:</strong> ${movieDetails.Director}</p>
            <p><strong>Plot:</strong> ${movieDetails.Plot}</p>
        </div>
    `;
    movieDetailsDiv.style.display = 'flex';
}

function getRecommendations(event) {
    event.preventDefault();
    var movie = document.getElementById("movie").value;
    var spinner = document.getElementById('spinner');
    spinner.style.display = 'block';
    fetch('/ajax_recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ movie: movie })
    })
    .then(response => response.json())
    .then(data => {
        var movieDetails = data.shift();
        displayMovieDetails(movieDetails);
        var recommendationsList = document.getElementById('recommendations-list');
        recommendationsList.innerHTML = '';
        var imagesLoaded = 0;
        data.forEach(function(rec) {
            var div = document.createElement('div');
            div.classList.add('recommendation-item');
            div.innerHTML = `
                <img src="${rec.Poster}" alt="${rec.Title} Poster" class="movie-poster">
                <span>${rec.Title}</span>
            `;
            console.log(`Loading poster for: ${rec.Title}, URL: ${rec.Poster}`);
            var img = div.querySelector('img');
            img.onload = function() {
                imagesLoaded++;
                if (imagesLoaded === data.length) {
                    spinner.style.display = 'none';
                    recommendationsList.style.display = 'flex';
                }
            };
            img.onerror = function() {
                console.error(`Failed to load image for: ${rec.Title}, URL: ${rec.Poster}`);
                imagesLoaded++;
                if (imagesLoaded === data.length) {
                    spinner.style.display = 'none';
                    recommendationsList.style.display = 'flex';
                }
            };
            recommendationsList.appendChild(div);
        });
        recommendationsList.style.display = 'none';
    });
}

document.addEventListener("DOMContentLoaded", function() {
    var movies = JSON.parse(document.getElementById('movies-data').textContent);
    autocomplete(document.getElementById("movie"), movies);

    document.getElementById('recommendations-list').addEventListener('click', function(e) {
        if (e.target && e.target.matches('img.movie-poster')) {
            var movie = e.target.alt.split(' Poster')[0];
            var spinner = document.getElementById('spinner');
            spinner.style.display = 'block';
            fetch('/ajax_recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ movie: movie })
            })
            .then(response => response.json())
            .then(data => {
                var movieDetails = data.shift();
                displayMovieDetails(movieDetails);
                var recommendationsList = document.getElementById('recommendations-list');
                recommendationsList.innerHTML = '';
                var imagesLoaded = 0;
                data.forEach(function(rec) {
                    var div = document.createElement('div');
                    div.classList.add('recommendation-item');
                    div.innerHTML = `
                        <img src="${rec.Poster}" alt="${rec.Title} Poster" class="movie-poster">
                        <span>${rec.Title}</span>
                    `;
                    console.log(`Loading poster for: ${rec.Title}, URL: ${rec.Poster}`);
                    var img = div.querySelector('img');
                    img.onload = function() {
                        imagesLoaded++;
                        if (imagesLoaded === data.length) {
                            spinner.style.display = 'none';
                            recommendationsList.style.display = 'flex';
                        }
                    };
                    img.onerror = function() {
                        console.error(`Failed to load image for: ${rec.Title}, URL: ${rec.Poster}`);
                        imagesLoaded++;
                        if (imagesLoaded === data.length) {
                            spinner.style.display = 'none';
                            recommendationsList.style.display = 'flex';
                        }
                    };
                    recommendationsList.appendChild(div);
                });
                recommendationsList.style.display = 'none';
            });
        }
    });
});