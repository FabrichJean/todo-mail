import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const accountId = request.nextUrl.searchParams.get("accountId");
  const templateId = request.nextUrl.searchParams.get("templateId");

  const sentEmails = await prisma.sentEmail.findMany({
    where: {
      userId: session.userId,
      ...(status ? { status } : {}),
      ...(accountId ? { gmailAccountId: accountId } : {}),
      ...(templateId ? { templateId } : {}),
    },
    include: {
      gmailAccount: { select: { email: true } },
      template: { select: { name: true } },
    },
    orderBy: { sentAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ sentEmails });
}
