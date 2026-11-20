const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  releaseYear: {
    type: Number,
    required: true
  },
  runtime: {
    type: Number,
    required: true,
    min: 1,
    max: 300
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    default: []
  }],
  watched: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);