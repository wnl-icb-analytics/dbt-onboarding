"use client";

import { useEffect, useRef, useState } from "react";

type Command = "run" | "test" | "build";
type Status = "waiting" | "running" | "passed" | "failed" | "skipped" | "unchanged";
type NodeId = "raw" | "stg" | "dim";

const NODES: { id: NodeId; label: string; layer: string }[] = [
  { id: "raw", label: "raw_people", layer: "raw" },
  { id: "stg", label: "stg_people", layer: "staging" },
  { id: "dim", label: "dim_people", layer: "modelling" },
];

const EXPLANATIONS: Record<Command, string> = {
  run: "All three models are created. Their data tests are not run.",
  test: "The existing relations are left alone. Their tests run, and one fails.",
  build: "stg_people is built first, then its test fails. dbt leaves that updated model in place but skips dim_people, so the existing downstream table becomes stale rather than being rebuilt from failed data.",
};

const EMPTY_MODELS: Record<NodeId, Status> = { raw: "waiting", stg: "waiting", dim: "waiting" };
const EMPTY_TESTS: Record<NodeId, Status> = { raw: "waiting", stg: "waiting", dim: "waiting" };

function statusLabel(status: Status) {
  if (status === "running") return "running";
  if (status === "passed") return "passed";
  if (status === "failed") return "failed";
  if (status === "skipped") return "skipped";
  if (status === "unchanged") return "not run";
  return "waiting";
}

function modelStatusLabel(status: Status) {
  if (status === "passed") return "built";
  return statusLabel(status);
}

function statusClass(status: Status) {
  if (status === "running") return "border-flame bg-flame-soft text-ink animate-pulse";
  if (status === "passed") return "border-layer-staging bg-layer-staging/10 text-ink";
  if (status === "failed") return "border-flame bg-flame-soft text-flame-deep";
  if (status === "skipped") return "border-line bg-paper-warm text-ink-faint opacity-55";
  if (status === "unchanged") return "border-line bg-paper text-ink-faint";
  return "border-dashed border-line bg-paper text-ink-faint";
}

export function CommandDAG() {
  const [command, setCommand] = useState<Command>("run");
  const [models, setModels] = useState<Record<NodeId, Status>>(EMPTY_MODELS);
  const [tests, setTests] = useState<Record<NodeId, Status>>({
    raw: "unchanged",
    stg: "unchanged",
    dim: "unchanged",
  });
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const reset = (nextCommand = command) => {
    clearTimers();
    setCommand(nextCommand);
    setModels(
      nextCommand === "test"
        ? { raw: "unchanged", stg: "unchanged", dim: "unchanged" }
        : EMPTY_MODELS,
    );
    setTests(
      nextCommand === "run"
        ? { raw: "unchanged", stg: "unchanged", dim: "unchanged" }
        : EMPTY_TESTS,
    );
    setRunning(false);
    setFinished(false);
  };

  useEffect(() => () => clearTimers(), []);

  const later = (delay: number, action: () => void) => {
    timers.current.push(setTimeout(action, delay));
  };

  const play = () => {
    reset(command);
    setRunning(true);

    if (command === "run") {
      NODES.forEach((node, index) => {
        later(index * 500 + 80, () => setModels((value) => ({ ...value, [node.id]: "running" })));
        later(index * 500 + 420, () => setModels((value) => ({ ...value, [node.id]: "passed" })));
      });
      later(1520, () => {
        setRunning(false);
        setFinished(true);
      });
      return;
    }

    if (command === "test") {
      NODES.forEach((node, index) => {
        later(index * 430 + 80, () => setTests((value) => ({ ...value, [node.id]: "running" })));
        later(index * 430 + 360, () =>
          setTests((value) => ({ ...value, [node.id]: node.id === "stg" ? "failed" : "passed" })),
        );
      });
      later(1320, () => {
        setRunning(false);
        setFinished(true);
      });
      return;
    }

    later(80, () => setModels((value) => ({ ...value, raw: "running" })));
    later(330, () => setModels((value) => ({ ...value, raw: "passed" })));
    later(410, () => setTests((value) => ({ ...value, raw: "running" })));
    later(650, () => setTests((value) => ({ ...value, raw: "passed" })));
    later(730, () => setModels((value) => ({ ...value, stg: "running" })));
    later(980, () => setModels((value) => ({ ...value, stg: "passed" })));
    later(1060, () => setTests((value) => ({ ...value, stg: "running" })));
    later(1320, () => setTests((value) => ({ ...value, stg: "failed" })));
    later(1400, () => {
      setModels((value) => ({ ...value, dim: "skipped" }));
      setTests((value) => ({ ...value, dim: "skipped" }));
    });
    later(1480, () => {
      setRunning(false);
      setFinished(true);
    });
  };

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
      <header className="border-b-2 border-ink bg-paper-warm p-4">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame">
          Watch the same DAG
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["run", "test", "build"] as Command[]).map((item) => (
            <button
              key={item}
              type="button"
              disabled={running}
              aria-pressed={command === item}
              onClick={() => reset(item)}
              className={`rounded-lg border-2 px-3 py-1.5 font-mono text-xs transition disabled:cursor-wait ${
                command === item
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink-soft hover:border-flame"
              }`}
            >
              dbt {item}
            </button>
          ))}
          <button
            type="button"
            disabled={running}
            onClick={play}
            className="ml-auto rounded-lg border-2 border-flame bg-flame px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-white transition hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-wait disabled:opacity-60"
          >
            {running ? "Running..." : finished ? "Replay" : "Run it"}
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-1">
          {NODES.map((node, index) => (
            <div key={node.id} className="flex flex-col items-stretch sm:min-w-0 sm:flex-1 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className={`rounded-xl border-2 p-3 text-center transition-all duration-200 ${statusClass(models[node.id])}`}>
                  <code className="block !whitespace-normal !border-0 !bg-transparent !p-0 text-[11px] font-bold">
                    {node.label}
                  </code>
                  <span className="mt-1 block font-display text-[9px] font-bold uppercase tracking-wider">
                    model · {modelStatusLabel(models[node.id])}
                  </span>
                </div>
                <div className="mx-auto h-3 w-px bg-line" />
                <div className={`rounded-lg border px-2 py-1.5 text-center text-[10px] transition-all duration-200 ${statusClass(tests[node.id])}`}>
                  <span className="font-mono">data test</span>
                  <span className="ml-1 font-display font-bold uppercase tracking-wide">· {statusLabel(tests[node.id])}</span>
                </div>
              </div>
              {index < NODES.length - 1 && (
                <span className="mx-auto my-1 h-5 border-l-2 border-line sm:mx-1.5 sm:my-0 sm:h-0 sm:w-5 sm:border-l-0 sm:border-t-2" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>

      <figcaption className="border-t-2 border-ink bg-paper-warm px-4 py-3 text-sm text-ink-soft">
        <strong className="text-ink">dbt {command}:</strong> {EXPLANATIONS[command]}
      </figcaption>
    </figure>
  );
}
