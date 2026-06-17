// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import axios from "axios";
import logoImg from "../assets/logo.png";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const EXAM_THEMES = {
  "Pakistan Air Force": {
    bgGradient: "from-slate-900 via-sky-950 to-slate-900",
    primaryColor: "sky-500",
    accentColor: "indigo-400",
    badgeIcon: "✈️",
    badgeTitle: "PAF Air Academy Officer Portal",
    bannerText:
      "Prepare for Air Force entry exams (Verbal Intelligence, English, Physics, Math).",
    colorClasses: {
      gradient: "from-sky-550 via-sky-650 to-indigo-700",
      badge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      accentGlow: "shadow-sky-500/20",
      button: "bg-sky-600 hover:bg-sky-700 text-white",
    },
  },
  "PMA Long Course": {
    bgGradient: "from-emerald-950 via-stone-900 to-emerald-950",
    primaryColor: "emerald-500",
    accentColor: "lime-400",
    badgeIcon: "🎖️",
    badgeTitle: "PMA Cadet Training Camp",
    bannerText:
      "Optimized for Army PMA Long Course (Verbal/Non-Verbal Intelligence & Academic Test).",
    colorClasses: {
      gradient: "from-emerald-600 via-emerald-750 to-stone-800",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      accentGlow: "shadow-emerald-500/20",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  },
  "Pakistan Army": {
    bgGradient: "from-emerald-950 via-stone-900 to-emerald-950",
    primaryColor: "emerald-500",
    accentColor: "lime-400",
    badgeIcon: "🎖️",
    badgeTitle: "PMA Cadet Training Camp",
    bannerText:
      "Optimized for Army PMA Long Course (Verbal/Non-Verbal Intelligence & Academic Test).",
    colorClasses: {
      gradient: "from-emerald-600 via-emerald-750 to-stone-800",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      accentGlow: "shadow-emerald-500/20",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  },
  "Pakistan Navy": {
    bgGradient: "from-blue-950 via-indigo-950 to-slate-900",
    primaryColor: "cyan-500",
    accentColor: "teal-300",
    badgeIcon: "⚓",
    badgeTitle: "Navy Naval Academy Portal",
    bannerText: "Naval recruit officer qualification preparation portal.",
    colorClasses: {
      gradient: "from-cyan-600 via-blue-700 to-indigo-850",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      accentGlow: "shadow-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white",
    },
  },
  MDCAT: {
    bgGradient: "from-teal-950 via-emerald-950 to-slate-950",
    primaryColor: "teal-500",
    accentColor: "emerald-400",
    badgeIcon: "🩺",
    badgeTitle: "Medical Entry (MDCAT) Hub",
    bannerText:
      "High-yield Biology, Chemistry, Physics, and English simulated testing environments.",
    colorClasses: {
      gradient: "from-teal-600 via-teal-700 to-emerald-750",
      badge: "bg-teal-500/10 text-teal-400 border-teal-500/30",
      accentGlow: "shadow-teal-500/20",
      button: "bg-teal-600 hover:bg-teal-700 text-white",
    },
  },
  ECAT: {
    bgGradient: "from-slate-950 via-indigo-950 to-slate-950",
    primaryColor: "indigo-500",
    accentColor: "pink-400",
    badgeIcon: "⚙️",
    badgeTitle: "Engineering Entry (ECAT) Hub",
    bannerText:
      "Mathematical reasoning, physics deductions, and chemistry entries test environment.",
    colorClasses: {
      gradient: "from-indigo-600 via-indigo-750 to-blue-800",
      badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      accentGlow: "shadow-indigo-500/20",
      button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    },
  },
  general: {
    bgGradient: "from-indigo-950 via-slate-900 to-indigo-950",
    primaryColor: "purple-500",
    accentColor: "pink-400",
    badgeIcon: "⚡",
    badgeTitle: "PrepForce Competitive Center",
    bannerText:
      "Master your competitive examinations with modular, AI-simulated testing environments.",
    colorClasses: {
      gradient: "from-indigo-600 via-purple-600 to-pink-500",
      badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      accentGlow: "shadow-indigo-500/20",
      button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    },
  },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [stagesInfo, setStagesInfo] = useState(null);
  const [loadingExams, setLoadingExams] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");
  const [launchingTest, setLaunchingTest] = useState(false);

  const handleLaunchTest = async (examTitle) => {
    setLaunchingTest(true);
    try {
      const res = await axios.post("/api/tests/generate", { exam: examTitle });
      if (res.data?.testId) {
        setSelectedExam(null);
        navigate(`/test/${res.data.testId}/start`);
      } else {
        alert("Failed to generate test.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to generate mock exam. Please try again.");
    } finally {
      setLaunchingTest(false);
    }
  };

  // AI Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "assistant",
      text: `Hi ${user?.name || "there"}! I am your AI exam tutor. Ask me any prep questions, check syllabus topics, or plan your study hours.`,
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Theme resolution
  const getTheme = () => {
    const exam = user?.desiredExam || "";
    if (exam.includes("Air Force")) return EXAM_THEMES["Pakistan Air Force"];
    if (exam.includes("PMA") || exam.includes("Army"))
      return EXAM_THEMES["PMA Long Course"];
    if (exam.includes("Navy")) return EXAM_THEMES["Pakistan Navy"];
    if (exam.includes("MDCAT")) return EXAM_THEMES["MDCAT"];
    if (exam.includes("ECAT") || exam.includes("Engineering"))
      return EXAM_THEMES["ECAT"];
    return EXAM_THEMES["general"];
  };

  const theme = getTheme();

  const fetchDashboardData = async () => {
    try {
      const examsRes = await axios.get("/api/exams");
      setExams(examsRes.data);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoadingExams(false);
    }

    try {
      const resultsRes = await axios.get("/api/results/my-results");
      setResults(resultsRes.data);
    } catch (err) {
      console.error("Error fetching results:", err);
    }

    try {
      const stagesRes = await axios.get(
        `/api/tests/stages?examName=${encodeURIComponent(user?.desiredExam || "")}`,
      );
      setStagesInfo(stagesRes.data);
    } catch (err) {
      console.error("Error fetching stages:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage("");
    try {
      const res = await axios.post("/api/exams/seed");
      setSeedMessage(res.data.message || "Seeded successfully!");
      fetchDashboardData();
    } catch (err) {
      setSeedMessage(err.response?.data?.message || "Seeding failed");
    } finally {
      setSeeding(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { sender: "user", text: chatMessage };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setChatMessage("");
    setChatLoading(true);

    try {
      const res = await axios.post("/api/study/chat", {
        message: userMsg.text,
        history: updatedHistory,
      });
      const replyText =
        res.data?.reply || "No response from AI. Please try again.";
      setChatHistory((prev) => [
        ...prev,
        { sender: "assistant", text: replyText },
      ]);
    } catch (err) {
      console.error("Chat request failed:", err);
      setChatHistory((prev) => [
        ...prev,
        { sender: "assistant", text: "Offline: Verify API keys in settings." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Calculate Metrics
  const chartData = results
    .slice()
    .reverse()
    .map((r, index) => ({
      name: `Test ${index + 1}`,
      score: r.score,
      date: new Date(r.takenAt).toLocaleDateString(),
    }));

  const avgScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.score, 0) / results.length,
        )
      : 0;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} dark:${theme.bgGradient} text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-500`}
    >
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-40 bg-white/10 dark:bg-slate-900/10 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm">
        <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
          {logoFailed ? (
            <span className="text-sm sm:text-xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
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
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-gray-100">
              {user?.name || "Student"}
            </span>
            <span className="text-xs text-gray-400 capitalize">
              {user?.role || "User"} Dashboard
            </span>
          </div>
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="avatar"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover border border-white/20"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow text-xs sm:text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <ThemeToggle />
          <button
            onClick={() => navigate("/profile")}
            className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition text-sm sm:text-base"
            title="Settings"
          >
            👤
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition whitespace-nowrap"
            >
              <span className="hidden sm:inline">Admin Suite</span><span className="sm:hidden">Admin</span>
            </button>
          )}
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition text-sm sm:text-base"
            title="Log Out"
          >
            ✕
          </button>
          <NotificationBell />
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Dynamic Theme Banner */}
        <div
          className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${theme.colorClasses.gradient} p-8 text-white shadow-2xl transition-all duration-500`}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
          <div className="relative z-10 space-y-3">
            <span className="px-3 py-1 text-xs font-black rounded-full bg-white/20 border border-white/20 uppercase tracking-widest">
              {theme.badgeIcon} {theme.badgeTitle}
            </span>
            <h2 className="text-4xl font-black">
              Prepare for {user?.desiredExam || "your target exam"}
            </h2>
            <p className="text-white/80 max-w-2xl text-sm leading-relaxed">
              {theme.bannerText}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate("/generate-test")}
                className="px-5 py-3 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:scale-105 transition-all"
              >
                🔧 Generate Bank-Based Mock Test
              </button>
              <button
                onClick={() => navigate("/study-plan")}
                className="px-5 py-3 rounded-xl bg-black/30 border border-white/20 text-white font-extrabold text-xs hover:bg-black/55 transition-all"
              >
                📅 View Study Planner
              </button>
            </div>
          </div>
        </div>

        {/* Stage Progression Flow HUD */}
        {stagesInfo && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🚀</span> Exam Stage progression Status
                </h3>
                <p className="text-xs text-gray-400">
                  Current Phase:{" "}
                  <strong className="text-indigo-400">
                    {stagesInfo.stageName}
                  </strong>
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                Stage {stagesInfo.currentStage} of {stagesInfo.stages?.length}
              </span>
            </div>

            {/* Stages Progression HUD */}
            <div className="flex flex-col md:flex-row gap-4 justify-between pt-2">
              {stagesInfo.stages?.map((stage) => {
                const isCurrent = stage.number === stagesInfo.currentStage;
                return (
                  <div
                    key={stage.number}
                    className={`flex-1 p-4 rounded-2xl border flex flex-col justify-between space-y-2 transition-all ${
                      stage.passed
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : isCurrent
                          ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-lg"
                          : "bg-white/5 border-white/5 text-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Phase {stage.number}
                      </span>
                      <span>
                        {stage.passed ? "✓" : isCurrent ? "🔥" : "🔒"}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-gray-200">
                      {stage.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-white/20 transition">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl text-2xl">
                📝
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  Total Attempted Tests
                </p>
                <h3 className="text-2xl font-black mt-1 text-white">
                  {results.length}
                </h3>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-white/20 transition">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl text-2xl">
                🎯
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  Average Score
                </p>
                <h3 className="text-2xl font-black mt-1 text-white">
                  {avgScore}%
                </h3>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-white/20 transition">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl text-2xl">
                🔥
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  Daily Study Streak
                </p>
                <h3 className="text-2xl font-black mt-1 text-white">
                  {user?.streak || 0} days
                </h3>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Mock Test Trajectory
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Accuracy evaluations from latest attempts
              </p>
            </div>
            <div
              className="h-48 w-full"
              style={{ width: "100%", height: "100%" }}
            >
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={192}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorScore"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#818cf8"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#818cf8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#f8fafc",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#818cf8"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm">
                  <span>
                    📊 Complete a mock test to evaluate trajectory chart
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exams List */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">
              Active Recruits Syllabus Exams
            </h3>
            <p className="text-sm text-gray-400">
              Launch standard mock formats from configured exams
            </p>
          </div>

          {loadingExams ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-44 bg-white/5 border border-white/5 rounded-3xl"
                ></div>
              ))}
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center p-12 bg-white/5 border border-dashed border-white/10 rounded-3xl">
              <span className="text-5xl block mb-4">📭</span>
              <h4 className="text-lg font-bold text-gray-300">
                No mock exams loaded
              </h4>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow"
              >
                {seeding ? "Seeding..." : "Populate Sample Recruits Exams"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((ex) => (
                <div
                  key={ex._id}
                  className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-indigo-500/50 shadow hover:shadow-indigo-500/10 transition-all p-6 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300">
                        {ex.questions?.length || 0} Questions
                      </span>
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-300">
                        {ex.duration} Mins
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-200">
                      {ex.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-3">
                      {ex.description || "No description loaded."}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedExam(ex)}
                    className="mt-6 w-full py-3 bg-white/5 hover:bg-indigo-600 hover:text-white rounded-xl font-bold text-xs transition"
                  >
                    Start practice
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Practice History Table */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">
              Practice History & Certificates
            </h3>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 font-semibold text-gray-300">
                      Exam Title
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-300">
                      Date Taken
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-300 text-center">
                      Score
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-300 text-right">
                      Award
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((res) => (
                    <tr
                      key={res._id}
                      className="hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => navigate(`/result/${res._id}`)}
                    >
                      <td className="px-6 py-4 font-medium text-gray-200">
                        {res.exam?.title || "Unknown Exam"}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(res.takenAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-bold ${res.score >= 60 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {res.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {res.score >= 60 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/certificate/${res._id}`);
                            }}
                            className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-black hover:bg-indigo-500/40 transition"
                          >
                            📜 Certificate
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 font-bold">
                            Failed (Below 60%)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Selected Exam Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 transform animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-white">
                {selectedExam.title}
              </h3>
              <button
                onClick={() => setSelectedExam(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-400">{selectedExam.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/35 p-3 rounded-xl">
                <span className="text-xs text-gray-500 block font-medium">
                  Time Limit
                </span>
                <span className="text-base font-bold text-gray-200">
                  {selectedExam.duration} Minutes
                </span>
              </div>
              <div className="bg-black/35 p-3 rounded-xl">
                <span className="text-xs text-gray-500 block font-medium">
                  Total Questions
                </span>
                <span className="text-base font-bold text-gray-200">
                  {selectedExam.questions?.length || 0} MCQs
                </span>
              </div>
            </div>
            <button
              onClick={() => handleLaunchTest(selectedExam.title)}
              disabled={launchingTest}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {launchingTest ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Exam...
                </>
              ) : (
                "🚀 Launch Mock Exam"
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Tutor Chat Assistant Floating Drawer Widget */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl ml-auto hover:scale-110 active:scale-95 transition-all animate-bounce"
            title="Ask AI Exam Assistant"
          >
            💬
          </button>
        ) : (
          <div className="w-full sm:w-96 h-[400px] sm:h-[480px] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div>
                  <h4 className="font-bold text-xs text-white">
                    AI Exam Assistant
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Tutor Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white align-self-end ml-auto rounded-tr-none"
                      : "bg-white/5 text-gray-200 mr-auto rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              ))}
              {chatLoading && (
                <div className="bg-white/5 text-gray-200 mr-auto rounded-2xl rounded-tl-none max-w-[85%] p-3 text-xs flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendChatMessage}
              className="p-3 bg-white/5 border-t border-white/10 flex gap-2"
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask prep questions..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
