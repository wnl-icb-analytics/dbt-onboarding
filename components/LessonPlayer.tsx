"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { InteractionContext } from "@/lib/interaction";
import type { Checkpoint, Step } from "@/lib/course-types";

function InlineCheckpointText({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code
        key={index}
        className="rounded-md border border-ink/15 bg-paper-warm px-1.5 py-0.5 font-mono text-[0.88em] font-medium !text-graphite"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}

function CheckpointBlock({
  check,
  onCorrect,
}: {
  check: Checkpoint;
  onCorrect: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === check.answer;

  return (
    <div className="my-5 rounded-2xl border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_0_var(--color-flame)]">
      <p className="!my-0 font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-flame">
        Check your understanding
      </p>
      <p className="!mb-3 !mt-1.5 text-[15px] font-medium !text-ink">
        <InlineCheckpointText text={check.prompt} />
      </p>
      <div className="flex flex-col gap-1.5">
        {check.options.map((opt, oi) => {
          const chosen = picked === oi;
          const isAnswer = check.answer === oi;
          const revealed = picked !== null;
          return (
            <button
              key={oi}
              type="button"
              disabled={revealed}
              onClick={() => {
                setPicked(oi);
                if (oi === check.answer) onCorrect();
              }}
              className={`rounded-lg border px-3.5 py-2 text-left text-sm transition disabled:cursor-default ${
                correct && isAnswer
                  ? "border-layer-staging bg-layer-staging/10 text-ink"
                  : chosen
                    ? "border-flame bg-flame-soft text-ink"
                    : revealed
                      ? "border-line text-ink-faint"
                      : "border-line text-ink-soft hover:border-flame hover:bg-flame-soft/50"
              }`}
            >
              <span className="mr-2 font-mono text-xs text-ink-faint">
                {String.fromCharCode(97 + oi)}
              </span>
              <InlineCheckpointText text={opt} />
              {correct && isAnswer && <span className="ml-2">✓</span>}
              {revealed && chosen && !isAnswer && <span className="ml-2">✗</span>}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div
          className={`!mb-0 !mt-2.5 rounded-lg px-3.5 py-2 text-sm leading-relaxed ${
            correct
              ? "bg-layer-staging/10 text-ink-soft"
              : "bg-flame-soft text-ink-soft"
          }`}
        >
          <p className="!my-0 text-sm leading-relaxed">
            <strong className="font-semibold text-ink">
              {correct ? "Right. " : "Not quite. "}
            </strong>
            <InlineCheckpointText text={check.explain} />
          </p>
          {!correct && (
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="mt-2 rounded-lg border border-flame bg-paper px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-widest text-flame-deep transition hover:bg-flame hover:text-white"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function LessonPlayer({
  courseSlug,
  courseTitle,
  lessonSlug,
  lessonTitle,
  lessonIndex,
  lessonCount,
  steps,
  nextHref,
  nextLabel,
  waypoints,
}: {
  courseSlug: string;
  courseTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonIndex: number;
  lessonCount: number;
  steps: Step[];
  nextHref: string;
  nextLabel: string;
  /** one short label per lesson — shows the whole journey with the current stop lit */
  waypoints?: string[];
}) {
  const lessonId = `${courseSlug}/${lessonSlug}`;
  const { ready, getStep, setStep, markDone, isDone } = useProgress();
  const router = useRouter();

  // current step shown (1-based)
  const [pos, setPos] = useState(1);
  // checkpoint outcomes: right this visit, "done" when restored from storage
  const [answered, setAnswered] = useState<Record<number, "right" | "done">>({});
  // interaction-gated steps the learner has completed this visit (or previously)
  const [interacted, setInteracted] = useState<Record<number, boolean>>({});
  const [restored, setRestored] = useState(false);

  // resume at the furthest step reached previously
  useEffect(() => {
    if (!ready || restored) return;

    const restoreProgress = window.setTimeout(() => {
      const saved = getStep(lessonId);
      if (saved > 1) {
        const upTo = Math.min(saved, steps.length);
        setPos(upTo);
        const pre: Record<number, "done"> = {};
        const preInteract: Record<number, boolean> = {};
        for (let i = 0; i < upTo - 1; i++) {
          pre[i] = "done";
          preInteract[i] = true;
        }
        setAnswered(pre);
        setInteracted(preInteract);
      }
      setRestored(true);
    }, 0);

    return () => window.clearTimeout(restoreProgress);
  }, [ready, restored, getStep, lessonId, steps.length]);

  // persist the furthest position reached
  useEffect(() => {
    if (restored) setStep(lessonId, pos);
  }, [pos, restored, setStep, lessonId]);

  const i = pos - 1;
  const step = steps[i];
  const needsAnswer = !!step.check && !answered[i];
  const needsInteract = !!step.interact && !interacted[i];
  const blocked = needsAnswer || needsInteract;
  const atEnd = pos >= steps.length;

  const markInteracted = useCallback(() => {
    setInteracted((a) => (a[pos - 1] ? a : { ...a, [pos - 1]: true }));
  }, [pos]);
  const finished = ready && isDone(`course/${lessonId}`);

  const goBack = () => {
    if (pos > 1) {
      setPos((p) => p - 1);
      window.scrollTo({ top: 0 });
    }
  };

  const advance = () => {
    if (blocked) return;
    if (!atEnd) {
      setPos((p) => p + 1);
      window.scrollTo({ top: 0 });
    } else {
      markDone(`course/${lessonId}`);
      router.push(nextHref);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <header className="mb-8 border-b-2 border-ink pb-5">
        <p className="flex items-baseline justify-between font-mono text-xs text-ink-faint">
          <Link
            href={`/courses/${courseSlug}`}
            className="font-display font-extrabold uppercase tracking-[0.18em] text-flame hover:text-flame-deep"
          >
            ← {courseTitle}
          </Link>
          <span>
            lesson {lessonIndex + 1} of {lessonCount}
          </span>
        </p>
        {waypoints && (
          <ol
            className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1.5"
            aria-label="your route through the course"
          >
            {waypoints.map((w, wi) => (
              <li key={w} className="flex items-center gap-x-1.5">
                <span
                  className={`font-display text-[9px] font-extrabold uppercase tracking-[0.12em] ${
                    wi === lessonIndex
                      ? "rounded-full bg-flame px-2 py-0.5 text-white"
                      : wi < lessonIndex
                        ? "text-ink-soft"
                        : "text-ink-faint/60"
                  }`}
                >
                  {wi < lessonIndex && <span aria-label="done">✓ </span>}
                  {w}
                </span>
                {wi < waypoints.length - 1 && (
                  <span className="text-[10px] text-ink-faint/40" aria-hidden>
                    ›
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
          {lessonTitle}
        </h1>
        <div className="mt-2 flex gap-1" aria-label={`step ${pos} of ${steps.length}`}>
          {steps.map((s, si) => {
            const reachable = si + 1 <= Math.max(pos, ready ? getStep(lessonId) : 1);
            return (
              <button
                key={s.id}
                type="button"
                aria-label={`go to step ${si + 1}`}
                title={s.title ?? `step ${si + 1}`}
                disabled={!reachable}
                onClick={() => {
                  setPos(si + 1);
                  window.scrollTo({ top: 0 });
                }}
                className="group flex-1 cursor-pointer py-2.5 disabled:cursor-default"
              >
                <span
                  className={`block rounded-full transition-all duration-150 ${
                    si + 1 === pos
                      ? "h-2.5 bg-flame"
                      : reachable
                        ? "h-1.5 bg-flame/40 group-hover:h-2.5 group-hover:bg-flame/70"
                        : "h-1.5 bg-line"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </header>

      <div key={step.id} className="lesson rise">
        {step.title && (
          <h2 className="!mt-0 font-display text-xl font-extrabold tracking-tight text-ink">
            {step.title}
          </h2>
        )}
        <InteractionContext.Provider value={markInteracted}>
          <div>{step.body}</div>
        </InteractionContext.Provider>
        {step.check &&
          (answered[i] ? (
            <p className="!my-3 rounded-xl border border-layer-staging/40 bg-layer-staging/10 px-4 py-3 text-sm font-medium !text-ink">
              {answered[i] === "right" && (
                <>✓ <strong>Right</strong> — {step.check.affirm ?? "you've got this one."}</>
              )}
              {answered[i] === "done" && (
                <>✓ {step.check.affirm ?? "Answered on a previous visit."}</>
              )}
            </p>
          ) : (
            <CheckpointBlock
              check={step.check}
              onCorrect={() => setAnswered((a) => ({ ...a, [i]: "right" }))}
            />
          ))}
      </div>

      <div className="mt-10 flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={pos <= 1}
          className="rounded-xl border-2 border-line px-5 py-3.5 font-display text-sm font-extrabold uppercase tracking-widest text-ink-soft transition enabled:hover:border-ink enabled:hover:text-ink disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={advance}
          disabled={blocked}
          className={`flex-1 rounded-xl border-2 px-5 py-3.5 font-display text-sm font-extrabold uppercase tracking-widest transition ${
            blocked
              ? "cursor-not-allowed border-line bg-paper-warm text-ink-faint"
              : "border-ink bg-ink text-paper hover:border-flame hover:bg-flame"
          }`}
        >
          {blocked
            ? needsAnswer
              ? "Answer the question to continue"
              : "Try it above to continue"
            : atEnd
              ? finished
                ? `Next: ${nextLabel} →`
                : `Finish lesson · ${nextLabel} →`
              : "Continue"}
        </button>
      </div>
      <p className="mt-2 text-center font-mono text-[11px] text-ink-faint">
        step {pos} of {steps.length}
      </p>
    </div>
  );
}
