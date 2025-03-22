import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import DevotionalCalendar from './components/Calendar';
import DevotionalPage from './components/DevotionalPage';
import Navbar from './components/Navbar';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and is valid
    const token = localStorage.getItem('token');
    if (token) {
      // You could add additional token validation here if needed
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black">
        {isAuthenticated && <Navbar />}
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/calendar" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/calendar" />} />
            <Route path="/calendar" element={isAuthenticated ? <DevotionalCalendar /> : <Navigate to="/login" />} />
            <Route path="/devotional/:date" element={isAuthenticated ? <DevotionalPage /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={isAuthenticated ? "/calendar" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
