"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "../../I18nProvider";
import { IconGoogle } from "../../icons";

type Account = {
  id: string;
  email: string;
  type: string;
  displayName: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function ConnectClient() {
  const { dict } = useI18n();
  const searchParams = useSearchParams();
  const oauthSuccess = searchParams.get("success");
  const oauthError = searchParams.get("error");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tab, setTab] = useState<"oauth" | "smtp">("oauth");
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  async function loadAccounts() {
    const res = await fetch("/api/gmail/accounts");
    const data = await res.json();
    setAccounts(data.accounts ?? []);
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleSmtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(false);
    try {
      const res = await fetch("/api/gmail/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, appPassword, displayName: displayName || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? dict.connect.unknownError);
        return;
      }
      setFormSuccess(true);
      setEmail("");
      setAppPassword("");
      setDisplayName("");
      await loadAccounts();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDisconnect(id: string) {
    if (!confirm(dict.connect.disconnectConfirm)) return;
    await fetch(`/api/gmail/accounts/${id}`, { method: "DELETE" });
    await loadAccounts();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{dict.connect.title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{dict.connect.subtitle}</p>
      </div>

      {oauthSuccess && (
        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          {dict.connect.oauthSuccess}
        </div>
      )}
      {oauthError && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
          {dict.connect.oauthErrorPrefix} {oauthError}
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
          <TabButton active={tab === "oauth"} onClick={() => setTab("oauth")}>
            {dict.connect.tabAuto}
          </TabButton>
          <TabButton active={tab === "smtp"} onClick={() => setTab("smtp")}>
            {dict.connect.tabManual}
          </TabButton>
        </div>

        {tab === "oauth" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{dict.connect.oauthDescription}</p>
            <a
              href="/api/gmail/oauth/start"
              className="inline-flex w-fit items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700"
            >
              <IconGoogle className="h-4 w-4 shrink-0" />
              {dict.connect.connectWithGoogle}
            </a>
          </div>
        ) : (
          <form onSubmit={handleSmtpSubmit} className="flex flex-col gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {dict.connect.smtpDescriptionPrefix}{" "}
              <a
                className="underline"
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
              >
                {dict.connect.appPasswordLink}
              </a>{" "}
              {dict.connect.smtpDescriptionSuffix}
            </p>
            <Field label={dict.connect.emailLabel}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="prenom@gmail.com"
              />
            </Field>
            <Field label={dict.connect.appPasswordLabel}>
              <input
                type="password"
                required
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                className="input"
                placeholder="xxxx xxxx xxxx xxxx"
              />
            </Field>
            <Field label={dict.connect.displayNameLabel}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder={dict.connect.displayNamePlaceholder}
              />
            </Field>
            {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
            {formSuccess && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{dict.connect.accountConnected}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {submitting ? dict.connect.connecting : dict.connect.connectAccount}
            </button>
          </form>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">{dict.connect.connectedAccounts}</h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-zinc-500">{dict.connect.noAccounts}</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {accounts.map((account) => (
              <li key={account.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="text-zinc-800 dark:text-zinc-200">{account.email}</p>
                  <p className="text-xs text-zinc-500">
                    {account.type === "oauth" ? dict.common.oauthGoogle : dict.common.smtp}
                    {account.displayName ? ` · ${account.displayName}` : ""}
                    {!account.isActive ? ` · ${dict.connect.disabled}` : ""}
                  </p>
                </div>
                {account.isActive && (
                  <button
                    onClick={() => handleDisconnect(account.id)}
                    className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {dict.connect.disconnect}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
        active
          ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
          : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
      {label}
      {children}
    </label>
  );
}
