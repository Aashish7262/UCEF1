"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ================= TYPES ================= */

interface EventType {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  endDate: string;
  status: "draft" | "live";
  createdBy: string;
}

interface Rule {
  _id: string;
  text: string;
  order: number;
}

/* ================= PAGE ================= */

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventType | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("role")
      : null;

  /* ================= LOAD EVENT + RULES ================= */
  useEffect(() => {
    if (!eventId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const eventRes = await fetch(`/api/events/${eventId}`);
        const eventData = await eventRes.json();
        if (!eventRes.ok) {
          throw new Error("Failed to load event");
        }

        setEvent(eventData.event || eventData);

        const rulesRes = await fetch(
          `/api/events/${eventId}/rules`
        );
        const rulesData = await rulesRes.json();
        setRules(rulesData.rules || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId]);

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

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20 overflow-hidden">

      {/* background aura */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] bg-purple-600/20 blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/20 blur-[200px]" />
      </div>

      <div className="relative max-w-4xl mx-auto">

        {/* EVENT INFO CARD */}
        <div className="rounded-3xl p-[2px]
                        bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">

          <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-10">

            <h1 className="text-3xl md:text-4xl font-extrabold
                           bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                           bg-clip-text text-transparent">
              {event.title}
            </h1>

            <p className="mt-6 text-gray-400 leading-relaxed">
              {event.description}
            </p>

            <div className="mt-6 text-sm text-gray-400 space-y-2">
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

          </div>
        </div>

        {/* RULES SECTION */}
        <div className="mt-14 rounded-3xl p-[2px]
                        bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">

          <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-8">

            <h2 className="text-xl font-semibold mb-4">
              Rules & Regulations
            </h2>

            {rules.length === 0 ? (
              <p className="text-gray-400">
                Rules will be announced soon.
              </p>
            ) : (
              <ul className="list-decimal ml-6 space-y-3 text-gray-300">
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


