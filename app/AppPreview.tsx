"use client";

import { useEffect, useState } from "react";

const PANEL_COUNT = 3;
const INTERVAL_MS = 3500;

function Bar({ width, accent, tone = "base" }: { width: string; accent?: boolean; tone?: "base" | "soft" }) {
  return (
    <div
      className={`h-2 rounded-full ${
        accent ? "bg-accent/70" : tone === "soft" ? "bg-zinc-100 dark:bg-zinc-800" : "bg-zinc-200 dark:bg-zinc-700"
      }`}
      style={{ width }}
    />
  );
}

function Pill({ width, tone = "base" }: { width: string; tone?: "base" | "danger" }) {
  return (
    <div
      className={`h-5 rounded-full border ${
        tone === "danger" ? "border-red-200 dark:border-red-900" : "border-zinc-200 dark:border-zinc-700"
      }`}
      style={{ width }}
    />
  );
}

function DashboardMock() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 rounded-lg border border-border p-2">
            <div className={`mx-auto h-3 w-6 rounded ${i === 0 ? "bg-accent/70" : "bg-zinc-200 dark:bg-zinc-700"}`} />
            <div className="mx-auto mt-1.5 h-1.5 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
        <Bar width="35%" />
        {["78%", "62%", "70%"].map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <Bar width={w} tone="soft" />
            <div
              className={`h-3 w-9 shrink-0 rounded-full ${
                i === 1 ? "bg-red-100 dark:bg-red-900/40" : "bg-emerald-100 dark:bg-emerald-900/40"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplatesMock() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Bar width="30%" />
        <div className="h-5 w-16 rounded-md bg-accent/70" />
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
        {["55%", "70%", "45%"].map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-2 py-0.5">
            <div className="flex flex-col gap-1">
              <Bar width={w} />
              <Bar width="35%" tone="soft" />
            </div>
            <div className="flex shrink-0 gap-1">
              <Pill width="2.5rem" />
              <Pill width="2.5rem" tone="danger" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SendMock() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2">
        <div className="flex-1 rounded-lg border border-border p-2">
          <Bar width="60%" tone="soft" />
        </div>
        <div className="flex-1 rounded-lg border border-border p-2">
          <Bar width="60%" tone="soft" />
        </div>
      </div>
      <div className="flex gap-3 border-b border-border pb-1.5">
        <div className="h-1.5 w-10 rounded-full bg-accent/70" />
        <div className="h-1.5 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-1.5 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
        <Bar width="80%" tone="soft" />
        <Bar width="65%" tone="soft" />
        <Bar width="70%" tone="soft" />
        <div className="mt-1 h-5 w-16 rounded-md bg-accent/70" />
      </div>
    </div>
  );
}

const PANELS = [DashboardMock, TemplatesMock, SendMock];

export default function AppPreview() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % PANEL_COUNT), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="animate-float mx-auto w-full max-w-sm">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
        <div className="flex">
          <div className="flex w-12 shrink-0 flex-col items-center gap-3 border-r border-border py-3">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                  i === index ? "glow-accent bg-accent" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
          <div className="relative h-56 flex-1 overflow-hidden p-3">
            {PANELS.map((Panel, i) => (
              <div
                key={i}
                className={`absolute inset-3 transition-all duration-700 ease-out ${
                  i === index ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
              >
                <Panel />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {PANELS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Aperçu ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-5 bg-accent" : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
