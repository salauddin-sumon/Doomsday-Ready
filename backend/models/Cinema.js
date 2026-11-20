const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bundleSizes: {
    type: [Number],
    required: true,
    validate: {
      validator: function (sizes) {
        return sizes.length >= 1 &&
               sizes.length <= 10 &&
               sizes.every(s => Number.isInteger(s) && s >= 1 && s <= 500);
      },
      message: 'Bundle sizes must be 1-10 integers, each between 1 and 500'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Cinema', cinemaSchema);