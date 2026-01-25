"use client";

import { useState } from "react";

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
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
      setTimeout(() => {
        window.location.href = "/events";
      }, 900);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur border rounded-3xl shadow-2xl p-10">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Event
          </h1>
          <p className="mt-3 text-gray-600">
            Launch your next hackathon or technical event 🚀
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 text-center">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleCreateEvent} className="mt-8 space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="AI Hackathon 2026"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ Description (AI button added, nothing else changed) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>

              <button
                type="button"
                onClick={generateDescription}
                disabled={aiLoading}
                className="text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
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
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              After this date, the event will automatically expire
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition disabled:opacity-60 shadow-lg"
          >
            {loading ? "Creating event..." : "Create Event"}
          </button>
        </form>

        {/* Footer Hint */}
        <p className="mt-6 text-xs text-center text-gray-500">
          Events are created as <span className="font-semibold">Draft</span> and can be made live later.
        </p>
      </div>
    </div>
  );
}

