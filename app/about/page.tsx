"use client";

export default function AboutPage() {
  return (
    <main className="w-full bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* background aura (responsive scaled) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/3 w-[300px] h-[300px] md:w-[700px] md:h-[700px] bg-purple-600/20 blur-[120px] md:blur-[200px]" />
          <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-blue-600/20 blur-[120px] md:blur-[200px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
            About{" "}
            <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              HackathonHub
            </span>
          </h1>

          <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            HackathonHub is a modern event management platform crafted to
            simplify the complete lifecycle of hackathons and technical events —
            from creation to certification.
          </p>
        </div>
      </section>

      {/* WHAT WE ENABLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          What We Enable
        </h2>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Card 1 */}
          <div className="group relative rounded-3xl p-[2px]
                          bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 sm:p-8
                            transition-all duration-300 group-hover:bg-black/80">
              <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl
                              bg-blue-500/20 text-blue-400 text-lg sm:text-xl font-bold">
                🚀
              </div>
              <h3 className="mt-5 sm:mt-6 text-lg sm:text-xl font-semibold">
                Event Creation
              </h3>
              <p className="mt-3 text-gray-400 leading-relaxed text-sm sm:text-base">
                Admins can create hackathons, manage them as drafts, and publish
                events only when everything is perfectly ready.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-3xl p-[2px]
                          bg-gradient-to-br from-green-400 via-emerald-500 to-cyan-500">
            <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 sm:p-8
                            transition-all duration-300 group-hover:bg-black/80">
              <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl
                              bg-green-500/20 text-green-400 text-lg sm:text-xl font-bold">
                👥
              </div>
              <h3 className="mt-5 sm:mt-6 text-lg sm:text-xl font-semibold">
                Student Participation
              </h3>
              <p className="mt-3 text-gray-400 leading-relaxed text-sm sm:text-base">
                Students can explore live events, register once, and seamlessly
                participate without confusion or duplication.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-3xl p-[2px]
                          bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-500">
            <div className="rounded-3xl bg-black/70 backdrop-blur-xl p-6 sm:p-8
                            transition-all duration-300 group-hover:bg-black/80">
              <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl
                              bg-purple-500/20 text-purple-400 text-lg sm:text-xl font-bold">
                🎓
              </div>
              <h3 className="mt-5 sm:mt-6 text-lg sm:text-xl font-semibold">
                Certification
              </h3>
              <p className="mt-3 text-gray-400 leading-relaxed text-sm sm:text-base">
                Attendance-verified certificate generation ensures trust,
                authenticity, and professional recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            Why Choose HackathonHub?
          </h2>

          <div className="mt-10 sm:mt-12 max-w-3xl mx-auto">
            <ul className="space-y-5 sm:space-y-6 text-gray-400 text-base sm:text-lg">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">✓</span>
                Role-based access for admins and students
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">✓</span>
                Draft → Live event workflow for better control
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">✓</span>
                Secure participation & attendance tracking
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">✓</span>
                One-time, permanent certificate generation
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">✓</span>
                Built for real-world hackathons and institutions
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FOOTER TEXT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20 text-center">
        <p className="text-base sm:text-lg text-gray-400">
          HackathonHub is not just a tool — it’s a complete ecosystem for managing
          innovation, learning, and achievement.
        </p>
      </section>
    </main>
  );
}
