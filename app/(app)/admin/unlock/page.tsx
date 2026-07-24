import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getServerDictionary } from "@/lib/i18n/server";
import UnlockForm from "./UnlockForm";

export default async function AdminUnlockPage() {
  const [session, { dict }] = await Promise.all([getSession(), getServerDictionary()]);

  if (session?.isAdminUnlocked) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-12 text-center">
      <h1 className="text-xl font-semibold text-foreground">{dict.admin.unlock.title}</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{dict.admin.unlock.subtitle}</p>
      <UnlockForm />
    </div>
  );
}
