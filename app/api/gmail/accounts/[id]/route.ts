import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// Déconnecte le compte : efface les identifiants stockés et désactive le compte
// (au lieu d'une suppression définitive) pour conserver l'historique d'envoi lié.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { count } = await prisma.gmailAccount.updateMany({
    where: { id, userId: session.userId },
    data: {
      isActive: false,
      refreshToken: null,
      accessToken: null,
      appPassword: null,
      tokenExpiry: null,
    },
  });

  if (count === 0) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
