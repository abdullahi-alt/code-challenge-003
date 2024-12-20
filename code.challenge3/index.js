document.addEventListener("DOMContentLoaded", () => {
  // Initial setup and event listeners
  const buyTicketButton = document.getElementById("buy-ticket");
  const deleteMovieButton = document.getElementById("delete-movie-button");
  const addMovieButton = document.getElementById("add-movie-button");
  const filmsList = document.getElementById("films");
  const title = document.getElementById("title");
  const runtime = document.getElementById("runtime");
  const filmInfo = document.getElementById("film-info");
  const showtime = document.getElementById("showtime");
  const ticketNum = document.getElementById("ticket-num");
  const poster = document.getElementById("poster");

  fetchMovies();

  function fetchMovies() {
      fetch('http://localhost:3000/films')
          .then(response => response.json())
          .then(movies => {
              filmsList.innerHTML = '';
              movies.forEach(movie => {
                  const li = document.createElement('li');
                  li.className = 'film item';
                  li.textContent = movie.title;
                  li.addEventListener('click', () => displayMovieDetails(movie));
                  filmsList.appendChild(li);
              });
          })
          .catch(error => console.error('Error fetching movies:', error));
  }

  function displayMovieDetails(movie) {
      title.textContent = movie.title;
      runtime.textContent = `${movie.runtime} minutes`;
      filmInfo.textContent = movie.description;
      showtime.textContent = movie.showtime;
      ticketNum.textContent = movie.capacity - movie.tickets_sold;
      poster.src = movie.poster;
      buyTicketButton.disabled = movie.tickets_sold >= movie.capacity;
      deleteMovieButton.disabled = false;
      buyTicketButton.dataset.movieId = movie.id;
      deleteMovieButton.dataset.movieId = movie.id;
  }

  

  buyTicketButton.addEventListener('click', () => {
    const movieId = buyTicketButton.dataset.movieId;
    fetch(`http://localhost:3000/films/${movieId}`)
        .then(response => response.json())
        .then(movie => {
            if (movie.tickets_sold < movie.capacity) {
                const updatedTicketsSold = movie.tickets_sold + 1;
                fetch(`http://localhost:3000/films/${movieId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tickets_sold: updatedTicketsSold })
                })
                    .then(response => response.json())
                    .then(updatedMovie => {
                        // Update the movie details with the new tickets sold count
                        displayMovieDetails(updatedMovie);
                        // Update the remaining tickets on the webpage
                        ticketNum.textContent = updatedMovie.capacity - updatedMovie.tickets_sold;
                        // Check if tickets are sold out
                        if (updatedMovie.tickets_sold >= updatedMovie.capacity) {
                            alert('Tickets are over');
                            buyTicketButton.textContent = 'Sold Out';
                            buyTicketButton.disabled = true;
                        }
                    });
            }
        });
});

  deleteMovieButton.addEventListener('click', () => {
      const movieId = deleteMovieButton.dataset.movieId;
      fetch(`http://localhost:3000/films/${movieId}`, {
          method: 'DELETE'
      })
          .then(() => {
              fetchMovies();
              clearMovieDetails();
          })
          .catch(error => console.error('Error deleting movie:', error));
  });

  addMovieButton.addEventListener('click', () => {
      const newMovie = {
          title: prompt('Enter movie title:'),
          runtime: prompt('Enter movie runtime in minutes:'),
          description: prompt('Enter movie description:'),
          showtime: prompt('Enter movie showtime:'),
          capacity: parseInt(prompt('Enter movie capacity:'), 10),
          tickets_sold: 0,
          poster: prompt('Enter movie poster URL:')
      };
      fetch('http://localhost:3000/films', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(newMovie)
      })
          .then(response => response.json())
          .then(movie => {
              fetchMovies();
              displayMovieDetails(movie);
          })
          .catch(error => console.error('Error adding movie:', error));
  });

  function clearMovieDetails() {
      title.textContent = 'MOVIE TITLE';
      runtime.textContent = 'RUNTIME In minutes';
      filmInfo.textContent = 'MOVIE DESCRIPTION HERE';
      showtime.textContent = 'SHOWTIME';
      ticketNum.textContent = '[X]';
      poster.src = './background.jpg';
      buyTicketButton.disabled = false;
      deleteMovieButton.disabled = true;
      buyTicketButton.textContent = 'Buy Ticket';
  }
});
