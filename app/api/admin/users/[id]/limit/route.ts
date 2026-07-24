import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, isAdminEmail } from "@/lib/auth/admin";

const VALID_PERIODS = new Set(["day", "week", "month"]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const { count, period } = (await request.json()) as { count?: number | null; period?: string | null };

  if (count != null) {
    if (typeof count !== "number" || !Number.isInteger(count) || count <= 0) {
      return NextResponse.json({ error: "count doit être un entier positif" }, { status: 400 });
    }
    if (!period || !VALID_PERIODS.has(period)) {
      return NextResponse.json({ error: "period doit être day, week ou month" }, { status: 400 });
    }
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
  if (isAdminEmail(target.email)) {
    return NextResponse.json({ error: "Impossible de modifier le compte administrateur" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id },
    data: {
      sendLimitCount: count ?? null,
      sendLimitPeriod: count != null ? period : null,
    },
  });

  return NextResponse.json({ success: true });
}
