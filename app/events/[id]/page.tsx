"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ================= TYPES ================= */

interface EventType {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  endDate: string;
  status: "draft" | "live" | "completed";
  organizer: string;
  qrEnabled: boolean;
}

interface Rule {
  _id: string;
  text: string;
  order: number;
}

/* ================= PAGE ================= */

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [event, setEvent] = useState<EventType | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [releasingQR, setReleasingQR] = useState(false);

  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("role")
      : null;

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  /* ================= FETCH EVENT (REUSABLE) ================= */
  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    try {
      const res = await fetch(`/api/events/${eventId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch event");
      }

      setEvent(data.event);
    } catch (err: any) {
      setError(err.message || "Failed to load event");
    }
  }, [eventId]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (!eventId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        await fetchEvent();

        const rulesRes = await fetch(`/api/events/${eventId}/rules`);
        const rulesData = await rulesRes.json();
        setRules(rulesData.rules || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId, fetchEvent]);

  /* ================= REAL-TIME EVENT REFRESH (IMPORTANT) ================= */
  useEffect(() => {
    if (!eventId) return;

    // Poll every 5 seconds so:
    // - Admin sees QR status update
    // - Students instantly see scan button when QR is released
    const interval = setInterval(() => {
      fetchEvent();
    }, 5000);

    return () => clearInterval(interval);
  }, [eventId, fetchEvent]);

  /* ================= RELEASE QR (ADMIN) ================= */
  const handleReleaseQR = async () => {
    if (!eventId || !userId) {
      alert("Missing user session");
      return;
    }

    try {
      setReleasingQR(true);

      const res = await fetch(`/api/events/${eventId}/release-qr`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // REQUIRED BY BACKEND
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to release QR");
        return;
      }

      // 🔥 CRITICAL: refetch latest event state
      await fetchEvent();

      alert("QR Released! Students can now scan attendance.");
    } catch (error) {
      console.error("Release QR Error:", error);
      alert("Something went wrong while releasing QR");
    } finally {
      setReleasingQR(false);
    }
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <p className="text-center mt-24 text-white/70">
        Loading event details…
      </p>
    );
  }

  if (error || !event) {
    return (
      <p className="text-center mt-24 text-red-400">
        {error || "Event not found"}
      </p>
    );
  }

  const now = new Date();
  const end = new Date(event.endDate);

  // Only for recommendation (NOT restriction)
  const twoMinutesBeforeEnd = new Date(end.getTime() - 2 * 60 * 1000);
  const isQRRecommendedWindow =
    now >= twoMinutesBeforeEnd && now <= end;

  const isOrganizer =
    role === "admin" && event.organizer === userId;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
      {/* Background Aura */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-purple-600/20 blur-[120px] md:blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-blue-600/20 blur-[120px] md:blur-[200px]" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* EVENT CARD */}
        <div className="rounded-3xl p-[2px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 sm:p-8 md:p-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold
              bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
              bg-clip-text text-transparent break-words">
              {event.title}
            </h1>

            <p className="mt-4 sm:mt-6 text-gray-400 leading-relaxed text-sm sm:text-base">
              {event.description}
            </p>

            <div className="mt-5 sm:mt-6 text-xs sm:text-sm text-gray-400 space-y-2">
              <p>📅 Start: {new Date(event.eventDate).toDateString()}</p>
              <p>⏳ End: {new Date(event.endDate).toDateString()}</p>
              <p>
                Status:{" "}
                <span
                  className={`font-semibold ${
                    event.status === "live"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {event.status.toUpperCase()}
                </span>
              </p>
            </div>

            {/* ================= ATTENDANCE QR SECTION ================= */}
            {event.status === "live" && (
              <div className="mt-8 flex flex-wrap gap-4 items-center">

                {/* 👨‍💼 ADMIN CONTROLS */}
                {isOrganizer && (
                  <>
                    {!event.qrEnabled ? (
                      <button
                        onClick={handleReleaseQR}
                        disabled={releasingQR}
                        className="px-6 py-3 rounded-xl font-semibold
                          bg-gradient-to-r from-green-500 to-emerald-500
                          text-black hover:brightness-110
                          transition disabled:opacity-60"
                      >
                        {releasingQR
                          ? "Releasing QR..."
                          : "Release Attendance QR"}
                      </button>
                    ) : (
                      <>
                        <Link
                          href={`/events/${event._id}/qr`}
                          className="px-6 py-3 rounded-xl font-semibold
                            bg-gradient-to-r from-blue-500 to-purple-500
                            text-black hover:brightness-110 transition"
                        >
                          Manage Live QR Panel
                        </Link>

                        <span className="text-green-400 text-sm font-semibold">
                          🔴 QR is LIVE (Students can scan)
                        </span>
                      </>
                    )}
                  </>
                )}

                {/* 👨‍🎓 STUDENT VIEW */}
                {role === "student" && event.qrEnabled && (
                  <Link
                    href="/scan"
                    className="px-6 py-3 rounded-xl font-semibold
                      bg-gradient-to-r from-yellow-400 to-pink-500
                      text-black hover:brightness-110 transition"
                  >
                    Scan Attendance QR
                  </Link>
                )}

                {/* Recommendation Notice (Realistic UX) */}
                {isOrganizer && !event.qrEnabled && !isQRRecommendedWindow && (
                  <p className="text-xs text-yellow-400 mt-2">
                    Recommended: Release QR in the last 2 minutes of the event
                    (but you can control it anytime).
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RULES SECTION */}
        <div className="mt-10 sm:mt-14 rounded-3xl p-[2px]
          bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Rules & Regulations
            </h2>

            {rules.length === 0 ? (
              <p className="text-gray-400 text-sm sm:text-base">
                Rules will be announced soon.
              </p>
            ) : (
              <ul className="list-decimal ml-4 sm:ml-6 space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base">
                {rules
                  .sort((a, b) => a.order - b.order)
                  .map((rule) => (
                    <li key={rule._id}>{rule.text}</li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

