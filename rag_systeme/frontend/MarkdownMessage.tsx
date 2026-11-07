"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Affiche une réponse de l'assistant (Markdown) avec une mise en forme
 * propre : paragraphes aérés, listes à puces, titres discrets,
 * technologies en pastilles `code`, liens cliquables.
 *
 * Dépendances : npm i react-markdown remark-gfm
 * Fonctionne en mode clair et sombre (classes `dark:` de Tailwind).
 */

const components: Components = {
  h1: ({ children }) => <h3 className="mt-4 mb-1.5 text-base font-semibold first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-4 mb-1.5 text-base font-semibold first:mt-0">{children}</h3>,
  h3: ({ children }) => <h3 className="mt-4 mb-1.5 text-[0.95rem] font-semibold first:mt-0">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-3 mb-1 text-sm font-semibold first:mt-0">{children}</h4>,

  p: ({ children }) => <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>,

  ul: ({ children }) => <ul className="my-2 ml-5 list-disc space-y-1.5 marker:text-black/40 dark:marker:text-white/40">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 ml-5 list-decimal space-y-1.5 marker:text-black/50 dark:marker:text-white/50">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,

  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,

  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="font-medium underline underline-offset-2 decoration-black/30 hover:decoration-current dark:decoration-white/30"
    >
      {children}
    </a>
  ),

  // Technologies en pastilles ; vrais blocs de code dans un cadre scrollable
  code: ({ className, children }) => {
    const text = String(children);
    const isBlock = /language-/.test(className ?? "") || text.includes("\n");
    if (isBlock) {
      return <code className="font-mono text-[0.85em]">{children}</code>;
    }
    return (
      <code className="rounded-md bg-black/5 px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-white/10">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-black/10 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5">
      {children}
    </pre>
  ),

  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-black/20 pl-3 text-black/70 dark:border-white/20 dark:text-white/70">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-black/10 dark:border-white/10" />,

  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-black/15 px-3 py-1.5 text-left font-semibold dark:border-white/15">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-black/10 px-3 py-1.5 align-top dark:border-white/10">{children}</td>
  ),
};

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="text-sm break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ─── Sources : noms lisibles à la place des noms de fichiers ────────────────
const SOURCE_LABELS: Record<string, string> = {
  "cv.pdf": "CV",
  "data_portfolio.json": "Informations complémentaires",
};

export function SourceChips({ sources }: { sources?: string[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
      <span>Sources :</span>
      {sources.map((s) => (
        <span
          key={s}
          className="rounded-full border border-black/10 px-2 py-0.5 dark:border-white/15"
        >
          {SOURCE_LABELS[s] ?? s}
        </span>
      ))}
    </div>
  );
}

/*
 * Utilisation dans votre bulle de chat (réponse de l'assistant) :
 *
 *   <div className="rounded-2xl bg-black/5 px-4 py-3 dark:bg-white/10">
 *     <MarkdownMessage content={message.content} />
 *     <SourceChips sources={message.sources} />
 *   </div>
 *
 * Les messages du visiteur restent en texte brut ({message.content}).
 */
