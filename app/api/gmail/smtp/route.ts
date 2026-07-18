import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { email, appPassword, displayName } = body as {
    email?: string;
    appPassword?: string;
    displayName?: string;
  };

  if (!email || !appPassword) {
    return NextResponse.json({ error: "email et appPassword sont requis" }, { status: 400 });
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: email, pass: appPassword },
  });

  try {
    await transport.verify();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connexion SMTP impossible";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const account = await prisma.gmailAccount.upsert({
    where: { userId_email: { userId: session.userId, email } },
    create: {
      userId: session.userId,
      email,
      type: "smtp",
      displayName,
      appPassword: encrypt(appPassword),
    },
    update: {
      type: "smtp",
      displayName,
      appPassword: encrypt(appPassword),
      isActive: true,
    },
    select: { id: true, email: true, type: true, displayName: true, isActive: true, createdAt: true },
  });

  return NextResponse.json({ account });
}
