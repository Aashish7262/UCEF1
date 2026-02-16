"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VerifyCertificatePage() {
  const params = useParams<{ certificate: string }>();
const certificateId = params.certificate;


  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const res = await fetch(`/api/certificates/verify/${certificateId}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    };

    verify();
  }, [certificateId]);

  if (loading) return <p className="text-center mt-24">Verifying...</p>;

  if (!data.valid) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center text-3xl font-bold">
        ❌ INVALID OR REVOKED CERTIFICATE
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-green-400 mb-6">
        ✅ Certificate Verified
      </h1>
      <p className="text-xl">Name: {data.student}</p>
      <p className="text-xl">Event: {data.event}</p>
      <p className="text-xl">Role: {data.role}</p>
      <p className="text-gray-400 mt-4">
        Issued At: {new Date(data.issuedAt).toLocaleString()}
      </p>
    </div>
  );
}
