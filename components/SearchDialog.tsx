"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchPages, type SearchHit } from "@/lib/search-index";

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const inField =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }
      if (!inField && event.key === "/") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const hits = useMemo(() => {
    const trimmed = query.trim();
    const pages = searchPages(query);
    if (!trimmed) return pages;
    const jumps: SearchHit[] = [
      {
        href: `/models?q=${encodeURIComponent(trimmed)}`,
        title: `Find “${trimmed}” in model docs`,
        group: "Models",
        blurb: "Models, sources, columns and tests",
      },
      {
        href: `/changelog?q=${encodeURIComponent(trimmed)}`,
        title: `Find “${trimmed}” in the changelog`,
        group: "Changelog",
        blurb: "Titles, models, domains and pull request numbers",
      },
    ];
    return [...pages, ...jumps];
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
    setActive(0);
  }

  function go(hit: SearchHit | undefined) {
    if (!hit) return;
    close();
    router.push(hit.href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex items-center gap-2 rounded-lg border border-line bg-paper-warm/60 px-2.5 py-1.5 text-sm text-ink-faint transition hover:border-ink-faint hover:text-ink sm:w-52 lg:w-64"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-auto hidden rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink-faint sm:inline">
          Ctrl K
        </kbd>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-graphite-deep/50 px-4 pt-[12vh] backdrop-blur-[2px]"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="rise w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-ink-faint" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                placeholder="Search pages, models, changes…"
                spellCheck={false}
                autoComplete="off"
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-activedescendant={hits[active] ? `search-hit-${active}` : undefined}
                className="w-full bg-transparent py-3.5 text-base text-ink outline-none placeholder:text-ink-faint"
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActive((i) => Math.min(i + 1, hits.length - 1));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActive((i) => Math.max(i - 1, 0));
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    go(hits[active]);
                  } else if (event.key === "Escape") {
                    close();
                  }
                }}
              />
              <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                Esc
              </kbd>
            </div>
            <ul id="search-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
              {hits.map((hit, i) => (
                <li
                  key={hit.href}
                  id={`search-hit-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(hit)}
                  className={`cursor-pointer rounded-lg px-3 py-2 ${
                    i === active ? "bg-flame-soft" : ""
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className={`font-medium ${i === active ? "text-flame-deep" : "text-ink"}`}>
                      {hit.title}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-ink-faint">{hit.group}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-faint">{hit.blurb}</span>
                </li>
              ))}
            </ul>
            <p className="flex gap-4 border-t border-line px-4 py-2 font-mono text-[11px] text-ink-faint">
              <span>↑↓ move</span>
              <span>↵ open</span>
              <span>/ or Ctrl K to search anywhere</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
