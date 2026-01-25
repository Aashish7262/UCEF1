import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name } = await req.json();

  if (!name || name.length < 3) {
    return NextResponse.json({ description: "" });
  }

  const prompt = `
You are a professional event content writer.

Generate a high-quality, engaging, and professional description
for a hackathon based only on its name.

Rules:
- 3 to 4 lines
- Clear and inspiring language
- Suitable for a college or professional hackathon website
- No emojis
- No bullet points
- No markdown
- Natural paragraph format

Hackathon Name: ${name}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

  const description =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text)
      .join("") || "";

  return NextResponse.json({
    description: description.trim(),
  });
}


