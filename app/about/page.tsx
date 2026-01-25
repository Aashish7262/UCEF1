"use client";

export default function AboutPage() {
  return (
    <main className="w-full">
     
      <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            About{" "}
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HackathonHub
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            HackathonHub is a modern event management platform crafted to
            simplify the complete lifecycle of hackathons and technical events —
            from creation to certification.
          </p>
        </div>
      </section>

     
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          What We Enable
        </h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="group border rounded-3xl p-8 bg-white hover:shadow-xl transition-all duration-300">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-xl font-bold">
              🚀
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-800">
              Event Creation
            </h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Admins can create hackathons, manage them as drafts, and publish
              events only when everything is perfectly ready.
            </p>
          </div>

         
          <div className="group border rounded-3xl p-8 bg-white hover:shadow-xl transition-all duration-300">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-green-100 text-green-600 text-xl font-bold">
              👥
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-800">
              Student Participation
            </h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Students can explore live events, register once, and seamlessly
              participate without confusion or duplication.
            </p>
          </div>

          
          <div className="group border rounded-3xl p-8 bg-white hover:shadow-xl transition-all duration-300">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-purple-100 text-purple-600 text-xl font-bold">
              🎓
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-800">
              Certification
            </h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Attendance-verified certificate generation ensures trust,
              authenticity, and professional recognition.
            </p>
          </div>
        </div>
      </section>

     
      <section className="bg-gray-50 border-t">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Why Choose HackathonHub?
          </h2>

          <div className="mt-10 max-w-3xl mx-auto">
            <ul className="space-y-5 text-gray-700 text-lg">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                Role-based access for admins and students
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                Draft → Live event workflow for better control
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                Secure participation & attendance tracking
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                One-time, permanent certificate generation
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                Built for real-world hackathons and institutions
              </li>
            </ul>
          </div>
        </div>
      </section>

      
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="text-lg text-gray-600">
          HackathonHub is not just a tool — it’s a complete ecosystem for managing
          innovation, learning, and achievement.
        </p>
      </section>
    </main>
  );
}

