import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { updateMetaTags } from '../utils/seo';

export default function ForgotPassword() {
  useEffect(() => {
    updateMetaTags({
      title: "Forgot Password | PrepForce AI",
      description: "Recover or reset your PrepForce AI account password securely.",
      robots: "noindex, nofollow"
    });
  }, []);

  const [step, setStep] = useState('email'); // email | otp | change | done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const resetState = () => {
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setStatus('idle');
    setMessage('');
    setInfo('');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      setStatus('success');
      setInfo('We sent a 6-digit OTP to your email. Please enter it below.');
      setStep('otp');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await axios.post('/api/auth/verify-otp', { email, otp });
      setStatus('success');
      setInfo('OTP verified. Enter a new password below.');
      setStep('change');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    try {
      await axios.post('/api/auth/reset-password', {
        email,
        otp,
        password,
        confirmPassword,
      });
      setStatus('success');
      setStep('done');
      setMessage('Password reset successfully. You can now log in with your new password.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][strength];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 p-4 relative overflow-hidden transition-colors duration-500">
      {/* Soft background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full bg-indigo-300/25 dark:bg-indigo-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-purple-300/25 dark:bg-purple-500/10 blur-3xl animate-pulse delay-700" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200/80 dark:border-slate-800 rounded-3xl shadow-xl p-8 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-tr from-indigo-500 to-purple-600 text-white font-bold text-2xl mb-4 shadow-lg">
            🔐
          </div>
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {step === 'email' && 'Forgot Password?'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'change' && 'Create New Password'}
            {step === 'done' && 'Password Reset'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {step === 'email' && 'Enter your email to receive a password reset OTP.'}
            {step === 'otp' && 'Check your email for the 6-digit OTP and enter it below.'}
            {step === 'change' && 'Set a new password for your account.'}
            {step === 'done' && 'Your password has been updated successfully.'}
          </p>
        </div>

        {status === 'error' && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
            ⚠️ {message}
          </div>
        )}

        {status === 'success' && info && step !== 'done' && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-sm text-emerald-700 dark:text-emerald-300">
            ✅ {info}
          </div>
        )}

        {step === 'done' ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-green-700 dark:text-green-400 text-sm font-medium leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 px-4 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form
            onSubmit={step === 'email' ? handleEmailSubmit : step === 'otp' ? handleVerifyOtp : handleResetPassword}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={step !== 'email'}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800/80 bg-gray-50 dark:bg-slate-950/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-950 transition"
              />
            </div>

            {step !== 'email' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  OTP Code
                </label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800/80 bg-gray-50 dark:bg-slate-950/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-950 transition"
                />
              </div>
            )}

            {step === 'change' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-slate-800/80 bg-gray-50 dark:bg-slate-950/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-950 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                      tabIndex={-1}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-slate-800/80 bg-gray-50 dark:bg-slate-950/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-slate-950 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                {password.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: level <= strength ? strengthColor : '#e5e7eb' }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              id="forgot-submit"
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3.5 px-4 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {step === 'email' ? 'Sending...' : step === 'otp' ? 'Verifying...' : 'Resetting...'}
                </>
              ) : (
                step === 'email' ? 'Send OTP' : step === 'otp' ? 'Verify OTP' : 'Reset Password'
              )}
            </button>
          </form>
        )}

        {step !== 'done' && (
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <span
              className="cursor-pointer font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={() => {
                if (step === 'email') return navigate('/login');
                if (step === 'otp') {
                  setStep('email');
                  resetState();
                }
                if (step === 'change') {
                  setStep('otp');
                  setMessage('');
                }
              }}
            >
              {step === 'email' ? '← Back to Login' : step === 'otp' ? 'Start over' : 'Back to OTP'}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
