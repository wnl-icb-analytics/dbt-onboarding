"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchPages, type SearchHit } from "@/lib/search-index";

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const inField =
        event.target instanceof HTMLElement &&
        (event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA" ||
          event.target.tagName === "SELECT" ||
          event.target.isContentEditable);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === "Escape") setOpen(false);
      if (!inField && event.key === "/" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const hits = useMemo(() => {
    const pages = searchPages(query);
    const trimmed = query.trim();
    if (!trimmed) return pages;
    const changelog: SearchHit = {
      href: `/changelog?q=${encodeURIComponent(trimmed)}`,
      title: `Search changelog for ${trimmed}`,
      group: "Changelog",
      blurb: "Titles, models, domains and pull request numbers",
    };
    const already = pages.some((hit) => hit.href.startsWith("/changelog"));
    return already ? [changelog, ...pages.filter((hit) => hit.href !== "/changelog")] : [changelog, ...pages];
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-w-0 items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-left font-sans text-sm text-ink-faint transition hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        aria-label="Search the handbook"
      >
        <span>Search</span>
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint md:inline">
          Ctrl K
        </kbd>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-[12vh] overscroll-contain"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search the handbook"
            className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-paper shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pages, models, pull requests…"
              spellCheck={false}
              autoComplete="off"
              className="w-full border-b border-line bg-paper px-4 py-3 font-sans text-base text-ink outline-none placeholder:text-ink-faint"
              onKeyDown={(event) => {
                if (event.key === "Enter" && hits[0]) {
                  event.preventDefault();
                  setOpen(false);
                  router.push(hits[0].href);
                }
              }}
            />
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {hits.length === 0 ? (
                <li className="px-3 py-4 text-sm text-ink-faint">No matching pages.</li>
              ) : (
                hits.map((hit) => (
                  <li key={hit.href}>
                    <Link
                      href={hit.href}
                      className="block rounded-lg px-3 py-2 !text-ink !no-underline hover:bg-paper-warm"
                      onClick={() => setOpen(false)}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-medium">{hit.title}</span>
                        <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                          {hit.group}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-ink-faint">
                        {hit.blurb}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
