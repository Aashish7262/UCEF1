import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, role, skills, projects } = await req.json();

    const prompt = `
You are a professional resume writer.

Create a concise resume summary using:
Name: ${name}
Role: ${role}
Skills: ${skills}
Projects: ${projects}

Rules:
- 3–4 lines only
- Professional and confident tone
- No buzzwords
- Resume-ready language
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await res.json();

    const summary =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Motivated student with hands-on hackathon experience and strong technical skills.";

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({
      summary:
        "Motivated student with hands-on hackathon experience and strong technical skills.",
    });
  }
}