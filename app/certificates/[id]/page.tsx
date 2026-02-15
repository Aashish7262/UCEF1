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
    return (
      <p className="text-center mt-24 text-white/70 text-sm sm:text-base px-4">
        Loading certificate…
      </p>
    );
  }

  if (error || !certificate) {
    return (
      <p className="text-center mt-24 text-red-400 text-base sm:text-lg px-4">
        {error || "Certificate not found"}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 sm:px-6 py-10 sm:py-16 overflow-hidden print:bg-white">

      {/* background aura */}
      <div className="pointer-events-none fixed inset-0 print:hidden overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-purple-600/20 blur-[120px] md:blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-blue-600/20 blur-[120px] md:blur-[200px]" />
      </div>

      {/* AI MESSAGE CARD */}
      <div className="relative w-full max-w-5xl mb-8 sm:mb-12 rounded-3xl p-[2px]
                      bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 print:hidden">

        <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-4 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              🎁 Your AI Achievement Message
            </h3>

            <button
              type="button"
              onClick={generateAchievementMessage}
              disabled={aiLoading}
              className="text-xs px-4 py-1.5 rounded-lg
                         border border-white/20
                         hover:border-white hover:bg-white/10
                         disabled:opacity-50 transition w-full sm:w-auto text-center"
            >
              {aiLoading ? "Generating..." : "Generate"}
            </button>
          </div>

          {aiMessage ? (
            <p className="text-gray-300 italic leading-relaxed text-sm sm:text-base">
              {aiMessage}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-gray-400">
              Click generate to receive your personalized achievement message ✨
            </p>
          )}
        </div>
      </div>

      {/* CERTIFICATE */}
      <div
        id="certificate"
        className="relative w-full max-w-5xl bg-white rounded-[28px]
                   shadow-[0_30px_80px_rgba(0,0,0,0.5)]
                   p-6 sm:p-10 md:p-14 print:shadow-none print:border print:border-gray-300"
      >

        {/* Premium Gold Border */}
        <div className="absolute inset-0 rounded-[28px] border-[10px] border-yellow-400 pointer-events-none" />

        {/* Decorative corners */}
        <div className="absolute top-6 left-6 w-8 h-8 sm:w-12 sm:h-12 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl" />
        <div className="absolute top-6 right-6 w-8 h-8 sm:w-12 sm:h-12 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl" />
        <div className="absolute bottom-6 left-6 w-8 h-8 sm:w-12 sm:h-12 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl" />
        <div className="absolute bottom-6 right-6 w-8 h-8 sm:w-12 sm:h-12 border-b-4 border-r-4 border-yellow-400 rounded-br-xl" />

        {/* Header */}
        <div className="text-center">
          <p className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm text-gray-500">
            HackathonHub
          </p>

          <h1 className="mt-4 text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-wide">
            Certificate of Participation
          </h1>

          <div className="mt-6 h-[2px] w-24 sm:w-32 bg-yellow-400 mx-auto" />
        </div>

        {/* Body */}
        <div className="mt-10 sm:mt-14 text-center">
          <p className="text-base sm:text-lg text-gray-600">
            This certificate is proudly presented to
          </p>

          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 break-words">
            {certificate.student.name}
          </h2>

          <p className="mt-6 sm:mt-8 text-base sm:text-lg text-gray-600">
            for successfully participating in
          </p>

          <h3 className="mt-3 text-xl sm:text-2xl md:text-3xl font-semibold text-indigo-700 break-words">
            {certificate.event.title}
          </h3>

          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Held on{" "}
            <span className="font-medium">
              {new Date(certificate.event.eventDate).toDateString()}
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-8">
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm text-gray-500">Issued On</p>
            <p className="font-medium text-gray-800 text-sm sm:text-base">
              {new Date(certificate.issuedAt).toDateString()}
            </p>
          </div>

          <div className="text-center">
            <div className="h-[2px] w-32 sm:w-48 bg-gray-800 mb-2 mx-auto" />
            <p className="font-semibold text-gray-800 text-sm sm:text-base">
              Authorized Signature
            </p>
          </div>

          <div className="text-center sm:text-right text-[10px] sm:text-xs text-gray-400 break-all">
            <p>Certificate ID</p>
            <p className="font-mono">{certificate._id}</p>
          </div>
        </div>

        {/* Download */}
        <div className="mt-12 sm:mt-16 flex justify-center print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 sm:px-10 py-3 rounded-xl text-base sm:text-lg font-semibold
                       bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500
                       text-black hover:brightness-110
                       transition-all duration-300 shadow-lg"
          >
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}




