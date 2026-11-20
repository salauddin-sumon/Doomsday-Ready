const express = require('express');
const router = express.Router();
const Cinema = require('../models/Cinema');
const { getBookingQuote } = require('../algorithms/booking');

router.post('/', async (req, res) => {
  try {
    const { name, bundleSizes } = req.body;
    const cinema = new Cinema({ name, bundleSizes });
    await cinema.save();
    res.status(201).json(cinema);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'DUPLICATE_NAME' });
    }
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const cinemas = await Cinema.find({});
    res.json(cinemas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/booking', async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ error: 'Cinema not found' });
    }

    const groupSize = Number(req.query.groupSize);
    const quote = getBookingQuote(cinema.bundleSizes, groupSize);

    if (!quote) {
      return res.json({ possible: false, message: 'Not possible' });
    }

    res.json({ possible: true, ...quote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;