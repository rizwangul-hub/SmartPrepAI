// src/components/AchievementBadges.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const BADGE_DEFINITIONS = {
  'First Step': { icon: '🎯', color: 'from-emerald-500 to-teal-600', bgGlow: 'shadow-emerald-500/20' },
  'Elite Scholar': { icon: '⭐', color: 'from-amber-500 to-orange-600', bgGlow: 'shadow-amber-500/20' },
  'Perfect Mind': { icon: '💎', color: 'from-purple-500 to-pink-600', bgGlow: 'shadow-purple-500/20' },
  'Consistent Thinker': { icon: '🔥', color: 'from-red-500 to-orange-600', bgGlow: 'shadow-red-500/20' },
  'Week Warrior': { icon: '💪', color: 'from-indigo-500 to-blue-600', bgGlow: 'shadow-indigo-500/20' },
  'Dedicated Learner': { icon: '📚', color: 'from-cyan-500 to-teal-600', bgGlow: 'shadow-cyan-500/20' },
  'Test Veteran': { icon: '🏆', color: 'from-yellow-500 to-amber-600', bgGlow: 'shadow-yellow-500/20' },
  'Speed Demon': { icon: '⚡', color: 'from-sky-500 to-indigo-600', bgGlow: 'shadow-sky-500/20' },
};

export default function AchievementBadges({ compact = false }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUnlocks, setNewUnlocks] = useState([]);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    const fetchAndCheck = async () => {
      try {
        // Check for new unlocks
        const checkRes = await axios.post('/api/achievements/check');
        setAchievements(checkRes.data.all || []);
        
        if (checkRes.data.newlyUnlocked && checkRes.data.newlyUnlocked.length > 0) {
          setNewUnlocks(checkRes.data.newlyUnlocked);
          setShowUnlockModal(true);
        }
      } catch (err) {
        // Fallback: just fetch existing
        try {
          const res = await axios.get('/api/achievements');
          setAchievements(res.data);
        } catch (fetchErr) {
          console.error('Achievement fetch error:', fetchErr);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAndCheck();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {achievements.length === 0 ? (
          <p className="text-xs text-gray-500">Complete tests to unlock achievements!</p>
        ) : (
          achievements.map((a) => {
            const badge = BADGE_DEFINITIONS[a.title] || { icon: '🏅', color: 'from-gray-500 to-gray-600', bgGlow: '' };
            return (
              <div
                key={a._id}
                className={`group relative px-3 py-1.5 rounded-full bg-gradient-to-r ${badge.color} text-white text-xs font-bold flex items-center gap-1.5 shadow-lg ${badge.bgGlow} hover:scale-105 transition-transform cursor-default`}
                title={a.description}
              >
                <span>{badge.icon}</span>
                <span>{a.title}</span>
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🏆</span> Achievements
          </h3>
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {achievements.length} Unlocked
          </span>
        </div>

        {achievements.length === 0 ? (
          <div className="text-center py-6">
            <span className="text-4xl block mb-2">🔒</span>
            <p className="text-xs text-gray-500">Complete mock tests to unlock achievement badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {achievements.map((a) => {
              const badge = BADGE_DEFINITIONS[a.title] || { icon: '🏅', color: 'from-gray-500 to-gray-600', bgGlow: '' };
              return (
                <div
                  key={a._id}
                  className={`relative p-4 rounded-2xl bg-gradient-to-br ${badge.color} text-white text-center space-y-2 shadow-xl ${badge.bgGlow} hover:scale-105 transition-all cursor-default group`}
                >
                  <span className="text-3xl block group-hover:animate-bounce">{badge.icon}</span>
                  <p className="text-xs font-bold">{a.title}</p>
                  <p className="text-[10px] text-white/70">{a.description}</p>
                  <p className="text-[9px] text-white/50 mt-1">
                    {new Date(a.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Achievement Unlock Modal */}
      {showUnlockModal && newUnlocks.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="space-y-2">
              <span className="text-5xl block animate-bounce">🎉</span>
              <h3 className="text-xl font-black text-white">Achievement Unlocked!</h3>
              <p className="text-sm text-gray-400">You've earned new badges!</p>
            </div>

            <div className="space-y-3">
              {newUnlocks.map((a) => {
                const badge = BADGE_DEFINITIONS[a.title] || { icon: '🏅', color: 'from-gray-500 to-gray-600', bgGlow: '' };
                return (
                  <div
                    key={a._id || a.title}
                    className={`p-4 rounded-2xl bg-gradient-to-r ${badge.color} text-white flex items-center gap-4 shadow-xl ${badge.bgGlow}`}
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <div className="text-left">
                      <p className="font-bold text-sm">{a.title}</p>
                      <p className="text-xs text-white/80">{a.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowUnlockModal(false)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition"
            >
              Awesome! 🚀
            </button>
          </div>
        </div>
      )}
    </>
  );
}
