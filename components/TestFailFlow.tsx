"use client";

import { useState } from "react";
import { useInteractionDone } from "@/lib/interaction";

/** Steppable: what a daily-build test failure does, and doesn't do, to the DAG. */

const PHASES = [
  {
    label: "06:00, the daily build begins",
    caption:
      "The feed started sending duplicate rows overnight. The build reaches stg_people.",
  },
  {
    label: "stg_people rebuilds",
    caption:
      "stg_people is a view, so it stores no rows. dbt recreates the view, and anything that queries it now sees today's feed, duplicates included.",
  },
  {
    label: "…then its test runs and fails",
    caption:
      "The grain test looks for duplicates and finds 14 person_ids that appear more than once. dbt doesn't roll the view back.",
  },
  {
    label: "dbt stops the spread",
    caption:
      "dim_people is a table, and dbt skips it, so it keeps yesterday's rows. The dashboard reads that table, so its numbers are stale, not wrong. A skipped view would still show the duplicates, because a view reads its source every time. The team starts the day with a red build that names the failing test.",
  },
] as const;

export function TestFailFlow() {
  const done = useInteractionDone();
  const [phase, setPhase] = useState(0);
  const last = phase === PHASES.length - 1;

  const advance = () => {
    if (last) {
      setPhase(0);
      return;
    }
    const next = phase + 1;
    setPhase(next);
    if (next === PHASES.length - 1) done();
  };

  const stgBuilt = phase >= 1;
  const testFailed = phase >= 2;
  const spread = phase >= 3;

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
      <header className="flex items-center justify-between gap-3 border-b-2 border-ink bg-paper-warm px-4 py-3">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame">
          One bad night · {phase + 1}/{PHASES.length}
        </p>
        <button
          type="button"
          onClick={advance}
          className="rounded-lg border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-paper transition hover:border-flame hover:bg-flame"
        >
          {last ? "↺ Replay" : "Next →"}
        </button>
      </header>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-1">
          {/* stg_people + its test */}
          <div className="min-w-0 sm:flex-1">
            <div
              className={`rounded-xl border-2 p-3 text-center transition-all duration-300 ${
                stgBuilt
                  ? testFailed
                    ? "border-flame bg-flame-soft"
                    : "border-layer-staging bg-layer-staging/10"
                  : "border-line bg-paper"
              }`}
            >
              <code className="block !whitespace-normal !border-0 !bg-transparent !p-0 text-[11px] font-bold">
                stg_people
              </code>
              <span className="mt-1 block font-display text-[9px] font-bold uppercase tracking-wider text-ink-soft">
                {testFailed
                  ? "view · shows the bad rows"
                  : stgBuilt
                    ? "view · reads today's feed"
                    : "waiting"}
              </span>
            </div>
            <div className="mx-auto h-3 w-px bg-line" />
            <div
              className={`rounded-lg border px-2 py-1.5 text-center text-[10px] transition-all duration-300 ${
                testFailed
                  ? "border-flame bg-flame-soft text-flame-deep"
                  : "border-dashed border-line text-ink-faint"
              }`}
            >
              <span className="font-mono">unique person_id</span>
              <span className="ml-1 font-display font-bold uppercase tracking-wide">
                · {testFailed ? "FAIL · 14 keys" : "waiting"}
              </span>
            </div>
          </div>

          <span
            className={`mx-auto my-1 h-5 border-l-2 sm:mx-1.5 sm:my-0 sm:h-0 sm:w-5 sm:border-l-0 sm:border-t-2 ${
              spread ? "border-dashed border-line" : "border-line"
            }`}
            aria-hidden
          />

          {/* dim_people */}
          <div
            className={`min-w-0 rounded-xl border-2 p-3 text-center transition-all duration-300 sm:flex-1 ${
              spread ? "border-line bg-paper-warm opacity-60" : "border-line bg-paper"
            }`}
          >
            <code className="block !whitespace-normal !border-0 !bg-transparent !p-0 text-[11px] font-bold">
              dim_people
            </code>
            <span className="mt-1 block font-display text-[9px] font-bold uppercase tracking-wider text-ink-soft">
              {spread ? "table · skipped, keeps yesterday's rows" : "table · waiting"}
            </span>
          </div>

          <span
            className={`mx-auto my-1 h-5 border-l-2 sm:mx-1.5 sm:my-0 sm:h-0 sm:w-5 sm:border-l-0 sm:border-t-2 ${
              spread ? "border-dashed border-line" : "border-line"
            }`}
            aria-hidden
          />

          {/* the consumer */}
          <div
            className={`min-w-0 rounded-full border-2 px-3 py-2.5 text-center transition-all duration-300 sm:flex-1 ${
              spread ? "border-layer-staging bg-layer-staging/10" : "border-dashed border-line"
            }`}
          >
            <span className="block font-display text-[11px] font-extrabold text-ink">
              dashboard
            </span>
            <span className="mt-0.5 block font-display text-[9px] font-bold uppercase tracking-wider text-ink-soft">
              {spread ? "stale, not wrong" : "reads dim_people"}
            </span>
          </div>
        </div>
      </div>

      <figcaption className="border-t-2 border-ink bg-paper-warm px-4 py-3 text-sm text-ink-soft">
        <strong className="text-ink">{PHASES[phase].label}.</strong>{" "}
        {PHASES[phase].caption}
      </figcaption>
    </figure>
  );
}
