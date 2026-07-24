"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "../../../I18nProvider";

export default function UnlockForm() {
  const { dict } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(dict.admin.unlock.incorrectPassword);
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex w-full flex-col gap-3 p-6">
      <label className="flex flex-col gap-1 text-left text-sm text-zinc-700 dark:text-zinc-300">
        {dict.admin.unlock.passwordLabel}
        <input
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="glow-accent w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? dict.admin.unlock.submitting : dict.admin.unlock.submit}
      </button>
    </form>
  );
}
