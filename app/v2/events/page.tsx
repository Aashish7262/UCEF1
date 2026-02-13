
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
      <p className="text-center mt-20 text-gray-600">
        Loading events…
      </p>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Events
        </h1>

        {role === "admin" && (
          <Link
            href="/admin/create-event"
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md"
          >
            + Create Event
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
              className="border rounded-3xl p-6 bg-white shadow-md hover:shadow-xl transition"
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                {event.title}
              </h2>

              <p className="mt-2 text-gray-600 line-clamp-3">
                {event.description}
              </p>

              <p className="mt-3 text-sm text-gray-500">
                📅 Start: {startDate.toDateString()}
              </p>
              <p className="text-sm text-gray-500">
                ⏳ End: {endDate.toDateString()}
              </p>

              <div className="mt-4">
                {isExpired ? (
                  <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                    EXPIRED
                  </span>
                ) : event.status === "live" ? (
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                    LIVE
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">
                    DRAFT
                  </span>
                )}
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex flex-wrap gap-3">
                {/* ✅ VIEW DETAILS (ADDED) */}
                <Link
                  href={`/events/${event._id}`}
                  className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-100 transition"
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
                            className="px-4 py-2 bg-green-600 text-white rounded-xl"
                          >
                            Make Live
                          </button>
                        )}

                      {event.status === "live" && (
                        <Link
                          href={`/admin/events/${event._id}/participants`}
                          className="px-4 py-2 border rounded-xl"
                        >
                          View Participants
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
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                        >
                          Participate
                        </button>
                      )}

                      {participation?.status ===
                        "registered" && (
                        <span className="px-4 py-2 bg-gray-200 rounded-xl text-sm">
                          Registered ✔
                        </span>
                      )}

                      {participation?.status ===
                        "attended" &&
                        !participation.certificateId && (
                          <button
                            onClick={() =>
                              handleGenerateCertificate(
                                event._id
                              )
                            }
                            className="px-4 py-2 bg-green-600 text-white rounded-xl"
                          >
                            Generate Certificate
                          </button>
                        )}

                      {participation?.certificateId && (
                        <Link
                          href={`/certificates/${participation.certificateId}`}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl"
                        >
                          Download Certificate
                        </Link>
                      )}
                    </>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
