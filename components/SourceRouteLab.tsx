"use client";

import { useState } from "react";
import { useInteractionDone } from "@/lib/interaction";

const ROUTES = [
  {
    id: "automatic",
    label: "Run the pipeline",
    hint: "The mapped schema admits all of its tables.",
  },
  {
    id: "manual",
    label: "Edit manual YAML, then run",
    hint: "A person must add the table to the curated list first.",
  },
  {
    id: "new",
    label: "Pair on a new mapping",
    hint: "The project does not yet know how to name or place this schema.",
  },
] as const;

type RouteId = (typeof ROUTES)[number]["id"];

const CASES = [
  {
    id: "waiting-list",
    address: "DATA_LAKE.WL.OPEN_PATHWAYS",
    mapping: "source_name: wl · domain: commissioning",
    answer: "automatic" as RouteId,
    result: "Run the pipeline. It updates auto_data_lake_wl.yml and creates raw_wl_open_pathways.sql.",
  },
  {
    id: "opening-hours",
    address: "DATA_LAKE__NCL.ANALYST_MANAGED.OPENING_HOURS",
    mapping: "source_name: reference_analyst_managed · manual: true",
    answer: "manual" as RouteId,
    result: "Add OPENING_HOURS to manual_analyst_managed.yml, then run the pipeline to create the raw model.",
  },
  {
    id: "partner-feed",
    address: "PARTNER_DROP.CARDIOLOGY.REFERRALS",
    mapping: "No database + schema match found",
    answer: "new" as RouteId,
    result: "Pair with the team before editing source_mappings.yml: the source name, domain and ownership need a decision.",
  },
] as const;

export function SourceRouteLab() {
  const interactionDone = useInteractionDone();
  const [caseIndex, setCaseIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, RouteId>>({});
  const [attempt, setAttempt] = useState<RouteId | null>(null);
  const current = CASES[caseIndex];
  const correct = answers[current.id];

  const choose = (route: RouteId) => {
    setAttempt(route);
    if (route !== current.answer) return;

    const next = { ...answers, [current.id]: route };
    setAnswers(next);
    if (Object.keys(next).length === CASES.length) interactionDone();
  };

  const openCase = (index: number) => {
    setCaseIndex(index);
    setAttempt(null);
  };

  return (
    <div className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-flame)]">
      <header className="border-b-2 border-ink bg-paper-warm p-4">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame">
          Route three missing raw models
        </p>
        <div className="mt-3 flex gap-1.5" aria-label="source cases">
          {CASES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openCase(index)}
              aria-pressed={caseIndex === index}
              className={`grid size-9 place-items-center rounded-full border-2 font-display text-xs font-extrabold transition ${
                caseIndex === index
                  ? "border-ink bg-ink text-paper"
                  : answers[item.id]
                    ? "border-layer-staging bg-layer-staging/10 text-layer-staging"
                    : "border-line bg-paper text-ink-faint hover:border-flame"
              }`}
            >
              {answers[item.id] ? "✓" : index + 1}
            </button>
          ))}
          <span className="ml-auto self-center font-mono text-[10px] text-ink-faint">
            {Object.keys(answers).length}/{CASES.length} routed
          </span>
        </div>
      </header>

      <div className="p-4 sm:p-5">
        <div className="rounded-xl border border-line bg-paper-warm/60 p-4">
          <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-ink-faint">
            Table with no raw model
          </span>
          <code className="mt-1 block break-words !whitespace-normal !border-0 !bg-transparent !p-0 text-[13px] font-bold !text-ink">
            {current.address}
          </code>
          <div className="mt-3 border-t border-line pt-3">
            <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-ink-faint">
              What scripts/sources/source_mappings.yml says
            </span>
            <code className="mt-1 block break-words !whitespace-normal !border-0 !bg-transparent !p-0 text-[12px] !text-ink">
              {current.mapping}
            </code>
          </div>
        </div>

        <p className="!mb-2 !mt-4 text-sm font-semibold !text-ink">What is the next move?</p>
        <div className="grid gap-2">
          {ROUTES.map((route) => {
            const isCorrect = correct === route.id;
            const isWrongAttempt = !correct && attempt === route.id;
            return (
              <button
                key={route.id}
                type="button"
                disabled={!!correct}
                onClick={() => choose(route.id)}
                className={`rounded-xl border-2 px-4 py-3 text-left transition disabled:cursor-default ${
                  isCorrect
                    ? "border-layer-staging bg-layer-staging/10"
                    : isWrongAttempt
                      ? "border-flame bg-flame-soft"
                      : "border-line bg-paper hover:border-flame"
                }`}
              >
                <span className="block text-sm font-semibold text-ink">
                  {isCorrect ? "✓ " : ""}{route.label}
                </span>
                <span className="mt-0.5 block text-xs text-ink-faint">{route.hint}</span>
              </button>
            );
          })}
        </div>

        {!correct && attempt && (
          <p className="rise !mb-0 !mt-3 rounded-lg bg-flame-soft px-3.5 py-2 text-sm">
            Not this route. Read the mapping result again: whether the schema is mapped, and whether it says <code>manual: true</code>, decides the next move.
          </p>
        )}

        {correct && (
          <div className="rise mt-3 rounded-xl border border-layer-staging/40 bg-layer-staging/10 px-4 py-3">
            <p className="!my-0 text-sm !text-ink"><strong>Right.</strong> {current.result}</p>
            {caseIndex < CASES.length - 1 && (
              <button
                type="button"
                onClick={() => openCase(caseIndex + 1)}
                className="mt-3 rounded-lg border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-paper transition hover:border-flame hover:bg-flame"
              >
                Next case →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
