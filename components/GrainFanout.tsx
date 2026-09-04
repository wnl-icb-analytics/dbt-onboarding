"use client";

import { useState } from "react";
import { useInteractionDone } from "@/lib/interaction";

const PATIENTS = ["10291", "10304", "10317"] as const;

const ADMISSIONS: { person_id: string; discharge: string }[] = [
  { person_id: "10291", discharge: "usual residence" },
  { person_id: "10304", discharge: "usual residence" },
  { person_id: "10304", discharge: "care home" },
  { person_id: "10317", discharge: "usual residence" },
];

type Phase = "before" | "joined" | "tested";

/** a join silently breaks the grain; the grain test catches it */
export function GrainFanout() {
  const interactionDone = useInteractionDone();
  const [phase, setPhase] = useState<Phase>("before");

  const dupes = ADMISSIONS.filter(
    (r) => ADMISSIONS.filter((x) => x.person_id === r.person_id).length > 1,
  );

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-flame)]">
      <header className="border-b-2 border-ink bg-paper-warm px-5 py-3">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame">
          Grain: one row per person
        </p>
        <p className="!mb-0 !mt-1 text-[15px] font-medium !text-ink">
          Join the people to their admissions to add each admission&apos;s
          discharge destination.
        </p>
      </header>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {/* left: patients */}
        <div>
          <p className="!my-0 mb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            fictional people · {PATIENTS.length} rows
          </p>
          <table className="!my-0 w-full border-collapse font-mono text-[12px]">
            <tbody>
              {PATIENTS.map((p) => (
                <tr key={p}>
                  <td className="border-b border-line px-3 py-1.5 text-ink">
                    {p}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* right: result of the join */}
        <div>
          <p className="!my-0 mb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            {phase === "before"
              ? "after the join · ? rows"
              : `after the join · ${ADMISSIONS.length} rows`}
          </p>
          {phase === "before" ? (
            <div className="grid h-[88px] place-items-center rounded-lg border-2 border-dashed border-line text-xs text-ink-faint">
              not run yet
            </div>
          ) : (
            <table className="!my-0 w-full border-collapse font-mono text-[12px]">
              <tbody>
                {ADMISSIONS.map((r, i) => {
                  const isDupe = dupes.includes(r);
                  return (
                    <tr
                      key={i}
                      className={`rise ${isDupe ? "bg-flame-soft" : ""}`}
                      style={{ animationDelay: `${i * 110}ms` }}
                    >
                      <td
                        className={`border-b border-line px-3 py-1.5 ${isDupe ? "text-flame-deep" : "text-ink"}`}
                      >
                        {r.person_id}
                      </td>
                      <td
                        className={`border-b border-line px-3 py-1.5 ${isDupe ? "text-flame-deep" : "text-ink"}`}
                      >
                        {r.discharge}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {phase !== "before" && (
        <div className="border-t-2 border-ink bg-flame-soft px-5 py-3 text-sm text-ink-soft">
          <strong className="text-ink">3 people in → 4 rows out.</strong> Person
          10304 has two admissions, so the join returns two rows for that
          person. Counting these rows as people would give four instead of
          three.
        </div>
      )}

      {phase === "tested" && (
        <div className="border-t-2 border-ink">
          <div className="bg-graphite-deep px-5 py-3 font-mono text-[12px] leading-5">
            <p className="!my-0 text-white/40">-- find repeated person keys</p>
            <pre className="!my-0 mt-1 whitespace-pre-wrap !bg-transparent !p-0 text-[#e8eaf2]">{`select person_id from this_model
group by person_id having count(*) > 1`}</pre>
          </div>
          <div className="bg-layer-staging/10 px-5 py-3 text-sm text-ink-soft">
            <strong className="text-ink">1 row returned → FAIL.</strong> This
            test detects the repeated person key. It provides a repeatable check
            when selected for a test run, but does not decide which admission
            the analysis should use.
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-line bg-paper-warm p-3">
        {phase === "before" && (
          <button
            type="button"
            onClick={() => setPhase("joined")}
            className="rounded-lg border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-paper transition hover:border-flame hover:bg-flame"
          >
            Run the join →
          </button>
        )}
        {phase === "joined" && (
          <button
            type="button"
            onClick={() => {
              setPhase("tested");
              interactionDone();
            }}
            className="rounded-lg border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-paper transition hover:border-flame hover:bg-flame"
          >
            Add the grain test →
          </button>
        )}
        {phase === "tested" && (
          <button
            type="button"
            onClick={() => setPhase("before")}
            className="rounded-lg border-2 border-line px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-ink-soft transition hover:border-ink"
          >
            Reset
          </button>
        )}
      </div>
    </figure>
  );
}
