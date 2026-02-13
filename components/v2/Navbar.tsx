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
    <nav className="sticky top-0 z-50
                bg-[#0b0620]/80
                backdrop-blur-2xl
                border-b border-purple-500/20
                relative">



  {/* subtle glow divider */}
  <div className="absolute bottom-0 left-0 w-full h-px
                  bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

  <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

    {/* Logo */}
    <Link
      href="/"
      className="text-2xl font-extrabold tracking-tight
                 bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                 bg-clip-text text-transparent"
    >
      HackathonHub
    </Link>

    <div className="flex items-center gap-10">

      {[
        { name: "Hackathon", path: "/hackathons" },
        { name: "Events", path: "/events" },
        { name: "Contact Us", path: "/contact" },
        { name: "About", path: "/about" },
      ].map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`relative font-medium transition-all
            ${
              pathname === item.path
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }
            after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0
            after:bg-gradient-to-r after:from-purple-400 after:to-pink-400
            after:transition-all hover:after:w-full
          `}
        >
          {item.name}
        </Link>
      ))}

      {name ? (
        <div className="flex items-center gap-6 pl-6 border-l border-white/10">

          <span className="text-gray-400">
            Hi, <span className="font-semibold text-white">{name}</span>
          </span>

          <Link
            href="/profile"
            className={`font-medium transition ${
              pathname === "/profile"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Your Profile
          </Link>

          <Link
            href="/chatbot"
            className={`font-medium transition ${
              pathname === "/chatbot"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ChatBot
          </Link>

          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-full
                       border border-red-500/40 text-red-400
                       hover:bg-red-500 hover:text-black
                       transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="px-6 py-2 rounded-full
                     bg-gradient-to-r from-purple-500 to-pink-500
                     text-black font-semibold
                     hover:brightness-110 transition"
        >
          Login
        </Link>
      )}
    </div>
  </div>
</nav>
  );
}
