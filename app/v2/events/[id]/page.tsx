
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

        // fetch event details
        const eventRes = await fetch(`/api/events/${eventId}`);
        const eventData = await eventRes.json();
        if (!eventRes.ok) {
          throw new Error("Failed to load event");
        }

        setEvent(eventData.event || eventData);

        // fetch rules
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
      <p className="text-center mt-20 text-gray-600">
        Loading event details…
      </p>
    );
  }

  if (error || !event) {
    return (
      <p className="text-center mt-20 text-red-600">
        {error || "Event not found"}
      </p>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* EVENT INFO */}
      <h1 className="text-3xl font-extrabold text-gray-900">
        {event.title}
      </h1>

      <p className="mt-4 text-gray-600">
        {event.description}
      </p>

      <div className="mt-4 text-sm text-gray-500 space-y-1">
        <p>📅 Start: {new Date(event.eventDate).toDateString()}</p>
        <p>⏳ End: {new Date(event.endDate).toDateString()}</p>
        <p>Status: {event.status.toUpperCase()}</p>
      </div>

      {/* RULES SECTION */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">
          Rules & Regulations
        </h2>

        {rules.length === 0 ? (
          <p className="text-gray-500">
            Rules will be announced soon.
          </p>
        ) : (
          <ul className="list-decimal ml-6 space-y-2">
            {rules
              .sort((a, b) => a.order - b.order)
              .map((rule) => (
                <li key={rule._id}>{rule.text}</li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}