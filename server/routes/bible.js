const express = require('express');
const router = express.Router();
const axios = require('axios');

// Bible API base URL
const BIBLE_API_BASE_URL = 'https://api.scripture.api.bible/v1';

// Get Bible versions
router.get('/versions', async (req, res) => {
  try {
    console.log('Fetching Bible versions with API key:', process.env.BIBLE_API_KEY ? 'Present' : 'Missing');
    
    const response = await axios.get(`${BIBLE_API_BASE_URL}/bibles`, {
      headers: {
        'api-key': process.env.BIBLE_API_KEY
      }
    });
    
    console.log('Bible API response status:', response.status);
    console.log('Bible API response data:', JSON.stringify(response.data).substring(0, 200) + '...');
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Bible versions:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch Bible versions',
      details: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
  }
});

// Get Bible chapters
router.get('/chapters/:bibleId/:bookId', async (req, res) => {
  try {
    const { bibleId, bookId } = req.params;
    console.log(`Fetching chapters for Bible ${bibleId}, Book ${bookId}`);
    
    const response = await axios.get(`${BIBLE_API_BASE_URL}/bibles/${bibleId}/books/${bookId}/chapters`, {
      headers: {
        'api-key': process.env.BIBLE_API_KEY
      }
    });
    
    console.log('Bible chapters response status:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Bible chapters:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch Bible chapters',
      details: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
  }
});

// Get Bible passage
router.get('/passage/:bibleId/:passageId', async (req, res) => {
  try {
    const { bibleId, passageId } = req.params;
    console.log(`Fetching passage ${passageId} from Bible ${bibleId}`);
    
    const response = await axios.get(`${BIBLE_API_BASE_URL}/bibles/${bibleId}/passages/${passageId}`, {
      headers: {
        'api-key': process.env.BIBLE_API_KEY
      }
    });
    
    console.log('Bible passage response status:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Bible passage:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch Bible passage',
      details: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
  }
});

module.exports = router; 