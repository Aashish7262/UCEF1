"use client";

import { useState } from "react";

export default function RulesForm({ eventId }: { eventId: string }) {
  const [rules, setRules] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  const addRule = () => setRules([...rules, ""]);

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, value: string) => {
    const copy = [...rules];
    copy[index] = value;
    setRules(copy);
  };

  const submitRules = async () => {
    const cleaned = rules.filter((r) => r.trim());
    if (cleaned.length === 0) {
      alert("Add at least one rule");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/events/${eventId}/rules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-role": localStorage.getItem("role") || "",
      },
      body: JSON.stringify({
        rules: cleaned.map((text) => ({ text })),
      }),
    });

    setLoading(false);

    if (res.ok) {
      alert("✅ Rules saved successfully");
    } else {
      alert("❌ Failed to save rules");
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto rounded-3xl p-[2px]
                    bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">

      <div className="relative rounded-3xl bg-black/70 backdrop-blur-xl p-8">

        {/* glow */}
        <div className="pointer-events-none absolute inset-0
                        bg-gradient-to-br from-purple-500/10 to-blue-500/10
                        blur-2xl" />

        <h3 className="relative z-10 text-xl font-semibold text-white mb-6">
          Rules & Regulations
        </h3>

        <div className="relative z-10 space-y-4">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="group flex gap-3 items-start
                         rounded-xl p-4
                         bg-white/5 border border-white/10
                         hover:border-purple-400/40
                         transition"
            >
              <span className="mt-1 text-sm font-bold text-purple-400">
                {index + 1}.
              </span>

              <input
                value={rule}
                onChange={(e) =>
                  updateRule(index, e.target.value)
                }
                placeholder="E.g. Teams must have 2–4 members"
                className="flex-1 bg-transparent outline-none
                           text-white placeholder:text-gray-500"
              />

              {rules.length > 1 && (
                <button
                  onClick={() => removeRule(index)}
                  className="text-red-400 hover:text-red-500 text-sm
                             opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="relative z-10 flex justify-between items-center mt-8">
          <button
            onClick={addRule}
            className="px-4 py-2 rounded-xl text-sm
                       border border-white/20
                       text-gray-300 hover:text-white
                       hover:bg-white/10 transition"
          >
            + Add Rule
          </button>

          <button
            onClick={submitRules}
            disabled={loading}
            className="px-6 py-2 rounded-xl font-semibold
                       bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                       text-black
                       hover:brightness-110
                       transition-all duration-300
                       disabled:opacity-60 shadow-lg"
          >
            {loading ? "Saving..." : "Save Rules"}
          </button>
        </div>
      </div>
    </div>
  );
}
