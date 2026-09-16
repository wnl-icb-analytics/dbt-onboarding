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
import type { ChangelogMonth } from "@/lib/changelog";
import {
  type ChangelogItem,
  TYPE_LABELS,
  authorName,
  capitaliseSummary,
  dayKey,
  dayParts,
  domainLabel,
  entryTypeLabel,
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
  content: "bg-layer-semantic/15 text-layer-semantic",
} as const;

type Filters = {
  types: TypeFilterId[];
  showInternal: boolean;
  domain: string | null;
  author: string | null;
  tokens: string[];
};

type EntryActions = {
  onDomain: (slug: string) => void;
  activeDomain: string | null;
  onAuthor: (key: string, label: string) => void;
  activeAuthor: string | null;
};

type FilterControls = {
  types: TypeFilterId[];
  onToggleType: (id: TypeFilterId) => void;
  showInternal: boolean;
  onToggleInternal: () => void;
};

type AuthorFilter = { key: string; label: string } | null;

type FeedProps = {
  month: string;
  months: string[];
  explicitMonth: boolean;
  monthData: Record<string, Promise<ChangelogMonth>>;
};

/** Reads ?q= from the URL, so it must render inside a Suspense boundary. */
export function ChangelogFeedFromUrl(props: FeedProps) {
  const urlQuery = useSearchParams().get("q") ?? "";
  return <ChangelogFeed key={urlQuery} initialQuery={urlQuery} {...props} />;
}

export function ChangelogFeed({
  month,
  months,
  explicitMonth,
  monthData,
  initialQuery = "",
}: FeedProps & { initialQuery?: string }) {
  const [types, setTypes] = useState<TypeFilterId[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [showInternal, setShowInternal] = useState(false);
  const [domain, setDomain] = useState<string | null>(null);
  const [author, setAuthor] = useState<AuthorFilter>(null);

  const tokens = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );
  // search, area and author filters all span every month
  const wide = tokens.length > 0 || Boolean(domain) || Boolean(author);
  const filters: Filters = { types, showInternal, domain, author: author?.key ?? null, tokens };
  const actions: EntryActions = {
    onDomain: (slug) => setDomain((current) => (current === slug ? null : slug)),
    activeDomain: domain,
    onAuthor: (key, label) =>
      setAuthor((current) => (current?.key === key ? null : { key, label })),
    activeAuthor: author?.key ?? null,
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
  const wideHeading = [
    "dbt-analytics changes",
    query.trim() ? `matching "${query.trim()}"` : null,
    author ? `by ${author.label}` : null,
    domain ? domainLabel(domain) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_11.5rem] lg:items-start lg:gap-8">
      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Model, pull request, domain or author"
          />
          <div className="lg:hidden">
            <MonthSelect month={month} months={months} muted={wide} />
          </div>
          {author ? (
            <FilterChip
              label={`by ${author.label}`}
              clearLabel="Clear author filter"
              onClear={() => setAuthor(null)}
            />
          ) : null}
          {domain ? (
            <FilterChip
              label={domainLabel(domain)}
              clearLabel="Clear area filter"
              onClear={() => setDomain(null)}
            />
          ) : null}
        </div>

        {wide ? (
          <SearchResults
            months={months}
            monthData={monthData}
            filters={filters}
            actions={actions}
            controls={controls}
            heading={wideHeading}
          />
        ) : (
          <MonthStream
            key={month}
            month={month}
            months={months}
            explicitMonth={explicitMonth}
            monthData={monthData}
            filters={filters}
            actions={actions}
            controls={controls}
          />
        )}
      </div>

      <MonthRail
        month={month}
        months={months}
        monthData={monthData}
        showInternal={showInternal}
        muted={wide}
      />
    </div>
  );
}

/** Changes to this site, newest first, grouped by month. */
export function HandbookFeed({ items, error }: { items: ChangelogItem[]; error?: string }) {
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState<AuthorFilter>(null);
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filters: Filters = {
    types: [],
    showInternal: true,
    domain: null,
    author: author?.key ?? null,
    tokens,
  };
  const actions: EntryActions = {
    onDomain: () => {},
    activeDomain: null,
    onAuthor: (key, label) =>
      setAuthor((current) => (current?.key === key ? null : { key, label })),
    activeAuthor: author?.key ?? null,
  };
  const visible = items.filter((item) => inScope(item, filters));
  const months = new Map<string, ChangelogItem[]>();
  for (const item of visible) {
    const key = monthKey(item.mergedAt);
    months.set(key, [...(months.get(key) ?? []), item]);
  }
  const heading = [
    "dbt onboarding handbook changes",
    query.trim() ? `matching "${query.trim()}"` : null,
    author ? `by ${author.label}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Page, topic or author" />
        {author ? (
          <FilterChip
            label={`by ${author.label}`}
            clearLabel="Clear author filter"
            onClear={() => setAuthor(null)}
          />
        ) : null}
      </div>
      <div className="mb-6 flex min-h-7 items-center justify-between gap-3 border-b border-line pb-3">
        <p className="font-display text-sm font-semibold text-ink" aria-live="polite">
          {plural(visible.length, "change")}
          {tokens.length || author ? " match" : " across all months"}
        </p>
        <CopySummaryButton items={visible} heading={heading} />
      </div>
      {error ? <Notice>GitHub did not return the handbook history. Try again shortly.</Notice> : null}
      {!error && visible.length === 0 ? <Notice>No matching handbook changes.</Notice> : null}
      <div className="space-y-10">
        {[...months.entries()]
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([key, list]) => (
            <section key={key}>
              <MonthHeading month={key} count={list.length} />
              <DayList items={list} actions={actions} />
            </section>
          ))}
      </div>
    </div>
  );
}

/** The selected month, then older months appended one at a time by "Load". */
function MonthStream({
  month,
  months,
  explicitMonth,
  monthData,
  filters,
  actions,
  controls,
}: {
  month: string;
  months: string[];
  explicitMonth: boolean;
  monthData: Record<string, Promise<ChangelogMonth>>;
  filters: Filters;
  actions: EntryActions;
  controls: FilterControls;
}) {
  const [count, setCount] = useState(1);
  const start = Math.max(months.indexOf(month), 0);
  const older = months.slice(start + 1, start + count);
  const next = months[start + count];

  return (
    <>
      <Suspense fallback={<MonthSkeleton />}>
        <MonthView
          month={month}
          previousMonth={months[start + 1]}
          explicitMonth={explicitMonth}
          data={monthData[month]}
          filters={filters}
          actions={actions}
          controls={controls}
        />
      </Suspense>
      {older.map((key) => (
        <Suspense key={key} fallback={<MonthSkeleton />}>
          <OlderMonth month={key} data={monthData[key]} filters={filters} actions={actions} />
        </Suspense>
      ))}
      {next ? (
        <button
          type="button"
          onClick={() => setCount((current) => current + 1)}
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-paper py-2.5 text-sm font-medium text-ink-soft transition hover:border-flame hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40"
        >
          Load {monthLabel(next)}
          <span className="font-mono text-[11px] font-normal text-ink-faint">
            <Suspense fallback="…">
              <MonthCount data={monthData[next]} showInternal={filters.showInternal} />
            </Suspense>{" "}
            changes
          </span>
        </button>
      ) : (
        <p className="mt-10 text-center font-mono text-[11px] text-ink-faint">
          Start of the changelog
        </p>
      )}
    </>
  );
}

function MonthView({
  month,
  previousMonth,
  explicitMonth,
  data,
  filters,
  actions,
  controls,
}: {
  month: string;
  previousMonth?: string;
  explicitMonth: boolean;
  data: Promise<ChangelogMonth>;
  filters: Filters;
  actions: EntryActions;
  controls: FilterControls;
}) {
  const { items, error } = use(data);
  const scoped = items.filter((item) => inScope(item, filters));
  const visible = scoped.filter((item) => matchesTypeFilter(item, filters.types));
  const breaking = visible.filter((item) => item.breaking);
  const internalCount = items.filter((item) => item.hidden).length;

  return (
    <>
      <FilterBar
        headline={`${monthLabel(month)} · ${plural(scoped.length, "change")}`}
        counts={typeCounts(scoped)}
        internalCount={internalCount}
        controls={controls}
        action={
          <CopySummaryButton
            items={visible}
            heading={`dbt-analytics changes · ${monthLabel(month)}`}
          />
        }
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
    </>
  );
}

function OlderMonth({
  month,
  data,
  filters,
  actions,
}: {
  month: string;
  data: Promise<ChangelogMonth>;
  filters: Filters;
  actions: EntryActions;
}) {
  const { items, error } = use(data);
  const visible = items.filter(
    (item) => inScope(item, filters) && matchesTypeFilter(item, filters.types),
  );
  return (
    <section className="mt-12">
      <MonthHeading month={month} count={visible.length} />
      {error ? <Notice>GitHub did not return {monthLabel(month)}. Try again shortly.</Notice> : null}
      {!error && visible.length === 0 ? (
        <Notice>No matching warehouse changes in {monthLabel(month)}.</Notice>
      ) : null}
      <DayList items={visible} actions={actions} />
    </section>
  );
}

function MonthHeading({ month, count }: { month: string; count: number }) {
  return (
    <h2 className="mb-5 flex items-baseline justify-between gap-3 border-b border-line pb-1.5 font-display text-sm font-bold text-ink">
      {monthLabel(month)}
      <span className="font-mono text-[11px] font-normal text-ink-faint">
        {plural(count, "change")}
      </span>
    </h2>
  );
}

function SearchResults({
  months,
  monthData,
  filters,
  actions,
  controls,
  heading,
}: {
  months: string[];
  monthData: Record<string, Promise<ChangelogMonth>>;
  filters: Filters;
  actions: EntryActions;
  controls: FilterControls;
  heading: string;
}) {
  const [store] = useState(createResultStore);
  const { resolved, total, items } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  // every month reports its matches once it has loaded
  const done = resolved >= months.length;
  const headline = done
    ? `${plural(total, "change")} across all months`
    : `${plural(total, "change")} · loading ${Math.min(resolved, months.length)} of ${months.length} months`;

  return (
    <>
      <FilterBar
        headline={headline}
        controls={controls}
        action={<CopySummaryButton items={items} heading={heading} ready={done} />}
      />
      {done && total === 0 ? <Notice>No matching changes in any month.</Notice> : null}
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
  store: ResultStore;
}) {
  const { items } = use(data);
  const visible = items.filter(
    (item) => inScope(item, filters) && matchesTypeFilter(item, filters.types),
  );
  useReportResults(store, month, visible);
  if (visible.length === 0) return null;
  return (
    <section>
      <MonthHeading month={month} count={visible.length} />
      <DayList items={visible} actions={actions} />
    </section>
  );
}

type ResultStore = ReturnType<typeof createResultStore>;

/** Matches reported by each streamed search chunk, read with useSyncExternalStore. */
function createResultStore() {
  const results = new Map<string, { ids: string; items: ChangelogItem[] }>();
  const listeners = new Set<() => void>();
  let snapshot = { resolved: 0, total: 0, items: [] as ChangelogItem[] };
  const publish = () => {
    const items = [...results.values()]
      .flatMap((result) => result.items)
      .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
    snapshot = { resolved: results.size, total: items.length, items };
    listeners.forEach((listener) => listener());
  };
  return {
    set(key: string, items: ChangelogItem[]) {
      // chunks re-report on every render; only publish real changes
      const ids = items.map((item) => item.id).join(",");
      if (results.get(key)?.ids === ids) return;
      results.set(key, { ids, items });
      publish();
    },
    remove(key: string) {
      if (results.delete(key)) publish();
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

function useReportResults(store: ResultStore, key: string, items: ChangelogItem[]) {
  useEffect(() => {
    store.set(key, items);
  }, [store, key, items]);
  useEffect(() => () => store.remove(key), [store, key]);
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      autoComplete="off"
      aria-label="Search the changelog"
      className={`min-w-0 flex-1 ${FIELD}`}
    />
  );
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
    <div className="mb-6 border-b border-line pb-3">
      <div className="mb-1.5 flex min-h-7 items-center justify-between gap-3">
        <p className="min-w-0 font-display text-sm font-semibold text-ink" aria-live="polite">
          {headline}
        </p>
        {action}
      </div>
      <div className="-ml-1.5 flex min-w-0 flex-wrap items-center gap-1">
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
    </div>
  );
}

function FilterChip({
  label,
  clearLabel,
  onClear,
}: {
  label: string;
  clearLabel: string;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex max-w-full items-center gap-1.5 self-start rounded-full border border-line bg-paper-warm px-2.5 py-0.5 text-[12px] text-ink-soft transition hover:border-flame hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40"
    >
      <span className="min-w-0 truncate">{label}</span>
      <span aria-hidden className="text-ink-faint">
        ×
      </span>
      <span className="sr-only">{clearLabel}</span>
    </button>
  );
}

function CopySummaryButton({
  items,
  heading,
  ready = true,
}: {
  items: ChangelogItem[];
  heading: string;
  ready?: boolean;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <button
      type="button"
      disabled={!ready || items.length === 0}
      title={
        ready
          ? "Copy the changes shown, by day, with links and authors"
          : "Waiting for every month to load"
      }
      onClick={async () => {
        const ok = await copySummary(summariseChangelog(items, heading));
        setState(ok ? "copied" : "failed");
        window.setTimeout(() => setState("idle"), 2000);
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-paper px-2 py-1 font-display text-[12px] font-bold text-ink-soft transition hover:border-flame hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 disabled:opacity-40"
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
    <ul className="min-w-0 space-y-3.5">
      {items.map((item) => (
        <Entry key={item.id} item={item} actions={actions} />
      ))}
    </ul>
  );
}

function Entry({ item, actions }: { item: ChangelogItem; actions: EntryActions }) {
  const [showModels, setShowModels] = useState(false);
  const author = authorName(item);
  const key = authorKey(item);
  // one area per entry: the PR scope when set, otherwise the most-touched folder
  const area = item.domains[0];
  const areaLabel = item.domainLabels[0];
  const areaActive = Boolean(area) && actions.activeDomain === area;
  const meta: ReactNode[] = [];

  if (item.number) {
    meta.push(
      <a
        key="pr"
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono no-underline hover:text-ink-soft"
      >
        #{item.number}
      </a>,
    );
  }
  if (author && key) {
    const authorActive = actions.activeAuthor === key;
    meta.push(
      <button
        key="author"
        type="button"
        aria-pressed={authorActive}
        onClick={() => actions.onAuthor(key, author)}
        title={authorActive ? "Clear author filter" : `Show every change by ${author}`}
        className={`underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 ${
          authorActive ? "font-medium text-flame-deep" : "hover:text-ink"
        }`}
      >
        {author}
      </button>,
    );
  }
  if (area && areaLabel) {
    meta.push(
      <button
        key="area"
        type="button"
        aria-pressed={areaActive}
        onClick={() => actions.onDomain(area)}
        title={areaActive ? "Clear area filter" : `Show every ${areaLabel} change`}
        className={`underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 ${
          areaActive ? "font-medium text-flame-deep" : "hover:text-ink"
        }`}
      >
        {areaLabel}
      </button>,
    );
  }
  if (item.models.length === 1) {
    meta.push(<ModelLink key="model" name={item.models[0]} />);
  } else if (item.models.length > 1) {
    meta.push(
      <button
        key="models"
        type="button"
        aria-expanded={showModels}
        onClick={() => setShowModels((current) => !current)}
        className="underline-offset-2 transition hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40"
      >
        {item.models.length} models {showModels ? "▴" : "▾"}
      </button>,
    );
  }

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
          {meta.length > 0 ? (
            <p className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-[12px] leading-5 text-ink-faint">
              {meta.map((part, index) => (
                <span key={index} className="inline-flex min-w-0 items-baseline gap-x-1.5">
                  {index > 0 ? <span aria-hidden>·</span> : null}
                  {part}
                </span>
              ))}
            </p>
          ) : null}
          {showModels ? (
            <p className="mt-1 text-[12px] leading-5 text-ink-faint">
              {item.models.map((name, index) => (
                <span key={name}>
                  {index > 0 ? ", " : null}
                  <ModelLink name={name} />
                </span>
              ))}
            </p>
          ) : null}
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

function ModelLink({ name }: { name: string }) {
  return (
    <Link
      href={`/models?model=${encodeURIComponent(name)}`}
      title={`Open ${name} in the model docs`}
      className="font-mono text-[11.5px] text-ink-soft underline decoration-line underline-offset-2 [overflow-wrap:anywhere] hover:text-flame-deep hover:decoration-flame"
    >
      {name}
    </Link>
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
  if (filters.author && authorKey(item) !== filters.author) return false;
  if (filters.tokens.length && !matchesSearch(item, filters.tokens)) return false;
  return true;
}

function authorKey(item: ChangelogItem): string | undefined {
  return item.author?.login ?? item.author?.name;
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

function badgeTone(item: ChangelogItem): string {
  if (item.source === "handbook" && item.type === "docs") return BADGE_TONE.content;
  if (item.breaking) return BADGE_TONE.breaking;
  if (item.type === "feat" || item.type === "fix" || item.type === "perf") {
    return BADGE_TONE[item.type];
  }
  return BADGE_TONE.other;
}
