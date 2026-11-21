"use client";

import { useState } from "react";
import { useInteractionDone } from "@/lib/interaction";

const ROWS = [
  { person_id: "10291", postcode: "W10 4AA" },
  { person_id: "10304", postcode: "W12 7BB" },
  { person_id: "10304", postcode: "W12 7BB" },
  { person_id: "10317", postcode: null },
  { person_id: "10322", postcode: "NW10 3CD" },
] as const;

type Row = (typeof ROWS)[number];

const isDuplicated = (r: Row) =>
  ROWS.filter((x) => x.person_id === r.person_id).length > 1;

const TESTS = [
  {
    id: "unique_pid",
    label: "unique person_id",
    query: "select person_id from stg_people\ngroup by person_id having count(*) > 1",
    violates: isDuplicated,
    // one result row per duplicated key, not per offending row
    returned: () => new Set(ROWS.filter(isDuplicated).map((r) => r.person_id)).size,
    failNote:
      "The query returns one row per duplicated person_id, and that count is what dbt reports. The highlighted rows share that key.",
  },
  {
    id: "notnull_pc",
    label: "not_null postcode",
    query: "select * from stg_people\nwhere postcode is null",
    violates: (r: Row) => r.postcode === null,
    returned: () => ROWS.filter((r) => r.postcode === null).length,
    failNote: "The query returns the rows that break the rule, and that count is what dbt reports.",
  },
  {
    id: "notnull_pid",
    label: "not_null person_id",
    query: "select * from stg_people\nwhere person_id is null",
    violates: () => false,
    returned: () => 0,
    failNote: "",
  },
] as const;

/** run a data test against a tiny table and watch which rows it catches */
export function TestProbe() {
  const interactionDone = useInteractionDone();
  const [active, setActive] = useState<(typeof TESTS)[number] | null>(null);
  const [tried, setTried] = useState<string[]>([]);
  const caught = active ? active.returned() : 0;

  const run = (t: (typeof TESTS)[number]) => {
    setActive(t);
    const next = tried.includes(t.id) ? tried : [...tried, t.id];
    setTried(next);
    if (next.length === TESTS.length) interactionDone();
  };

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-staging)]">
      <header className="border-b-2 border-ink bg-paper-warm px-5 py-3">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame">
          Run a test against the rows
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TESTS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={active?.id === t.id}
              onClick={() => run(t)}
              className={`rounded-lg border-2 px-2.5 py-1 font-mono text-[11px] transition ${
                active?.id === t.id
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink-soft hover:border-flame"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        <table className="!my-0 w-full border-collapse font-mono text-[12px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-ink-faint">
              <th className="border-b border-line px-3 py-1.5 font-display">person_id</th>
              <th className="border-b border-line px-3 py-1.5 font-display">postcode</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => {
              const bad = active ? active.violates(r) : false;
              return (
                <tr
                  key={i}
                  className={`transition-colors ${bad ? "bg-flame-soft" : ""}`}
                >
                  <td className={`border-b border-line px-3 py-1.5 ${bad ? "text-flame-deep" : "text-ink"}`}>
                    {r.person_id}
                  </td>
                  <td className={`border-b border-line px-3 py-1.5 ${r.postcode ? (bad ? "text-flame-deep" : "text-ink") : "italic text-ink-faint"}`}>
                    {r.postcode ?? "null"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {active && (
        <div className="border-t-2 border-ink">
          <div className="bg-graphite-deep px-5 py-3 font-mono text-[12px] leading-5">
            <p className="!my-0 text-white/40">-- {active.label} compiles to a hunt for rule-breakers</p>
            <pre className="!my-0 mt-1 whitespace-pre-wrap !bg-transparent !p-0 text-[#e8eaf2]">{active.query}</pre>
          </div>
          <div
            className={`px-5 py-3 text-sm ${caught === 0 ? "bg-layer-staging/10" : "bg-flame-soft"}`}
          >
            <strong className="text-ink">
              {caught} row{caught === 1 ? "" : "s"} returned → {caught === 0 ? "PASS" : "FAIL"}.
            </strong>{" "}
            {caught === 0
              ? "Zero rows broke the rule, so the test passes."
              : active.failNote}
          </div>
        </div>
      )}

      <figcaption className="border-t border-line px-4 py-2 text-center font-mono text-[11px] text-ink-faint">
        a test selects violations · zero rows back means pass
      </figcaption>
    </figure>
  );
}
