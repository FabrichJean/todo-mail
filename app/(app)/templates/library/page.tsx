"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "../../../I18nProvider";
import { TEMPLATE_LIBRARY } from "@/lib/template-library";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function TemplateLibraryPage() {
  const { dict, locale } = useI18n();
  const router = useRouter();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function useTemplate(id: string) {
    const item = TEMPLATE_LIBRARY.find((t) => t.id === id);
    if (!item) return;
    const content = item[locale];
    setAddingId(id);
    setError(null);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: content.name, subject: content.subject, body: content.body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur inconnue");
        return;
      }
      router.push(`/templates/${data.template.id}`);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{dict.templates.library.pageTitle}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{dict.templates.library.pageSubtitle}</p>
        </div>
        <Link
          href="/templates"
          className="w-fit shrink-0 rounded-md border border-border px-4 py-2 text-sm font-medium whitespace-nowrap text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          {dict.templates.library.backToTemplates}
        </Link>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_LIBRARY.map((item) => {
          const content = item[locale];
          return (
            <div key={item.id} className="card flex flex-col gap-3 p-5">
              <span className="w-fit rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                {dict.templates.library.categories[item.category as keyof typeof dict.templates.library.categories]}
              </span>
              <div>
                <h2 className="font-medium text-foreground">{content.name}</h2>
                <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{content.subject}</p>
              </div>
              <p className="line-clamp-3 flex-1 text-sm text-zinc-500">{stripHtml(content.body)}</p>
              <button
                type="button"
                onClick={() => useTemplate(item.id)}
                disabled={addingId === item.id}
                className="glow-accent w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
              >
                {addingId === item.id ? dict.templates.library.using : dict.templates.library.useTemplate}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
