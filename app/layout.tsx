import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/v2/Navbar";
import Footer from "@/components/v2/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HackathonHub",
  description: "Platform to manage hackathons, events, participation, attendance, and certificates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        {/* GLOBAL THEME WRAPPER (SAFE - NO LOGIC IMPACT) */}
        <div
          className="flex flex-col min-h-screen"
          style={{
            backgroundColor: "var(--bg)",
            color: "var(--text-primary)",
            transition: "background-color 0.3s ease, color 0.3s ease",
          }}
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}


