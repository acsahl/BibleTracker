import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import BiblePassage from './BiblePassage';

const DevotionalCalendar = () => {
  const navigate = useNavigate();
  const [devotionals, setDevotionals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchDevotionals();
  }, []);

  const fetchDevotionals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/devotionals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevotionals(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load devotionals. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (newDate) => {
    const localDate = new Date(newDate);
    localDate.setHours(0, 0, 0, 0); // normalize to midnight
    setSelectedDate(localDate);
  
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    navigate(`/devotional/${formattedDate}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const selectedDevotional = selectedDate ? devotionals.find(
    d => {
      const devotionalDate = new Date(d.date);
      return devotionalDate.getFullYear() === selectedDate.getFullYear() &&
             devotionalDate.getMonth() === selectedDate.getMonth() &&
             devotionalDate.getDate() === selectedDate.getDate();
    }
  ) : null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-black"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-4xl mx-auto px-4 py-8 bg-black"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Bible Study Calendar</h1>
          <p className="text-gray-300">Track your daily devotionals and spiritual journey</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}

        {selectedDevotional && selectedDevotional.reference && (
          <BiblePassage reference={selectedDevotional.reference} />
        )}

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-900 rounded-2xl shadow-xl p-8"
        >
          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            className="mx-auto rounded-lg border-none !w-full"
            tileClassName={({ date }) => {
              const devotionalForDate = devotionals.find(
                d => {
                  const devotionalDate = new Date(d.date);
                  return devotionalDate.getFullYear() === date.getFullYear() &&
                         devotionalDate.getMonth() === date.getMonth() &&
                         devotionalDate.getDate() === date.getDate();
                }
              );
              return devotionalForDate 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 rounded-full' 
                : 'hover:bg-gray-700 transition-all duration-200 rounded-full text-gray-200';
            }}
            tileContent={({ date }) => {
              const devotionalForDate = devotionals.find(
                d => {
                  const devotionalDate = new Date(d.date);
                  return devotionalDate.getFullYear() === date.getFullYear() &&
                         devotionalDate.getMonth() === date.getMonth() &&
                         devotionalDate.getDate() === date.getDate();
                }
              );
              return devotionalForDate && devotionalForDate.completed ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : null;
            }}
            formatDay={(locale, date) => date.getDate()}
            minDetail="month"
            maxDetail="month"
            showNeighboringMonth={false}
            showFixedNumberOfWeeks={false}
            calendarType="gregory"
            nextLabel={<svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>}
            prevLabel={<svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>}
            next2Label={null}
            prev2Label={null}
            navigationLabel={({ date }) => (
              <div className="flex items-center justify-center">
                <span className="text-xl font-semibold text-white">
                  {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-900 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Legend</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mr-3"></div>
                <span className="text-gray-300">Today's Devotional</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-700 rounded-full mr-3"></div>
                <span className="text-gray-300">No Devotional</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Completed</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-gray-900 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Quick Tips</h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Click on any blue date to view or add a devotional
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                A checkmark indicates completed devotionals
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Use the arrows to navigate between months
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DevotionalCalendar; 