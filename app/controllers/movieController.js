const asyncHandler = require('express-async-handler');

const { Movie } = require('../config/db.js');

const read = asyncHandler(async (req, res) => {
  try {
    const movies = await Movie.findAll();
    res.status(200).json({ data: movies });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const create = asyncHandler(async (req, res) => {
  try {
    const { title, description, actors } = req.body;
    const movie = await Movie.create({ title, description });

    await movie.setActors(actors);

    res.status(200).json({ data: movie });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

module.exports = {
  read,
  create,
};
