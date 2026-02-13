"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Hackathon {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdBy: string;
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("role")
      : null;

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  useEffect(() => {
    if (!role || !userId) return;

    const load = async () => {
      try {
        const res = await fetch(
          `/api/hackathons?role=${role}&userId=${userId}`
        );
        const data = await res.json();
        setHackathons(data.hackathons || []);
      } catch {
        console.error("Failed to load hackathons");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [role, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white/60">
        Loading hackathons...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white px-6 py-20">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-14">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Hackathons
          </h1>

          {role === "admin" && (
            <Link
              href="/admin/hackathons/create"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-black font-semibold hover:scale-105 transition"
            >
              + Create Hackathon
            </Link>
          )}
        </div>

        {/* LIST */}
        <div className="grid md:grid-cols-2 gap-10">

          {hackathons.map((hackathon) => (
            <div
              key={hackathon._id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 transition"
            >
              <h2 className="text-2xl font-semibold mb-3">
                {hackathon.title}
              </h2>

              <p className="text-white/60 mb-6">
                {hackathon.description}
              </p>

              <div className="flex items-center justify-between">

                {/* STATUS BADGE */}
                <span
                  className={`px-4 py-1 rounded-full text-xs font-semibold ${
                    hackathon.status === "registration-open"
                      ? "bg-green-500/20 text-green-400"
                      : hackathon.status === "submission-open"
                      ? "bg-blue-500/20 text-blue-400"
                      : hackathon.status === "evaluation"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : hackathon.status === "completed"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {hackathon.status.toUpperCase()}
                </span>

                {/* ROLE BASED BUTTONS */}

                {role === "admin" && (
                  <Link
                    href={`/hackathons/${hackathon._id}`}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
                  >
                    Manage
                  </Link>
                )}

                {role === "student" &&
                  hackathon.status === "registration-open" && (
                    <Link
                      href={`/hackathons/${hackathon._id}`}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-black font-semibold hover:scale-105 transition text-sm"
                    >
                      Register
                    </Link>
                  )}
              </div>
            </div>
          ))}

          {hackathons.length === 0 && (
            <div className="text-white/50">
              No hackathons available.
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
