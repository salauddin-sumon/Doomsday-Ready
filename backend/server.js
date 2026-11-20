require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Movie = require('./models/Movie');
const Cinema = require('./models/Cinema');

const movieRoutes = require('./routes/movies');
const cinemaRoutes = require('./routes/cinemas');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);


app.get('/', (req, res) => {
  res.send('Doomsday Ready API is running');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });