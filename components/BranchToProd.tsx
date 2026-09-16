"use client";

import { useState } from "react";
import { useInteractionDone } from "@/lib/interaction";

const STAGES = [
  {
    id: "branch",
    label: "1. Your branch",
    verb: "Edit the SQL",
    body: "You change a model file on a git branch. Nothing has run anywhere — it is just text on your machine.",
    touches: "Nothing",
    color: "var(--layer-raw)",
  },
  {
    id: "dev",
    label: "2. The dev environment",
    verb: "Build and test it",
    body: "dbt build creates the model in the shared DEV__ databases — the team's working copy of the warehouse, completely separate from production.",
    touches: "Only the shared dev environment",
    color: "var(--layer-staging)",
  },
  {
    id: "pr",
    label: "3. The pull request",
    verb: "Checks and review",
    body: "CI compiles the project, runs the tests, and a teammate reads the change before it can go anywhere.",
    touches: "A shared test environment",
    color: "var(--layer-modelling)",
  },
  {
    id: "prod",
    label: "4. Production",
    verb: "Deploy, schedule or trigger",
    body: "Merging to main deploys the reviewed code. Scheduled runs normally keep it fresh; authorised analysts can also trigger a production run when there is an operational reason.",
    touches: "Production, using code from main",
    color: "var(--layer-reporting)",
  },
] as const;

/** the path reviewed code takes before it can run in production */
export function BranchToProd() {
  const interactionDone = useInteractionDone();
  const [active, setActive] = useState(0);
  const [viewed, setViewed] = useState<number[]>([0]);

  const view = (i: number) => {
    setActive(i);
    const next = viewed.includes(i) ? viewed : [...viewed, i];
    setViewed(next);
    if (next.length === STAGES.length) interactionDone();
  };

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-reporting)]">
      <div className="flex flex-col">
        {STAGES.map((item, index) => (
          <div key={item.id} className="border-b border-line last:border-b-0">
            <button
              type="button"
              onClick={() => view(index)}
              aria-pressed={active === index}
              className={`flex w-full items-baseline justify-between gap-3 px-4 py-3 text-left transition ${
                active === index ? "bg-ink text-paper" : "bg-paper hover:bg-paper-warm"
              }`}
            >
              <span className="min-w-0">
                <span
                  className="block font-display text-[11px] font-extrabold uppercase tracking-[0.14em]"
                  style={{ color: active === index ? "var(--paper)" : "var(--ink-faint)" }}
                >
                  {item.label}
                </span>
                <span className="mt-0.5 block text-sm font-semibold">{item.verb}</span>
              </span>
              <span
                className={`shrink-0 font-mono text-xs ${
                  active === index ? "text-paper/50" : viewed.includes(index) ? "text-layer-staging" : "text-ink-faint"
                }`}
              >
                {active === index ? "▾" : viewed.includes(index) ? "✓" : "▸"}
              </span>
            </button>
            {active === index && (
              <div className="rise border-t border-line bg-paper-warm/60 px-4 py-3.5">
                <p className="!my-0 text-[15px] !text-ink">{item.body}</p>
                <div className="mt-2.5 rounded-lg border border-line bg-paper px-3 py-2 text-xs">
                  <span className="font-display font-bold uppercase tracking-wider text-ink-faint">
                    What it touches
                  </span>
                  <span className="mt-0.5 block text-ink">{item.touches}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <figcaption className="border-t-2 border-ink px-4 py-2 text-center font-mono text-[11px] text-ink-faint">
        open each stage · only reviewed code from main should run in production
      </figcaption>
    </figure>
  );
}
