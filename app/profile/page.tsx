"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface EventType {
  _id: string;
  title: string;
  eventDate: string;
  endDate: string;
  status: "draft" | "live";
}

interface Participation {
  event: string;
  status: "registered" | "attended";
  certificate?: string;
}

export default function ProfilePage() {
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [events, setEvents] = useState<EventType[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [certificateCount, setCertificateCount] = useState(0);

  // 🔹 AI Mentor (ADDED ONLY)
  const [mentorInsight, setMentorInsight] = useState<string>("");
  const [mentorLoading, setMentorLoading] = useState(false);

  const today = new Date();

  useEffect(() => {
    const r = localStorage.getItem("role");
    const n = localStorage.getItem("name");
    const u = localStorage.getItem("userId");

    setRole(r);
    setName(n);
    setUserId(u);

    if (!r || !u) return;

    const loadData = async () => {
      try {
        if (r === "admin") {
          const res = await fetch(`/api/events?role=admin`);
          const data = await res.json();
          setEvents(
            (data.events || []).filter(
              (event: any) => event.createdBy === u
            )
          );
        }

        if (r === "student") {
          const res = await fetch(`/api/participation?studentId=${u}`);
          const data = await res.json();
          setParticipations(data.participations || []);

          const certRes = await fetch(
            `/api/certificates/student?studentId=${u}`
          );
          const certData = await res.json();

          const certCount = Array.isArray(certData.certificates)
            ? certData.certificates.length
            : 0;

          setCertificateCount(certCount);

          // 🔹 AI STUDENT MENTOR CALL (ADDED)
          setMentorLoading(true);
          fetch("/api/ai/mentor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stats: {
                registered: data.participations.length,
                attended: data.participations.filter(
                  (p: any) => p.status === "attended"
                ).length,
                certificates: certCount,
              },
            }),
          })
            .then(res => res.json())
            .then(ai => setMentorInsight(ai.insight))
            .finally(() => setMentorLoading(false));
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-16 sm:mt-24 text-white/70 text-sm sm:text-base">
        Loading profile…
      </p>
    );
  }

  const attendedCount = participations.filter(
    p => p.status === "attended"
  ).length;

  const registeredCount = participations.length;

  const engagementScore =
    attendedCount * 10 +
    certificateCount * 20 +
    registeredCount * 5;

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 overflow-hidden">

      {/* background aura */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/3 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-purple-600/20 blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-blue-600/20 blur-[200px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10 sm:mb-16 text-center px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold
                         bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                         bg-clip-text text-transparent">
            Profile Overview
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400">
            Welcome back, <span className="font-semibold text-white">{name}</span> 👋
          </p>
        </div>

        {/* ================= ADMIN (UNCHANGED) ================= */}
        {role === "admin" && (
          <>
            <SectionTitle title="Admin Dashboard" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-14">
              <StatCard label="Total Events" value={events.length} />
              <StatCard
                label="Live Events"
                value={events.filter(e => e.status === "live").length}
              />
              <StatCard
                label="Draft Events"
                value={events.filter(e => e.status === "draft").length}
              />
            </div>

            <SectionTitle title="Your Events" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {events.map(event => {
                const start = new Date(event.eventDate);
                const end = new Date(event.endDate);

                const canViewParticipants =
                  event.status === "live" &&
                  today >= start &&
                  today <= end;

                return (
                  <div
                    key={event._id}
                    className="relative rounded-3xl p-[2px]
                               bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                  >
                    <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold break-words">{event.title}</h3>
                      <p className="mt-2 text-xs sm:text-sm text-gray-400">
                        📅 {start.toDateString()} → {end.toDateString()}
                      </p>

                      <div className="mt-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.status === "live"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-white/20 text-white/70"
                          }`}
                        >
                          {event.status.toUpperCase()}
                        </span>
                      </div>

                      {canViewParticipants && (
                        <Link
                          href={`/admin/events/${event._id}/participants`}
                          className="inline-block mt-4 sm:mt-5 px-4 py-2 rounded-xl
                                     bg-blue-500 hover:bg-blue-600
                                     text-black text-xs sm:text-sm font-semibold"
                        >
                          View Participants
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ================= STUDENT (ALL ORIGINAL CONTENT) ================= */}
        {role === "student" && (
          <>
            <SectionTitle title="Your Participation Journey" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-14">
              <StatCard label="Registered" value={registeredCount} />
              <StatCard label="Attended" value={attendedCount} />
              <StatCard label="Certificates" value={certificateCount} />
            </div>

            <SectionTitle title="Event History" />

            <div className="space-y-4 sm:space-y-6 mb-14 sm:mb-20">
              {participations.map((p, idx) => (
                <div
                  key={idx}
                  className="relative rounded-3xl p-[2px]
                             bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                >
                  <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-4 sm:p-6
                                  flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="w-full">
                      <p className="font-semibold text-sm sm:text-base">Event ID</p>
                      <p className="text-xs sm:text-sm text-gray-400 break-all">
                        {p.event}
                      </p>

                      <span
                        className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                          p.status === "attended"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </div>

                    {p.certificate && (
                      <Link
                        href={`/certificates/${p.certificate}`}
                        className="w-full md:w-auto text-center px-4 sm:px-5 py-2 rounded-xl
                                   bg-purple-500 hover:bg-purple-600
                                   text-black text-xs sm:text-sm font-semibold"
                      >
                        View Certificate
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ======== ANALYTICS (UNCHANGED) ======== */}
            <SectionTitle title="Participation Analytics" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-14 sm:mb-20">
              <div className="relative rounded-3xl p-[2px]
                              bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-4 sm:p-6 h-[260px] sm:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Attended", value: attendedCount },
                          { name: "Registered", value: registeredCount },
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        <Cell fill="#22c55e" />
                        <Cell fill="#eab308" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="relative rounded-3xl p-[2px]
                              bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6
                                flex flex-col justify-center items-center text-center">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                    Engagement Score
                  </h3>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold
                                  bg-gradient-to-r from-green-400 to-blue-400
                                  bg-clip-text text-transparent">
                    {engagementScore}
                  </div>
                </div>
              </div>
            </div>

            {/* ======== PERSONAL INSIGHTS (UNCHANGED) ======== */}
            <SectionTitle title="Personal Insights" />

            <div className="relative rounded-3xl p-[2px]
                            bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-16 sm:mb-24">
              <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-4 sm:p-6 space-y-2 sm:space-y-3">
                <Insight text={`You attended ${attendedCount} out of ${registeredCount} registered events.`} />
                <Insight text={certificateCount > 0
                  ? "You are earning certificates consistently."
                  : "Attend events to start earning certificates."}
                />
                <Insight text="Participating more will increase your engagement score." />
              </div>
            </div>

            {/* ======== AI STUDENT MENTOR (ONLY ADDITION) ======== */}
            <SectionTitle title="AI Student Mentor" />

            <div className="relative rounded-3xl p-[2px]
                            bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-16 sm:mb-24">
              <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-4 sm:p-6">
                {mentorLoading ? (
                  <p className="text-gray-300 animate-pulse text-sm sm:text-base">
                    🤖 Mentor is analyzing your journey…
                  </p>
                ) : (
                  <p className="text-base sm:text-lg leading-relaxed text-white">
                    {mentorInsight}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{title}</h2>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="relative rounded-3xl p-[2px]
                    bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-4 sm:p-6 text-center">
        <p className="text-xs sm:text-sm text-gray-400">{label}</p>
        <p className="text-3xl sm:text-4xl font-extrabold mt-2 text-white">{value}</p>
      </div>
    </div>
  );
}

function Insight({ text }: { text: string }) {
  return <p className="text-gray-300 text-sm sm:text-base">• {text}</p>;
}


