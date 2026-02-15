export default function PublicCV({ params }: any) {
  const username = params.username;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-5xl font-bold capitalize">
          {username}
        </h1>

        <p className="text-purple-400 text-xl mt-2">
          AI / Full Stack Developer
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">About</h2>
          <p className="text-gray-300">
            Passionate student developer with real-world hackathon experience
            and AI-driven project work.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">Skills</h2>
          <ul className="list-disc list-inside text-gray-400">
            <li>Python</li>
            <li>Machine Learning</li>
            <li>Next.js</li>
            <li>AI Systems</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">Projects</h2>
          <p className="text-gray-400">
            Built an AI-powered hackathon platform with analytics,
            mentoring, and resume generation features.
          </p>
        </section>

      </div>
    </div>
  );
}