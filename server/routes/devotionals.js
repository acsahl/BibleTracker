const express = require('express');
const router = express.Router();
const Devotional = require('../models/Devotional');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all devotionals for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const devotionals = await Devotional.find({ userId: req.userId })
      .sort({ date: -1 });
    res.json(devotionals);
  } catch (error) {
    console.error('Error fetching devotionals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific devotional by date
router.get('/:date', verifyToken, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const devotional = await Devotional.findOne({
      userId: req.userId,
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });

    if (!devotional) {
      return res.status(404).json({ message: 'Devotional not found' });
    }

    res.json(devotional);
  } catch (error) {
    console.error('Error fetching devotional:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new devotional
router.post('/', verifyToken, async (req, res) => {
  try {
    const { date, title, content, reference } = req.body;
    const devotional = new Devotional({
      date,
      title,
      content,
      reference,
      userId: req.userId
    });

    await devotional.save();
    res.status(201).json(devotional);
  } catch (error) {
    console.error('Error creating devotional:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a devotional
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const devotional = await Devotional.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!devotional) {
      return res.status(404).json({ message: 'Devotional not found' });
    }

    const { title, content, reference, completed } = req.body;
    devotional.title = title || devotional.title;
    devotional.content = content || devotional.content;
    devotional.reference = reference || devotional.reference;
    devotional.completed = completed !== undefined ? completed : devotional.completed;

    await devotional.save();
    res.json(devotional);
  } catch (error) {
    console.error('Error updating devotional:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a devotional
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const devotional = await Devotional.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!devotional) {
      return res.status(404).json({ message: 'Devotional not found' });
    }

    res.json({ message: 'Devotional deleted successfully' });
  } catch (error) {
    console.error('Error deleting devotional:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 