"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  type ChangelogItem,
  TYPE_LABELS,
  capitaliseSummary,
  dayKey,
  dayParts,
  domainLabel,
  monthKey,
  monthLabel,
} from "@/lib/changelog-parse";

const FIELD =
  "rounded-lg border border-line bg-paper px-3 py-2 font-sans text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-flame focus:ring-2 focus:ring-flame/25";

const TYPE_FILTERS = [
  { id: "feat", label: TYPE_LABELS.feat, dot: "bg-layer-staging" },
  { id: "fix", label: TYPE_LABELS.fix, dot: "bg-layer-modelling" },
  { id: "perf", label: TYPE_LABELS.perf, dot: "bg-layer-published" },
  { id: "breaking", label: "Breaking", dot: "bg-flame" },
  { id: "other", label: TYPE_LABELS.other, dot: "bg-ink-faint" },
] as const;

type TypeFilterId = (typeof TYPE_FILTERS)[number]["id"];

const BADGE_TONE = {
  feat: "bg-layer-staging/15 text-layer-staging",
  fix: "bg-layer-modelling/15 text-layer-modelling",
  perf: "bg-layer-published/15 text-layer-published",
  breaking: "bg-flame/15 text-flame",
  other: "bg-ink-faint/15 text-ink-faint",
  handbook: "bg-layer-semantic/15 text-layer-semantic",
} as const;

export function ChangelogFeed(props: {
  month: string;
  months: string[];
  items: ChangelogItem[];
  handbook: ChangelogItem[];
}) {
  const urlQuery = useSearchParams().get("q") ?? "";
  return <ChangelogFeedInner key={urlQuery} initialQuery={urlQuery} {...props} />;
}

function ChangelogFeedInner({
  month,
  months,
  items,
  handbook,
  initialQuery,
}: {
  month: string;
  months: string[];
  items: ChangelogItem[];
  handbook: ChangelogItem[];
  initialQuery: string;
}) {
  const [types, setTypes] = useState<TypeFilterId[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [showInternal, setShowInternal] = useState(false);
  const [domain, setDomain] = useState<string | null>(null);

  const tokens = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );
  const searching = tokens.length > 0;

  const scoped = useMemo(
    () =>
      items.filter((item) => {
        if (!searching && monthKey(item.mergedAt) !== month) return false;
        if (!showInternal && item.hidden) return false;
        if (domain && !item.domains.includes(domain)) return false;
        if (searching && !matchesSearch(item, tokens)) return false;
        return true;
      }),
    [domain, items, month, searching, showInternal, tokens],
  );

  const visible = useMemo(
    () => scoped.filter((item) => matchesTypeFilter(item, types)),
    [scoped, types],
  );

  const visibleHandbook = useMemo(() => {
    return handbook.filter((item) => {
      if (!searching && monthKey(item.mergedAt) !== month) return false;
      if (domain && !item.domains.includes(domain)) return false;
      if (searching && !matchesSearch(item, tokens)) return false;
      return true;
    });
  }, [domain, handbook, month, searching, tokens]);

  const matchCount = visible.length + visibleHandbook.length;

  const typeCounts = useMemo(() => {
    const counts: Record<TypeFilterId, number> = {
      feat: 0,
      fix: 0,
      perf: 0,
      breaking: 0,
      other: 0,
    };
    for (const item of scoped) {
      if (item.breaking) counts.breaking += 1;
      if (item.type === "feat" || item.type === "fix" || item.type === "perf" || item.type === "other") {
        counts[item.type] += 1;
      }
    }
    return counts;
  }, [scoped]);

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

  const monthCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      if (!showInternal && item.hidden) continue;
      const key = monthKey(item.mergedAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [items, showInternal]);

  const breaking = visible.filter((item) => item.breaking);

  function toggleType(id: TypeFilterId) {
    setTypes((current) =>
      current.includes(id) ? current.filter((type) => type !== id) : [...current, id],
    );
  }

  function toggleDomain(slug: string) {
    setDomain((current) => (current === slug ? null : slug));
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_11.5rem] lg:items-start lg:gap-8">
      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Model, pull request or domain"
            spellCheck={false}
            autoComplete="off"
            aria-label="Search the changelog"
            className={`min-w-0 flex-1 ${FIELD}`}
          />
          <div className="lg:hidden">
            <MonthSelect month={month} months={months} muted={searching} />
          </div>
          {domain ? (
            <button
              type="button"
              onClick={() => setDomain(null)}
              className="inline-flex max-w-full items-center gap-1.5 self-start rounded-full border border-line bg-paper-warm px-2.5 py-0.5 text-[12px] text-ink-soft transition hover:border-flame hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40"
            >
              <span className="min-w-0 truncate">{domainLabel(domain)}</span>
              <span aria-hidden className="text-ink-faint">
                ×
              </span>
              <span className="sr-only">Clear domain filter</span>
            </button>
          ) : null}
        </div>

        <MonthOverview
          month={month}
          searching={searching}
          matchCount={matchCount}
          changeCount={scoped.length}
          typeCounts={typeCounts}
          types={types}
          onToggleType={toggleType}
          showInternal={showInternal}
          onToggleInternal={() => setShowInternal((current) => !current)}
        />

        {breaking.length > 0 ? (
          <section className="mb-6 rounded-lg border border-flame/35 bg-flame-soft px-3 py-2.5">
            <h2 className="mb-1.5 font-display text-xs font-extrabold uppercase tracking-[0.16em] text-flame-deep">
              Breaking changes
            </h2>
            <EntryList items={breaking} onDomain={toggleDomain} activeDomain={domain} />
          </section>
        ) : null}

        {days.length === 0 && visibleHandbook.length === 0 && !searching ? (
          <div className="rounded-lg border border-line bg-paper-warm px-4 py-3 text-sm text-ink-soft">
            No matching warehouse changes in {monthLabel(month)}.
          </div>
        ) : null}

        {searching && matchCount === 0 ? (
          <div className="rounded-lg border border-line bg-paper-warm px-4 py-3 text-sm text-ink-soft">
            {`No matches for "${query.trim()}".`}
          </div>
        ) : null}

        <div className="space-y-8">
          {days.map(([key, dayItems]) => (
            <DaySection
              key={key}
              day={key}
              items={dayItems}
              onDomain={toggleDomain}
              activeDomain={domain}
            />
          ))}
        </div>

        {visibleHandbook.length > 0 ? (
          <section className="mt-10">
            <h2 className="mb-3 font-display text-sm font-semibold text-ink-soft">
              Handbook updates
            </h2>
            <EntryList
              items={visibleHandbook}
              onDomain={toggleDomain}
              activeDomain={domain}
            />
          </section>
        ) : null}
      </div>

      <MonthRail
        month={month}
        months={months}
        counts={monthCounts}
        muted={searching}
      />
    </div>
  );
}

function MonthOverview({
  month,
  searching,
  matchCount,
  changeCount,
  typeCounts,
  types,
  onToggleType,
  showInternal,
  onToggleInternal,
}: {
  month: string;
  searching: boolean;
  matchCount: number;
  changeCount: number;
  typeCounts: Record<TypeFilterId, number>;
  types: TypeFilterId[];
  onToggleType: (id: TypeFilterId) => void;
  showInternal: boolean;
  onToggleInternal: () => void;
}) {
  const headline = searching
    ? `${matchCount} ${matchCount === 1 ? "match" : "matches"} across all months`
    : `${monthLabel(month)} · ${changeCount} ${changeCount === 1 ? "change" : "changes"}`;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line pb-3">
      <p
        className="min-w-0 font-display text-sm font-semibold text-ink"
        aria-live="polite"
      >
        {headline}
      </p>
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        {TYPE_FILTERS.map((filter) => {
          const count = typeCounts[filter.id];
          if (count === 0) return null;
          const active = types.includes(filter.id);
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleType(filter.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-display text-[12px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 ${
                active
                  ? "bg-paper-warm text-ink"
                  : "text-ink-soft hover:bg-paper-warm hover:text-ink"
              }`}
            >
              <span className={`size-1.5 shrink-0 rounded-full ${filter.dot}`} aria-hidden />
              {filter.label}
              <span className="font-mono text-[11px] font-normal tabular-nums text-ink-faint">
                {count}
              </span>
            </button>
          );
        })}
        <span className="mx-1 hidden h-4 w-px bg-line sm:block" aria-hidden />
        <button
          type="button"
          aria-pressed={showInternal}
          onClick={onToggleInternal}
          className={`rounded-md px-1.5 py-0.5 font-display text-[12px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 ${
            showInternal
              ? "bg-paper-warm text-ink"
              : "text-ink-faint hover:bg-paper-warm hover:text-ink"
          }`}
        >
          Internal
        </button>
      </div>
    </div>
  );
}

function MonthSelect({
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
      className={`w-full min-w-0 sm:w-auto ${FIELD} ${muted ? "opacity-40" : ""}`}
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

function MonthRail({
  month,
  months,
  counts,
  muted,
}: {
  month: string;
  months: string[];
  counts: Map<string, number>;
  muted: boolean;
}) {
  return (
    <nav
      aria-label="Months"
      className={`sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto lg:block ${
        muted ? "opacity-40" : ""
      }`}
    >
      <ul className="space-y-0.5">
        {months.map((value) => {
          const active = value === month;
          const count = counts.get(value) ?? 0;
          return (
            <li key={value}>
              <Link
                href={`/changelog/${value}`}
                aria-current={active ? "page" : undefined}
                className={`flex items-baseline justify-between gap-2 rounded-md px-2 py-1 text-[13px] no-underline transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 ${
                  active
                    ? "bg-flame-soft font-medium text-ink"
                    : "text-ink-soft hover:bg-paper-warm hover:text-ink"
                }`}
              >
                <span className="min-w-0 truncate">{monthLabel(value)}</span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function DaySection({
  day,
  items,
  onDomain,
  activeDomain,
}: {
  day: string;
  items: ChangelogItem[];
  onDomain: (slug: string) => void;
  activeDomain: string | null;
}) {
  const { weekday, date } = dayParts(day);
  return (
    <section className="grid min-w-0 gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-x-4">
      <h2 className="flex items-baseline gap-2 font-display text-sm font-semibold text-ink-soft sm:sticky sm:top-20 sm:block sm:self-start">
        <span className="text-ink-faint sm:mb-0.5 sm:block">{weekday}</span>
        <span className="sm:block">{date}</span>
      </h2>
      <EntryList items={items} onDomain={onDomain} activeDomain={activeDomain} />
    </section>
  );
}

function EntryList({
  items,
  onDomain,
  activeDomain,
}: {
  items: ChangelogItem[];
  onDomain: (slug: string) => void;
  activeDomain: string | null;
}) {
  return (
    <ul className="min-w-0 space-y-4">
      {items.map((item) => (
        <Entry
          key={item.id}
          item={item}
          onDomain={onDomain}
          activeDomain={activeDomain}
        />
      ))}
    </ul>
  );
}

function Entry({
  item,
  onDomain,
  activeDomain,
}: {
  item: ChangelogItem;
  onDomain: (slug: string) => void;
  activeDomain: string | null;
}) {
  return (
    <li className="min-w-0">
      <div className="flex min-w-0 items-start gap-2.5">
        <TypeBadge item={item} />
        <div className="min-w-0 flex-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[15px] font-medium leading-snug text-ink no-underline hover:text-flame-deep"
          >
            {capitaliseSummary(item.summary)}
          </a>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
            {item.number ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-ink-faint no-underline hover:text-ink-soft"
              >
                #{item.number}
              </a>
            ) : null}
            {item.domains.map((slug, index) => {
              const label = item.domainLabels[index];
              if (!label) return null;
              const active = activeDomain === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onDomain(slug)}
                  className={`max-w-full truncate rounded-full border px-2 py-0.5 text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 ${
                    active
                      ? "border-flame/40 bg-flame-soft text-flame-deep"
                      : "border-line bg-paper-warm text-ink-soft hover:border-ink-faint hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
            <ModelChips models={item.models} />
          </div>
        </div>
      </div>
    </li>
  );
}

function TypeBadge({ item }: { item: ChangelogItem }) {
  return (
    <span
      className={`inline-flex h-5 w-[4.85rem] shrink-0 items-center justify-center rounded-full font-display text-[10px] font-bold tracking-wide ${badgeTone(item)}`}
    >
      {entryTypeLabel(item)}
    </span>
  );
}

function ModelChips({ models }: { models: string[] }) {
  const [expanded, setExpanded] = useState(false);
  if (models.length === 0) return null;
  const shown = expanded ? models : models.slice(0, 3);
  const extra = models.length - 3;

  return (
    <>
      {shown.map((name) => (
        <Link
          key={name}
          href={`/models?model=${encodeURIComponent(name)}`}
          className="max-w-[11rem] truncate rounded-md bg-paper-warm px-1.5 py-0.5 font-mono text-[11px] text-ink-soft no-underline hover:text-ink"
          title={name}
        >
          {name}
        </Link>
      ))}
      {extra > 0 && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-md px-1.5 py-0.5 font-mono text-[11px] text-ink-faint transition hover:bg-paper-warm hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40"
        >
          +{extra} more
        </button>
      ) : null}
    </>
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

function matchesTypeFilter(item: ChangelogItem, types: TypeFilterId[]): boolean {
  if (!types.length) return true;
  return types.some((id) => {
    if (id === "breaking") return item.breaking;
    return item.type === id;
  });
}

function entryTypeLabel(item: ChangelogItem): string {
  if (item.source === "handbook") return "Handbook";
  if (item.breaking) return "Breaking";
  return TYPE_LABELS[item.type] ?? item.typeLabel;
}

function badgeTone(item: ChangelogItem): string {
  if (item.source === "handbook") return BADGE_TONE.handbook;
  if (item.breaking) return BADGE_TONE.breaking;
  if (item.type === "feat" || item.type === "fix" || item.type === "perf") {
    return BADGE_TONE[item.type];
  }
  return BADGE_TONE.other;
}
