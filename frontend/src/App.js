import React, { createContext, useContext, useState, useEffect } from 'react';
import "@/App.css";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import EventsPage from "@/pages/EventsPage";
import EventFormPage from "@/pages/EventFormPage";
import RegistrationsPage from "@/pages/RegistrationsPage";
import ScannerPage from "@/pages/ScannerPage";
import WalkInPage from "@/pages/WalkInPage";
import BrandingPage from "@/pages/BrandingPage";
import PublicEventPage from "@/pages/PublicEventPage";
import RegisterPage from "@/pages/RegisterPage";
import TicketPage from "@/pages/TicketPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Configure axios
axios.defaults.withCredentials = true;

// Add token to all requests if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    // Store token in localStorage for persistence
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicEventPage />} />
          <Route path="/event/:eventId" element={<RegisterPage />} />
          <Route path="/ticket/:registrationId" element={<TicketPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/events/new" element={
            <ProtectedRoute>
              <EventFormPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/events/:eventId/edit" element={
            <ProtectedRoute>
              <EventFormPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/registrations" element={
            <ProtectedRoute>
              <RegistrationsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/scanner" element={
            <ProtectedRoute>
              <ScannerPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/walk-in" element={
            <ProtectedRoute>
              <WalkInPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/branding" element={
            <ProtectedRoute>
              <BrandingPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
