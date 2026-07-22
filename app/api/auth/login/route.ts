import { NextRequest, NextResponse } from "next/server";
import { getGoogleLoginOAuthClient, LOGIN_SCOPES } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  try {
    const oauth2Client = getGoogleLoginOAuthClient();
    const url = oauth2Client.generateAuthUrl({
      prompt: "select_account",
      scope: LOGIN_SCOPES,
    });
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Configuration OAuth Google manquante";
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(message)}`);
  }
}
