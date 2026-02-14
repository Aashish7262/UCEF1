"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Hackathon {
  _id: string;
  title: string;
  description: string;
  paymentRequired?: boolean;
  entryFee?: number;
}

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  /* ===== FETCH HACKATHON DETAILS ===== */
  useEffect(() => {
    if (!id) return;

    const fetchHackathon = async () => {
      try {
        const res = await fetch(`/api/hackathons/${id}`);
        const data = await res.json();
        setHackathon(data.hackathon);
      } catch (error) {
        console.error("Failed to fetch hackathon");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [id]);

  /* ===== LOAD RAZORPAY SCRIPT ===== */
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!userId || !hackathon?._id) {
      alert("User not found");
      return;
    }

    const sdkLoaded = await loadRazorpayScript();

    if (!sdkLoaded) {
      alert("Failed to load Razorpay SDK");
      return;
    }

    try {
      /* ===== CREATE ORDER FROM BACKEND ===== */
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hackathonId: hackathon._id,
          userId,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.message || "Failed to create payment order");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: hackathon.title,
        description: "Hackathon Entry Fee",
        order_id: orderData.orderId,

        /* ===== PAYMENT SUCCESS HANDLER (CRITICAL FIX) ===== */
        handler: async function () {
          try {
            // STEP 1: Get stored draft submission
            const pendingSubmission = localStorage.getItem(
              "pendingSubmission"
            );

            if (!pendingSubmission) {
              alert("No submission data found!");
              router.push(`/hackathons/${hackathon._id}`);
              return;
            }

            const submissionData = JSON.parse(pendingSubmission);

            // STEP 2: Final submit to backend AFTER payment
            const submitRes = await fetch(
              "/api/submissions/submit",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(submissionData),
              }
            );

            const submitData = await submitRes.json();

            if (!submitRes.ok) {
              alert(
                submitData.message ||
                  "Submission failed after payment"
              );
              return;
            }

            // STEP 3: Mark submission flag (for Thank You UI)
            localStorage.setItem(
              `submitted_${submissionData.hackathonId}`,
              "true"
            );

            // STEP 4: Cleanup draft
            localStorage.removeItem("pendingSubmission");

            alert(
              "🎉 Payment Successful & Submission Completed!"
            );

            // STEP 5: Proper Next.js navigation (NOT window.location)
            router.push(
              `/hackathons/${submissionData.hackathonId}`
            );
            router.refresh();
          } catch (error) {
            console.error(
              "Post-payment submission error:",
              error
            );
            alert(
              "Payment done but submission failed. Contact admin."
            );
          }
        },

        theme: {
          color: "#8B5CF6",
        },
      };

      const paymentObject = new (window as any).Razorpay(
        options
      );
      paymentObject.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("Something went wrong while initiating payment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white">
        Loading Payment Page...
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-red-400">
        Hackathon not found
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#020617] text-white px-6 py-20">
      <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl">

        <h1 className="text-4xl font-bold mb-6 text-center">
          💳 Hackathon Payment
        </h1>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            {hackathon.title}
          </h2>

          <p className="text-white/60 mb-4">
            {hackathon.description}
          </p>

          <div className="text-lg font-semibold text-purple-400">
            Entry Fee: ₹{hackathon.entryFee || 0}
          </div>
        </div>

        <button
          onClick={handlePayment}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-black font-bold text-lg hover:scale-105 transition"
        >
          Pay & Complete Submission
        </button>

        <button
          onClick={() => router.push(`/hackathons/${id}`)}
          className="w-full mt-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
        >
          Cancel & Go Back
        </button>
      </div>
    </main>
  );
}

