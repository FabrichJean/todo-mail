import { OAuth2Client } from "google-auth-library";

export const GMAIL_SEND_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

// Scope minimal pour la connexion (identité seulement, pas d'accès à l'envoi de mail).
export const LOGIN_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid",
];

export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET et GOOGLE_REDIRECT_URI doivent être définis dans .env"
    );
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

// Client OAuth dédié à la connexion (identité) — même app Google Cloud, mais une
// redirect URI différente de celle utilisée pour connecter un compte Gmail d'envoi.
export function getGoogleLoginOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_LOGIN_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET et GOOGLE_LOGIN_REDIRECT_URI doivent être définis dans .env"
    );
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export async function fetchGoogleUserEmail(accessToken: string): Promise<string> {
  const info = await fetchGoogleUserInfo(accessToken);
  return info.email;
}

export async function fetchGoogleUserInfo(
  accessToken: string
): Promise<{ email: string; name?: string; picture?: string }> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error("Impossible de récupérer les informations du compte Google");
  }
  const data = (await res.json()) as { email?: string; name?: string; picture?: string };
  if (!data.email) {
    throw new Error("Réponse Google sans adresse email");
  }
  return { email: data.email, name: data.name, picture: data.picture };
}
