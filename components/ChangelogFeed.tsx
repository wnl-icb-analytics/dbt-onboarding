"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  type ReactNode,
  use,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ChangelogMonth, HandbookData } from "@/lib/changelog";
import {
  type ChangelogItem,
  INTERNAL_LABELS,
  TYPE_LABELS,
  authorName,
  capitaliseSummary,
  dayKey,
  dayParts,
  domainLabel,
  monthKey,
  monthLabel,
} from "@/lib/changelog-parse";
import { copySummary, summariseChangelog } from "@/lib/changelog-summary";

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

type Filters = {
  types: TypeFilterId[];
  showInternal: boolean;
  domain: string | null;
  tokens: string[];
};

type EntryActions = { onDomain: (slug: string) => void; activeDomain: string | null };

type FilterControls = {
  types: TypeFilterId[];
  onToggleType: (id: TypeFilterId) => void;
  showInternal: boolean;
  onToggleInternal: () => void;
};

type FeedProps = {
  month: string;
  months: string[];
  explicitMonth: boolean;
  monthData: Record<string, Promise<ChangelogMonth>>;
  handbook: Promise<HandbookData>;
};

export function ChangelogFeed(props: FeedProps) {
  const urlQuery = useSearchParams().get("q") ?? "";
  return <ChangelogFeedInner key={urlQuery} initialQuery={urlQuery} {...props} />;
}

function ChangelogFeedInner({
  month,
  months,
  explicitMonth,
  monthData,
  handbook,
  initialQuery,
}: FeedProps & { initialQuery: string }) {
  const [types, setTypes] = useState<TypeFilterId[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [showInternal, setShowInternal] = useState(false);
  const [domain, setDomain] = useState<string | null>(null);

  const tokens = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );
  const searching = tokens.length > 0;
  const filters: Filters = { types, showInternal, domain, tokens };
  const actions: EntryActions = {
    onDomain: (slug) => setDomain((current) => (current === slug ? null : slug)),
    activeDomain: domain,
  };
  const controls: FilterControls = {
    types,
    onToggleType: (id) =>
      setTypes((current) =>
        current.includes(id) ? current.filter((type) => type !== id) : [...current, id],
      ),
    showInternal,
    onToggleInternal: () => setShowInternal((current) => !current),
  };

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_11.5rem] lg:items-start lg:gap-8">
      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Model, pull request, domain or author"
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

        {searching ? (
          <SearchResults
            months={months}
            monthData={monthData}
            handbook={handbook}
            filters={filters}
            actions={actions}
            controls={controls}
            query={query.trim()}
          />
        ) : (
          <Suspense key={month} fallback={<MonthSkeleton />}>
            <MonthView
              month={month}
              previousMonth={months[months.indexOf(month) + 1]}
              explicitMonth={explicitMonth}
              data={monthData[month]}
              handbook={handbook}
              filters={filters}
              actions={actions}
              controls={controls}
            />
          </Suspense>
        )}
      </div>

      <MonthRail
        month={month}
        months={months}
        monthData={monthData}
        showInternal={showInternal}
        muted={searching}
      />
    </div>
  );
}

function MonthView({
  month,
  previousMonth,
  explicitMonth,
  data,
  handbook,
  filters,
  actions,
  controls,
}: {
  month: string;
  previousMonth?: string;
  explicitMonth: boolean;
  data: Promise<ChangelogMonth>;
  handbook: Promise<HandbookData>;
  filters: Filters;
  actions: EntryActions;
  controls: FilterControls;
}) {
  const { items, error } = use(data);
  const scoped = items.filter((item) => inScope(item, filters));
  const visible = scoped.filter((item) => matchesTypeFilter(item, filters.types));
  const breaking = visible.filter((item) => item.breaking);
  const internalCount = items.filter(
    (item) => item.hidden && (!filters.domain || item.domains.includes(filters.domain)),
  ).length;
  const summaryHeading = `dbt-analytics changes · ${monthLabel(month)}${
    filters.domain ? ` · ${domainLabel(filters.domain)}` : ""
  }`;

  return (
    <>
      <FilterBar
        headline={`${monthLabel(month)} · ${plural(scoped.length, "change")}`}
        counts={typeCounts(scoped)}
        internalCount={internalCount}
        controls={controls}
        action={<CopySummaryButton items={visible} heading={summaryHeading} />}
      />

      {error ? <Notice>GitHub did not return {monthLabel(month)}. Try again shortly.</Notice> : null}

      {breaking.length > 0 ? (
        <section className="mb-6 rounded-lg border border-flame/35 bg-flame-soft px-3 py-2.5">
          <h2 className="mb-1.5 font-display text-xs font-extrabold uppercase tracking-[0.16em] text-flame-deep">
            Breaking changes
          </h2>
          <EntryList items={breaking} actions={actions} />
        </section>
      ) : null}

      {!error && visible.length === 0 ? (
        <Notice>
          {items.length === 0 && !explicitMonth && previousMonth ? (
            <>
              No warehouse changes yet in {monthLabel(month)}. See{" "}
              <Link
                href={`/changelog/${previousMonth}`}
                className="text-flame-deep underline decoration-flame/40 underline-offset-[3px]"
              >
                {monthLabel(previousMonth)}
              </Link>
              .
            </>
          ) : (
            `No matching warehouse changes in ${monthLabel(month)}.`
          )}
        </Notice>
      ) : null}

      <DayList items={visible} actions={actions} />

      <Suspense fallback={null}>
        <HandbookUpdates data={handbook} month={month} filters={filters} actions={actions} />
      </Suspense>
    </>
  );
}

function HandbookUpdates({
  data,
  month,
  filters,
  actions,
}: {
  data: Promise<HandbookData>;
  month: string;
  filters: Filters;
  actions: EntryActions;
}) {
  const { items } = use(data);
  const visible = items.filter(
    (item) => monthKey(item.mergedAt) === month && inScope(item, filters),
  );
  if (visible.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-display text-sm font-semibold text-ink-soft">Handbook updates</h2>
      <EntryList items={visible} actions={actions} />
    </section>
  );
}

function SearchResults({
  months,
  monthData,
  handbook,
  filters,
  actions,
  controls,
  query,
}: {
  months: string[];
  monthData: Record<string, Promise<ChangelogMonth>>;
  handbook: Promise<HandbookData>;
  filters: Filters;
  actions: EntryActions;
  controls: FilterControls;
  query: string;
}) {
  const [store] = useState(createCountStore);
  const { resolved, total } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  // every month plus the handbook reports a count once it has loaded
  const done = resolved >= months.length + 1;
  const headline = done
    ? `${plural(total, "match", "matches")} across all months`
    : `${plural(total, "match", "matches")} · searching ${Math.min(resolved, months.length)} of ${months.length} months`;

  return (
    <>
      <FilterBar headline={headline} controls={controls} />
      {done && total === 0 ? <Notice>{`No matches for "${query}".`}</Notice> : null}
      <div className="space-y-10">
        {months.map((key) => (
          <Suspense key={key} fallback={null}>
            <SearchMonth
              month={key}
              data={monthData[key]}
              filters={filters}
              actions={actions}
              store={store}
            />
          </Suspense>
        ))}
      </div>
      <Suspense fallback={null}>
        <SearchHandbook data={handbook} filters={filters} actions={actions} store={store} />
      </Suspense>
    </>
  );
}

function SearchMonth({
  month,
  data,
  filters,
  actions,
  store,
}: {
  month: string;
  data: Promise<ChangelogMonth>;
  filters: Filters;
  actions: EntryActions;
  store: CountStore;
}) {
  const { items } = use(data);
  const visible = items.filter(
    (item) => inScope(item, filters) && matchesTypeFilter(item, filters.types),
  );
  useReportCount(store, month, visible.length);
  if (visible.length === 0) return null;
  return (
    <section>
      <h2 className="mb-4 border-b border-line pb-1.5 font-display text-sm font-bold text-ink">
        {monthLabel(month)}
      </h2>
      <DayList items={visible} actions={actions} />
    </section>
  );
}

function SearchHandbook({
  data,
  filters,
  actions,
  store,
}: {
  data: Promise<HandbookData>;
  filters: Filters;
  actions: EntryActions;
  store: CountStore;
}) {
  const { items } = use(data);
  const visible = items.filter((item) => inScope(item, filters));
  useReportCount(store, "handbook", visible.length);
  if (visible.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-display text-sm font-semibold text-ink-soft">Handbook updates</h2>
      <EntryList items={visible} actions={actions} />
    </section>
  );
}

type CountStore = ReturnType<typeof createCountStore>;

/** Match counts reported by each streamed search chunk, read with useSyncExternalStore. */
function createCountStore() {
  const counts = new Map<string, number>();
  const listeners = new Set<() => void>();
  let snapshot = { resolved: 0, total: 0 };
  const publish = () => {
    let total = 0;
    for (const value of counts.values()) total += value;
    snapshot = { resolved: counts.size, total };
    listeners.forEach((listener) => listener());
  };
  return {
    set(key: string, value: number) {
      if (counts.get(key) === value) return;
      counts.set(key, value);
      publish();
    },
    remove(key: string) {
      if (counts.delete(key)) publish();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
  };
}

function useReportCount(store: CountStore, key: string, count: number) {
  useEffect(() => {
    store.set(key, count);
  }, [store, key, count]);
  useEffect(() => () => store.remove(key), [store, key]);
}

function FilterBar({
  headline,
  counts,
  internalCount,
  controls,
  action,
}: {
  headline: string;
  counts?: Record<TypeFilterId, number>;
  internalCount?: number;
  controls: FilterControls;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line pb-3">
      <p className="min-w-0 font-display text-sm font-semibold text-ink" aria-live="polite">
        {headline}
      </p>
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        {TYPE_FILTERS.map((filter) => {
          const count = counts?.[filter.id];
          const active = controls.types.includes(filter.id);
          if (counts && count === 0 && !active) return null;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={active}
              onClick={() => controls.onToggleType(filter.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-display text-[12px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 ${
                active ? "bg-paper-warm text-ink" : "text-ink-soft hover:bg-paper-warm hover:text-ink"
              }`}
            >
              <span className={`size-1.5 shrink-0 rounded-full ${filter.dot}`} aria-hidden />
              {filter.label}
              {count !== undefined ? (
                <span className="font-mono text-[11px] font-normal tabular-nums text-ink-faint">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
        <span className="mx-1 hidden h-4 w-px bg-line sm:block" aria-hidden />
        <button
          type="button"
          aria-pressed={controls.showInternal}
          onClick={controls.onToggleInternal}
          title="Maintenance, CI, tests, refactors and docs"
          className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-display text-[12px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 ${
            controls.showInternal
              ? "bg-paper-warm text-ink"
              : "text-ink-faint hover:bg-paper-warm hover:text-ink"
          }`}
        >
          <span className="size-1.5 shrink-0 rounded-full bg-ink-faint" aria-hidden />
          Internal
          {internalCount !== undefined ? (
            <span className="font-mono text-[11px] font-normal tabular-nums text-ink-faint">
              {internalCount}
            </span>
          ) : null}
        </button>
      </div>
      {action ? <div className="ml-auto">{action}</div> : null}
    </div>
  );
}

function CopySummaryButton({ items, heading }: { items: ChangelogItem[]; heading: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <button
      type="button"
      disabled={items.length === 0}
      title="Copy the changes shown as a list with pull request links and authors"
      onClick={async () => {
        const ok = await copySummary(summariseChangelog(items, heading));
        setState(ok ? "copied" : "failed");
        window.setTimeout(() => setState("idle"), 2000);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-2 py-1 font-display text-[12px] font-bold text-ink-soft transition hover:border-flame hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 disabled:opacity-40"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {state === "copied" ? (
          <path d="M20 6 9 17l-5-5" />
        ) : (
          <>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </>
        )}
      </svg>
      <span aria-live="polite">
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy summary"}
      </span>
    </button>
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
  monthData,
  showInternal,
  muted,
}: {
  month: string;
  months: string[];
  monthData: Record<string, Promise<ChangelogMonth>>;
  showInternal: boolean;
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
                  <Suspense
                    fallback={<span className="inline-block h-2.5 w-4 animate-pulse rounded bg-line" />}
                  >
                    <MonthCount data={monthData[value]} showInternal={showInternal} />
                  </Suspense>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MonthCount({
  data,
  showInternal,
}: {
  data: Promise<ChangelogMonth>;
  showInternal: boolean;
}) {
  const { items, error } = use(data);
  if (error) return <>–</>;
  return <>{items.filter((item) => showInternal || !item.hidden).length}</>;
}

function DayList({ items, actions }: { items: ChangelogItem[]; actions: EntryActions }) {
  const days = new Map<string, ChangelogItem[]>();
  for (const item of items) {
    const key = dayKey(item.mergedAt);
    days.set(key, [...(days.get(key) ?? []), item]);
  }
  return (
    <div className="space-y-8">
      {[...days.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, dayItems]) => (
          <DaySection key={key} day={key} items={dayItems} actions={actions} />
        ))}
    </div>
  );
}

function DaySection({
  day,
  items,
  actions,
}: {
  day: string;
  items: ChangelogItem[];
  actions: EntryActions;
}) {
  const { weekday, date } = dayParts(day);
  return (
    <section className="grid min-w-0 gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-x-4">
      <h2 className="flex items-baseline gap-2 font-display text-sm font-semibold text-ink-soft sm:sticky sm:top-20 sm:block sm:self-start">
        <span className="text-ink-faint sm:mb-0.5 sm:block">{weekday}</span>
        <span className="sm:block">{date}</span>
      </h2>
      <EntryList items={items} actions={actions} />
    </section>
  );
}

function EntryList({ items, actions }: { items: ChangelogItem[]; actions: EntryActions }) {
  return (
    <ul className="min-w-0 space-y-4">
      {items.map((item) => (
        <Entry key={item.id} item={item} actions={actions} />
      ))}
    </ul>
  );
}

function Entry({ item, actions }: { item: ChangelogItem; actions: EntryActions }) {
  const author = authorName(item);
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
            {author ? (
              <span className="text-[11px] text-ink-faint" title={item.author?.login}>
                by {author}
              </span>
            ) : null}
            {item.domains.map((slug, index) => {
              const label = item.domainLabels[index];
              if (!label) return null;
              const active = actions.activeDomain === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => actions.onDomain(slug)}
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
      className={`inline-flex h-5 w-[6rem] shrink-0 items-center justify-center rounded-full font-display text-[10px] font-bold tracking-wide ${badgeTone(item)}`}
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

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 rounded-lg border border-line bg-paper-warm px-4 py-3 text-sm text-ink-soft">
      {children}
    </div>
  );
}

function MonthSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 h-5 w-72 max-w-full animate-pulse rounded-md bg-paper-warm" />
      <div className="space-y-8">
        {[0, 1, 2].map((day) => (
          <div key={day} className="grid gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
            <div className="h-9 w-20 animate-pulse rounded-md bg-paper-warm" />
            <div className="space-y-3">
              <div className="h-5 w-full animate-pulse rounded-md bg-paper-warm" />
              <div className="h-5 w-5/6 animate-pulse rounded-md bg-paper-warm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function inScope(item: ChangelogItem, filters: Filters): boolean {
  if (!filters.showInternal && item.hidden) return false;
  if (filters.domain && !item.domains.includes(filters.domain)) return false;
  if (filters.tokens.length && !matchesSearch(item, filters.tokens)) return false;
  return true;
}

function typeCounts(items: ChangelogItem[]): Record<TypeFilterId, number> {
  const counts: Record<TypeFilterId, number> = { feat: 0, fix: 0, perf: 0, breaking: 0, other: 0 };
  for (const item of items) {
    if (item.breaking) counts.breaking += 1;
    if (item.type === "feat" || item.type === "fix" || item.type === "perf" || item.type === "other") {
      counts[item.type] += 1;
    }
  }
  return counts;
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

function matchesSearch(item: ChangelogItem, tokens: string[]): boolean {
  const haystack = [
    item.summary,
    item.type,
    item.typeLabel,
    item.number ? String(item.number) : "",
    item.number ? `#${item.number}` : "",
    item.author?.login ?? "",
    item.author?.name ?? "",
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
  if (item.hidden) return INTERNAL_LABELS[item.type] ?? TYPE_LABELS[item.type];
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
