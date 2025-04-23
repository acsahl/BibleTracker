import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BibleApiTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing Bible API through server proxy');
        
        // Use the server's API endpoint instead of direct Bible API
        const response = await axios.get('/api/bible/versions');
        
        console.log('Bible API test response:', response.data);
        setResult(response.data);
        setError(null);
      } catch (err) {
        console.error('Bible API test error:', err);
        console.error('Error details:', err.message);
        
        if (err.response?.status === 401) {
          setError('API key is invalid or expired');
        } else if (err.response?.status === 403) {
          setError('Access denied. This may be due to server configuration issues');
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
        <p className="text-gray-300">Using server proxy for Bible API requests</p>
        <p className="text-gray-300">API URL: {process.env.REACT_APP_API_URL || 'Not set'}</p>
      </div>
    </div>
  );
};

export default BibleApiTest; 