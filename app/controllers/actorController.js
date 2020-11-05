const asyncHandler = require('express-async-handler');

const { Actor } = require('../config/db.js');

const read = asyncHandler(async (req, res) => {
  try {
    const actors = await Actor.findAll();
    res.status(200).json({ data: actors });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 500, message: 'Internal Server Error' } });
  }
});

const create = asyncHandler(async (req, res) => {
  try {
    const { name, movies } = req.body;
    const actor = await Actor.create({ name });

    await actor.setMovies(movies);

    res.status(200).json({ data: actor });
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
