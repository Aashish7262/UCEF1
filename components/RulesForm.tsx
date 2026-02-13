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
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Rules & Regulations
      </h3>

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div
            key={index}
            className="flex gap-3 items-start bg-gray-50 border rounded-xl p-4"
          >
            <span className="mt-1 text-sm font-bold text-blue-600">
              {index + 1}.
            </span>

            <input
              value={rule}
              onChange={(e) =>
                updateRule(index, e.target.value)
              }
              placeholder="E.g. Teams must have 2–4 members"
              className="flex-1 bg-transparent outline-none text-gray-800"
            />

            {rules.length > 1 && (
              <button
                onClick={() => removeRule(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={addRule}
          className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-100"
        >
          + Add Rule
        </button>

        <button
          onClick={submitRules}
          disabled={loading}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Rules"}
        </button>
      </div>
    </div>
  );
}

