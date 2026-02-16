"use client";

import { useParams, useRouter } from "next/navigation";
import RulesForm from "@/components/v2/RulesForm";

export default function EventRulesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-extrabold mb-6">
          Step 3: Add Event Rules
        </h1>

        <p className="text-gray-400 mb-8">
          Define rules that participants, volunteers, and judges must follow.
        </p>

        <div className="bg-black/60 border border-white/20 rounded-2xl p-6">
          <RulesForm eventId={eventId} />
        </div>

        <button
          onClick={() => router.push("/events")}
          className="mt-8 w-full py-3 rounded-xl font-semibold
                     bg-gradient-to-r from-purple-500 to-pink-500 text-black"
        >
          Finish Setup & Go to Events
        </button>
      </div>
    </main>
  );
}
