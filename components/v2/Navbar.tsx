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
    <nav
      className="sticky top-0 z-50
      bg-[#0b0620]/80
      backdrop-blur-2xl
      border-b border-purple-500/20
      relative w-full"
    >
      {/* subtle glow divider */}
      <div
        className="absolute bottom-0 left-0 w-full h-px
        bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"
      />

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-lg sm:text-2xl font-extrabold tracking-tight
          bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
          bg-clip-text text-transparent whitespace-nowrap flex-shrink-0"
        >
          HackathonHub
        </Link>

        {/* RIGHT SIDE (FIXED RESPONSIVE) */}
        <div className="flex items-center gap-3 sm:gap-6 max-w-full overflow-x-auto">
          
          {/* Nav Links - WILL ALWAYS SHOW */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 whitespace-nowrap flex-shrink-0">
            {[
              { name: "Go To Resume", path: "/profile/cv" },
              { name: "Hackathon", path: "/hackathons" },
              { name: "Events", path: "/events" },
              { name: "Contact Us", path: "/contact" },
              { name: "About", path: "/about" },
            ].map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`relative font-medium transition-all text-sm sm:text-base whitespace-nowrap
                  ${
                    pathname === item.path
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }
                  after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0
                  after:bg-gradient-to-r after:from-purple-400 after:to-pink-400
                  after:transition-all hover:after:w-full`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* USER SECTION */}
          {name ? (
            <div className="flex items-center gap-3 sm:gap-5 pl-3 sm:pl-5 border-l border-white/10 whitespace-nowrap flex-shrink-0">
              <span className="text-gray-400 text-xs sm:text-sm">
                Hi, <span className="font-semibold text-white">{name}</span>
              </span>

              <Link
                href="/profile"
                className={`font-medium transition text-sm whitespace-nowrap ${
                  pathname === "/profile"
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Your Profile
              </Link>

              <Link
                href="/chatbot"
                className={`font-medium transition text-sm whitespace-nowrap ${
                  pathname === "/chatbot"
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                ChatBot
              </Link>

              <button
                onClick={handleLogout}
                className="px-3 sm:px-5 py-2 rounded-full
                border border-red-500/40 text-red-400
                hover:bg-red-500 hover:text-black
                transition whitespace-nowrap text-xs sm:text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 sm:px-6 py-2 rounded-full
              bg-gradient-to-r from-purple-500 to-pink-500
              text-black font-semibold
              hover:brightness-110 transition whitespace-nowrap text-sm flex-shrink-0"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
