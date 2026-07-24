import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [userCount, accountCount, templateCount, totalSent, totalFailed, sent24h, sent7d, sent30d] =
    await Promise.all([
      prisma.user.count(),
      prisma.gmailAccount.count({ where: { isActive: true } }),
      prisma.template.count(),
      prisma.sentEmail.count({ where: { status: "sent" } }),
      prisma.sentEmail.count({ where: { status: "failed" } }),
      prisma.sentEmail.count({ where: { status: "sent", sentAt: { gte: since24h } } }),
      prisma.sentEmail.count({ where: { status: "sent", sentAt: { gte: since7d } } }),
      prisma.sentEmail.count({ where: { status: "sent", sentAt: { gte: since30d } } }),
    ]);

  return NextResponse.json({
    stats: { userCount, accountCount, templateCount, totalSent, totalFailed, sent24h, sent7d, sent30d },
  });
}
