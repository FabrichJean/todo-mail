import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractVariables } from "@/lib/template";
import { getSession } from "@/lib/auth/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const template = await prisma.template.findFirst({ where: { id, userId: session.userId } });
  if (!template) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }
  return NextResponse.json({ template });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { name, subject, body } = (await request.json()) as {
    name?: string;
    subject?: string;
    body?: string;
  };

  if (!name || !subject || !body) {
    return NextResponse.json({ error: "name, subject et body sont requis" }, { status: 400 });
  }

  const variables = extractVariables(subject, body);

  const { count } = await prisma.template.updateMany({
    where: { id, userId: session.userId },
    data: { name, subject, body, variables: JSON.stringify(variables) },
  });

  if (count === 0) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }

  const template = await prisma.template.findUnique({ where: { id } });
  return NextResponse.json({ template });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { count } = await prisma.template.deleteMany({ where: { id, userId: session.userId } });
  if (count === 0) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
