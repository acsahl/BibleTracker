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
    console.log('Fetching devotionals for user:', req.userId);
    console.log('Token received:', req.headers.authorization);
    
    const devotionals = await Devotional.find({ userId: req.userId })
      .sort({ date: -1 });
    
    console.log('Found devotionals:', devotionals.length);
    console.log('Devotionals:', JSON.stringify(devotionals, null, 2));
    
    if (devotionals.length === 0) {
      console.log('No devotionals found for user:', req.userId);
    }
    
    res.json(devotionals);
  } catch (error) {
    console.error('Error fetching devotionals:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get a specific devotional by date
router.get('/:date', verifyToken, async (req, res) => {
  try {
    // Parse the date string and create a date object
    const [year, month, day] = req.params.date.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const devotional = await Devotional.findOne({
      userId: req.userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
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
    
    // Parse the date string and create a date object
    const [year, month, day] = date.split('-').map(Number);
    const devotionalDate = new Date(year, month - 1, day);
    devotionalDate.setHours(0, 0, 0, 0);

    
    const devotional = new Devotional({
      date: devotionalDate,
      title,
      content,
      reference,
      userId: req.userId,
      completed: false
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
    console.log('Updating devotional with ID:', req.params.id);
    console.log('User ID:', req.userId);
    console.log('Request body:', req.body);

    const devotional = await Devotional.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!devotional) {
      console.log('Devotional not found');
      return res.status(404).json({ message: 'Devotional not found' });
    }

    console.log('Found devotional:', devotional);

    const { title, content, reference, completed, userNotes } = req.body;
    devotional.title = title || devotional.title;
    devotional.content = content || devotional.content;
    devotional.reference = reference || devotional.reference;
    devotional.completed = completed !== undefined ? completed : devotional.completed;
    devotional.userNotes = userNotes !== undefined ? userNotes : devotional.userNotes;

    console.log('Updated devotional before save:', devotional);

    const savedDevotional = await devotional.save();
    console.log('Saved devotional:', savedDevotional);

    res.json(savedDevotional);
  } catch (error) {
    console.error('Error updating devotional:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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