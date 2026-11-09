import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('damizistan_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    if (user) {
      localStorage.setItem('damizistan_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('damizistan_user');
    }
  }, [user]);

  const login = (name, contact) => {
    const newUser = {
      name: name.trim() || 'همراه گرامی',
      contact: contact.trim(),
      registeredAt: new Date().toLocaleDateString('fa-IR'),
    };
    setUser(newUser);
    setIsAuthOpen(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthOpen,
        authMode,
        setAuthMode,
        openAuth,
        closeAuth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
