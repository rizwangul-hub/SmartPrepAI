const connectDB = require("../backend/src/config/db");
const questionController = require("../backend/src/controllers/questionController");

(async function run() {
  await connectDB();

  const sample = [
    {
      text: "Capital of Pakistan?",
      options: ["Lahore", "Karachi", "Islamabad", "Peshawar"],
      correctOptionIndex: 2,
      subject: "GK",
      difficulty: "easy",
      type: "single",
    },
    {
      text: "What comes next in the series: 3,6,12,24,?",
      options: ["36", "48", "30", "40"],
      correctOptionIndex: 1,
      subject: "Intelligence",
      difficulty: "easy",
      type: "single",
    },
  ];

  const req = {
    user: { role: "admin" },
    body: { examId: "", questions: sample },
  };

  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(obj) {
      console.log("RESPONSE", this.code || 200, JSON.stringify(obj, null, 2));
      process.exit(0);
    },
  };

  try {
    await questionController.bulkUpload(req, res);
  } catch (err) {
    console.error("ERROR", err);
    process.exit(1);
  }
})();
