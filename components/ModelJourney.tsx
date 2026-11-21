"use client";

import { useState } from "react";
import { useInteractionDone } from "@/lib/interaction";

type Stage = 0 | 1 | 2;

const STAGES = [
  { tab: "1. Your file", file: "models/staging/olids/stg_people.sql" },
  { tab: "2. Compile", file: "target/compiled/wnl_analytics/models/staging/olids/stg_people.sql" },
  { tab: "3. Execute", file: "sent to Snowflake" },
] as const;

const CAPTIONS = [
  "Your file only describes the rows. There's no CREATE and no destination. Just the SELECT.",
  "dbt resolved ref('raw_people') to its full Snowflake name. It picked the DEV__ copy because you're developing. dbt may have queried Snowflake for metadata, but nothing has been built yet.",
  "dbt wrapped your SELECT in the DDL and sent it. Snowflake created the view, in the shared dev environment.",
] as const;

const CTA = ["Compile it →", "Run it →", "Start again"] as const;

/** one model, walked through compile and execute */
export function ModelJourney() {
  const interactionDone = useInteractionDone();
  const [stage, setStage] = useState<Stage>(0);
  const [reached, setReached] = useState<Stage>(0);

  const advance = () => {
    if (stage === 2) {
      setStage(0);
      return;
    }
    const next = (stage + 1) as Stage;
    setStage(next);
    setReached((r) => (next > r ? next : r));
    if (next === 2) interactionDone();
  };

  const line = (
    content: React.ReactNode,
    i: number,
    opts: { added?: boolean; changed?: boolean } = {},
  ) => (
    <div
      key={`${stage}-${i}`}
      className={`rise flex items-baseline gap-2 rounded px-2 py-0.5 ${
        opts.added ? "bg-[#ff9a82]/10" : opts.changed ? "bg-[#7ee2c0]/10" : ""
      }`}
      style={{ animationDelay: `${i * 90}ms` }}
    >
      <span className={`w-3 shrink-0 select-none text-right ${opts.added ? "text-[#ff9a82]" : opts.changed ? "text-[#7ee2c0]" : "text-white/20"}`}>
        {opts.added ? "+" : opts.changed ? "~" : "·"}
      </span>
      <span className="min-w-0 break-words">{content}</span>
    </div>
  );

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-staging)]">
      {/* stage tabs */}
      <div className="grid grid-cols-3 border-b-2 border-ink">
        {STAGES.map((s, i) => {
          const reachable = i <= reached;
          return (
            <button
              key={s.tab}
              type="button"
              disabled={!reachable}
              aria-pressed={stage === i}
              onClick={() => setStage(i as Stage)}
              className={`px-3 py-2.5 text-left font-display text-[11px] font-extrabold uppercase tracking-[0.14em] transition disabled:cursor-default sm:border-r sm:border-line sm:last:border-r-0 ${
                stage === i
                  ? "bg-ink text-paper"
                  : reachable
                    ? "bg-paper text-ink-soft hover:bg-paper-warm"
                    : "bg-paper text-ink-faint/50"
              }`}
            >
              {s.tab}
            </button>
          );
        })}
      </div>

      {/* the code, evolving */}
      <div className="bg-graphite-deep p-4 font-mono text-[12px] leading-6 text-[#e8eaf2]">
        <p className="!my-0 mb-2 break-all text-white/40">{STAGES[stage].file}</p>
        <div key={stage}>
          {stage === 0 && (
            <>
              {line(
                <>
                  <span className="text-[#ff9a82]">select</span> person_id, postcode
                </>,
                0,
              )}
              {line(
                <>
                  <span className="text-[#ff9a82]">from</span>{" "}
                  <span className="rounded bg-[#7ee2c0]/15 px-1 text-[#7ee2c0]">
                    {"{{ ref('raw_people') }}"}
                  </span>
                </>,
                1,
              )}
            </>
          )}
          {stage === 1 && (
            <>
              {line(
                <>
                  <span className="text-[#ff9a82]">select</span> person_id, postcode
                </>,
                0,
              )}
              {line(
                <>
                  <span className="text-[#ff9a82]">from</span>{" "}
                  <span className="rounded bg-[#7ee2c0]/15 px-1 text-[#7ee2c0]">
                    DEV__STAGING.DBT_RAW.RAW_PEOPLE
                  </span>
                </>,
                1,
                { changed: true },
              )}
            </>
          )}
          {stage === 2 && (
            <>
              {line(
                <>
                  <span className="text-[#ff9a82]">create or replace view</span>
                </>,
                0,
                { added: true },
              )}
              {line(<>&nbsp;&nbsp;DEV__STAGING.OLIDS.STG_PEOPLE <span className="text-[#ff9a82]">as</span> (</>, 1, { added: true })}
              {line(
                <>
                  &nbsp;&nbsp;<span className="text-[#ff9a82]">select</span> person_id, postcode
                </>,
                2,
              )}
              {line(
                <>
                  &nbsp;&nbsp;<span className="text-[#ff9a82]">from</span>{" "}
                  <span className="text-[#7ee2c0]">DEV__STAGING.DBT_RAW.RAW_PEOPLE</span>
                </>,
                3,
              )}
              {line(<>);</>, 4, { added: true })}
            </>
          )}
        </div>
        {stage > 0 && (
          <p className="!my-0 mt-2 text-[10px] text-white/35">
            {stage === 1 ? "~ resolved by dbt" : "+ added by dbt · your SELECT is untouched inside"}
          </p>
        )}
      </div>

      {/* the object in snowflake */}
      <div
        className={`flex items-center justify-between gap-3 border-t-2 border-ink px-4 py-3 transition-colors duration-500 ${
          stage === 2 ? "bg-layer-staging/10" : "bg-paper-warm"
        }`}
      >
        <div className="min-w-0">
          <span className="font-display text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-faint">
            Snowflake view
          </span>
          <code className="block !whitespace-normal break-words !border-0 !bg-transparent !p-0 text-[12px] text-ink">
            DEV__STAGING.OLIDS.STG_PEOPLE
          </code>
        </div>
        <span
          className={`shrink-0 rounded-full border-2 px-3 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider transition-all duration-500 ${
            stage === 2
              ? "border-layer-staging bg-layer-staging text-white"
              : "border-dashed border-line text-ink-faint"
          }`}
        >
          {stage === 2 ? "created ✓" : "not built yet"}
        </span>
      </div>

      {/* caption + action */}
      <div className="flex items-center justify-between gap-3 border-t border-line bg-paper px-4 py-3">
        <p className="!my-0 text-sm !text-ink-soft">{CAPTIONS[stage]}</p>
        <button
          type="button"
          onClick={advance}
          className="shrink-0 rounded-lg border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-paper transition hover:border-flame hover:bg-flame"
        >
          {CTA[stage]}
        </button>
      </div>
    </figure>
  );
}
