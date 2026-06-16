// src/pages/AdminDashboard.jsx – Comprehensive Premium Admin Suite
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle.jsx";

// ─── Tab Configuration ────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "exams", label: "Exams", icon: "📝" },
  { id: "question-bank", label: "Question Bank", icon: "🧠" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "ai-config", label: "AI Config", icon: "🤖" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "bulk-import", label: "Bulk Import", icon: "📦" },
];

// ─── Reusable Glass Card ──────────────────────────────────────────────────────
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl ${className}`}
  >
    {children}
  </div>
);

// ─── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === "success"
      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
      : type === "error"
        ? "bg-red-500/20 border-red-500/40 text-red-300"
        : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300";

  return (
    <div
      className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl text-sm font-semibold flex items-center gap-3 animate-slide-in ${colors}`}
    >
      <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-60 hover:opacity-100 transition"
      >
        ✕
      </button>
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <GlassCard className="p-6 max-w-sm w-full space-y-4 shadow-2xl border-red-500/20">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-bold transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition"
        >
          Confirm
        </button>
      </div>
    </GlassCard>
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── Global State ──
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => setToast({ message, type });

  // ── Overview State ──
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTests: 0,
    totalExams: 0,
    activeUsers: 0,
    totalQuestions: 0,
    questionsBySubject: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Exams State ──
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [examView, setExamView] = useState("list"); // list | create | edit | questions
  const [activeExam, setActiveExam] = useState(null);
  const [examForm, setExamForm] = useState({
    title: "",
    description: "",
    duration: 15,
  });
  const [questionForm, setQuestionForm] = useState({
    text: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOptionIndex: 0,
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionBank, setQuestionBank] = useState([]);
  const [questionBankLoading, setQuestionBankLoading] = useState(true);
  const [questionBankSearch, setQuestionBankSearch] = useState("");
  const [bankFilterSubject, setBankFilterSubject] = useState("");
  const [bankFilterExam, setBankFilterExam] = useState("");
  const [bankFilterDifficulty, setBankFilterDifficulty] = useState("");
  // Pagination state — question bank
  const [bankPage, setBankPage] = useState(1);
  const [bankTotalPages, setBankTotalPages] = useState(1);
  const [bankTotalCount, setBankTotalCount] = useState(0);
  const BANK_PAGE_SIZE = 20;
  const [bankQuestionForm, setBankQuestionForm] = useState({
    exam: "",
    subject: "",
    difficulty: "medium",
    tags: "",
    explanation: "",
    text: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOptionIndex: 0,
    isActive: true,
  });
  const [editingBankQuestion, setEditingBankQuestion] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'exam'|'question'|'user', id, name }

  // ── Users State ──
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  // Pagination state — users
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const USERS_PAGE_SIZE = 25;

  // ── AI Config State ──
  const [aiSettings, setAiSettings] = useState({
    aiProvider: "openrouter",
    openrouterKey: "",
  });
  const [aiLoading, setAiLoading] = useState(true);
  const [aiSaving, setAiSaving] = useState(false);

  // ── Notifications State ──
  const [notifForm, setNotifForm] = useState({
    userId: "",
    title: "",
    message: "",
    type: "general",
  });
  const [notifSending, setNotifSending] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);

  // ── Bulk Import State ──
  const [importFile, setImportFile] = useState(null);
  const [importExamId, setImportExamId] = useState("");
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const fileInputRef = useRef(null);

  // Caching Refs
  const statsLoadedRef = useRef(false);
  const examsLoadedRef = useRef(false);
  const usersLoadedRef = useRef(false);
  const lastUsersPageRef = useRef(null);
  const lastUsersSearchRef = useRef(null);
  const aiSettingsLoadedRef = useRef(false);
  const questionBankLoadedRef = useRef(false);
  const lastBankPageRef = useRef(null);
  const lastBankSearchRef = useRef(null);
  const lastBankSubjectRef = useRef(null);
  const lastBankExamRef = useRef(null);
  const lastBankDifficultyRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA FETCHERS
  // ═══════════════════════════════════════════════════════════════════════════

  const fetchStats = async (force = false) => {
    if (statsLoadedRef.current && !force) return;
    setStatsLoading(true);
    try {
      const res = await axios.get("/api/admin/stats");
      setStats(res.data);
      statsLoadedRef.current = true;
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchExams = async (force = false) => {
    if (examsLoadedRef.current && !force) return;
    setExamsLoading(true);
    try {
      const res = await axios.get("/api/exams");
      setExams(res.data);
      examsLoadedRef.current = true;
    } catch (err) {
      console.error("Exams fetch error:", err);
    } finally {
      setExamsLoading(false);
    }
  };

  const fetchUsers = async (page = usersPage, search = userSearch, force = false) => {
    if (
      usersLoadedRef.current &&
      lastUsersPageRef.current === page &&
      lastUsersSearchRef.current === search &&
      !force
    ) {
      return;
    }
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(USERS_PAGE_SIZE),
      });
      if (search.trim()) params.set('search', search.trim());
      const res = await axios.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.users ?? res.data);
      setUsersTotalPages(res.data.totalPages ?? 1);
      setUsersTotalCount(res.data.totalCount ?? res.data.users?.length ?? 0);
      setUsersPage(page);

      usersLoadedRef.current = true;
      lastUsersPageRef.current = page;
      lastUsersSearchRef.current = search;
    } catch (err) {
      console.error("Users fetch error:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAiSettings = async (force = false) => {
    if (aiSettingsLoadedRef.current && !force) return;
    setAiLoading(true);
    try {
      const res = await axios.get("/api/admin/settings");
      setAiSettings({
        aiProvider: res.data.aiProvider || "openrouter",
        openrouterKey: res.data.openrouterKey || res.data.openaiKey || "",
      });
      aiSettingsLoadedRef.current = true;
    } catch (err) {
      console.error("AI settings fetch error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "overview") fetchStats();
    if (
      activeTab === "exams" ||
      activeTab === "overview" ||
      activeTab === "bulk-import" ||
      activeTab === "question-bank"
    )
      fetchExams();
    if (activeTab === "users" || activeTab === "notifications") fetchUsers(1, userSearch);
    if (activeTab === "ai-config") fetchAiSettings();
    if (activeTab === "question-bank") fetchQuestionBank(1);
  }, [activeTab]);

  // Debounced server-side user search — fires 400ms after typing stops
  useEffect(() => {
    if (activeTab !== "users" && activeTab !== "notifications") return;
    const timer = setTimeout(() => {
      fetchUsers(1, userSearch, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // ═══════════════════════════════════════════════════════════════════════════
  // EXAM HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/exams", examForm);
      showToast("Exam created successfully!", "success");
      setExamForm({ title: "", description: "", duration: 15 });
      setExamView("list");
      fetchExams(true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to create exam",
        "error",
      );
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/exams/${activeExam._id}`, examForm);
      showToast("Exam updated successfully!", "success");
      setExamView("list");
      setActiveExam(null);
      fetchExams(true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update exam",
        "error",
      );
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await axios.delete(`/api/exams/${examId}`);
      showToast("Exam deleted successfully!", "success");
      fetchExams(true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete exam",
        "error",
      );
    }
    setConfirmDelete(null);
  };

  const openEditExam = (exam) => {
    setActiveExam(exam);
    setExamForm({
      title: exam.title,
      description: exam.description || "",
      duration: exam.duration,
    });
    setExamView("edit");
  };

  const openExamQuestions = async (exam) => {
    try {
      const res = await axios.get(`/api/exams/${exam._id}`);
      setActiveExam(res.data);
      setExamView("questions");
    } catch (err) {
      showToast("Failed to load exam details", "error");
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        text: questionForm.text,
        options: [
          questionForm.optionA,
          questionForm.optionB,
          questionForm.optionC,
          questionForm.optionD,
        ],
        correctOptionIndex: Number(questionForm.correctOptionIndex),
      };
      await axios.post(`/api/exams/${activeExam._id}/questions`, payload);
      showToast("Question added!", "success");
      setQuestionForm({
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOptionIndex: 0,
      });
      const updated = await axios.get(`/api/exams/${activeExam._id}`);
      setActiveExam(updated.data);
      fetchExams(true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to add question",
        "error",
      );
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        text: questionForm.text,
        options: [
          questionForm.optionA,
          questionForm.optionB,
          questionForm.optionC,
          questionForm.optionD,
        ],
        correctOptionIndex: Number(questionForm.correctOptionIndex),
      };
      await axios.put(`/api/exams/questions/${editingQuestion._id}`, payload);
      showToast("Question updated!", "success");
      setEditingQuestion(null);
      setQuestionForm({
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOptionIndex: 0,
      });
      const updated = await axios.get(`/api/exams/${activeExam._id}`);
      setActiveExam(updated.data);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update question",
        "error",
      );
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(`/api/exams/questions/${questionId}`);
      showToast("Question deleted!", "success");
      const updated = await axios.get(`/api/exams/${activeExam._id}`);
      setActiveExam(updated.data);
      fetchExams(true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete question",
        "error",
      );
    }
    setConfirmDelete(null);
  };

  const startEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      text: q.text,
      optionA: q.options[0] || "",
      optionB: q.options[1] || "",
      optionC: q.options[2] || "",
      optionD: q.options[3] || "",
      correctOptionIndex: q.correctOptionIndex,
    });
  };

  const fetchQuestionBank = async (page = bankPage, force = false) => {
    if (
      questionBankLoadedRef.current &&
      lastBankPageRef.current === page &&
      lastBankSearchRef.current === questionBankSearch &&
      lastBankSubjectRef.current === bankFilterSubject &&
      lastBankExamRef.current === bankFilterExam &&
      lastBankDifficultyRef.current === bankFilterDifficulty &&
      !force
    ) {
      return;
    }
    setQuestionBankLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(BANK_PAGE_SIZE),
        page: String(page),
      });
      if (bankFilterSubject) params.set("subject", bankFilterSubject);
      if (bankFilterExam) params.set("examName", bankFilterExam);
      if (bankFilterDifficulty) params.set("difficulty", bankFilterDifficulty);
      if (questionBankSearch) params.set("keyword", questionBankSearch);
      const res = await axios.get(`/api/questions?${params.toString()}`);
      // Support both old (array) and new (paginated object) response shapes
      const data = Array.isArray(res.data) ? res.data : res.data.questions ?? [];
      setQuestionBank(data);
      setBankTotalPages(res.data.totalPages ?? 1);
      setBankTotalCount(res.data.totalCount ?? data.length);
      setBankPage(page);

      questionBankLoadedRef.current = true;
      lastBankPageRef.current = page;
      lastBankSearchRef.current = questionBankSearch;
      lastBankSubjectRef.current = bankFilterSubject;
      lastBankExamRef.current = bankFilterExam;
      lastBankDifficultyRef.current = bankFilterDifficulty;
    } catch (err) {
      console.error("Question bank fetch error:", err);
      showToast(
        err.response?.data?.message || "Failed to load question bank",
        "error",
      );
    } finally {
      setQuestionBankLoading(false);
    }
  };

  const clearBankQuestionForm = () => {
    setEditingBankQuestion(null);
    setBankQuestionForm({
      exam: "",
      subject: "",
      difficulty: "medium",
      tags: "",
      explanation: "",
      text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOptionIndex: 0,
      isActive: true,
    });
  };

  const startEditBankQuestion = (q) => {
    setEditingBankQuestion(q);
    setBankQuestionForm({
      exam: q.exam || "",
      subject: q.subject || "",
      difficulty: q.difficulty || "medium",
      tags: Array.isArray(q.tags)
        ? q.tags.join(", ")
        : (q.tags || "").toString(),
      explanation: q.explanation || "",
      text: q.text || "",
      optionA: q.options?.[0] || "",
      optionB: q.options?.[1] || "",
      optionC: q.options?.[2] || "",
      optionD: q.options?.[3] || "",
      correctOptionIndex: q.correctOptionIndex || 0,
      isActive: q.isActive !== false,
    });
  };

  const handleCreateBankQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        exam: bankQuestionForm.exam || undefined,
        subject: bankQuestionForm.subject || undefined,
        difficulty: bankQuestionForm.difficulty,
        tags: bankQuestionForm.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        explanation: bankQuestionForm.explanation,
        text: bankQuestionForm.text,
        options: [
          bankQuestionForm.optionA,
          bankQuestionForm.optionB,
          bankQuestionForm.optionC,
          bankQuestionForm.optionD,
        ],
        correctOptionIndex: Number(bankQuestionForm.correctOptionIndex),
        type: "single",
        isActive: bankQuestionForm.isActive,
      };
      await axios.post("/api/questions", payload);
      showToast("Question bank item created!", "success");
      clearBankQuestionForm();
      fetchQuestionBank(bankPage, true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to create question",
        "error",
      );
    }
  };

  const handleUpdateBankQuestion = async (e) => {
    e.preventDefault();
    if (!editingBankQuestion) return;
    try {
      const payload = {
        exam: bankQuestionForm.exam || undefined,
        subject: bankQuestionForm.subject || undefined,
        difficulty: bankQuestionForm.difficulty,
        tags: bankQuestionForm.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        explanation: bankQuestionForm.explanation,
        text: bankQuestionForm.text,
        options: [
          bankQuestionForm.optionA,
          bankQuestionForm.optionB,
          bankQuestionForm.optionC,
          bankQuestionForm.optionD,
        ],
        correctOptionIndex: Number(bankQuestionForm.correctOptionIndex),
        type: "single",
        isActive: bankQuestionForm.isActive,
      };
      await axios.put(`/api/questions/${editingBankQuestion._id}`, payload);
      showToast("Question bank item updated!", "success");
      clearBankQuestionForm();
      fetchQuestionBank(bankPage, true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update question",
        "error",
      );
    }
  };

  const handleDeleteBankQuestion = async (questionId) => {
    try {
      await axios.delete(`/api/questions/${questionId}`);
      showToast("Question bank item deleted!", "success");
      fetchQuestionBank(bankPage, true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete question",
        "error",
      );
    }
    setConfirmDelete(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // USER HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      showToast(`Role changed to ${newRole}`, "success");
      fetchUsers(usersPage, userSearch, true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update role",
        "error",
      );
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "blocked" ? "active" : "blocked";
    try {
      await axios.put(`/api/admin/users/${userId}/status`, {
        status: newStatus,
      });
      showToast(`User ${newStatus}`, "success");
      fetchUsers(usersPage, userSearch, true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update status",
        "error",
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      showToast("User deleted", "success");
      fetchUsers(usersPage, userSearch, true);
      statsLoadedRef.current = false;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete user",
        "error",
      );
    }
    setConfirmDelete(null);
  };

  // Search is now server-side; users array already contains only the current page
  const filteredUsers = users;

  // ═══════════════════════════════════════════════════════════════════════════
  // AI CONFIG HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSaveAiSettings = async (e) => {
    e.preventDefault();
    setAiSaving(true);
    try {
      const payload = {
        ...aiSettings,
        aiProvider: "openrouter",
      };
      await axios.put("/api/admin/settings", payload);
      setAiSettings((prev) => ({ ...prev, aiProvider: "openrouter" }));
      showToast("AI settings saved!", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to save settings",
        "error",
      );
    } finally {
      setAiSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATION HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setNotifSending(true);
    try {
      await axios.post("/api/notifications", notifForm);
      const sentUser = users.find((u) => u._id === notifForm.userId);
      setSentNotifications((prev) => [
        {
          ...notifForm,
          userName: sentUser?.name || "Unknown",
          sentAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      showToast("Notification sent!", "success");
      setNotifForm({ userId: "", title: "", message: "", type: "general" });
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to send notification",
        "error",
      );
    } finally {
      setNotifSending(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BULK IMPORT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleFileUpload = async () => {
    if (!importFile) return showToast("Please select a file first", "error");
    setImporting(true);
    setImportProgress(0);
    setParsedQuestions([]);

    const formData = new FormData();
    formData.append("file", importFile);

    const isPdf = importFile.name.endsWith(".pdf");
    const endpoint = isPdf
      ? "/api/upload/pdf-import"
      : "/api/upload/excel-import";

    try {
      const res = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / (e.total || 1));
          setImportProgress(pct);
        },
      });
      setParsedQuestions(res.data.questions || res.data || []);
      showToast(
        `Parsed ${(res.data.questions || res.data || []).length} questions from file`,
        "success",
      );
    } catch (err) {
      showToast(err.response?.data?.message || "File upload failed", "error");
    } finally {
      setImporting(false);
    }
  };

  const handleImportToExam = async () => {
    if (!importExamId) return showToast("Select a target exam first", "error");
    if (!parsedQuestions.length)
      return showToast("No parsed questions to import", "error");

    let success = 0;
    for (const q of parsedQuestions) {
      try {
        const payload = {
          text: q.text || q.question,
          options: q.options || [q.optionA, q.optionB, q.optionC, q.optionD],
          correctOptionIndex: q.correctOptionIndex ?? q.answer ?? 0,
        };
        await axios.post(`/api/exams/${importExamId}/questions`, payload);
        success++;
      } catch (err) {
        console.error("Import question error:", err);
      }
    }
    showToast(
      `Imported ${success}/${parsedQuestions.length} questions into exam`,
      "success",
    );
    setParsedQuestions([]);
    setImportFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    fetchExams(true);
    statsLoadedRef.current = false;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SHARED STYLES
  // ═══════════════════════════════════════════════════════════════════════════

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm";
  const labelClass =
    "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2";
  const primaryBtn =
    "px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.97] transition-all";
  const secondaryBtn =
    "px-4 py-2.5 border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-bold rounded-xl transition";

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Tab 1: Overview ────────────────────────────────────────────────────────
  const renderOverview = () => {
    const statCards = [
      {
        label: "Total Users",
        value: stats.totalUsers,
        icon: "👥",
        color: "from-blue-500 to-cyan-500",
      },
      {
        label: "Total Tests Taken",
        value: stats.totalTests,
        icon: "📝",
        color: "from-emerald-500 to-teal-500",
      },
      {
        label: "Total Exams",
        value: stats.totalExams,
        icon: "📚",
        color: "from-purple-500 to-pink-500",
      },
      {
        label: "Active Users",
        value: stats.activeUsers,
        icon: "🟢",
        color: "from-amber-500 to-orange-500",
      },
      {
        label: "Total MCQs",
        value: stats.totalQuestions || 0,
        icon: "🧠",
        color: "from-indigo-500 to-purple-500",
      },
    ];

    return (
      <div className="space-y-8">
        {/* Stats Grid */}
        {statsLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {statCards.map((s) => (
              <GlassCard
                key={s.label}
                className="p-6 hover:border-white/20 transition group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`p-3 rounded-xl bg-gradient-to-r ${s.color} text-white text-xl shadow-lg`}
                  >
                    {s.icon}
                  </span>
                  <span className="text-3xl font-black text-white group-hover:scale-110 transition-transform">
                    {s.value}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  {s.label}
                </p>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Quick Actions + Distribution + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              ⚡ Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setActiveTab("exams");
                  setExamView("create");
                }}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition-all active:scale-[0.97]"
              >
                📝 Create New Exam
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs rounded-xl transition"
              >
                🔔 Send Notification
              </button>
              <button
                onClick={() => setActiveTab("bulk-import")}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs rounded-xl transition"
              >
                📦 Bulk Import Questions
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs rounded-xl transition"
              >
                👥 Manage Users
              </button>
            </div>
          </GlassCard>

          {/* MCQ Distribution */}
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              📚 MCQ Subjects Distribution
            </h3>
            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
              {stats.questionsBySubject && stats.questionsBySubject.length > 0 ? (
                stats.questionsBySubject.map((subj) => {
                  const percent = Math.round((subj.count / (stats.totalQuestions || 1)) * 100) || 0;
                  return (
                    <div key={subj._id || "unassigned"} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-300">
                        <span className="font-semibold">{subj._id || "Unassigned"}</span>
                        <span className="text-gray-400">{subj.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-xs py-4 text-center">No subject data available</p>
              )}
            </div>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              📋 Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                {
                  icon: "🧠",
                  text: `${stats.totalQuestions || 0} MCQs stored in database`,
                  time: "Question pool size",
                },
                {
                  icon: "📝",
                  text: `${stats.totalExams} exams configured in system`,
                  time: "System total",
                },
                {
                  icon: "👥",
                  text: `${stats.totalUsers} registered users`,
                  time: "System total",
                },
                {
                  icon: "📊",
                  text: `${stats.totalTests} tests completed`,
                  time: "System total",
                },
              ].map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-2 px-3 rounded-xl hover:bg-white/5 transition"
                >
                  <span className="text-lg">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">{a.text}</p>
                    <p className="text-xs text-gray-500">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    );
  };

  // ─── Tab 2: Exam Management ─────────────────────────────────────────────────
  const renderExamForm = (onSubmit, isEdit = false) => (
    <GlassCard className="p-6 max-w-lg mx-auto space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">
          {isEdit ? "Edit Exam" : "New Exam Configuration"}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Define the exam metadata for candidates
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Exam Title</label>
          <input
            type="text"
            required
            value={examForm.title}
            onChange={(e) =>
              setExamForm({ ...examForm, title: e.target.value })
            }
            placeholder="e.g. PMA Intelligence Verbal Test"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={examForm.description}
            onChange={(e) =>
              setExamForm({ ...examForm, description: e.target.value })
            }
            placeholder="Briefly describe the syllabus..."
            className={`${inputClass} h-24 resize-none`}
          />
        </div>
        <div>
          <label className={labelClass}>Duration (Minutes)</label>
          <input
            type="number"
            required
            min={1}
            value={examForm.duration}
            onChange={(e) =>
              setExamForm({ ...examForm, duration: Number(e.target.value) })
            }
            className={inputClass}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setExamView("list");
              setActiveExam(null);
            }}
            className={`flex-1 py-3 ${secondaryBtn}`}
          >
            Cancel
          </button>
          <button type="submit" className={`flex-1 py-3 ${primaryBtn}`}>
            {isEdit ? "Update Exam" : "Create Exam"}
          </button>
        </div>
      </form>
    </GlassCard>
  );

  const renderQuestionForm = () => {
    const isEditing = !!editingQuestion;
    return (
      <form
        onSubmit={isEditing ? handleUpdateQuestion : handleAddQuestion}
        className="space-y-4"
      >
        <div>
          <label className={labelClass}>Question Body</label>
          <textarea
            required
            value={questionForm.text}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, text: e.target.value })
            }
            placeholder="Type the question here..."
            className={`${inputClass} h-20 resize-none`}
          />
        </div>
        {["optionA", "optionB", "optionC", "optionD"].map((opt, i) => (
          <div key={opt}>
            <label className={labelClass}>
              Option {String.fromCharCode(65 + i)}
            </label>
            <input
              type="text"
              required
              value={questionForm[opt]}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, [opt]: e.target.value })
              }
              placeholder={`Option ${String.fromCharCode(65 + i)} text`}
              className={inputClass}
            />
          </div>
        ))}
        <div>
          <label className={labelClass}>Correct Answer</label>
          <select
            value={questionForm.correctOptionIndex}
            onChange={(e) =>
              setQuestionForm({
                ...questionForm,
                correctOptionIndex: Number(e.target.value),
              })
            }
            className={inputClass}
          >
            <option value={0}>Option A</option>
            <option value={1}>Option B</option>
            <option value={2}>Option C</option>
            <option value={3}>Option D</option>
          </select>
        </div>
        <div className="flex gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setEditingQuestion(null);
                setQuestionForm({
                  text: "",
                  optionA: "",
                  optionB: "",
                  optionC: "",
                  optionD: "",
                  correctOptionIndex: 0,
                });
              }}
              className={`flex-1 py-3 ${secondaryBtn}`}
            >
              Cancel Edit
            </button>
          )}
          <button type="submit" className={`flex-1 py-3 ${primaryBtn}`}>
            {isEditing ? "Update MCQ" : "Save MCQ"}
          </button>
        </div>
      </form>
    );
  };

  const renderExams = () => {
    if (examView === "create") return renderExamForm(handleCreateExam);
    if (examView === "edit") return renderExamForm(handleUpdateExam, true);

    if (examView === "questions" && activeExam) {
      return (
        <div className="space-y-8">
          <div>
            <button
              onClick={() => {
                setExamView("list");
                setActiveExam(null);
                setEditingQuestion(null);
              }}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition mb-2 block"
            >
              ← Back to Exam List
            </button>
            <h3 className="text-xl font-bold text-white">
              {activeExam.title} — MCQ Editor
            </h3>
            <p className="text-xs text-gray-400">
              {activeExam.questions?.length || 0} questions configured
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Question Form */}
            <GlassCard className="lg:col-span-2 p-6 h-fit space-y-5">
              <h4 className="font-bold text-sm text-white">
                {editingQuestion
                  ? "✏️ Editing Question"
                  : "➕ Add New Question"}
              </h4>
              {renderQuestionForm()}
            </GlassCard>

            {/* Questions List */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="font-bold text-sm text-white">
                Configured MCQs ({activeExam.questions?.length || 0})
              </h4>
              {!activeExam.questions?.length ? (
                <GlassCard className="text-center p-10">
                  <span className="text-3xl block mb-2">📭</span>
                  <p className="text-gray-500 text-xs">
                    No questions added yet. Use the form to create MCQs.
                  </p>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {activeExam.questions.map((q, idx) => (
                    <GlassCard
                      key={q._id}
                      className="p-5 space-y-3 hover:border-white/20 transition"
                    >
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-sm text-gray-100 flex-1">
                          {idx + 1}. {q.text}
                        </h5>
                        <div className="flex gap-2 ml-3 shrink-0">
                          <button
                            onClick={() => startEditQuestion(q)}
                            className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: "question",
                                id: q._id,
                                name: q.text.substring(0, 30) + "...",
                              })
                            }
                            className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border ${oIdx === q.correctOptionIndex ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold" : "border-white/5 text-gray-400"}`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default: Exam List
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">
              Exam Configurations
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Manage all system mock exam layouts
            </p>
          </div>
          <button
            onClick={() => {
              setExamForm({ title: "", description: "", duration: 15 });
              setExamView("create");
            }}
            className={primaryBtn}
          >
            + Create Exam
          </button>
        </div>

        {examsLoading ? (
          <Spinner />
        ) : !exams.length ? (
          <GlassCard className="text-center p-12">
            <span className="text-4xl block mb-3">📁</span>
            <p className="text-gray-400 text-sm">
              No exams configured yet. Create one to begin.
            </p>
          </GlassCard>
        ) : (
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 font-semibold text-gray-300">
                      Title
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-300">
                      Description
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-300 text-center">
                      Duration
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-300 text-center">
                      Questions
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-300 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {exams.map((ex) => (
                    <tr key={ex._id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 font-bold text-gray-200">
                        {ex.title}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs max-w-[200px] truncate">
                        {ex.description || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-center">
                        {ex.duration} mins
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300">
                          {ex.questions?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openExamQuestions(ex)}
                            className="px-3 py-1.5 text-xs font-bold bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition"
                          >
                            📋 MCQs
                          </button>
                          <button
                            onClick={() => openEditExam(ex)}
                            className="px-3 py-1.5 text-xs font-bold bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: "exam",
                                id: ex._id,
                                name: ex.title,
                              })
                            }
                            className="px-3 py-1.5 text-xs font-bold bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  // ─── Tab 3: User Management ─────────────────────────────────────────────────
  const renderQuestionBank = () => {
    const EXAM_FILTER_OPTIONS = [
      "PMA",
      "Army",
      "Navy",
      "Air Force",
      "ASF",
      "FIA",
      "ANF",
      "Police",
      "UDC",
      "LDC",
      "MDCAT",
      "ECAT",
    ];
    const SUBJECT_FILTER_OPTIONS = [
      "English",
      "Urdu",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "General Knowledge",
      "Islamic Studies",
      "Pakistan Studies",
      "Intelligence",
      "Verbal Intelligence",
      "Non Verbal Intelligence",
    ];

    const bankFormTitle = editingBankQuestion
      ? "Edit Bank Question"
      : "Add Bank Question";

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Question Bank</h3>
            <p className="text-xs text-gray-400 mt-1">
              Bulk upload MCQs or search and manage individual questions
            </p>
          </div>
          <div className="inline-flex gap-2">
            <button
              onClick={() => navigate("/admin/bulk-upload")}
              className={primaryBtn}
            >
              📦 Bulk JSON Upload
            </button>
            <button onClick={clearBankQuestionForm} className={secondaryBtn}>
              Reset Form
            </button>
            <span className="px-3 py-2 text-xs rounded-full bg-white/5 text-gray-300">
              {questionBank.length} items
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <GlassCard className="p-6 space-y-5 xl:col-span-1">
            <div>
              <h4 className="text-sm font-bold text-white">{bankFormTitle}</h4>
              <p className="text-xs text-gray-500">
                Create or update a question bank item with metadata.
              </p>
            </div>
            <form
              onSubmit={
                editingBankQuestion
                  ? handleUpdateBankQuestion
                  : handleCreateBankQuestion
              }
              className="space-y-4"
            >
              <div>
                <label className={labelClass}>Question Text</label>
                <textarea
                  required
                  value={bankQuestionForm.text}
                  onChange={(e) =>
                    setBankQuestionForm({
                      ...bankQuestionForm,
                      text: e.target.value,
                    })
                  }
                  className={`${inputClass} h-24 resize-none`}
                  placeholder="Enter the question text"
                />
              </div>
              <div>
                <label className={labelClass}>Subject</label>
                <input
                  type="text"
                  value={bankQuestionForm.subject}
                  onChange={(e) =>
                    setBankQuestionForm({
                      ...bankQuestionForm,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Subject or topic"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Difficulty</label>
                <select
                  value={bankQuestionForm.difficulty}
                  onChange={(e) =>
                    setBankQuestionForm({
                      ...bankQuestionForm,
                      difficulty: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Tags</label>
                <input
                  type="text"
                  value={bankQuestionForm.tags}
                  onChange={(e) =>
                    setBankQuestionForm({
                      ...bankQuestionForm,
                      tags: e.target.value,
                    })
                  }
                  placeholder="Comma-separated tags"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Exam Association (optional)
                </label>
                <select
                  value={bankQuestionForm.exam}
                  onChange={(e) =>
                    setBankQuestionForm({
                      ...bankQuestionForm,
                      exam: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="">No exam association</option>
                  {exams.map((ex) => (
                    <option key={ex._id} value={ex._id}>
                      {ex.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Explanation</label>
                <textarea
                  value={bankQuestionForm.explanation}
                  onChange={(e) =>
                    setBankQuestionForm({
                      ...bankQuestionForm,
                      explanation: e.target.value,
                    })
                  }
                  className={`${inputClass} h-20 resize-none`}
                  placeholder="Correct answer explanation"
                />
              </div>
              {["optionA", "optionB", "optionC", "optionD"].map((opt, idx) => (
                <div key={opt}>
                  <label className={labelClass}>
                    Option {String.fromCharCode(65 + idx)}
                  </label>
                  <input
                    type="text"
                    required
                    value={bankQuestionForm[opt]}
                    onChange={(e) =>
                      setBankQuestionForm({
                        ...bankQuestionForm,
                        [opt]: e.target.value,
                      })
                    }
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className={inputClass}
                  />
                </div>
              ))}
              <div>
                <label className={labelClass}>Correct Option</label>
                <select
                  value={bankQuestionForm.correctOptionIndex}
                  onChange={(e) =>
                    setBankQuestionForm({
                      ...bankQuestionForm,
                      correctOptionIndex: Number(e.target.value),
                    })
                  }
                  className={inputClass}
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={clearBankQuestionForm}
                  className={`flex-1 py-3 ${secondaryBtn}`}
                >
                  Clear
                </button>
                <button type="submit" className={`flex-1 py-3 ${primaryBtn}`}>
                  {editingBankQuestion ? "Update Question" : "Save Question"}
                </button>
              </div>
            </form>
          </GlassCard>

          <div className="xl:col-span-2 space-y-4">
            <GlassCard className="p-6 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Bank Question List
                    {bankTotalCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300">
                        {bankTotalCount} total
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-400">
                    Search by subject, exam, difficulty, or keyword
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input
                  type="text"
                  value={questionBankSearch}
                  onChange={(e) => setQuestionBankSearch(e.target.value)}
                  placeholder="Keyword..."
                  className={inputClass}
                />
                <select
                  value={bankFilterSubject}
                  onChange={(e) => setBankFilterSubject(e.target.value)}
                  className={inputClass}
                >
                  <option value="">All Subjects</option>
                  {SUBJECT_FILTER_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  value={bankFilterExam}
                  onChange={(e) => setBankFilterExam(e.target.value)}
                  className={inputClass}
                >
                  <option value="">All Exams</option>
                  {EXAM_FILTER_OPTIONS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                <select
                  value={bankFilterDifficulty}
                  onChange={(e) => setBankFilterDifficulty(e.target.value)}
                  className={inputClass}
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <button
                  type="button"
                  onClick={() => fetchQuestionBank(1, true)}
                  className={primaryBtn}
                >
                  Search
                </button>
              </div>
              {questionBankLoading ? (
                <Spinner />
              ) : !questionBank.length ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No matching bank questions found.
                </div>
              ) : (
                <div className="space-y-3">
                  {questionBank.map((q, idx) => (
                    <GlassCard
                      key={q._id}
                      className="p-4 border-white/5 hover:border-white/10 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-full">
                              {q.subject || "General"}
                            </span>
                            {q.examName && (
                              <span className="text-xs uppercase tracking-[0.2em] text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded-full">
                                {q.examName}
                              </span>
                            )}
                            <span className="text-xs uppercase tracking-[0.2em] text-amber-300 bg-amber-500/10 px-2 py-1 rounded-full">
                              {q.difficulty || "medium"}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${q.isActive ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}
                            >
                              {q.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {(bankPage - 1) * BANK_PAGE_SIZE + idx + 1}. {q.text}
                          </p>
                          <p className="text-xs text-gray-400">
                            Tags: {q.tags?.join(", ") || "None"}
                          </p>
                          {q.explanation && (
                            <p className="text-xs text-gray-500">
                              Explanation: {q.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditBankQuestion(q)}
                            className="px-3 py-2 text-xs font-bold bg-indigo-500/20 text-indigo-300 rounded-xl hover:bg-indigo-500/30 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: "bank-question",
                                id: q._id,
                                name: q.text.substring(0, 50),
                              })
                            }
                            className="px-3 py-2 text-xs font-bold bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {q.options?.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border ${optIdx === q.correctOptionIndex ? "bg-emerald-500/10 border-emerald-500/20" : "border-white/10 bg-white/5"}`}
                          >
                            <span className="text-xs font-semibold text-gray-200">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <p className="text-sm text-gray-300 mt-1">{opt}</p>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* ── Question Bank Pagination ── */}
              {!questionBankLoading && bankTotalPages > 1 && (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-gray-400">
                    Page {bankPage} of {bankTotalPages} &bull; {bankTotalCount} questions
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={bankPage <= 1}
                      onClick={() => fetchQuestionBank(bankPage - 1, true)}
                      className="px-3 py-1.5 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Prev
                    </button>
                    <button
                      disabled={bankPage >= bankTotalPages}
                      onClick={() => fetchQuestionBank(bankPage + 1, true)}
                      className="px-3 py-1.5 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            User Management
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300">
              {usersTotalCount} total
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Manage platform users, roles, and access
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="🔍 Search users by name or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className={`${inputClass} sm:w-80`}
          />
        </div>
      </div>

      {usersLoading ? (
        <Spinner />
      ) : !filteredUsers.length ? (
        <GlassCard className="text-center p-12">
          <span className="text-4xl block mb-3">👤</span>
          <p className="text-gray-400 text-sm">
            {userSearch ? "No users match your search." : "No users found."}
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-5 py-4 font-semibold text-gray-300">
                    Name
                  </th>
                  <th className="px-5 py-4 font-semibold text-gray-300">
                    Email
                  </th>
                  <th className="px-5 py-4 font-semibold text-gray-300 text-center">
                    Role
                  </th>
                  <th className="px-5 py-4 font-semibold text-gray-300 text-center">
                    Status
                  </th>
                  <th className="px-5 py-4 font-semibold text-gray-300">
                    Desired Exam
                  </th>
                  <th className="px-5 py-4 font-semibold text-gray-300">
                    Joined
                  </th>
                  <th className="px-5 py-4 font-semibold text-gray-300 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition">
                    <td className="px-5 py-4 font-bold text-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {u.email}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.role === "admin" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.status === "blocked" ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}
                      >
                        {u.status || "active"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {u.desiredExam || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleToggleRole(u._id, u.role)}
                          className="px-2.5 py-1.5 text-xs font-bold bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition"
                          title="Toggle Role"
                        >
                          {u.role === "admin" ? "👤 Demote" : "🛡️ Promote"}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u._id, u.status)}
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${u.status === "blocked" ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"}`}
                          title="Toggle Status"
                        >
                          {u.status === "blocked" ? "✅ Unblock" : "🚫 Block"}
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: "user",
                              id: u._id,
                              name: u.name,
                            })
                          }
                          className="px-2.5 py-1.5 text-xs font-bold bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* ── Users Pagination ── */}
      {!usersLoading && usersTotalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            Page {usersPage} of {usersTotalPages} &bull; {usersTotalCount} users
          </p>
          <div className="flex gap-2">
            <button
              disabled={usersPage <= 1}
              onClick={() => fetchUsers(usersPage - 1, userSearch, true)}
              className="px-3 py-1.5 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              disabled={usersPage >= usersTotalPages}
              onClick={() => fetchUsers(usersPage + 1, userSearch, true)}
              className="px-3 py-1.5 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Tab 4: AI Configuration ────────────────────────────────────────────────
  const renderAiConfig = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">
          AI Provider Configuration
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Manage the AI backend used for test generation and chat
        </p>
      </div>

      {aiLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSaveAiSettings} className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h4 className="text-sm font-bold text-white">🧠 Active Provider</h4>
            <p className="text-sm text-gray-300">
              OpenRouter is the active AI provider for question generation and analysis.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h4 className="text-sm font-bold text-white">🔑 API Key</h4>
            <div>
              <label className={labelClass}>OpenRouter API Key</label>
              <input
                type="password"
                value={aiSettings.openrouterKey}
                onChange={(e) =>
                  setAiSettings({ ...aiSettings, openrouterKey: e.target.value })
                }
                placeholder="Enter OpenRouter API key..."
                className={inputClass}
              />
            </div>
          </GlassCard>

          <button
            type="submit"
            disabled={aiSaving}
            className={`w-full py-3 ${primaryBtn} ${aiSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {aiSaving ? "⏳ Saving..." : "💾 Save AI Configuration"}
          </button>
        </form>
      )}
    </div>
  );

  // ─── Tab 5: Notifications ───────────────────────────────────────────────────
  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">📣 Notification Center</h3>
        <p className="text-xs text-gray-400 mt-1">
          Send targeted notifications to platform users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Send Form */}
        <GlassCard className="lg:col-span-2 p-6 space-y-5 h-fit">
          <h4 className="text-sm font-bold text-white">Compose Notification</h4>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className={labelClass}>Recipient User</label>
              <select
                required
                value={notifForm.userId}
                onChange={(e) =>
                  setNotifForm({ ...notifForm, userId: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Notification Type</label>
              <select
                value={notifForm.type}
                onChange={(e) =>
                  setNotifForm({ ...notifForm, type: e.target.value })
                }
                className={inputClass}
              >
                <option value="general">📌 General</option>
                <option value="test_reminder">⏰ Test Reminder</option>
                <option value="plan_update">📅 Plan Update</option>
                <option value="achievement">🏆 Achievement</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                required
                value={notifForm.title}
                onChange={(e) =>
                  setNotifForm({ ...notifForm, title: e.target.value })
                }
                placeholder="Notification title..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Message</label>
              <textarea
                required
                value={notifForm.message}
                onChange={(e) =>
                  setNotifForm({ ...notifForm, message: e.target.value })
                }
                placeholder="Type your notification message..."
                className={`${inputClass} h-24 resize-none`}
              />
            </div>
            <button
              type="submit"
              disabled={notifSending}
              className={`w-full py-3 ${primaryBtn} ${notifSending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {notifSending ? "⏳ Sending..." : "📤 Send Notification"}
            </button>
          </form>
        </GlassCard>

        {/* Sent History */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="text-sm font-bold text-white">
            📬 Recently Sent ({sentNotifications.length})
          </h4>
          {!sentNotifications.length ? (
            <GlassCard className="text-center p-10">
              <span className="text-3xl block mb-2">📭</span>
              <p className="text-gray-500 text-xs">
                No notifications sent in this session yet.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {sentNotifications.map((n, i) => (
                <GlassCard
                  key={i}
                  className="p-4 hover:border-white/20 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            n.type === "test_reminder"
                              ? "bg-amber-500/20 text-amber-300"
                              : n.type === "achievement"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : n.type === "plan_update"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {n.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          → {n.userName}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-gray-200">
                        {n.title}
                      </h5>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-500 shrink-0">
                      {new Date(n.sentAt).toLocaleTimeString()}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Tab 6: Bulk Import ─────────────────────────────────────────────────────
  const renderBulkImport = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">
          📦 Bulk Question Import
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Upload Excel, CSV, or PDF files to auto-parse questions
        </p>
      </div>

      {/* Upload Section */}
      <GlassCard className="p-6 space-y-5">
        <h4 className="text-sm font-bold text-white">Upload File</h4>

        {/* Target Exam Selector */}
        <div>
          <label className={labelClass}>Target Exam</label>
          <select
            value={importExamId}
            onChange={(e) => setImportExamId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select exam to import into...</option>
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.title} ({ex.questions?.length || 0} questions)
              </option>
            ))}
          </select>
        </div>

        {/* File Input */}
        <div>
          <label className={labelClass}>Choose File (.xlsx, .csv, .pdf)</label>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,.pdf"
              onChange={(e) => {
                setImportFile(e.target.files[0] || null);
                setParsedQuestions([]);
              }}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 file:cursor-pointer file:transition"
            />
          </div>
          {importFile && (
            <p className="mt-2 text-xs text-indigo-300 flex items-center gap-2">
              📎 {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Upload Progress */}
        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Uploading & parsing...</span>
              <span>{importProgress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleFileUpload}
          disabled={!importFile || importing}
          className={`w-full py-3 ${primaryBtn} ${!importFile || importing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {importing ? "⏳ Processing..." : "📤 Upload & Parse"}
        </button>
      </GlassCard>

      {/* Parsed Questions Preview */}
      {parsedQuestions.length > 0 && (
        <GlassCard className="p-6 space-y-5">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white">
              📋 Parsed Questions Preview ({parsedQuestions.length})
            </h4>
            <button
              onClick={handleImportToExam}
              disabled={!importExamId}
              className={`${primaryBtn} ${!importExamId ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              ✅ Import All to Exam
            </button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {parsedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2"
              >
                <p className="text-sm font-bold text-gray-200">
                  {idx + 1}. {q.text || q.question || "No text"}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(
                    q.options || [q.optionA, q.optionB, q.optionC, q.optionD]
                  ).map((opt, oIdx) => (
                    <span
                      key={oIdx}
                      className={`p-2 rounded-lg border ${oIdx === (q.correctOptionIndex ?? q.answer ?? 0) ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10 font-bold" : "border-white/5 text-gray-400"}`}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "exams":
        return renderExams();
      case "question-bank":
        return renderQuestionBank();
      case "users":
        return renderUsers();
      case "ai-config":
        return renderAiConfig();
      case "notifications":
        return renderNotifications();
      case "bulk-import":
        return renderBulkImport();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-gray-100 font-sans">
      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Confirm Dialog ── */}
      {confirmDelete && (
        <ConfirmDialog
          title={`Delete ${confirmDelete.type === "bank-question" ? "Bank Question" : confirmDelete.type}?`}
          message={`Are you sure you want to permanently delete "${confirmDelete.name}"? This action cannot be undone.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === "exam")
              handleDeleteExam(confirmDelete.id);
            else if (confirmDelete.type === "question")
              handleDeleteQuestion(confirmDelete.id);
            else if (confirmDelete.type === "bank-question")
              handleDeleteBankQuestion(confirmDelete.id);
            else if (confirmDelete.type === "user")
              handleDeleteUser(confirmDelete.id);
          }}
        />
      )}

      {/* ── Top Navbar ── */}
      <nav className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">⚡</span>
          <span className="text-sm sm:text-xl font-extrabold bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
            SmartPrep<span className="hidden xs:inline">AI</span> <span className="hidden sm:inline">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button
            onClick={() => navigate("/admin/bulk-upload")}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition whitespace-nowrap"
          >
            Bulk <span className="hidden md:inline">MCQ </span>Upload
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition whitespace-nowrap"
          >
            <span className="hidden sm:inline">← Exit to </span><span className="sm:hidden">← </span>Dashboard
          </button>
        </div>
      </nav>

      {/* ── Tab Navigation ── */}
      <div className="sticky top-[73px] z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "exams") setExamView("list");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-6 px-6 text-center">
        <p className="text-xs text-gray-600">
          SmartPrepAI Admin Suite — Built with ⚡ by the platform team
        </p>
      </footer>
    </div>
  );
}
