
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
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "bot", text: "⚠️ Something went wrong. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 bg-white/10 border-b border-white/20">
          <h1 className="text-white text-xl font-semibold">🤖 HackathonHub Assistant</h1>
          <p className="text-white/70 text-sm">Personalized insights based on your profile</p>
        </div>

        {/* Messages */}
        <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                msg.role === "user"
                  ? "ml-auto bg-yellow-400 text-black rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl w-fit animate-pulse">
              Typing...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white/10 border-t border-white/20 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask about your events, certificates, or profile…"
            className="flex-1 rounded-xl px-4 py-2 outline-none text-sm bg-white text-gray-800"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2 rounded-xl font-medium transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

