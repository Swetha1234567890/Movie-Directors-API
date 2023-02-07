const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
let db = null;

const initializeDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
initializeDB();
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie ORDER BY movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director ORDER BY director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES
    (
        ${directorId}, '${movieName}', '${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send({ movieId: movieId });
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId} ORDER BY director_id;`;
  const directorMovieArray = await db.all(getDirectorMovieQuery);
  response.send(directorMovieArray);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const updatedMovieArray = `UPDATE movie SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(updatedMovieArray);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
