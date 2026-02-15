"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RulesForm from "@/components/v2/RulesForm";

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [aiLoading, setAiLoading] = useState(false);

  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

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
    setMessage("");

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
        setLoading(false);
        return;
      }

      setMessage("🎉 Event created successfully (Draft)");
      setCreatedEventId(data.event._id);

      setTitle("");
      setDescription("");
      setEventDate("");
      setEndDate("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-start sm:items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
      {/* background aura (responsive scaled) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-purple-600/20 blur-[120px] md:blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-blue-600/20 blur-[120px] md:blur-[200px]" />
      </div>

      <div
        className="relative w-full max-w-xl rounded-3xl p-[1px] sm:p-[2px]
                   bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
      >
        <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="text-center">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold
                         bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                         bg-clip-text text-transparent"
            >
              {createdEventId ? "Add Rules" : "Create New Event"}
            </h1>

            {!createdEventId && (
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-400">
                Launch your next hackathon or technical event 🚀
              </p>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mt-5 sm:mt-6 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          {message && !createdEventId && (
            <div className="mt-5 sm:mt-6 bg-green-500/10 border border-green-500/30 text-green-300 text-sm rounded-xl px-4 py-3 text-center">
              {message}
            </div>
          )}

          {/* EVENT FORM */}
          {!createdEventId && (
            <>
              <form
                onSubmit={handleCreateEvent}
                className="mt-6 sm:mt-8 space-y-5 sm:space-y-6"
              >
                {/* Title */}
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
                    className="w-full px-4 py-3 rounded-xl
                               text-sm sm:text-base
                               bg-black/60 border border-white/20
                               focus:outline-none focus:border-purple-400
                               focus:ring-2 focus:ring-purple-500/30
                               transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1 gap-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Description
                    </label>

                    <button
                      type="button"
                      onClick={generateDescription}
                      disabled={aiLoading}
                      className="text-xs px-3 py-1 rounded-lg
                                 border border-white/20
                                 hover:border-white hover:bg-white/10
                                 disabled:opacity-50 transition whitespace-nowrap"
                    >
                      {aiLoading ? "Generating..." : "Generate with AI"}
                    </button>
                  </div>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe the purpose, rules, and goals of the event"
                    className="w-full px-4 py-3 rounded-xl
                               text-sm sm:text-base
                               bg-black/60 border border-white/20
                               focus:outline-none focus:border-purple-400
                               focus:ring-2 focus:ring-purple-500/30
                               resize-none transition"
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl
                               text-sm sm:text-base
                               bg-black/60 border border-white/20
                               focus:outline-none focus:border-blue-400
                               focus:ring-2 focus:ring-blue-500/30
                               transition"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Event End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl
                               text-sm sm:text-base
                               bg-black/60 border border-white/20
                               focus:outline-none focus:border-purple-400
                               focus:ring-2 focus:ring-purple-500/30
                               transition"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    After this date, the event will automatically expire
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold
                             text-sm sm:text-base
                             bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                             text-black hover:brightness-110
                             transition-all duration-300
                             disabled:opacity-60"
                >
                  {loading ? "Creating event..." : "Create Event"}
                </button>
              </form>

              <p className="mt-5 sm:mt-6 text-xs text-center text-gray-500">
                Events are created as{" "}
                <span className="font-semibold">Draft</span> and can be made live
                later.
              </p>
            </>
          )}

          {/* RULES FORM + FINAL SUBMIT */}
          {createdEventId && (
            <div className="mt-8 sm:mt-10">
              <p className="text-center text-gray-400 mb-5 sm:mb-6 text-sm sm:text-base">
                Add rules that participants must follow
              </p>

              <RulesForm eventId={createdEventId} />

              <button
                onClick={() => router.push("/events")}
                className="mt-6 sm:mt-8 w-full py-3 rounded-xl font-semibold
                           text-sm sm:text-base
                           bg-gradient-to-r from-green-500 to-blue-500
                           text-black hover:brightness-110
                           transition-all duration-300"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





