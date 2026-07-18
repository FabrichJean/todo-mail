import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractVariables } from "@/lib/template";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const templates = await prisma.template.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { name, subject, body } = (await request.json()) as {
    name?: string;
    subject?: string;
    body?: string;
  };

  if (!name || !subject || !body) {
    return NextResponse.json({ error: "name, subject et body sont requis" }, { status: 400 });
  }

  const variables = extractVariables(subject, body);

  const template = await prisma.template.create({
    data: { userId: session.userId, name, subject, body, variables: JSON.stringify(variables) },
  });

  return NextResponse.json({ template });
}
