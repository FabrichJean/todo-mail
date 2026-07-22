import TemplateForm from "../TemplateForm";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function NewTemplatePage() {
  const { dict } = await getServerDictionary();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{dict.templates.newTitle}</h1>
      <TemplateForm />
    </div>
  );
}
