/**
 * Parse MCQ JSON from the bulk upload textarea.
 * Accepts arrays, { questions: [...] }, or a single MCQ object.
 */
export function parseMcqJsonInput(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText.trim());
  } catch {
    throw new Error("Invalid JSON format. Check commas, quotes, and brackets.");
  }

  let questions = null;
  let examFromJson;

  if (Array.isArray(parsed)) {
    questions = parsed;
  } else if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.questions)) {
      questions = parsed.questions;
      examFromJson = parsed.exam || parsed.examName;
    } else if (parsed.text || parsed.options) {
      questions = [parsed];
      examFromJson = parsed.exam || parsed.examName;
    }
  }

  if (!questions) {
    throw new Error(
      'Paste a JSON array like [{ "text": "..." }], a single MCQ object, or { "questions": [...] }.',
    );
  }

  if (!questions.length) {
    throw new Error("At least one MCQ is required.");
  }

  // Normalize and sanitize questions to reduce server-side validation failures
  const normalized = questions.map((q) => {
    const row = Object.assign({}, q);

    // Normalize subject: treat any 'world' mention as 'General Knowledge'
    if (row.subject && typeof row.subject === "string") {
      const s = row.subject.trim();
      const lower = s.toLowerCase();
      if (lower.includes("world")) {
        row.subject = "General Knowledge";
      } else if (lower.includes("islam")) {
        row.subject = "Islamic Studies";
      } else if (lower.includes("pakistan")) {
        row.subject = "Pakistan Studies";
      } else if (lower.includes("science")) {
        row.subject = "General Knowledge";
      } else if (lower.includes("gk") && !lower.includes("pakistan")) {
        // map generic 'GK' to General Knowledge unless it's Pakistan-specific
        row.subject = "General Knowledge";
      } else if (lower.includes("non") && lower.includes("verbal")) {
        row.subject = "Non Verbal Intelligence";
      } else if (lower.includes("verbal")) {
        row.subject = "Verbal Intelligence";
      } else {
        row.subject = s;
      }
    }

    // Normalize difficulty to lowercase expected values
    if (row.difficulty !== undefined && row.difficulty !== null) {
      row.difficulty = row.difficulty.toString().trim().toLowerCase();
    }

    // Ensure options are strings
    if (Array.isArray(row.options)) {
      row.options = row.options.map((o) =>
        o === null || o === undefined ? "" : String(o),
      );
    }

    // Ensure correctOptionIndex is numeric when present
    if (
      row.correctOptionIndex !== undefined &&
      row.correctOptionIndex !== null
    ) {
      const n = Number(row.correctOptionIndex);
      row.correctOptionIndex = Number.isNaN(n) ? row.correctOptionIndex : n;
    }

    return row;
  });

  return { questions: normalized, examFromJson };
}
