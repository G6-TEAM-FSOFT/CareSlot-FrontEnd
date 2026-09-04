import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('care_slot_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('care_slot_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse cached user data', e);
      }
    }
    setLoading(false);
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('care_slot_token', authToken);
    localStorage.setItem('care_slot_user', JSON.stringify(userData));
    if (userData.clinicId) {
      localStorage.setItem('care_slot_clinic_id', userData.clinicId);
    } else {
      localStorage.removeItem('care_slot_clinic_id');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('care_slot_token');
    localStorage.removeItem('care_slot_user');
    localStorage.removeItem('care_slot_clinic_id');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
