import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view the leaderboard');
          setLoading(false);
          return;
        }

        console.log('Fetching leaderboard with token:', token.substring(0, 10) + '...');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/leaderboard`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Leaderboard response:', response.data);
        setUsers(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
          setError(error.response.data.message || 'Failed to load leaderboard. Please try refreshing the page.');
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          setError('No response from server. Please check your connection and try again.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
          setError('Failed to load leaderboard. Please try refreshing the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Bible Study Leaderboard</h1>
        <p className="text-gray-400">See who has the longest daily devotional streak</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-xl p-8">
        <div className="space-y-4">
          {users.map((user, index) => (
            <div
              key={user._id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                index === 0 ? 'bg-yellow-500/20' :
                index === 1 ? 'bg-gray-400/20' :
                index === 2 ? 'bg-amber-700/20' :
                'bg-gray-800/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`text-2xl font-bold ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-amber-500' :
                  'text-gray-400'
                }`}>
                  #{index + 1}
                </div>
                <div className="text-lg font-semibold">{user.name}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🔥</span>
                <span className="text-xl font-bold">{user.streak}</span>
                <span className="text-gray-400">days</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 