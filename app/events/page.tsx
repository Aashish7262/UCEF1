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
  status: "draft" | "live" | "completed";
  organizer: string | { _id: string }; // 🔥 handle populated + string
}

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  /* 🔥 SAFE ORGANIZER ID EXTRACTOR (CRITICAL FIX) */
  const getOrganizerId = (organizer: string | { _id: string }) => {
    if (!organizer) return "";
    if (typeof organizer === "string") return organizer;
    return organizer._id;
  };

  /* ================= LOAD EVENTS ================= */
  const loadEvents = async () => {
    if (!role) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/events?role=${role}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch events");
      }

      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [role]);

  /* ================= MAKE EVENT LIVE ================= */
  const makeEventLive = async (eventId: string) => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/events/${eventId}/live`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to make event live");
        return;
      }

      await loadEvents();
    } catch {
      alert("Something went wrong");
    }
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
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-purple-600/20 blur-[120px] md:blur-[200px]" />
        <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-blue-600/20 blur-[120px] md:blur-[200px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold
                         bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                         bg-clip-text text-transparent">
            Events
          </h1>

          {role === "admin" && (
            <Link
              href="/admin/create-event"
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-semibold
                         bg-white/10 backdrop-blur
                         border border-white/20
                         hover:border-white hover:bg-white/20
                         transition-all duration-300 text-sm sm:text-base w-fit"
            >
              + Create Event
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-8 sm:mb-10 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* EVENTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {events.map((event) => {
            const now = new Date();
            const startDate = new Date(event.eventDate);
            const endDate = new Date(event.endDate);

            const isExpired = now > endDate;

            // 🔥 FINAL FIXED ORGANIZER CHECK
            const isOrganizer =
              getOrganizerId(event.organizer) === userId;

            return (
              <div
                key={event._id}
                className="group relative rounded-3xl p-[2px]
                           bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500
                           hover:scale-[1.02] transition-all duration-300"
              >
                <div className="relative rounded-3xl bg-black/70 backdrop-blur-xl p-5 sm:p-6 h-full overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                                  transition duration-300
                                  bg-gradient-to-br from-purple-500/30 to-blue-500/30
                                  blur-2xl" />

                  <div className="relative z-10 flex flex-col h-full">
                    <h2 className="text-xl sm:text-2xl font-semibold break-words">
                      {event.title}
                    </h2>

                    <p className="mt-2 sm:mt-3 text-white/70 line-clamp-3 text-sm sm:text-base">
                      {event.description}
                    </p>

                    <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/50">
                      📅 {startDate.toDateString()} –{" "}
                      {endDate.toDateString()}
                    </p>

                    {/* STATUS */}
                    <div className="mt-3 sm:mt-4">
                      {isExpired ? (
                        <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300">
                          COMPLETED
                        </span>
                      ) : event.status === "live" ? (
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300">
                          LIVE
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300">
                          DRAFT
                        </span>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-5 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
                      <Link
                        href={`/events/${event._id}`}
                        className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm
                                   border border-white/20
                                   hover:border-white hover:bg-white/10
                                   transition-all"
                      >
                        View Details
                      </Link>

                      {/* 🔥 ADMIN / ORGANIZER CONTROLS */}
                      {role === "admin" && isOrganizer && (
                        <>
                          {event.status === "draft" && !isExpired && (
                            <button
                              onClick={() => makeEventLive(event._id)}
                              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm
                                         bg-green-500 hover:bg-green-600
                                         transition-all font-semibold"
                            >
                              Make Live 🚀
                            </button>
                          )}

                          {event.status === "live" && (
                            <>
                              {/* Manage Role Slots */}
                              <Link
                                href={`/admin/events/${event._id}/roles`}
                                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm
                                           border border-white/20
                                           hover:border-white hover:bg-white/10
                                           transition-all"
                              >
                                Manage Roles
                              </Link>

                              {/* 🔥 NEW: VIEW APPLICATIONS (APPROVE / REJECT PAGE) */}
                              <Link
                                href={`/admin/events/${event._id}/applications`}
                                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm
                                           bg-purple-500 hover:bg-purple-600
                                           transition-all font-semibold"
                              >
                                Applications
                              </Link>
                              {isOrganizer && (
  <Link
    href={`/admin/events/${event._id}/certificates`}
    className="px-6 py-3 rounded-xl font-semibold
               bg-gradient-to-r from-yellow-400 to-pink-500
               text-black hover:brightness-110 transition"
  >
    View Issued Certificates
  </Link>
)}

                            </>
                          )}
                        </>
                      )}

                      {/* 🔥 STUDENT FLOW */}
                      {role === "student" && !isExpired && (
                        <>
                          {event.status === "draft" && (
                            <span className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm bg-white/20">
                              Roles Coming Soon
                            </span>
                          )}

                          {event.status === "live" && (
                            <Link
                              href={`/events/${event._id}/roles`}
                              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm
                                         bg-blue-500 hover:bg-blue-600
                                         transition-all"
                            >
                              Apply for Roles
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














