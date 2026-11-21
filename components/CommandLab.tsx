"use client";

import { useState } from "react";

const COMMANDS = ["dbt show", "dbt build", "dbt compile", "dbt ls", "dbt debug"] as const;

const SUMMARY = "==================== Execution Summary =====================";

/** outputs follow dbt Fusion's console format */
const SCENARIOS = [
  {
    prompt: "You wrote a SELECT and want to see five rows without creating the model.",
    answer: "dbt show",
    command: "dbt show -s stg_people --limit 5",
    output: [
      "┌───────────┬──────────┐",
      "│ PERSON_ID ┆ POSTCODE │",
      "╞═══════════╪══════════╡",
      "│ 10291     ┆ W10 4AA  │",
      "│ 10304     ┆ W12 7BB  │",
      "│ 10322     ┆ NW10 3CC │",
      "│ 10340     ┆ W3 8DD   │",
      "│ 10357     ┆ HA0 1EE  │",
      "└───────────┴──────────┘",
      "5 rows.",
      SUMMARY,
      "Finished 'show' successfully for target 'dev' [21.3s]",
    ].join("\n"),
  },
  {
    prompt: "You want to create one model and run its tests.",
    answer: "dbt build",
    command: "dbt build -s stg_people",
    output: [
      " Succeeded model OLIDS.stg_people (view) [1 of 4 in 2.10s]",
      "    Passed test  not_null_stg_people_person_id [2 of 4 in 0.91s]",
      "    Passed test  unique_stg_people_person_id [3 of 4 in 0.95s]",
      "    Passed test  not_null_stg_people_postcode [4 of 4 in 0.88s]",
      SUMMARY,
      "Finished 'build' successfully for target 'dev' [24.6s]",
      "Processed: 5 hooks | 1 model | 3 tests",
      "Summary: 9 total | 9 success",
    ].join("\n"),
  },
  {
    prompt: "A ref() or macro looks wrong. You want to inspect the SQL dbt produced.",
    answer: "dbt compile",
    command: "dbt compile -s stg_people",
    output: [
      "select person_id, postcode",
      "from DEV__STAGING.DBT_RAW.RAW_PEOPLE",
      SUMMARY,
      "Finished 'compile' successfully for target 'dev' [18.4s]",
      "Processed: 5 hooks | 1 model",
      "Summary: 6 total | 6 success",
    ].join("\n"),
  },
  {
    prompt: "You want to know what +stg_people selects before running anything.",
    answer: "dbt ls",
    command: "dbt ls -s +stg_people",
    output: [
      "=======================Selected nodes=======================",
      "wnl_analytics.raw.olids.raw_people",
      "wnl_analytics.staging.olids.stg_people",
      "source:wnl_analytics.olids.people",
      SUMMARY,
      "Finished 'list' successfully for target 'dev' [17.4s]",
    ].join("\n"),
  },
  {
    prompt: "dbt can't connect. You want to check the project and Snowflake setup.",
    answer: "dbt debug",
    command: "dbt debug",
    output: [
      "Debugging profile: dev",
      "Debugging adapter type: snowflake",
      "Debugging dependencies:",
      "  git: OK",
      "Debugging connection test: OK",
      "Debugged All checks passed!",
      SUMMARY,
      "Finished 'debug' successfully for target 'dev' [3.6s]",
    ].join("\n"),
  },
] as const;

export function CommandLab() {
  const [scenario, setScenario] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const current = SCENARIOS[scenario];
  const correct = picked === current.answer;

  const next = () => {
    setScenario((value) => (value + 1) % SCENARIOS.length);
    setPicked(null);
  };

  return (
    <section className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-flame)]">
      <header className="border-b-2 border-ink bg-paper-warm px-5 py-3">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame">
          Choose the command · {scenario + 1}/{SCENARIOS.length}
        </p>
        <p className="!mb-0 !mt-1 text-[15px] font-medium !text-ink">{current.prompt}</p>
      </header>

      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-5">
        {COMMANDS.map((command) => {
          const isPicked = picked === command;
          return (
            <button
              key={command}
              type="button"
              disabled={picked !== null}
              onClick={() => setPicked(command)}
              className={`rounded-xl border-2 px-2 py-3 font-mono text-[11px] transition disabled:cursor-default ${
                picked && command === current.answer
                  ? "border-layer-staging bg-layer-staging/10 text-ink"
                  : isPicked
                    ? "border-flame bg-flame-soft text-ink"
                    : picked
                      ? "border-line text-ink-faint opacity-55"
                      : "border-line bg-paper text-ink-soft hover:border-flame"
              }`}
            >
              {command}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="border-t-2 border-ink">
          <div className={`px-5 py-3 text-sm ${correct ? "bg-layer-staging/10" : "bg-flame-soft"}`}>
            <strong>{correct ? "Right." : "Not quite."}</strong>{" "}
            {correct ? "Here is what that run would look like." : `The smallest useful command is ${current.answer}.`}
          </div>
          <div className="bg-graphite-deep px-5 py-4 font-mono text-[12px] leading-5 text-white/70">
            <p className="!my-0 !text-[#e8eaf2]"><span className="text-[#7ee2c0]">$ </span>{current.command}</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre">{current.output}</pre>
          </div>
          <div className="flex justify-end bg-paper-warm p-3">
            <button
              type="button"
              onClick={next}
              className="rounded-lg border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-paper hover:border-flame hover:bg-flame"
            >
              Next situation →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
