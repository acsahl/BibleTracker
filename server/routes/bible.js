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
    
    // Check if API key is present
    if (!process.env.BIBLE_API_KEY) {
      console.error('Bible API key is missing');
      return res.status(500).json({
        error: 'Bible API key is missing',
        details: 'Server configuration error',
        status: 500
      });
    }
    
    // Format the passage ID for better search results
    const formattedPassageId = passageId.trim().replace(/\s+/g, ' ');
    console.log('Formatted passage ID:', formattedPassageId);
    
    try {
      // First try to search for the exact passage
      const searchResponse = await axios.get(`${BIBLE_API_BASE_URL}/bibles/${bibleId}/search`, {
        params: {
          query: formattedPassageId
        },
        headers: {
          'api-key': process.env.BIBLE_API_KEY
        }
      });
      
      console.log('Bible search response status:', searchResponse.status);
      
      if (searchResponse.data && searchResponse.data.data && searchResponse.data.data.passages && searchResponse.data.data.passages.length > 0) {
        // If we found passages, return the first one
        return res.json({
          data: {
            passages: [searchResponse.data.data.passages[0]]
          }
        });
      }
      
      // If no exact match found, try to get the chapter
      console.log('No exact passage found, trying to get chapter');
      
      // Extract book and chapter from the passage ID (e.g., "John 3:16" -> "John 3")
      const [book, chapter] = formattedPassageId.split(' ');
      if (!book || !chapter) {
        throw new Error(`Invalid passage format: ${formattedPassageId}`);
      }
      
      // Try to get the book ID first
      const booksResponse = await axios.get(`${BIBLE_API_BASE_URL}/bibles/${bibleId}/books`, {
        headers: {
          'api-key': process.env.BIBLE_API_KEY
        }
      });
      
      // Find the book ID by name (case-insensitive)
      const bookData = booksResponse.data.data.find(b => 
        b.name.toLowerCase() === book.toLowerCase() || 
        b.abbreviation.toLowerCase() === book.toLowerCase()
      );
      
      if (!bookData) {
        throw new Error(`Book not found: ${book}`);
      }
      
      // Get the chapter
      const chapterResponse = await axios.get(`${BIBLE_API_BASE_URL}/bibles/${bibleId}/books/${bookData.id}/chapters/${chapter}`, {
        headers: {
          'api-key': process.env.BIBLE_API_KEY
        }
      });
      
      console.log('Bible chapter response status:', chapterResponse.status);
      return res.json(chapterResponse.data);
      
    } catch (apiError) {
      console.error('Bible API error:', apiError.message);
      if (apiError.response) {
        console.error('API error response:', apiError.response.data);
        
        // If the Bible API returns a 400 error, pass it through with more details
        if (apiError.response.status === 400) {
          return res.status(400).json({
            error: 'Invalid Bible reference',
            details: apiError.response.data.message || 'The provided Bible reference is invalid',
            status: 400
          });
        }
        
        // For other API errors, return a 500
        return res.status(500).json({
          error: 'Bible API error',
          details: apiError.response.data.message || apiError.message,
          status: apiError.response.status
        });
      }
      
      // For network or other errors
      return res.status(500).json({
        error: 'Failed to fetch Bible passage',
        details: apiError.message,
        status: 500
      });
    }
  } catch (error) {
    console.error('Server error:', error.message);
    return res.status(500).json({
      error: 'Server error',
      details: error.message,
      status: 500
    });
  }
});

module.exports = router; 