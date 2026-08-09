"use client";

import { useState } from "react";
import { useInteractionDone } from "@/lib/interaction";

type View = "combined" | "composed";

const CONCEPTS = [
  { name: "recent A&E attendance", colour: "border-layer-staging text-layer-staging" },
  { name: "recent admissions", colour: "border-layer-modelling text-layer-modelling" },
  { name: "recent outpatient appointments", colour: "border-layer-reporting text-layer-reporting" },
  { name: "recent GP appointments", colour: "border-layer-semantic text-layer-semantic" },
  { name: "current demographics", colour: "border-layer-published text-layer-published" },
] as const;

function ConceptRow({
  name,
  colour,
  label,
  delay,
}: {
  name: string;
  colour: string;
  label: string;
  delay: number;
}) {
  return (
    <div
      className={`rise rounded-md border-l-[3px] bg-white/[0.06] px-3 py-1.5 ${colour}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="!my-0 font-mono text-[10px] uppercase tracking-wider !text-white/40">
        {label}
      </p>
      <p className="!my-0 font-mono text-[12px] !text-white">{name}</p>
    </div>
  );
}

export function ModelDesignCompare() {
  const interactionDone = useInteractionDone();
  const [view, setView] = useState<View>("combined");

  const select = (next: View) => {
    setView(next);
    if (next === "composed") interactionDone();
  };

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
      <header className="border-b-2 border-ink bg-paper-warm px-5 py-3">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-layer-modelling">
          Definition and delivery
        </p>
        <p className="!mb-0 !mt-1 text-[15px] font-medium !text-ink">
          The analyst receives the same wide row in both designs. What changes is
          where its definitions are owned.
        </p>
      </header>

      <div className="grid grid-cols-2 border-b-2 border-ink">
        <button
          type="button"
          aria-pressed={view === "combined"}
          onClick={() => select("combined")}
          className={`border-r-2 border-ink px-3 py-2.5 text-left font-display text-[11px] font-extrabold uppercase tracking-[0.12em] transition ${
            view === "combined"
              ? "bg-ink text-paper"
              : "bg-paper text-ink-soft hover:bg-paper-warm"
          }`}
        >
          1. Define everything here
        </button>
        <button
          type="button"
          aria-pressed={view === "composed"}
          onClick={() => select("composed")}
          className={`px-3 py-2.5 text-left font-display text-[11px] font-extrabold uppercase tracking-[0.12em] transition ${
            view === "composed"
              ? "bg-ink text-paper"
              : "bg-paper text-ink-soft hover:bg-paper-warm"
          }`}
        >
          2. Compose owned definitions
        </button>
      </div>

      <div className="bg-graphite-deep p-5 sm:p-6">
        <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1.35fr]">
          {/* upstream: where definitions live */}
          {view === "combined" ? (
            <div className="rise flex min-h-[120px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/15 p-4 text-center">
              <p className="!my-0 font-mono text-[10px] uppercase tracking-wider !text-white/40">
                owned upstream definitions
              </p>
              <p className="!my-0 max-w-[22ch] font-mono text-[12px] leading-relaxed !text-white/60">
                none — nothing to reuse, nothing to test on its own
              </p>
            </div>
          ) : (
            <div className="grid content-center gap-2">
              {CONCEPTS.map((concept, index) => (
                <ConceptRow
                  key={concept.name}
                  name={concept.name}
                  colour={concept.colour}
                  label="defined and tested"
                  delay={index * 70}
                />
              ))}
            </div>
          )}

          {/* flow into the delivering model */}
          <div
            aria-hidden
            className={`self-center text-center font-display text-2xl font-black ${
              view === "composed" ? "text-flame" : "text-white/20"
            }`}
          >
            <span className="md:hidden">↓</span>
            <span className="hidden md:inline">→</span>
          </div>

          {/* the model analysts query */}
          {view === "combined" ? (
            <div className="rise rounded-xl border-2 border-flame/80 bg-white/[0.04] p-4 sm:p-5">
              <p className="!my-0 font-mono text-[10px] uppercase tracking-wider !text-white/45">
                hypothetical · one model defines and delivers
              </p>
              <p className="!mb-0 !mt-1 font-mono text-sm !text-white">
                obt_activity_dashboard
              </p>
              <div className="mt-4 grid gap-1.5">
                {CONCEPTS.map((concept, index) => (
                  <ConceptRow
                    key={concept.name}
                    name={concept.name}
                    colour={concept.colour}
                    label="defined only here"
                    delay={index * 70}
                  />
                ))}
              </div>
              <p className="!mb-0 !mt-4 border-t border-white/10 pt-3 font-mono text-[11px] leading-relaxed !text-[#ffb3a3]">
                A change to any one definition reopens and retests this whole
                transformation.
              </p>
            </div>
          ) : (
            <div className="rise rounded-xl border-2 border-layer-staging/80 bg-white/[0.04] p-4 sm:p-5">
              <p className="!my-0 font-mono text-[10px] uppercase tracking-wider !text-white/45">
                real project · one model composes and delivers
              </p>
              <p className="!mb-0 !mt-1 font-mono text-sm !text-white">
                obt_person_activity
              </p>
              <div className="mt-4 grid gap-1.5">
                {CONCEPTS.map((concept, index) => (
                  <p
                    key={concept.name}
                    className="rise !my-0 flex items-center gap-2 font-mono text-[11px] !text-white/70"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full bg-current ${concept.colour}`}
                    />
                    composes {concept.name}
                  </p>
                ))}
              </div>
              <p className="!mb-0 !mt-4 border-t border-white/10 pt-3 font-mono text-[11px] leading-relaxed !text-[#7ee2c0]">
                Same convenient row for analysts; clearer ownership for
                developers.
              </p>
            </div>
          )}
        </div>
      </div>

      <figcaption className="border-t-2 border-ink bg-paper px-5 py-3 text-sm text-ink-soft">
        {view === "combined" ? (
          <>
            The width is not the problem. The model is also the only home of several
            independently changing definitions. Select the second design to separate
            ownership from delivery.
          </>
        ) : (
          <>
            Definitions have clear homes, but consumers still receive one wide,
            convenient analytical model. <strong className="text-ink">Separation in the
            DAG does not require inconvenience at the point of use.</strong>
          </>
        )}
      </figcaption>
    </figure>
  );
}
