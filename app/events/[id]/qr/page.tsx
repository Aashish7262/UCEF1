"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "react-qr-code";

interface EventType {
  _id: string;
  title: string;
  endDate: string;
  qrEnabled: boolean;
  status: "draft" | "live" | "completed";
}

export default function AdminQRPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  const fetchEvent = async () => {
    const res = await fetch(`/api/events/${eventId}`);
    const data = await res.json();
    setEvent(data.event || data);
  };

  useEffect(() => {
    if (!eventId) return;
    fetchEvent().finally(() => setLoading(false));
  }, [eventId]);

  const toggleQR = async (enable: boolean) => {
    if (!userId) return;

    setToggling(true);
    try {
      const res = await fetch(`/api/events/${eventId}/qr`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          qrEnabled: enable,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setEvent(data.event);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading || !event) {
    return <p className="text-center mt-24 text-white">Loading QR Panel...</p>;
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16 text-center">
      <h1 className="text-4xl font-extrabold mb-4">
        QR Attendance Control
      </h1>

      <p className="text-gray-400 mb-6">
        Event: {event.title}
      </p>

      <div className="mb-8">
        <span
          className={`px-4 py-2 rounded-xl font-semibold ${
            event.qrEnabled
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          QR Status: {event.qrEnabled ? "LIVE" : "DISABLED"}
        </span>
      </div>

      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => toggleQR(true)}
          disabled={toggling || event.qrEnabled}
          className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600"
        >
          Release QR
        </button>

        <button
          onClick={() => toggleQR(false)}
          disabled={toggling || !event.qrEnabled}
          className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600"
        >
          Disable QR
        </button>
      </div>

      {event.qrEnabled && (
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-6 rounded-2xl">
            <QRCode
              value={JSON.stringify({ eventId })}
              size={240}
            />
          </div>
          <p className="text-gray-400 text-sm">
            Students can scan this QR to mark attendance
          </p>
        </div>
      )}
    </main>
  );
}
