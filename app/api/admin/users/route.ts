import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, isAdminEmail } from "@/lib/auth/admin";
import { getSendUsage } from "@/lib/send-limit";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [users, recentCounts] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { gmailAccounts: true, templates: true, sentEmails: true } },
      },
    }),
    prisma.sentEmail.groupBy({
      by: ["userId"],
      where: { status: "sent", sentAt: { gte: since24h }, userId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const recentMap = new Map(recentCounts.map((r) => [r.userId, r._count._all]));

  // Usage dans la fenêtre du quota configuré (day/week/month) — distinct de sentLast24h,
  // qui est toujours une fenêtre glissante de 24h peu importe la période choisie.
  const usageEntries = await Promise.all(
    users.filter((u) => u.sendLimitCount != null).map(async (u) => [u.id, await getSendUsage(u.id)] as const)
  );
  const usageMap = new Map(usageEntries);

  const result = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
    isBanned: u.isBanned,
    sendDisabled: u.sendDisabled,
    sendLimitCount: u.sendLimitCount,
    sendLimitPeriod: u.sendLimitPeriod,
    sendLimitUsed: usageMap.get(u.id)?.used ?? 0,
    accountsCount: u._count.gmailAccounts,
    templatesCount: u._count.templates,
    sentTotal: u._count.sentEmails,
    sentLast24h: recentMap.get(u.id) ?? 0,
    isAdmin: isAdminEmail(u.email),
  }));

  return NextResponse.json({ users: result });
}
