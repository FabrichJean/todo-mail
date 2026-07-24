import { NextRequest, NextResponse } from "next/server";
import { getGoogleLoginOAuthClient, LOGIN_SCOPES } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  try {
    const oauth2Client = getGoogleLoginOAuthClient();
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      // "consent" (plutôt que "select_account") force Google à renvoyer un refresh_token
      // à chaque connexion, pas seulement au tout premier octroi du scope gmail.send —
      // sans ça, le compte Gmail ne se connecte pas automatiquement par défaut.
      prompt: "consent",
      scope: LOGIN_SCOPES,
    });
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Configuration OAuth Google manquante";
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(message)}`);
  }
}
