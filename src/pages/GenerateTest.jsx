import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [form, setForm] = useState({
    exam: "PMA",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/tests/generate", form);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
          Generate Mock Test
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Launch a syllabus-based mock test from the question bank. The system automatically configures the questions distribution, count, and duration.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="p-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl space-y-5"
        >
          <label className="block">
            <span className="text-sm text-gray-300">Exam Type</span>
            <select
              name="exam"
              value={form.exam}
              onChange={handleChange}
              className="mt-1 block w-full p-3 rounded-xl bg-white/5 border border-white/10"
            >
              {EXAMS.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
            {EXAM_INFO[form.exam] && (
              <p className="text-xs text-indigo-300 mt-3 p-3 bg-white/5 rounded-xl border border-white/5 leading-relaxed">
                {EXAM_INFO[form.exam]}
              </p>
            )}
          </label>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-750 rounded-xl font-bold disabled:opacity-50 transition active:scale-[0.98] cursor-pointer"
          >
            {mutation.isPending ? "Generating..." : "Generate & Start Test"}
          </button>
        </form>

        {mutation.isError && (
          <p className="mt-4 text-red-400 text-sm text-center">
            {mutation.error?.response?.data?.message ||
              mutation.error?.message ||
              "Generation failed"}
          </p>
        )}
      </motion.div>
    </div>
  );
}
