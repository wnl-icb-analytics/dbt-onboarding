"use client";

import { useState } from "react";
import { useInteractionDone } from "@/lib/interaction";

const INDENT_START = `version: 2
models:
- name: stg_people
description: One row per person
columns:
- name: person_id
description: Stable person identifier
data_tests:
- not_null
- unique`;

const INDENT_ANSWER = `version: 2
models:
  - name: stg_people
    description: One row per person
    columns:
      - name: person_id
        description: Stable person identifier
        data_tests:
          - not_null
          - unique`;

const SIBLING_START = `${INDENT_ANSWER}
      # Add postcode here`;

const SIBLING_ANSWER = `${INDENT_ANSWER}
      - name: postcode
        description: Latest known postcode`;

const INDENT_HELP = [
  "version is top-level file metadata, so it stays against the left edge.",
  "models is a top-level property, so it also stays against the left edge.",
  "models opens a list. Its first item sits one level inside it: two spaces, then a dash.",
  "description belongs to the model. Align it with the model's other properties, four spaces from the left.",
  "columns is another property of the model. Align it with description, four spaces from the left.",
  "columns opens a list. Its first column sits one level inside it: six spaces, then a dash.",
  "This description belongs to person_id, so it sits one level inside that column item: eight spaces.",
  "data_tests also belongs to person_id. Align it with the column description, eight spaces from the left.",
  "data_tests opens a list. Its first test sits one level inside it: ten spaces, then a dash.",
  "unique is a second test in the same list. Align it with not_null at ten spaces.",
] as const;

const SIBLING_HELP = [
  ...INDENT_HELP,
  "postcode is a second item in the columns list. Align it with person_id: six spaces, then a dash.",
  "This description belongs to postcode, so move it one level inside the postcode item: eight spaces.",
] as const;

const ROUNDS = [
  {
    id: "indent",
    label: "1 · Repair the structure",
    prompt:
      "Every nested line has fallen left. Add spaces so each property belongs to the object above it. You can rewrite the descriptions in your own words.",
    start: INDENT_START,
    answer: INDENT_ANSWER,
    help: INDENT_HELP,
    done: "The indentation now says: one model, containing one column, containing two tests.",
  },
  {
    id: "sibling",
    label: "2 · Add a sibling column",
    prompt:
      "Replace the comment with a postcode column. It belongs beside person_id, with a description nested beneath it. The description wording is yours.",
    start: SIBLING_START,
    answer: SIBLING_ANSWER,
    help: SIBLING_HELP,
    done: "postcode is a second item in the columns list, not a child of person_id.",
  },
] as const;

function clean(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
}

function leadingSpaces(line: string) {
  return line.length - line.trimStart().length;
}

function lineMatches(got: string | undefined, wanted: string | undefined) {
  if (got === undefined || wanted === undefined) return got === wanted;
  if (!wanted.trimStart().startsWith("description:")) return got === wanted;

  const expectedIndent = leadingSpaces(wanted);
  return (
    leadingSpaces(got) === expectedIndent &&
    /^description:\s+\S.*$/.test(got.trimStart())
  );
}

function firstDifference(value: string, answer: string) {
  const actual = clean(value).split("\n");
  const expected = clean(answer).split("\n");
  const max = Math.max(actual.length, expected.length);

  for (let index = 0; index < max; index += 1) {
    const got = actual[index];
    const wanted = expected[index];
    if (!lineMatches(got, wanted)) return { index, got, wanted };
  }

  return null;
}

function correctLineCount(value: string, answer: string) {
  const actual = clean(value).split("\n");
  const expected = clean(answer).split("\n");
  return expected.filter((line, index) => lineMatches(actual[index], line)).length;
}

export function YamlWorkshop() {
  const interactionDone = useInteractionDone();
  const [round, setRound] = useState(0);
  const [values, setValues] = useState<string[]>([ROUNDS[0].start, ROUNDS[1].start]);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState<boolean[]>([false, false]);
  const [helpOpen, setHelpOpen] = useState<boolean[]>([false, false]);
  const current = ROUNDS[round];
  const value = values[round];
  const difference = firstDifference(value, current.answer);
  const correct = difference === null;
  const expectedLines = clean(current.answer).split("\n");
  const linesCorrect = correctLineCount(value, current.answer);

  const update = (next: string) => {
    setValues((all) => all.map((item, index) => (index === round ? next : item)));
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (!correct) {
      setHelpOpen((all) => all.map((item, index) => (index === round ? true : item)));
      return;
    }

    const next = solved.map((item, index) => (index === round ? true : item));
    setSolved(next);
    if (next.every(Boolean)) interactionDone();
  };

  const openRound = (index: number) => {
    setRound(index);
    setChecked(solved[index]);
  };

  const applyNextMove = () => {
    if (!difference) return;

    const lines = clean(value).split("\n");
    if (difference.wanted === undefined) {
      lines.splice(difference.index, 1);
    } else {
      lines[difference.index] = difference.wanted;
    }
    update(lines.join("\n"));
  };

  const reset = () => {
    update(current.start);
    setHelpOpen((all) => all.map((item, index) => (index === round ? false : item)));
  };

  const fillAnswer = () => {
    update(current.answer);
    setHelpOpen((all) => all.map((item, index) => (index === round ? false : item)));
  };

  return (
    <section className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
      <header className="border-b-2 border-ink bg-paper-warm p-4">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame">
          YAML workshop
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {ROUNDS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              disabled={index === 1 && !solved[0]}
              aria-pressed={round === index}
              onClick={() => openRound(index)}
              className={`rounded-lg border-2 px-3 py-2 text-left font-display text-[11px] font-extrabold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-45 ${
                round === index
                  ? "border-ink bg-ink text-paper"
                  : solved[index]
                    ? "border-layer-staging bg-layer-staging/10 text-layer-staging"
                    : "border-line bg-paper text-ink-soft hover:border-flame"
              }`}
            >
              {solved[index] ? "✓ " : ""}{item.label}
            </button>
          ))}
        </div>
        <p className="!mb-0 !mt-3 text-sm">{current.prompt}</p>
      </header>

      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_210px]">
        <div className="min-w-0 bg-graphite-deep">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-[10px] text-white/40">
            <span>models/stg_people.yml</span>
            <span>spaces: 2</span>
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-4 flex gap-[15px] opacity-20"
            >
              {[0, 1, 2, 3, 4, 5].map((rail) => (
                <span key={rail} className="h-full border-l border-dashed border-white/40" />
              ))}
            </div>
            <textarea
              value={value}
              onChange={(event) => update(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Tab") {
                  event.preventDefault();
                  const target = event.currentTarget;
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  const next = `${value.slice(0, start)}  ${value.slice(end)}`;
                  update(next);
                  requestAnimationFrame(() => {
                    target.selectionStart = start + 2;
                    target.selectionEnd = start + 2;
                  });
                }
              }}
              spellCheck={false}
              aria-label={`YAML editor: ${current.label}`}
              className="relative z-10 min-h-[318px] w-full resize-y bg-transparent px-4 py-4 font-mono text-[12px] leading-7 text-[#e8eaf2] caret-flame outline-none [tab-size:2]"
            />
          </div>
        </div>

        <aside className="border-t-2 border-ink bg-paper p-4 md:border-l-2 md:border-t-0">
          <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-layer-modelling">
            Shape to express
          </p>
          <div className="mt-3 font-mono text-[11px] leading-6 text-ink-soft">
            <p className="!my-0 !text-ink">models</p>
            <p className="!my-0 pl-3">└ model: stg_people</p>
            <p className="!my-0 pl-6">├ description</p>
            <p className="!my-0 pl-6">└ columns</p>
            <p className="!my-0 pl-9">├ column: person_id</p>
            {round === 0 && (
              <>
                <p className="!my-0 pl-12">├ description</p>
                <p className="!my-0 pl-12">└ data_tests</p>
              </>
            )}
            {round === 1 && <p className="!my-0 pl-9 !text-flame-deep">└ column: postcode</p>}
          </div>
          <div className="mt-4 rounded-lg border border-line bg-paper-warm px-3 py-2 text-xs text-ink-soft">
            <strong className="text-ink">Remember:</strong>{" "}a colon names a property;
            a dash starts an item in a list; indentation says what belongs inside what.
          </div>
        </aside>
      </div>

      <div className="flex items-center gap-3 border-t-2 border-ink bg-paper-warm px-4 py-2.5">
        <div className="h-2 flex-1 overflow-hidden rounded-full border border-ink/15 bg-paper">
          <div
            className="h-full bg-layer-staging transition-[width] duration-300"
            style={{ width: `${(linesCorrect / expectedLines.length) * 100}%` }}
          />
        </div>
        <p className="!my-0 whitespace-nowrap font-mono text-[10px] text-ink-soft">
          {linesCorrect} of {expectedLines.length} lines in place
        </p>
      </div>

      {checked && (
        <div
          className={`rise border-t-2 border-ink px-4 py-3 text-sm ${
            correct ? "bg-layer-staging/10" : "bg-flame-soft"
          }`}
        >
          <strong className="text-ink">{correct ? "Valid structure. " : "Not yet. "}</strong>
          <span className="text-ink-soft">
            {correct
              ? current.done
              : `Start with line ${(difference?.index ?? 0) + 1}. YAML is easiest to repair from the top down.`}
          </span>
        </div>
      )}

      {helpOpen[round] && !correct && difference && (
        <section className="rise border-t-2 border-ink bg-paper-warm px-4 py-4" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-xl">
              <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame-deep">
                Next move · line {difference.index + 1}
              </p>
              <p className="!mb-0 !mt-1.5 text-sm text-ink-soft">
                {current.help[difference.index] ??
                  "This line does not belong in the target structure. Remove it before continuing."}
              </p>
            </div>
            {difference.wanted !== undefined && (
              <span className="rounded-full border border-ink/15 bg-paper px-2.5 py-1 font-mono text-[10px] text-ink-soft">
                {leadingSpaces(difference.wanted)} leading spaces
              </span>
            )}
          </div>

          {difference.wanted !== undefined && (
            <div className="mt-3 overflow-x-auto rounded-lg border-2 border-ink bg-graphite-deep px-3 py-2 font-mono text-xs text-[#e8eaf2]">
              <span className="mr-3 select-none text-white/35">{difference.index + 1}</span>
              <span className="whitespace-pre">{difference.wanted}</span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="!my-0 text-xs text-ink-soft">
              Try making this edit yourself, or apply just this line and study the next one.
            </p>
            <button
              type="button"
              onClick={applyNextMove}
              className="rounded-lg border-2 border-ink bg-paper px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-ink transition hover:border-flame hover:text-flame-deep"
            >
              Apply this move
            </button>
          </div>
        </section>
      )}

      {helpOpen[round] && correct && !checked && (
        <div className="rise border-t-2 border-ink bg-layer-staging/10 px-4 py-3 text-sm text-ink-soft">
          The structure now matches the target. Check the YAML to complete this round.
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-paper-warm p-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border-2 border-line px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-ink-soft transition hover:border-ink"
        >
          Reset
        </button>
        <div className="flex flex-wrap justify-end gap-2">
          {!correct && !helpOpen[round] && (
            <button
              type="button"
              onClick={() =>
                setHelpOpen((all) =>
                  all.map((item, index) => (index === round ? true : item)),
                )
              }
              className="rounded-lg border-2 border-line px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-ink-soft transition hover:border-ink hover:text-ink"
            >
              Show next move
            </button>
          )}
          <button
            type="button"
            onClick={fillAnswer}
            className="rounded-lg border-2 border-line px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-ink-soft transition hover:border-flame hover:text-flame-deep"
          >
            Show completed YAML
          </button>
          {solved[round] && round === 0 ? (
            <button
              type="button"
              onClick={() => openRound(1)}
              className="rounded-lg border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-paper transition hover:border-flame hover:bg-flame"
            >
              Next round →
            </button>
          ) : (
            <button
              type="button"
              onClick={check}
              className="rounded-lg border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-paper transition hover:border-flame hover:bg-flame"
            >
              Check YAML
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
