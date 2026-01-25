"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");

    if (userId) {
      setIsLoggedIn(true);
      setRole(userRole);
    }
  }, []);

  return (
    <main className="w-full overflow-hidden">
      
      <section className="relative bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),transparent_60%)]"/>

        <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Run Hackathons.
            <span className="block text-yellow-300 mt-2">
              Manage Everything Seamlessly.
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            HackathonHub helps you create events, manage participation, track
            attendance, and generate certificates — all from one powerful
            platform.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-5">
            {!isLoggedIn && (
              <>
                <Link
                  href="/events"
                  className="px-8 py-4 rounded-2xl bg-white text-blue-700 font-semibold shadow-lg hover:scale-105 transition"
                >
                  Explore Events 🚀
                </Link>

                <Link
                  href="/login"
                  className="px-8 py-4 rounded-2xl border border-white/30 text-white font-semibold hover:bg-white/10 transition"
                >
                  Admin Login
                </Link>
              </>
            )}

            {isLoggedIn && (
              <>
                <Link
                  href="/events"
                  className="px-8 py-4 rounded-2xl bg-white text-blue-700 font-semibold shadow-lg hover:scale-105 transition"
                >
                  Go to Events
                </Link>

                {role === "admin" && (
                  <Link
                    href="/admin/create-event"
                    className="px-8 py-4 rounded-2xl border border-white/30 text-white font-semibold hover:bg-white/10 transition"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

     
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
          Everything You Need to Run Events
        </h2>

        <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
          Designed for admins and students — simple, fast, and powerful.
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <div className="group bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition">
              🛠️
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Event Creation
            </h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Create hackathons, set dates, go live instantly, and control
              everything from a clean admin dashboard.
            </p>
          </div>

          
          <div className="group bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition">
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition">
              🎯
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Live Participation
            </h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Students register in one click, admins track participation in
              real time without chaos.
            </p>
          </div>

          
          <div className="group bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition">
              🏆
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Smart Certificates
            </h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Approve attendance and generate beautiful certificates instantly
              — no manual work needed.
            </p>
          </div>
        </div>
      </section>

      
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Host Your Next Hackathon?
          </h2>

          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Whether you’re an admin or a student, HackathonHub gives you the
            tools to focus on innovation — not management.
          </p>

          <div className="mt-8">
            <Link
              href="/events"
              className="inline-block px-10 py-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}



