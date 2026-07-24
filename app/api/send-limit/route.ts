import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSendUsage } from "@/lib/send-limit";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const usage = await getSendUsage(session.userId);
  return NextResponse.json({ usage });
}
