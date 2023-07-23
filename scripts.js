const apiKey = "7d639657";
const baseUrl = "https://www.omdbapi.com/";

// Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("searchBtn");
const movieListContainer = document.getElementById("movieList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNumbers = document.getElementById("pageNumbers");
const movieDetailsContainer = document.getElementById("movieDetails");

let currentPage = 1;
let totalResults = 0;
let movies = [];

async function getMovies(searchTerm, page) {
  const url = `${baseUrl}?apikey=${apiKey}&s=${searchTerm}&page=${page}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
      totalResults = parseInt(data.totalResults);
      console.log(data.Search.imdbID);
      return data.Search;
    } else {
      throw new Error(data.Error);
    }
  } catch (error) {
    console.error(error.message);
    alert(error.message);
    movies = [];
  }
}
function displayMovies() {
  movieListContainer.innerHTML = "";

  movies.forEach((movie) => {
    const movieItem = document.createElement("div");
    movieItem.classList.add("movie-item");
    movieItem.dataset.id = movie.imdbID;

    const moviePoster = document.createElement("img");
    moviePoster.classList.add("movie-poster");
    moviePoster.src = movie.Poster !== "N/A" ? movie.Poster : "no_poster.jpg";
    moviePoster.alt = movie.Title;

    const movieTitle = document.createElement("div");
    movieTitle.classList.add("movie-title");
    movieTitle.textContent = movie.Title;

    movieItem.appendChild(moviePoster);
    movieItem.appendChild(movieTitle);

    movieListContainer.appendChild(movieItem);

    movieItem.addEventListener("click", async () => {
      const result = await fetch(
        `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`
      );
      const movieDetails = await result.json();
      displayMovieDetails(movieDetails);
    });
  });
}

function displayMovieDetails(movie) {
  movieDetailsContainer.innerHTML = `
    <h2>${movie.Title}</h2>
    <p><strong>Year:</strong> ${movie.Year}</p>
    <p><strong>Director:</strong> ${movie.Director}</p>
    <p><strong>Plot:</strong> ${movie.Plot}</p>
    <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
    <div class="star-rating">
      <label for="rating-${movie.imdbID}">Rate this movie:</label>
      <input type="number" id="rating-${movie.imdbID}" min="0" max="5" step="0.1">
      <button onclick="submitRating('${movie.imdbID}')" id="submitRatingBtn-${movie.imdbID}">Submit</button>
    </div>
    <div class="comments-edit">
      <!-- Here, you can add the comments section if needed -->
      <label for="comment-${movie.imdbID}">Comment this movie:</label>
      <input type="text" id="comment-${movie.imdbID}" min="0" max="5" step="0.1">
      <button onclick="submitCommentMovie('${movie.imdbID}')" id="submitCommentBtn-${movie.imdbID}">Submit</button>
    </div>
  `;

  movieDetailsContainer.style.display = "block";

  const existingSubrating =
    parseFloat(localStorage.getItem(`subrating_${movie.imdbID}`)) || 0;

  const existingComment = localStorage.getItem(`comment_${movie.imdbID}`) || "";

  const ratingInput = document.getElementById(`rating-${movie.imdbID}`);
  const commentInput = document.getElementById(`comment-${movie.imdbID}`);
  ratingInput.value = existingSubrating;
  commentInput.value = existingComment;

  const submitRateBtn = document.getElementById(
    `submitRatingBtn-${movie.imdbID}`
  );
  submitRateBtn.addEventListener("click", function () {
    const newSubrating = parseFloat(ratingInput.value);
    if (newSubrating >= 0 && newSubrating <= 5) {
      localStorage.setItem(`subrating_${movie.imdbID}`, newSubrating);
      alert("Subrating saved successfully!");
    } else {
      alert("Subrating must be a number between 0 and 5.");
    }
  });

  const submitCommentBtn = document.getElementById(
    `submitCommentBtn-${movie.imdbID}`
  );
  submitCommentBtn.addEventListener("click", function () {
    const newComment = commentInput.value;
    localStorage.setItem(`comment_${movie.imdbID}`, newComment);
    alert("comment added successfully!");
  });
}

async function searchMovies() {
  const searchTerm = searchInput.value;
  currentPage = 1;

  if (searchTerm.trim() !== "") {
    movies = await getMovies(searchTerm, currentPage);
    displayMovies();

    if (totalResults > 10) {
      updatePagination();
    }
  }
}

function updatePagination() {
  const totalPages = Math.ceil(totalResults / 10);

  let pageNumbersHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    pageNumbersHTML += `<div class="page_number ${
      i === currentPage ? "active" : ""
    }" id="page-${i}" onclick="goToPage(${i})">${i}</div>`;
  }

  pageNumbers.innerHTML = pageNumbersHTML;
}
async function goToPage(page) {
  currentPage = page;
  movies = await getMovies(searchInput.value, currentPage);
  displayMovies();
  updatePagination();
}

searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    searchMovies();
  }
});
if (currentPage - 1 <= 0)
  prevBtn.addEventListener("click", () => goToPage(currentPage - 1));

nextBtn.addEventListener("click", () => goToPage(currentPage + 1));

searchMovies();
