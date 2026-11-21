"use client";

import { Fragment } from "react";
import { CopyButton, highlight } from "@/components/CodeBlock";

/** Index into PLACES, in GitPlacesDiagram's order. */
type Place = 0 | 1 | 2 | 3;

const PLACES = ["working folder", "staging area", "local history", "GitHub"];
const GITHUB: Place = 3;

type Row =
  | { cmd: string; meaning: string; place?: Place; from?: Place }
  | { action: string; meaning: string };

type Stage = {
  title: string;
  /** stage happens on GitHub: drawn like GitPlacesDiagram's GitHub box */
  github?: boolean;
  repeat?: string;
  note?: string;
  /** comment lines for the copied text */
  comment: string[];
  rows: Row[];
};

function stages(variant: "chapter" | "course"): Stage[] {
  const course = variant === "course";
  const branch = course ? "feat/my-change" : "fix/age-band-boundary";
  return [
    {
      title: "Start a task",
      comment: ["start the task"],
      rows: [
        { cmd: "git switch main", meaning: "go to the main branch" },
        { cmd: "git pull", meaning: "bring in what the team has merged", place: 2, from: GITHUB },
        { cmd: `git switch -c ${branch}`, meaning: "create your branch and move onto it" },
      ],
    },
    {
      title: "Work in steps",
      repeat: "repeat for each step",
      comment: ["while you work, after each step you'd want to explain"],
      rows: [
        { cmd: "git status", meaning: "see what you've changed" },
        {
          cmd: course ? "git add path/to/model.sql" : "git add path/to/model.sql path/to/model.yml",
          meaning: "choose the files for this step",
          place: 1,
          from: 0,
        },
        ...(course
          ? [{ cmd: "git diff --staged", meaning: "read what will be committed" }]
          : []),
        {
          cmd: course ? 'git commit -m "feat: ..."' : 'git commit -m "fix: include the lower age boundary"',
          meaning: "save a snapshot on your machine",
          place: 2,
          from: 1,
        },
        { cmd: `git push -u origin ${branch}`, meaning: "the first time, put your branch on GitHub", place: 3, from: 2 },
        { cmd: "git push", meaning: "send new commits to GitHub, at least daily", place: 3, from: 2 },
      ],
    },
    {
      title: "Open a pull request",
      github: true,
      comment: ["on GitHub, open a draft PR, then mark it ready for review"],
      rows: [
        { action: "Open a draft PR", meaning: "share your direction and start the checks" },
        { action: "Mark ready for review", meaning: "ask a colleague to review it" },
      ],
    },
    {
      title: "Review",
      github: true,
      repeat: "repeat until approved",
      note: "Never force-push a branch under review.",
      comment: course
        ? ["during review, answer feedback with new commits"]
        : ["during review, fix things on the same branch: add, commit, push"],
      rows: course
        ? [
            { cmd: `git switch ${branch}`, meaning: "if you're coming back to it, go to your branch" },
            { cmd: "git pull", meaning: "pick up anything added on GitHub", place: 2, from: GITHUB },
            { cmd: "git add path/to/model.sql", meaning: "choose the fixed files", place: 1, from: 0 },
            { cmd: 'git commit -m "fix: ..."', meaning: "answer feedback with a new commit", place: 2, from: 1 },
            { cmd: "git push", meaning: "the PR updates and checks run again", place: 3, from: 2 },
          ]
        : [{ action: "Fix on the same branch", meaning: "add, commit and push, and the PR updates" }],
    },
    {
      title: "After merge",
      comment: ["after merge"],
      rows: [
        { cmd: "git switch main", meaning: "go back to the main branch" },
        { cmd: "git pull", meaning: "bring in your merged change", place: 2, from: GITHUB },
        { cmd: `git branch -d ${branch}`, meaning: "delete your finished local branch" },
      ],
    },
  ];
}

function copyText(list: Stage[]) {
  return list
    .map((s) =>
      [...s.comment.map((c) => `# ${c}`), ...s.rows.flatMap((r) => ("cmd" in r ? [r.cmd] : []))].join("\n"),
    )
    .join("\n\n");
}

/** Four dots for GitPlacesDiagram's four places; the lit one is where the work is now. */
function Track({ place, from }: { place: Place; from?: Place }) {
  const lo = Math.min(place, from ?? place);
  const hi = Math.max(place, from ?? place);
  const text = from === undefined ? PLACES[place] : `${PLACES[place]}, from ${PLACES[from]}`;
  return (
    <span className="flex items-center" title={`now in: ${text}`}>
      <span className="sr-only">Now in: {text}.</span>
      {PLACES.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && (
            <span
              aria-hidden
              className={`h-0.5 w-1.5 ${i > lo && i <= hi ? "bg-flame/70" : "bg-ink-faint/25"}`}
            />
          )}
          <span
            aria-hidden
            className={`rounded-full ${
              i === place
                ? `size-2.5 ${i === GITHUB ? "bg-ink" : "bg-flame"}`
                : i === from
                  ? `size-2 border-[1.5px] ${i === GITHUB ? "border-ink" : "border-flame"}`
                  : "size-2 bg-ink-faint/35"
            }`}
          />
        </Fragment>
      ))}
    </span>
  );
}

function Legend() {
  return (
    <div className="min-w-0 flex-1 font-mono text-[11px] leading-relaxed text-ink-soft">
      dots show where a command moves your work, from{" "}
      <span aria-hidden className="inline-block size-2 rounded-full border-[1.5px] border-flame align-middle" />{" "}
      to{" "}
      <span aria-hidden className="inline-block size-2.5 rounded-full bg-flame align-middle" />
      . left to right: {PLACES.join(" · ")}
    </div>
  );
}

function StageRow({ row }: { row: Row }) {
  return (
    <div
      role="listitem"
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 @xl:grid-cols-[20.5rem_minmax(0,1fr)_auto]"
    >
      {"cmd" in row ? (
        <span className="col-span-2 justify-self-start rounded-md border border-white/10 bg-graphite-deep px-2 py-1 font-mono text-[12px] leading-snug text-[#e8eaf2] [overflow-wrap:anywhere] @xl:col-span-1">
          {highlight(row.cmd, "bash")}
        </span>
      ) : (
        <span className="col-span-2 flex items-center gap-2 justify-self-start rounded-md border border-ink/25 bg-paper px-2 py-1 text-[13px] font-semibold leading-snug text-ink @xl:col-span-1">
          <span className="rounded-full border border-ink/30 px-1.5 font-mono text-[10px] font-normal text-ink-soft">
            on GitHub
          </span>
          {row.action}
        </span>
      )}
      <span className="text-[13px] leading-snug text-ink-soft">{row.meaning}</span>
      {"cmd" in row && row.place !== undefined ? <Track place={row.place} from={row.from} /> : <span aria-hidden />}
    </div>
  );
}

/**
 * The five-stage loop from a fresh main back to main, with each command's
 * meaning and where it leaves the work. The course variant adds
 * `git diff --staged` and the review-stage commands.
 */
export function WorkingLoop({ variant = "chapter" }: { variant?: "chapter" | "course" }) {
  const list = stages(variant);

  return (
    <figure className="my-5 overflow-hidden rounded-2xl border border-line bg-paper-warm/50">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-2.5">
        <Legend />
        <CopyButton
          text={copyText(list)}
          label="copy commands"
          className="shrink-0 rounded-md border border-line bg-paper px-2 py-0.5 font-mono text-[11px] text-ink-soft transition hover:border-flame hover:text-flame-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame"
        />
      </div>

      <div className="relative px-4 pb-4 pt-5">
        {/* loop back: from the end of stage 5 round to stage 1 */}
        <span
          aria-hidden
          className="absolute bottom-[calc(1rem+13px)] left-[calc(1rem+1px)] top-[calc(1.25rem+13px)] w-2.5 rounded-l-xl border-y-2 border-l-2 border-dashed border-flame/70"
        />
        <svg
          aria-hidden
          viewBox="0 0 8 10"
          className="absolute left-[calc(1rem+8px)] top-[calc(1.25rem+9px)] h-2.5 w-2"
        >
          <path d="M0 0 L8 5 L0 10 z" fill="var(--flame)" />
        </svg>

        <div role="list" aria-label="The working loop, five stages" className="pl-4">
          {list.map((s, i) => (
            <div
              key={s.title}
              role="listitem"
              className="relative flex gap-2.5 pb-6 before:absolute before:bottom-0 before:left-[13px] before:top-7 before:w-0.5 before:bg-flame/35"
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full border-2 font-display text-[13px] font-extrabold ${
                  s.github ? "border-ink bg-paper text-ink" : "border-flame bg-flame-soft text-flame-deep"
                }`}
              >
                {i + 1}
              </span>
              <div className="@container min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="font-display text-[15px] font-bold text-ink">
                    <span className="sr-only">Stage {i + 1}: </span>
                    {s.title}
                  </span>
                  {s.repeat && (
                    <span className="font-mono text-[11px] text-ink-soft">
                      <span aria-hidden>↻ </span>
                      {s.repeat}
                    </span>
                  )}
                </div>
                <div role="list" className="mt-2.5 flex flex-col gap-2.5">
                  {s.rows.map((r) => (
                    <StageRow key={"cmd" in r ? r.cmd : r.action} row={r} />
                  ))}
                </div>
                {s.note && <div className="mt-2.5 text-[13px] font-semibold text-ink">{s.note}</div>}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-dashed border-flame/70 text-[14px] text-flame-deep"
            >
              ↺
            </span>
            <span className="text-[13.5px] font-semibold text-ink">Back to 1 for the next task</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
