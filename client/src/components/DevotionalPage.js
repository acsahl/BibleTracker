import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeftIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import BiblePassage from './BiblePassage';

const DevotionalPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [devotional, setDevotional] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchDevotional = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/devotionals/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setDevotional(response.data);
        setUserNotes(response.data.userNotes || '');
        setReference(response.data.reference || '');
      }
    } catch (error) {
      console.error('Error fetching devotional:', error);
      if (error.response?.status === 404) {
        // Devotional doesn't exist, show the create button
        setDevotional(null);
      } else {
        setError('Failed to load devotional');
      }
    } finally {
      setLoading(false);
    }
  }, [date]);

  const createNewDevotional = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [year, month, day] = date.split('-');

      const newDevotional = {
        date: date,
        title: `Devotional for ${Number(month)}/${Number(day)}/${year}`,
        content: 'Start your devotional journey...',
        reference: '',  // Let the server set the reference
        completed: false
      };
      
      console.log('Creating new devotional:', newDevotional);
      const createResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/devotionals`,
        newDevotional,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Created devotional:', createResponse.data);
      setDevotional(createResponse.data);
      setUserNotes('');
      setReference(createResponse.data.reference || '');  // Use the reference from the server
    } catch (error) {
      console.error('Error creating devotional:', error);
      setError('Failed to create devotional');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevotional();
  }, [fetchDevotional]);

  const handleSaveNotes = async () => {
    if (!devotional?._id) {
      setError('No devotional found to save');
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('token');
      console.log('Saving notes for devotional:', devotional._id);
      console.log('🔼 Sending to backend:', {
        title: devotional.title,
        content: devotional.content,
        userNotes: userNotes,
        completed: true,
        reference: reference
      });

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/devotionals/${devotional._id}`,
        {
          title: devotional.title,
          content: devotional.content,
          userNotes: userNotes,
          completed: true,
          reference: reference
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000, // 10 second timeout
          withCredentials: true
        }
      );

      console.log('✅ Save response:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Update local state with the response data
      setDevotional(response.data);
      setUserNotes(response.data.userNotes || '');
      setReference(response.data.reference || '');
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving notes:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and try again.');
      } else if (error.response?.status === 502) {
        setError('Server is temporarily unavailable. Please try again in a few moments.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to save notes');
      }
    }
  };

  // Add new function to handle reference changes
  const handleReferenceChange = async (newReference) => {
    setReference(newReference);
    if (devotional?._id) {
      try {
        setError('');
        const token = localStorage.getItem('token');
        console.log('Saving reference for devotional:', devotional._id);
        
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/devotionals/${devotional._id}`,
          {
            title: devotional.title,
            content: devotional.content,
            userNotes: userNotes,
            completed: devotional.completed,
            reference: newReference
          },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        if (!response.data) {
          throw new Error('No data received from server');
        }

        // Update local state with the response data
        setDevotional(response.data);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error('Error saving reference:', error);
        setError(error.response?.data?.message || error.message || 'Failed to save reference');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  const [year, month, day] = date.split('-');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black min-h-screen">
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate('/calendar')}
        className="flex items-center text-blue-400 hover:text-blue-300 mb-6"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Back to Calendar
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 rounded-xl shadow-lg p-6"
      >
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-white mb-6"
        >
       {`Devotional for ${Number(month)}/${Number(day)}/${year}`}
  </motion.h1>

        {!devotional ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8"
          >
            <p className="text-gray-300 mb-4">No devotional exists for this date.</p>
            <button
              onClick={createNewDevotional}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Create New Devotional
            </button>
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-red-900/50 text-red-200 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-green-900/50 text-green-200 rounded-lg flex items-center"
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Notes saved successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Bible Reference</h2>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => handleReferenceChange(e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Bible reference (e.g., John 3:16)"
                    />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  <p>Format examples:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Single verse: John 3:16</li>
                    <li>Chapter only: Psalm 23</li>
                    <li>Verse range: 1 Corinthians 13:4-7</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Today's Bible Reading</h2>
              <div className="bg-gray-800 rounded-lg p-4">
                {reference ? (
                  <BiblePassage reference={reference} />
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    Enter a Bible reference above to see the passage
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Your Notes</h2>
                {!isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-blue-400 hover:text-blue-300"
                  >
                    <PencilIcon className="h-5 w-5 mr-1" />
                    Edit Notes
                  </motion.button>
                )}
              </div>
              <div className="relative">
                <motion.textarea
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-300 transition-all duration-200 ${
                    isEditing ? 'border-blue-500' : 'border-gray-700'
                  }`}
                  rows="6"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Add your thoughts and reflections here..."
                  disabled={!isEditing}
                />
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-4 right-4 flex space-x-2"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsEditing(false);
                          setUserNotes(devotional?.userNotes || '');
                        }}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveNotes}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                      >
                        <CheckIcon className="h-5 w-5 mr-1" />
                        Save Notes
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DevotionalPage; 