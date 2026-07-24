import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, isAdminEmail } from "@/lib/auth/admin";

// Suppression du compte utilisateur uniquement : ses données (comptes Gmail, templates,
// historique d'envoi) sont détachées (userId mis à null) et conservées, pas supprimées.
// Seules ses sessions de connexion disparaissent (onDelete: Cascade). Irréversible pour
// le compte lui-même.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
  if (isAdminEmail(target.email)) {
    return NextResponse.json({ error: "Impossible de supprimer le compte administrateur" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.gmailAccount.updateMany({ where: { userId: id }, data: { userId: null } }),
    prisma.template.updateMany({ where: { userId: id }, data: { userId: null } }),
    prisma.sentEmail.updateMany({ where: { userId: id }, data: { userId: null } }),
    prisma.user.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}
