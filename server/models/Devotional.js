const mongoose = require('mongoose');

const devotionalSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
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
  userNotes: {
    type: String,
    default: ''
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

// Create a regular index for date and userId without uniqueness constraint
devotionalSchema.index({ date: 1, userId: 1 });

module.exports = mongoose.model('Devotional', devotionalSchema); 