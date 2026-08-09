import type { ReactNode } from "react";

const STYLES = {
  tip: {
    label: "Tip",
    border: "border-l-layer-staging",
    accent: "text-layer-staging",
  },
  warn: {
    label: "Watch out",
    border: "border-l-flame",
    accent: "text-flame-deep",
  },
  info: {
    label: "Good to know",
    border: "border-l-layer-modelling",
    accent: "text-layer-modelling",
  },
  smell: {
    label: "Code smell",
    border: "border-l-layer-published",
    accent: "text-layer-published",
  },
} as const;

export function Callout({
  kind = "info",
  title,
  children,
}: {
  kind?: keyof typeof STYLES;
  title?: string;
  children: ReactNode;
}) {
  const s = STYLES[kind];
  return (
    <aside
      className={`my-5 max-w-[72ch] rounded-md border-l-[3px] bg-paper-warm/60 py-2.5 pl-4 pr-4 ${s.border}`}
    >
      <p
        className={`!my-0 font-display text-[10px] font-bold uppercase tracking-[0.14em] ${s.accent}`}
      >
        {title ?? s.label}
      </p>
      <div className="mt-0.5 text-[15px] leading-relaxed text-ink-soft [&>p]:my-1 [&_code]:break-words [&_code]:whitespace-normal sm:[&_code]:whitespace-nowrap [&_code]:rounded [&_code]:border [&_code]:border-line [&_code]:bg-paper [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
        {children}
      </div>
    </aside>
  );
}
