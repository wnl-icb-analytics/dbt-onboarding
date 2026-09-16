"use client";

import { useState, type ReactNode } from "react";

export type Lang = "sql" | "yaml" | "bash" | "text";

/** Minimal tokenizer — enough colour for teaching snippets, no dependency. */
export function highlight(code: string, lang: Lang): ReactNode[] {
  const patterns: { re: RegExp; cls: string }[] =
    lang === "sql"
      ? [
          { re: /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}|\{#[\s\S]*?#\}/g, cls: "text-[#7ee2c0]" }, // jinja
          { re: /--[^\n]*/g, cls: "text-[#6b7388] italic" },
          { re: /'[^']*'/g, cls: "text-[#f5c97e]" },
          {
            re: /\b(select|from|where|group by|order by|with|as|left join|inner join|join|on|case|when|then|else|end|and|or|not|null|is|distinct|union all|union|having|over|partition by|cast|coalesce|count|sum|max|min|floor|datediff|current_date|config|materialized)\b/gi,
            cls: "text-[#ff9a82]",
          },
        ]
      : lang === "yaml"
        ? [
            { re: /#[^\n]*/g, cls: "text-[#6b7388] italic" },
            { re: /^( *- )?[\w.]+(?=:)/gm, cls: "text-[#8fb8ff]" },
            { re: /'[^']*'|"[^"]*"/g, cls: "text-[#f5c97e]" },
          ]
        : lang === "bash"
          ? [
              { re: /#[^\n]*/g, cls: "text-[#6b7388] italic" },
              { re: /^\s*(dbt|git|gh|python|npm|code|cd|\.\\\S+)\b/gm, cls: "text-[#ff9a82]" },
              { re: /'[^']*'|"[^"]*"/g, cls: "text-[#f5c97e]" },
              { re: / -{1,2}[\w-]+/g, cls: "text-[#8fb8ff]" },
            ]
          : [];

  type Span = { start: number; end: number; cls: string };
  const spans: Span[] = [];
  for (const { re, cls } of patterns) {
    for (const m of code.matchAll(re)) {
      const start = m.index!;
      const end = start + m[0].length;
      if (!spans.some((s) => start < s.end && end > s.start)) {
        spans.push({ start, end, cls });
      }
    }
  }
  spans.sort((a, b) => a.start - b.start);

  const out: ReactNode[] = [];
  let pos = 0;
  spans.forEach((s, i) => {
    if (s.start > pos) out.push(code.slice(pos, s.start));
    out.push(
      <span key={i} className={s.cls}>
        {code.slice(s.start, s.end)}
      </span>,
    );
    pos = s.end;
  });
  if (pos < code.length) out.push(code.slice(pos));
  return out;
}

export function CodeBlock({
  code,
  lang = "text",
  title,
}: {
  code: string;
  lang?: Lang;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const trimmed = code.replace(/^\n+|\s+$/g, "");

  return (
    <figure className="group my-5 w-full min-w-0 max-w-[76ch] overflow-hidden rounded-xl border border-white/10 bg-graphite-deep shadow-[0_8px_30px_-12px_rgb(0_0_0/0.45)]">
      <figcaption className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
        <span className="flex shrink-0 gap-1.5">
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-flame/80" />
        </span>
        {title && (
          <span className="ml-1 min-w-0 truncate font-mono text-xs text-white/50" title={title}>
            {title}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(trimmed).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            });
          }}
          className="ml-auto shrink-0 rounded-md border border-white/15 px-2 py-0.5 font-mono text-[11px] text-white/60 transition hover:border-flame hover:text-flame"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </figcaption>
      <pre className="min-w-0 whitespace-pre-wrap break-words px-4 py-3.5 text-[13px] leading-relaxed text-[#e8eaf2] [overflow-wrap:anywhere] sm:overflow-x-auto sm:whitespace-pre sm:break-normal sm:[overflow-wrap:normal]">
        <code className="font-mono">{highlight(trimmed, lang)}</code>
      </pre>
    </figure>
  );
}
