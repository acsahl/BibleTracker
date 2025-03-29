const express = require('express');
const router = express.Router();
const User = require('../models/User');
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

// Helper function to calculate streak
const calculateStreak = (devotionals) => {
  const completedDates = new Set(
    devotionals
      .filter(d => d.completed && d.userNotes?.trim())
      .map(d => {
        const date = new Date(d.date);
        return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      })
  );

  if (completedDates.size === 0) return 0;

  const mostRecentDate = Math.max(...Array.from(completedDates));
  let streak = 0;
  let current = new Date(mostRecentDate);

  for (let i = 0; i < 365; i++) {
    const time = current.getTime();
    if (completedDates.has(time)) {
      streak++;
      current = new Date(Date.UTC(
        current.getUTCFullYear(),
        current.getUTCMonth(),
        current.getUTCDate() - 1
      ));
    } else {
      break;
    }
  }
  return streak;
};

// Get leaderboard
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('Fetching leaderboard data...');
    
    // Get all users
    const users = await User.find({}, 'name');
    console.log('Found users:', users.length);
    
    // Get all devotionals
    const devotionals = await Devotional.find({});
    console.log('Found devotionals:', devotionals.length);
    
    // Calculate streak for each user
    const usersWithStreaks = await Promise.all(users.map(async (user) => {
      const userDevotionals = devotionals.filter(d => d.userId.toString() === user._id.toString());
      console.log(`User ${user.name} has ${userDevotionals.length} devotionals`);
      const streak = calculateStreak(userDevotionals);
      return {
        _id: user._id,
        name: user.name,
        streak
      };
    }));

    // Sort by streak (descending)
    usersWithStreaks.sort((a, b) => b.streak - a.streak);
    console.log('Final leaderboard data:', usersWithStreaks);

    res.json(usersWithStreaks);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
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

module.exports = router; 