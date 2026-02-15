export const runtime = "nodejs";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
);

export async function POST(req: Request) {
  try {
    const { role, company, skills } = await req.json();

    if (!role || !company) {
      return new Response(
        JSON.stringify({ error: "Role and company are required" }),
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an expert resume writer.

Write a PROFESSIONAL resume-ready experience description.

Role: ${role}
Company: ${company}
Skills: ${Array.isArray(skills) ? skills.join(", ") : ""}

Rules:
- 2 to 3 bullet points
- Start with action verbs
- Mention responsibilities & impact
- ATS friendly
- No emojis
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(
      JSON.stringify({ description: text.trim() }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Gemini Experience Error:", err);
    return new Response(
      JSON.stringify({ error: "Gemini failed" }),
      { status: 500 }
    );
  }
}