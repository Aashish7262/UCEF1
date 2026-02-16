"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Certificate {
  _id: string;
  certificateId: string;
  role: string;
  isRevoked: boolean;
  createdAt: string;
  student: {
    name: string;
    email: string;
  };
  event: {
    title: string;
  };
}

export default function AdminCertificatesPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const adminId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  /* ================= FETCH CERTIFICATES ================= */
  const fetchCertificates = async () => {
    if (!eventId || !adminId) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `/api/certificates?eventId=${eventId}&adminId=${adminId}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch certificates");
      }

      setCertificates(data.certificates || []);
    } catch (err: any) {
      console.error("Fetch Certificates Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [eventId, adminId]);

  /* ================= REVOKE CERTIFICATE ================= */
  const revokeCertificate = async (certificateId: string) => {
    if (!certificateId) return;

    const confirmRevoke = confirm(
      "Are you sure you want to revoke this certificate?\nThis action cannot be undone."
    );

    if (!confirmRevoke) return;

    try {
      setRevokingId(certificateId);

      const res = await fetch("/api/certificates/revoke", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to revoke certificate");
        return;
      }

      // 🔥 Instant UI update (no refresh needed)
      setCertificates((prev) =>
        prev.map((cert) =>
          cert.certificateId === certificateId
            ? { ...cert, isRevoked: true }
            : cert
        )
      );

      alert("🚫 Certificate revoked successfully!");
    } catch (error) {
      console.error("Revoke Error:", error);
      alert("Error revoking certificate");
    } finally {
      setRevokingId(null);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <p className="text-center mt-24 text-white/70">
        Loading certificates…
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
        🎓 Issued Certificates Dashboard
      </h1>

      {error && (
        <p className="text-red-400 mb-6">{error}</p>
      )}

      {certificates.length === 0 ? (
        <p className="text-gray-400">
          No certificates issued yet for this event.
        </p>
      ) : (
        <div className="grid gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
            >
              {/* Student Info */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  {cert.student?.name}
                </h2>
                <p className="text-gray-400 text-sm">
                  {cert.student?.email}
                </p>
              </div>

              {/* Certificate Details */}
              <div className="mb-4 space-y-1">
                <p className="text-lg font-medium capitalize">
                  Role: {cert.role}
                </p>
                <p className="text-gray-400 text-sm">
                  Certificate ID: {cert.certificateId}
                </p>
                <p className="text-gray-500 text-sm">
                  Issued:{" "}
                  {new Date(cert.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Status + Actions */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* STATUS BADGE */}
                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                    cert.isRevoked
                      ? "bg-red-500/20 text-red-300"
                      : "bg-green-500/20 text-green-300"
                  }`}
                >
                  {cert.isRevoked ? "REVOKED" : "VALID"}
                </span>

                {/* REVOKE BUTTON */}
                {!cert.isRevoked && (
                  <button
                    onClick={() =>
                      revokeCertificate(cert.certificateId)
                    }
                    disabled={revokingId === cert.certificateId}
                    className="px-4 py-2 rounded-xl
                               bg-red-500 hover:bg-red-600
                               transition font-semibold
                               disabled:opacity-50"
                  >
                    {revokingId === cert.certificateId
                      ? "Revoking..."
                      : "Revoke Certificate"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
