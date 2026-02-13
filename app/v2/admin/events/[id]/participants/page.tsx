
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
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

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
      <p className="text-center mt-20 text-gray-600">
        Loading participants…
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Attendance Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Event: <span className="font-semibold">{eventTitle}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {participants.length === 0 ? (
        <p className="text-gray-600">
          No students have participated yet.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white/80 backdrop-blur border rounded-3xl shadow-lg">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Student
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Attendance
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Registered At
                </th>
              </tr>
            </thead>

            <tbody>
              {participants.map((p) => (
                <tr
                  key={p._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {p.student.name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {p.student.email}
                  </td>

                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
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
                        className="px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="registered">Registered</option>
                        <option value="attended">Attended</option>
                        <option value="absent">Absent</option>
                      </select>

                      {p.status === "attended" && (
                        <span className="text-green-600 text-xl font-bold">
                          ✔
                        </span>
                      )}

                      {p.status === "absent" && (
                        <span className="text-red-500 text-xl font-bold">
                          ✖
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(p.participatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}