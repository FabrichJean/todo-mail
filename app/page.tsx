import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardActions from "./DashboardActions";

export default async function Home() {
  const [accounts, templateCount, sentToday, recentSends] = await Promise.all([
    prisma.gmailAccount.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
    prisma.template.count(),
    prisma.sentEmail.count({
      where: { sentAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.sentEmail.findMany({
      take: 5,
      orderBy: { sentAt: "desc" },
      include: { gmailAccount: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* <p className="text-xs font-semibold tracking-wide text-accent uppercase">Prospection</p> */}
          <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Vue d&apos;ensemble de tes comptes Gmail connectés et de tes envois.
          </p>
        </div>
        <DashboardActions />
      </div>

      <div className="card flex divide-x divide-border p-5">
        <Stat label="Comptes actifs" value={accounts.length} />
        <Stat label="Templates" value={templateCount} />
        <Stat label="Envoyés aujourd'hui" value={sentToday} />
      </div>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground">Comptes Gmail connectés</h2>
          <Link href="/connect" className="text-sm font-medium text-accent hover:underline">
            Gérer
          </Link>
        </div>
        {accounts.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucun compte connecté. <Link href="/connect" className="underline">Connecte un compte Gmail</Link> pour
            commencer à envoyer des emails.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {accounts.map((account) => (
              <li key={account.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-zinc-800 dark:text-zinc-200">{account.email}</span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {account.type === "oauth" ? "OAuth Google" : "SMTP"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground">Derniers envois</h2>
          <Link href="/history" className="text-sm font-medium text-accent hover:underline">
            Voir tout
          </Link>
        </div>
        {recentSends.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucun email envoyé pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recentSends.map((sent) => (
              <li key={sent.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="text-zinc-800 dark:text-zinc-200">{sent.recipient}</p>
                  <p className="text-xs text-zinc-500">depuis {sent.gmailAccount.email}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    sent.status === "sent"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                  }`}
                >
                  {sent.status === "sent" ? "Envoyé" : "Échec"}
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
