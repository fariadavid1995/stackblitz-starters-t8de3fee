import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const count = parseInt(searchParams.get("count") || "10");

  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: count,
    q: "is:unread",
  });

  const messages = list.data.messages || [];

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });

      const headers = full.data.payload?.headers || [];
      const get = (name: string) => headers.find(h => h.name === name)?.value || "";

      return `FROM: ${get("From")}\nSUBJECT: ${get("Subject")}\nDATE: ${get("Date")}\n${full.data.snippet || ""}`;
    })
  );

  return NextResponse.json({ emails: emails.join("\n\n---\n\n") });
}