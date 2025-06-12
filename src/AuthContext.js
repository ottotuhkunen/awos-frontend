import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { USER_URL, LOGIN_URL, LOGOUT_URL } from './data/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get(USER_URL, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
      if (error.response?.status === 401) {
        console.log('User not authenticated');
      } else {
        console.error('Error during authentication check:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = LOGIN_URL; // Redirect to login page for authentication
  };

  const logout = async () => {
    try {
      // Perform the logout action first
      await axios.get(LOGOUT_URL, {
        withCredentials: true,
      });
  
      window.location.href = '.';
  
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle logout failure (you might want to show a message to the user)
    }
  };
  
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
