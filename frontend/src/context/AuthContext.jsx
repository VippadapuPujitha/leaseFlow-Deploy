import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();
  const [user, setUser] = useState(() => parseUser());

  const logout = () => {
    localStorage.removeItem('leaseflow_user');
    localStorage.removeItem('leaseflow_token');

    setUser(null);

    navigate('/login', { replace: true });
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
