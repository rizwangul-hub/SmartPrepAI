/**
 * ESM launcher — delegates to backend/scripts/reclassifySubjects.js (CommonJS).
 * Run from project root: node scripts/reclassifySubjects.js --preview
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.resolve(__dirname, "../backend/scripts/reclassifySubjects.js");

const result = spawnSync(process.execPath, [script, ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: path.resolve(__dirname, "../backend"),
});

process.exit(result.status ?? 1);
