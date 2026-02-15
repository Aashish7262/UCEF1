"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LeaderboardDisplay from "@/components/LeaderboardDisplay";
interface Hackathon {
  _id: string;
  title: string;
  description: string;
  status: string;
  paymentRequired?: boolean; // NEW (safe)
  entryFee?: number; // NEW (safe)
}


export default function HackathonDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [teamStatus, setTeamStatus] = useState<any>(null);

  const [teamName, setTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [updating, setUpdating] = useState(false);

  // ===== Submission States =====
  const [githubLink, setGithubLink] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [presentationLink, setPresentationLink] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  /* ===== Load Role + User ===== */
useEffect(() => {
  setRole(localStorage.getItem("role"));
  setUserId(localStorage.getItem("userId"));

  // 🔥 FIX: Persist Thank You after payment redirect
  if (id) {
    const submittedFlag = localStorage.getItem(`submitted_${id}`);
    if (submittedFlag === "true") {
      setHasSubmitted(true);
    }
  }
}, [id]);



  /* ===== Fetch Hackathon (Auto Refresh Every 5s) ===== */
  useEffect(() => {
    if (!id) return;

    const fetchHackathon = async () => {
      try {
        const res = await fetch(`/api/hackathons/${id}`);
        const data = await res.json();
        setHackathon(data.hackathon);
      } catch (error) {
        console.error("Failed to fetch hackathon");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();

    const interval = setInterval(fetchHackathon, 5000);
    return () => clearInterval(interval);
  }, [id]);

  /* ===== Fetch Team Status ===== */
  const fetchTeamStatus = async () => {
    if (!hackathon?._id || !userId) return;

    try {
      const res = await fetch(
        `/api/hackathons/${hackathon._id}/team-status?userId=${userId}`
      );
      const data = await res.json();
      setTeamStatus(data);
    } catch (error) {
      console.error("Failed to fetch team status");
    }
  };
  /* ===== CHECK IF TEAM ALREADY SUBMITTED ===== */
/* ===== CHECK IF TEAM ALREADY SUBMITTED ===== */
const checkSubmissionStatus = async () => {
  if (!hackathon?._id || !teamStatus?.teamId) return;

  // 🔥 STEP 1: FIRST check localStorage (after payment redirect)
  const localFlag = localStorage.getItem(`submitted_${hackathon._id}`);
  if (localFlag === "true") {
    setHasSubmitted(true);
    return; // STOP here (prevents flicker)
  }

  // 🔥 STEP 2: THEN fallback to backend check
  try {
    const res = await fetch(
      `/api/submissions/${hackathon._id}?teamId=${teamStatus.teamId}`
    );
    const data = await res.json();

    if (res.ok && data.submission) {
      setHasSubmitted(true);
      // Sync local flag for future reloads
      localStorage.setItem(`submitted_${hackathon._id}`, "true");
    } else {
      setHasSubmitted(false);
    }
  } catch (error) {
    console.error("Failed to check submission status");
  }
};





  useEffect(() => {
  if (role === "student" && userId && hackathon?._id) {
    fetchTeamStatus();
  }
}, [role, userId, hackathon?._id, hackathon?.status]);

useEffect(() => {
  if (teamStatus?.teamId && hackathon?._id) {
    checkSubmissionStatus();
  }
}, [teamStatus?.teamId, hackathon?._id]);


  /* ===== Create Team ===== */
  const handleCreateTeam = async () => {
    if (!teamName.trim() || !hackathon?._id || !userId) {
      alert("Enter team name");
      return;
    }

    try {
      setCreatingTeam(true);

      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonId: hackathon._id,
          teamName: teamName.trim(),
          userId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTeamName("");
        fetchTeamStatus();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Create team failed");
    } finally {
      setCreatingTeam(false);
    }
  };

  /* ===== Send Invitation (EMAIL BASED) ===== */
  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !teamStatus?.teamId) {
      alert("Enter valid email");
      return;
    }

    try {
      setSendingInvite(true);

      const userRes = await fetch(
        `/api/users/find-by-email?email=${encodeURIComponent(
          inviteEmail.trim()
        )}`
      );

      const userData = await userRes.json();

      if (!userRes.ok) {
        alert(userData.message || "User not found with this email");
        return;
      }

      const toUserId = userData.user._id;

      const res = await fetch("/api/invitations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonId: hackathon?._id,
          teamId: teamStatus.teamId,
          fromUserId: userId,
          toUserId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setInviteEmail("");
        alert("Invitation sent successfully");
        router.refresh();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Invite failed");
    } finally {
      setSendingInvite(false);
    }
  };

  /* ===== Accept Invite ===== */
  const handleAcceptInvite = async () => {
    if (!teamStatus?.inviteId) return;

    const res = await fetch(
      `/api/invitations/${teamStatus.inviteId}/accept`,
      { method: "PATCH" }
    );

    if (res.ok) {
      fetchTeamStatus();
      router.refresh();
    }
  };

  /* ===== Reject Invite ===== */
  const handleRejectInvite = async () => {
    if (!teamStatus?.inviteId) return;

    const res = await fetch(
      `/api/invitations/${teamStatus.inviteId}/reject`,
      { method: "PATCH" }
    );

    if (res.ok) {
      fetchTeamStatus();
      router.refresh();
    }
  };

  /* ===== Update Status (Admin) ===== */
  const handleStatusChange = async (newStatus: string) => {
    if (!hackathon?._id || !userId) return;

    try {
      setUpdating(true);

      const res = await fetch(`/api/hackathons/${hackathon._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          userId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setHackathon(data.hackathon);
        router.refresh();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  /* ===== Submit Prototype ===== */
const handleSubmitPrototype = async () => {
  if (!githubLink || !demoLink || !presentationLink) {
    alert("Please fill all required fields");
    return;
  }

  const draftSubmission = {
    hackathonId: hackathon?._id,
    teamId: teamStatus?.teamId,
    userId,
    githubLink,
    demoLink,
    presentationLink,
    description: projectDescription,
  };

  localStorage.setItem(
    "pendingSubmission",
    JSON.stringify(draftSubmission)
  );

  if (hackathon?.paymentRequired) {
    router.push(`/hackathons/${hackathon._id}/payment`);
    return;
  }

  try {
    setSubmitting(true);

    const res = await fetch("/api/submissions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draftSubmission),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.removeItem("pendingSubmission");
      alert("Submission successful");
      router.push("/hackathons");
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Submission failed");
  } finally {
    setSubmitting(false);
  }
};



  if (loading || !hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/70">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
          <span className="text-lg font-medium">Loading Hackathon...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#020617] text-white px-4 sm:px-6 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl shadow-purple-500/5">

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 tracking-tight break-words">
          {hackathon.title}
        </h1>

        <p className="text-white/60 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
          {hackathon.description}
        </p>

        <div className="mb-10 inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold text-sm tracking-wide">
          Current Status: {hackathon.status.toUpperCase()}
        </div>


        {/* ===== ADMIN CONTROL ===== */}
        {role === "admin" && (
          <div className="mb-12 p-6 bg-white/5 border border-white/10 rounded-2xl">
            <label className="block text-sm text-white/50 mb-3 font-medium">
              Change Status
            </label>
<div className="flex flex-wrap gap-3">
  {hackathon.status === "draft" && (
    <button
      disabled={updating}
      onClick={() => handleStatusChange("registration-open")}
      className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold transition-all shadow-lg"
    >
      Open Registration
    </button>
  )}

  {hackathon.status === "registration-open" && (
    <button
      disabled={updating}
      onClick={() => handleStatusChange("registration-closed")}
      className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition-all shadow-lg"
    >
      Close Registration
    </button>
  )}

  {hackathon.status === "registration-closed" && (
    <button
      disabled={updating}
      onClick={() => handleStatusChange("submission-open")}
      className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-semibold transition-all shadow-lg"
    >
      Open Submission
    </button>
  )}

  {hackathon.status === "submission-open" && (
    <button
      disabled={updating}
      onClick={() => handleStatusChange("evaluation")}
      className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-semibold transition-all shadow-lg"
    >
      Start Evaluation
    </button>
  )}

  {hackathon.status === "evaluation" && (
    <button
      disabled={updating}
      onClick={() => handleStatusChange("completed")}
      className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-black font-semibold transition-all shadow-lg"
    >
      Mark as Completed
    </button>
  )}
</div>

          </div>
        )}

        {/* ===== REGISTRATION PHASE ===== */}
        {role === "student" &&
          hackathon.status === "registration-open" &&
          teamStatus && (
            <div className="mt-6 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
              {!teamStatus.inTeam && !teamStatus.invited && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Enter Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-white/10 border border-white/20 px-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                  <button
                    onClick={handleCreateTeam}
                    className="bg-green-500 hover:bg-green-400 transition-all px-6 py-3 rounded-xl text-black font-semibold shadow-lg"
                  >
                    {creatingTeam ? "Creating..." : "Create Team"}
                  </button>
                </div>
              )}

              {teamStatus.inTeam && teamStatus.isLeader && (
                <div className="mt-6 space-y-4">
                  <div className="text-green-400 font-semibold text-lg">
                    You are the Team Leader
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      placeholder="Invite by Email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-white/10 border border-white/20 px-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />

                    <button
                      onClick={handleSendInvite}
                      className="bg-blue-500 hover:bg-blue-400 transition-all px-6 py-3 rounded-xl text-black font-semibold shadow-lg"
                    >
                      {sendingInvite ? "Sending..." : "Send Invite"}
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/teams/${hackathon._id}/team-status`)
                    }
                    className="bg-purple-500 hover:bg-purple-400 transition-all px-6 py-3 rounded-xl text-black font-semibold shadow-lg"
                  >
                    View Team Status
                  </button>
                </div>
              )}

              {teamStatus.invited && (
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleAcceptInvite}
                    className="bg-green-500 hover:bg-green-400 transition-all px-6 py-3 rounded-xl text-black font-semibold shadow-lg"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleRejectInvite}
                    className="bg-red-500 hover:bg-red-400 transition-all px-6 py-3 rounded-xl text-white font-semibold shadow-lg"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}

        {/* ===== RESULTS PHASE ===== */}
        {role === "student" && hackathon.status === "completed" && (
          <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <div className="text-green-400 font-bold mb-6 text-2xl">
              🎉 Hackathon Results Announced!
            </div>

            <LeaderboardDisplay hackathonId={hackathon._id} />
          </div>
        )}

        {/* ===== SUBMISSION PHASE ===== */}
        {role === "student" &&
  hackathon.status === "submission-open" &&
  teamStatus?.inTeam &&
  !hasSubmitted && (

            <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
              {teamStatus.isLeader ? (
                <div className="space-y-5">
                  <div className="text-green-400 font-bold text-xl">
                    Submit Your Prototype
                  </div>

                  <input
                    type="text"
                    placeholder="GitHub Link"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />

                  <input
                    type="text"
                    placeholder="Demo Link"
                    value={demoLink}
                    onChange={(e) => setDemoLink(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />

                  <input
                    type="text"
                    placeholder="Presentation Link"
                    value={presentationLink}
                    onChange={(e) => setPresentationLink(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />

                  <textarea
                    placeholder="Project Description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 px-4 py-3 rounded-xl min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />

                  <button
                    onClick={handleSubmitPrototype}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-all px-8 py-3 rounded-xl text-black font-bold shadow-xl shadow-purple-500/20"
                  >
                    {submitting ? "Submitting..." : "Submit Prototype"}
                  </button>
                </div>
              ) : (
                <div className="text-blue-400 font-semibold text-lg">
                  Waiting for team leader to submit the prototype.
                </div>
              )}
            </div>
          )}
          {/* ===== THANK YOU (AFTER SUBMISSION) ===== */}
{role === "student" &&
  hasSubmitted && (
    <div className="mt-12 p-8 bg-white/5 border border-green-500/30 rounded-2xl backdrop-blur-xl text-center">
      <div className="text-green-400 font-bold text-2xl mb-4">
        🎉 Thank You for Participating!
      </div>
      <p className="text-white/60 text-lg">
        Your project has been successfully submitted.
        {hackathon.paymentRequired
          ? " Payment was completed and your submission is locked."
          : " Submission is locked and awaiting evaluation."}
      </p>
    </div>
)}

      </div>
    </main>
  );
}





