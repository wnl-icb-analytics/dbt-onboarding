"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  type ChangelogItem,
  TYPE_LABELS,
  dayKey,
  dayLabel,
  monthKey,
  monthLabel,
} from "@/lib/changelog-parse";

const TYPE_FILTERS = [
  { id: "feat", label: TYPE_LABELS.feat },
  { id: "fix", label: TYPE_LABELS.fix },
  { id: "perf", label: TYPE_LABELS.perf },
  { id: "other", label: TYPE_LABELS.other },
] as const;

export function ChangelogFeed({
  month,
  months,
  items,
  handbook,
}: {
  month: string;
  months: string[];
  items: ChangelogItem[];
  handbook: ChangelogItem[];
}) {
  const searchParams = useSearchParams();
  const [types, setTypes] = useState<string[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [showInternal, setShowInternal] = useState(false);

  const visible = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const searching = tokens.length > 0;
    return items.filter((item) => {
      if (!searching && monthKey(item.mergedAt) !== month) return false;
      if (!showInternal && item.hidden) return false;
      if (types.length && !types.includes(item.type) && !item.breaking) {
        return false;
      }
      if (searching && !matchesSearch(item, tokens)) return false;
      return true;
    });
  }, [items, month, query, showInternal, types]);

  const visibleHandbook = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const searching = tokens.length > 0;
    return handbook.filter((item) => {
      if (!searching && monthKey(item.mergedAt) !== month) return false;
      if (searching && !matchesSearch(item, tokens)) return false;
      return true;
    });
  }, [handbook, month, query]);

  const searching = query.trim().length > 0;
  const matchCount = visible.length + visibleHandbook.length;

  const days = useMemo(() => {
    const grouped = new Map<string, ChangelogItem[]>();
    for (const item of visible) {
      const key = dayKey(item.mergedAt);
      const list = grouped.get(key) ?? [];
      list.push(item);
      grouped.set(key, list);
    }
    return [...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [visible]);

  const breaking = visible.filter((item) => item.breaking);

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Model, pull request or domain"
          spellCheck={false}
          autoComplete="off"
          aria-label="Search the changelog"
          className="min-w-0 flex-1 rounded-xl border-2 border-ink bg-paper px-3 py-2 font-sans text-sm outline-none transition placeholder:text-ink-faint focus:border-flame"
        />
        <MonthNav month={month} months={months} muted={searching} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-1 border-b border-line pb-3">
        {TYPE_FILTERS.map((filter) => {
          const active = types.includes(filter.id);
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={active}
              onClick={() =>
                setTypes((current) =>
                  current.includes(filter.id)
                    ? current.filter((id) => id !== filter.id)
                    : [...current, filter.id],
                )
              }
              className={`rounded-md px-2 py-1 font-display text-[12px] font-bold ${
                active
                  ? "bg-flame-soft text-flame-deep"
                  : "text-ink-faint hover:bg-paper-warm hover:text-ink"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
        <span className="mx-1 h-4 w-px bg-line" aria-hidden />
        <button
          type="button"
          aria-pressed={showInternal}
          onClick={() => setShowInternal((current) => !current)}
          className={`rounded-md px-2 py-1 font-display text-[12px] font-bold ${
            showInternal
              ? "bg-paper-warm text-ink"
              : "text-ink-faint hover:bg-paper-warm hover:text-ink"
          }`}
        >
          Internal
        </button>
      </div>

      {searching && (
        <p className="!mt-0 !mb-4 font-mono text-xs text-ink-faint">
          {matchCount === 0
            ? `No matches for "${query.trim()}".`
            : `${matchCount} ${matchCount === 1 ? "match" : "matches"} across all months`}
        </p>
      )}

      {breaking.length > 0 && (
        <section className="mb-5 rounded-md border border-flame/40 bg-flame-soft/60 px-3 py-2">
          <h2 className="!mt-0 !mb-1 font-display text-xs font-extrabold uppercase tracking-[0.16em] text-flame-deep">
            Breaking changes
          </h2>
          <EntryList items={breaking} />
        </section>
      )}

      {days.length === 0 && visibleHandbook.length === 0 && !searching && (
        <p>No matching warehouse changes in {monthLabel(month)}.</p>
      )}

      {days.map(([key, dayItems]) => (
        <section key={key} className="mt-5 first:mt-0">
          <h2 className="!mt-0 !mb-1 font-display text-sm font-extrabold tracking-tight">
            {dayLabel(key)}
          </h2>
          <EntryList items={dayItems} />
        </section>
      ))}

      {visibleHandbook.length > 0 && (
        <section className="mt-8">
          <h2 className="!mt-0 !mb-1 font-display text-sm font-extrabold tracking-tight">
            Handbook updates
          </h2>
          <EntryList items={visibleHandbook} />
        </section>
      )}
    </div>
  );
}

function MonthNav({
  month,
  months,
  muted,
}: {
  month: string;
  months: string[];
  muted: boolean;
}) {
  const router = useRouter();

  return (
    <select
      aria-label="Month"
      className={`shrink-0 rounded-xl border-2 border-ink bg-paper px-3 py-2 font-sans text-sm font-medium tracking-normal text-ink outline-none focus:border-flame ${
        muted ? "opacity-40" : ""
      }`}
      value={month}
      onChange={(event) => {
        router.push(`/changelog/${event.target.value}`);
      }}
    >
      {months.map((value) => (
        <option key={value} value={value}>
          {monthLabel(value)}
        </option>
      ))}
    </select>
  );
}

function matchesSearch(item: ChangelogItem, tokens: string[]): boolean {
  const haystack = [
    item.summary,
    item.type,
    item.typeLabel,
    item.number ? String(item.number) : "",
    item.number ? `#${item.number}` : "",
    ...item.domains,
    ...item.domainLabels,
    ...item.models,
  ]
    .join(" ")
    .toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function entryTypeLabel(item: ChangelogItem): string {
  if (item.breaking) return "Breaking";
  return TYPE_LABELS[item.type] ?? item.typeLabel;
}

function EntryList({ items }: { items: ChangelogItem[] }) {
  return (
    <ul className="!my-0 !max-w-none !list-none overflow-hidden !pl-0 divide-y divide-line border-y border-line">
      {items.map((item) => {
        const meta = [
          item.number ? `#${item.number}` : null,
          item.domainLabels[0],
          item.models.length > 1
            ? `${item.models.length} models`
            : item.models[0],
        ].filter(Boolean);
        return (
          <li key={item.id} className="!m-0 min-w-0 !p-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={item.models.join(", ") || undefined}
              className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 overflow-hidden py-1.5 !text-ink !no-underline hover:bg-paper-warm"
            >
              <span className="shrink-0 pt-0.5 font-display text-[11px] font-semibold text-ink-faint">
                {entryTypeLabel(item)}
              </span>
              <span className="min-w-0 overflow-hidden">
                <span className="block text-[15px] font-medium leading-snug text-ink">
                  {item.summary}
                </span>
                {meta.length > 0 && (
                  <span className="mt-0.5 block truncate font-mono text-[11px] leading-snug text-ink-faint">
                    {meta.join(" · ")}
                  </span>
                )}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
