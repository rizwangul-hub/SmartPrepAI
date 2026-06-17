import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";

const EXAMS = [
  "PMA",
  "Army",
  "Navy",
  "Air Force (PAF)",
  "ASF",
  "FIA",
  "ANF",
  "Police",
  "UDC",
  "LDC",
  "MDCAT",
  "ECAT",
];

const EXAM_INFO = {
  PMA: "Step-based progression. Step 1: Verbal (50 Q), Step 2: Non-Verbal (50 Q), Step 3: Academic (100 Q — 20 English, 20 GK, 20 Pak Studies, 20 Islamiat, 20 Math).",
  Army: "100 Q — 20 English, 20 GK, 20 Pakistan Studies, 20 Islamic Studies, 20 Mathematics/Intelligence.",
  Navy: "Step-based progression. Step 1: Intelligence (50 Q), Step 2: Academic (100 Q — 20 English, 20 Math, 20 Physics, 20 GK, 20 Pak Studies).",
  "Air Force (PAF)": "Step-based progression. Step 1: Intelligence (50 Q), Step 2: English (50 Q), Step 3: Physics (50 Q), Step 4: Math (50 Q).",
  ASF: "100 Q — 20 English, 20 GK & Current Affairs, 20 Pak Studies, 20 Islamic Studies & Urdu, 20 Math/Intelligence.",
  FIA: "100 Q — 20 English, 20 GK, 20 Computer, 20 IQ/Intelligence, 10 Pak Studies, 10 Islamic Studies.",
  ANF: "100 Q — 20 English, 20 GK & Everyday Science, 20 Pak Studies, 20 Islamic Studies, 20 ANF Questions.",
  Police: "100 Q — Balanced across GK, Pak Studies, Current Affairs, English, Urdu, Mathematics, Intelligence, Computer, Law Basics.",
  UDC: "100 Q — 50 Computer Topics (MS Office, HW/SW, Internet, shortcuts), 10 English, 10 GK, 10 Pak Studies, 10 Islamiat, 10 IQ.",
  LDC: "100 Q — 50 Computer Topics (MS Office, HW/SW, Internet, shortcuts), 10 English, 10 GK, 10 Pak Studies, 10 Islamiat, 10 IQ.",
  MDCAT: "180 Q — 81 Biology, 45 Chemistry, 36 Physics, 9 English, 9 Logical Reasoning. Duration: 180 Minutes.",
  ECAT: "100 Q — 30 Mathematics, 30 Physics, 30 Chemistry/Computer, 10 English. Duration: 100 Minutes.",
};

export default function GenerateTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialExam = searchParams.get("exam") || "PMA";

  const matchedExam = EXAMS.find(ex => {
    const normParam = initialExam.toLowerCase();
    const normEx = ex.toLowerCase();
    return normEx === normParam || 
           (normParam === 'air force' && normEx.includes('air force')) ||
           (normParam === 'paf' && normEx.includes('air force'));
  });

  const [form, setForm] = useState({
    exam: matchedExam || "PMA",
    questionCount: "100",
    customCount: "",
  });

  useEffect(() => {
    if (form.exam === "MDCAT") {
      setForm(prev => ({ ...prev, questionCount: "180" }));
    } else if (form.exam === "PMA" || form.exam === "Navy" || form.exam === "Air Force (PAF)") {
      setForm(prev => ({ ...prev, questionCount: "50" }));
    } else {
      setForm(prev => ({ ...prev, questionCount: "100" }));
    }
  }, [form.exam]);

  const mutation = useMutation({
    mutationFn: async () => {
      const count = form.questionCount === "custom" ? Number(form.customCount) : Number(form.questionCount);
      const payload = {
        exam: form.exam,
        questionCount: count,
      };
      const { data } = await axios.post("/api/tests/generate", payload);
      return data;
    },
    onSuccess: (data) => {
      if (data.testId) {
        navigate(`/test/${data.testId}/start`);
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-gray-100 p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition cursor-pointer"
          >
            ← Dashboard
          </button>
        </div>

        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
          Generate Mock Test
        </h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Launch a syllabus-based mock test from the question bank. Select your desired exam and the number of questions. The system will automatically compute the correct subject percentages.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl space-y-6 shadow-2xl"
        >
          <label className="block">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">Exam Type</span>
            <select
              name="exam"
              value={form.exam}
              onChange={handleChange}
              className="mt-1 block w-full p-3.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {EXAMS.map((ex) => (
                <option key={ex} value={ex} className="bg-slate-900 text-white">
                  {ex}
                </option>
              ))}
            </select>
            {EXAM_INFO[form.exam] && (
              <p className="text-xs text-indigo-300 mt-3 p-3 bg-indigo-950/40 rounded-xl border border-indigo-900/30 leading-relaxed">
                ℹ️ {EXAM_INFO[form.exam]}
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">Question Count</span>
            <select
              name="questionCount"
              value={form.questionCount}
              onChange={handleChange}
              className="mt-1 block w-full p-3.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="10" className="bg-slate-900 text-white">10 MCQs</option>
              <option value="20" className="bg-slate-900 text-white">20 MCQs</option>
              <option value="30" className="bg-slate-900 text-white">30 MCQs</option>
              <option value="50" className="bg-slate-900 text-white">50 MCQs</option>
              <option value="75" className="bg-slate-900 text-white">75 MCQs</option>
              <option value="100" className="bg-slate-900 text-white">100 MCQs</option>
              <option value="150" className="bg-slate-900 text-white">150 MCQs</option>
              <option value="180" className="bg-slate-900 text-white">180 MCQs</option>
              <option value="custom" className="bg-slate-900 text-white">Custom Count</option>
            </select>
          </label>

          {form.questionCount === "custom" && (
            <label className="block animate-in fade-in slide-in-from-top-3 duration-200">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">Custom Count</span>
              <input
                type="number"
                name="customCount"
                value={form.customCount}
                onChange={handleChange}
                placeholder="Enter number of questions (e.g. 45)"
                min="1"
                max="300"
                className="mt-1 block w-full p-3.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                required
              />
            </label>
          )}

          <button
            type="submit"
            disabled={mutation.isPending || (form.questionCount === "custom" && !form.customCount)}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 rounded-xl font-bold disabled:opacity-50 transition active:scale-[0.98] cursor-pointer shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Test...
              </>
            ) : (
              "🚀 Generate & Start Test"
            )}
          </button>
        </form>

        {mutation.isError && (
          <p className="mt-4 text-red-400 text-sm text-center bg-red-950/20 border border-red-900/35 p-3 rounded-xl animate-bounce">
            ⚠️ {mutation.error?.response?.data?.message ||
              mutation.error?.message ||
              "Generation failed"}
          </p>
        )}
      </motion.div>
    </div>
  );
}
