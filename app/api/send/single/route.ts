import { NextRequest, NextResponse } from "next/server";
import { sendTemplatedEmail } from "@/lib/mailer";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { accountId, templateId, recipient, variables } = (await request.json()) as {
    accountId?: string;
    templateId?: string;
    recipient?: string;
    variables?: Record<string, string>;
  };

  if (!accountId || !recipient) {
    return NextResponse.json({ error: "accountId et recipient sont requis" }, { status: 400 });
  }

  const result = await sendTemplatedEmail({ userId: session.userId, accountId, templateId, recipient, variables });

  if (result.status === "failed") {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
