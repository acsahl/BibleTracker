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

    console.log('Searching for devotional between:', startOfDay, 'and', endOfDay);

    const devotional = await Devotional.findOne({
      userId: req.userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    if (!devotional) {
      console.log('No devotional found for date:', req.params.date);
      return res.status(404).json({ message: 'Devotional not found' });
    }

    console.log('Found devotional:', devotional);
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
    devotionalDate.setHours(0, 0, 0, 0); // Set to midnight to ensure consistent comparison
    
    console.log('Creating devotional for date:', devotionalDate);
    
    // Generate a reference based on the date
    const books = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
      '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
      'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
      'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
      'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah',
      'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
      '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
      '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
      '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
    ];
    
    // Use the day of the year to select a book (cycling through books)
    const dayOfYear = Math.floor((devotionalDate - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24));
    const bookIndex = dayOfYear % books.length;
    const book = books[bookIndex];
    
    // Use the day of the month to select a chapter (1-30)
    const chapter = (day % 30) + 1;
    
    // Use the hour of the day to select a verse (1-24)
    const verse = (devotionalDate.getHours() % 24) + 1;
    
    const generatedReference = `${book} ${chapter}:${verse}`;
    
    const devotional = new Devotional({
      date: devotionalDate,
      title,
      content,
      reference: reference || generatedReference, // Use provided reference or generated one
      userId: req.userId,
      completed: false
    });

    await devotional.save();
    console.log('Created devotional:', devotional);
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