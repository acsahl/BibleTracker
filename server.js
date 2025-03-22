const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with options
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 15000, // Timeout after 15s instead of 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4 // Use IPv4, skip trying IPv6
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1); // Exit the process if MongoDB connection fails
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Devotional Schema
const devotionalSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  content: { type: String, required: true },
  userNotes: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Devotional = mongoose.model('Devotional', devotionalSchema);

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Auth Routes
app.post('/api/users/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    const user = new User({
      ...req.body,
      password: hashedPassword
    });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    console.log('Request body:', req.body);

    if (!req.body.email || !req.body.password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: req.body.email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found:', req.body.email);
      return res.status(401).json({ message: 'Invalid login credentials' });
    }
    
    console.log('User found, comparing passwords');
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', req.body.email);
      return res.status(401).json({ message: 'Invalid login credentials' });
    }
    
    console.log('Password match successful, generating token');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    console.log('Login successful for user:', req.body.email);
    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token 
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Devotional Routes (Protected)
app.get('/api/devotionals', auth, async (req, res) => {
  try {
    console.log('Fetching devotionals for user:', req.user._id);
    const devotionals = await Devotional.find({ userId: req.user._id });
    console.log('Found devotionals:', devotionals.length);
    res.json(devotionals);
  } catch (error) {
    console.error('Get Devotionals Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/devotionals', auth, async (req, res) => {
  const devotional = new Devotional({
    ...req.body,
    userId: req.user._id
  });
  try {
    const newDevotional = await devotional.save();
    res.status(201).json(newDevotional);
  } catch (error) {
    console.error('Create Devotional Error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/devotionals/:id', auth, async (req, res) => {
  try {
    const devotional = await Devotional.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!devotional) {
      return res.status(404).json({ message: 'Devotional not found' });
    }
    res.json(devotional);
  } catch (error) {
    console.error('Update Devotional Error:', error);
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 