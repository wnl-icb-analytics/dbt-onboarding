import Link from "next/link";
import type { Course } from "@/lib/course-types";
import { CodeBlock } from "@/components/CodeBlock";
import { BranchDiagram } from "@/components/BranchDiagram";
import { CloneDiagram } from "@/components/CloneDiagram";
import { TryIt } from "@/components/TryIt";
import { Callout } from "@/components/Callout";

export const GIT_COURSE: Course = {
  slug: "git-essentials",
  title: "Git essentials",
  tagline: "Version control from zero — the foundation everything else stands on",
  audience: "Start here if you have never used git. No installation needed yet — this course is about the ideas and the handful of commands.",
  hours: "~1 hr",
  accent: "var(--layer-staging)",
  lessons: [
    // ------------------------------------------------------------------
    {
      slug: "what-version-control-is",
      title: "What version control is",
      blurb: "The problem with copies, and the idea that replaces them",
      minutes: 8,
      steps: [
        {
          id: "copies",
          body: (
            <>
              <p>
                You already do version control. It looks like this:
              </p>
              <CodeBlock
                lang="text"
                code={`
analysis.sql
analysis_v2.sql
analysis_v2_FINAL.sql
analysis_v2_FINAL_jw_comments.sql
`}
              />
              <p>
                Copies-as-versions work, briefly. Then you can&apos;t remember what
                changed between v2 and FINAL, two people edit different copies at
                once, and nobody is sure which file is the real one.
              </p>
            </>
          ),
        },
        {
          id: "snapshots",
          title: "Snapshots instead of copies",
          body: (
            <>
              <p>
                Git solves this with one idea: keep <strong>one</strong>{" "}set of
                files, and record <strong>snapshots</strong>{" "}of them over time. Each
                snapshot stores what every file looked like at that moment, who took
                it, when, and a one-line description of what changed.
              </p>
              <p>
                The full history is always there — you can look at any snapshot, see
                the exact difference between any two, and wind back if needed. But
                day to day you just work on the files, like normal.
              </p>
            </>
          ),
          check: {
            prompt:
              "You need last month's version of a query. With git, where is it?",
            options: [
              "In a backup folder, if someone kept one",
              "In the file's history — every snapshot is kept and viewable",
              "Gone — git only keeps the latest version",
              "In your email, attached to an old message",
            ],
            answer: 1,
            explain:
              "Every snapshot is permanently in the history. Viewing what a file looked like at any point — and exactly what changed since — is the core thing git does.",
            affirm: "every version lives in the history — no more _FINAL_v3 copies.",
          },
        },
        {
          id: "repo",
          title: "The repository",
          body: (
            <>
              <p>
                A folder managed by git is called a <strong>repository</strong>{" "}
                (“repo”). Our repo is <code>dbt-analytics</code>: every model, every
                test, every line of documentation, plus the entire history of all of
                it.
              </p>
              <p>
                The repo lives in two kinds of place at once: on{" "}
                <strong>GitHub</strong>{" "}(the shared copy everyone can see) and as a{" "}
                <strong>clone</strong>{" "}on each person&apos;s machine (your private
                working copy):
              </p>
              <CloneDiagram />
              <p>
                You work locally; sharing happens when you choose to send your
                snapshots up.
              </p>
            </>
          ),
        },
        {
          id: "why-team",
          title: "Why this matters for a team",
          body: (
            <>
              <p>
                Because everyone clones the same repo, there is exactly one shared
                codebase. Everyone can read everyone else&apos;s work; every change
                says who made it and why; and two people editing at the same time is
                a normal, managed situation rather than a disaster involving email
                attachments.
              </p>
            </>
          ),
          check: {
            prompt: "A clone is…",
            options: [
              "A read-only view of the GitHub repo",
              "Your own full working copy of the repo, history included",
              "A backup that updates automatically",
              "A copy of just the files you plan to edit",
            ],
            answer: 1,
            explain:
              "A clone is the whole repo — every file and the full history — on your machine. It does not sync by itself: you choose when to pull changes down and push yours up.",
            affirm: "a clone is the full repo on your machine — it only syncs when you choose.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "branches-and-commits",
      title: "Branches and commits",
      blurb: "Working safely beside production, one small change at a time",
      minutes: 12,
      steps: [
        {
          id: "main",
          body: (
            <>
              <p>
                Every repo has a default branch, but its name is configurable. Some
                repositories still call it <code>master</code>; many now use{" "}
                <code>main</code>. <strong>Our default branch is main</strong>, and in
                this project it is the production branch: merged changes deploy from
                main, and scheduled production runs continue from that code. So main has to stay correct at all
                times — which means you never edit it directly. It is locked; even
                administrators cannot push straight to it.
              </p>
            </>
          ),
        },
        {
          id: "branch",
          title: "A branch is a safe parallel line",
          body: (
            <>
              <p>
                To change anything, you create a <strong>branch</strong>: a new line
                of history that starts from main&apos;s current state. On your branch
                you can edit, experiment and make mistakes freely — main is untouched,
                and so is everyone else&apos;s work.
              </p>
              <p>
                Branches are cheap and disposable. One branch per piece of work, named
                for what it does: <code>feat/opening-hours-staging</code>,{" "}
                <code>fix/age-band-boundary</code>.
              </p>
            </>
          ),
          check: {
            prompt:
              "You break something badly on your branch. What happened to production?",
            options: [
              "Nothing — the branch is a separate line; main is untouched",
              "Production is broken until you fix the branch",
              "Production reverts to last night's backup",
              "It depends how big the mistake was",
            ],
            answer: 0,
            explain:
              "This is the whole point of branches: your work-in-progress, however broken, exists only on your branch. Production code only changes when a branch is deliberately merged into main.",
            affirm: "nothing on your branch can touch production — that's the point of branches.",
          },
        },
        {
          id: "commit",
          title: "A commit is a labelled snapshot",
          body: (
            <>
              <p>
                As you work on your branch, you save your progress as{" "}
                <strong>commits</strong> — those snapshots from lesson one. Each
                commit has a message saying what it does:
              </p>
              <CodeBlock
                lang="text"
                code={`
feat: add opening hours staging model
fix: correct age band boundary
docs: describe waiting list snapshot logic
`}
              />
              <p>
                Each message should finish the sentence “this commit will…” so that
                someone reading the history can understand what changed.
              </p>
            </>
          ),
        },
        {
          id: "hygiene",
          title: "Branch and commit hygiene",
          body: (
            <>
              <p>
                Two habits keep Git work easy to understand: <strong>commit small,
                commit often; branch small, branch often.</strong>
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-layer-staging bg-layer-staging/5 p-4 shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-layer-staging">
                    Commit hygiene
                  </p>
                  <p className="!mb-2 !mt-2 font-display text-lg font-extrabold !text-ink">
                    Commit small, commit often
                  </p>
                  <div className="flex items-center gap-1.5" aria-hidden>
                    <span className="h-2 flex-1 rounded-full bg-layer-staging" />
                    <span className="h-2 flex-1 rounded-full bg-layer-staging" />
                    <span className="h-2 flex-1 rounded-full bg-layer-staging/30" />
                  </div>
                  <p className="!mb-0 !mt-3 text-sm !text-ink-soft">
                    Commit small and often. Each snapshot should do one thing and have
                    a message that says what it does.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-layer-modelling bg-layer-modelling/5 p-4 shadow-[4px_4px_0_0_var(--color-layer-modelling)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-layer-modelling">
                    Branch hygiene
                  </p>
                  <p className="!mb-2 !mt-2 font-display text-lg font-extrabold !text-ink">
                    Branch small, branch often
                  </p>
                  <div className="flex items-center gap-1" aria-hidden>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <span
                        key={item}
                        className="h-2 flex-1 rounded-full bg-layer-modelling"
                      />
                    ))}
                  </div>
                  <p className="!mb-0 !mt-3 text-sm !text-ink-soft">
                    Keep one outcome on each branch. Finish and share it, then start
                    the next branch from fresh main.
                  </p>
                </div>
              </div>
              <p>
                They solve different problems. Small commits make the history easy to
                follow. Small, short-lived branches are easier to review and less
                likely to conflict with changes on <code>main</code>.
              </p>
              <Callout kind="info" title="What a merge conflict means">
                <p>
                  A merge conflict happens when your branch and <code>main</code> have
                  changed the same lines in the same file. Git cannot know which
                  version you intend to keep, so it stops and asks a person instead
                  of silently choosing one. The handbook&apos;s{" "}
                  <Link href="/practice/undoing-changes">Undoing things in git</Link>{" "}
                  page covers resolving one, and recovery in general.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt: "When does Git need a person to resolve a merge conflict?",
            options: [
              "Whenever two branches change the same file",
              "When your branch and main change the same lines in the same file",
              "Whenever a branch contains more than one commit",
              "When two people create branches on the same day",
            ],
            answer: 1,
            explain:
              "Two branches can safely change different parts of the same file. Git stops when edits overlap on the same lines and it cannot infer which version should win.",
            affirm: "same file and same lines: Git stops rather than guessing.",
          },
        },
        {
          id: "history",
          title: "Put together",
          body: (
            <>
              <p>The shape of all work in this project, every time:</p>
              <BranchDiagram />
              <p>
                You branch off main (after C), commit your work (D, E, F), and
                eventually your branch is merged back (G) — through a process with
                safety checks, which we cover shortly.
              </p>
            </>
          ),
          check: {
            prompt: "Which statement is true?",
            options: [
              "A commit is a branch you have finished with",
              "A branch is a sequence of commits, parallel to main",
              "Commits only exist on main",
              "You need a new branch for every commit",
            ],
            answer: 1,
            explain:
              "Branch = the parallel line; commits = the snapshots along it. One branch per piece of work, several commits per branch.",
            affirm: "branch = the parallel line, commits = the snapshots along it.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "public-repository-safety",
      title: "What belongs in the project",
      blurb: "How .gitignore keeps local clutter out, and why seeds are different",
      minutes: 9,
      steps: [
        {
          id: "project-boundary",
          body: (
            <>
              <p>
                A dbt project contains the <strong>instructions</strong>{" "}for turning
                warehouse data into useful datasets. You commit SQL models, YAML
                properties, tests, macros and documentation. The data itself stays in
                Snowflake; dbt sends queries to it rather than copying rows into your
                project folder.
              </p>
              <p>
                The code is public deliberately. Analytical definitions are more useful
                when other organisations can adopt or adapt them in their own projects,
                users can trace how a measure was produced, and people outside the
                immediate team can question and improve the logic. Open code also makes
                it possible to build tools that explain a result through its documented
                upstream lineage, rather than presenting a number without its reasoning.
              </p>
              <Callout kind="info" title="Open definitions, not open data">
                <p>
                  Anyone can inspect the transformation logic; access to the underlying
                  warehouse data remains controlled separately. <code>dbt-analytics</code>{" "}
                  is therefore a public codebase, not a workspace for extracts or
                  analysis outputs.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt: "When a dbt model runs, where do its result rows belong?",
            options: [
              "In a CSV beside the model",
              "In the data warehouse; the repository keeps the SQL that creates them",
              "In git history so reviewers can inspect them",
              "In the project's target folder",
            ],
            answer: 1,
            explain:
              "The project stores transformation instructions. dbt runs those instructions in Snowflake, where the resulting tables and views remain.",
            affirm: "git stores the instructions; the warehouse stores the data.",
          },
        },
        {
          id: "gitignore",
          title: ".gitignore handles the predictable clutter",
          body: (
            <>
              <p>
                The repository includes a file called <code>.gitignore</code>. It lists
                paths that Git should leave out of its normal file list. Here is a
                shortened version of the project&apos;s real rules:
              </p>
              <CodeBlock
                lang="text"
                code={`
# dbt-generated files
target/
logs/
dbt_packages/

# Local credentials and environments
.env
.env.*
.venv/

# Data-shaped files
*.csv
*.xlsx
*.parquet

# Deliberate exception
!seeds/*.csv
`}
              />
              <p>
                A trailing <code>/</code>{" "}matches a directory. <code>*</code>{" "}is a
                wildcard. A rule beginning with <code>!</code>{" "}makes an exception to
                an earlier rule. Because the file is committed, everyone who clones the
                project gets the same defaults.
              </p>
              <Callout kind="info" title="Ignored is not the same as forbidden">
                <p>
                  <code>.gitignore</code>{" "}only filters untracked files. It does not
                  inspect contents, and it does not remove a file that Git already tracks.
                  Treat it as a tidy set of guardrails, not as a security scanner.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt: "Why does `target/` not normally appear in `git status`?",
            options: [
              "dbt deletes it when each command finishes",
              "GitHub removes generated files after a push",
              "The project's `.gitignore` tells Git to ignore that generated directory",
              "Files inside directories cannot be committed",
            ],
            answer: 2,
            explain:
              "dbt writes compiled SQL and other generated artefacts to target/. The project ignores that directory because it can be recreated and does not belong in version control.",
            affirm: ".gitignore keeps reproducible local artefacts out of the file list.",
          },
        },
        {
          id: "seeds",
          title: "Seeds are the deliberate data exception",
          body: (
            <>
              <p>
                A dbt <strong>seed</strong>{" "}is a CSV that intentionally lives under
                <code>seeds/</code>. Running <code>dbt seed</code>{" "}loads it into
                Snowflake, and models can use <code>ref()</code>{" "}to depend on it.
                That is why the ignore file first ignores CSVs, then makes a narrow
                exception for seed files.
              </p>
              <p>
                Seeds should be small, static reference datasets that belong to the
                project&apos;s logic: mappings, categories, code lists or thresholds that
                change infrequently. They are reviewed and versioned like code. A query
                export, a sample of patient records or a large source dataset is not a
                seed, even if you place it in that folder.
              </p>
            </>
          ),
          check: {
            prompt: "Which CSV is a sensible dbt seed?",
            options: [
              "A daily export of appointments",
              "A sample of pseudonymised patient records",
              "A small team-owned mapping from status codes to reporting categories",
              "The output of a query used to debug a model",
            ],
            answer: 2,
            explain:
              "Seeds are for small, stable reference data that forms part of the project's logic. Extracts and record-level examples still belong outside the repository.",
            affirm: "a seed is reviewed reference data, not a convenient place for an extract.",
          },
        },
        {
          id: "final-check",
          title: "Treat the repository as a public record",
          body: (
            <>
              <p>
                Normal work in this project should leave you with a short, unsurprising
                list: SQL, YAML, macros, documentation and, occasionally, an intentional
                seed. Credentials stay in ignored environment files. Build artefacts stay
                in ignored dbt directories. Data extracts stay outside the project
                workspace altogether.
              </p>
              <div className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-graphite-deep shadow-[5px_5px_0_0_var(--color-layer-staging)]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                  <span className="font-display text-xs font-extrabold uppercase tracking-[0.14em] text-white">
                    What a push publishes
                  </span>
                  <span className="rounded-full bg-flame/20 px-2.5 py-1 font-mono text-[10px] font-bold text-[#ffb4a1]">
                    VISIBLE TO ANYONE
                  </span>
                </div>
                <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                  {[
                    ["File contents", "Every tracked file — SQL, YAML and the comments inside them."],
                    ["Filenames & folders", "The whole project structure, including work-in-progress names."],
                    ["Author", "Your name, on every commit, forever."],
                    ["Commit messages", "The one-line story of every change."],
                    ["History", "Every earlier committed version — deleting a file later does not unpublish it."],
                    ["PR discussion", "Descriptions and review threads stay public on GitHub."],
                  ].map(([label, copy]) => (
                    <div key={label} className="bg-graphite-deep p-4">
                      <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-[#7ee2c0]">
                        {label}
                      </p>
                      <p className="!mb-0 !mt-1.5 text-sm leading-6 !text-white/75">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p>
                Write all of it as a professional record that helps a future reader
                understand the work; never use any of it for data, credentials or
                private notes.
              </p>
              <p>
                Before committing, read <code>git status</code>{" "}and review the diff.
                If an unexpected file appears, stop and understand it before staging.
                If sensitive material is ever committed, tell the team immediately;
                deleting it later does not remove it from Git history, and a credential
                may need to be rotated.
              </p>
              <p>
                High-level counts, rates, distributions and validation totals are
                not person-level data when their dimensions and cell sizes cannot
                identify anyone. They are suitable evidence in a public PR.
              </p>
            </>
          ),
          check: {
            prompt: "Which statement about a pushed commit is true?",
            options: [
              "Only the latest version of each file is public",
              "The code is public, but its comments and commit message are private",
              "Its tracked files, authorship and message become part of the public history",
              "Its contents remain private until the pull request is merged",
            ],
            answer: 2,
            explain:
              "Pushing publishes the branch's committed history. That includes tracked file contents, comments inside those files, authorship and commit messages; GitHub also shows the public pull request discussion.",
            affirm: "open code creates shared understanding, so write every public part with care.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "pull-requests",
      title: "Pull requests",
      blurb: "How automated checks, AI review and a human get a branch into production",
      minutes: 15,
      steps: [
        {
          id: "what",
          body: (
            <>
              <p>
                Your branch is pushed. To get it into <code>main</code> — into
                production — you open a <strong>pull request</strong>{" "}(PR): a
                proposal, on GitHub, that says “merge this branch into main”. The PR
                shows every line you changed, side by side with what it replaces.
              </p>
              <p>
                Nothing reaches main any other way. Between proposal and merge sit
                three safety nets: automation, an AI reviewer, and a person.
              </p>
              <div className="my-6 flex flex-wrap items-center justify-center gap-2" aria-label="The pull request path to main">
                {[
                  ["1", "Describe"],
                  ["2", "Automate"],
                  ["3", "AI review"],
                  ["4", "Review"],
                  ["5", "Merge"],
                ].map(([number, label], index) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-2 shadow-[2px_2px_0_0_var(--color-ink)]">
                      <span className="font-mono text-xs font-bold text-layer-staging">{number}</span>
                      <span className="font-display text-xs font-extrabold uppercase tracking-[0.1em] text-ink">{label}</span>
                    </div>
                    {index < 4 && <span className="font-mono text-ink-faint" aria-hidden>→</span>}
                  </div>
                ))}
              </div>
            </>
          ),
        },
        {
          id: "description",
          title: "Write the proposal",
          body: (
            <>
              <p>
                A good PR description gives the reviewer a map. Keep it short, but
                make these four things easy to find.
              </p>
              <div className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-graphite-deep shadow-[6px_6px_0_0_var(--color-layer-modelling)]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                  <span className="font-display text-xs font-extrabold uppercase tracking-[0.14em] text-white">PR description</span>
                  <span className="rounded-full bg-layer-modelling/20 px-2.5 py-1 font-mono text-[10px] font-bold text-[#d5b8ff]">DRAFT</span>
                </div>
                <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                  {[
                    ["Why", "The problem or user need this change addresses."],
                    ["What", "The models changed, each model's job and how they fit together."],
                    ["Checked", "What you ran, what passed and any limits to testing."],
                    ["Review", "The decisions where you want a colleague's attention."],
                  ].map(([label, copy]) => (
                    <div key={label} className="bg-graphite-deep p-4">
                      <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-[#7ee2c0]">{label}</p>
                      <p className="!mb-0 !mt-2 text-sm leading-6 !text-white/75">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p>
                Link the issue when there is one. A reviewer should understand the
                change before opening the first file.
              </p>
            </>
          ),
        },
        {
          id: "ci",
          title: "Safety net one: automation",
          body: (
            <>
              <p>
                These checks do not all run as soon as the PR opens. Each one has its
                own trigger and runs only when that condition is met.
              </p>
              <div className="my-5 grid overflow-hidden rounded-2xl border-2 border-ink sm:grid-cols-3">
                {[
                  ["Fast gates", "Running", "bg-layer-staging"],
                  ["CodeRabbit", "Reviewing the draft", "bg-layer-modelling"],
                  ["Snowflake DEV", "Waiting for merge queue", "bg-layer-published"],
                ].map(([label, state, dotClass], index) => (
                  <div key={label} className={`flex items-center gap-2 bg-paper px-4 py-3 ${index > 0 ? "border-t-2 border-ink sm:border-l-2 sm:border-t-0" : ""}`}>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} aria-hidden />
                    <div>
                      <p className="!my-0 font-display text-xs font-extrabold !text-ink">{label}</p>
                      <p className="!my-0 font-mono text-[9px] uppercase tracking-wide !text-ink-soft">{state}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm !text-ink-soft">
                That is the state of a new draft PR: fast gates and CodeRabbit
                start early, while runtime validation waits for the merge queue.
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    trigger: "PR opens or updates",
                    title: "Fast gates",
                    result: "Fast gates run",
                    dotClass: "bg-layer-staging",
                    checks: ["Fusion compile", "Descriptions + tests", "Refs + layer rules", "Ownership suggestion"],
                  },
                  {
                    trigger: "Merge when ready selected",
                    title: "Snowflake DEV",
                    result: "Snowflake DEV runs",
                    dotClass: "bg-layer-published",
                    checks: ["Exact merge candidate", "state:modified builds", "Data tests run", "Production parents deferred"],
                  },
                ].map((stage) => (
                  <div key={stage.title} className="relative overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[4px_4px_0_0_var(--color-ink)]">
                    <div className="border-b-2 border-ink bg-mist p-4">
                      <p className="!my-0 font-display text-[9px] font-extrabold uppercase tracking-[0.16em] !text-ink-soft">When</p>
                      <p className="!mb-0 !mt-1 text-sm font-bold !text-ink">{stage.trigger}</p>
                    </div>
                    <div className="p-4">
                      <p className="!my-0 font-display text-[9px] font-extrabold uppercase tracking-[0.16em] !text-ink-soft">Then</p>
                      <p className="!mb-0 !mt-1 font-display text-lg font-extrabold !text-ink">{stage.result}</p>
                      <ul className="!mb-0 !mt-3 space-y-2 !pl-0">
                        {stage.checks.map((check) => (
                          <li key={check} className="flex items-start gap-2 text-sm !text-ink-soft">
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${stage.dotClass}`} aria-hidden />
                            <span>{check}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <Callout kind="info" title="Red means: look, fix, push">
                <p>
                  Open the failed check, read the error, fix it and push to the same
                  branch. The relevant checks run again. Required checks must pass
                  before merge.
                </p>
              </Callout>
              <p>
                Both gates are objective: they pass or they fail. The third tile on
                the board — CodeRabbit — is different. It does not pass or fail; it
                reviews. That is the next step.
              </p>
            </>
          ),
          check: {
            prompt: "A CI check on your PR goes red. The right response is…",
            options: [
              "Fix the issue locally, commit, and `git push` to the same branch — checks re-run",
              "Open a new PR so the checks start fresh",
              "Ask someone to merge it anyway — checks are advisory",
              "Delete the branch and start again",
            ],
            answer: 0,
            explain:
              "A red check is information: open its details, read the error, fix it, commit and push. The relevant checks run again on the same PR. Failing a check is a normal part of the loop, not a verdict.",
            affirm: "fix locally and push to the same branch — the checks run again.",
          },
        },
        {
          id: "ai-review",
          title: "Safety net two: AI review (CodeRabbit)",
          body: (
            <>
              <p>
                When the PR opens, <strong>CodeRabbit</strong> reviews it, including
                while it is a draft. It
                is an <strong>AI code reviewer</strong>: it reads the diff and leaves
                comments the way a colleague would — but on every changed line, every
                time, without getting tired. It is not a pass/fail gate like CI; its
                comments are suggestions you weigh, reply to, or fix.
              </p>
              <p>
                And it is not generic advice. CodeRabbit reads{" "}
                <code>.coderabbit.yaml</code>{" "}in the repo, where each layer&apos;s
                contract and our naming rules are written down — so it reviews against{" "}
                <em>our</em> conventions, and its comments cite them. On a recent PR it
                caught a staging model selecting straight from{" "}
                <code>source(&apos;sdl_wnl&apos;, &apos;REF&apos;)</code>{" "}and pointed
                out that this skips the raw layer — the fix being to reference the raw
                model, <code>ref(&apos;raw_sdl_wnl_ref&apos;)</code>, so everything
                downstream reads one stable name. Because that rule lives in the config,
                it is applied on every PR, not only when a reviewer happens to notice.
              </p>
              <p>
                That is the shape of what it is good at, and where it stops. It is
                tireless on anything checkable from the code and the rules — and silent
                on anything that needs to know what the model is <em>for</em>.
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-modelling)]">
                  <p className="!my-0 font-display text-base font-extrabold !text-ink">Good at: rules and patterns</p>
                  <p className="!mb-3 !mt-1 text-sm leading-5 !text-ink-soft">Things checkable from the code, applied the same way every time.</p>
                  <ul className="!mb-0 !mt-0 space-y-2 !pl-0">
                    {[
                      "Layer rules — a staging model reading straight from source() instead of the raw model",
                      "Fan-out joins that silently multiply rows",
                      "Missing tests, or YAML that documents fewer columns than the SQL emits",
                      "Edge cases — try_to_number() on a value that was never validated",
                      "Naming — is_/has_ booleans, _date / _at / _id suffixes",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm leading-5 !text-ink-soft">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-layer-modelling" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                  <p className="!my-0 font-display text-base font-extrabold !text-ink">Can&apos;t judge: meaning and fit</p>
                  <p className="!mb-3 !mt-1 text-sm leading-5 !text-ink-soft">Things that need context only a person who knows the intent has.</p>
                  <ul className="!mb-0 !mt-0 space-y-2 !pl-0">
                    {[
                      "Whether this is the intended clinical population",
                      "Whether the model belongs in this layer, or should reuse one that exists",
                      "Whether the next person will follow the logic",
                      "Whether a flagged “issue” is actually fine here",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm leading-5 !text-ink-soft">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-layer-staging" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Callout kind="info" title="Comments, not commands">
                <p>
                  CodeRabbit can be over-eager — some comments are nitpicks, and it is
                  sometimes wrong. Resolve the ones that do not apply, fix the ones that
                  do and push to the same branch. It is evidence for the human reviewer,
                  not the final word.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt:
              "CodeRabbit flags that a staging model reads from source() instead of the raw model. Why is this the kind of thing it catches well?",
            options: [
              "It is a convention written in .coderabbit.yaml — a rule that can be checked on every line, the same way every time",
              "It understands whether the staging model identifies the intended clinical population",
              "It decides whether the model belongs in the project's architecture",
              "It removes the need for a human to review the PR at all",
            ],
            answer: 0,
            explain:
              "CodeRabbit is strongest on rules and patterns knowable from the code and our config — layer contracts, naming, missing tests, fan-out joins. Judgement about clinical meaning, architectural fit and maintainability stays with a human.",
            affirm: "CodeRabbit is strongest on rule- and pattern-based checks.",
          },
        },
        {
          id: "review",
          title: "Safety net three: human review",
          body: (
            <>
              <p>
                Automation says whether the code <em>works</em>; CodeRabbit reviews{" "}
                <em>how</em> it is built. A human decides whether it{" "}
                <em>should exist this way</em> — the judgement neither of the others
                can make.
              </p>
              <p>
                Start with the PR description, then read the changed models and their
                lineage. A good review asks questions in three places.
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-3">
                {[
                  [
                    "Architecture",
                    "Does this belong in this layer?",
                    "Could it reuse an existing model?",
                    "Are its dependencies clear?",
                  ],
                  [
                    "Clinical",
                    "Does this identify the intended population?",
                    "Are code lists and exclusions sound?",
                    "Do dates and edge cases make sense?",
                  ],
                  [
                    "Maintenance",
                    "Can the next person follow the logic?",
                    "Are assumptions visible?",
                    "Where would a future definition change?",
                  ],
                ].map(([title, ...questions], index) => (
                  <div key={title} className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink font-mono text-xs font-black text-paper">{index + 1}</div>
                    <p className="!my-0 font-display text-base font-extrabold !text-ink">{title}</p>
                    <ul className="!mb-0 !mt-3 space-y-2 !pl-0">
                      {questions.map((question) => (
                        <li key={question} className="flex items-start gap-2 text-sm leading-5 !text-ink-soft">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-layer-staging" aria-hidden />
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-graphite-deep shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
                <div className="border-b border-white/10 px-5 py-3">
                  <p className="!my-0 font-display text-xs font-extrabold uppercase tracking-[0.14em] !text-white">A useful review comment</p>
                </div>
                <div className="grid gap-px bg-white/10 sm:grid-cols-[0.8fr_1.2fr_1fr]">
                  {[
                    ["Observation", "This model is doing three jobs: cleaning source data, deciding who is eligible and shaping the final output."],
                    ["Why it matters", "Eligibility is reusable business logic. If it stays here, other outputs may repeat it and future changes become harder to make safely."],
                    ["Suggestion", "Could eligibility become an intermediate model that this output, and any future outputs, can reference?"],
                  ].map(([label, copy]) => (
                    <div key={label} className="bg-graphite-deep p-4">
                      <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-[#7ee2c0]">{label}</p>
                      <p className="!mb-0 !mt-2 text-sm leading-6 !text-white/75">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p>
                A review can approve the approach, ask a question or suggest a change.
                It is not a hunt for mistakes. Reply to comments and push fixes to the
                same branch; the PR updates automatically.
              </p>
            </>
          ),
          check: {
            prompt: "What should a human reviewer spend most attention on?",
            options: [
              "Whether the SQL follows every naming and formatting convention",
              "Whether the project compiles and each changed model has a test",
              "Whether the architecture, clinical meaning and maintenance approach make sense in context",
              "Whether the reviewer would have written the solution in the same way",
            ],
            answer: 2,
            explain:
              "CI and CodeRabbit provide evidence about compilation, tests and common implementation risks. Human reviewers add context: whether the model belongs in the architecture, represents the clinical definition correctly and will remain understandable when it changes.",
            affirm: "human review adds architectural, clinical and maintenance judgement.",
          },
        },
        {
          id: "merge",
          title: "Merge — and the loop closes",
          body: (
            <>
              <p>
                Approved and green, the PR merges: your commits land on main as one
                tidy squashed commit, the branch is deleted, and the deployment
                machinery takes over — your models build into production
                automatically. Back on your machine:
              </p>
              <CodeBlock
                lang="bash"
                code={`
git switch main
git pull          # bring main up to date, now including your work
`}
              />
              <p>
                <code>git pull</code>{" "}is the counterpart of push — it downloads what
                changed on GitHub. Do this whenever you start something new, so your
                next branch starts from the latest main.
              </p>
            </>
          ),
          check: {
            prompt: "What is the only route by which code reaches `main`?",
            options: [
              "`git push`, once the branch is tested",
              "A reviewed, CI-green pull request being merged",
              "An administrator copying changes across",
              "The nightly build promotes approved branches",
            ],
            answer: 1,
            explain:
              "Main is protected: direct pushes are rejected for everyone. Review + green checks + merge is the single road, which is exactly why main can be trusted as production.",
            affirm: "a reviewed, green pull request is the only road into main.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "the-daily-commands",
      title: "The daily commands",
      blurb: "Six commands, introduced one at a time",
      minutes: 16,
      steps: [
        {
          id: "intro",
          body: (
            <>
              <p>
                Git has hundreds of commands. Daily work here uses{" "}
                <strong>six</strong>. This lesson introduces them one at a time —
                and you will <em>run</em>{" "}each one in a simulated terminal, so you
                see exactly what your real machine will say back. Nothing to
                install; type the command (or use “type it for me”) and press Enter.
              </p>
              <p>
                From the third command on, a map appears under the terminal
                showing <strong>where your work is</strong> — on disk, staged,
                committed, or shared on GitHub. Watching files move across it is
                the fastest way to understand what each command actually does.
              </p>
            </>
          ),
        },
        {
          id: "pull",
          title: "1 · git pull — start from fresh main",
          body: (
            <>
              <p>
                Before starting new work, return to <code>main</code>{" "}and update it
                from GitHub. Your new branch will begin from exactly that fresh
                version of the project:
              </p>
              <TryIt
                stages={[
                  {
                    cmd: "git switch main",
                    out: `Switched to branch 'main'
Your branch is up to date with 'origin/main'.`,
                    prompt: "first, return to the project's default branch",
                  },
                  {
                    cmd: "git pull",
                    out: `Updating a17c9b2..e43d0af
Fast-forward
 models/staging/shared/stg_specialties.sql | 8 +++++---
 1 file changed, 5 insertions(+), 3 deletions(-)`,
                    prompt: "download and apply anything merged since your last update",
                  },
                ]}
                done="Your local main now matches origin/main, so the next branch starts from the team's latest work."
              />
              <p>
                <code>origin/main</code>{" "}means the copy of <code>main</code>{" "}on
                GitHub. <code>git pull</code>{" "}brings commits from that remote branch
                into your local <code>main</code>. Do this before creating each new
                branch, not halfway through work on an existing one.
              </p>
            </>
          ),
          check: {
            prompt: "Why run `git pull` on `main` before creating a new branch?",
            options: [
              "So the branch starts from the team's latest merged work",
              "Because `git pull` creates the new branch for you",
              "So your uncommitted changes are uploaded to GitHub",
              "Because branches cannot be created from an older commit",
            ],
            answer: 0,
            explain:
              "A branch begins at your current commit. Updating local `main` first means the branch begins at the latest `origin/main` commit, reducing avoidable conflicts and duplicated work.",
            affirm: "fresh main first, then branch from the team's latest work.",
          },
        },
        {
          id: "switch",
          title: "2 · git switch — create the branch",
          body: (
            <>
              <p>
                Main is fresh. Now create the safe branch where the work will
                happen:
              </p>
              <TryIt
                stages={[
                  {
                    cmd: "git switch -c feat/opening-hours",
                    out: `Switched to a new branch 'feat/opening-hours'`,
                  },
                ]}
                done="One quiet line — you're now on a safe parallel line of history, edits intact."
              />
              <p>
                The <code>-c</code>{" "}flag (<em>create</em>) makes the branch as it
                moves you onto it. Without <code>-c</code>, switch moves between
                branches that already exist — <code>git switch main</code>{" "}takes you
                back.
              </p>
            </>
          ),
          check: {
            prompt: "What does `git switch -c feat/new-model` do?",
            options: [
              "Creates a branch called `feat/new-model` and moves you onto it",
              "Copies your files into a folder called `feat/new-model`",
              "Commits your changes to a branch called `feat/new-model`",
              "Switches to an existing branch called `feat/new-model`",
            ],
            answer: 0,
            explain:
              "`-c` is create. Without it, `git switch` moves to a branch that already exists. Nothing is committed yet — you've just opened a fresh line to work on.",
            affirm: "switch -c creates the branch and moves you onto it — nothing is committed yet.",
          },
        },
        {
          id: "status",
          title: "3 · git status — what changed?",
          body: (
            <>
              <p>
                Now imagine you have edited one model file and created its
                documentation file. Ask git where things stand:
              </p>
              <TryIt
                initialState={{
                  working: ["opening_hours.sql", "opening_hours.yml"],
                  staged: [],
                  branch: [],
                  origin: [],
                }}
                stages={[
                  {
                    cmd: "git status",
                    out: `On branch feat/opening-hours
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
        modified:   models/staging/shared/stg_opening_hours.sql

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        models/staging/shared/stg_opening_hours.yml`,
                  },
                ]}
                done="Branch, changed files, and a suggestion for what to do next — status changes nothing, it only reports. Both files sit in your working tree, and nowhere else."
              />
              <p>
                Read it top to bottom: you are safely on your feature branch, one
                file is modified, and one is brand new (“untracked”).{" "}
                <strong>When in doubt, run status.</strong>
              </p>
            </>
          ),
        },
        {
          id: "add",
          title: "4 · git add — choose what goes in the snapshot",
          body: (
            <>
              <p>
                The step that surprises newcomers: editing a file does{" "}
                <strong>not</strong>{" "}put it in your next commit. You explicitly{" "}
                <em>stage</em>{" "}what you want included. Stage both files, then check
                what changed:
              </p>
              <TryIt
                initialState={{
                  working: ["opening_hours.sql", "opening_hours.yml"],
                  staged: [],
                  branch: [],
                  origin: [],
                }}
                stages={[
                  {
                    cmd: "git add -u",
                    out: ``,
                    prompt: "stage every file you've modified (-u = updated)",
                    state: {
                      working: ["opening_hours.yml"],
                      staged: ["opening_hours.sql"],
                      branch: [],
                      origin: [],
                    },
                  },
                  {
                    cmd: "git add models/staging/shared/stg_opening_hours.yml",
                    out: ``,
                    prompt: "the new file is untracked, so -u didn't catch it — add it by name",
                    state: {
                      working: [],
                      staged: ["opening_hours.sql", "opening_hours.yml"],
                      branch: [],
                      origin: [],
                    },
                  },
                  {
                    cmd: "git status",
                    out: `On branch feat/opening-hours
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   models/staging/shared/stg_opening_hours.sql
        new file:   models/staging/shared/stg_opening_hours.yml`,
                  },
                ]}
                done="Silence is success for git add — the map shows both files moved to staged, ready for the snapshot."
              />
              <p>
                Why the extra step? Because you often change more than you mean to
                share — staging lets you commit exactly what you intend and nothing
                else. Note that <code>git add</code>{" "}prints nothing when it works;
                status is how you confirm.
              </p>
            </>
          ),
          check: {
            prompt:
              "You edited three files but only staged one. What does the next commit contain?",
            options: [
              "All three files — committing saves everything",
              "Only the staged file",
              "Nothing — you must stage all changes first",
              "The staged file plus any file changed in the last hour",
            ],
            answer: 1,
            explain:
              "The commit is exactly the staged set. The other two files keep their changes on disk, uncommitted — git status will keep showing them until you stage or discard them.",
            affirm: "a commit contains exactly what you staged — nothing more.",
          },
        },
        {
          id: "commit",
          title: "5 · git commit — take the snapshot",
          body: (
            <>
              <p>
                Both files staged — record the snapshot, with a conventional-commits
                message (type prefix, colon, short description). Then check status
                to see what changed:
              </p>
              <TryIt
                initialState={{
                  working: [],
                  staged: ["opening_hours.sql", "opening_hours.yml"],
                  branch: [],
                  origin: [],
                }}
                stages={[
                  {
                    cmd: 'git commit -m "feat: add opening hours staging model"',
                    out: `[feat/opening-hours 3f2a1c9] feat: add opening hours staging model
 2 files changed, 34 insertions(+)`,
                    state: {
                      working: [],
                      staged: [],
                      branch: ["3f2a1c9 · 2 files"],
                      origin: [],
                    },
                  },
                  {
                    cmd: "git status",
                    out: `On branch feat/opening-hours
nothing to commit, working tree clean`,
                    prompt: "where did the staged files go? ask status",
                  },
                ]}
                done="The staged files became snapshot 3f2a1c9 on your branch — which is why status reports a clean working tree."
              />
              <p>What actually happened, decoded from that first output line:</p>
              <ul>
                <li>
                  Your two staged files became a <strong>permanent snapshot</strong>{" "}
                  in the branch&apos;s history — that is the whole event.
                </li>
                <li>
                  <code>3f2a1c9</code>{" "}is the snapshot&apos;s id: a short reference
                  you (or anyone) can use to look at exactly this version forever.
                </li>
                <li>
                  <code>2 files changed, 34 insertions(+)</code>{" "}summarises the
                  difference this snapshot records against the previous one.
                </li>
                <li>
                  The map shows why status says{" "}
                  <code>working tree clean</code>: nothing is left in the working
                  tree or staged. Editing a file starts the status → add → commit
                  cycle again.
                </li>
              </ul>
              <p>
                A hook checks the message format (<code>feat</code>,{" "}
                <code>fix</code>, <code>docs</code>, <code>chore</code>…) and tells
                you if it is off. And note: committing is <strong>local</strong> —
                nothing has left your machine yet.
              </p>
            </>
          ),
        },
        {
          id: "push",
          title: "6 · git push — share it",
          body: (
            <>
              <TryIt
                initialState={{
                  working: [],
                  staged: [],
                  branch: ["3f2a1c9 · 2 files"],
                  origin: [],
                }}
                stages={[
                  {
                    cmd: "git push",
                    state: {
                      working: [],
                      staged: [],
                      branch: ["3f2a1c9 · 2 files"],
                      origin: ["3f2a1c9 · 2 files"],
                    },
                    out: `Enumerating objects: 9, done.
Writing objects: 100% (6/6), 1.21 KiB, done.
remote:
remote: Create a pull request for 'feat/opening-hours' on GitHub by visiting:
remote:   https://github.com/wnl-icb-analytics/dbt-analytics/pull/new/feat/opening-hours
remote:
To https://github.com/wnl-icb-analytics/dbt-analytics.git
 * [new branch]      feat/opening-hours -> feat/opening-hours`,
                  },
                ]}
                done="Your branch is on GitHub — the snapshot now exists in both places, and git even hands you the link to open the pull request."
              />
              <p>
                Until you push, your work exists only on your machine — push is the
                moment it becomes shared. (A brand-new branch may first ask you to
                set an “upstream”; git prints the exact command to run, once.)
              </p>
            </>
          ),
        },
        {
          id: "loop",
          title: "The whole loop",
          body: (
            <>
              <CodeBlock
                lang="bash"
                title="the daily rhythm"
                code={`
git switch main                 # 1. return to main
git pull                        # 2. update it from origin/main
git switch -c feat/my-change    # 3. branch from fresh main
# ...edit files...
git status                      # 4. what did I change?
git add -u                      # 5. stage it
git commit -m "feat: ..."       # 6. snapshot it
git push                        # share the branch
`}
              />
              <p>
                That is the daily rhythm. Freshen main, branch once per piece of
                work, then status, add and commit as you go; push when you want the
                branch shared.
              </p>
            </>
          ),
          check: {
            prompt: "Right after `git commit`, where does your work exist?",
            options: [
              "On GitHub, visible to the team",
              "Only on your machine, on your branch",
              "On `main`, ready for tonight's build",
              "In the staging area, waiting to be pushed",
            ],
            answer: 1,
            explain:
              "Commit is local. The snapshot is safely recorded on your branch — but only push sends it to GitHub. (And nothing reaches main until a pull request is merged.)",
            affirm: "commit saves locally — push is what shares it.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "tools-do-the-typing",
      title: "Tools do the typing",
      blurb: "VS Code, AI assistants, and what stays your job",
      minutes: 6,
      steps: [
        {
          id: "vscode",
          body: (
            <>
              <p>
                Here is the good news after three lessons of commands: you will
                rarely type them. VS Code&apos;s <strong>Source Control panel</strong>{" "}
                (the branching icon in the left bar) is the same loop as buttons:
              </p>
              <ul>
                <li>changed files appear as a list — that is <code>git status</code></li>
                <li>the <strong>+</strong>{" "}next to a file stages it — <code>git add</code></li>
                <li>the message box and ✓ button — <code>git commit</code></li>
                <li><strong>Sync / Publish branch</strong> — <code>git push</code>{" "}and <code>pull</code></li>
                <li>the branch name in the status bar switches branches — <code>git switch</code></li>
              </ul>
            </>
          ),
        },
        {
          id: "agents",
          title: "AI assistants run the loop too",
          body: (
            <>
              <p>
                AI coding assistants will happily do the whole sequence from a plain
                instruction — “commit this as a fix and push it” — including writing
                a decent commit message. Use them freely. The reason this course
                taught you the commands anyway: <strong>you are accountable for what
                lands on the branch</strong>. Knowing what add, commit and push mean
                is how you check what a tool did on your behalf — and how you notice
                when it staged a file you never meant to share.
              </p>
            </>
          ),
          check: {
            prompt:
              "An AI assistant commits and pushes for you. What's your job before trusting it?",
            options: [
              "Nothing — the assistant validated it",
              "Check what was actually committed (the diff and the file list), because you are accountable for it",
              "Re-type the commands yourself to make it official",
              "Ask the assistant to confirm twice",
            ],
            answer: 1,
            explain:
              "Tools do mechanics; you own decisions and outcomes. A glance at the diff — in the PR or with git status before pushing — is how you keep that ownership while still letting the tools type.",
            affirm: "tools type the commands — the diff is still yours to own.",
          },
        },
        {
          id: "wrap",
          title: "You know git",
          body: (
            <>
              <p>
                Repo, branch, commit, push, PR, merge — that is the entire mental
                model this project requires, and you now have it. Next,{" "}
                <strong>Understanding dbt</strong>{" "}shows you what dbt is and why the
                project is shaped the way it is — all pictures and questions, nothing
                to install. After that, Your first PR puts both skills together on
                the real repository, including the one-off signed-commit setup.
              </p>
            </>
          ),
        },
      ],
    },
  ],
};
