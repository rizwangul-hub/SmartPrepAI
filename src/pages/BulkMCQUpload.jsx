import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { parseMcqJsonInput } from "../utils/parseMcqJson.js";
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  Save,
  Loader2,
  FileCheck,
  Cpu
} from "lucide-react";

const EXAM_OPTIONS = [
  "ASF",
  "FIA",
  "ANF",
  "Police",
  "PMA",
  "Army",
  "Navy",
  "Air Force",
  "MDCAT",
  "ECAT",
  "LDC",
  "UDC",
  "General"
];

const SUBJECT_OPTIONS = [
  "English",
  "Urdu",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer",
  "General Knowledge",
  "Islamic Studies",
  "Pakistan Studies",
  "Current Affairs",
  "Intelligence",
  "Verbal Intelligence",
  "Non Verbal Intelligence"
];

const SAMPLE_JSON = `[
  {
    "text": "Choose the correct synonym of 'Brave'.",
    "options": ["Coward", "Bold", "Weak", "Timid"],
    "correctOptionIndex": 1,
    "subject": "English",
    "difficulty": "Easy",
    "type": "single"
  },
  {
    "text": "What is the capital of Pakistan?",
    "options": ["Lahore", "Karachi", "Islamabad", "Peshawar"],
    "correctOptionIndex": 2,
    "subject": "General Knowledge",
    "difficulty": "Easy",
    "type": "single"
  }
]`;

const Toast = ({ message, type = "info", onClose }) => {
  React.useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-emerald-600/90"
      : type === "error"
        ? "bg-red-600/90"
        : "bg-indigo-600/90";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-white shadow-2xl backdrop-blur ${bg} flex items-center gap-2`}
    >
      {type === "success" && <CheckCircle size={16} />}
      {type === "error" && <AlertTriangle size={16} />}
      <span>{message}</span>
    </motion.div>
  );
};

export default function BulkMCQUpload() {
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState("json"); // "json" | "ai"

  // Common UI State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => setToast({ message, type });

  // ── JSON Upload Mode States ──
  const [exam, setExam] = useState(EXAM_OPTIONS[0]);
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ── AI Upload Mode States ──
  const [aiFile, setAiFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [aiUploadStep, setAiUploadStep] = useState(""); // text step description
  const [aiStats, setAiStats] = useState(null);
  const fileInputRef = useRef(null);

  // JSON parsing and validation
  const parseQuestions = useCallback(() => {
    try {
      return parseMcqJsonInput(jsonText);
    } catch (err) {
      showToast(err.message || "Invalid JSON format", "error");
      return null;
    }
  }, [jsonText]);

  const validateExtractedQuestion = (q) => {
    const text = (q.text || "").toString().trim();
    const options = Array.isArray(q.options) ? q.options : [];
    const correctOptionIndex = Number(q.correctOptionIndex);
    const subject = (q.subject || "").toString().trim();
    const errors = {};

    if (!text) {
      errors.text = "Question text is required.";
    } else if (text.length < 15) {
      errors.text = "Question text is too short.";
    }

    if (!Array.isArray(options) || options.length !== 4) {
      errors.options = "Must contain exactly 4 options.";
    } else if (options.some(o => !o || !o.toString().trim())) {
      errors.options = "Options cannot be empty.";
    } else if (
      new Set(options.map((o) => o.toString().trim().toLowerCase())).size !== 4
    ) {
      errors.options = "All options must be unique.";
    }

    if (
      !Number.isInteger(correctOptionIndex) ||
      correctOptionIndex < 0 ||
      correctOptionIndex > 3
    ) {
      errors.correctOptionIndex = "Correct answer must be A, B, C, or D.";
    }

    if (!subject) {
      errors.subject = "Subject is required.";
    } else if (!SUBJECT_OPTIONS.includes(subject)) {
      errors.subject = "Invalid subject selected.";
    }

    return {
      validationErrors: errors,
      isValid: Object.keys(errors).length === 0,
    };
  };

  const clientValidate = (questions) => {
    const SUPPORTED_DIFFICULTIES = ["easy", "medium", "hard"];
    const errors = [];
    const subjectCount = {};
    const difficultyCount = {};
    const valid = [];

    questions.forEach((q, idx) => {
      const rowErrors = [];
      const text = (q.text || "").toString().trim();
      const options = Array.isArray(q.options) ? q.options : [];
      const correctOptionIndex = Number(q.correctOptionIndex);
      const subject = (q.subject || "").toString().trim();
      const difficulty = (q.difficulty || "medium").toString().trim().toLowerCase();
      const normalizedDifficulty = SUPPORTED_DIFFICULTIES.includes(difficulty) ? difficulty : "medium";

      if (!text) rowErrors.push("text is required");
      if (!Array.isArray(options) || options.length !== 4)
        rowErrors.push("options must be an array of exactly 4 strings");
      if (
        !(
          Number.isInteger(correctOptionIndex) &&
          correctOptionIndex >= 0 &&
          correctOptionIndex <= 3
        )
      )
        rowErrors.push("correctOptionIndex must be between 0 and 3");
      if (!subject) rowErrors.push("subject is required");

      if (rowErrors.length) {
        errors.push({ index: idx, errors: rowErrors, row: q });
      } else {
        const validQ = { ...q, difficulty: normalizedDifficulty };
        valid.push(validQ);
        subjectCount[subject] = (subjectCount[subject] || 0) + 1;
        difficultyCount[normalizedDifficulty] = (difficultyCount[normalizedDifficulty] || 0) + 1;
      }
    });

    return {
      totalQuestions: questions.length,
      validQuestions: valid.length,
      subjectCount,
      difficultyCount,
      errors,
      valid,
    };
  };

  const handlePreview = async () => {
    const parsed = parseQuestions();
    if (!parsed) return;

    const { questions, examFromJson } = parsed;
    const targetExam = examFromJson || exam;

    const clientResult = clientValidate(questions);
    setPreview(clientResult);

    if (clientResult.validQuestions > 0) {
      setLoading(true);
      try {
        const { data } = await axios.post("/api/questions/bulk-preview", {
          exam: targetExam,
          questions: clientResult.valid,
        });
        setPreview((prev) => ({ ...prev, ...data }));
        showToast("Preview generated successfully", "success");
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Preview failed";
        showToast(errorMsg, "error");
      } finally {
        setLoading(false);
      }
    } else {
      showToast("No valid questions to preview; fix validation errors first", "error");
    }
  };

  const handleUpload = async () => {
    const parsed = parseQuestions();
    if (!parsed) return;

    const { questions, examFromJson } = parsed;
    const targetExam = examFromJson || exam;
    const clientResult = clientValidate(questions);
    if (clientResult.validQuestions === 0) {
      setPreview(clientResult);
      showToast("No valid questions to upload; fix validation errors first", "error");
      return;
    }

    setUploading(true);
    try {
      const { data } = await axios.post("/api/questions/bulk-upload", {
        exam: targetExam,
        questions: clientResult.valid,
      });
      const skippedInvalid = clientResult.totalQuestions - clientResult.validQuestions;
      showToast(
        `Uploaded ${data.totalUploaded} questions${data.skippedDuplicates ? ` (${data.skippedDuplicates} duplicates skipped)` : ""}${skippedInvalid ? ` — ${skippedInvalid} invalid skipped` : ""}`,
        "success"
      );
      setPreview(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Upload failed";
      showToast(errorMsg, "error");
    } finally {
      setUploading(false);
    }
  };

  // ── AI File Upload Handlers ──
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragOver(true);
    } else if (e.type === "dragleave") {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAiFile(e.dataTransfer.files[0]);
      setExtractedQuestions([]);
      setAiStats(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAiFile(e.target.files[0]);
      setExtractedQuestions([]);
      setAiStats(null);
    }
  };

  const handleAIExtract = async () => {
    if (!aiFile) {
      return showToast("Please upload a file first", "error");
    }

    setAiExtracting(true);
    setAiProgress(5);
    setAiUploadStep("Uploading file...");

    const formData = new FormData();
    formData.append("file", aiFile);

    try {
      const { data } = await axios.post("/api/admin/mcq-import/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setAiProgress(Math.min(percent, 90)); // cap upload progress at 90% until processing completes
          if (percent === 100) {
            setAiUploadStep("Processing text and running AI extraction (this may take a moment)...");
          }
        },
      });

      const incomingQuestions = Array.isArray(data.questions) ? data.questions : [];
      const validatedQuestions = incomingQuestions.map((q) => {
        const normalized = {
          ...q,
          subject: q.subject || "",
          options: Array.isArray(q.options) ? q.options : [],
          correctOptionIndex:
            q.correctOptionIndex === undefined || q.correctOptionIndex === null
              ? -1
              : Number(q.correctOptionIndex),
        };
        const validation = validateExtractedQuestion(normalized);
        return {
          ...normalized,
          ...validation,
        };
      });

      setAiProgress(100);
      setExtractedQuestions(validatedQuestions);
      setAiStats(data.stats || null);
      showToast(`Extracted ${validatedQuestions.length} questions successfully!`, "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Extraction failed";
      showToast(errorMsg, "error");
    } finally {
      setAiExtracting(false);
      setAiUploadStep("");
    }
  };

  // Update inline edited field
  const handleEditQuestion = (index, field, value) => {
    setExtractedQuestions((prev) => {
      const updated = [...prev];
      const nextQuestion = { ...updated[index], [field]: value };
      const validation = validateExtractedQuestion(nextQuestion);
      updated[index] = {
        ...nextQuestion,
        ...validation,
      };
      return updated;
    });
  };

  // Update inline edited option
  const handleEditOption = (qIndex, optIndex, value) => {
    setExtractedQuestions((prev) => {
      const updated = [...prev];
      const nextQuestion = {
        ...updated[qIndex],
        options: [...(updated[qIndex].options || [])],
      };
      nextQuestion.options[optIndex] = value;
      const validation = validateExtractedQuestion(nextQuestion);
      updated[qIndex] = {
        ...nextQuestion,
        ...validation,
      };
      return updated;
    });
  };

  // Remove question from list
  const handleDeleteExtractedQuestion = (index) => {
    setExtractedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Save finalized questions from AI
  const handleSaveAIQuestions = async () => {
    // Filter questions based on settings
    let questionsToSave = [...extractedQuestions];

    if (skipDuplicates) {
      questionsToSave = questionsToSave.filter((q) => !q.isDuplicate);
    }

    // Ensure they are valid questions
    questionsToSave = questionsToSave.filter((q) => q.isValid);

    if (questionsToSave.length === 0) {
      return showToast("No valid questions to save (check if duplicate filters/errors are resolved)", "error");
    }

    setAiSaving(true);
    try {
      const { data } = await axios.post("/api/admin/mcq-import/save", {
        questions: questionsToSave,
      });

      showToast(`Imported ${data.totalSaved} MCQs into database!`, "success");
      setExtractedQuestions([]);
      setAiFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to save questions";
      showToast(errorMsg, "error");
    } finally {
      setAiSaving(false);
    }
  };

  const activeTabClass = "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20";
  const inactiveTabClass = "text-gray-400 hover:text-gray-200 hover:bg-white/5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-gray-100 pb-12">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
              Admin Panel
            </p>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent flex items-center gap-2">
              Question Manager & Bulk Importer
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2 text-sm border border-white/10 rounded-xl hover:bg-white/5 transition flex items-center gap-2"
            >
              ← Back to Admin
            </button>
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Tab Selectors */}
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
          <button
            onClick={() => {
              setActiveTab("json");
              setPreview(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "json" ? activeTabClass : inactiveTabClass}`}
          >
            <FileText size={16} />
            Paste JSON Array
          </button>
          <button
            onClick={() => {
              setActiveTab("ai");
              setPreview(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "ai" ? activeTabClass : inactiveTabClass}`}
          >
            <UploadCloud size={16} />
            AI File Extractor
          </button>
        </div>

        {/* TAB 1: PASTE JSON */}
        {activeTab === "json" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="p-5 bg-white/5 backdrop-blur border border-white/10 rounded-2xl">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Exam Category Fallback
                </label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {EXAM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-5 bg-white/5 backdrop-blur border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-300">
                    Paste MCQ JSON Array
                  </label>
                  <button
                    type="button"
                    onClick={() => setJsonText(SAMPLE_JSON)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Load Sample
                  </button>
                </div>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={18}
                  className="w-full p-4 font-mono text-sm rounded-xl bg-slate-950/80 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                  placeholder="Paste your MCQ array here..."
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handlePreview}
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-semibold text-sm transition"
                  >
                    {loading ? "Analyzing..." : "Preview"}
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl font-semibold text-sm transition"
                  >
                    {uploading ? "Uploading..." : "Upload All MCQs"}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {preview ? (
                <div className="p-5 bg-white/5 backdrop-blur border border-white/10 rounded-2xl space-y-4">
                  <h3 className="font-bold text-lg">Preview Summary</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <p className="text-xs text-gray-400">Total Questions</p>
                      <p className="text-2xl font-bold">{preview.totalQuestions}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs text-gray-400">Valid Questions</p>
                      <p className="text-2xl font-bold">{preview.validQuestions}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                      Subject Count
                    </p>
                    <div className="space-y-1">
                      {Object.entries(preview.subjectCount || {}).map(([s, c]) => (
                        <div
                          key={s}
                          className="flex justify-between text-sm px-3 py-1.5 rounded-lg bg-white/5"
                        >
                          <span>{s}</span>
                          <span className="font-bold text-indigo-300">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {preview.duplicates?.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm font-semibold text-amber-300">
                        {preview.duplicates.length} Duplicate(s) Detected
                      </p>
                      <ul className="mt-2 text-xs text-gray-400 max-h-24 overflow-y-auto space-y-1">
                        {preview.duplicates.slice(0, 5).map((d, i) => (
                          <li key={i}>
                            #{d.index + 1}: {d.text?.substring(0, 60)}...
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {preview.errors?.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-sm font-semibold text-red-300">
                        {preview.errors.length} Validation Error(s)
                      </p>
                      <ul className="mt-2 text-xs text-gray-400 max-h-32 overflow-y-auto space-y-1">
                        {preview.errors.map((e, i) => (
                          <li key={i}>
                            Row {e.index + 1}: {e.errors.join(", ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-white/5 backdrop-blur border border-white/10 rounded-2xl">
                  <h3 className="font-bold mb-3">How it works</h3>
                  <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                    <li>Select target exam from dropdown</li>
                    <li>Paste a JSON array matching the schema</li>
                    <li>Click Preview to validate & check duplicates</li>
                    <li>Click Upload to save all valid MCQs at once</li>
                  </ol>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* TAB 2: AI FILE EXTRACTOR */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            {/* File Dropzone */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-10 border-2 border-dashed rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer ${
                dragOver
                  ? "border-indigo-500 bg-indigo-500/10 shadow-2xl scale-[1.01]"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud size={48} className="text-indigo-400 animate-pulse" />
              <div className="text-center">
                <p className="font-bold text-lg text-gray-200">
                  Drag and drop your syllabus file here
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports PDF books, Word DOCX files, TXT files, and Scanned Images (OCR)
                </p>
              </div>
              {aiFile && (
                <div className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-2">
                  <FileText size={14} />
                  {aiFile.name} ({(aiFile.size / 1024).toFixed(1)} KB)
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAiFile(null);
                      setExtractedQuestions([]);
                    }}
                    className="hover:text-red-400 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </motion.div>

            {/* AI Progress */}
            {aiExtracting && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex justify-between text-xs font-semibold text-gray-300">
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-indigo-400" />
                    {aiUploadStep}
                  </span>
                  <span>{aiProgress}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Run Button */}
            {aiFile && !aiExtracting && extractedQuestions.length === 0 && (
              <button
                onClick={handleAIExtract}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-bold text-md shadow-xl transition active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Cpu size={18} />
                Extract MCQs using AI Processing Layer
              </button>
            )}

            {/* Preview extracted MCQs */}
            {extractedQuestions.length > 0 && (
              <div className="space-y-6">
                {/* Control Panel */}
                <div className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <FileCheck className="text-emerald-400" />
                      Extracted MCQs Preview ({extractedQuestions.length})
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Review, edit, or delete the questions before committing them to the Question Bank.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skipDuplicates}
                        onChange={(e) => setSkipDuplicates(e.target.checked)}
                        className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-indigo-500"
                      />
                      Skip Duplicates
                    </label>

                    <button
                      onClick={handleSaveAIQuestions}
                      disabled={aiSaving}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
                    >
                      {aiSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save all Valid MCQs
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Statistics Dashboard */}
                {aiStats && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-7 gap-4"
                  >
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Found</p>
                      <p className="text-2xl font-extrabold text-white mt-1">{aiStats.totalFound}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur">
                      <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Valid MCQs</p>
                      <p className="text-2xl font-extrabold text-emerald-300 mt-1">{aiStats.valid}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur">
                      <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Duplicates</p>
                      <p className="text-2xl font-extrabold text-amber-300 mt-1">{aiStats.duplicates}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur">
                      <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Invalid</p>
                      <p className="text-2xl font-extrabold text-red-300 mt-1">{aiStats.invalid}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 backdrop-blur">
                      <p className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">With Answers</p>
                      <p className="text-2xl font-extrabold text-teal-300 mt-1">{aiStats.questionsWithAnswers || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur">
                      <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">Missing Answers</p>
                      <p className="text-2xl font-extrabold text-rose-300 mt-1">{aiStats.questionsMissingAnswers || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 backdrop-blur">
                      <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">AI Classified</p>
                      <p className="text-2xl font-extrabold text-purple-300 mt-1">{aiStats.aiClassified}</p>
                      <p className="text-[9px] text-gray-400 mt-1 font-medium">
                        Rule/Cache: {aiStats.ruleClassified + aiStats.cachedClassified}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Distributions */}
                {aiStats && (aiStats.subjectDistribution || aiStats.examDistribution) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Subject Distribution */}
                    {aiStats.subjectDistribution && Object.keys(aiStats.subjectDistribution).length > 0 && (
                      <div className="p-5 bg-white/5 backdrop-blur border border-white/10 rounded-2xl">
                        <h4 className="text-xs uppercase tracking-wider text-indigo-400 font-bold mb-3">
                          Subject Distribution
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {Object.entries(aiStats.subjectDistribution).map(([sub, count]) => (
                            <div key={sub} className="flex justify-between items-center text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                              <span className="font-semibold text-gray-300">{sub}</span>
                              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                                {count} {count === 1 ? "question" : "questions"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exam Distribution */}
                    {aiStats.examDistribution && Object.keys(aiStats.examDistribution).length > 0 && (
                      <div className="p-5 bg-white/5 backdrop-blur border border-white/10 rounded-2xl">
                        <h4 className="text-xs uppercase tracking-wider text-pink-400 font-bold mb-3">
                          Suggested Exams
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {Object.entries(aiStats.examDistribution).map(([ex, count]) => (
                            <div key={ex} className="flex justify-between items-center text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                              <span className="font-semibold text-gray-300">{ex}</span>
                              <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">
                                {count} {count === 1 ? "question" : "questions"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Questions list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extractedQuestions.map((q, idx) => (
                    <motion.div
                      key={q.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border backdrop-blur-xl flex flex-col justify-between gap-4 transition ${
                        q.isDuplicate && skipDuplicates
                          ? "border-amber-500/20 bg-amber-500/5 opacity-60"
                          : q.isValid
                            ? "border-white/10 bg-white/5"
                            : "border-red-500/30 bg-red-500/5"
                      }`}
                    >
                      {/* Top Bar inside Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                            Question #{idx + 1}
                          </span>
                          
                          {/* Subject Dropdown */}
                          <select
                            value={q.subject}
                            onChange={(e) => handleEditQuestion(idx, "subject", e.target.value)}
                            className="bg-slate-900/80 border border-white/10 rounded px-2 py-0.5 text-[10px] font-bold text-indigo-300 outline-none"
                          >
                            {SUBJECT_OPTIONS.map((sub) => (
                              <option key={sub} value={sub}>
                                {sub}
                              </option>
                            ))}
                          </select>

                          {/* Exam Dropdown */}
                          <select
                            value={q.exam}
                            onChange={(e) => handleEditQuestion(idx, "exam", e.target.value)}
                            className="bg-slate-900/80 border border-white/10 rounded px-2 py-0.5 text-[10px] font-bold text-pink-300 outline-none"
                          >
                            {EXAM_OPTIONS.map((ex) => (
                              <option key={ex} value={ex}>
                                {ex}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => handleDeleteExtractedQuestion(idx)}
                          className="text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Warnings */}
                      <div className="space-y-1">
                        {q.isDuplicate && (
                          <div className="px-3 py-1 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center gap-1.5">
                            <AlertTriangle size={10} />
                            Duplicate detected in Question Bank! {skipDuplicates && "(Will be skipped)"}
                          </div>
                        )}
                        {!q.isValid && (
                          <div className="px-3 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-semibold flex flex-col gap-0.5">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle size={10} />
                              Validation Warning:
                            </span>
                            <ul className="list-disc list-inside pl-2 font-normal">
                              {Object.entries(q.validationErrors || {}).map(
                                ([key, err]) => err && <li key={key}>{err}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Editable Fields */}
                      <div className="space-y-3">
                        {/* Question Text */}
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Question Text
                          </label>
                          <textarea
                            value={q.text}
                            onChange={(e) => handleEditQuestion(idx, "text", e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                          />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-2">
                          {q.options?.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-gray-500 w-4">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleEditOption(idx, optIdx, e.target.value)}
                                className={`flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-900 border outline-none ${
                                  optIdx === q.correctOptionIndex
                                    ? "border-emerald-500/30 text-emerald-300"
                                    : "border-white/10"
                                }`}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Correct Option index */}
                        <div className="flex justify-between items-center gap-4">
                          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Correct Answer
                          </label>
                          <select
                            value={q.correctOptionIndex}
                            onChange={(e) => handleEditQuestion(idx, "correctOptionIndex", Number(e.target.value))}
                            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none"
                          >
                            <option value={0}>Option A</option>
                            <option value={1}>Option B</option>
                            <option value={2}>Option C</option>
                            <option value={3}>Option D</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
