// src/pages/SEOPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle.jsx';
import logoImg from '../assets/logo.png';
import { updateMetaTags, injectJsonLdSchema } from '../utils/seo';

export default function SEOPage() {
  const { seoSlug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoFailed, setLogoFailed] = useState(false);

  // Quiz Widget State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const fetchSeoData = async () => {
      setLoading(true);
      setError(null);
      setQuizIndex(0);
      setSelectedOption(null);
      setAnswered(false);
      setQuizScore(0);
      setQuizFinished(false);

      try {
        const res = await axios.get(`/api/seo/content/${seoSlug}`);
        if (res.data && res.data.success) {
          setData(res.data);
          
          // Inject dynamic meta tags & canonical link
          const canonical = `${window.location.origin}/${seoSlug}`;
          updateMetaTags({
            title: res.data.title,
            description: res.data.metaDescription,
            keywords: res.data.keywords,
            canonicalUrl: canonical,
          });

          // Inject structured schema
          if (res.data.schema) {
            injectJsonLdSchema(res.data.schema);
          }
        } else {
          setError('Failed to load SEO content');
        }
      } catch (err) {
        console.error('Error fetching SEO content:', err);
        setError('Page not found or failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchSeoData();
  }, [seoSlug]);

  const handleOptionSelect = (optionIdx) => {
    if (answered) return;
    setSelectedOption(optionIdx);
    setAnswered(true);

    const correctIdx = data?.questions[quizIndex]?.correctOptionIndex;
    if (optionIdx === correctIdx) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (quizIndex < data.questions.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white space-y-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Generating Dynamic Exam Resource...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl font-extrabold text-indigo-400 mb-4">404</h2>
        <p className="text-gray-400 max-w-md mb-6">{error || 'The requested SEO resource is not available.'}</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl transition">
          Return to Home
        </button>
      </div>
    );
  }

  // Determine current active question
  const currentQuestion = data.questions && data.questions[quizIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* Dynamic Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
          {logoFailed ? (
            <span className="text-sm sm:text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
              PrepForce AI
            </span>
          ) : (
            <img
              src={logoImg}
              alt="PrepForce AI Logo"
              className="h-10 sm:h-12 w-auto object-contain"
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => navigate('/login')} className="px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl text-gray-300 hover:text-white transition">
            Sign In
          </button>
          <button onClick={() => navigate('/register')} className="px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 transition">
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full space-y-12">
        {/* Breadcrumbs */}
        {data.breadcrumbs && (
          <nav className="text-xs text-gray-500 flex items-center gap-2 font-semibold tracking-wide uppercase">
            {data.breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {idx > 0 && <span className="text-gray-700">/</span>}
                {idx === data.breadcrumbs.length - 1 ? (
                  <span className="text-indigo-400">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="hover:text-gray-300 transition">{crumb.label}</Link>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-gray-400 bg-clip-text text-transparent">
            {data.h1}
          </h1>
          <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
            {data.metaDescription}
          </p>
        </div>

        {/* Dynamic Interactive Quiz Widget */}
        {data.questions && data.questions.length > 0 && (
          <section className="bg-white/5 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-md">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Interactive Quiz</span>
                <h3 className="text-lg font-bold">Practice Sample Questions</h3>
              </div>
              <span className="text-xs text-gray-400 font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                {quizFinished ? 'Completed' : `Q: ${quizIndex + 1} / ${data.questions.length}`}
              </span>
            </div>

            {!quizFinished ? (
              <div className="space-y-6">
                {/* Question Text */}
                <h4 className="text-base sm:text-lg font-semibold text-gray-100">
                  {currentQuestion?.text}
                </h4>

                {/* Option Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion?.options.map((opt, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrect = optIdx === currentQuestion.correctOptionIndex;
                    
                    let btnStyle = "bg-white/5 border-slate-800 hover:bg-white/10 hover:border-slate-700 text-gray-200";
                    if (answered) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-500/20 border-rose-500/50 text-rose-300";
                      } else {
                        btnStyle = "bg-slate-900/40 border-slate-900 opacity-60 text-gray-500";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionSelect(optIdx)}
                        disabled={answered}
                        className={`w-full text-left px-5 py-4 border rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {answered && isCorrect && <span className="text-emerald-400">✓ Correct</span>}
                        {answered && isSelected && !isCorrect && <span className="text-rose-400">✗ Incorrect</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation block */}
                {answered && (
                  <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-sm text-slate-300 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <strong className="text-indigo-400 block uppercase tracking-wider text-xs">Explanation</strong>
                    <p>{currentQuestion.explanation || `The correct answer is "${currentQuestion.options[currentQuestion.correctOptionIndex]}". Focus on this core concept for your competitive exams.`}</p>
                  </div>
                )}

                {/* Next button */}
                {answered && (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 ml-auto"
                  >
                    {quizIndex === data.questions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
                  </button>
                )}
              </div>
            ) : (
              // Quiz Finished Screen
              <div className="text-center py-8 space-y-6">
                <div className="text-5xl">🏆</div>
                <h4 className="text-2xl font-black">Practice Quiz Completed</h4>
                <p className="text-gray-400 max-w-sm mx-auto">
                  You scored <strong className="text-indigo-400">{quizScore}</strong> out of <strong className="text-white">{data.questions.length}</strong> questions correct.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={resetQuiz} className="px-6 py-3 border border-slate-700 hover:border-slate-500 bg-slate-900 font-bold rounded-xl transition">
                    Retry Practice Quiz
                  </button>
                  <button onClick={() => navigate('/register')} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 font-bold rounded-xl transition shadow-lg shadow-indigo-500/20">
                    Take Full Simulated Exam
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Syllabus / Content Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-2xl font-black">Exam Pattern & Syllabus Breakdown</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              To secure top marks, candidates must follow a highly structured approach. Our syllabus breakdown highlights key chapters, expected question counts, and marks weightage. Practice these subjects regularly using our AI-driven simulators.
            </p>

            {/* Custom Marks Distribution Table */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-gray-300 font-bold">
                    <th className="p-4">Subject Core Chapter</th>
                    <th className="p-4">Questions Count</th>
                    <th className="p-4">Difficulty Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-gray-400">
                  <tr>
                    <td className="p-4 font-semibold text-white">English Grammar & Sentence Structure</td>
                    <td className="p-4">20% of MCQs</td>
                    <td className="p-4">Medium to Hard</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">General Knowledge & World Facts</td>
                    <td className="p-4">20% of MCQs</td>
                    <td className="p-4">Medium</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Pakistan Studies & History</td>
                    <td className="p-4">20% of MCQs</td>
                    <td className="p-4">Easy to Medium</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Logical & Verbal Reasoning</td>
                    <td className="p-4">20% of MCQs</td>
                    <td className="p-4">Hard</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Computer Applications & Office Shortcuts</td>
                    <td className="p-4">20% of MCQs</td>
                    <td className="p-4">Easy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick FAQ / Info sidebar */}
          <div className="bg-white/5 border border-slate-800 rounded-3xl p-6 h-fit space-y-6">
            <h4 className="font-bold border-b border-slate-800 pb-3 text-white">Exam Guidelines</h4>
            <ul className="space-y-4 text-xs text-gray-400">
              <li className="flex gap-2">
                <span className="text-indigo-400">⚡</span>
                <div>
                  <strong className="text-gray-200 block">Negative Marking</strong>
                  Depends on force criteria. Typically absent or 0.25 marks per error.
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">🕒</span>
                <div>
                  <strong className="text-gray-200 block">Exam Duration</strong>
                  Typically 60 to 90 minutes for full written mock papers.
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">🎯</span>
                <div>
                  <strong className="text-gray-200 block">Required Percentage</strong>
                  Minimum 50-60% required to clear initially for interviews.
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Global Premium Upgrade CTA Card */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-950 p-8 sm:p-12 text-center space-y-6 border border-indigo-700/30 shadow-2xl">
          <div className="absolute top-[-20%] left-[-20%] w-72 h-72 rounded-full bg-pink-500 blur-3xl opacity-20" />
          <h3 className="text-2xl sm:text-4xl font-extrabold max-w-xl mx-auto">
            Ready to Take a Full 100-Question Simulated Exam?
          </h3>
          <p className="text-sm sm:text-base text-indigo-200 max-w-md mx-auto leading-relaxed">
            Create a free account to unlock high-yield mock tests, customized study planners, performance dashboards, and certificate badges.
          </p>
          <button onClick={() => navigate('/register')} className="px-8 py-4 bg-white hover:bg-gray-100 text-indigo-900 font-bold rounded-xl transition shadow-lg inline-block">
            Get Started Free
          </button>
        </section>

        {/* Crawlable Internal Links Cluster */}
        {data.internalLinks && data.internalLinks.length > 0 && (
          <section className="space-y-4 border-t border-slate-800 pt-8">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Related Exam Preparations</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.internalLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={`/${link.slug}`}
                  className="px-4 py-3 border border-slate-800 hover:border-slate-600 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs sm:text-sm font-semibold transition text-gray-300 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-gray-600">
        <p>© 2026 PrepForce AI. Pakistan's AI-Powered Test Preparation Platform.</p>
      </footer>
    </div>
  );
}
