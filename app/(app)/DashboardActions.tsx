"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../I18nProvider";

export default function DashboardActions() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { dict } = useI18n();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex shrink-0">
      <Link
        href="/send"
        className="rounded-l-md bg-surface px-3 py-2 text-sm text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        {dict.dashboardActions.sendEmail}
      </Link>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={dict.dashboardActions.moreActions}
        aria-expanded={open}
        className="flex items-center rounded-r-md border-l border-accent-foreground/20 bg-surface px-2 hover:bg-zinc-100 hover:opacity-90 dark:hover:bg-zinc-900"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-10 mt-2 w-52 rounded-lg border border-border bg-surface p-1 shadow-lg">
          <Link
            href="/templates"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            {dict.dashboardActions.manageTemplates}
          </Link>
        </div>
      )}
    </div>
  );
}
