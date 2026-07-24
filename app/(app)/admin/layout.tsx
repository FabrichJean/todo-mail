import { requireAdminEmail } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminEmail();
  return <>{children}</>;
}
