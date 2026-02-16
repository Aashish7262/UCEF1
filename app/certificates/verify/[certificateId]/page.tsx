"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface CertificateData {
  certificateId: string;
  role: string;
  studentName: string;
  eventTitle: string;
  email?: string;
}

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateId = params?.certificateId as string;

  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!certificateId) return;

    const verifyCertificate = async () => {
      try {
        console.log("🔍 Verifying Certificate:", certificateId);

        const res = await fetch(
          `/api/certificates/verify/${certificateId}`
        );

        const data = await res.json();
        console.log("📦 API Response:", data);

        if (!res.ok || !data.valid) {
          setError(data.message || "Certificate not found");
          return;
        }

        // 🔥 IMPORTANT: Your API returns { certificate: {...} }
        setCertificate(data.certificate);
      } catch (err) {
        console.error("Verification Error:", err);
        setError("Failed to verify certificate");
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h1 className="text-2xl">🔎 Verifying Certificate...</h1>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-400">
        <h1 className="text-4xl font-bold">❌ Verification Failed</h1>
        <p className="mt-4 text-lg">
          {error || "Certificate not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <h1 className="text-4xl font-bold text-green-400">
        ✅ Certificate Verified
      </h1>

      <div className="mt-10 p-8 rounded-2xl bg-white/5 border border-white/10 text-center shadow-xl">
        <p className="text-xl mb-2">
          <strong>Certificate ID:</strong> {certificate.certificateId}
        </p>

        <p className="text-xl mb-2">
          <strong>Student:</strong> {certificate.studentName}
        </p>

        <p className="text-xl mb-2">
          <strong>Event:</strong> {certificate.eventTitle}
        </p>

        <p className="text-xl">
          <strong>Role:</strong> {certificate.role}
        </p>
      </div>
    </div>
  );
}
