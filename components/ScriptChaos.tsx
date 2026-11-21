"use client";

import { useState } from "react";
import { useInteractionDone } from "@/lib/interaction";

const SCRIPTS = [
  { id: "lookup", file: "update_specialty_lookup.sql" },
  { id: "base", file: "refresh_wl_base.sql" },
  { id: "waits", file: "build_current_waits.sql" },
  { id: "report", file: "weekly_report.sql" },
] as const;

/** correct dependency order, only visible once dbt reads the SQL */
const ORDERED = ["base", "lookup", "waits", "report"] as const;

export function ScriptChaos() {
  const interactionDone = useInteractionDone();
  const [picked, setPicked] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const phase = revealed ? "revealed" : picked.length === SCRIPTS.length ? "punchline" : "guess";

  const pick = (id: string) => {
    if (revealed) return;
    setPicked((prev) =>
      prev.includes(id) || prev.length === SCRIPTS.length ? prev : [...prev, id],
    );
  };

  const reset = () => {
    setPicked([]);
    setRevealed(false);
  };

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-flame)]">
      <header className="border-b-2 border-ink bg-paper-warm px-5 py-3">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame">
          A shared folder of scripts
        </p>
        <p className="!mb-0 !mt-1 text-[15px] font-medium !text-ink">
          {phase === "revealed"
            ? "dbt read the SQL and derived the order."
            : "They must run in the right order, every week. Click them in the order you think they run."}
        </p>
      </header>

      <div className="p-4">
        {phase !== "revealed" ? (
          <div className="grid grid-cols-2 gap-2">
            {SCRIPTS.map((s) => {
              const at = picked.indexOf(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={phase !== "guess" || at >= 0}
                  onClick={() => pick(s.id)}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-left transition disabled:cursor-default ${
                    at >= 0
                      ? "border-ink bg-paper-warm"
                      : "border-line bg-paper hover:border-flame"
                  }`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full font-display text-xs font-bold ${
                      at >= 0 ? "bg-ink text-paper" : "border border-dashed border-line text-ink-faint"
                    }`}
                  >
                    {at >= 0 ? at + 1 : "?"}
                  </span>
                  <code className="min-w-0 break-words !whitespace-normal !border-0 !bg-transparent !p-0 text-[11px] text-ink">
                    {s.file}
                  </code>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col">
            {ORDERED.map((id, i) => {
              const s = SCRIPTS.find((x) => x.id === id)!;
              return (
                <div key={id} className="flex flex-col">
                  <div
                    className="rise flex items-center gap-3 rounded-xl border-2 border-layer-staging bg-layer-staging/10 px-3.5 py-2.5"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink font-display text-[11px] font-bold text-paper">
                      {i + 1}
                    </span>
                    <code className="min-w-0 break-words !whitespace-normal !border-0 !bg-transparent !p-0 text-[12px] text-ink">
                      {s.file}
                    </code>
                  </div>
                  {i < ORDERED.length - 1 && (
                    <span
                      className="rise ml-6 py-0.5 font-mono leading-none text-flame"
                      style={{ animationDelay: `${i * 120 + 60}ms` }}
                    >
                      ↓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {phase === "punchline" && (
        <div className="border-t-2 border-ink">
          <div className="bg-flame-soft px-5 py-3 text-sm text-ink-soft">
            <strong className="text-ink">Trick question. You can&apos;t know.</strong>{" "}
            Nothing in the folder records the order. It lives in the head of whoever
            runs these every Monday, and it leaves when they do.
          </div>
          <div className="flex justify-end gap-2 bg-paper-warm p-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border-2 border-line px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-ink-soft transition hover:border-ink"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => {
                setRevealed(true);
                interactionDone();
              }}
              className="rounded-lg border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-paper transition hover:border-flame hover:bg-flame"
            >
              Let dbt read the SQL →
            </button>
          </div>
        </div>
      )}

      {phase === "revealed" && (
        <div className="border-t-2 border-ink">
          <div className="bg-layer-staging/10 px-5 py-3 text-sm text-ink-soft">
            <strong className="text-ink">The order was in the SQL all along.</strong>{" "}
            Each script reads tables another one builds. dbt reads those references
            and derives the sequence fresh on every run, with nobody remembering anything.
          </div>
          <div className="flex justify-end bg-paper-warm p-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border-2 border-line px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-ink-soft transition hover:border-ink"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </figure>
  );
}
