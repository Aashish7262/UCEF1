"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    setName(storedName);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
       
        <Link
          href="/"
          className="text-2xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          HackathonHub
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href="/events"
            className={`font-medium transition ${
              pathname === "/events"
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Events
          </Link>

          <Link
            href="/contact"
            className={`font-medium transition ${
              pathname === "/contact"
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Contact Us
          </Link>

          <Link
            href="/about"
            className={`font-medium transition ${
              pathname === "/about"
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            About
          </Link>

         
          {name ? (
            <div className="flex items-center gap-4 pl-4 border-l">
              <span className="text-gray-700 font-medium">
                Hi,{" "}
                <span className="font-semibold text-gray-900">
                  {name}
                </span>
              </span>
                <Link
            href="/profile"
            className={`font-medium transition ${
              pathname === "/profile"
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Your Profile
          </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border border-red-500 text-red-500 font-medium hover:bg-red-50 transition"
              >
                Logout
              </button>
            
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}




