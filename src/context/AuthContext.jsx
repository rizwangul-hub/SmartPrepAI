// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State
  useEffect(() => {
    const initializeAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      const urlUser = params.get('user');

      let currentUser = null;

      if (urlToken) {
        localStorage.setItem('token', urlToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${urlToken}`;

        if (urlUser) {
          try {
            const decoded = JSON.parse(decodeURIComponent(urlUser));
            localStorage.setItem('user', JSON.stringify(decoded));
            currentUser = decoded;
          } catch (decodeError) {
            console.warn('Failed to decode user data from URL:', decodeError);
          }
        }

        const cleanUrl = new URL(window.location.href);
        cleanUrl.search = '';
        window.history.replaceState({}, document.title, cleanUrl.toString());
      }

      if (currentUser) {
        setUser(currentUser);
      } else {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          try {
            const res = await axios.get('/api/auth/me');
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          } catch (err) {
            console.error('Failed to verify token on mount', err);
            logout();
          }
        } else {
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  // Axios response interceptor to handle 401 globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return userData;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', formData);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
