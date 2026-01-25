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

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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

  /* ================= STEP 2: VERIFY OTP + SIGNUP ================= */
  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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

      // OTP verified → NOW create account
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur border rounded-3xl shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {step === "form" ? "Create Your Account" : "Verify OTP"}
          </h1>
          <p className="mt-2 text-gray-600">
            {step === "form"
              ? "Join HackathonHub and start building 🚀"
              : `OTP sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
            {error}
          </div>
        )}

        {/* ================= FORM STEP ================= */}
        {step === "form" && (
          <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border"
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white bg-linear-to-r from-blue-600 to-purple-600"
            >
              {loading ? "Sending OTP..." : "Create Account"}
            </button>
          </form>
        )}

       
        {step === "otp" && (
          <form onSubmit={handleVerifyOtpAndSignup} className="mt-8 space-y-5">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border text-center tracking-widest"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white bg-green-600"
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}



