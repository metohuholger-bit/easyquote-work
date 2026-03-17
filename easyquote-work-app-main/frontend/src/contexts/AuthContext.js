import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../lib/axiosClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Invalid user in localStorage', error);
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;

      const response = await axiosClient.post('/auth/google', { credential });
      const { access_token, user } = response.data;

      setToken(access_token);
      setUser(user);

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};