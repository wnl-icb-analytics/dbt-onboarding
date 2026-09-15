"use client";

import { useState } from "react";

const PHASES = [
  {
    id: "parse",
    label: "1. Parse",
    verb: "Read the project",
    body: "dbt reads SQL, YAML and configuration, resolves ref() and source(), and builds the DAG.",
    output: "a map of models and links",
    warehouse: "Nothing is created",
    color: "var(--layer-raw)",
  },
  {
    id: "compile",
    label: "2. Compile",
    verb: "Render executable SQL",
    body: "Jinja, macros and relation names become the plain SQL that the data platform can execute.",
    output: "plain SQL",
    warehouse: "Nothing is created",
    color: "var(--layer-modelling)",
  },
  {
    id: "execute",
    label: "3. Execute",
    verb: "Do the requested work",
    body: "Commands such as run, test, build and show send compiled SQL to the configured warehouse destination.",
    output: "a model, test result or row preview",
    warehouse: "Snowflake does the requested work",
    color: "var(--layer-reporting)",
  },
] as const;

export function DbtExecutionFlow() {
  const [active, setActive] = useState(0);
  const phase = PHASES[active];

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
      <div className="grid sm:grid-cols-3">
        {PHASES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(index)}
            aria-pressed={active === index}
            className={`relative px-4 py-4 text-left transition sm:border-r sm:last:border-r-0 ${
              active === index ? "bg-ink text-paper" : "border-line bg-paper hover:bg-paper-warm"
            }`}
          >
            <span
              className="block font-display text-xs font-extrabold uppercase tracking-[0.16em]"
              style={{ color: active === index ? "var(--paper)" : "var(--ink-faint)" }}
            >
              {item.label}
            </span>
            <span className="mt-1 block text-sm font-semibold">{item.verb}</span>
            {index < PHASES.length - 1 && (
              <span className="absolute -bottom-2 left-1/2 z-10 hidden -translate-x-1/2 font-mono text-flame sm:bottom-auto sm:left-auto sm:right-[-7px] sm:top-1/2 sm:block sm:-translate-y-1/2 sm:translate-x-0">
                →
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="border-t-2 border-ink px-5 py-4">
        <p className="!my-0 !text-ink">{phase.body}</p>
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-paper-warm px-3 py-2">
            <span className="font-display font-bold uppercase tracking-wider text-ink-faint">Produces</span>
            <code className="mt-0.5 block !whitespace-normal !border-0 !bg-transparent !p-0 text-ink">{phase.output}</code>
          </div>
          <div className="rounded-lg border border-line bg-paper-warm px-3 py-2">
            <span className="font-display font-bold uppercase tracking-wider text-ink-faint">Warehouse effect</span>
            <span className="mt-0.5 block text-ink">{phase.warehouse}</span>
          </div>
        </div>
      </div>
      <figcaption className="border-t border-line px-4 py-2 text-center font-mono text-[11px] text-ink-faint">
        choose a phase to inspect it
      </figcaption>
    </figure>
  );
}
