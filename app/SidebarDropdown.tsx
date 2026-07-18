"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronRight } from "./icons";

type IconComponent = (props: { className?: string }) => React.ReactElement;

export type SidebarDropdownOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconComponent;
};

type Props<T extends string> = {
  triggerIcon: IconComponent;
  triggerLabel: string;
  value: T;
  options: SidebarDropdownOption<T>[];
  onChange: (value: T) => void;
};

export default function SidebarDropdown<T extends string>({
  triggerIcon: TriggerIcon,
  triggerLabel,
  value,
  options,
  onChange,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors ${
          open
            ? "bg-accent/15 text-accent"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        }`}
      >
        <TriggerIcon className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-left">{triggerLabel}</span>
        <span className="text-xs text-zinc-500">{current?.label}</span>
        <IconChevronRight className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-lg border border-border bg-surface p-1 shadow-lg md:top-auto md:bottom-0 md:left-full md:mt-0 md:ml-2 md:w-44">
          {options.map((opt) => {
            const Icon = opt.icon;
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? "bg-accent/15 font-medium text-accent"
                    : "text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="flex-1">{opt.label}</span>
                {active && <span className="glow-accent h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
