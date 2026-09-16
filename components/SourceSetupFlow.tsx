"use client";

import { useState } from "react";

const ROUTES = {
  automatic: {
    label: "Automatic schema",
    note: "The schema is mapped and every table is allowed to become a source.",
    steps: [
      {
        eyebrow: "Warehouse",
        title: "The table lands",
        detail: "Snowflake contains the new table and its columns.",
        file: "DATA_LAKE.WL.OPEN_PATHWAYS",
        ownership: "upstream data",
      },
      {
        eyebrow: "Registry",
        title: "The schema is already mapped",
        detail: "The pipeline knows the source name, raw prefix and domain.",
        file: "scripts/sources/source_mappings.yml",
        ownership: "edit only for a new schema",
      },
      {
        eyebrow: "Source declaration",
        title: "The pipeline writes YAML",
        detail: "Live Snowflake metadata becomes a dbt source declaration.",
        file: "models/sources/auto_data_lake_wl.yml",
        ownership: "generated: do not edit",
      },
      {
        eyebrow: "Raw layer",
        title: "The pipeline writes SQL",
        detail: "A 1:1 raw model quotes and renames the source columns.",
        file: "models/raw/commissioning/raw_wl_open_pathways.sql",
        ownership: "generated: do not edit",
      },
    ],
  },
  manual: {
    label: "Curated manual schema",
    note: "The schema is mapped, but only tables a person lists are allowed in.",
    steps: [
      {
        eyebrow: "Warehouse",
        title: "The table lands",
        detail: "Snowflake contains the new table and its columns.",
        file: "DATA_LAKE__NCL.ANALYST_MANAGED.OPENING_HOURS",
        ownership: "upstream data",
      },
      {
        eyebrow: "Registry",
        title: "The mapping says manual: true",
        detail: "That flag stops automatic discovery from admitting every table.",
        file: "scripts/sources/source_mappings.yml",
        ownership: "inspect; usually do not edit",
      },
      {
        eyebrow: "Source declaration",
        title: "You add the table to YAML",
        detail: "The curated list is the approval step for this schema.",
        file: "models/sources/manual_analyst_managed.yml",
        ownership: "edit this file",
      },
      {
        eyebrow: "Raw layer",
        title: "The pipeline writes SQL",
        detail: "The approved table gets its generated 1:1 raw model.",
        file: "models/raw/shared/raw_reference_opening_hours.sql",
        ownership: "generated: do not edit",
      },
    ],
  },
} as const;

type Route = keyof typeof ROUTES;

export function SourceSetupFlow() {
  const [route, setRoute] = useState<Route>("manual");
  const current = ROUTES[route];

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-raw)]">
      <header className="border-b-2 border-ink bg-paper-warm p-4">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame">
          How a Snowflake table becomes usable in dbt
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(Object.keys(ROUTES) as Route[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={route === key}
              onClick={() => setRoute(key)}
              className={`rounded-lg border-2 px-3 py-2 text-left transition ${
                route === key
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink-soft hover:border-flame"
              }`}
            >
              <span className="font-display text-xs font-extrabold uppercase tracking-wider">
                {ROUTES[key].label}
              </span>
            </button>
          ))}
        </div>
        <p className="!mb-0 !mt-2 text-sm">{current.note}</p>
      </header>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {current.steps.map((step, index) => {
          const editable = step.ownership.startsWith("edit");
          const generated = step.ownership.startsWith("generated");
          return (
            <div key={step.file} className="min-w-0">
              <div
                className={`rise min-w-0 flex-1 rounded-xl border-2 p-3 ${
                  editable
                    ? "border-flame bg-flame-soft"
                    : generated
                      ? "border-layer-raw bg-layer-raw/5"
                      : "border-line bg-paper"
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span className="font-display text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink-faint">
                  {index + 1} · {step.eyebrow}
                </span>
                <p className="!mb-1 !mt-1 text-sm font-semibold !text-ink">{step.title}</p>
                <code className="block break-words !whitespace-normal !border-0 !bg-transparent !p-0 text-[10px] leading-relaxed !text-ink">
                  {step.file}
                </code>
                <p className="!mb-0 !mt-2 text-xs leading-relaxed">{step.detail}</p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 font-mono text-[9px] ${
                    editable
                      ? "bg-flame text-white"
                      : generated
                        ? "bg-layer-raw/15 text-layer-raw"
                        : "bg-paper-warm text-ink-faint"
                  }`}
                >
                  {step.ownership}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <figcaption className="border-t-2 border-ink px-4 py-2 text-center font-mono text-[11px] text-ink-faint">
        switch routes · orange is the file you edit · grey files are generated
      </figcaption>
    </figure>
  );
}
