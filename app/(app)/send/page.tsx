"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { renderTemplate, nl2br } from "@/lib/template";
import { interpolate } from "@/lib/i18n/interpolate";
import Select from "../../Select";
import { useI18n } from "../../I18nProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Account = { id: string; email: string; isActive: boolean };
type Template = { id: string; name: string; subject: string; body: string; variables: string };

export default function SendPage() {
  const { dict } = useI18n();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [accountId, setAccountId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [tab, setTab] = useState<"single" | "csv" | "list">("single");

  useEffect(() => {
    fetch("/api/gmail/accounts")
      .then((r) => r.json())
      .then((d) => setAccounts((d.accounts ?? []).filter((a: Account) => a.isActive)));
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []));
  }, []);

  const selectedTemplate = templates.find((t) => t.id === templateId) ?? null;
  const variables: string[] = useMemo(() => {
    if (!selectedTemplate) return [];
    try {
      return JSON.parse(selectedTemplate.variables) as string[];
    } catch {
      return [];
    }
  }, [selectedTemplate]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{dict.send.title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{dict.send.subtitle}</p>
      </div>

      <section className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 bg-white p-5 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.send.accountLabel}
          <Select
            value={accountId}
            onChange={setAccountId}
            options={accounts.map((a) => ({ value: a.id, label: a.email }))}
          />
          {accounts.length === 0 && <span className="text-xs text-zinc-500">{dict.send.noActiveAccount}</span>}
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.send.templateLabel}
          <Select
            value={templateId}
            onChange={setTemplateId}
            options={templates.map((t) => ({ value: t.id, label: t.name }))}
          />
        </label>
      </section>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <TabButton active={tab === "single"} onClick={() => setTab("single")}>
          {dict.send.tabSingle}
        </TabButton>
        <TabButton active={tab === "csv"} onClick={() => setTab("csv")}>
          {dict.send.tabCsv}
        </TabButton>
        <TabButton active={tab === "list"} onClick={() => setTab("list")}>
          {dict.send.tabList}
        </TabButton>
      </div>

      {tab === "single" && <SingleSend accountId={accountId} template={selectedTemplate} variables={variables} />}
      {tab === "csv" && <CsvSend accountId={accountId} template={selectedTemplate} variables={variables} />}
      {tab === "list" && <ListSend accountId={accountId} template={selectedTemplate} variables={variables} />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function SingleSend({
  accountId,
  template,
  variables,
}: {
  accountId: string;
  template: Template | null;
  variables: string[];
}) {
  const { dict } = useI18n();
  const [recipient, setRecipient] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const preview = template
    ? {
        subject: renderTemplate(template.subject, values),
        body: nl2br(renderTemplate(template.body, values)),
      }
    : null;

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/send/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, templateId: template?.id, recipient, variables: values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? dict.send.sendFailed });
        return;
      }
      setResult({ ok: true, message: dict.send.emailSent });
      setRecipient("");
    } finally {
      setSending(false);
    }
  }

  const canSend = accountId && template && recipient && !sending;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.send.recipientLabel}
          <input
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="input"
            placeholder="contact@exemple.com"
          />
        </label>
        {variables.map((v) => (
          <label key={v} className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            {`{{${v}}}`}
            <input
              value={values[v] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
              className="input"
            />
          </label>
        ))}
        {result && (
          <p className={`text-sm ${result.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {result.message}
          </p>
        )}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {sending ? dict.send.sending : dict.send.sendButton}
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">{dict.send.previewTitle}</h2>
        {preview ? (
          <>
            <p className="mb-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{preview.subject}</p>
            <div
              className="prose prose-sm max-w-none text-zinc-700 dark:text-zinc-300"
              dangerouslySetInnerHTML={{ __html: preview.body }}
            />
          </>
        ) : (
          <p className="text-sm text-zinc-500">{dict.send.previewEmpty}</p>
        )}
      </div>
    </div>
  );
}

type CsvRow = { email: string; variables: Record<string, string> };

function CsvSend({
  accountId,
  template,
  variables,
}: {
  accountId: string;
  template: Template | null;
  variables: string[];
}) {
  const { dict } = useI18n();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [emailColumn, setEmailColumn] = useState("");
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ email: string; status: string; error?: string }[] | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setHeaders(res.meta.fields ?? []);
        setRawRows(res.data);
        setResults(null);
      },
    });
  }

  const rows: CsvRow[] = useMemo(() => {
    if (!emailColumn) return [];
    return rawRows
      .map((row) => ({
        email: row[emailColumn]?.trim() ?? "",
        variables: Object.fromEntries(
          variables.map((v) => [v, row[mapping[v] ?? ""] ?? ""])
        ),
      }))
      .filter((r) => r.email);
  }, [rawRows, emailColumn, mapping, variables]);

  async function handleSend() {
    if (!template || !accountId || rows.length === 0) return;
    setSending(true);
    setResults(null);
    try {
      const res = await fetch("/api/send/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, templateId: template.id, rows }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setSending(false);
    }
  }

  const canSend = accountId && template && rows.length > 0 && !sending;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.send.csvFileLabel}
          <input type="file" accept=".csv" onChange={handleFile} className="input" />
        </label>

        {headers.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              {dict.send.csvEmailColumn}
              <Select value={emailColumn} onChange={setEmailColumn} options={headers.map((h) => ({ value: h, label: h }))} />
            </label>
            {variables.map((v) => (
              <label key={v} className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                {`${dict.send.csvVariableColumnPrefix} {{${v}}}`}
                <Select
                  value={mapping[v] ?? ""}
                  onChange={(value) => setMapping((prev) => ({ ...prev, [v]: value }))}
                  options={headers.map((h) => ({ value: h, label: h }))}
                />
              </label>
            ))}
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2">{dict.send.csvEmailHeader}</th>
                {variables.map((v) => (
                  <th key={v} className="px-4 py-2">
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.slice(0, 10).map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">{row.email}</td>
                  {variables.map((v) => (
                    <td key={v} className="px-4 py-2">
                      {row.variables[v]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 10 && (
            <p className="px-4 py-2 text-xs text-zinc-500">
              {interpolate(dict.send.csvMoreRows, { count: rows.length - 10 })}
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={!canSend}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {sending
          ? interpolate(dict.send.sendingProgress, { count: rows.length })
          : interpolate(dict.send.sendToCount, { count: rows.length })}
      </button>

      <SendResults results={results} dict={dict} />
    </div>
  );
}

function SendResults({
  results,
  dict,
}: {
  results: { email: string; status: string; error?: string }[] | null;
  dict: Dictionary;
}) {
  if (!results) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">{dict.send.resultsTitle}</h2>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {results.map((r, i) => (
          <li key={i} className="flex items-center justify-between py-2 text-sm">
            <span>{r.email}</span>
            <span
              className={r.status === "sent" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
            >
              {r.status === "sent"
                ? dict.common.sent
                : interpolate(dict.send.failedWithReason, { error: r.error ?? "" })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function parseEmailList(text: string): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const raw of text.split(/[\s,]+/)) {
    const email = raw.trim();
    if (email && !seen.has(email)) {
      seen.add(email);
      emails.push(email);
    }
  }
  return emails;
}

function ListSend({
  accountId,
  template,
  variables,
}: {
  accountId: string;
  template: Template | null;
  variables: string[];
}) {
  const { dict } = useI18n();
  const [rawText, setRawText] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ email: string; status: string; error?: string }[] | null>(null);

  const emails = useMemo(() => parseEmailList(rawText), [rawText]);

  async function handleSend() {
    if (!template || !accountId || emails.length === 0) return;
    setSending(true);
    setResults(null);
    try {
      const rows = emails.map((email) => ({ email, variables: values }));
      const res = await fetch("/api/send/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, templateId: template.id, rows }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setSending(false);
    }
  }

  const canSend = accountId && template && emails.length > 0 && !sending;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.send.listLabel}
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={8}
            className="input font-mono text-xs"
            placeholder={"jean@exemple.com\nmarie@exemple.com, paul@exemple.com"}
          />
        </label>
        <p className="mt-1 text-xs text-zinc-500">{interpolate(dict.send.listDetectedCount, { count: emails.length })}</p>

        {variables.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {variables.map((v) => (
              <label key={v} className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                {`{{${v}}} ${dict.send.listSameValueHint}`}
                <input
                  value={values[v] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                  className="input"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={!canSend}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {sending
          ? interpolate(dict.send.sendingProgress, { count: emails.length })
          : interpolate(dict.send.sendToCount, { count: emails.length })}
      </button>

      <SendResults results={results} dict={dict} />
    </div>
  );
}
