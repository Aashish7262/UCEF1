
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stats = body?.stats;

    if (!stats) {
      return NextResponse.json(
        { message: "Stats missing" },
        { status: 400 }
      );
    }

    // 🔹 STRONG PROMPT (forces personalized output)
    const prompt = `
You are an AI Student Mentor for a hackathon platform.

Analyze the student's participation and give specific, personalized feedback.

Student stats:
- Registered events: ${stats.registered}
- Attended events: ${stats.attended}
- Certificates earned: ${stats.certificates}

Rules:
- Mention at least ONE number from the stats
- Mention 1 strength and 1 improvement area
- Give 1 clear next-step suggestion
- Tone must be friendly and motivating
- Length: 3–4 sentences only
- Do NOT give generic advice

Now write the mentor feedback:
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const geminiJson = await geminiRes.json();

    // 🧠 Extract Gemini text safely
    let insight =
      geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    // 🔁 SMART FALLBACK (still personalized)
    if (!insight || insight.trim().length < 20) {
      if (stats.attended < stats.registered) {
        insight = `You registered for ${stats.registered} events but attended only ${stats.attended}. This shows interest, but focusing on completing fewer hackathons can improve consistency. Try finishing smaller events regularly to boost engagement.`;
      } else if (stats.certificates > 0) {
        insight = `Great work earning ${stats.certificates} certificates. Attending all ${stats.attended} registered events shows commitment. Maintaining this consistency will strengthen your profile further.`;
      } else {
        insight = `You are just getting started with ${stats.registered} registrations. Attending more events consistently will help build confidence and engagement over time.`;
      }
    }

    return NextResponse.json({ insight });
  } catch (error) {
    console.error("AI Mentor Error:", error);
    return NextResponse.json(
      { message: "AI mentor failed" },
      { status: 500 }
    );
  }
}
