import { requireAdminUnlocked } from "@/lib/auth/admin";
import { getServerDictionary } from "@/lib/i18n/server";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  await requireAdminUnlocked();
  const { dict } = await getServerDictionary();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{dict.admin.dashboard.title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{dict.admin.dashboard.subtitle}</p>
      </div>
      <AdminDashboard />
    </div>
  );
}
