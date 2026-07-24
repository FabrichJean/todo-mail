import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardActions from "./DashboardActions";
import SendLimitBanner from "../SendLimitBanner";
import { getServerDictionary } from "@/lib/i18n/server";
import { requireUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await requireUser();
  const [{ dict }, accounts, templateCount, sentToday, recentSends] = await Promise.all([
    getServerDictionary(),
    prisma.gmailAccount.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.template.count({ where: { userId: user.id } }),
    prisma.sentEmail.count({
      where: { userId: user.id, sentAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.sentEmail.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { sentAt: "desc" },
      include: { gmailAccount: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{dict.dashboard.title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{dict.dashboard.subtitle}</p>
        </div>
        <DashboardActions />
      </div>

      <div className="card flex divide-x divide-border p-5">
        <Stat label={dict.dashboard.statAccounts} value={accounts.length} />
        <Stat label={dict.dashboard.statTemplates} value={templateCount} />
        <Stat label={dict.dashboard.statSentToday} value={sentToday} />
      </div>

      <SendLimitBanner />

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground">{dict.dashboard.connectedAccounts}</h2>
          <Link href="/connect" className="text-sm font-medium text-accent hover:underline">
            {dict.dashboard.manage}
          </Link>
        </div>
        {accounts.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {dict.dashboard.noAccount}{" "}
            <Link href="/connect" className="underline">
              {dict.dashboard.connectAccountCta}
            </Link>{" "}
            {dict.dashboard.noAccountSuffix}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {accounts.map((account) => (
              <li key={account.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-zinc-800 dark:text-zinc-200">{account.email}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {account.type === "oauth" ? dict.common.oauthGoogle : dict.common.smtp}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground">{dict.dashboard.recentSends}</h2>
          <Link href="/history" className="text-sm font-medium text-accent hover:underline">
            {dict.dashboard.seeAll}
          </Link>
        </div>
        {recentSends.length === 0 ? (
          <p className="text-sm text-zinc-500">{dict.dashboard.noSends}</p>
        ) : (
          <ul className="divide-y divide-border">
            {recentSends.map((sent) => (
              <li key={sent.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="text-zinc-800 dark:text-zinc-200">{sent.recipient}</p>
                  <p className="text-xs text-zinc-500">
                    {dict.dashboard.from} {sent.gmailAccount.email}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    sent.status === "sent"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                  }`}
                >
                  {sent.status === "sent" ? dict.common.sent : dict.common.failed}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 px-4 text-center first:pl-0 last:pr-0">
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
