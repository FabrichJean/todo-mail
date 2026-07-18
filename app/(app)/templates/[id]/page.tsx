import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TemplateForm from "../TemplateForm";
import { getServerDictionary } from "@/lib/i18n/server";
import { requireUser } from "@/lib/auth/session";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [{ dict }, template] = await Promise.all([
    getServerDictionary(),
    prisma.template.findFirst({ where: { id, userId: user.id } }),
  ]);

  if (!template) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{dict.templates.editTitle}</h1>
      <TemplateForm
        templateId={template.id}
        initialName={template.name}
        initialSubject={template.subject}
        initialBody={template.body}
      />
    </div>
  );
}
