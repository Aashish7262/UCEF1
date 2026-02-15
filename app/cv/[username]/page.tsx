export default function PublicCV({ params }: any) {
  const username = params.username;

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold capitalize break-words">
          {username}
        </h1>

        <p className="text-purple-400 text-lg sm:text-xl mt-2">
          AI / Full Stack Developer
        </p>

        <section className="mt-8 sm:mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">About</h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Passionate student developer with real-world hackathon experience
            and AI-driven project work.
          </p>
        </section>

        <section className="mt-8 sm:mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">Skills</h2>
          <ul className="list-disc list-inside text-gray-400 text-sm sm:text-base space-y-1">
            <li>Python</li>
            <li>Machine Learning</li>
            <li>Next.js</li>
            <li>AI Systems</li>
          </ul>
        </section>

        <section className="mt-8 sm:mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">Projects</h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Built an AI-powered hackathon platform with analytics,
            mentoring, and resume generation features.
          </p>
        </section>

      </div>
    </div>
  );
}
