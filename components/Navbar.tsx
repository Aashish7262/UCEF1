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
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
  <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

    {/* Logo */}
    <Link
      href="/"
      className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent hover:opacity-90 transition"
    >
      HackathonHub
    </Link>

    {/* Right side */}
    <div className="flex items-center gap-10">
      
      {/* Nav links */}
      {[
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
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
            after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0
            after:bg-gradient-to-r after:from-blue-600 after:to-purple-600
            after:transition-all hover:after:w-full
          `}
        >
          {item.name}
        </Link>
      ))}

      {/* Auth section */}
      {name ? (
        <div className="flex items-center gap-6 pl-6 border-l border-gray-300/60">

          <span className="text-gray-600">
            Hi,{" "}
            <span className="font-semibold text-gray-900">
              {name}
            </span>
          </span>

          <Link
            href="/profile"
            className={`relative font-medium transition ${
              pathname === "/profile"
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Your Profile
          </Link>

          <Link
            href="/chatbot"
            className={`relative font-medium transition ${
              pathname === "/chatbot"
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            ChatBot
          </Link>

          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-full border border-red-500/80 text-red-500 font-medium
              hover:bg-red-500 hover:text-white
              transition-all shadow-sm hover:shadow-red-500/30"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600
            text-white font-medium shadow-md hover:shadow-xl hover:scale-[1.03]
            transition-all"
        >
          Login
        </Link>
      )}
    </div>
  </div>
</nav>

  );
}




