const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { wouldCreateCycle, getRewatchOrder } = require('../algorithms/graph');

router.post('/', async (req, res) => {
  try {
    const { title, releaseYear, runtime, prerequisites = [], watched = false } = req.body;

    const movie = new Movie({ title, releaseYear, runtime, prerequisites, watched });
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'DUPLICATE_TITLE' });
    }
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find({}).populate('prerequisites', 'title');
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const newPrereqs = req.body.prerequisites !== undefined
      ? req.body.prerequisites
      : movie.prerequisites;

    const hasCycle = await wouldCreateCycle(req.params.id, newPrereqs, Movie);
    if (hasCycle) {
      return res.status(409).json({ error: 'CIRCULAR_DEPENDENCY' });
    }

    const { title, releaseYear, runtime, prerequisites, watched } = req.body;
    if (title !== undefined) movie.title = title;
    if (releaseYear !== undefined) movie.releaseYear = releaseYear;
    if (runtime !== undefined) movie.runtime = runtime;
    if (prerequisites !== undefined) movie.prerequisites = prerequisites;
    if (watched !== undefined) movie.watched = watched;

    await movie.save();
    res.json(movie);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'DUPLICATE_TITLE' });
    }
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id/rewatch-order', async (req, res) => {
  try {
    const result = await getRewatchOrder(req.params.id, Movie);
    if (!result) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;