"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "../../Select";
import { useI18n } from "../../I18nProvider";
import { interpolate } from "@/lib/i18n/interpolate";

type SentEmail = {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  error: string | null;
  sentAt: string;
  gmailAccount: { email: string };
  template: { name: string } | null;
};

const INTL_LOCALE: Record<string, string> = { fr: "fr-FR", en: "en-US" };

export default function HistoryPage() {
  const { dict, locale } = useI18n();
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [status, setStatus] = useState<"" | "sent" | "failed">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    fetch(`/api/history?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setSentEmails(d.sentEmails ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  const stats = useMemo(() => {
    const sent = sentEmails.filter((e) => e.status === "sent").length;
    const failed = sentEmails.filter((e) => e.status === "failed").length;
    return { sent, failed };
  }, [sentEmails]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{dict.history.title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {interpolate(dict.history.subtitle, { sent: stats.sent, failed: stats.failed })}
          </p>
        </div>
        <Select
          value={status}
          onChange={(v) => setStatus(v as typeof status)}
          className="w-44"
          options={[
            { value: "", label: dict.history.filterAll },
            { value: "sent", label: dict.history.filterSent },
            { value: "failed", label: dict.history.filterFailed },
          ]}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-2">{dict.history.colDate}</th>
              <th className="px-4 py-2">{dict.history.colRecipient}</th>
              <th className="px-4 py-2">{dict.history.colSubject}</th>
              <th className="px-4 py-2">{dict.history.colAccount}</th>
              <th className="px-4 py-2">{dict.history.colTemplate}</th>
              <th className="px-4 py-2">{dict.history.colStatus}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-zinc-500">
                  {dict.history.loading}
                </td>
              </tr>
            ) : sentEmails.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-zinc-500">
                  {dict.history.noResults}
                </td>
              </tr>
            ) : (
              sentEmails.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-zinc-500">
                    {new Date(e.sentAt).toLocaleString(INTL_LOCALE[locale] ?? "fr-FR")}
                  </td>
                  <td className="px-4 py-2">{e.recipient}</td>
                  <td className="px-4 py-2 max-w-[200px] truncate">{e.subject}</td>
                  <td className="px-4 py-2">{e.gmailAccount.email}</td>
                  <td className="px-4 py-2">{e.template?.name ?? "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        e.status === "sent"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      }`}
                      title={e.error ?? undefined}
                    >
                      {e.status === "sent" ? dict.common.sent : dict.common.failed}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
