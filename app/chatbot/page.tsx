"use client";

import { useEffect, useState } from "react";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

interface Participation {
  event: string;
  status: "registered" | "attended";
  certificate?: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "👋 Hi! I’m your HackathonHub assistant. Ask me about your profile, certificates, or events."
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [certificateCount, setCertificateCount] = useState(0);

  useEffect(() => {
    const u = localStorage.getItem("userId");
    setUserId(u);

    if (!u) return;

    const loadProfileData = async () => {
      const partRes = await fetch(`/api/participation?studentId=${u}`);
      const partData = await partRes.json();
      setParticipations(partData.participations || []);

      const certRes = await fetch(`/api/certificates/student?studentId=${u}`);
      const certData = await certRes.json();
      setCertificateCount(
        Array.isArray(certData.certificates)
          ? certData.certificates.length
          : 0
      );
    };

    loadProfileData();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const attendedEvents = participations.filter(p => p.status === "attended");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          certificates: certificateCount,
          totalEvents: participations.length,
          eventsAttended: attendedEvents.map(p => p.event)
        })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "bot", text: data.reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "bot", text: "⚠️ Something went wrong. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-start sm:items-center justify-center px-4 sm:px-6 py-6 sm:py-10 overflow-hidden">

      {/* background aura */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-purple-600/20 blur-[120px] md:blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-blue-600/20 blur-[120px] md:blur-[200px]" />
      </div>

      <div className="relative w-full max-w-3xl rounded-3xl p-[2px]
                      bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">

        <div className="rounded-3xl bg-black/70 backdrop-blur-xl flex flex-col overflow-hidden h-[85vh] sm:h-[75vh]">

          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
            <h1 className="text-base sm:text-lg font-semibold text-white">
              🤖 HackathonHub Assistant
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Personalized insights based on your profile
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed
                  ${
                    msg.role === "user"
                      ? "ml-auto bg-gradient-to-r from-yellow-300 to-amber-400 text-black rounded-br-none"
                      : "bg-white/10 text-gray-200 rounded-bl-none border border-white/10"
                  }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="bg-white/10 text-gray-300 px-3 sm:px-4 py-2 rounded-2xl w-fit animate-pulse border border-white/10 text-xs sm:text-sm">
                Typing...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 sm:px-4 py-3 border-t border-white/10 flex flex-col sm:flex-row gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your events, certificates, or profile…"
              className="flex-1 rounded-xl px-3 sm:px-4 py-2 outline-none text-xs sm:text-sm
                         bg-black/60 border border-white/10
                         text-white placeholder:text-gray-500
                         focus:border-purple-400 transition"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-5 py-2 rounded-xl font-semibold
                         bg-gradient-to-r from-yellow-300 to-amber-400
                         text-black hover:brightness-110
                         transition disabled:opacity-60 w-full sm:w-auto text-sm"
            >
              Send
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
