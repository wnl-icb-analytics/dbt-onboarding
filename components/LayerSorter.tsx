"use client";

import { useState } from "react";
import { LAYERS, SORTER_ITEMS } from "@/lib/layers";
import { useInteractionDone } from "@/lib/interaction";

/** Assign each model description to the layer it belongs in. */
export function LayerSorter() {
  const interactionDone = useInteractionDone();
  const [assigned, setAssigned] = useState<Record<number, string>>({});
  const answered = Object.keys(assigned).length;
  const correct = SORTER_ITEMS.filter((it, i) => assigned[i] === it.layer).length;
  const finished = answered === SORTER_ITEMS.length;

  const assign = (i: number, layerId: string) => {
    const next = { ...assigned, [i]: layerId };
    setAssigned(next);
    if (Object.keys(next).length === SORTER_ITEMS.length) interactionDone();
  };

  return (
    <section className="my-8 max-w-[76ch] rounded-2xl border-2 border-ink bg-paper p-5 shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
      <header className="mb-4 flex items-baseline justify-between">
        <h3 className="!my-0 font-display text-sm font-extrabold uppercase tracking-widest">
          Match the layer
        </h3>
        <span className="font-mono text-xs text-ink-faint">
          {finished ? `${correct}/${SORTER_ITEMS.length} correct` : "which layer does each model belong in?"}
        </span>
      </header>
      <ol className="!my-0 flex max-w-none !list-none flex-col gap-4 !pl-0">
        {SORTER_ITEMS.map((item, i) => {
          const sel = assigned[i];
          const revealed = sel !== undefined;
          return (
            <li key={i} className="!my-0 !pl-0">
              <p className="!mt-0 !mb-1.5 text-sm font-medium !text-ink">
                “{item.text}”
              </p>
              <div className="flex flex-wrap gap-1.5">
                {LAYERS.map((l) => {
                  const chosen = sel === l.id;
                  const isAnswer = item.layer === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      disabled={revealed}
                      onClick={() => assign(i, l.id)}
                      style={
                        revealed && isAnswer
                          ? { backgroundColor: l.color, borderColor: l.color }
                          : chosen
                            ? { borderColor: l.color }
                            : undefined
                      }
                      className={`rounded-full border px-3 py-1 font-display text-xs font-bold uppercase tracking-wide transition disabled:cursor-default ${
                        revealed && isAnswer
                          ? "text-white"
                          : chosen
                            ? "text-ink line-through"
                            : revealed
                              ? "border-line text-ink-faint"
                              : "border-line text-ink-soft hover:border-ink"
                      }`}
                    >
                      {l.name}
                      {revealed && isAnswer && " ✓"}
                    </button>
                  );
                })}
              </div>
              {revealed && sel !== item.layer && (
                <p className="!my-0 !mt-1.5 text-xs !text-ink-faint">
                  <strong>{LAYERS.find((l) => l.id === item.layer)?.name}.</strong>{" "}
                  {item.reason}
                </p>
              )}
              {revealed && sel === item.layer && (
                <p className="!my-0 !mt-1.5 text-xs !text-ink-faint">
                  {item.reason}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {finished && (
        <p className="!my-0 !mt-4 rounded-lg bg-paper-warm px-4 py-2.5 text-sm text-ink-soft">
          {correct === SORTER_ITEMS.length
            ? "All correct."
            : "The reliable test is the ambiguity being resolved, not the SQL operation being used."}
        </p>
      )}
    </section>
  );
}
