import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { studentName, eventName } = await req.json();

  if (!studentName || !eventName) {
    return NextResponse.json({ message: "" });
  }

  const prompt = `
You are an encouraging academic mentor.

Write a short, personalized achievement message for a student
who successfully attended and completed a hackathon.

Tone:
- Professional
- Motivational
- Appreciative

Length:
- 3 to 4 lines

Student Name: ${studentName}
Hackathon Name: ${eventName}
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

  const message =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text)
      .join("") || "";

  return NextResponse.json({
    message: message.trim(),
  });
}
