import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchDevotional();
  }, [date]);

  const fetchDevotional = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/devotionals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const devotionalForDate = response.data.find(
        d => new Date(d.date).toISOString().split('T')[0] === date
      );

      if (devotionalForDate) {
        setDevotional(devotionalForDate);
        setUserNotes(devotionalForDate.userNotes || '');
        setReference(devotionalForDate.reference || '');
      } else {
        // Create new devotional for the selected date
        const newDevotional = {
          date: new Date(date),
          content: `Devotional for ${new Date(date).toLocaleDateString()}`,
          userNotes: '',
          completed: false,
          reference: 'John 3:16'
        };
        const createResponse = await axios.post(
          'http://localhost:5001/api/devotionals',
          newDevotional,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDevotional(createResponse.data);
        setUserNotes('');
        setReference('John 3:16');
      }
    } catch (error) {
      console.error('Error fetching devotional:', error);
      setError('Failed to load devotional');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!devotional?._id) {
      setError('No devotional found to save');
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('token');
      console.log('Saving notes for devotional:', devotional._id);
      console.log('Notes to save:', userNotes);

      const response = await axios.put(
        `http://localhost:5001/api/devotionals/${devotional._id}`,
        {
          userNotes,
          completed: true,
          reference
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Save response:', response.data);
      setDevotional(response.data);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving notes:', error);
      setError(error.response?.data?.message || 'Failed to save notes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
          Devotional for {new Date(date).toLocaleDateString()}
        </motion.h1>

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
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-300"
            placeholder="Enter Bible reference (e.g., John 3:16)"
          />
        </motion.div>

        {reference && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Today's Bible Reading</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              <BiblePassage reference={reference} />
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Today's Reading</h2>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-300">{devotional?.content}</p>
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
            {!isEditing && userNotes && (
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
              disabled={!isEditing && userNotes}
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
      </motion.div>
    </div>
  );
};

export default DevotionalPage; 