const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  details: {
    type: String,
    required: [true, 'Review details are required'],
    trim: true
  },
  pros: {
    type: String,
    required: [true, 'Pros are required'],
    trim: true
  },
  cons: {
    type: String,
    required: [true, 'Cons are required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', ReviewSchema);