// src/pages/Leaderboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

const RANK_COLORS = ['text-amber-400', 'text-slate-300', 'text-orange-400'];
const RANK_BG = ['bg-amber-400/10 border-amber-400/30', 'bg-slate-400/10 border-slate-400/30', 'bg-orange-400/10 border-orange-400/30'];
const RANK_EMOJI = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Track activity and fetch gamification stats
        const gameRes = await axios.post('/api/gamification/track');
        setStreak(gameRes.data.streak || 0);
        setAchievements(gameRes.data.achievements || []);
      } catch (err) {
        console.error('Gamification error:', err);
      }

      try {
        const res = await axios.get('/api/gamification/leaderboard');
        setRankings(res.data || []);
      } catch (err) {
        console.error('Leaderboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ACHIEVEMENT_ICONS = {
    'First Step': '🌱',
    'Elite Scholar': '🌟',
    'Consistent Thinker': '🔥',
  };

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
            🏆 Leaderboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 rounded-xl text-gray-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition"
            title="Log Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* My Stats Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Your Profile</p>
              <h2 className="text-3xl font-black">{user?.name || 'Student'}</h2>
              <p className="text-white/70 text-sm">{user?.desiredExam || 'General Preparation'}</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-4xl font-black">{streak}</div>
                <div className="text-white/60 text-xs mt-1">Day Streak 🔥</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black">{achievements.length}</div>
                <div className="text-white/60 text-xs mt-1">Achievements</div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Your Achievements</h3>
            <div className="flex flex-wrap gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                >
                  <span className="text-lg">{ACHIEVEMENT_ICONS[ach] || '🎖️'}</span>
                  <span className="text-sm font-semibold">{ach}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {rankings.length >= 3 && (
          <div className="grid grid-cols-3 gap-4">
            {/* 2nd place */}
            <div className={`flex flex-col items-center justify-end p-4 rounded-2xl border ${RANK_BG[1]} order-1`}>
              <div className="text-3xl mb-2">🥈</div>
              <div className="font-bold text-center text-sm">{rankings[1]?.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{rankings[1]?.examGoal}</div>
              <div className={`text-2xl font-black mt-2 ${RANK_COLORS[1]}`}>{rankings[1]?.score}%</div>
            </div>
            {/* 1st place */}
            <div className={`flex flex-col items-center justify-end p-6 rounded-2xl border ${RANK_BG[0]} order-2 shadow-lg`}>
              <div className="text-4xl mb-2">🥇</div>
              <div className="font-bold text-center">{rankings[0]?.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{rankings[0]?.examGoal}</div>
              <div className={`text-3xl font-black mt-2 ${RANK_COLORS[0]}`}>{rankings[0]?.score}%</div>
            </div>
            {/* 3rd place */}
            <div className={`flex flex-col items-center justify-end p-4 rounded-2xl border ${RANK_BG[2]} order-3`}>
              <div className="text-3xl mb-2">🥉</div>
              <div className="font-bold text-center text-sm">{rankings[2]?.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{rankings[2]?.examGoal}</div>
              <div className={`text-2xl font-black mt-2 ${RANK_COLORS[2]}`}>{rankings[2]?.score}%</div>
            </div>
          </div>
        )}

        {/* Full Rankings Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-lg">Full Rankings</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Top performing students across all exams</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-sm">Loading rankings...</p>
            </div>
          ) : rankings.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-3">📊</span>
              <h4 className="font-bold text-gray-600 dark:text-gray-400">No results yet</h4>
              <p className="text-sm text-gray-400 mt-1">Complete a mock test to appear on the leaderboard!</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition"
              >
                Take a Test
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400">Rank</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400">Student</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400">Exam</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400">City</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                {rankings.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors ${entry.name === user?.name ? 'bg-indigo-50/40 dark:bg-indigo-950/10' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`font-black text-lg ${entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : 'text-gray-400'}`}>
                        {entry.rank <= 3 ? RANK_EMOJI[entry.rank - 1] : `#${entry.rank}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                          {entry.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {entry.name}
                          {entry.name === user?.name && (
                            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{entry.examTitle}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{entry.city || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-black text-lg ${entry.score >= 80 ? 'text-emerald-500' : entry.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {entry.score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
