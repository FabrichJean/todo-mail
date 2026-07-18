import { NextRequest, NextResponse } from "next/server";
import { sendTemplatedEmail } from "@/lib/mailer";
import { getSession } from "@/lib/auth/session";

const DELAY_BETWEEN_SENDS_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { accountId, templateId, rows } = (await request.json()) as {
    accountId?: string;
    templateId?: string;
    rows?: { email: string; variables?: Record<string, string> }[];
  };

  if (!accountId || !templateId || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "accountId, templateId et rows (non vide) sont requis" },
      { status: 400 }
    );
  }

  const results: { email: string; status: "sent" | "failed"; error?: string }[] = [];

  for (const [index, row] of rows.entries()) {
    if (index > 0) {
      await sleep(DELAY_BETWEEN_SENDS_MS);
    }
    const result = await sendTemplatedEmail({
      userId: session.userId,
      accountId,
      templateId,
      recipient: row.email,
      variables: row.variables,
    });
    results.push(
      result.status === "sent"
        ? { email: row.email, status: "sent" }
        : { email: row.email, status: "failed", error: result.error }
    );
  }

  return NextResponse.json({ results });
}
