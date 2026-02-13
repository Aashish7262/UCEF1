
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
export default function ContactPage() {
    const router = useRouter();
    const handlebtn = ()=>{
        router.push('/');  
    }
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions, feedback, or want to collaborate?  
            We’d love to hear from you.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="bg-white/80 backdrop-blur border rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Information
            </h2>

            <div className="space-y-6">
              <InfoItem
                title="Email"
                value="support@hackathonhub.com"
              />
              <InfoItem
                title="Phone"
                value="+91 90000 00000"
              />
              <InfoItem
                title="Location"
                value="India 🇮🇳"
              />
            </div>

            <div className="mt-10">
              <p className="text-sm text-gray-600">
                Built with ❤️ for hackathons, colleges, and real-world events.
              </p>
            </div>
          </div>

          {/* Contact Form (UI only) */}
          <div className="bg-white border rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Send a Message
            </h2>

            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="button" onClick={handlebtn}
                className="w-full py-3 rounded-xl font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:opacity-90 transition shadow-lg"
              >
                Send Message
              </button>

              
            </form>
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-600">
            Want to explore events?
          </p>
          <Link
            href="/events"
            className="inline-block mt-4 px-6 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
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
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}