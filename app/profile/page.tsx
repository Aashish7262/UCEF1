"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
          const myEvents = (data.events || []).filter(
            (event: any) => event.createdBy === u
          );
          setEvents(myEvents);
        }

        if (r === "student") {
          const res = await fetch(`/api/participation?studentId=${u}`);
          const data = await res.json();
          setParticipations(data.participations || []);

          const certRes = await fetch(
            `/api/certificates/student?studentId=${u}`
          );
          const certData = await certRes.json();

          setCertificateCount(
            Array.isArray(certData.certificates)
              ? certData.certificates.length
              : 0
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-24 text-white/70">
        Loading profile…
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20 overflow-hidden">

      {/* background aura */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] bg-purple-600/20 blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/20 blur-[200px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold
                         bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                         bg-clip-text text-transparent">
            Profile Overview
          </h1>

          <p className="mt-4 text-gray-400">
            Welcome back, <span className="font-semibold text-white">{name}</span> 👋
          </p>
        </div>

        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <>
            <SectionTitle title="Admin Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6">

                      <h3 className="text-xl font-semibold">
                        {event.title}
                      </h3>

                      <p className="mt-2 text-sm text-gray-400">
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
                          className="inline-block mt-5 px-4 py-2 rounded-xl
                                     bg-blue-500 hover:bg-blue-600
                                     text-black text-sm font-semibold
                                     transition"
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

        {/* ================= STUDENT ================= */}
        {role === "student" && (
          <>
            <SectionTitle title="Your Participation Journey" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
              <StatCard label="Registered" value={participations.length} />
              <StatCard
                label="Attended"
                value={participations.filter(p => p.status === "attended").length}
              />
              <StatCard
                label="Certificates"
                value={certificateCount}
              />
            </div>

            <SectionTitle title="Event History" />

            <div className="space-y-6">
              {participations.map((p, idx) => (
                <div
                  key={idx}
                  className="relative rounded-3xl p-[2px]
                             bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                >
                  <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6
                                  flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                      <p className="font-semibold">
                        Event ID
                      </p>
                      <p className="text-sm text-gray-400 break-all">
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
                        className="px-5 py-2 rounded-xl
                                   bg-purple-500 hover:bg-purple-600
                                   text-black text-sm font-semibold
                                   transition"
                      >
                        View Certificate
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-2xl font-bold mb-6">
      {title}
    </h2>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="relative rounded-3xl p-[2px]
                    bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 text-center">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-4xl font-extrabold mt-2 text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

