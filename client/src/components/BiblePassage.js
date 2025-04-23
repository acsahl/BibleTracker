import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const BiblePassage = ({ reference }) => {
  const [passage, setPassage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseDetails, setResponseDetails] = useState(null);

  useEffect(() => {
    const fetchPassage = async () => {
      try {
        console.log('Reference:', reference);

        if (!reference) {
          reference = 'John 3:16'; // Default reference
        }

        // Format the reference for the API
        // Remove any extra spaces and ensure proper format (e.g., "John 3:16")
        const formattedReference = reference.trim().replace(/\s+/g, ' ');
        console.log('Formatted reference:', formattedReference);

        // Format verse numbers to ensure space between chapter and verse
        const formatVerseNumbers = (text) => {
          // Add space between chapter and verse numbers
          return text
            // Add space between number and text (e.g., "13I" -> "13 I")
            .replace(/(\d+)([A-Za-z])/g, '$1 $2')
            // Add space between number and text at the beginning of verses
            .replace(/^(\d+)([A-Za-z])/gm, '$1 $2')
            // Add space between number and text after a period
            .replace(/\.(\d+)([A-Za-z])/g, '. $1 $2');
        };

        // Use the server's API endpoint instead of direct Bible API
        // We'll use a default Bible ID for now
        const bibleId = '9879dbb7cfe39e4d-01';
        
        // Use the full API URL instead of a relative path
        const apiUrl = process.env.REACT_APP_API_URL || 'https://bibletracker-1.onrender.com';
        console.log('Using API URL:', apiUrl);
        
        try {
          // First try to get the passage directly
          const response = await axios.get(`${apiUrl}/api/bible/passage/${bibleId}/${encodeURIComponent(formattedReference)}`);
          console.log('API Response:', response.data);
          setResponseDetails(response.data);
          
          if (response.data && response.data.data && response.data.data.passages && response.data.data.passages.length > 0) {
            // Format the passage content to ensure proper spacing
            const passage = response.data.data.passages[0];
            if (passage.content) {
              passage.content = formatVerseNumbers(passage.content);
            }
            setPassage(passage);
            setError(null);
          } else {
            // If no passages found, try with a more specific format
            console.log('No passages found with exact reference, trying with chapter format');
            
            // Extract book and chapter
            const [book, chapter] = formattedReference.split(' ');
            if (book && chapter) {
              // Try with chapter format (e.g., "Acts 6:1")
              const chapterResponse = await axios.get(`${apiUrl}/api/bible/passage/${bibleId}/${encodeURIComponent(`${book} ${chapter}:1`)}`);
              console.log('Chapter Response:', chapterResponse.data);
              setResponseDetails(chapterResponse.data);
              
              if (chapterResponse.data && chapterResponse.data.data && chapterResponse.data.data.passages && chapterResponse.data.data.passages.length > 0) {
                // Format the passage content to ensure proper spacing
                const passage = chapterResponse.data.data.passages[0];
                if (passage.content) {
                  passage.content = formatVerseNumbers(passage.content);
                }
                setPassage(passage);
                setError(null);
              } else {
                // If still no passages found, use default reference
                console.log('No passages found, using default reference');
                const defaultResponse = await axios.get(`${apiUrl}/api/bible/passage/${bibleId}/John%203:16`);
                console.log('Default Response:', defaultResponse.data);
                setResponseDetails(defaultResponse.data);
                
                if (defaultResponse.data && defaultResponse.data.data && defaultResponse.data.data.passages && defaultResponse.data.data.passages.length > 0) {
                  // Format the passage content to ensure proper spacing
                  const passage = defaultResponse.data.data.passages[0];
                  if (passage.content) {
                    passage.content = formatVerseNumbers(passage.content);
                  }
                  setPassage(passage);
                  setError(null);
                } else {
                  throw new Error('No passages found');
                }
              }
            } else {
              throw new Error('Invalid reference format');
            }
          }
        } catch (err) {
          console.error('Error fetching Bible passage:', err);
          console.error('Error response:', err.response?.data);
          setError(err.response?.data?.error || err.message || 'Failed to fetch Bible passage');
          setResponseDetails(err.response?.data);
        }
      } catch (err) {
        console.error('Error fetching Bible passage:', err);
        console.error('Error details:', err.message);
        setError(err.message || 'Failed to fetch Bible passage');
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
      <div className="bg-red-900/30 border border-red-700/50 text-red-200 px-4 py-3 rounded-lg">
        <div className="font-medium text-red-300">
          This Bible reference does not exist.
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