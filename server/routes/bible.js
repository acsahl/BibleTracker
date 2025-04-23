const express = require('express');
const router = express.Router();
const axios = require('axios');

// Bible API base URL
const BIBLE_API_BASE_URL = 'https://api.scripture.api.bible/v1';

// Get Bible versions
router.get('/versions', async (req, res) => {
  try {
    const response = await axios.get(`${BIBLE_API_BASE_URL}/bibles`, {
      headers: {
        'api-key': process.env.BIBLE_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    res.status(500).json({ error: 'Failed to fetch Bible versions' });
  }
});

// Get Bible chapters
router.get('/chapters/:bibleId/:bookId', async (req, res) => {
  try {
    const { bibleId, bookId } = req.params;
    const response = await axios.get(`${BIBLE_API_BASE_URL}/bibles/${bibleId}/books/${bookId}/chapters`, {
      headers: {
        'api-key': process.env.BIBLE_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Bible chapters:', error);
    res.status(500).json({ error: 'Failed to fetch Bible chapters' });
  }
});

// Get Bible passage
router.get('/passage/:bibleId/:passageId', async (req, res) => {
  try {
    const { bibleId, passageId } = req.params;
    const response = await axios.get(`${BIBLE_API_BASE_URL}/bibles/${bibleId}/passages/${passageId}`, {
      headers: {
        'api-key': process.env.BIBLE_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Bible passage:', error);
    res.status(500).json({ error: 'Failed to fetch Bible passage' });
  }
});

module.exports = router; 