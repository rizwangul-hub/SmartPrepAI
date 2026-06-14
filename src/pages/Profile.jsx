// src/pages/Profile.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

const EXAM_OPTIONS = [
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

const EDUCATION_OPTIONS = [
  'Matric (10th Grade)', 'Intermediate (12th Grade)', 'Bachelor\'s Degree',
  'Master\'s Degree', 'Currently Studying',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    city: user?.city || '',
    gender: user?.gender || '',
    educationLevel: user?.educationLevel || '',
    desiredExam: user?.desiredExam || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put('/api/auth/profile', form);
      // Update local storage user
      const updatedUser = { ...user, ...form };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition">
            ← Back
          </button>
          <span className="text-gray-300 dark:text-slate-700">|</span>
          <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            👤 My Profile
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 rounded-xl text-gray-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Profile Header Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-4xl font-black shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black">{user?.name || 'Student'}</h1>
              <p className="text-white/70 text-sm mt-1">{user?.email}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold capitalize">
                  {user?.role || 'student'} account
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                  🎓 {user?.desiredExam || 'Exam Not Set'}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                  📅 Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-slate-800">
          {['profile', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-bold capitalize rounded-t-xl transition-all ${
                activeTab === tab
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'profile' ? '📋 Profile Settings' : '🔒 Security'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 shadow-sm p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                  placeholder="Your full name"
                />
              </div>

              {/* Email (read-only) */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed after registration.</p>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. Lahore"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Education Level
                </label>
                <select
                  name="educationLevel"
                  value={form.educationLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select education level</option>
                  {EDUCATION_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              {/* Target Exam */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target Exam
                </label>
                <select
                  name="desiredExam"
                  value={form.desiredExam}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select your target exam</option>
                  {EXAM_OPTIONS.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
                </select>
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : '💾 Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 font-bold rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 shadow-sm p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Account Security</h3>

              {/* Account Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                  <p className="text-xs text-gray-400 font-medium mb-1">Account Role</p>
                  <p className="font-bold capitalize text-indigo-600 dark:text-indigo-400">{user?.role || 'user'}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                  <p className="text-xs text-gray-400 font-medium mb-1">Email Verification</p>
                  <p className={`font-bold ${user?.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {user?.isVerified ? '✅ Verified' : '⚠️ Not Verified'}
                  </p>
                </div>
              </div>

              {/* Change Password Note */}
              <div className="p-5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 space-y-2">
                <p className="font-semibold text-sm text-indigo-700 dark:text-indigo-300">🔒 Password Management</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  To change your password, use the "Forgot Password" link on the login page. Password resets are sent to your registered email address.
                </p>
              </div>

              {/* Danger Zone */}
              <div className="p-5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-3">
                <p className="font-bold text-rose-700 dark:text-rose-400">⚠️ Danger Zone</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Logging out will clear your session. You will need to sign in again to access your dashboard.
                </p>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition"
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
