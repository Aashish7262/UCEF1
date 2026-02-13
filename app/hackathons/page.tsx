"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Hackathon {
  _id: string;
  title: string;
  description: string;
  status: string;
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /* ===== Load role + userId ===== */
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId");

    setRole(storedRole);
    setUserId(storedUserId);
  }, []);

  /* ===== Fetch Hackathons ===== */
  useEffect(() => {
    if (!role) return;

    const loadHackathons = async () => {
      try {
        const url =
          role === "admin"
            ? `/api/hackathons/create?role=admin&userId=${userId}`
            : `/api/hackathons/create?role=student`;

        const res = await fetch(url);
        const data = await res.json();

        setHackathons(data.hackathons || []);
      } catch (err) {
        console.error("Failed to load hackathons");
      } finally {
        setLoading(false);
      }
    };

    loadHackathons();
  }, [role, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-white/60 text-lg tracking-wide">
            Loading hackathons...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#020617] text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-14">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Hackathons
            </h1>
            <p className="text-white/50 mt-2 text-sm md:text-base">
              Explore and manage all hackathon events in one place
            </p>
          </div>

          {role === "admin" && (
            <Link
              href="/admin/hackathons/create"
              className="w-fit px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-black font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
            >
              + Create Hackathon
            </Link>
          )}
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {hackathons.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl">
              <p className="text-white/60 text-lg font-medium">
                No hackathons available
              </p>
              <p className="text-white/40 text-sm mt-2">
                New hackathons will appear here once created
              </p>
            </div>
          )}

          {hackathons.map((hackathon) => (
            <div
              key={hackathon._id}
              className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:border-purple-500/40 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/0 via-transparent to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500" />

              <div className="relative z-10">
                <h2 className="text-2xl font-semibold mb-3 tracking-tight">
                  {hackathon.title}
                </h2>

                <p className="text-white/60 mb-8 leading-relaxed line-clamp-3">
                  {hackathon.description}
                </p>

                <div className="flex items-center justify-between">
                  {/* STATUS BADGE */}
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${
                      hackathon.status === "registration-open"
                        ? "bg-green-500/15 text-green-400 border-green-500/30"
                        : hackathon.status === "submission-open"
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        : hackathon.status === "evaluation"
                        ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                        : hackathon.status === "completed"
                        ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                        : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {hackathon.status.toUpperCase()}
                  </span>

                  {/* ADMIN BUTTONS */}
                  {role === "admin" && (
                    <div className="flex gap-3">
                      <Link
                        href={`/hackathons/${hackathon._id}`}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-all duration-200 hover:scale-105"
                      >
                        Manage
                      </Link>

                      <Link
                        href={`/admin/hackathons/${hackathon._id}/teams`}
                        className="px-4 py-2 rounded-xl bg-blue-500/90 hover:bg-blue-500 text-black font-semibold text-sm shadow-md hover:shadow-blue-500/30 transition-all duration-200 hover:scale-105"
                      >
                        View Teams
                      </Link>
                    </div>
                  )}

                  {/* STUDENT BUTTON */}
                  {role === "student" && (
                    <Link
                      href={`/hackathons/${hackathon._id}`}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 text-black font-semibold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}



