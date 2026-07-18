import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthClient, fetchGoogleUserEmail } from "@/lib/google-oauth";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  if (oauthError) {
    return NextResponse.redirect(`${appUrl}/connect?error=${encodeURIComponent(oauthError)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${appUrl}/connect?error=missing_code`);
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(`${appUrl}/connect?error=no_refresh_token`);
    }

    const email = await fetchGoogleUserEmail(tokens.access_token);
    const userId = session.userId;

    await prisma.gmailAccount.upsert({
      where: { userId_email: { userId, email } },
      create: {
        userId,
        email,
        type: "oauth",
        refreshToken: encrypt(tokens.refresh_token),
        accessToken: encrypt(tokens.access_token),
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      update: {
        type: "oauth",
        refreshToken: encrypt(tokens.refresh_token),
        accessToken: encrypt(tokens.access_token),
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        isActive: true,
      },
    });

    return NextResponse.redirect(`${appUrl}/connect?success=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.redirect(`${appUrl}/connect?error=${encodeURIComponent(message)}`);
  }
}
