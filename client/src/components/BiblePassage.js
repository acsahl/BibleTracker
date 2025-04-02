import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const BiblePassage = ({ reference }) => {
  const [passage, setPassage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPassage = async () => {
      try {
        const API_KEY = process.env.REACT_APP_BIBLE_API_KEY;
        console.log('API Key:', API_KEY ? 'Present' : 'Missing');
        console.log('Reference:', reference);

        if (!API_KEY) {
          throw new Error('API key not found. Please check your environment variables.');
        }

        if (!reference) {
          reference = 'John 3:16'; // Default reference
        }

        // Format the reference for the API
        // Remove any extra spaces and ensure proper format (e.g., "John 3:16")
        const formattedReference = reference.trim().replace(/\s+/g, ' ');
        console.log('Formatted reference:', formattedReference);

        // Try to fetch with the exact reference first
        let response = await axios.get(
          `https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-01/search?query=${encodeURIComponent(formattedReference)}`,
          {
            headers: {
              'api-key': API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('API Response:', response.data);

        // If no passages found, try with a more specific format
        if (!response.data.data.passages || response.data.data.passages.length === 0) {
          console.log('No passages found with exact reference, trying with chapter format');
          
          // Extract book and chapter
          const [book, chapter] = formattedReference.split(' ');
          if (book && chapter) {
            // Try with chapter format (e.g., "Acts 6:1")
            response = await axios.get(
              `https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-01/search?query=${encodeURIComponent(`${book} ${chapter}:1`)}`,
              {
                headers: {
                  'api-key': API_KEY,
                  'Content-Type': 'application/json'
                }
              }
            );
          }

          // If still no passages found, use default reference
          if (!response.data.data.passages || response.data.data.passages.length === 0) {
            console.log('No passages found, using default reference');
            response = await axios.get(
              `https://api.scripture.api.bible/v1/bibles/9879dbb7cfe39e4d-01/search?query=John 3:16`,
              {
                headers: {
                  'api-key': API_KEY,
                  'Content-Type': 'application/json'
                }
              }
            );
          }
        }

        if (response.data.data.passages && response.data.data.passages.length > 0) {
          setPassage(response.data.data.passages[0]);
          setError(null);
        } else {
          throw new Error(`No passages found for reference: ${formattedReference}`);
        }
      } catch (err) {
        console.error('Error fetching Bible passage:', err);
        console.error('Error details:', err.response?.data || err.message);
        
        // Set a more user-friendly error message
        if (err.response?.status === 401) {
          setError('API key is invalid or expired. Please check your configuration.');
        } else if (err.response?.status === 404) {
          setError(`No passage found for: ${reference}`);
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load Bible passage. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPassage();
  }, [reference]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
        {error}
        <div className="mt-2 text-sm">
          Please check the console for more details.
        </div>
      </div>
    );
  }

  if (!passage) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 rounded-xl shadow-lg p-6 mb-6"
    >
      <h3 className="text-xl font-semibold text-white mb-4">Today's Scripture</h3>
      <div className="prose prose-invert max-w-none">
        <div 
          className="text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: passage.content }}
        />
      </div>
      <div className="mt-4 text-sm text-gray-400">
        {passage.reference}
      </div>
    </motion.div>
  );
};

export default BiblePassage; 