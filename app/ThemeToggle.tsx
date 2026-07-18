"use client";

import { useEffect, useState } from "react";
import { IconSun, IconMoon, IconAuto } from "./icons";
import { useI18n } from "./I18nProvider";
import SidebarDropdown from "./SidebarDropdown";

type ThemeChoice = "system" | "light" | "dark";

function applyTheme(choice: ThemeChoice) {
  const isDark =
    choice === "dark" || (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export default function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>("dark");
  const { dict } = useI18n();

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as ThemeChoice | null) ?? "dark";
    setChoice(stored);
  }, []);

  function select(next: ThemeChoice) {
    setChoice(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  const currentIcon = choice === "light" ? IconSun : choice === "dark" ? IconMoon : IconAuto;

  return (
    <SidebarDropdown
      triggerIcon={currentIcon}
      triggerLabel={dict.theme.label}
      value={choice}
      onChange={select}
      options={[
        { value: "light", label: dict.theme.light, icon: IconSun },
        { value: "dark", label: dict.theme.dark, icon: IconMoon },
        { value: "system", label: dict.theme.system, icon: IconAuto },
      ]}
    />
  );
}
