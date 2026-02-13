
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


  if (alreadyLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 px-4">
        <div className="bg-white/80 backdrop-blur border rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900">
            Already Logged In
          </h1>
          <p className="mt-3 text-gray-600">
            Please logout first to continue with another account.
          </p>
          <p className="mt-6 text-sm text-gray-500 animate-pulse">
            Redirecting to home...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur border rounded-3xl shadow-xl p-8">
        
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600">
            Login to manage events & certificates
          </p>
        </div>

        
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
            {error}
          </div>
        )}

        
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:opacity-90 transition disabled:opacity-60 shadow-md"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        
        <p className="mt-6 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

