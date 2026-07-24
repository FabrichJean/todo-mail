import Sidebar from "../Sidebar";
import MobileTabBar from "../MobileTabBar";
import { requireUser } from "@/lib/auth/session";
import { isAdminEmail } from "@/lib/auth/admin";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const isAdmin = isAdminEmail(user.email);

  return (
    <div className="relative z-10 flex h-full flex-col md:flex-row md:gap-3 md:p-3">
      <Sidebar user={{ email: user.email, name: user.name, avatarUrl: user.avatarUrl }} isAdmin={isAdmin} />
      <main className="h-full flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-24 sm:px-6 md:px-10 md:py-8 md:pb-8">{children}</div>
      </main>
      <MobileTabBar user={{ email: user.email, name: user.name, avatarUrl: user.avatarUrl }} isAdmin={isAdmin} />
    </div>
  );
}
