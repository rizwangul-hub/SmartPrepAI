// src/pages/StudyPlan.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MOCK_PLAN = {
  exam: 'Your Target Exam',
  weeksRemaining: 8,
  dailyHours: 3,
  plan: [
    { day: 'Monday', topics: ['Mathematics – Algebra & Equations', 'Intelligence Test – Verbal Reasoning'], hours: 3 },
    { day: 'Tuesday', topics: ['English – Grammar & Comprehension', 'Pakistan Studies – History'], hours: 3 },
    { day: 'Wednesday', topics: ['Mathematics – Geometry & Statistics', 'General Knowledge – Current Affairs'], hours: 2.5 },
    { day: 'Thursday', topics: ['Intelligence Test – Non-Verbal Reasoning', 'Islamiyat – Quran & Hadith'], hours: 3 },
    { day: 'Friday', topics: ['Full Mock Test Practice', 'Review Weak Areas'], hours: 3 },
    { day: 'Saturday', topics: ['Urdu Grammar & Comprehension', 'Science – Basic Physics & Chemistry'], hours: 2 },
    { day: 'Sunday', topics: ['Revision & Self-Assessment', 'Rest & Mental Refresh'], hours: 1.5 },
  ],
  tips: [
    'Attempt at least 2 full mock tests per week.',
    'Review all incorrect answers immediately after each test.',
    'Focus extra time on your weak subjects identified in analytics.',
    'Maintain a consistent sleep schedule for peak cognitive performance.',
    'Practice speed and accuracy under timed conditions.',
  ],
};

export default function StudyPlan() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [weeks, setWeeks] = useState(8);
  const [dailyHours, setDailyHours] = useState(3);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/study/generate', {
        exam: user?.desiredExam || 'General',
        weeksRemaining: weeks,
        dailyHours,
      });
      setPlan(res.data.plan || MOCK_PLAN);
    } catch (err) {
      console.error('Study plan error:', err);
      // Fall back to mock plan
      setPlan({ ...MOCK_PLAN, exam: user?.desiredExam || 'Your Exam', weeksRemaining: weeks, dailyHours });
    } finally {
      setLoading(false);
      setGenerated(true);
    }
  };

  const dayColors = [
    'from-indigo-500/10 to-indigo-500/5 border-indigo-500/30',
    'from-purple-500/10 to-purple-500/5 border-purple-500/30',
    'from-pink-500/10 to-pink-500/5 border-pink-500/30',
    'from-amber-500/10 to-amber-500/5 border-amber-500/30',
    'from-emerald-500/10 to-emerald-500/5 border-emerald-500/30',
    'from-sky-500/10 to-sky-500/5 border-sky-500/30',
    'from-rose-500/10 to-rose-500/5 border-rose-500/30',
  ];

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
            📅 AI Study Plan
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

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Generator Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/50 dark:border-slate-800/50 shadow-sm p-8">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🤖</div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Generate Your Study Plan</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                AI will create a personalized weekly schedule for{' '}
                <strong className="text-indigo-500">{user?.desiredExam || 'your target exam'}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Weeks Until Exam
              </label>
              <input
                type="number"
                min={1}
                max={52}
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Daily Study Hours
              </label>
              <input
                type="number"
                min={1}
                max={12}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 font-semibold"
              />
            </div>
          </div>

          <button
            onClick={generatePlan}
            disabled={loading}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>🚀 Generate AI Study Plan</>
            )}
          </button>
        </div>

        {/* Generated Plan */}
        {plan && (
          <>
            {/* Summary Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 p-6 text-white shadow-xl">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex flex-wrap gap-6 items-center">
                <div>
                  <p className="text-white/60 text-xs">Target Exam</p>
                  <p className="font-bold text-xl">{plan.exam}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Weeks Left</p>
                  <p className="font-bold text-xl">{plan.weeksRemaining || weeks} weeks</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Daily Hours</p>
                  <p className="font-bold text-xl">{plan.dailyHours || dailyHours} hrs/day</p>
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div>
              <h2 className="text-xl font-bold mb-4">Weekly Schedule</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(plan.plan || MOCK_PLAN.plan).map((dayPlan, idx) => (
                  <div
                    key={dayPlan.day}
                    className={`bg-gradient-to-br ${dayColors[idx % dayColors.length]} border rounded-2xl p-5`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200">{dayPlan.day}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 font-semibold">
                        {dayPlan.hours}h
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {dayPlan.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-indigo-500 mt-0.5">▸</span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>💡</span> AI Study Tips
              </h2>
              <ul className="space-y-3">
                {(plan.tips || MOCK_PLAN.tips).map((tip) => (
                  <li key={tip} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-0.5 text-lg">✅</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
              >
                📝 Take a Mock Test
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="px-6 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 font-bold rounded-xl transition"
              >
                🏆 View Leaderboard
              </button>
              <button
                onClick={generatePlan}
                className="px-6 py-3 border border-gray-200 dark:border-slate-700 hover:border-indigo-500 font-bold rounded-xl transition text-gray-700 dark:text-gray-300"
              >
                🔄 Regenerate Plan
              </button>
            </div>
          </>
        )}

        {/* Initial State - no plan yet */}
        {!plan && !loading && (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">📚</div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No Study Plan Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Configure your parameters above and click "Generate AI Study Plan" to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
