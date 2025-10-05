import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('user');

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Use cached user immediately for instant render
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          setLoading(false);
        } catch (_) {
          // ignore parse errors
        }
      }

      // Always validate in background to keep data fresh
      api.get('/me')
        .then(response => {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isAgent = () => user?.role === 'agent' || user?.role === 'admin';
  const isUser = () => user?.role === 'user';

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isAgent,
    isUser,
    isAuthenticated: !!user
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
