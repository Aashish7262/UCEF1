"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface RoleSlot {
  _id: string;
  role: "participant" | "volunteer" | "judge" | "speaker";
  startTime: string;
  endTime: string;
  maxSeats: number;
}

interface Application {
  _id: string;
  roleSlot: string | { _id: string };
  role: string;
  status: "pending" | "approved" | "rejected";
}

export default function StudentRolesPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [roleSlots, setRoleSlots] = useState<RoleSlot[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  /* 🔥 Handles both string ID and populated object */
  const getRoleSlotId = (roleSlot: string | { _id: string }) => {
    if (!roleSlot) return "";
    if (typeof roleSlot === "string") return roleSlot;
    return roleSlot._id;
  };

  /* ================= FETCH ROLE SLOTS + APPLICATIONS ================= */
  const fetchAllData = async () => {
    if (!eventId || !studentId) return;

    try {
      setLoading(true);
      setError("");

      // 1️⃣ Fetch role slots
      const slotsRes = await fetch(
        `/api/events/${eventId}/roleslots`
      );
      const slotsData = await slotsRes.json();

      if (!slotsRes.ok) {
        throw new Error(slotsData.message || "Failed to load roles");
      }

      // Your API returns { slots }
      setRoleSlots(slotsData.slots || []);

      // 2️⃣ Fetch student applications (🔥 SOURCE OF TRUTH)
      const appRes = await fetch(
        `/api/roles/my-applications?eventId=${eventId}&studentId=${studentId}`
      );
      const appData = await appRes.json();

      if (!appRes.ok) {
        throw new Error(appData.message || "Failed to load applications");
      }

      // 🔥 CRITICAL FIX: your API returns "assignments" NOT "applications"
      setApplications(appData.assignments || []);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [eventId, studentId]);

  /* ================= APPLY FOR ROLE ================= */
  const applyForRole = async (roleSlotId: string) => {
    if (!studentId) {
      alert("Please login first");
      return;
    }

    // Prevent duplicate apply instantly
    const alreadyApplied = applications.some(
      (app) => getRoleSlotId(app.roleSlot) === roleSlotId
    );

    if (alreadyApplied) {
      alert("You already applied to this role");
      return;
    }

    try {
      const res = await fetch("/api/roles/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          roleSlotId,
          studentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to apply");
        return;
      }

      alert("Application submitted for approval");

      // 🔥 Always refetch from DB so status persists after refresh
      await fetchAllData();
    } catch (error) {
      console.error("Apply Error:", error);
      alert("Something went wrong while applying");
    }
  };

  /* 🔥 Matching logic (works with populated roleSlot) */
  const getApplicationForSlot = (slotId: string) => {
    return applications.find(
      (app) => getRoleSlotId(app.roleSlot) === slotId
    );
  };

  if (loading) {
    return (
      <p className="text-center mt-24 text-white/70">
        Loading role slots…
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <h1
        className="text-4xl font-extrabold mb-10
                   bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                   bg-clip-text text-transparent"
      >
        Apply for Event Roles
      </h1>

      {error && (
        <p className="text-red-400 mb-6">{error}</p>
      )}

      {roleSlots.length === 0 ? (
        <p className="text-gray-400">
          No roles have been defined by the organizer yet.
        </p>
      ) : (
        <div className="grid gap-6">
          {roleSlots.map((slot) => {
            const application = getApplicationForSlot(slot._id);

            return (
              <div
                key={slot._id}
                className="p-6 rounded-2xl border border-white/10 bg-white/5"
              >
                <h2 className="text-xl font-semibold capitalize">
                  {slot.role}
                </h2>

                <p className="text-gray-400 mt-2">
                  ⏰ {new Date(slot.startTime).toLocaleString()} —{" "}
                  {new Date(slot.endTime).toLocaleString()}
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  Seats:{" "}
                  {slot.maxSeats === 0 ? "Unlimited" : slot.maxSeats}
                </p>

                <div className="mt-4">
                  {application ? (
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                        application.status === "approved"
                          ? "bg-green-500/20 text-green-300"
                          : application.status === "rejected"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      Status: {application.status.toUpperCase()}
                    </span>
                  ) : (
                    <button
                      onClick={() => applyForRole(slot._id)}
                      className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition"
                    >
                      Apply for this Role
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}



