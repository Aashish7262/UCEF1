"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const generateDescription = async () => {
    if (!title || title.length < 3) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/hackathon-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title }),
      });

      const data = await res.json();
      setDescription(data.description || "");
    } catch (err) {
      console.error("AI description generation failed", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (new Date(endDate) < new Date(eventDate)) {
      setError("End date cannot be before event date");
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("You must be logged in as admin");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          eventDate,
          endDate,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create event");
        return;
      }

      const eventId = data.event._id;

      // 🔥 CRITICAL: Redirect to role setup (new architecture)
      router.push(`/admin/events/${eventId}/roles`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-start sm:items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
      {/* background aura */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-purple-600/20 blur-[120px] md:blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-blue-600/20 blur-[120px] md:blur-[200px]" />
      </div>

      <div className="relative w-full max-w-xl rounded-3xl p-[1px] sm:p-[2px]
                      bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 sm:p-8 md:p-10">

          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold
                           bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                           bg-clip-text text-transparent">
              Create New Event
            </h1>

            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-400">
              Step 1: Create Event → Step 2: Define Roles → Step 3: Add Rules
            </p>
          </div>

          {error && (
            <div className="mt-5 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          <form
            onSubmit={handleCreateEvent}
            className="mt-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="AI Hackathon 2026"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-300">
                  Description
                </label>
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={aiLoading}
                  className="text-xs px-3 py-1 rounded-lg border border-white/20 hover:bg-white/10"
                >
                  {aiLoading ? "Generating..." : "Generate with AI"}
                </button>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Event Start Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Event End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold
                         bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                         text-black hover:brightness-110"
            >
              {loading ? "Creating Event..." : "Create Event & Setup Roles"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}





