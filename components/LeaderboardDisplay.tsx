"use client";

import { useEffect, useState } from "react";

export default function LeaderboardDisplay({ hackathonId }: any) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const res = await fetch(
        `/api/hackathons/${hackathonId}/leaderboard`
      );
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    };

    fetchLeaderboard();
  }, [hackathonId]);

  return (
    <div className="space-y-4">
      {leaderboard.map((team, index) => (
        <div
          key={index}
          className="bg-white/5 border border-white/10 p-4 rounded-xl"
        >
          <div className="font-semibold">
            🏆 Rank #{team.rank}
          </div>
          <div>Team: {team.teamName}</div>
          <div>Score: {team.score}</div>
        </div>
      ))}
    </div>
  );
}
