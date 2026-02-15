"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setAlreadyLoggedIn(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("userId", data.userId);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      router.push("/");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ALREADY LOGGED IN ================= */

  if (alreadyLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 overflow-hidden">

        {/* background aura */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] sm:w-[700px] sm:h-[700px] bg-purple-600/20 blur-[120px] sm:blur-[200px]" />
          <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] sm:w-[600px] sm:h-[600px] bg-blue-600/20 blur-[120px] sm:blur-[200px]" />
        </div>

        <div className="relative w-full max-w-md rounded-3xl p-[2px]
                        bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">

          <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 sm:p-8 text-center">

            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Already Logged In
            </h1>

            <p className="mt-3 text-sm sm:text-base text-gray-400">
              Please logout first to continue with another account.
            </p>

            <p className="mt-6 text-xs sm:text-sm text-gray-500 animate-pulse">
              Redirecting to home...
            </p>

          </div>
        </div>
      </div>
    );
  }

  /* ================= LOGIN PAGE ================= */

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 overflow-hidden">

      {/* background aura */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] sm:w-[700px] sm:h-[700px] bg-purple-600/20 blur-[120px] sm:blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] sm:w-[600px] sm:h-[600px] bg-blue-600/20 blur-[120px] sm:blur-[200px]" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl p-[2px]
                      bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">

        <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 sm:p-8">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold
                           bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                           bg-clip-text text-transparent">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-400">
              Login to manage events & certificates
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl
                           bg-black/60 border border-white/20
                           text-white
                           text-sm sm:text-base
                           focus:outline-none focus:border-purple-400
                           focus:ring-2 focus:ring-purple-500/30
                           transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl
                           bg-black/60 border border-white/20
                           text-white
                           text-sm sm:text-base
                           focus:outline-none focus:border-blue-400
                           focus:ring-2 focus:ring-blue-500/30
                           transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold
                         text-sm sm:text-base
                         bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                         text-black hover:brightness-110
                         transition-all duration-300
                         disabled:opacity-60 shadow-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-xs sm:text-sm text-center text-gray-400">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="font-semibold text-blue-400 hover:underline"
            >
              Create one
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}

