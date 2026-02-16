"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Application {
  _id: string; // 🔥 THIS IS assignmentId
  role: string;
  status: "pending" | "approved" | "rejected";
  student: {
    _id: string;
    name: string;
    email: string;
  };
  roleSlot: {
    _id: string;
    role: string;
    startTime: string;
    endTime: string;
    maxSeats: number;
  };
}

export default function AdminApplicationsPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const adminId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  /* ================= FETCH ALL APPLICATIONS ================= */
  const fetchApplications = async () => {
    if (!eventId || !adminId) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `/api/admin/roles/applications?eventId=${eventId}&adminId=${adminId}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch applications");
      }

      setApplications(data.applications || []);
    } catch (err: any) {
      console.error("Fetch Applications Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [eventId, adminId]);

  /* ================= APPROVE ================= */
  const approveApplication = async (assignmentId: string) => {
    if (!adminId) return;

    try {
      const res = await fetch("/api/admin/roles/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId, // 🔥 CRITICAL
          adminId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to approve");
        return;
      }

      // 🔥 Instant UI update (no refresh)
      setApplications((prev) =>
        prev.map((app) =>
          app._id === assignmentId
            ? { ...app, status: "approved" }
            : app
        )
      );
    } catch (error) {
      console.error("Approve Error:", error);
      alert("Error approving application");
    }
  };

  /* ================= REJECT ================= */
  const rejectApplication = async (assignmentId: string) => {
    if (!adminId) return;

    try {
      const res = await fetch("/api/admin/roles/reject", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId, // 🔥 CRITICAL
          adminId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to reject");
        return;
      }

      // 🔥 Instant UI update
      setApplications((prev) =>
        prev.map((app) =>
          app._id === assignmentId
            ? { ...app, status: "rejected" }
            : app
        )
      );
    } catch (error) {
      console.error("Reject Error:", error);
      alert("Error rejecting application");
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-24 text-white/70">
        Loading applications…
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
        Role Applications Dashboard
      </h1>

      {error && (
        <p className="text-red-400 mb-6">{error}</p>
      )}

      {applications.length === 0 ? (
        <p className="text-gray-400">
          No applications submitted yet.
        </p>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <div
              key={app._id}
              className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
            >
              {/* Student Info */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  {app.student.name}
                </h2>
                <p className="text-gray-400 text-sm">
                  {app.student.email}
                </p>
              </div>

              {/* Role Info */}
              <div className="mb-4">
                <p className="text-lg capitalize font-medium">
                  Role: {app.role}
                </p>
                <p className="text-gray-400 text-sm">
                  ⏰{" "}
                  {new Date(
                    app.roleSlot.startTime
                  ).toLocaleString()}{" "}
                  —{" "}
                  {new Date(
                    app.roleSlot.endTime
                  ).toLocaleString()}
                </p>
              </div>

              {/* Status + Actions */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* STATUS BADGE */}
                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                    app.status === "approved"
                      ? "bg-green-500/20 text-green-300"
                      : app.status === "rejected"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-yellow-500/20 text-yellow-300"
                  }`}
                >
                  {app.status.toUpperCase()}
                </span>

                {/* ACTION BUTTONS ONLY IF PENDING */}
                {app.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        approveApplication(app._id)
                      }
                      className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 transition font-semibold"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        rejectApplication(app._id)
                      }
                      className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition font-semibold"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}