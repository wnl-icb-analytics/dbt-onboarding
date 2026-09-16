"use client";

import { useMemo, useState } from "react";

type Cmd = { cmd: string; desc: string; group: string };

const COMMANDS: Cmd[] = [
  { group: "Everyday dbt", cmd: "dbt build -s my_model", desc: "Run the model and its tests" },
  { group: "Everyday dbt", cmd: "dbt build -s +my_model", desc: "Build everything upstream first, then the model" },
  { group: "Everyday dbt", cmd: "dbt build -s my_model+", desc: "Build the model, then everything downstream" },
  { group: "Everyday dbt", cmd: "dbt run -s my_model", desc: "Run the model only (no tests)" },
  { group: "Everyday dbt", cmd: "dbt test -s my_model", desc: "Run the model's tests only" },
  { group: "Everyday dbt", cmd: "dbt show -s my_model", desc: "Preview the first 5 rows" },
  { group: "Everyday dbt", cmd: "dbt show -s my_model --limit 20", desc: "Preview more rows" },
  { group: "Everyday dbt", cmd: "dbt compile", desc: "Compile the whole project — seconds on Fusion; catches broken refs and Jinja errors everywhere" },
  { group: "Everyday dbt", cmd: "dbt seed", desc: "Load CSV files from seeds/ into Snowflake as tables" },
  { group: "Everyday dbt", cmd: "dbt snapshot", desc: "Run snapshots explicitly (dbt build runs them only when selected)" },
  { group: "Setup & health", cmd: "dbt deps", desc: "Install package dependencies (after every pull that changes packages.yml)" },
  { group: "Setup & health", cmd: "dbt debug", desc: "Check connection and configuration" },
  { group: "Setup & health", cmd: ".\\start_dbt.ps1", desc: "Project setup script — Fusion install, hooks, env" },
  { group: "Project helpers", cmd: ".\\build_changed.ps1", desc: "Build only models changed on your branch" },
  { group: "Project helpers", cmd: ".\\build_changed.ps1 -d", desc: "…including downstream models" },
  { group: "Project helpers", cmd: "python scripts/sources/run_all_source_generation.py", desc: "Regenerate source YAML + raw models" },
  { group: "Project helpers", cmd: `dbt run-operation generate_model_yaml --args '{"model_names": ["my_model"], "upstream_descriptions": true}'`, desc: "Scaffold YAML for a built model" },
  { group: "Docs", cmd: "dbt docs generate", desc: "Build the documentation site" },
  { group: "Docs", cmd: "dbt docs serve", desc: "Open the docs site locally (lineage, search)" },
  { group: "Git", cmd: "git switch -c feat/my-change", desc: "Create and switch to a new branch" },
  { group: "Git", cmd: "git status", desc: "What changed? Run before every commit" },
  { group: "Git", cmd: "git add path/to/file", desc: "Stage a file for commit" },
  { group: "Git", cmd: 'git commit -m "feat: description"', desc: "Commit staged files (conventional format)" },
  { group: "Git", cmd: "git push", desc: "Push your branch to GitHub" },
  { group: "Git", cmd: "git switch main && git pull", desc: "Back to main and update after a merge" },
  { group: "Git", cmd: "gh pr create --fill", desc: "Open a pull request from the terminal" },
];

function CopyCmd({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(cmd).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        });
      }}
      className="shrink-0 rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-ink-faint transition hover:border-flame hover:text-flame"
    >
      {copied ? "✓" : "copy"}
    </button>
  );
}

export function CommandReference() {
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const filtered = COMMANDS.filter(
      (c) =>
        c.cmd.toLowerCase().includes(q.toLowerCase()) ||
        c.desc.toLowerCase().includes(q.toLowerCase()),
    );
    const out = new Map<string, Cmd[]>();
    for (const c of filtered) {
      out.set(c.group, [...(out.get(c.group) ?? []), c]);
    }
    return out;
  }, [q]);

  return (
    <section>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter commands… try “grain”, “branch”, “yaml”"
        className="w-full max-w-[76ch] rounded-xl border-2 border-ink bg-paper px-4 py-2.5 font-mono text-sm outline-none transition placeholder:text-ink-faint focus:border-flame"
      />
      {groups.size === 0 && (
        <p className="mt-4 text-sm text-ink-faint">No commands match that filter.</p>
      )}
      {[...groups.entries()].map(([group, cmds]) => (
        <div key={group} className="mt-6 max-w-[76ch]">
          <h3 className="!mt-0 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-ink-faint">
            {group}
          </h3>
          <ul className="mt-2 flex list-none flex-col gap-1.5 !pl-0">
            {cmds.map((c) => (
              <li
                key={c.cmd}
                className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-2.5 !pl-4"
              >
                <div className="min-w-0 flex-1">
                  <code className="block !whitespace-pre-wrap break-all font-mono text-[13px] leading-relaxed text-ink">
                    {c.cmd}
                  </code>
                  <span className="text-xs text-ink-faint">{c.desc}</span>
                </div>
                <CopyCmd cmd={c.cmd} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
