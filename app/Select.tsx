"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

export default function Select({ value, onChange, options, placeholder, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { dict } = useI18n();
  const resolvedPlaceholder = placeholder ?? dict.common.select;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input flex w-full items-center justify-between gap-2 text-left"
      >
        <span className={selected ? "" : "text-zinc-500"}>{selected ? selected.label : resolvedPlaceholder}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 max-h-64 w-full min-w-max overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-zinc-500">{dict.common.noOption}</p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm whitespace-nowrap ${
                  opt.value === value
                    ? "bg-accent/15 font-medium text-accent"
                    : "text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
