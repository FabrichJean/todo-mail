import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, isAdminEmail } from "@/lib/auth/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const { banned } = (await request.json()) as { banned?: boolean };
  if (typeof banned !== "boolean") {
    return NextResponse.json({ error: "banned (booléen) requis" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
  if (isAdminEmail(target.email)) {
    return NextResponse.json({ error: "Impossible de modifier le compte administrateur" }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { isBanned: banned } });

  // Bannir coupe aussi immédiatement toutes ses sessions actives.
  if (banned) {
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  return NextResponse.json({ success: true });
}
