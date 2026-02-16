"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<"form" | "otp">("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  // 🔥 NEW FIELDS (Required for new architecture)
  const [department, setDepartment] = useState("");
  const [branch, setBranch] = useState("");

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation for new fields
    if (!department || !branch) {
      setError("Department and Branch are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setStep("otp");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Verify OTP
      const verifyRes = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData.message || "Invalid OTP");
        return;
      }

      // Step 2: Signup with NEW architecture fields
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          department, // 🔥 NEW
          branch,     // 🔥 NEW
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setError(signupData.message || "Signup failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 overflow-hidden">
      {/* background aura */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/3 w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] bg-purple-600/20 blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-blue-600/20 blur-[200px]" />
      </div>

      <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl p-[2px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {step === "form" ? "Create Your Account" : "Verify OTP"}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-400 break-words">
              {step === "form"
                ? "Join HackathonHub and start building 🚀"
                : `OTP sent to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mt-5 sm:mt-6 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          {/* ================= FORM STEP ================= */}
          {step === "form" && (
            <form
              onSubmit={handleSendOtp}
              className="mt-6 sm:mt-8 space-y-4 sm:space-y-5"
            >
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white text-sm sm:text-base focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white text-sm sm:text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white text-sm sm:text-base focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition"
              />

              {/* 🔥 NEW: Department */}
              <input
                type="text"
                placeholder="Department (e.g. Computer Science)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white text-sm sm:text-base focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/30 transition"
              />

              {/* 🔥 NEW: Branch */}
              <input
                type="text"
                placeholder="Branch (e.g. AI, IT, CSE)"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white text-sm sm:text-base focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition"
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white text-sm sm:text-base focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm sm:text-base bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-black hover:brightness-110 transition-all duration-300 disabled:opacity-60 shadow-lg"
              >
                {loading ? "Sending OTP..." : "Create Account"}
              </button>
            </form>
          )}

          {/* ================= OTP STEP ================= */}
          {step === "otp" && (
            <form
              onSubmit={handleVerifyOtpAndSignup}
              className="mt-6 sm:mt-8 space-y-4 sm:space-y-5"
            >
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-center tracking-widest bg-black/60 border border-white/20 text-white text-sm sm:text-base focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm sm:text-base bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:brightness-110 transition-all duration-300 disabled:opacity-60 shadow-lg"
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
            </form>
          )}

          <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-center text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-400 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

