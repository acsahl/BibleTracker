import React, { useState, useEffect } from 'react';

const AuthTest = () => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const testAuth = async () => {
    setStatus('loading');
    setError(null);
    setResponse(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Token length:', token?.length);
      console.log('Token format check:', token?.split('.').length === 3 ? 'Valid JWT format' : 'Invalid JWT format');

      if (!token) {
        throw new Error('No token found in localStorage');
      }

      // Log the first part of the token for debugging (without exposing sensitive data)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          const header = JSON.parse(atob(tokenParts[0]));
          console.log('Token header:', header);
        } catch (e) {
          console.error('Error parsing token header:', e);
        }
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Auth test response status:', response.status);
      const data = await response.json();
      console.log('Auth test response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setResponse(data);
      setStatus('success');
    } catch (err) {
      console.error('Auth test error:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Authentication Test</h2>
      
      <button
        onClick={testAuth}
        disabled={status === 'loading'}
        className={`px-4 py-2 rounded ${
          status === 'loading'
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {status === 'loading' ? 'Testing...' : 'Test Authentication'}
      </button>

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-900/50 rounded">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-900/50 rounded">
          <p className="text-green-400">Authentication successful!</p>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthTest; 