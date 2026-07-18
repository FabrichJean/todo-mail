import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthClient, GMAIL_SEND_SCOPES } from "@/lib/google-oauth";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GMAIL_SEND_SCOPES,
    });
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Configuration OAuth Google manquante";
    return NextResponse.redirect(`${appUrl}/connect?error=${encodeURIComponent(message)}`);
  }
}
