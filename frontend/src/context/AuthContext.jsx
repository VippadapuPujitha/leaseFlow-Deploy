import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const parseUser = () => {
  const rawUser = localStorage.getItem('leaseflow_user');
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser);
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => parseUser());

  useEffect(() => {
    const stored = parseUser();
    if (stored) {
      setUser(stored);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('leaseflow_user', JSON.stringify(userData));
    localStorage.setItem('leaseflow_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('leaseflow_user');
    localStorage.removeItem('leaseflow_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
