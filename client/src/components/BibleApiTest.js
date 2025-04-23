import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BibleApiTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        const API_KEY = process.env.REACT_APP_BIBLE_API_KEY;
        console.log('Testing Bible API with key:', API_KEY ? 'Present' : 'Missing');
        
        if (!API_KEY) {
          throw new Error('API key not found in environment variables');
        }
        
        // Try a simple request to the Bible API using a different approach
        // Using a direct fetch with mode: 'cors' and credentials: 'omit'
        const response = await fetch(
          'https://api.scripture.api.bible/v1/bibles',
          {
            method: 'GET',
            headers: {
              'api-key': API_KEY,
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
          }
        );
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Bible API test response:', data);
        setResult(data);
        setError(null);
      } catch (err) {
        console.error('Bible API test error:', err);
        console.error('Error details:', err.message);
        
        if (err.message.includes('401')) {
          setError('API key is invalid or expired');
        } else if (err.message.includes('403')) {
          setError('Access denied. This may be due to CORS restrictions or an invalid API key');
        } else if (err.message.includes('Network')) {
          setError('Network error. Please check your connection');
        } else {
          setError(err.message || 'Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };
    
    testApi();
  }, []);

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Bible API Test</h2>
      
      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Success!</p>
          <p>API connection successful. Found {result.data?.length || 0} Bibles.</p>
        </div>
      )}
      
      <div className="mt-4">
        <p className="text-gray-300">API Key: {process.env.REACT_APP_BIBLE_API_KEY ? 'Present' : 'Missing'}</p>
        <p className="text-gray-300">API URL: {process.env.REACT_APP_API_URL || 'Not set'}</p>
      </div>
    </div>
  );
};

export default BibleApiTest; 