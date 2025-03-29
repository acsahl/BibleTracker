import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BiblePassage from './BiblePassage';

const DevotionalCalendar = () => {
  const navigate = useNavigate();
  const [devotionals, setDevotionals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [streak, setStreak] = useState(0);

  const toLocalMidnight = (date) => {
    const d = new Date(date);
    // Convert to UTC midnight
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const calculateStreak = useCallback((entries) => {
    console.log('Calculating streak for entries:', entries);
    
    const completedDates = new Set(
      entries
        .filter(d => {
          const isCompleted = d.completed && d.userNotes?.trim();
          console.log('Devotional date:', d.date, 'completed:', d.completed, 'has notes:', !!d.userNotes?.trim());
          return isCompleted;
        })
        .map(d => {
          const utcTime = toLocalMidnight(d.date);
          console.log('Completed date:', d.date, 'UTC time:', utcTime);
          return utcTime;
        })
    );
    
    console.log('Completed dates set:', Array.from(completedDates));

    // Find the most recent completed date
    const mostRecentDate = Math.max(...Array.from(completedDates));
    console.log('Most recent completed date:', new Date(mostRecentDate).toISOString());

    let streak = 0;
    let current = new Date(mostRecentDate);
    console.log('Starting from most recent date:', current.toISOString());

    // Check previous days
    for (let i = 0; i < 365; i++) {
      const time = current.getTime();
      console.log('Checking date:', current.toISOString(), 'time:', time, 'is in completedDates:', completedDates.has(time));
      
      if (completedDates.has(time)) {
        streak++;
        console.log('Found completed date, streak:', streak);
        // Move to previous day in UTC
        current = new Date(Date.UTC(
          current.getUTCFullYear(),
          current.getUTCMonth(),
          current.getUTCDate() - 1
        ));
      } else {
        console.log('Break streak at:', current.toISOString());
        break;
      }
    }
    console.log('Final streak:', streak);
    return streak;
  }, []);

  const fetchDevotionals = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/devotionals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Raw devotionals from API:', response.data);
      
      // Parse dates and ensure they're in UTC
      const parsedDevotionals = response.data.map(devotional => ({
        ...devotional,
        date: new Date(devotional.date)
      }));
      console.log('Parsed devotionals:', parsedDevotionals.map(d => ({
        date: d.date.toISOString(),
        completed: d.completed,
        hasNotes: !!d.userNotes?.trim()
      })));
      
      setDevotionals(parsedDevotionals);
      const calculatedStreak = calculateStreak(parsedDevotionals);
      console.log('Setting streak to:', calculatedStreak);
      setStreak(calculatedStreak);
      setError('');
    } catch (error) {
      console.error('Error fetching devotionals:', error);
      setError('Failed to load devotionals. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [calculateStreak]);

  useEffect(() => {
    fetchDevotionals();
  }, [fetchDevotionals]);

  const isSameDay = (a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    // Compare UTC dates
    return dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
           dateA.getUTCMonth() === dateB.getUTCMonth() &&
           dateA.getUTCDate() === dateB.getUTCDate();
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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Bible Study Calendar</h1>
        <p className="text-gray-400">Track your daily devotionals and spiritual journey</p>
        <div className="mt-2 text-blue-400">🔥 Current Streak: {streak} day{streak !== 1 && 's'}</div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      {selectedDevotional && selectedDevotional.reference && (
        <BiblePassage reference={selectedDevotional.reference} />
      )}

      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-xl p-8">
        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          className="mx-auto rounded-lg border-none !w-full"
          tileClassName={({ date }) => {
            const devotional = devotionals.find(
              d => isSameDay(d.date, date)
            );
          
            return devotional && devotional.completed && devotional.userNotes?.trim()
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 rounded-full'
              : 'hover:bg-gray-700 transition-all duration-200 rounded-full text-gray-200';
          }}
          
          tileContent={({ date }) => {
            const devotional = devotionals.find(
              d => isSameDay(d.date, date)
            );
          
            return devotional && devotional.completed && devotional.userNotes?.trim() ? (
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
      </div>
    </div>
  );
};

export default DevotionalCalendar;
