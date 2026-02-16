"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface RoleSlot {
  _id: string;
  role: string;
  startTime: string;
  endTime: string;
  maxSeats: number;
}

export default function RoleSetupPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;

  const [role, setRole] = useState("participant");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxSeats, setMaxSeats] = useState(0);
  const [slots, setSlots] = useState<RoleSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  const fetchSlots = async () => {
    const res = await fetch(`/api/events/${eventId}/roleslots`);
    const data = await res.json();
    if (res.ok) setSlots(data.slots || []);
  };

  useEffect(() => {
    if (eventId) fetchSlots();
  }, [eventId]);

  const createSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(
      `/api/events/${eventId}/roleslots`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role,
          startTime,
          endTime,
          maxSeats,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      setError(data.message);
    } else {
      setStartTime("");
      setEndTime("");
      setMaxSeats(0);
      fetchSlots();
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-extrabold mb-8">
          Step 2: Define Role Time Slots
        </h1>

        <form
          onSubmit={createSlot}
          className="bg-black/60 border border-white/20 rounded-2xl p-6 space-y-4"
        >
          {error && <p className="text-red-400">{error}</p>}

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black border border-white/20"
          >
            <option value="participant">Participant</option>
            <option value="volunteer">Volunteer</option>
            <option value="judge">Judge</option>
            <option value="speaker">Speaker</option>
          </select>

          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-black border border-white/20"
          />

          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-black border border-white/20"
          />

          <input
            type="number"
            placeholder="Max Seats (0 = unlimited)"
            value={maxSeats}
            onChange={(e) => setMaxSeats(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-black border border-white/20"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold
                       bg-gradient-to-r from-blue-500 to-purple-500 text-black"
          >
            {loading ? "Adding Slot..." : "Add Role Slot"}
          </button>
        </form>

        <div className="mt-10 space-y-4">
          {slots.map((slot) => (
            <div key={slot._id} className="p-4 border border-white/20 rounded-xl">
              <p className="font-bold">{slot.role.toUpperCase()}</p>
              <p className="text-gray-400 text-sm">
                {new Date(slot.startTime).toLocaleString()} →
                {new Date(slot.endTime).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() =>
            router.push(`/admin/events/${eventId}/rules`)
          }
          className="mt-10 w-full py-3 rounded-xl font-semibold
                     bg-gradient-to-r from-green-500 to-blue-500 text-black"
        >
          Continue to Add Rules (Step 3)
        </button>
      </div>
    </main>
  );
}
