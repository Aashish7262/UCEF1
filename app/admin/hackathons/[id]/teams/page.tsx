"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Submission {
  _id: string;
  team: {
    name: string;
  };
  githubLink: string;
  demoLink: string;
  presentationLink: string;
  description: string;
}

interface LeaderboardItem {
  rank: number;
  teamName: string;
  score: number;
}

export default function ViewTeamsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [technical, setTechnical] = useState<number>(0);
  const [innovation, setInnovation] = useState<number>(0);
  const [presentation, setPresentation] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  const [selectedSubmission, setSelectedSubmission] =
    useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
  }, []);

  /* ================= FETCH SUBMISSIONS ================= */
  useEffect(() => {
    if (!id) return;

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`/api/submissions/${id}`);
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } catch (error) {
        console.error("Failed to fetch submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [id]);

  /* ================= SUBMIT EVALUATION ================= */
  const handleEvaluate = async () => {
    if (!selectedSubmission) {
      alert("Select a team first");
      return;
    }

    try {
      const res = await fetch("/api/evaluations/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hackathonId: id,
          submissionId: selectedSubmission,
          technical,
          innovation,
          presentation,
          feedback,
          userId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Evaluation submitted successfully");
        setTechnical(0);
        setInnovation(0);
        setPresentation(0);
        setFeedback("");
        setSelectedSubmission(null);
        router.refresh();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Evaluation failed");
    }
  };

  /* ================= FETCH LEADERBOARD ================= */
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/hackathons/${id}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard");
    }
  };

  /* ================= PUBLISH RESULTS ================= */
  const handlePublishResults = async () => {
    try {
      const res = await fetch(
        `/api/hackathons/${id}/publish-results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Results published successfully!");
        fetchLeaderboard();
        router.refresh();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Publish failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white text-sm sm:text-base px-4">
        Loading submissions...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10">
          Submitted Teams
        </h1>

        {submissions.length === 0 && (
          <div className="text-white/50 text-sm sm:text-base">
            No submissions yet.
          </div>
        )}

        {submissions.map((submission) => (
          <div
            key={submission._id}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words">
              {submission.team?.name}
            </h2>

            <p className="text-white/60 mb-3 text-sm sm:text-base leading-relaxed">
              {submission.description}
            </p>

            <div className="text-xs sm:text-sm text-blue-400 space-y-1 mb-4 break-words">
              <div>GitHub: {submission.githubLink}</div>
              <div>Demo: {submission.demoLink}</div>
              <div>Presentation: {submission.presentationLink}</div>
            </div>

            <button
              onClick={() => setSelectedSubmission(submission._id)}
              className="w-full sm:w-auto px-4 py-2 bg-purple-500 text-black rounded-xl text-sm sm:text-base"
            >
              Evaluate This Team
            </button>
          </div>
        ))}

        {/* ================= EVALUATION FORM ================= */}
        {selectedSubmission && (
          <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-5 sm:mb-6">
              Evaluation Form
            </h2>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="Technical Score"
                value={technical}
                onChange={(e) => setTechnical(Number(e.target.value))}
                className="w-full bg-white/10 px-4 py-2 rounded-xl text-sm sm:text-base"
              />

              <input
                type="number"
                placeholder="Innovation Score"
                value={innovation}
                onChange={(e) => setInnovation(Number(e.target.value))}
                className="w-full bg-white/10 px-4 py-2 rounded-xl text-sm sm:text-base"
              />

              <input
                type="number"
                placeholder="Presentation Score"
                value={presentation}
                onChange={(e) => setPresentation(Number(e.target.value))}
                className="w-full bg-white/10 px-4 py-2 rounded-xl text-sm sm:text-base"
              />

              <textarea
                placeholder="Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full bg-white/10 px-4 py-2 rounded-xl text-sm sm:text-base"
              />

              <button
                onClick={handleEvaluate}
                className="w-full sm:w-auto px-6 py-2 bg-green-500 text-black rounded-xl text-sm sm:text-base"
              >
                Submit Evaluation
              </button>
            </div>
          </div>
        )}

        {/* ================= RESULT SECTION ================= */}
        <div className="mt-14 sm:mt-16 border-t border-white/10 pt-8 sm:pt-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6">
            Leaderboard & Results
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
            <button
              onClick={fetchLeaderboard}
              className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-black rounded-xl text-sm sm:text-base"
            >
              View Leaderboard
            </button>

            <button
              onClick={handlePublishResults}
              className="w-full sm:w-auto px-6 py-2 bg-green-500 text-black rounded-xl text-sm sm:text-base"
            >
              Publish Results
            </button>
          </div>

          {leaderboard.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              {leaderboard.map((team, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm sm:text-base"
                >
                  <div className="font-semibold">
                    Rank #{team.rank}
                  </div>
                  <div className="break-words">Team: {team.teamName}</div>
                  <div>Score: {team.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}



