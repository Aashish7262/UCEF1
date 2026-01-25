"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-linear-to-b from-white to-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-6 py-14">
        
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          
          <div className="md:col-span-2">
            <h2 className="text-2xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HackathonHub
            </h2>
            <p className="mt-4 text-gray-600 max-w-md leading-relaxed">
              HackathonHub is a modern platform to create, manage, and run
              hackathons seamlessly — from registrations to attendance and
              certificate generation.
            </p>
          </div>

          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Platform
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/events" className="text-gray-600 hover:text-blue-600 transition">
                Events
              </Link>
              <Link href="/participate" className="text-gray-600 hover:text-blue-600 transition">
                Participate
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition">
                About
              </Link>
            </div>
          </div>

          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Admin
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/login" className="text-gray-600 hover:text-blue-600 transition">
                Login
              </Link>
              <Link href="/admin/create-event" className="text-gray-600 hover:text-blue-600 transition">
                Create Event
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-blue-600 transition">
                Manage Events
              </Link>
            </div>
          </div>
        </div>

        
        <div className="my-10 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />

        
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

