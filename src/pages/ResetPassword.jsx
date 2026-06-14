import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  // Redirect if no token present
  useEffect(() => {
    if (!token) navigate('/forgot-password');
  }, [token, navigate]);

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0-4
  };

  const strength = getStrength(newPassword);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (newPassword.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { newPassword });
      setStatus('success');
      setMessage('Your password has been reset successfully! You can now sign in.');
    } catch (err) {
      setStatus('error');
      setMessage(
        err.response?.data?.message || 'This reset link is invalid or has expired.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full bg-pink-400 blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-blue-400 blur-3xl opacity-40 animate-pulse delay-700" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-2xl p-8 transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-2xl mb-4 shadow-lg">
            🔒
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Create a strong new password for your account
          </p>
        </div>

        {/* Success state */}
        {status === 'success' ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-green-700 dark:text-green-400 text-sm font-medium leading-relaxed">
                {message}
              </p>
            </div>
            <button
              id="go-to-login"
              onClick={() => navigate('/login')}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <>
            {/* Error banner */}
            {status === 'error' && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
                ⚠️ {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    tabIndex={-1}
                  >
                    {showNew ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Password strength bar */}
                {newPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: i <= strength ? strengthColor : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    tabIndex={-1}
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <p className={`mt-1 text-xs font-medium ${newPassword === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                id="reset-submit"
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <span
                className="cursor-pointer font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                onClick={() => navigate('/login')}
              >
                ← Back to Login
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
