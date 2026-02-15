"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Participant {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  status: "registered" | "attended" | "absent";
  participatedAt: string;
}

export default function AdminParticipantsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (!userId || role !== "admin") {
      router.push("/login");
      return;
    }

    fetchParticipants(userId);
  }, []);

  const fetchParticipants = async (userId: string) => {
    try {
      const res = await fetch(
        `/api/events/${eventId}/participants?userId=${userId}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch participants");
        return;
      }

      setParticipants(data.participants || []);
      setEventTitle(data.event?.title || "");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (
    participationId: string,
    newStatus: "registered" | "attended" | "absent"
  ) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await fetch(
        `/api/participation/${participationId}/attendance`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, status: newStatus }),
        }
      );

      if (!res.ok) {
        alert("Failed to update attendance");
        return;
      }

      setParticipants((prev) =>
        prev.map((p) =>
          p._id === participationId ? { ...p, status: newStatus } : p
        )
      );
    } catch {
      alert("Something went wrong");
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-24 text-white/70">
        Loading participants…
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16">
      {/* background aura (responsive scaled) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-purple-600/20 blur-[120px] md:blur-[200px]" />
        <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-blue-600/20 blur-[120px] md:blur-[200px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold
                         bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                         bg-clip-text text-transparent"
          >
            Attendance Dashboard
          </h1>

          <p className="mt-2 text-sm sm:text-base text-gray-400">
            Event:{" "}
            <span className="font-semibold text-white break-words">
              {eventTitle}
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-6 sm:mb-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm sm:text-base">
            {error}
          </div>
        )}

        {participants.length === 0 ? (
          <p className="text-gray-400 text-sm sm:text-base">
            No students have participated yet.
          </p>
        ) : (
          <div
            className="relative rounded-2xl sm:rounded-3xl p-[1px] sm:p-[2px]
                          bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
          >
            <div className="rounded-2xl sm:rounded-3xl bg-black/70 backdrop-blur-xl overflow-x-auto">
              <table className="w-full min-w-[600px] sm:min-w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-300">
                      Student
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-300">
                      Email
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-300">
                      Attendance
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-300">
                      Registered At
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {participants.map((p) => (
                    <tr
                      key={p._id}
                      className="border-t border-white/10
                                 hover:bg-white/5 transition"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base">
                        {p.student.name}
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-400 text-sm break-words">
                        {p.student.email}
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <select
                            value={p.status}
                            onChange={(e) =>
                              updateAttendance(
                                p._id,
                                e.target.value as
                                  | "registered"
                                  | "attended"
                                  | "absent"
                              )
                            }
                            className="px-3 py-2 rounded-xl
                                       text-xs sm:text-sm
                                       bg-black/60 border border-white/20
                                       text-white
                                       focus:outline-none focus:border-purple-400
                                       focus:ring-2 focus:ring-purple-500/30
                                       transition"
                          >
                            <option value="registered">Registered</option>
                            <option value="attended">Attended</option>
                            <option value="absent">Absent</option>
                          </select>

                          {p.status === "attended" && (
                            <span className="text-green-400 text-lg sm:text-xl font-bold">
                              ✔
                            </span>
                          )}

                          {p.status === "absent" && (
                            <span className="text-red-400 text-lg sm:text-xl font-bold">
                              ✖
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                        {new Date(p.participatedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


