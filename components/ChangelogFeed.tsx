"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type ChangelogItem,
  dayKey,
  dayLabel,
  monthKey,
  monthLabel,
} from "@/lib/changelog-parse";

const SHORT_TYPE: Record<string, string> = {
  feat: "New",
  fix: "Fix",
  perf: "Perf",
  other: "Other",
  docs: "Docs",
  chore: "Chore",
  ci: "CI",
  test: "Test",
  refactor: "Ref",
};

const TYPE_FILTERS = [
  { id: "feat", label: "New" },
  { id: "fix", label: "Fixes" },
  { id: "perf", label: "Performance" },
  { id: "other", label: "Other" },
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
  const [types, setTypes] = useState<string[]>([]);
  const [domain, setDomain] = useState("all");
  const [query, setQuery] = useState("");
  const [showInternal, setShowInternal] = useState(false);

  const domains = useMemo(() => {
    const labels = new Map<string, string>();
    for (const item of items) {
      item.domains.forEach((id, index) => {
        labels.set(id, item.domainLabels[index] ?? id);
      });
    }
    return [...labels.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const visible = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const searching = tokens.length > 0;
    return items.filter((item) => {
      if (!searching && monthKey(item.mergedAt) !== month) return false;
      if (!showInternal && item.hidden) return false;
      if (types.length && !types.includes(item.type) && !item.breaking) {
        return false;
      }
      if (domain !== "all" && !item.domains.includes(domain)) return false;
      if (searching && !matchesSearch(item, tokens)) return false;
      return true;
    });
  }, [domain, items, month, query, showInternal, types]);

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
  const monthIndex = months.indexOf(month);
  const newer = monthIndex > 0 ? months[monthIndex - 1] : undefined;
  const older = monthIndex >= 0 ? months[monthIndex + 1] : undefined;

  return (
    <div>
      <label className="mb-4 grid gap-1 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-faint">
        Search
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Titles, models, pull requests, domains"
          className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-sm font-normal tracking-normal text-ink"
        />
      </label>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <label className="grid gap-1 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-faint">
          Month
          <select
            className="rounded-lg border border-line bg-paper px-3 py-1.5 font-sans text-sm font-medium tracking-normal text-ink"
            value={month}
            onChange={(event) => {
              window.location.assign(`/changelog/${event.target.value}`);
            }}
          >
            {months.map((value) => (
              <option key={value} value={value}>
                {monthLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <p className="flex gap-3 font-mono text-xs">
          {newer ? <Link href={`/changelog/${newer}`}>Newer</Link> : <span className="text-ink-faint">Newer</span>}
          {older ? <Link href={`/changelog/${older}`}>Older</Link> : <span className="text-ink-faint">Older</span>}
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-end gap-x-3 gap-y-2 border-y border-line py-3">
        <div className="flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((filter) => {
            const active = types.includes(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() =>
                  setTypes((current) =>
                    current.includes(filter.id)
                      ? current.filter((id) => id !== filter.id)
                      : [...current, filter.id],
                  )
                }
                className={`rounded-full border px-2.5 py-0.5 font-display text-[11px] font-bold ${
                  active
                    ? "border-flame bg-flame-soft text-flame-deep"
                    : "border-line bg-paper text-ink-soft hover:border-ink"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
        <label className="grid gap-1 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-faint">
          Domain
          <select
            className="rounded-lg border border-line bg-paper px-2.5 py-1.5 font-sans text-sm font-medium tracking-normal text-ink"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
          >
            <option value="all">All domains</option>
            {domains.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-1 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={showInternal}
            onChange={(event) => setShowInternal(event.target.checked)}
          />
          Internal
        </label>
      </div>

      {breaking.length > 0 && (
        <section className="mb-5 rounded-md border border-flame/40 bg-flame-soft/60 px-3 py-2">
          <h2 className="!mt-0 !mb-1 font-display text-xs font-extrabold uppercase tracking-[0.16em] text-flame-deep">
            Breaking changes
          </h2>
          <EntryList items={breaking} />
        </section>
      )}

      {days.length === 0 && visibleHandbook.length === 0 ? (
        <p>
          {searching
            ? `No matches for "${query.trim()}".`
            : `No matching warehouse changes in ${monthLabel(month)}.`}
        </p>
      ) : (
        <>
          {searching && (
            <p className="!mt-0 !mb-4 font-mono text-xs text-ink-faint">
              {visible.length + visibleHandbook.length}{" "}
              {visible.length + visibleHandbook.length === 1 ? "match" : "matches"} across all months
            </p>
          )}
          {days.map(([key, dayItems]) => (
          <section key={key} className="mt-5 first:mt-0">
            <h2 className="!mt-0 !mb-1 font-display text-sm font-extrabold tracking-tight">
              {dayLabel(key)}
            </h2>
            <EntryList items={dayItems} />
          </section>
          ))}
        </>
      )}

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

function matchesSearch(item: ChangelogItem, tokens: string[]): boolean {
  const haystack = [
    item.summary,
    item.typeLabel,
    SHORT_TYPE[item.type] ?? "",
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

function EntryList({ items }: { items: ChangelogItem[] }) {
  return (
    <ul className="!my-0 !max-w-none !list-none !pl-0 divide-y divide-line border-y border-line">
      {items.map((item) => {
        const meta = [
          item.number ? `#${item.number}` : null,
          ...item.domainLabels.slice(0, 1),
          ...item.models.slice(0, 3),
          item.models.length > 3 ? `+${item.models.length - 3}` : null,
        ].filter(Boolean);
        return (
          <li key={item.id} className="!m-0 !p-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-x-3 py-1.5 !text-ink !no-underline hover:bg-paper-warm"
            >
              <span className="pt-0.5 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                {item.breaking ? "Break" : (SHORT_TYPE[item.type] ?? item.typeLabel)}
              </span>
              <span>
                <span className="block text-[15px] font-medium leading-snug text-ink">
                  {item.summary}
                </span>
                {meta.length > 0 && (
                  <span className="mt-0.5 block font-mono text-[11px] leading-snug text-ink-faint">
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
