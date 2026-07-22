"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { extractVariables } from "@/lib/template";
import { useI18n } from "../../I18nProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  templateId?: string;
  initialName?: string;
  initialSubject?: string;
  initialBody?: string;
};

export default function TemplateForm({ templateId, initialName, initialSubject, initialBody }: Props) {
  const router = useRouter();
  const { dict } = useI18n();
  const [name, setName] = useState(initialName ?? "");
  const [subject, setSubject] = useState(initialSubject ?? "");
  const [body, setBody] = useState(initialBody ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
    ],
    content: initialBody ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[280px] text-foreground",
      },
    },
    onUpdate: ({ editor }) => setBody(editor.getHTML()),
  });

  const variables = useMemo(() => extractVariables(subject, body), [subject, body]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const url = templateId ? `/api/templates/${templateId}` : "/api/templates";
      const method = templateId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? dict.templates.form.unknownError);
        return;
      }
      router.push("/templates");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.templates.form.nameLabel}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder={dict.templates.form.namePlaceholder}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.templates.form.subjectLabel}
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input"
            placeholder={dict.templates.form.subjectPlaceholder}
          />
        </label>
        <div className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.templates.form.bodyLabel}
          <EditorToolbar editor={editor} dict={dict} />
          <EditorContent
            editor={editor}
            className="input rounded-t-none focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-accent"
          />
        </div>
        <p className="text-xs text-zinc-500">{dict.templates.form.helpText}</p>
        {variables.length > 0 && (
          <p className="text-xs text-zinc-500">
            {dict.templates.form.variablesDetected} {variables.map((v) => `{{${v}}}`).join(", ")}
          </p>
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="glow-accent w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? dict.templates.form.saving : dict.templates.form.save}
        </button>
      </form>
    </div>
  );
}

function EditorToolbar({ editor, dict }: { editor: Editor | null; dict: Dictionary }) {
  function insertLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(dict.templates.form.toolbar.linkPrompt, previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const buttons: { title: string; label: React.ReactNode; active?: boolean; onClick: () => void }[] = [
    {
      title: dict.templates.form.toolbar.bold,
      label: <span className="font-bold">G</span>,
      active: editor?.isActive("bold"),
      onClick: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      title: dict.templates.form.toolbar.italic,
      label: <span className="italic">I</span>,
      active: editor?.isActive("italic"),
      onClick: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      title: dict.templates.form.toolbar.underline,
      label: <span className="underline">S</span>,
      active: editor?.isActive("underline"),
      onClick: () => editor?.chain().focus().toggleUnderline().run(),
    },
    {
      title: dict.templates.form.toolbar.heading,
      label: "H2",
      active: editor?.isActive("heading", { level: 2 }),
      onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: dict.templates.form.toolbar.bulletList,
      label: "•⃝",
      active: editor?.isActive("bulletList"),
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      title: dict.templates.form.toolbar.orderedList,
      label: "1.",
      active: editor?.isActive("orderedList"),
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      title: dict.templates.form.toolbar.link,
      label: dict.templates.form.toolbar.link,
      active: editor?.isActive("link"),
      onClick: insertLink,
    },
  ];

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-border bg-zinc-50 p-1 dark:bg-zinc-900">
      {buttons.map((b) => (
        <button
          key={b.title}
          type="button"
          title={b.title}
          onMouseDown={(e) => e.preventDefault()}
          onClick={b.onClick}
          className={`min-w-7 rounded px-2 py-1 text-sm font-medium transition-colors ${
            b.active
              ? "bg-accent/15 text-accent"
              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {b.label}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        title={dict.templates.form.toolbar.undo}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().undo().run()}
        className="rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        ↶
      </button>
      <button
        type="button"
        title={dict.templates.form.toolbar.redo}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().redo().run()}
        className="rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        ↷
      </button>
    </div>
  );
}
