// src/pages/SEOBlogPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle.jsx';
import logoImg from '../assets/logo.png';
import { updateMetaTags, injectJsonLdSchema } from '../utils/seo';

export default function SEOBlogPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoFailed, setLogoFailed] = useState(false);

  // Quiz States for Blog Quiz Embed
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      setError(null);
      setQuizIndex(0);
      setSelectedOption(null);
      setAnswered(false);
      setQuizScore(0);
      setQuizFinished(false);

      try {
        const res = await axios.get(`/api/seo/blog/content/${slug}`);
        if (res.data && res.data.success) {
          setData(res.data);

          // Update tags in DOM
          const canonical = `${window.location.origin}/blog/${slug}`;
          updateMetaTags({
            title: res.data.title,
            description: res.data.metaDescription,
            keywords: res.data.keywords,
            canonicalUrl: canonical,
          });

          // Inject JSON-LD Schema
          if (res.data.schema) {
            injectJsonLdSchema(res.data.schema);
          }
        } else {
          setError('Blog article not found');
        }
      } catch (err) {
        console.error('Error fetching blog article:', err);
        setError('Blog article not found or failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [slug]);

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
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Loading Article...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-4xl font-extrabold text-indigo-400 mb-4">404</h2>
        <p className="text-gray-400 max-w-md mb-6">{error || 'The requested blog guide is not available.'}</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl transition">
          Return to Home
        </button>
      </div>
    );
  }

  const currentQuestion = data.questions && data.questions[quizIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* Navbar */}
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
              className="h-9 sm:h-16 w-auto object-contain"
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
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
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

        {/* Hero Area */}
        <div className="space-y-4 border-b border-slate-900 pb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg">
            {data.exam} Preparation Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mt-2">
            {data.h1}
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold">
            <span>⏱️ 5 min read</span>
            <span>• Updated: June 2026</span>
            <span>• By PrepForce Editorial</span>
          </div>
        </div>

        {/* Article content & sidebar layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Article Body */}
          <div className="md:col-span-2 space-y-6">
            <article className="text-gray-300 leading-relaxed text-sm sm:text-base space-y-4">
              {data.body.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </article>

            {/* Embedded Practice Quiz inside Blog */}
            {data.questions && data.questions.length > 0 && (
              <div className="bg-white/5 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 mt-8">
                <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Practice Test Embed</span>
                  <span className="text-xs text-gray-400 font-bold">{quizFinished ? 'Done' : `${quizIndex + 1} / ${data.questions.length}`}</span>
                </div>

                {!quizFinished ? (
                  <div className="space-y-4">
                    <h4 className="text-sm sm:text-base font-bold text-gray-100">{currentQuestion?.text}</h4>
                    <div className="space-y-2">
                      {currentQuestion?.options.map((opt, optIdx) => {
                        const isSelected = selectedOption === optIdx;
                        const isCorrect = optIdx === currentQuestion.correctOptionIndex;
                        
                        let btnStyle = "bg-white/5 border-slate-800 hover:bg-white/10 hover:border-slate-700 text-gray-300";
                        if (answered) {
                          if (isCorrect) {
                            btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
                          } else if (isSelected) {
                            btnStyle = "bg-rose-500/20 border-rose-500/50 text-rose-300";
                          } else {
                            btnStyle = "bg-slate-900/40 border-slate-900 opacity-60 text-gray-600";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleOptionSelect(optIdx)}
                            disabled={answered}
                            className={`w-full text-left px-4 py-3 border rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {answered && (
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl transition text-xs ml-auto block"
                      >
                        {quizIndex === data.questions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <span className="text-3xl">🎉</span>
                    <h5 className="font-bold text-gray-100">Practice Finished</h5>
                    <p className="text-xs text-gray-400">Score: {quizScore} / {data.questions.length}</p>
                    <div className="flex gap-2 justify-center">
                      <button onClick={resetQuiz} className="px-4 py-2 border border-slate-700 hover:border-slate-500 bg-slate-900 rounded-lg text-xs transition">
                        Retry
                      </button>
                      <button onClick={() => navigate('/register')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold transition">
                        Create Free Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Free Account CTA */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-950/40 border border-indigo-900/40 rounded-3xl p-6 space-y-4 shadow-xl">
              <h4 className="font-bold text-lg text-white">Full Exam Simulation</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Take timed mock exams matching real ASF, FIA, and PMA past patterns.
              </p>
              <button onClick={() => navigate('/register')} className="w-full py-3 bg-white hover:bg-gray-100 text-indigo-950 font-bold rounded-xl text-xs transition shadow-md">
                Register Free
              </button>
            </div>

            {/* Related pages links */}
            {data.internalLinks && data.internalLinks.length > 0 && (
              <div className="border border-slate-900 rounded-3xl p-6 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-widest text-indigo-400">Recommended Resources</h4>
                <div className="flex flex-col gap-2">
                  {data.internalLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      to={`/${link.slug}`}
                      className="text-xs text-gray-400 hover:text-indigo-400 transition font-semibold"
                    >
                      • {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-gray-600 mt-12">
        <p>© 2026 PrepForce AI. Pakistan's AI-Powered Test Preparation Platform.</p>
      </footer>
    </div>
  );
}
