import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      message,
      certificates,
      totalEvents,
      eventsAttended
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    /* ---------- 1. Rule-based profile (SAFE & RELIABLE) ---------- */
    let profile = "Beginner";

    if (certificates >= 3 && totalEvents >= 4) {
      profile = "Advanced Learner";
    } else if (certificates >= 1 && totalEvents >= 2) {
      profile = "Intermediate Learner";
    }

    /* ---------- 2. Gemini Prompt ---------- */
    const prompt = `
You are a smart academic chatbot for a hackathon platform.

Student participation data:
- Certificates earned: ${certificates}
- Total events attended: ${totalEvents}
- Event names: ${eventsAttended?.join(", ") || "None"}

System-calculated profile:
${profile}

User question:
"${message}"

Rules:
- Do NOT change the profile
- Explain answers based ONLY on the given data
- Keep the reply clear and supportive
- If asked about level, use the system profile
`;

    /* ---------- 3. Call Gemini API ---------- */
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("") || "Sorry, I couldn't generate a response.";

    /* ---------- 4. Final Response ---------- */
    return NextResponse.json({
      reply: reply.trim(),
      profile
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
