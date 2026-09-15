"use client";

import { useRef, useState } from "react";

/** where each file (or commit) sits after a command runs */
export type GitZones = {
  working: string[];
  staged: string[];
  branch: string[];
  origin: string[];
};

type Stage = {
  cmd: string;
  /** what the terminal prints back */
  out: string;
  /** shown above the prompt while this stage is active */
  prompt?: string;
  /** zone snapshot after this command; falls back to the previous stage's */
  state?: GitZones;
};

const ZONES: { key: keyof GitZones; label: string; via?: string }[] = [
  { key: "working", label: "working tree" },
  { key: "staged", label: "staged", via: "add" },
  { key: "branch", label: "your branch", via: "commit" },
  { key: "origin", label: "GitHub", via: "push" },
];

/** Normalise a typed command for comparison: collapse whitespace, trim. */
function norm(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * A simulated terminal: the learner types each command themselves and sees
 * realistic output. "Do it for me" fills the command for anyone who'd rather
 * not type.
 */
export function TryIt({
  stages,
  done = "That's the real output — exactly what you'll see on your machine.",
  initialState,
}: {
  stages: Stage[];
  done?: string;
  /** when set, a four-zone map below the terminal shows where files are */
  initialState?: GitZones;
}) {
  const [history, setHistory] = useState<{ cmd: string; out: string }[]>([]);
  const [input, setInput] = useState("");
  const [nudge, setNudge] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stage = stages[history.length];
  const finished = !stage;

  // zone snapshot after the first n commands (last defined state wins)
  const zonesAt = (n: number): GitZones | null => {
    if (!initialState) return null;
    let zones = initialState;
    for (let i = 0; i < n; i++) {
      const s = stages[i]?.state;
      if (s) zones = s;
    }
    return zones;
  };
  const zones = zonesAt(history.length);
  const prevZones = zonesAt(Math.max(0, history.length - 1));

  const run = (typed: string) => {
    if (!stage) return;
    if (norm(typed) === norm(stage.cmd)) {
      setHistory((h) => [...h, { cmd: stage.cmd, out: stage.out }]);
      setInput("");
      setNudge(false);
    } else {
      setNudge(true);
    }
  };

  const reset = () => {
    setHistory([]);
    setInput("");
    setNudge(false);
    inputRef.current?.focus();
  };

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-white/10 bg-graphite-deep shadow-[0_8px_30px_-12px_rgb(0_0_0/0.45)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
        <span className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-flame/80" />
        </span>
        <span className="ml-1 font-mono text-xs text-white/50">
          try it — type the command
        </span>
        <span className="ml-auto flex items-center gap-2">
          {finished && (
            <span className="font-mono text-[11px] text-[#7ee2c0]">✓ done</span>
          )}
          {history.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-white/15 px-2 py-0.5 font-mono text-[11px] text-white/60 transition hover:border-flame hover:text-flame"
            >
              ↺ reset
            </button>
          )}
        </span>
      </div>

      <div
        className="cursor-text px-4 py-3.5 font-mono text-[13px] leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((h, i) => (
          <div key={i}>
            <p className="!my-0 text-[#e8eaf2]">
              <span className="text-[#7ee2c0]">$ </span>
              {h.cmd}
            </p>
            <pre className="!my-0 whitespace-pre-wrap text-white/70">{h.out}</pre>
          </div>
        ))}

        {!finished && (
          <>
            {stage.prompt && (
              <p className="!mb-1 !mt-2 text-[11px] text-white/40">{stage.prompt}</p>
            )}
            <div className="flex items-center">
              <span className="text-[#7ee2c0]">$ </span>
              <div className="relative ml-1 min-w-0 flex-1">
                {/* ghost suggestion: stays visible underneath as you type over it */}
                {stage.cmd.startsWith(input) && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 select-none whitespace-pre font-mono text-[13px] text-white/30"
                  >
                    {stage.cmd}
                  </span>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setNudge(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") run(input);
                    if (
                      (e.key === "Tab" || e.key === "ArrowRight") &&
                      input.length < stage.cmd.length &&
                      stage.cmd.startsWith(input)
                    ) {
                      e.preventDefault();
                      setInput(stage.cmd);
                    }
                  }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  aria-label={`type the command ${stage.cmd}`}
                  className="relative w-full border-none bg-transparent font-mono text-[13px] text-[#e8eaf2] caret-flame outline-none"
                />
              </div>
            </div>
            <p className="!mb-0 !mt-1 text-[11px] text-white/30">
              {nudge ? (
                <span className="text-[#ff9a82]">
                  not quite — the command is shown in grey; Tab completes it
                </span>
              ) : (
                <>press <span className="text-white/50">Tab</span> to autocomplete · Enter to run</>
              )}
            </p>
          </>
        )}

        {finished && (
          <p className="!mb-0 !mt-2 text-[11px] text-[#7ee2c0]">{done}</p>
        )}
      </div>

      {zones && (
        <div className="border-t border-white/10 px-3 pb-3 pt-2.5">
          <p className="!my-0 mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            where your work is
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {ZONES.map(({ key, label, via }) => {
              const moved = (chip: string) =>
                history.length > 0 && !!prevZones && !prevZones[key].includes(chip);
              return (
                <div
                  key={key}
                  className="min-w-0 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5"
                >
                  <p className="!my-0 truncate font-mono text-[9.5px] uppercase tracking-wider text-white/45">
                    {label}
                    {via && <span className="ml-1 normal-case text-white/25">← {via}</span>}
                  </p>
                  <div className="mt-1.5 flex min-h-6 flex-col gap-1">
                    {zones[key].length === 0 && (
                      <span className="font-mono text-[10px] text-white/20">—</span>
                    )}
                    {zones[key].map((chip) => (
                      <span
                        key={`${history.length}-${chip}`}
                        title={chip}
                        className={`truncate rounded border px-1.5 py-0.5 font-mono text-[10.5px] ${
                          moved(chip)
                            ? "rise border-flame/70 bg-flame/15 text-[#ffd9cd]"
                            : "border-white/15 text-white/65"
                        }`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!finished && (
        <div className="border-t border-white/10 px-4 py-2 text-right">
          <button
            type="button"
            onClick={() => {
              setInput(stage.cmd);
              inputRef.current?.focus();
            }}
            className="rounded-md border border-white/15 px-2 py-0.5 font-mono text-[11px] text-white/60 transition hover:border-flame hover:text-flame"
          >
            type it for me
          </button>
        </div>
      )}
    </div>
  );
}
