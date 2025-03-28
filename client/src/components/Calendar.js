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

  const isSameDay = (a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.toISOString().slice(0, 10) === dateB.toISOString().slice(0, 10);
  };

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
    setSelectedDate(newDate);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
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
    d => isSameDay(d.date, selectedDate)
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
              const devotionalForDate = devotionals.find(d => isSameDay(d.date, date));
              return devotionalForDate 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 rounded-full' 
                : 'hover:bg-gray-700 transition-all duration-200 rounded-full text-gray-200';
            }}
            tileContent={({ date }) => {
              const devotionalForDate = devotionals.find(d => isSameDay(d.date, date));
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
      </motion.div>
    </motion.div>
  );
};

export default DevotionalCalendar;
