"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;

    if (saved) {
      setMode(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      // keep your current dark theme as default
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
    document.documentElement.setAttribute("data-theme", newMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-3 sm:px-4 py-2 rounded-full
      border border-white/20
      backdrop-blur-xl
      transition-all duration-300
      text-xs sm:text-sm font-medium
      hover:scale-105 whitespace-nowrap"
      style={{
        background: "var(--nav-bg)",
        color: "var(--text-primary)",
        borderColor: "var(--nav-border)",
      }}
    >
      {mode === "dark" ? "☀️ Simple" : "🌙 Dark"}
    </button>
  );
}

