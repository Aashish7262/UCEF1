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
    <main className="w-full bg-black text-white">
      {/* HERO */}
      <section className="relative bg-black overflow-hidden">
        {/* animated gradient aura */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-purple-600/20 blur-[120px] md:blur-[200px]" />
          <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-blue-600/20 blur-[120px] md:blur-[200px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-32 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            Run Hackathons.
            <span className="block mt-2 bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Manage Everything Seamlessly.
            </span>
          </h1>

          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            HackathonHub helps you create events, manage participation, track
            attendance, and generate certificates — all from one powerful
            platform.
          </p>

          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6">
            {!isLoggedIn && (
              <>
                <Link
                  href="/events"
                  className="relative w-full sm:w-auto text-center px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-semibold
                             bg-white text-black
                             shadow-[0_0_40px_rgba(255,255,255,0.25)]
                             hover:shadow-[0_0_70px_rgba(168,85,247,0.6)]
                             transition-all duration-300"
                >
                  Explore Events 🚀
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto text-center px-6 py-3 sm:px-8 sm:py-4 rounded-2xl border border-white/20
                             text-white hover:border-white
                             hover:bg-white/5 transition-all duration-300"
                >
                  Admin Login
                </Link>
              </>
            )}

            {isLoggedIn && (
              <>
                <Link
                  href="/events"
                  className="relative w-full sm:w-auto text-center px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-semibold
                             bg-white text-black
                             shadow-[0_0_40px_rgba(255,255,255,0.25)]
                             hover:shadow-[0_0_70px_rgba(59,130,246,0.6)]
                             transition-all duration-300"
                >
                  Go to Events
                </Link>

                {role === "admin" && (
                  <Link
                    href="/admin/create-event"
                    className="w-full sm:w-auto text-center px-6 py-3 sm:px-8 sm:py-4 rounded-2xl border border-white/20
                               text-white hover:border-white
                               hover:bg-white/5 transition-all duration-300"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-32">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Everything You Need to Run Events
        </h2>

        <p className="mt-4 text-center text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
          Designed for admins and students — simple, fast, and powerful.
        </p>

        <div className="mt-12 sm:mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Card 1 */}
          <div className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            <div className="rounded-3xl bg-black p-6 sm:p-8 hover:bg-gradient-to-br hover:from-black hover:to-slate-900 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl sm:text-2xl font-bold mb-5 sm:mb-6 group-hover:scale-110 transition">
                🛠️
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Event Creation
              </h3>
              <p className="mt-3 text-gray-400 leading-relaxed text-sm sm:text-base">
                Create hackathons, set dates, go live instantly, and control
                everything from a clean admin dashboard.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-green-400 via-emerald-500 to-cyan-500">
            <div className="rounded-3xl bg-black p-6 sm:p-8 hover:bg-gradient-to-br hover:from-black hover:to-slate-900 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center text-xl sm:text-2xl font-bold mb-5 sm:mb-6 group-hover:scale-110 transition">
                🎯
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Live Participation
              </h3>
              <p className="mt-3 text-gray-400 leading-relaxed text-sm sm:text-base">
                Students register in one click, admins track participation in
                real time without chaos.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-500">
            <div className="rounded-3xl bg-black p-6 sm:p-8 hover:bg-gradient-to-br hover:from-black hover:to-slate-900 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl sm:text-2xl font-bold mb-5 sm:mb-6 group-hover:scale-110 transition">
                🏆
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Smart Certificates
              </h3>
              <p className="mt-3 text-gray-400 leading-relaxed text-sm sm:text-base">
                Approve attendance and generate beautiful certificates instantly
                — no manual work needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Ready to Host Your Next Hackathon?
          </h2>

          <p className="mt-4 text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Whether you’re an admin or a student, HackathonHub gives you the
            tools to focus on innovation — not management.
          </p>

          <div className="mt-6 sm:mt-8">
            <Link
              href="/events"
              className="inline-block w-full sm:w-auto px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-semibold
                         bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                         text-black hover:brightness-110 transition"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}



