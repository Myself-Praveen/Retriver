import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('retriever_token'));

  useEffect(() => {
    // Check local storage token on load
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    // Listen for unauthorized events from Axios
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      // In a real app, you might have an endpoint like GET /auth/me
      // For now, if we have a token, we decode it or fetch profile.
      // Since our FastAPI backend returns token details:
      const response = await api.get('/auth/me').catch(() => null);
      if (response && response.data) {
        setUser(response.data);
      } else {
        // Fallback or handle invalid token
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2PasswordRequestForm expects 'username'
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const { access_token } = response.data;
    localStorage.setItem('retriever_token', access_token);
    setToken(access_token);
    return true;
  };

  const register = async (email, password, full_name) => {
    await api.post('/auth/register', { email, password, full_name });
    return login(email, password); // Auto login after register
  };

  const logout = () => {
    localStorage.removeItem('retriever_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
