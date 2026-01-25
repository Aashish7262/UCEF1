"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Certificate {
  _id: string;
  issuedAt: string;
  student: {
    name: string;
    email: string;
  };
  event: {
    title: string;
    eventDate: string;
  };
}

export default function CertificatePage() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 
  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCertificate = async () => {
      try {
        const res = await fetch(`/api/certificates/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);
        setCertificate(data.certificate);
      } catch (err: any) {
        setError(err.message || "Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  
  const generateAchievementMessage = async () => {
    if (!certificate) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-achievement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: certificate.student.name,
          eventName: certificate.event.title,
        }),
      });

      const data = await res.json();
      setAiMessage(data.message || "");
    } catch (err) {
      console.error("Failed to generate AI achievement message", err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-20 text-lg">Loading certificate…</p>;
  }

  if (error || !certificate) {
    return (
      <p className="text-center mt-20 text-red-600 text-lg">
        {error || "Certificate not found"}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f172a] via-[#020617] to-black flex flex-col items-center px-6 py-14 print:bg-white">

      
      <div className="w-full max-w-5xl mb-10 p-6 rounded-2xl bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            🎁 Your AI Achievement Message
          </h3>

          <button
            type="button"
            onClick={generateAchievementMessage}
            disabled={aiLoading}
            className="text-xs px-4 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {aiLoading ? "Generating..." : "Generate"}
          </button>
        </div>

        {aiMessage ? (
          <p className="text-gray-700 italic leading-relaxed">
            {aiMessage}
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Click generate to receive your personalized achievement message ✨
          </p>
        )}
      </div>

      {/* CERTIFICATE */}
      <div
        id="certificate"
        className="relative w-full max-w-5xl bg-white rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.4)] p-14 print:shadow-none print:border print:border-gray-300"
      >
        {/* Gold Border */}
        <div className="absolute inset-0 rounded-[28px] border-[10px] border-yellow-400 pointer-events-none" />

        {/* Decorative corners */}
        <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl" />
        <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-yellow-400 rounded-br-xl" />

        {/* Header */}
        <div className="text-center">
          <p className="uppercase tracking-[0.3em] text-sm text-gray-500">
            HackathonHub
          </p>

          <h1 className="mt-4 text-5xl font-extrabold text-gray-900 tracking-wide">
            Certificate of Participation
          </h1>

          <div className="mt-6 h-[2px] w-32 bg-yellow-400 mx-auto" />
        </div>

        {/* Body */}
        <div className="mt-14 text-center">
          <p className="text-lg text-gray-600">
            This certificate is proudly presented to
          </p>

          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            {certificate.student.name}
          </h2>

          <p className="mt-8 text-lg text-gray-600">
            for successfully participating in
          </p>

          <h3 className="mt-3 text-3xl font-semibold text-indigo-700">
            {certificate.event.title}
          </h3>

          <p className="mt-3 text-gray-500">
            Held on{" "}
            <span className="font-medium">
              {new Date(certificate.event.eventDate).toDateString()}
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 flex justify-between items-end">
          <div className="text-left">
            <p className="text-sm text-gray-500">Issued On</p>
            <p className="font-medium text-gray-800">
              {new Date(certificate.issuedAt).toDateString()}
            </p>
          </div>

          <div className="text-center">
            <div className="h-[2px] w-48 bg-gray-800 mb-2" />
            <p className="font-semibold text-gray-800">
              Authorized Signature
            </p>
          </div>

          <div className="text-right text-xs text-gray-400">
            <p>Certificate ID</p>
            <p className="font-mono">{certificate._id}</p>
          </div>
        </div>

        {/* Download */}
        <div className="mt-16 flex justify-center print:hidden">
          <button
            onClick={() => window.print()}
            className="px-10 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl text-lg font-semibold hover:scale-105 transition shadow-lg"
          >
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}




