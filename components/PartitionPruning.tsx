"use client";

import { useState } from "react";
import { useInteractionDone } from "@/lib/interaction";

type Row = { person: number; date: string };

// 16 fictional events, loaded month by month
const LOADED: Row[] = [
  { person: 103, date: "2026-01-03" },
  { person: 101, date: "2026-01-09" },
  { person: 104, date: "2026-01-17" },
  { person: 102, date: "2026-01-24" },
  { person: 102, date: "2026-02-02" },
  { person: 104, date: "2026-02-11" },
  { person: 101, date: "2026-02-19" },
  { person: 103, date: "2026-02-26" },
  { person: 101, date: "2026-03-04" },
  { person: 103, date: "2026-03-12" },
  { person: 102, date: "2026-03-20" },
  { person: 104, date: "2026-03-27" },
  { person: 104, date: "2026-04-01" },
  { person: 102, date: "2026-04-10" },
  { person: 103, date: "2026-04-16" },
  { person: 101, date: "2026-04-23" },
];

const SORTED: Row[] = [...LOADED].sort(
  (a, b) => a.person - b.person || a.date.localeCompare(b.date),
);

const ROWS_PER_PARTITION = 4;

type Order = "load" | "person";
type Filter = "date" | "person";

const FILTERS: Record<
  Filter,
  { sql: string; matches: (r: Row) => boolean; lo: string; hi: string }
> = {
  date: {
    sql: "where event_date between '2026-02-01' and '2026-02-28'",
    matches: (r) => r.date >= "2026-02-01" && r.date <= "2026-02-28",
    lo: "2026-02-01",
    hi: "2026-02-28",
  },
  person: {
    sql: "where person_id = 103",
    matches: (r) => r.person === 103,
    lo: "103",
    hi: "103",
  },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr"];
const fmt = (iso: string) =>
  `${iso.slice(8)} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

const SUMMARY: Record<`${Order}-${Filter}`, string> = {
  "load-date":
    "Only partition 2 has an event_date range that reaches into February. Snowflake reads it and skips the other three.",
  "load-person":
    "Every partition's person_id range runs from 101 to 104, so every one might hold 103. Each partition has one matching row, but the metadata can't show that, so Snowflake reads all four.",
  "person-person":
    "After sorting, each partition holds one person. Only partition 3's person_id range contains 103.",
  "person-date":
    "Sorting by person spread each month across every partition. Every event_date range now covers February, so nothing can be skipped.",
};

function chunk(rows: Row[]) {
  const out: Row[][] = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_PARTITION) {
    out.push(rows.slice(i, i + ROWS_PER_PARTITION));
  }
  return out;
}

function Toggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; text: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-display text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-lg border-2 px-2.5 py-1 font-mono text-[11px] transition ${
            value === o.id
              ? "border-ink bg-ink text-paper"
              : "border-line text-ink-soft hover:border-ink"
          }`}
        >
          {o.text}
        </button>
      ))}
    </div>
  );
}

/** rows split into micro-partitions; the filter is checked against each partition's min/max */
export function PartitionPruning() {
  const interactionDone = useInteractionDone();
  const [order, setOrder] = useState<Order>("load");
  const [filter, setFilter] = useState<Filter>("date");

  const partitions = chunk(order === "load" ? LOADED : SORTED);
  const f = FILTERS[filter];

  const parts = partitions.map((rows) => {
    const people = rows.map((r) => r.person);
    const dates = rows.map((r) => r.date).sort();
    const pMin = Math.min(...people);
    const pMax = Math.max(...people);
    const dMin = dates[0];
    const dMax = dates[dates.length - 1];
    const scanned =
      filter === "date"
        ? dMin <= f.hi && dMax >= f.lo
        : pMin <= Number(f.hi) && pMax >= Number(f.lo);
    return { rows, pMin, pMax, dMin, dMax, scanned };
  });
  const read = parts.filter((p) => p.scanned).length;

  const pick = (o: Order, fl: Filter) => {
    setOrder(o);
    setFilter(fl);
    if (o === "person" && fl === "person") interactionDone();
  };

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-flame)]">
      <header className="space-y-2 border-b-2 border-ink bg-paper-warm px-5 py-3">
        <Toggle
          label="Row order"
          value={order}
          options={[
            { id: "load", text: "as loaded, month by month" },
            { id: "person", text: "sorted by person_id" },
          ]}
          onChange={(o) => pick(o, filter)}
        />
        <Toggle
          label="Query"
          value={filter}
          options={[
            { id: "date", text: "February events" },
            { id: "person", text: "person 103" },
          ]}
          onChange={(fl) => pick(order, fl)}
        />
      </header>

      <div className="bg-graphite-deep px-5 py-2.5 font-mono text-[12px] text-[#e8eaf2]">
        <span className="text-white/45">select * from events </span>
        {f.sql}
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {parts.map((p, i) => (
          <div
            key={i}
            className={`flex flex-col rounded-xl border-2 transition ${
              p.scanned ? "border-flame" : "border-line opacity-55"
            }`}
          >
            <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
              <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-ink">
                Partition {i + 1}
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-wider ${
                  p.scanned ? "text-flame-deep" : "text-ink-faint"
                }`}
              >
                {p.scanned ? "read" : "skipped"}
              </span>
            </div>
            <div className="flex-1 px-3 py-1.5 font-mono text-[11.5px]">
              {p.rows.map((r) => {
                const hit = p.scanned && f.matches(r);
                return (
                  <div
                    key={`${r.person}-${r.date}`}
                    className={`flex justify-between rounded px-1 ${
                      hit ? "bg-flame-soft text-flame-deep" : "text-ink-soft"
                    }`}
                  >
                    <span>{r.person}</span>
                    <span>{fmt(r.date)}</span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-0.5 border-t border-line bg-paper-warm px-3 py-1.5 font-mono text-[10.5px] text-ink-soft">
              <div className={filter === "person" ? "font-bold text-ink" : ""}>
                person_id {p.pMin} to {p.pMax}
              </div>
              <div className={filter === "date" ? "font-bold text-ink" : ""}>
                event_date {fmt(p.dMin)} to {fmt(p.dMax)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-ink bg-flame-soft px-5 py-3 text-sm text-ink-soft">
        <span className="font-bold text-ink">
          Reads {read} of {parts.length} partitions.
        </span>{" "}
        {SUMMARY[`${order}-${filter}`]}
      </div>
    </figure>
  );
}
