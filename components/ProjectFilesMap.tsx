"use client";

import { useState } from "react";

const FILES = [
  {
    name: "dbt_project.yml",
    place: "shared in git",
    job: "How this project behaves",
    detail: "Model folders, defaults, variables and where different layers build.",
    color: "var(--layer-modelling)",
  },
  {
    name: "profiles.yml",
    place: "shared in git",
    job: "The available Snowflake connections",
    detail: "This project commits it safely. It names dev, prod and CI outputs, but reads secret values from environment variables.",
    color: "var(--layer-staging)",
  },
  {
    name: ".env",
    place: "only on your machine",
    job: "Your actual connection values",
    detail: "Account, user and authentication values. Git ignores this file because it may contain secrets.",
    color: "var(--flame)",
  },
  {
    name: "target/",
    place: "generated on your machine",
    job: "What dbt made while working",
    detail: "Compiled SQL and run information. Useful to inspect, never something you edit by hand.",
    color: "var(--layer-raw)",
  },
] as const;

export function ProjectFilesMap() {
  const [active, setActive] = useState(0);
  const file = FILES[active];

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {FILES.map((item, index) => (
          <button
            key={item.name}
            type="button"
            aria-pressed={active === index}
            onClick={() => setActive(index)}
            className={`border-b border-r border-line px-3 py-4 text-left transition sm:border-b-0 ${
              active === index ? "bg-ink text-paper" : "bg-paper hover:bg-paper-warm"
            }`}
          >
            <code className={`block !whitespace-normal !border-0 !bg-transparent !p-0 text-[12px] ${active === index ? "!text-paper" : "!text-ink"}`}>
              {item.name}
            </code>
            <span className={`mt-1 block text-[10px] ${active === index ? "text-paper/55" : "text-ink-faint"}`}>
              {item.place}
            </span>
          </button>
        ))}
      </div>
      <div className="border-t-2 border-ink px-5 py-4">
        <div className="mb-3 h-1.5 rounded-full" style={{ background: file.color }} />
        <p className="!my-0 font-display text-base font-bold !text-ink">{file.job}</p>
        <p className="!mb-0 !mt-1 text-sm">{file.detail}</p>
      </div>
      <figcaption className="border-t border-line px-4 py-2 text-center font-mono text-[11px] text-ink-faint">
        choose a file to see its one job
      </figcaption>
    </figure>
  );
}
