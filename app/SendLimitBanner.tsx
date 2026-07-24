"use client";

import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";

type Usage = {
  isBanned: boolean;
  sendDisabled: boolean;
  limitCount: number | null;
  limitPeriod: string | null;
  used: number;
};

export default function SendLimitBanner() {
  const { dict } = useI18n();
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    fetch("/api/send-limit")
      .then((r) => r.json())
      .then((data) => setUsage(data.usage ?? null));
  }, []);

  if (!usage || (!usage.sendDisabled && usage.limitCount == null)) return null;

  const d = dict.sendLimit;
  const periodLabel = usage.limitPeriod === "week" ? d.periodWeek : usage.limitPeriod === "month" ? d.periodMonth : d.periodDay;
  const reached = usage.limitCount != null && usage.used >= usage.limitCount;

  return (
    <div className={`card flex flex-col gap-2 p-4 ${usage.sendDisabled || reached ? "border-red-200 dark:border-red-900" : ""}`}>
      <p className="text-sm font-medium text-foreground">{d.title}</p>
      {usage.sendDisabled ? (
        <p className="text-sm text-red-600 dark:text-red-400">{d.disabled}</p>
      ) : (
        usage.limitCount != null && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className={reached ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"}>
                {usage.used} / {usage.limitCount} {periodLabel}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all ${reached ? "bg-red-500" : "bg-accent"}`}
                style={{ width: `${Math.min(100, (usage.used / usage.limitCount) * 100)}%` }}
              />
            </div>
            {reached && <p className="text-xs text-red-600 dark:text-red-400">{d.limitReached}</p>}
          </>
        )
      )}
    </div>
  );
}
