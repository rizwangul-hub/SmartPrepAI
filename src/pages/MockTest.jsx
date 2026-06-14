// src/pages/MockTest.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function MockTest() {
  const { examId, testId } = useParams();
  const isGeneratedTest = Boolean(testId);
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        let data;
        let progressUrl;

        if (isGeneratedTest) {
          const res = await axios.get(`/api/tests/${testId}`);
          data = {
            _id: res.data._id,
            title: res.data.title,
            description: `${res.data.examType} — Generated Mock Test`,
            duration: res.data.duration,
            questions: res.data.questions,
          };
          progressUrl = `/api/tests/progress/test/${testId}`;
        } else {
          // Fetch static exam to get its title
          const examRes = await axios.get(`/api/exams/${examId}`);
          const examTitle = examRes.data.title || "PMA";
          // Generate a dynamic syllabus test
          const genRes = await axios.post("/api/tests/generate", { exam: examTitle });
          if (genRes.data?.testId) {
            navigate(`/test/${genRes.data.testId}/start`, { replace: true });
            return;
          }
          throw new Error("Failed to generate dynamic test");
        }

        setSession(data);

        const progressRes = await axios.get(progressUrl);
        if (progressRes.data?.progress) {
          const cached = progressRes.data.progress;
          const resume = window.confirm(
            "We found a saved session. Do you want to resume from where you left off?",
          );
          if (resume) {
            setAnswers(cached.answers || {});
            setFlags(cached.flags || {});
            setCurrentIdx(cached.currentIdx || 0);
            setTimeLeft(cached.timeLeft || data.duration * 60);
            setStarted(true);
            setLoading(false);
            return;
          }
        }

        setTimeLeft(data.duration * 60);
      } catch (err) {
        setError(err.response?.data?.message || "Error loading test");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [examId, testId, isGeneratedTest]);

  useEffect(() => {
    if (!session || !started) return;
    if (timeLeft === 0) {
      if (session.duration > 0) {
        setTimeLeft(session.duration * 60);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          autoSubmitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, started, timeLeft]);

  const qKey = (q, idx) => q._id?.toString() || `idx-${idx}`;

  const handleSelectOption = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleToggleFlag = (qId) => {
    setFlags((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSkipQuestion = () => {
    if (!session?.questions?.[currentIdx]) return;
    const key = qKey(session.questions[currentIdx], currentIdx);
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleStartTest = () => {
    if (!session) return;
    setTimeLeft((prev) => (prev > 0 ? prev : session.duration * 60));
    setStarted(true);
  };

  const handleSaveProgress = async () => {
    setSavingProgress(true);
    try {
      const payload = {
        ...(isGeneratedTest ? { testId } : { examId }),
        currentIdx,
        answers,
        flags,
        timeLeft,
      };
      await axios.post("/api/tests/save-progress", payload);
      alert("Progress saved! You can resume later.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to save progress.");
    } finally {
      setSavingProgress(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getSubmittingPayload = useCallback(() => {
    if (isGeneratedTest) {
      return {
        testId,
        answers: Object.entries(answers).map(
          ([questionId, selectedOptionIndex]) => ({
            questionId,
            selectedOptionIndex,
          }),
        ),
      };
    }
    return {
      examId,
      answers: Object.entries(answers).map(
        ([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex,
        }),
      ),
    };
  }, [examId, testId, isGeneratedTest, answers]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = getSubmittingPayload();
      const endpoint = isGeneratedTest
        ? "/api/results/submit-test"
        : "/api/results/submit";
      const res = await axios.post(endpoint, payload);
      navigate(`/result/${res.data.resultId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit test");
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const payload = getSubmittingPayload();
      const endpoint = isGeneratedTest
        ? "/api/results/submit-test"
        : "/api/results/submit";
      const res = await axios.post(endpoint, payload);
      navigate(`/result/${res.data.resultId}`);
    } catch (err) {
      console.error("Auto-submit failed:", err);
      navigate("/dashboard");
    }
  }, [getSubmittingPayload, navigate, isGeneratedTest]);

  const autoSubmitRef = useRef();
  useEffect(() => {
    autoSubmitRef.current = handleAutoSubmit;
  }, [handleAutoSubmit]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || !session?.questions?.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <div className="text-center space-y-4 max-w-sm p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-lg font-bold">Test cannot be loaded</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error || "No questions available for this test."}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 px-6">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl font-extrabold mb-4">
            Ready to start your test?
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            This test will begin when you click <strong>Start Test</strong>.
            Your full timer of {session.duration} minutes will begin counting
            down from that moment.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="rounded-2xl border border-gray-200 dark:border-slate-800 p-4 bg-gray-50 dark:bg-slate-950">
              <p className="font-semibold">Test</p>
              <p className="text-gray-600 dark:text-gray-400">
                {session.title}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-slate-800 p-4 bg-gray-50 dark:bg-slate-950">
              <p className="font-semibold">Questions</p>
              <p className="text-gray-600 dark:text-gray-400">
                {session.questions.length}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-slate-800 p-4 bg-gray-50 dark:bg-slate-950">
              <p className="font-semibold">Duration</p>
              <p className="text-gray-600 dark:text-gray-400">
                {session.duration} minutes
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-slate-800 p-4 bg-gray-50 dark:bg-slate-950">
              <p className="font-semibold">Resume</p>
              <p className="text-gray-600 dark:text-gray-400">
                {answers && Object.keys(answers).length ? "Yes" : "No"}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartTest}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition"
            >
              Start Test
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto px-8 py-4 border border-gray-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIdx];
  const currentKey = qKey(currentQuestion, currentIdx);
  const totalQuestions = session.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex-1">
          <h2 className="text-lg font-extrabold line-clamp-1">
            {session.title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {session.description || "Practice Test Session"}
          </p>
          <div className="flex gap-3 mt-2 flex-wrap">
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {answeredCount} / {totalQuestions} Answered
            </span>
            {currentQuestion.subject && (
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {currentQuestion.subject}
              </span>
            )}
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300">
              {session.duration} Minutes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveProgress}
            disabled={savingProgress}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            {savingProgress ? "Saving..." : "💾 Save & Pause"}
          </button>
          <div
            className={`px-4 py-2 rounded-xl flex items-center gap-2 border font-mono font-bold text-sm ${timeLeft < 60 ? "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900 animate-pulse" : "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-700"}`}
          >
            <span>⏱️</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row p-6 md:p-8 gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200/50 dark:border-slate-800/50 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Question {currentIdx + 1} of {totalQuestions}
              </span>
              <button
                onClick={() => handleToggleFlag(currentKey)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border transition ${flags[currentKey] ? "bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-950/20 dark:border-yellow-900 dark:text-yellow-400" : "hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700"}`}
              >
                {flags[currentKey]
                  ? "★ Marked for Review"
                  : "☆ Mark for Review"}
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-relaxed">
              {currentQuestion.text}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options?.map((opt, oIdx) => {
                const isSelected = answers[currentKey] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentKey, oIdx)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 transition-all cursor-pointer ${isSelected ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/30" : "border-gray-200/60 hover:bg-gray-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"}`}
                  >
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-500"}`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-6 py-3 border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-100 font-bold rounded-2xl disabled:opacity-30 disabled:pointer-events-none transition text-sm"
              >
                ← Previous
              </button>
              <button
                onClick={handleSkipQuestion}
                className="px-6 py-3 border bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 font-bold rounded-2xl transition text-sm"
              >
                Skip
              </button>
            </div>

            {currentIdx < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="px-6 py-3 bg-white dark:bg-slate-900 border hover:bg-gray-100 font-bold rounded-2xl transition text-sm"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg transition text-sm"
              >
                Submit Test
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-80">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-sm space-y-6">
            <h4 className="text-base font-bold">Question Matrix</h4>
            <div className="grid grid-cols-5 gap-2.5">
              {session.questions.map((q, idx) => {
                const key = qKey(q, idx);
                const isCurrent = idx === currentIdx;
                const isAnswered = answers[key] !== undefined;
                const isFlagged = flags[key];

                let bgClass =
                  "bg-gray-50 text-gray-400 dark:bg-slate-950 border-gray-200 dark:border-slate-800";
                if (isAnswered)
                  bgClass =
                    "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
                if (isFlagged)
                  bgClass =
                    "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400";
                if (isCurrent) bgClass += " ring-2 ring-indigo-500";

                return (
                  <button
                    key={key}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 w-10 flex items-center justify-center font-bold text-sm border rounded-xl transition ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-2xl space-y-6 text-center">
            <span className="text-4xl">🏁</span>
            <h3 className="text-xl font-bold">Submit Test?</h3>
            <p className="text-sm text-gray-500">
              Answered {answeredCount} of {totalQuestions} questions.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border font-bold rounded-xl"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
