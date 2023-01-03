const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1
const getMoviesList = (list) => {
  return { movieName: list.movie_name };
};
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT * FROM movie`;

  const moviesObj = await db.all(getAllMoviesQuery);
  response.send(moviesObj.map((list) => getMoviesList(list)));
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send(`Movie Successfully Added`);
});

//API 3
const getMovieObj = (list) => {
  return {
    movieId: list.movie_id,
    directorId: list.director_id,
    movieName: list.movie_name,
    leadActor: list.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie  WHERE movie_id=${movieId}`;
  const getMovie = await db.get(getMovieQuery);
  response.send(getMovieObj(getMovie));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateMovieDetails = request.body;
  const { directorId, movieName, leadActor } = updateMovieDetails;
  const upDateMovieQuery = `UPDATE  movie SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor= '${leadActor}'
    WHERE movie_id = ${movieId}`;
  const updateMovie = await db.run(upDateMovieQuery);
  response.send(`Movie Details Updated`);
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDeleteQuery = `DELETE FROM movie WHERE movie_id=${movieId}`;
  const dbResponse = await db.run(movieDeleteQuery);
  response.send("Movie Removed");
});

//API 6
const getDirectorsList = (list) => {
  return {
    directorId: list.director_id,
    directorName: list.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `SELECT * FROM director`;
  const allDirectors = await db.all(getAllDirectorsQuery);
  response.send(allDirectors.map((list) => getDirectorsList(list)));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `SELECT * FROM movie WHERE director_id = ${directorId}`;
  const directorMovieObj = await db.all(getDirectorMoviesQuery);
  response.send(directorMovieObj.map((list) => getMoviesList(list)));
});

module.exports = app;
