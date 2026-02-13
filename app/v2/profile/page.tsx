
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
      <p className="text-center mt-20 text-gray-600">
        Loading profile…
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Profile Overview
        </h1>
        <p className="mt-3 text-gray-600">
          Welcome back, <span className="font-semibold">{name}</span> 👋
        </p>
      </div>

      
      {role === "admin" && (
        <>
          <SectionTitle title="Admin Dashboard" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="bg-white border rounded-3xl p-6 shadow-md hover:shadow-xl transition"
                >
                  <h3 className="text-xl font-semibold">
                    {event.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    📅 {start.toDateString()} → {end.toDateString()}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === "live"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {event.status.toUpperCase()}
                    </span>
                  </div>

                  {canViewParticipants && (
                    <Link
                      href={`/admin/events/${event._id}/participants`}
                      className="inline-block mt-5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
                    >
                      View Participants
                    </Link>
                  )}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard
              label="Registered"
              value={participations.length}
            />
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
                className="bg-white border rounded-3xl p-6 shadow-md hover:shadow-xl transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    Event ID
                  </p>
                  <p className="text-sm text-gray-500 break-all">
                    {p.event}
                  </p>

                  <span
                    className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === "attended"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </div>

                {p.certificate && (
                  <Link
                    href={`/certificates/${p.certificate}`}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
                  >
                    View Certificate
                  </Link>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}



function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-2xl font-bold mb-6 text-gray-900">
      {title}
    </h2>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/80 backdrop-blur border rounded-3xl p-6 text-center shadow-md">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-4xl font-extrabold text-gray-900 mt-2">
        {value}
      </p>
    </div>
  );
}