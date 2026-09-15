"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type ChangelogItem,
  monthLabel,
  weekKey,
  weekLabel,
} from "@/lib/changelog-parse";

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
  const [modelQuery, setModelQuery] = useState("");
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
    const needle = modelQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (!showInternal && item.hidden) return false;
      if (types.length && !types.includes(item.type) && !item.breaking) {
        return false;
      }
      if (domain !== "all" && !item.domains.includes(domain)) return false;
      if (needle && !item.models.some((name) => name.toLowerCase().includes(needle))) {
        return false;
      }
      return true;
    });
  }, [domain, items, modelQuery, showInternal, types]);

  const weeks = useMemo(() => {
    const grouped = new Map<string, ChangelogItem[]>();
    for (const item of visible) {
      const key = weekKey(item.mergedAt);
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
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <label className="grid gap-1 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-faint">
          Month
          <select
            className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-sm font-medium tracking-normal text-ink"
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

      <div className="mb-8 grid gap-4 border-y border-line py-5">
        <div className="flex flex-wrap gap-2">
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
                className={`rounded-full border px-3 py-1 font-display text-xs font-bold ${
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
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-faint">
            Domain
            <select
              className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-sm font-medium tracking-normal text-ink"
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
          <label className="grid min-w-[12rem] flex-1 gap-1 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-faint">
            Model
            <input
              type="search"
              value={modelQuery}
              onChange={(event) => setModelQuery(event.target.value)}
              placeholder="dim_person_demographics"
              className="rounded-lg border border-line bg-paper px-3 py-2 font-mono text-sm font-normal tracking-normal text-ink"
            />
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={showInternal}
              onChange={(event) => setShowInternal(event.target.checked)}
            />
            Show internal changes
          </label>
        </div>
      </div>

      {breaking.length > 0 && (
        <section className="mb-8 rounded-md border border-flame/40 bg-flame-soft/60 px-4 py-4">
          <h2 className="!mt-0 font-display text-sm font-extrabold uppercase tracking-[0.16em] text-flame-deep">
            Breaking changes
          </h2>
          <EntryList items={breaking} />
        </section>
      )}

      {weeks.length === 0 ? (
        <p>No matching warehouse changes in {monthLabel(month)}.</p>
      ) : (
        weeks.map(([key, weekItems]) => (
          <section key={key}>
            <h2>{weekLabel(key)}</h2>
            <EntryList items={weekItems} />
          </section>
        ))
      )}

      {handbook.length > 0 && (
        <section>
          <h2>Handbook updates</h2>
          <EntryList items={handbook} />
        </section>
      )}
    </div>
  );
}

function EntryList({ items }: { items: ChangelogItem[] }) {
  return (
    <div className="mt-3 grid gap-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-lg border border-line bg-paper-warm/50 px-4 py-3"
        >
          <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-faint">
            <span className="rounded-full border border-line bg-paper px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              {item.breaking ? "Breaking" : item.typeLabel}
            </span>
            {item.domainLabels.slice(0, 2).map((label) => (
              <span key={label}>{label}</span>
            ))}
            <time dateTime={item.mergedAt}>
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                timeZone: "Europe/London",
              }).format(new Date(item.mergedAt))}
            </time>
          </p>
          <h3 className="!mt-2 !mb-1 font-display text-lg font-bold tracking-tight text-ink">
            {item.summary}
          </h3>
          {item.models.length > 0 && (
            <p className="!my-1 font-mono text-xs text-ink-soft">
              {item.models.slice(0, 8).map((name) => (
                <code key={name} className="mr-1">
                  {name}
                </code>
              ))}
              {item.models.length > 8
                ? ` +${item.models.length - 8} more`
                : null}
            </p>
          )}
          <p className="!mb-0 !mt-2">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.number ? `Pull request #${item.number}` : "Handbook commit"} ↗
            </a>
          </p>
        </article>
      ))}
    </div>
  );
}
