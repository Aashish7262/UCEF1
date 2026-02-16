"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const studentId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  useEffect(() => {
    if (!videoRef.current) return;

    const startScanner = async () => {
      try {
        const videoElement = videoRef.current!;

        const scanner = new QrScanner(
          videoElement,
          async (decodedText) => {
            if (loading) return;

            try {
              setLoading(true);
              setError("");
              setResult("");

              let parsed;
              try {
                parsed = JSON.parse(decodedText.data);
              } catch {
                throw new Error("Invalid QR Code format");
              }

              const eventId = parsed.eventId;

              if (!eventId) {
                throw new Error("Invalid QR: Missing eventId");
              }

              if (!studentId) {
                throw new Error("You must be logged in");
              }

              const res = await fetch("/api/attendance/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  eventId,
                  studentId,
                }),
              });

              const data = await res.json();

              if (!res.ok) {
                throw new Error(data.message || "Scan failed");
              }

              setResult("✅ Attendance marked successfully!");
              scanner.stop();
              setScanning(false);
            } catch (err: any) {
              setError(err.message || "Scan error");
            } finally {
              setLoading(false);
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        await scanner.start();
        scannerRef.current = scanner;
        setScanning(true);
      } catch (err: any) {
        console.error("Scanner Error:", err);
        setError(
          "Camera access denied or not supported. Please allow camera permission."
        );
      }
    };

    startScanner();

    return () => {
      scannerRef.current?.stop();
    };
  }, [studentId]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      <h1
        className="text-3xl sm:text-4xl font-extrabold mb-8
        bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
        bg-clip-text text-transparent"
      >
        Scan QR for Attendance
      </h1>

      {/* CAMERA BOX */}
      <div className="w-full max-w-md rounded-3xl p-[2px]
                      bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-4">
          <video
            ref={videoRef}
            className="w-full rounded-2xl border border-white/10"
            playsInline
            muted
          />
        </div>
      </div>

      {/* STATUS UI */}
      <div className="mt-8 text-center">
        {scanning && !loading && (
          <p className="text-blue-400 text-lg animate-pulse">
            📷 Camera Active — Scan the QR Code
          </p>
        )}

        {loading && (
          <p className="text-yellow-400 text-lg animate-pulse">
            ⏳ Marking attendance...
          </p>
        )}

        {result && (
          <div className="mt-4 px-6 py-3 rounded-xl
                          bg-green-500/20 text-green-300 font-semibold">
            {result}
          </div>
        )}

        {error && (
          <div className="mt-4 px-6 py-3 rounded-xl
                          bg-red-500/20 text-red-300 font-semibold">
            ❌ {error}
          </div>
        )}
      </div>

      <p className="mt-10 text-sm text-gray-400 text-center max-w-md">
        Note: QR will only work when the organizer releases it and
        your role is approved for the event.
      </p>
    </main>
  );
}
