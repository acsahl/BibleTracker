const mongoose = require('mongoose');

const devotionalSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: true,
    description: "Bible reference (e.g., 'John 3:16')"
  },
  completed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Devotional', devotionalSchema); 