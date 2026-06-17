// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import logoImg from '../assets/logo.png';

const exams = [
  'PMA',
  'Army',
  'Navy',
  'Air Force (PAF)',
  'ASF',
  'FIA',
  'ANF',
  'Police',
  'UDC',
  'LDC',
  'MDCAT',
  'ECAT',
];


export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    desiredExam: exams[0],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // no confirm password field — proceed with provided password

    const formData = new FormData();
    formData.append('fullName', form.fullName);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('desiredExam', form.desiredExam);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    
    try {
      await register(formData);
      setSuccess('Registration successful! Please check your email for a verification link.');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 p-4 relative overflow-hidden">
      {/* Background design elements */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-indigo-400 blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-purple-400 blur-3xl opacity-40 animate-pulse delay-700"></div>

      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-xs font-bold bg-white/20 hover:bg-white/30 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 text-white dark:text-gray-200 border border-white/10 rounded-xl transition"
        >
          ← Home
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-2xl p-8 transition-all">
        <div className="text-center mb-8">
          {logoFailed ? (
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
              PrepForce AI
            </h1>
          ) : (
            <img
              src={logoImg}
              alt="PrepForce AI Logo"
              className="h-14 mx-auto mb-4 object-contain"
              onError={() => setLogoFailed(true)}
            />
          )}
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-200">
            Create Your Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Join PrepForce AI and start taking high-yield simulated exams
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-sm text-emerald-600 dark:text-emerald-400">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                required
                placeholder="Muhammad Ali"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="ali@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4.03 3.97a.75.75 0 10-1.06 1.06l1.106 1.106A9.227 9.227 0 002.5 10c1.9 3.5 5.2 5.5 7.5 5.5 1.02 0 1.86-.22 2.5-.57l2.02 2.02a.75.75 0 101.06-1.06l-13-13zM9.88 12.12a2.25 2.25 0 01-2.74-2.74l2.74 2.74zM10 5.5a4.5 4.5 0 014.5 4.5c0 .76-.18 1.47-.5 2.09l1.02 1.02C16.02 12.6 16.5 11.33 16.5 10A8.5 8.5 0 007.5 3.5c1.33 0 2.6.48 3.61 1.28L10 7.5V5.5z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 3.5c-4.5 0-7.5 4.5-7.5 6.5S5.5 16.5 10 16.5 17.5 12 17.5 10 14.5 3.5 10 3.5zM10 13a3 3 0 110-6 3 3 0 010 6z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Target Exam
              </label>
              <select
                name="desiredExam"
                value={form.desiredExam}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              >
                {exams.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Profile Image (Optional)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-gray-100 focus:outline-none transition"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-purple-200 dark:border-purple-900 shadow" />
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Register Now'
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
          type="button"
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/google`}
          className="w-full py-3 px-4 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300 font-semibold rounded-xl flex items-center justify-center gap-2 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
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
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <span
            className="cursor-pointer font-bold text-purple-600 dark:text-purple-400 hover:underline"
            onClick={() => navigate('/login')}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
