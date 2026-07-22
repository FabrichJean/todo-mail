"use client";

import { useI18n } from "./I18nProvider";
import SidebarDropdown from "./SidebarDropdown";
import { IconGlobe } from "./icons";
import type { Locale } from "@/lib/i18n/config";

export default function LanguageToggle() {
  const { locale, dict, setLocale } = useI18n();

  return (
    <SidebarDropdown<Locale>
      triggerIcon={IconGlobe}
      triggerLabel={dict.language.label}
      value={locale}
      onChange={setLocale}
      options={[
        { value: "fr", label: dict.language.fr },
        { value: "en", label: dict.language.en },
      ]}
    />
  );
}
