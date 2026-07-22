import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import { IconSend, IconGoogle } from "../icons";
import AppPreview from "../AppPreview";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [session, { dict }, { error }] = await Promise.all([getSession(), getServerDictionary(), searchParams]);

  if (session) {
    redirect("/");
  }

  return (
    <div className="relative z-10 flex h-full items-center justify-center overflow-y-auto p-4">
      <div className="flex w-full max-w-4xl flex-col items-center gap-10 py-8 md:flex-row md:justify-center md:gap-16">
        <div className="card w-full max-w-sm shrink-0 p-8 text-center">
          <span className="glow-accent mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <IconSend className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-semibold text-foreground">{dict.auth.title}</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{dict.auth.subtitle}</p>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
              {dict.auth.errorPrefix} {error}
            </p>
          )}

          <a
            href="/api/auth/login"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700"
          >
            <IconGoogle className="h-4 w-4 shrink-0" />
            {dict.auth.signInWithGoogle}
          </a>
        </div>

        <div className="hidden w-full max-w-sm md:block">
          <AppPreview />
        </div>
      </div>
    </div>
  );
}
