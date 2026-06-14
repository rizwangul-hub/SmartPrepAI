// src/components/ThemeToggle.jsx
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
      aria-label="Toggle light/dark theme"
    >
      {theme === "dark" ? (
        <span className="text-xl" role="img" aria-label="sun">☀️</span>
      ) : (
        <span className="text-xl" role="img" aria-label="moon">🌙</span>
      )}
    </button>
  );
}
