import { prisma } from "@/lib/prisma";

const PERIOD_MS: Record<string, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

export type SendUsage = {
  isBanned: boolean;
  sendDisabled: boolean;
  limitCount: number | null;
  limitPeriod: string | null;
  used: number;
};

// Fenêtres glissantes (dernières 24h / 7j / 30j) plutôt qu'alignées sur le calendrier —
// plus simple et sans ambiguïté de fuseau horaire pour un quota configuré par l'admin.
export async function getSendUsage(userId: string): Promise<SendUsage | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true, sendDisabled: true, sendLimitCount: true, sendLimitPeriod: true },
  });
  if (!user) return null;

  let used = 0;
  if (user.sendLimitCount != null && user.sendLimitPeriod) {
    const windowMs = PERIOD_MS[user.sendLimitPeriod];
    if (windowMs) {
      const since = new Date(Date.now() - windowMs);
      used = await prisma.sentEmail.count({
        where: { userId, status: "sent", sentAt: { gte: since } },
      });
    }
  }

  return {
    isBanned: user.isBanned,
    sendDisabled: user.sendDisabled,
    limitCount: user.sendLimitCount,
    limitPeriod: user.sendLimitPeriod,
    used,
  };
}

export type SendCheckResult = { allowed: true } | { allowed: false; reason: string };

export async function checkSendAllowed(userId: string): Promise<SendCheckResult> {
  const usage = await getSendUsage(userId);

  if (!usage) {
    return { allowed: false, reason: "Utilisateur introuvable" };
  }
  if (usage.isBanned) {
    return { allowed: false, reason: "Compte banni" };
  }
  if (usage.sendDisabled) {
    return { allowed: false, reason: "Envoi désactivé pour ce compte par l'administrateur" };
  }
  if (usage.limitCount != null && usage.used >= usage.limitCount) {
    return {
      allowed: false,
      reason: `Limite d'envoi atteinte (${usage.limitCount} / ${usage.limitPeriod})`,
    };
  }

  return { allowed: true };
}
