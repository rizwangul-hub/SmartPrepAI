import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import axios from 'axios';
import logoImg from '../assets/logo.png';
import { updateMetaTags } from '../utils/seo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    updateMetaTags({
      title: "Sign In | PrepForce AI",
      description: "Sign in to your PrepForce AI account to continue preparing for your exams with AI-powered mock tests, intelligence questions, and study plans.",
      robots: "noindex, nofollow"
    });

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    const err = params.get('error');

    if (err) {
      setError(err);
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      if (userStr) {
        try {
          localStorage.setItem('user', decodeURIComponent(userStr));
        } catch (decodeError) {
          console.warn('Failed to decode Google login user data:', decodeError);
        }
      }

      // Remove query params from URL after handling redirect
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, document.title, url.toString());
      window.location.href = '/dashboard';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 p-4 relative overflow-hidden transition-colors duration-500">
      {/* Soft background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full bg-indigo-300/25 dark:bg-indigo-500/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-purple-300/25 dark:bg-purple-500/10 blur-3xl animate-pulse delay-700"></div>

      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-800/80 rounded-xl shadow-sm transition"
        >
          ← Home
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200/80 dark:border-slate-800 rounded-3xl shadow-xl p-8 transition-all duration-300">
        <div className="text-center mb-8">
          {logoFailed ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-2xl mb-4 shadow-lg">
                ⚡
              </div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                PrepForce AI
              </h1>
            </>
          ) : (
            <img
              src={logoImg}
              alt="PrepForce AI Logo"
              className="h-16 mx-auto mb-4 object-contain rounded-xl"
              onError={() => setLogoFailed(true)}
            />
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Accelerate your exam preparation with AI-powered mock tests
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800/80 bg-gray-50 dark:bg-slate-950/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-950 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <span
                id="forgot-password-link"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800/80 bg-gray-50 dark:bg-slate-950/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-950 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 border-t border-gray-200 dark:border-slate-800"></div>
          <span className="relative px-3 bg-white dark:bg-slate-900 text-xs text-gray-400 uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        <button
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/google`}
          className="w-full py-3 px-4 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 font-semibold rounded-xl flex items-center justify-center gap-2 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <span
            className="cursor-pointer font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            onClick={() => navigate('/register')}
          >
            Create Account
          </span>
        </p>
      </div>
    </div>
  );
}
