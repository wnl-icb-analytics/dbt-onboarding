"use client";

import { useState } from "react";
import { highlight, type Lang } from "@/components/CodeBlock";

type Segment = {
  /** one or more code lines */
  code: string;
  /** clicking the segment reveals this; segments without a note are inert */
  note?: string;
};

/**
 * A code block where the explanation lives on the line it explains:
 * numbered segments expand a note when tapped.
 */
export function AnnotatedCode({
  segments,
  lang = "text",
  title,
}: {
  segments: Segment[];
  lang?: Lang;
  title?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <figure className="my-5 w-full min-w-0 max-w-[76ch] overflow-hidden rounded-xl border border-graphite-deep bg-graphite-deep shadow-[0_8px_30px_-12px_rgb(27_30_41/0.5)]">
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
        <span className="ml-auto shrink-0 font-mono text-[11px] text-white/40">
          tap a numbered line
        </span>
      </figcaption>

      <div className="px-2 py-3.5 text-[13px] leading-relaxed">
        {segments.map((seg, i) => {
          if (!seg.note) {
            return (
              <pre
                key={i}
                className="!my-0 whitespace-pre-wrap break-words px-2 py-px text-[#e8eaf2] [overflow-wrap:anywhere] sm:whitespace-pre"
              >
                <code className="font-mono">{highlight(seg.code, lang)}</code>
              </pre>
            );
          }
          const n = segments.slice(0, i + 1).filter(({ note }) => note).length;
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className={`group flex w-full items-start gap-2 rounded-md px-2 py-px text-left transition ${
                  isOpen ? "bg-white/[0.07]" : "hover:bg-white/[0.05]"
                }`}
              >
                <pre className="!my-0 min-w-0 flex-1 whitespace-pre-wrap break-words text-[#e8eaf2] [overflow-wrap:anywhere] sm:whitespace-pre">
                  <code className="font-mono">{highlight(seg.code, lang)}</code>
                </pre>
                <span
                  className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border font-mono text-[10px] font-bold transition ${
                    isOpen
                      ? "border-flame bg-flame text-white"
                      : "border-flame/60 text-flame group-hover:border-flame"
                  }`}
                  aria-hidden
                >
                  {n}
                </span>
              </button>
              {isOpen && (
                <p className="!my-1 ml-2 w-auto !max-w-none rounded-r-md border-l-2 border-flame bg-white/[0.05] px-3 py-2 font-sans text-[13px] leading-relaxed !text-white/80">
                  {seg.note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </figure>
  );
}
