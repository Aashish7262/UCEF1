"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/10 overflow-hidden">

      {/* background aura */}
      <div className="pointer-events-none relative">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] bg-purple-600/10 blur-[200px]" />
        <div className="absolute -top-20 right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[200px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-extrabold
                           bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                           bg-clip-text text-transparent">
              HackathonHub
            </h2>

            <p className="mt-4 text-gray-400 max-w-md leading-relaxed">
              HackathonHub is a modern platform to create, manage, and run
              hackathons seamlessly — from registrations to attendance and
              certificate generation.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
              Platform
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/events" className="text-gray-400 hover:text-white transition">
                Events
              </Link>
              <Link href="/participate" className="text-gray-400 hover:text-white transition">
                Participate
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition">
                About
              </Link>
            </div>
          </div>

          {/* Admin */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
              Admin
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/login" className="text-gray-400 hover:text-white transition">
                Login
              </Link>
              <Link href="/admin/create-event" className="text-gray-400 hover:text-white transition">
                Create Event
              </Link>
              <Link href="/events" className="text-gray-400 hover:text-white transition">
                Manage Events
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} HackathonHub. All rights reserved.
          </p>

          <p className="text-sm text-gray-500 flex items-center gap-1">
            Built with ❤️ for Hackathons
          </p>
        </div>
      </div>
    </footer>
  );
}
