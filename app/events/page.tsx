"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EventType {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  endDate: string;
  status: "draft" | "live";
  createdBy: string;
}

type ParticipationStatus = "registered" | "attended";

interface ParticipationMap {
  [eventId: string]: {
    status: ParticipationStatus;
    certificateId?: string;
  };
}

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventType[]>([]);
  const [participations, setParticipations] =
    useState<ParticipationMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  /* ================= LOAD EVENTS + PARTICIPATIONS ================= */
  useEffect(() => {
    if (!role) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const eventsRes = await fetch(`/api/events?role=${role}`);
        const eventsData = await eventsRes.json();
        if (!eventsRes.ok) throw new Error(eventsData.message);
        setEvents(eventsData.events || []);

        if (role === "student" && userId) {
          const pRes = await fetch(
            `/api/participation?studentId=${userId}`
          );
          const pData = await pRes.json();
          if (!pRes.ok) throw new Error(pData.message);

          const map: ParticipationMap = {};
          pData.participations.forEach((p: any) => {
            map[p.event.toString()] = {
              status: p.status,
              certificateId: p.certificate || undefined,
            };
          });
          setParticipations(map);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [role, userId]);

  /* ================= PARTICIPATE ================= */
  const handleParticipate = async (eventId: string) => {
    if (!userId) return;

    const res = await fetch("/api/participation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, studentId: userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }

    setParticipations((prev) => ({
      ...prev,
      [eventId]: { status: "registered" },
    }));
  };

  /* ================= GENERATE CERTIFICATE ================= */
  const handleGenerateCertificate = async (eventId: string) => {
    if (!userId) return;

    const res = await fetch("/api/certificates/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, studentId: userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }

    router.push(`/certificates/${data.certificateId}`);
  };

  /* ================= ADMIN: MAKE EVENT LIVE ================= */
  const makeEventLive = async (eventId: string) => {
    if (!userId) return;

    const res = await fetch(`/api/events/${eventId}/live`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      alert("Failed to make event live");
      return;
    }

    const updated = await fetch(`/api/events?role=${role}`);
    const data = await updated.json();
    setEvents(data.events || []);
  };

  if (loading) {
    return (
      <p className="text-center mt-24 text-white/70">
        Loading events…
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* background aura */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] bg-purple-600/20 blur-[200px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-blue-600/20 blur-[200px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold
                         bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                         bg-clip-text text-transparent">
            Events
          </h1>

          {role === "admin" && (
            <Link
              href="/admin/create-event"
              className="px-6 py-3 rounded-2xl font-semibold
                         bg-white/10 backdrop-blur
                         border border-white/20
                         hover:border-white hover:bg-white/20
                         transition-all duration-300"
            >
              + Create Event
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-10 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3">
            {error}
          </div>
        )}

        {/* EVENTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
          {events.map((event) => {
            const participation = participations[event._id];

            const now = new Date();
            const startDate = new Date(event.eventDate);
            const endDate = new Date(event.endDate);

            const isWithinDateRange =
              now >= startDate && now <= endDate;
            const isExpired = now > endDate;

            return (
              <div
                key={event._id}
                className="group relative rounded-3xl p-[2px]
                           bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500
                           hover:scale-[1.03] transition-all duration-300"
              >
                <div className="relative rounded-3xl bg-black/70 backdrop-blur-xl p-6 h-full overflow-hidden">

                  {/* glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                                  transition duration-300
                                  bg-gradient-to-br from-purple-500/30 to-blue-500/30
                                  blur-2xl" />

                  <div className="relative z-10 flex flex-col h-full">
                    <h2 className="text-2xl font-semibold">
                      {event.title}
                    </h2>

                    <p className="mt-3 text-white/70 line-clamp-3">
                      {event.description}
                    </p>

                    <p className="mt-4 text-sm text-white/50">
                      📅 {startDate.toDateString()} –{" "}
                      {endDate.toDateString()}
                    </p>

                    {/* STATUS */}
                    <div className="mt-4">
                      {isExpired ? (
                        <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300">
                          EXPIRED
                        </span>
                      ) : event.status === "live" ? (
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300">
                          LIVE
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs bg-white/20 text-white/70">
                          DRAFT
                        </span>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/events/${event._id}`}
                        className="px-4 py-2 rounded-xl text-sm
                                   border border-white/20
                                   hover:border-white hover:bg-white/10
                                   transition-all"
                      >
                        View Details
                      </Link>

                      {/* ADMIN */}
                      {role === "admin" &&
                        event.createdBy === userId && (
                          <>
                            {event.status === "draft" &&
                              isWithinDateRange && (
                                <button
                                  onClick={() =>
                                    makeEventLive(event._id)
                                  }
                                  className="px-4 py-2 rounded-xl text-sm
                                             bg-green-500/80 hover:bg-green-600
                                             transition-all"
                                >
                                  Make Live
                                </button>
                              )}

                            {event.status === "live" && (
                              <Link
                                href={`/admin/events/${event._id}/participants`}
                                className="px-4 py-2 rounded-xl text-sm
                                           border border-white/20
                                           hover:border-white hover:bg-white/10
                                           transition-all"
                              >
                                Participants
                              </Link>
                            )}
                          </>
                        )}

                      {/* STUDENT */}
                      {role === "student" &&
                        event.status === "live" &&
                        isWithinDateRange && (
                          <>
                            {!participation && (
                              <button
                                onClick={() =>
                                  handleParticipate(event._id)
                                }
                                className="px-4 py-2 rounded-xl text-sm
                                           bg-blue-500 hover:bg-blue-600
                                           transition-all"
                              >
                                Participate
                              </button>
                            )}

                            {participation?.status === "registered" && (
                              <span className="px-4 py-2 rounded-xl text-sm bg-white/20">
                                Registered ✔
                              </span>
                            )}

                            {participation?.status === "attended" &&
                              !participation.certificateId && (
                                <button
                                  onClick={() =>
                                    handleGenerateCertificate(event._id)
                                  }
                                  className="px-4 py-2 rounded-xl text-sm
                                             bg-green-500 hover:bg-green-600
                                             transition-all"
                                >
                                  Generate Certificate
                                </button>
                              )}

                            {participation?.certificateId && (
                              <Link
                                href={`/certificates/${participation.certificateId}`}
                                className="px-4 py-2 rounded-xl text-sm
                                           bg-purple-500 hover:bg-purple-600
                                           transition-all"
                              >
                                Download Certificate
                              </Link>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}












