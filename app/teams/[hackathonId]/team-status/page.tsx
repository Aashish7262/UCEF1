"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface Invite {
  _id: string;
  to: {
    name: string;
    email: string;
  };
  status: string;
}

export default function TeamStatusPage() {
  const { hackathonId } = useParams();

  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [acceptedInvites, setAcceptedInvites] = useState<Invite[]>([]);
  const [rejectedInvites, setRejectedInvites] = useState<Invite[]>([]);

  const [userId, setUserId] = useState<string | null>(null);

  /* ===== Load User ===== */
  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
  }, []);

  /* ===== Fetch Team Details ===== */
  useEffect(() => {
    if (!hackathonId || !userId) return;

    const fetchTeamDetails = async () => {
      try {
        const res = await fetch(
          `/api/teams/${hackathonId}/team-details?userId=${userId}`
        );
        const data = await res.json();

        if (res.ok) {
          setTeamName(data.teamName || "");
          setMembers(data.members || []);
          setPendingInvites(data.pendingInvites || []);
          setAcceptedInvites(data.acceptedInvites || []);
          setRejectedInvites(data.rejectedInvites || []);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Failed to fetch team details");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [hackathonId, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white px-4 text-center">
        Loading Team Details...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10">

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 break-words">
          Team: {teamName}
        </h1>

        {/* ===== MEMBERS ===== */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-green-400">
            Team Members
          </h2>
          {members.length === 0 ? (
            <p className="text-white/50 text-sm sm:text-base">No members yet</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl"
                >
                  <div className="font-semibold text-sm sm:text-base break-words">
                    {member.name}
                  </div>
                  <div className="text-xs sm:text-sm text-white/60 break-all">
                    {member.email}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== PENDING ===== */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-yellow-400">
            Pending Invitations
          </h2>
          {pendingInvites.length === 0 ? (
            <p className="text-white/50 text-sm sm:text-base">No pending invites</p>
          ) : (
            pendingInvites.map((invite) => (
              <div
                key={invite._id}
                className="bg-yellow-500/10 border border-yellow-500/30 p-3 sm:p-4 rounded-xl mb-3 text-sm sm:text-base break-all"
              >
                {invite.to?.email} (Pending)
              </div>
            ))
          )}
        </div>

        {/* ===== ACCEPTED ===== */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-green-400">
            Accepted Invitations
          </h2>
          {acceptedInvites.length === 0 ? (
            <p className="text-white/50 text-sm sm:text-base">No accepted invites</p>
          ) : (
            acceptedInvites.map((invite) => (
              <div
                key={invite._id}
                className="bg-green-500/10 border border-green-500/30 p-3 sm:p-4 rounded-xl mb-3 text-sm sm:text-base break-all"
              >
                {invite.to?.email} (Accepted)
              </div>
            ))
          )}
        </div>

        {/* ===== REJECTED ===== */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-red-400">
            Rejected Invitations
          </h2>
          {rejectedInvites.length === 0 ? (
            <p className="text-white/50 text-sm sm:text-base">No rejected invites</p>
          ) : (
            rejectedInvites.map((invite) => (
              <div
                key={invite._id}
                className="bg-red-500/10 border border-red-500/30 p-3 sm:p-4 rounded-xl mb-3 text-sm sm:text-base break-all"
              >
                {invite.to?.email} (Rejected)
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}

