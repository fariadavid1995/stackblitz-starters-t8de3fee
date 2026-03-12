import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: Request) {
  const { emails, language } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are an expert executive assistant. Analyze the following emails and return a JSON array ranking them from most to least important.

For each email return:
- rank (number)
- subject (string)
- sender (string)
- importance (1-10 score)
- importanceLabel ("Critical" | "High" | "Medium" | "Low")
- summary (1-2 sentence summary)
- urgency ("Immediate" | "Today" | "This Week" | "No Rush")
- responseAdvice (2-3 sentences on HOW to respond)
- category (e.g. "Business", "Personal", "HR", "Newsletter")

Return all text fields in ${language || "English"}.
Return ONLY a valid JSON array, no markdown, no explanation.

Emails:
${emails}`,
      },
    ],
  });

  const block = message.content.find(b => b.type === "text") as { type: "text"; text: string } | undefined;
  const text = block?.text || "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  return NextResponse.json(JSON.parse(cleaned));
}