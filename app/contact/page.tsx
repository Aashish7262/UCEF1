"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  const handlebtn = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20 overflow-hidden">

      {/* background aura */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] bg-purple-600/20 blur-[200px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-blue-600/20 blur-[200px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-extrabold
                         bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                         bg-clip-text text-transparent">
            Get in Touch
          </h1>

          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Have questions, feedback, or want to collaborate?  
            We’d love to hear from you.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Contact Info */}
          <div className="relative rounded-3xl p-[2px]
                          bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-8 h-full">

              <h2 className="text-2xl font-bold mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                <InfoItem title="Email" value="support@hackathonhub.com" />
                <InfoItem title="Phone" value="+91 90000 00000" />
                <InfoItem title="Location" value="India 🇮🇳" />
              </div>

              <div className="mt-10">
                <p className="text-sm text-gray-400">
                  Built with ❤️ for hackathons, colleges, and real-world events.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form (UI only) */}
          <div className="relative rounded-3xl p-[2px]
                          bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-8">

              <h2 className="text-2xl font-bold mb-6">
                Send a Message
              </h2>

              <form className="space-y-5">

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl
                               bg-black/60 border border-white/20
                               text-white
                               focus:outline-none focus:border-purple-400
                               focus:ring-2 focus:ring-purple-500/30
                               transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl
                               bg-black/60 border border-white/20
                               text-white
                               focus:outline-none focus:border-blue-400
                               focus:ring-2 focus:ring-blue-500/30
                               transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 rounded-xl
                               bg-black/60 border border-white/20
                               text-white
                               focus:outline-none focus:border-purple-400
                               focus:ring-2 focus:ring-purple-500/30
                               resize-none transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={handlebtn}
                  className="w-full py-3 rounded-xl font-semibold
                             bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                             text-black hover:brightness-110
                             transition-all duration-300 shadow-lg"
                >
                  Send Message
                </button>

              </form>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <p className="text-gray-400">
            Want to explore events?
          </p>

          <Link
            href="/events"
            className="inline-block mt-4 px-6 py-3 rounded-2xl font-medium
                       bg-white text-black
                       shadow-[0_0_40px_rgba(255,255,255,0.25)]
                       hover:shadow-[0_0_70px_rgba(168,85,247,0.6)]
                       transition-all duration-300"
          >
            Browse Events 🚀
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
