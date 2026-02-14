"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateHackathonPage() {
  const router = useRouter();

  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("role")
      : null;

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<string[]>([""]);
  const [teamSizeMin, setTeamSizeMin] = useState(1);
  const [teamSizeMax, setTeamSizeMax] = useState(4);
  const [registrationStart, setRegistrationStart] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [hackathonStart, setHackathonStart] = useState("");
  const [hackathonEnd, setHackathonEnd] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 NEW: Payment States (ADDED ONLY)
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [entryFee, setEntryFee] = useState(0);

  const addRule = () => {
    setRules([...rules, ""]);
  };

  const updateRule = (index: number, value: string) => {
    const copy = [...rules];
    copy[index] = value;
    setRules(copy);
  };

  const removeRule = (index: number) => {
    const copy = rules.filter((_, i) => i !== index);
    setRules(copy);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || role !== "admin") {
      alert("Unauthorized");
      return;
    }

    setLoading(true);

    const cleanedRules = rules.filter((r) => r.trim());

    const res = await fetch("/api/hackathons/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        rules: cleanedRules,
        teamSizeMin,
        teamSizeMax,
        registrationStart,
        registrationDeadline,
        hackathonStart,
        hackathonEnd,
        submissionDeadline,
        paymentRequired, // ✅ ADDED (backend compatibility)
        entryFee: paymentRequired ? entryFee : 0, // ✅ SAFE LOGIC
        userId,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (res.ok) {
      alert("Hackathon created successfully!");
      router.push("/hackathons");
    } else {
      alert(data.message || "Failed to create hackathon");
    }
  };

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-red-400">
        Unauthorized
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white px-6 py-20">
      <div className="max-w-4xl mx-auto">

        {/* Heading */}
        <h1 className="text-4xl font-extrabold mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🚀 Create Hackathon
        </h1>

        <form
          onSubmit={handleCreate}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 space-y-8"
        >

          {/* Title */}
          <div>
            <label className="block text-white/70 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/70 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
            />
          </div>

          {/* 🔥 NEW: PAYMENT SECTION (ADDED ONLY) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-white/70 mb-4 text-lg">
              Payment Settings
            </label>

            <div className="flex items-center gap-6 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={paymentRequired}
                  onChange={(e) =>
                    setPaymentRequired(e.target.checked)
                  }
                />
                <span className="text-white/80">
                  Paid Hackathon
                </span>
              </label>
            </div>

            {paymentRequired && (
              <div>
                <label className="block text-white/70 mb-2">
                  Entry Fee (₹)
                </label>
                <input
                  type="number"
                  value={entryFee}
                  onChange={(e) =>
                    setEntryFee(Number(e.target.value))
                  }
                  min={0}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                />
              </div>
            )}
          </div>

          {/* Team Size */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-white/70 mb-2">
                Team Size Min
              </label>
              <input
                type="number"
                value={teamSizeMin}
                onChange={(e) =>
                  setTeamSizeMin(Number(e.target.value))
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-2">
                Team Size Max
              </label>
              <input
                type="number"
                value={teamSizeMax}
                onChange={(e) =>
                  setTeamSizeMax(Number(e.target.value))
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <DateField
              label="Registration Start"
              value={registrationStart}
              setValue={setRegistrationStart}
            />
            <DateField
              label="Registration Deadline"
              value={registrationDeadline}
              setValue={setRegistrationDeadline}
            />
            <DateField
              label="Hackathon Start"
              value={hackathonStart}
              setValue={setHackathonStart}
            />
            <DateField
              label="Hackathon End"
              value={hackathonEnd}
              setValue={setHackathonEnd}
            />
            <DateField
              label="Submission Deadline"
              value={submissionDeadline}
              setValue={setSubmissionDeadline}
            />
          </div>

          {/* Rules */}
          <div>
            <label className="block text-white/70 mb-4">
              Rules
            </label>

            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-center"
                >
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) =>
                      updateRule(index, e.target.value)
                    }
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                  />

                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="text-red-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRule}
              className="mt-4 text-sm text-purple-400 hover:text-purple-300"
            >
              + Add Rule
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-black font-semibold hover:scale-105 transition"
          >
            {loading ? "Creating..." : "Create Hackathon"}
          </button>
        </form>
      </div>
    </main>
  );
}

/* DATE FIELD COMPONENT */

function DateField({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-white/70 mb-2">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
      />
    </div>
  );
}

