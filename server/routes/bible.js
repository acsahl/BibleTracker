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
    
    // The Bible API expects a specific format for passage IDs
    // Let's try to search for the passage instead of using the passage ID directly
    const searchResponse = await axios.get(`${BIBLE_API_BASE_URL}/bibles/${bibleId}/search`, {
      params: {
        query: passageId
      },
      headers: {
        'api-key': process.env.BIBLE_API_KEY
      }
    });
    
    console.log('Bible search response status:', searchResponse.status);
    
    if (searchResponse.data && searchResponse.data.data && searchResponse.data.data.passages && searchResponse.data.data.passages.length > 0) {
      // If we found passages, return the first one
      res.json({
        data: {
          passages: [searchResponse.data.data.passages[0]]
        }
      });
    } else {
      // If no passages found, try to get the chapter
      console.log('No passages found, trying to get chapter');
      
      // Extract book and chapter from the passage ID (e.g., "John 3:16" -> "John 3")
      const [book, chapter] = passageId.split(' ');
      if (book && chapter) {
        // Try to get the book ID first
        const booksResponse = await axios.get(`${BIBLE_API_BASE_URL}/bibles/${bibleId}/books`, {
          headers: {
            'api-key': process.env.BIBLE_API_KEY
          }
        });
        
        // Find the book ID by name
        const bookData = booksResponse.data.data.find(b => b.name.toLowerCase() === book.toLowerCase());
        if (bookData) {
          // Get the chapter
          const chapterResponse = await axios.get(`${BIBLE_API_BASE_URL}/bibles/${bibleId}/books/${bookData.id}/chapters/${chapter}`, {
            headers: {
              'api-key': process.env.BIBLE_API_KEY
            }
          });
          
          console.log('Bible chapter response status:', chapterResponse.status);
          res.json(chapterResponse.data);
        } else {
          throw new Error(`Book not found: ${book}`);
        }
      } else {
        throw new Error(`Invalid passage format: ${passageId}`);
      }
    }
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