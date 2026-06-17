// src/pages/ResultPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import ThemeToggle from '../components/ThemeToggle.jsx';
import logoImg from '../assets/logo.png';

export default function ResultPage() {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`/api/results/${resultId}`);
        setResult(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading result details');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold">Analyzing test performance...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <div className="text-center space-y-4 max-w-sm p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-lg font-bold">Result not found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error || 'This result does not exist or you lack authorization to view it.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const total = result.totalQuestions || result.answers.length;
  const correct = result.correctCount ?? result.answers.filter((a) => a.isCorrect).length;
  const incorrect = result.incorrectCount ?? total - correct;
  const subjectBreakdown = result.subjectBreakdown || [];
  const weakSubjects = result.weakSubjects || [];
  const strongSubjects = result.strongSubjects || [];

  const chartData = [
    { name: 'Correct Answers', value: correct, color: '#10b981' },
    { name: 'Incorrect / Skipped', value: incorrect, color: '#ef4444' },
  ];

  // Feedback based on score percentage
  let feedbackTitle = 'Keep Practicing!';
  let feedbackDesc = 'Review the incorrect questions below to consolidate your core syllabus concepts.';
  let feedbackEmoji = '📚';

  if (result.score >= 80) {
    feedbackTitle = 'Outstanding Work!';
    feedbackDesc = 'You have mastered this subject! Keep maintaining this score range to guarantee top ranking.';
    feedbackEmoji = '🏆';
  } else if (result.score >= 50) {
    feedbackTitle = 'Solid Attempt!';
    feedbackDesc = 'Great progress. Work on your weak sections highlighted in red below to push past 80%.';
    feedbackEmoji = '👍';
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      <nav className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
          {logoFailed ? (
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              PrepForce AI
            </span>
          ) : (
            <img
              src={logoImg}
              alt="PrepForce AI Logo"
              className="h-8 w-auto object-contain"
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>
        <ThemeToggle />
      </nav>

      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
        
        {/* Results Banner */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
          
          {/* Big Score Dial */}
          <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-8 border-gray-100 dark:border-slate-800"></div>
            <div
              className="absolute inset-0 rounded-full border-8 border-transparent transition-all"
              style={{
                borderColor: result.score >= 50 ? '#10b981' : '#ef4444',
                clipPath: `polygon(50% 50%, -50% -50%, 150% -50%, 150% 150%, -50% 150%, -50% -50%)`,
                transform: `rotate(${result.score * 3.6}deg)`,
              }}
            ></div>
            <div className="text-center">
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Score</span>
              <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{result.score}%</span>
            </div>
          </div>

          {/* Feedback details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="text-2xl">{feedbackEmoji}</span>
              <h3 className="text-xl font-extrabold">{feedbackTitle}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">{feedbackDesc}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {correct} Correct</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> {incorrect} Incorrect</span>
              <span className="flex items-center gap-1">🕒 {result.exam?.duration || 0} min Duration</span>
            </div>
          </div>
        </div>

        {/* Subject-wise Performance */}
        {subjectBreakdown.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold">Subject-wise Performance</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Breakdown of your score across each subject area
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectBreakdown.map((s) => (
                <div
                  key={s.subject}
                  className="p-4 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">{s.subject}</span>
                    <span
                      className={`text-sm font-extrabold ${s.percentage >= 70 ? "text-emerald-500" : s.percentage >= 50 ? "text-amber-500" : "text-rose-500"}`}
                    >
                      {s.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${s.percentage >= 70 ? "bg-emerald-500" : s.percentage >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {s.correct} / {s.total} correct
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {strongSubjects.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                  <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2">
                    Strong Subjects
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {strongSubjects.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {weakSubjects.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30">
                  <p className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400 mb-2">
                    Weak Subjects — Needs Practice
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {weakSubjects.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Exam Question Review</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Examine correct choices alongside your selected response</p>

          <div className="space-y-6">
            {result.answers.map((ans, idx) => {
              const q = ans.question;
              if (!q) return null;

              const hasSelected = ans.selectedOptionIndex !== null;
              
              return (
                <div
                  key={idx}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-sm p-6 space-y-4 transition ${ans.isCorrect ? 'border-emerald-200/60 dark:border-emerald-950/40 bg-emerald-50/10 dark:bg-emerald-950/5' : 'border-rose-250/60 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/5'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {idx + 1}. {q.text}
                    </h4>
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${ans.isCorrect ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'}`}>
                      {ans.isCorrect ? '✓ Correct' : '✕ Incorrect'}
                    </span>
                  </div>

                  <div className="space-y-2.5 pl-4">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectChoice = oIdx === q.correctOptionIndex;
                      const isUserChoice = oIdx === ans.selectedOptionIndex;
                      
                      let optionBorder = 'border-gray-150 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50';
                      let icon = '⚪';
                      
                      if (isCorrectChoice) {
                        optionBorder = 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300';
                        icon = '✅';
                      } else if (isUserChoice && !ans.isCorrect) {
                        optionBorder = 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300';
                        icon = '❌';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-3 transition ${optionBorder}`}
                        >
                          <span className="text-sm">{icon}</span>
                          <span className="flex-1">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all text-sm flex items-center gap-2"
          >
            ← Return to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
