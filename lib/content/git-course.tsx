import Link from "next/link";
import type { Course } from "@/lib/course-types";
import { CodeBlock } from "@/components/CodeBlock";
import { WorkingLoop } from "@/components/WorkingLoop";
import { BranchDiagram } from "@/components/BranchDiagram";
import { CloneDiagram } from "@/components/CloneDiagram";
import { TryIt } from "@/components/TryIt";
import { Callout } from "@/components/Callout";

export const GIT_COURSE: Course = {
  slug: "git-essentials",
  title: "Git essentials",
  tagline: "Version control from scratch. Every other course builds on it",
  audience: "Start here if you've never used git. You don't need to install anything yet. This course covers the ideas and the handful of commands you'll use.",
  hours: "~1 hr",
  accent: "var(--layer-staging)",
  lessons: [
    // ------------------------------------------------------------------
    {
      slug: "what-version-control-is",
      title: "What version control is",
      blurb: "How Git records each version of the project, and why a team needs that",
      minutes: 8,
      steps: [
        {
          id: "copies",
          body: (
            <>
              <p>
                Version control is a record of how your files changed, who changed
                them and when. Without a tool for it, most of us keep copies like
                these.
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
                Copies work as versions for a while. Then you can&apos;t remember
                what changed between v2 and FINAL. Two people edit different copies
                at once. Before long, nobody is sure which file is the real one.
              </p>
            </>
          ),
        },
        {
          id: "snapshots",
          title: "Git records snapshots of one set of files",
          body: (
            <>
              <p>
                With Git, you keep <strong>one</strong>{" "}set of files, and Git
                records <strong>snapshots</strong>{" "}of them over time. That
                replaces the copies. Each snapshot stores what each file looked like at that
                moment, who took it, when, and a short message saying what changed.
              </p>
              <p>
                The whole history stays available. You can open any snapshot,
                compare any two to see what changed, and go back to an
                earlier one if you need to. Day to day, though, you just edit the
                files as normal.
              </p>
            </>
          ),
          check: {
            prompt:
              "You need last month's version of a query. With git, where is it?",
            options: [
              "In a backup folder, if someone kept one",
              "In the file's history, because git keeps every snapshot",
              "Gone, because git only keeps the latest version",
              "In your email, attached to an old message",
            ],
            answer: 1,
            explain:
              "Git keeps every snapshot in the history. Looking at a file as it was at any point, and seeing what has changed since, is the core of what git does.",
            affirm: "every version lives in the history, so no more _FINAL_v3 copies.",
          },
        },
        {
          id: "repo",
          title: "A repository is a folder Git manages",
          body: (
            <>
              <p>
                A folder that git manages is called a <strong>repository</strong>,
                or &quot;repo&quot; for short. Ours is <code>dbt-analytics</code>.
                It holds the models, tests and documentation, plus the history of
                all of it.
              </p>
              <p>
                The repo exists in two kinds of place. There&apos;s the copy on{" "}
                <strong>GitHub</strong>, which the whole team shares. And each
                person has a <strong>clone</strong>{" "}on their own machine, which
                is their private working copy:
              </p>
              <CloneDiagram />
              <p>
                You do your work in your clone. Nothing reaches GitHub until you
                choose to send your snapshots up.
              </p>
            </>
          ),
        },
        {
          id: "why-team",
          title: "One shared repo lets the team work on the same code",
          body: (
            <>
              <p>
                A shared repo lets several analysts change one project without
                losing each other&apos;s work. Everyone clones the same repo, so
                you can read anyone&apos;s work. Every change records who made it
                and why. Two people editing at the same time is normal, and git has
                a way to handle it. Compare that with a chain of emails with
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
              "A clone is the whole repo on your machine, all the files and the full history. It doesn't sync by itself. You choose when to pull the team's changes down and when to push yours up.",
            affirm: "a clone is the full repo on your machine, and it only syncs when you choose.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "branches-and-commits",
      title: "Branches and commits",
      blurb: "How you change the project on a branch while production runs from main",
      minutes: 12,
      steps: [
        {
          id: "main",
          body: (
            <>
              <p>
                <code>main</code>{" "}is the branch production deploys from. When a
                change merges into main, the deploy workflow builds it, and the
                scheduled production runs use main&apos;s code. That&apos;s why
                nobody edits it directly. GitHub rejects any direct push to main,
                administrators included.
              </p>
              <p>
                main is our repo&apos;s default branch. Each repo names its own, so
                older repos often call it <code>master</code>. The project also
                requires signed commits on main, which let GitHub check a commit
                came from you. You&apos;ll set that up in a later course.
              </p>
            </>
          ),
        },
        {
          id: "branch",
          title: "A branch keeps your changes off main",
          body: (
            <>
              <p>
                A <strong>branch</strong>{" "}is a separate line of commits that
                starts from main as it is right now. You make one for each change.
                On your branch you can edit, experiment and make mistakes. Main
                doesn&apos;t change, and neither does anyone else&apos;s work.
              </p>
              <p>
                Branches are cheap, and you throw them away once their work is
                merged. Make one branch per piece of work and name it for what it
                does. The name starts with the kind of change, then a slash:{" "}
                <code>feat/fin-week-staging</code>,{" "}
                <code>fix/age-band-boundary</code>.
              </p>
            </>
          ),
          check: {
            prompt:
              "You break something badly on your branch. What happened to production?",
            options: [
              "Nothing. The branch is a separate line, and main is untouched",
              "Production is broken until you fix the branch",
              "Production reverts to last night's backup",
              "It depends how big the mistake was",
            ],
            answer: 0,
            explain:
              "Branches exist for this. Your work in progress, however broken, only exists on your branch. Production code changes only when someone merges a branch into main.",
            affirm: "nothing on your branch can touch production. That's the point of branches.",
          },
        },
        {
          id: "commit",
          title: "A commit is a snapshot with a message",
          body: (
            <>
              <p>
                A <strong>commit</strong>{" "}saves a snapshot of your work on your
                branch, with a message saying what it does. It&apos;s one of the
                snapshots from lesson one. Messages look like this.
              </p>
              <CodeBlock
                lang="text"
                code={`
feat: add financial week staging model
fix: correct age band boundary
docs: describe waiting list snapshot logic
`}
              />
              <p>
                The word before the colon says what kind of change it is.{" "}
                <code>feat</code>{" "}adds something, <code>fix</code>{" "}corrects
                something and <code>docs</code>{" "}changes documentation. This
                format is called Conventional Commits. The project uses it for
                commit messages and pull request titles.
              </p>
              <p>
                Write the rest so it finishes the sentence &quot;this commit
                will…&quot;. Then anyone reading the history later can see what
                changed without opening the files.
              </p>
            </>
          ),
        },
        {
          id: "hygiene",
          title: "Keep commits and branches small",
          body: (
            <>
              <p>
                Give each commit one change and each branch one piece of work.{" "}
                <strong>Commit small and often. Branch small and often.</strong>
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
                    Each commit should do one thing, with a message that says what.
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
                    Keep one outcome on each branch. Finish it and share it, then
                    start the next branch from a fresh main.
                  </p>
                </div>
              </div>
              <p>
                The two habits solve different problems. Small commits make the
                history easy to read. Small branches that don&apos;t live long are
                easier to review, and less likely to clash with other changes
                landing on <code>main</code>.
              </p>
              <Callout kind="info" title="What a merge conflict means">
                <p>
                  A merge conflict happens when your branch and <code>main</code>{" "}
                  have both changed the same lines of the same file. Say main
                  changes a threshold from 65 to 70 while your branch changes the
                  same line to 75. Git can&apos;t tell which value you want, so it
                  stops and asks you rather than picking one. The walkthrough{" "}
                  <Link href="/practice/undoing-changes">Undoing things in git</Link>{" "}
                  shows how to resolve a conflict, and how to recover from other
                  mistakes.
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
              "Two branches can change different parts of the same file without trouble. Git stops when the edits overlap and it can't tell which version should win.",
            affirm: "same file and same lines: Git stops rather than guessing.",
          },
        },
        {
          id: "history",
          title: "Each change branches off main and merges back",
          body: (
            <>
              <p>
                Each piece of work branches off main, collects commits, then
                merges back into main as one commit.
              </p>
              <BranchDiagram />
              <p>
                You branch off main after commit C and make your commits, D, E and
                F. When the work is ready, it&apos;s squashed into one new commit, G,
                on main. The route
                from your branch to main has safety checks along the way, which the
                pull requests lesson covers.
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
              "A branch is the parallel line, and commits are the snapshots along it. You make one branch per piece of work, with several commits on each.",
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
                A dbt project holds the <strong>instructions</strong>{" "}for turning
                warehouse data into useful datasets. You commit SQL models, YAML
                properties, tests, macros and documentation. The data itself stays
                in Snowflake. dbt sends queries to Snowflake. It doesn&apos;t copy
                rows into your project folder.
              </p>
              <p>
                The code is public on purpose. Other organisations can adopt or
                adapt our definitions in their own projects. Users can trace how a
                measure was produced. People outside the team can question the
                logic and improve it. Open code also lets us build tools that
                explain a result through its documented upstream lineage, instead
                of showing a number with no reasoning behind it.
              </p>
              <Callout kind="info" title="Open definitions, not open data">
                <p>
                  Anyone can read the transformation logic. Access to the warehouse
                  data is controlled separately. So <code>dbt-analytics</code>{" "}is
                  a public codebase. It isn&apos;t a place for extracts or analysis
                  outputs.
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
              "The project stores the instructions. dbt runs them in Snowflake, and the tables and views they create stay there.",
            affirm: "git stores the instructions; the warehouse stores the data.",
          },
        },
        {
          id: "gitignore",
          title: ".gitignore keeps generated and local files out of git status",
          body: (
            <>
              <p>
                <code>.gitignore</code>{" "}lists paths that Git leaves out when it
                shows you what&apos;s changed, so they don&apos;t get staged by
                accident. Here&apos;s a shortened version of the project&apos;s real
                rules:
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
                A rule ending in <code>/</code>{" "}matches a folder.{" "}
                <code>*</code>{" "}is a wildcard, so <code>*.csv</code>{" "}matches
                any CSV. A rule starting with <code>!</code>{" "}makes an exception
                to an earlier rule. The file itself is committed, so everyone who
                clones the project gets the same rules.
              </p>
              <Callout kind="info" title="Ignored is not the same as forbidden">
                <p>
                  <code>.gitignore</code>{" "}only affects files git isn&apos;t
                  already tracking. It doesn&apos;t look inside files, and it
                  won&apos;t remove a file that&apos;s already been committed.
                  Anyone can still add an ignored file on purpose with{" "}
                  <code>git add -f</code>. Treat it as a set of tidy guardrails,
                  not a security scanner.
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
              "dbt writes compiled SQL and other generated files to target/. The project ignores that folder because dbt can recreate it, so it doesn't belong in version control.",
            affirm: ".gitignore keeps reproducible local artefacts out of the file list.",
          },
        },
        {
          id: "seeds",
          title: "Seeds are the deliberate data exception",
          body: (
            <>
              <p>
                A dbt <strong>seed</strong>{" "}is a CSV that lives in{" "}
                <code>seeds/</code>{" "}on purpose. Running <code>dbt seed</code>{" "}
                loads it into Snowflake, and models can depend on it with{" "}
                <code>ref()</code>. That&apos;s why the ignore file ignores all
                CSVs first, then makes a narrow exception for seed files.
              </p>
              <p>
                Seeds should be small, fixed reference datasets that are part of
                the project&apos;s logic. Think mappings, categories, code lists or
                thresholds that rarely change. They get reviewed and versioned like
                code. A query export, a sample of patient records or a large source
                dataset isn&apos;t a seed, even if you put it in that folder.
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
              "Seeds are for small, stable reference data that's part of the project's logic. Extracts and record-level examples stay outside the repository.",
            affirm: "a seed is reviewed reference data, not a convenient place for an extract.",
          },
        },
        {
          id: "final-check",
          title: "Everything you push is public",
          body: (
            <>
              <p>
                When you push, your commits join a public repository, so check
                what&apos;s in them first. Normal work leaves you with a short list
                of changed files. That&apos;s SQL, YAML, macros, documentation and,
                now and then, a deliberate seed. Credentials stay in ignored environment files.
                Build artefacts stay in ignored dbt folders. Data extracts stay out
                of the project folder altogether.
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
                    ["File contents", "Every tracked file, including SQL, YAML and the comments inside them."],
                    ["Filenames & folders", "The whole project structure, including work-in-progress names."],
                    ["Author", "Your name and email address, on every commit, for good."],
                    ["Commit messages", "The one-line story of each change."],
                    ["History", "Every earlier committed version. Deleting a file later doesn't unpublish it."],
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
                understand the work. Never use any of it for data, credentials or
                private notes.
              </p>
              <p>
                Before you commit, read <code>git status</code>{" "}and look over the
                diff, which shows the exact lines you&apos;ve changed. If a file you
                didn&apos;t expect shows up, stop and work out what it is before you
                stage it. If sensitive material ever gets committed, tell the team
                straight away. Deleting it later doesn&apos;t remove it from git
                history, and a leaked credential may need to be revoked and
                replaced.
              </p>
              <p>
                High-level counts, rates, distributions and validation totals
                aren&apos;t person-level data, as long as their dimensions and cell
                sizes can&apos;t identify anyone. You can use them as evidence in a
                public PR.
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
              "Pushing publishes the branch's committed history. That covers tracked file contents, the comments inside them, authorship and commit messages. GitHub also shows the pull request discussion publicly.",
            affirm: "open code builds shared understanding, so write the public parts with care.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "pull-requests",
      title: "Pull requests",
      blurb: "How automated checks, AI review and a human get a branch into production",
      minutes: 16,
      steps: [
        {
          id: "what",
          body: (
            <>
              <p>
                A <strong>pull request</strong>, or PR, asks to merge your branch
                into <code>main</code>. It&apos;s the only way a change reaches
                main, and so production. The name comes from asking the project to
                pull your changes in. The PR shows the lines you added, changed or
                removed. You open one once your branch is on GitHub, and the next
                lesson shows the command that sends it there.
              </p>
              <p>
                Before a PR merges, automated checks test it and an AI reviewer
                comments on it. Then a colleague reviews it. GitHub doesn&apos;t
                require an approval, but the team merges only after one.
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
          title: "The PR description says what changed and why",
          body: (
            <>
              <p>
                The PR description tells a reviewer what the change does and why,
                before they open a file. The project&apos;s PR template gives you
                these headings.
              </p>
              <div className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-graphite-deep shadow-[6px_6px_0_0_var(--color-layer-modelling)]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                  <span className="font-display text-xs font-extrabold uppercase tracking-[0.14em] text-white">PR description</span>
                  <span className="rounded-full bg-layer-modelling/20 px-2.5 py-1 font-mono text-[10px] font-bold text-[#d5b8ff]">DRAFT</span>
                </div>
                <div className="grid gap-px bg-white/10 sm:grid-cols-3">
                  {[
                    ["Why", "What this changes, and why it matters. One clear sentence can be enough for a small change."],
                    ["Checks", "How you confirmed the result. Use aggregates or synthetic data only."],
                    ["Changelog", "Optional. One plain-English sentence for analysts, shown in the onboarding changelog instead of the PR title."],
                  ].map(([label, copy]) => (
                    <div key={label} className="bg-graphite-deep p-4">
                      <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-[#7ee2c0]">{label}</p>
                      <p className="!mb-0 !mt-2 text-sm leading-6 !text-white/75">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p>
                For a bigger change, also say which models changed, what each one
                does, and which decisions you&apos;d like a colleague to look at.
                If there&apos;s an issue for the work, link it. Writing{" "}
                <code>Fixes #123</code>{" "}in the description closes issue 123 when
                the PR merges.
              </p>
              <p>
                The PR title matters too. When the PR merges, its title becomes the
                commit message on main, so it uses the Conventional Commits format
                from lesson two, like <code>feat: add financial week staging model</code>.
                A check flags a title that doesn&apos;t fit. You can add the
                area of the project in brackets, like <code>feat(olids):</code>.
              </p>
              <p>
                You can open a PR as a <strong>draft</strong>. A draft can&apos;t be
                merged. It tells people the work isn&apos;t ready for a full review
                yet, and you mark it ready when it is.
              </p>
            </>
          ),
        },
        {
          id: "ci",
          title: "Automated checks run on the PR and in the merge queue",
          body: (
            <>
              <p>
                Automated checks compile and test your change. The fast gates run
                whenever you open or update the PR. The Snowflake DEV build waits
                until you add the PR to the merge queue.
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
                A new draft PR looks like this. The fast gates and
                CodeRabbit start straight away.
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    trigger: "PR opens or updates",
                    title: "Fast gates",
                    result: "Fast gates run",
                    dotClass: "bg-layer-staging",
                    checks: ["Fusion compile", "Descriptions + tests", "Refs + layer rules", "PR title format", "Ownership suggestion"],
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
                    <div className="border-b-2 border-ink bg-paper-warm p-4">
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
              <p>
                <strong>Merge when ready</strong>{" "}is the button you select once a
                colleague has approved the PR. It puts the PR in GitHub&apos;s merge queue. The
                queue combines your change with the latest main, builds the changed
                models in Snowflake DEV and runs their data tests. It only merges if
                that passes. If it fails, GitHub takes the PR out of the queue. You
                fix the problem, push, and select the button again.
              </p>
              <Callout kind="info" title="Red means look, fix, push">
                <p>
                  Open the failed check and read the error. Fix it on your machine,
                  commit, and push to the same branch, which re-runs the checks.
                  Required checks have to pass before the PR can merge.
                </p>
              </Callout>
              <p>
                Both kinds of check give a yes-or-no answer. They pass or they
                fail. CodeRabbit, the middle tile, works differently. Instead of a
                verdict it leaves a review, which is the next step.
              </p>
            </>
          ),
          check: {
            prompt: "A CI check on your PR goes red. The right response is…",
            options: [
              "Fix the issue locally, commit, and `git push` to the same branch. The checks re-run",
              "Open a new PR so the checks start fresh",
              "Ask someone to merge it anyway, since checks are advisory",
              "Delete the branch and start again",
            ],
            answer: 0,
            explain:
              "A red check tells you what to fix. Open its details, read the error, fix it, commit and push, and the same PR runs its checks again. Failed checks are a normal part of the loop.",
            affirm: "fix locally and push to the same branch, and the checks run again.",
          },
        },
        {
          id: "ai-review",
          title: "CodeRabbit, an AI reviewer, comments on the diff",
          body: (
            <>
              <p>
                <strong>CodeRabbit</strong>{" "}is an <strong>AI code reviewer</strong>{" "}
                that comments on your PR. It starts as soon as the PR opens, even
                while it&apos;s a draft. It reads the whole diff on each PR and
                leaves comments the way a colleague would. It isn&apos;t a
                pass-or-fail gate like the checks above. Its comments are
                suggestions you weigh up, reply to or act on.
              </p>
              <p>
                Its advice isn&apos;t generic. CodeRabbit reads{" "}
                <code>.coderabbit.yaml</code>{" "}in the repo, where each
                layer&apos;s contract and our naming rules are written down. So it
                reviews against <em>our</em>{" "}conventions, and its comments cite
                them. On a recent PR it caught a staging model selecting straight
                from <code>source(&apos;sdl_wnl&apos;, &apos;REF&apos;)</code>. It
                pointed out that this skips the raw layer. The fix was to reference
                the raw model, <code>ref(&apos;raw_sdl_wnl_ref&apos;)</code>, so
                everything downstream reads one stable name. The rule lives in the
                config, so CodeRabbit checks for it on each PR and nobody has to
                remember it.
              </p>
              <p>
                That example shows where it&apos;s strong and where it stops. It
                never tires of anything it can check from the code and the rules.
                It has nothing useful to say about what the model is{" "}
                <em>for</em>.
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-modelling)]">
                  <p className="!my-0 font-display text-base font-extrabold !text-ink">Good at rules and patterns</p>
                  <p className="!mb-3 !mt-1 text-sm leading-5 !text-ink-soft">Things it can check from the code alone.</p>
                  <ul className="!mb-0 !mt-0 space-y-2 !pl-0">
                    {[
                      "Layer rules, like a staging model reading straight from source() instead of the raw model",
                      "Fan-out joins that quietly multiply rows",
                      "Missing tests, or YAML that documents fewer columns than the SQL outputs",
                      "Edge cases, like try_to_number() on a value nobody validated",
                      "Naming, like is_/has_ booleans and _date / _at / _id suffixes",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm leading-5 !text-ink-soft">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-layer-modelling" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                  <p className="!my-0 font-display text-base font-extrabold !text-ink">Can&apos;t judge meaning and fit</p>
                  <p className="!mb-3 !mt-1 text-sm leading-5 !text-ink-soft">Things only someone who knows the intent can judge.</p>
                  <ul className="!mb-0 !mt-0 space-y-2 !pl-0">
                    {[
                      "Whether this is the intended clinical population",
                      "Whether the model belongs in this layer, or should reuse one that exists",
                      "Whether the next person will follow the logic",
                      'Whether a flagged "issue" is fine in this case',
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
                  CodeRabbit can be over-eager. Some comments are nitpicks, and
                  sometimes it&apos;s wrong. Resolve the ones that don&apos;t apply.
                  Fix the ones that do, and push to the same branch. Its comments
                  are evidence for the human reviewer, not the final word.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt:
              "CodeRabbit flags that a staging model reads from source() instead of the raw model. Why is this the kind of thing it catches well?",
            options: [
              "It's a convention written in .coderabbit.yaml, a rule it can check from the code alone on each PR",
              "It understands whether the staging model identifies the intended clinical population",
              "It decides whether the model belongs in the project's architecture",
              "It removes the need for a human to review the PR at all",
            ],
            answer: 0,
            explain:
              "CodeRabbit is strongest on rules and patterns it can see in the code and our config: layer contracts, naming, missing tests, fan-out joins. Judgement about clinical meaning, architectural fit and maintainability stays with a person.",
            affirm: "CodeRabbit is strongest on rule- and pattern-based checks.",
          },
        },
        {
          id: "review",
          title: "A colleague reviews what the change means",
          body: (
            <>
              <p>
                A colleague reads the change and judges whether it{" "}
                <em>should exist this way</em>. The automated checks tell you
                whether the code <em>works</em>, and CodeRabbit comments on{" "}
                <em>how</em>{" "}it&apos;s built. Neither can judge what the model is
                for.
              </p>
              <p>
                Start with the PR description, then read the changed models and
                their lineage. A good review asks questions in three areas.
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
                    ["Observation", "This model does three jobs. It cleans source data, decides who is eligible and shapes the final output."],
                    ["Why it matters", "Eligibility is reusable business logic. If it stays here, other outputs may repeat it, and future changes get harder to make safely."],
                    ["Suggestion", "Could eligibility become an intermediate model that this output, and any future ones, can reference?"],
                  ].map(([label, copy]) => (
                    <div key={label} className="bg-graphite-deep p-4">
                      <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-[#7ee2c0]">{label}</p>
                      <p className="!mb-0 !mt-2 text-sm leading-6 !text-white/75">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p>
                A review can approve the approach, ask a question or suggest a
                change. It isn&apos;t a hunt for mistakes. As the author, you reply
                to comments and push fixes to the same branch. The PR picks up the
                new commits by itself.
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
              "The checks and CodeRabbit give evidence about compiling, tests and common implementation risks. A human reviewer adds context: whether the model belongs in the architecture, matches the clinical definition and will stay understandable when it changes.",
            affirm: "human review adds architectural, clinical and maintenance judgement.",
          },
        },
        {
          id: "merge",
          title: "The merge queue squashes your PR into one commit on main",
          body: (
            <>
              <p>
                Once a colleague approves and the checks are green, you select
                Merge when ready and the merge queue does the rest. Your commits
                arrive on main <strong>squashed</strong>{" "}into one new commit,
                whose only parent is the main commit before it. The first line of
                its message is the PR title plus the PR number, which is why the
                title has to be right.
              </p>
              <p>
                GitHub then deletes the branch on its side. The copy on your
                machine stays until you delete it, and leaving it does no harm. The
                deploy workflow builds your changed models, and everything
                downstream of them, in production. Back on your machine:
              </p>
              <CodeBlock
                lang="bash"
                code={`
git switch main
git pull          # update main, which now includes your work
`}
              />
              <p>
                <code>git pull</code>{" "}is the opposite of push. It downloads what
                changed on GitHub and brings it into the branch you&apos;re on. Do
                this whenever you start something new, so your next branch starts
                from the latest main. The next lesson runs these commands, and
                the clean-up of your old branch, in a terminal.
              </p>
            </>
          ),
          check: {
            prompt: "What is the only route by which code reaches `main`?",
            options: [
              "`git push`, once the branch is tested",
              "A pull request being merged, after review and green checks",
              "An administrator copying changes across",
              "The nightly build promotes approved branches",
            ],
            answer: 1,
            explain:
              "GitHub rejects direct pushes to main from everyone, administrators included. Changes only arrive by merging a pull request. Required checks have to pass, and the team merges only after a colleague's review.",
            affirm: "a merged pull request is the only road into main.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "the-daily-commands",
      title: "The daily commands",
      blurb: "Run the six everyday commands on one change, from a fresh branch to after the merge",
      minutes: 24,
      steps: [
        {
          id: "intro",
          body: (
            <>
              <p>
                You&apos;ll run the <strong>six</strong>{" "}commands you use each
                day, one at a time, then follow the same change through review and
                past the merge. Each one runs in a simulated terminal, so you see
                what your own machine will say back. There&apos;s nothing to
                install. Type the command, or use &quot;type it for me&quot;, then
                press Enter.
              </p>
              <p>
                From the third command on, a map under the terminal shows the four
                places your work can be. The first is the{" "}
                <em>working tree</em>, Git&apos;s name for the files in your project
                folder. From there, work moves to staged, then to your branch, then
                to GitHub. Watch the files move across the map to see what each
                command does.
              </p>
            </>
          ),
        },
        {
          id: "pull",
          title: "1 · git pull brings main up to date",
          body: (
            <>
              <p>
                Before you start new work, go back to <code>main</code>{" "}and update
                it from GitHub. Your new branch then starts from the latest version
                of the project:
              </p>
              <TryIt
                stages={[
                  {
                    cmd: "git switch main",
                    out: `Switched to branch 'main'
Your branch is up to date with 'origin/main'.`,
                    prompt: "first, go back to the project's default branch",
                  },
                  {
                    cmd: "git pull",
                    out: `From https://github.com/wnl-icb-analytics/dbt-analytics
   a17c9b2..e43d0af  main       -> origin/main
Updating a17c9b2..e43d0af
Fast-forward
 models/staging/shared/stg_specialties.sql | 8 +++++---
 1 file changed, 5 insertions(+), 3 deletions(-)`,
                    prompt: "download and apply anything merged since your last update",
                  },
                ]}
                done="Your local main now matches origin/main, so the next branch starts from the team's latest work."
              />
              <p>
                <code>origin</code>{" "}is git&apos;s name for the GitHub copy you
                cloned from. <code>origin/main</code>{" "}is your clone&apos;s record
                of main on GitHub, as of the last time you downloaded from it.
                That&apos;s why <code>git switch</code>{" "}said &quot;up to
                date&quot; even though new work was waiting. It was comparing
                against an old record.
              </p>
              <p>
                <code>git pull</code>{" "}does two things. First it downloads new
                commits from GitHub. Git calls that part <em>fetch</em>, and
                it&apos;s the <code>From</code>{" "}lines in the output. Then it
                brings those commits into your current branch. Your main had no
                commits of its own, so git could just move it forward to the new
                ones. The output calls this a <code>Fast-forward</code>.
              </p>
              <p>
                Pull main before you create each new branch. You don&apos;t have to
                keep bringing main into a branch you&apos;re already working on,
                because the merge queue tests your change against the latest main
                anyway. You only need to bring main in if GitHub reports a
                conflict, or you need a change a colleague has merged. Step 7
                shows how.
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
              "A new branch starts at the commit you're on. Updating local `main` first means it starts at the latest `origin/main` commit, which avoids needless conflicts and duplicated work.",
            affirm: "fresh main first, then branch from the team's latest work.",
          },
        },
        {
          id: "switch",
          title: "2 · git switch creates the branch",
          body: (
            <>
              <p>
                <code>git switch -c</code>{" "}creates a branch and moves you onto
                it. With main up to date, create the branch for this piece of work.
              </p>
              <TryIt
                stages={[
                  {
                    cmd: "git switch -c feat/fin-week-staging",
                    out: `Switched to a new branch 'feat/fin-week-staging'`,
                  },
                ]}
                done="One quiet line. You're now on your own branch, and main is untouched."
              />
              <p>
                The <code>-c</code>{" "}flag stands for <em>create</em>. Without <code>-c</code>,{" "}
                <code>git switch</code>{" "}moves between branches that already
                exist, so <code>git switch main</code>{" "}takes you back.
              </p>
              <p>
                Switching changes the files in your project folder to match the
                branch you switch to. The folder shows one branch at a time. Right
                now your new branch is identical to main, so nothing on disk
                changes. Edits you haven&apos;t committed yet come with you when you
                switch. If they would clash with the other branch&apos;s files, git
                refuses to switch rather than overwrite them.
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
              "`-c` means create. Without it, `git switch` moves to a branch that already exists. You haven't committed anything. You've just started a fresh line to work on.",
            affirm: "switch -c creates the branch and moves you onto it. Nothing is committed yet.",
          },
        },
        {
          id: "status",
          title: "3 · git status shows what changed",
          body: (
            <>
              <p>
                <code>git status</code>{" "}tells you which branch you&apos;re on and
                which files have changed since your last commit. Say you&apos;re
                working on a staging model for NHS financial weeks. Its SQL file is
                already committed. You&apos;ve just added a column to it, and
                created a new YAML file to document it. Ask Git where things stand.
              </p>
              <TryIt
                initialState={{
                  working: ["fin_week.sql", "fin_week.yml"],
                  staged: [],
                  branch: [],
                  origin: [],
                }}
                stages={[
                  {
                    cmd: "git status",
                    out: `On branch feat/fin-week-staging
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.sql

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.yml

no changes added to commit (use "git add" and/or "git commit -a")`,
                  },
                ]}
                done="Status shows your branch, the changed files and a hint about what to do next. It only reports and changes nothing. Both files are in your working tree and nowhere else."
              />
              <p>
                Read it from the top. You&apos;re on your feature branch. One file
                is <code>modified</code>, which means git already has it in earlier
                snapshots and it has changed since. The other is{" "}
                <code>untracked</code>. It&apos;s new, so git has never recorded
                it. <strong>When in doubt, run status.</strong>
              </p>
            </>
          ),
        },
        {
          id: "add",
          title: "4 · git add chooses what goes in the snapshot",
          body: (
            <>
              <p>
                <code>git add</code>{" "}picks which changes go into your next
                commit. Git calls this <em>staging</em>. Editing a file does{" "}
                <strong>not</strong>{" "}put it in the commit by itself. Staged
                changes wait in the staging area until you commit. Stage both
                files, then check status.
              </p>
              <TryIt
                initialState={{
                  working: ["fin_week.sql", "fin_week.yml"],
                  staged: [],
                  branch: [],
                  origin: [],
                }}
                stages={[
                  {
                    cmd: "git add -u",
                    out: ``,
                    prompt: "stage every tracked file you've changed (-u means update)",
                    state: {
                      working: ["fin_week.yml"],
                      staged: ["fin_week.sql"],
                      branch: [],
                      origin: [],
                    },
                  },
                  {
                    cmd: "git add models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.yml",
                    out: ``,
                    prompt: "the new file is untracked, so -u skipped it. Add it by name",
                    state: {
                      working: [],
                      staged: ["fin_week.sql", "fin_week.yml"],
                      branch: [],
                      origin: [],
                    },
                  },
                  {
                    cmd: "git status",
                    out: `On branch feat/fin-week-staging
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.sql
        new file:   models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.yml`,
                  },
                ]}
                done="git add prints nothing when it works. The map shows both files moved to staged, ready for the snapshot."
              />
              <p>
                Why the extra step? You often change more than you mean to share.
                Say you also wrote a scratch query to check your counts. Staging
                lets you commit the model and its YAML and leave the scratch file
                out. Because <code>git add</code>{" "}is silent, run status to see
                what it did.
              </p>
              <p>
                You&apos;ll also see <code>git add .</code>, which stages
                everything in the folder, new files included. It&apos;s quick, but
                it&apos;s also how an unexpected file ends up in a public commit, so
                check status first. If you stage something by mistake, status tells
                you the way out. <code>git restore --staged</code>{" "}and the file
                name takes it back out of the staging area and keeps your edits.
              </p>
            </>
          ),
          check: {
            prompt:
              "You edited three files but only staged one. Which of your edits will be recorded in this commit?",
            options: [
              "All three, because committing saves everything",
              "Only the edit in the staged file",
              "None, because you must stage all changes first",
              "The staged edit plus any file changed in the last hour",
            ],
            answer: 1,
            explain:
              "A commit records the whole project as the staging area holds it. The two unstaged files go in as they were at the last commit, so only the staged edit appears in the commit's diff. Your other edits stay on disk, uncommitted, and git status keeps showing them.",
            affirm: "a commit records only the changes you staged.",
          },
        },
        {
          id: "commit",
          title: "5 · git commit takes the snapshot",
          body: (
            <>
              <p>
                <code>git commit</code>{" "}turns what you&apos;ve staged into a
                commit on your branch. <code>-m</code>{" "}means message. Without it,
                Git opens a text editor for you to write one. The message uses the
                Conventional Commits format from lesson two, a type and a colon,
                then a short description. Commit both files, then check status
                again.
              </p>
              <TryIt
                initialState={{
                  working: [],
                  staged: ["fin_week.sql", "fin_week.yml"],
                  branch: [],
                  origin: [],
                }}
                stages={[
                  {
                    cmd: 'git commit -m "feat: add financial year to financial week model"',
                    out: `[feat/fin-week-staging 3f2a1c9] feat: add financial year to financial week model
 2 files changed, 34 insertions(+)
 create mode 100644 models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.yml`,
                    state: {
                      working: [],
                      staged: [],
                      branch: ["3f2a1c9 · 2 files"],
                      origin: [],
                    },
                  },
                  {
                    cmd: "git status",
                    out: `On branch feat/fin-week-staging
nothing to commit, working tree clean`,
                    prompt: "where did the staged files go? ask status",
                  },
                ]}
                done="The staged files became snapshot 3f2a1c9 on your branch, so status reports a clean working tree."
              />
              <p>Here&apos;s what happened, line by line:</p>
              <ul>
                <li>
                  Your two staged changes went into a new snapshot in the
                  branch&apos;s history. A commit does nothing more.{" "}
                  <code>3f2a1c9</code>{" "}is the start of the snapshot&apos;s id,
                  called a hash. You can use it later to look at exactly this
                  version.
                </li>
                <li>
                  <code>2 files changed, 34 insertions(+)</code>{" "}sums up the
                  difference from the previous snapshot.
                </li>
                <li>
                  <code>create mode 100644</code>{" "}marks the YAML as a file that
                  is new to the repo. 100644 is git&apos;s code for an ordinary
                  file.
                </li>
              </ul>
              <p>
                The map shows why status then says <code>working tree clean</code>.
                No files are left unstaged or staged. Edit a file and the cycle of
                status, add and commit starts again.
              </p>
              <p>
                Committing is <strong>local</strong>. Nothing has left your machine
                yet. When you commit, the project&apos;s git hook checks that
                you&apos;re not committing a credentials file like{" "}
                <code>.env</code>, and stops the commit if you are. Message format
                is checked later, on the PR title, because that title becomes the
                commit message on main.
              </p>
            </>
          ),
        },
        {
          id: "push",
          title: "6 · git push shares it",
          body: (
            <>
              <p>
                <code>git push</code>{" "}sends your branch&apos;s commits to GitHub,
                where the team can see them. Until then, your commit is only on
                your machine. The first push of a new branch needs one extra step,
                and Git tells you what it is.
              </p>
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
                    prompt: "try a plain push first",
                    out: `fatal: The current branch feat/fin-week-staging has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin feat/fin-week-staging

To have this happen automatically for branches without a tracking
upstream, see 'push.autoSetupRemote' in 'git help config'.`,
                  },
                  {
                    cmd: "git push -u origin feat/fin-week-staging",
                    prompt: "run what git suggested, with -u, its short form",
                    state: {
                      working: [],
                      staged: [],
                      branch: ["3f2a1c9 · 2 files"],
                      origin: ["3f2a1c9 · 2 files"],
                    },
                    out: `Enumerating objects: 9, done.
Writing objects: 100% (6/6), 1.21 KiB, done.
remote:
remote: Create a pull request for 'feat/fin-week-staging' on GitHub by visiting:
remote:   https://github.com/wnl-icb-analytics/dbt-analytics/pull/new/feat/fin-week-staging
remote:
To https://github.com/wnl-icb-analytics/dbt-analytics.git
 * [new branch]      feat/fin-week-staging -> feat/fin-week-staging
branch 'feat/fin-week-staging' set up to track 'origin/feat/fin-week-staging'.`,
                  },
                ]}
                done="Your branch is on GitHub. The snapshot now exists in both places, and git even hands you the link to open the pull request."
              />
              <p>
                The plain push failed because your branch had no upstream yet, the
                branch on GitHub it&apos;s linked to. <code>-u origin feat/fin-week-staging</code>, short for{" "}
                <code>--set-upstream</code>, creates the branch on{" "}
                <code>origin</code>{" "}and links your local branch to it. You only
                do this once per branch. After that, a plain <code>git push</code>{" "}
                works.
              </p>
              <p>
                On the real project, your first push also asks you to sign in to
                GitHub. On Windows, Git Credential Manager opens a browser sign-in.
                In Codespaces you&apos;re already signed in. On macOS, GitHub
                won&apos;t accept your account password in the terminal, so install
                Git Credential Manager or ask the team which route they use. Your
                first PR course walks through it.
              </p>
              <p>
                Until you push, your work exists only on your machine. Pushing is
                the moment it&apos;s shared.
              </p>
            </>
          ),
        },
        {
          id: "review",
          title: "7 · During review, commit and push again",
          body: (
            <>
              <p>
                To answer review, commit on the same branch and push again. The PR
                picks up the new commit. Say you open a draft PR, mark it ready, and
                a reviewer asks you to rename a column. Make the edit, then stage,
                commit, check and push, as before.
              </p>
              <TryIt
                initialState={{
                  working: ["fin_week.sql"],
                  staged: [],
                  branch: ["3f2a1c9 · 2 files"],
                  origin: ["3f2a1c9 · 2 files"],
                }}
                stages={[
                  {
                    cmd: "git add -u",
                    out: ``,
                    state: {
                      working: [],
                      staged: ["fin_week.sql"],
                      branch: ["3f2a1c9 · 2 files"],
                      origin: ["3f2a1c9 · 2 files"],
                    },
                  },
                  {
                    cmd: 'git commit -m "fix: rename week column after review"',
                    out: `[feat/fin-week-staging 8b4e2d1] fix: rename week column after review
 1 file changed, 2 insertions(+), 2 deletions(-)`,
                    state: {
                      working: [],
                      staged: [],
                      branch: ["3f2a1c9 · 2 files", "8b4e2d1 · 1 file"],
                      origin: ["3f2a1c9 · 2 files"],
                    },
                  },
                  {
                    cmd: "git status",
                    prompt: "is the new commit on GitHub yet? ask status",
                    out: `On branch feat/fin-week-staging
Your branch is ahead of 'origin/feat/fin-week-staging' by 1 commit.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean`,
                  },
                  {
                    cmd: "git push",
                    prompt: "the branch already has an upstream, so plain push works",
                    out: `Enumerating objects: 11, done.
Writing objects: 100% (6/6), 618 bytes, done.
To https://github.com/wnl-icb-analytics/dbt-analytics.git
   3f2a1c9..8b4e2d1  feat/fin-week-staging -> feat/fin-week-staging`,
                    state: {
                      working: [],
                      staged: [],
                      branch: ["3f2a1c9 · 2 files", "8b4e2d1 · 1 file"],
                      origin: ["3f2a1c9 · 2 files", "8b4e2d1 · 1 file"],
                    },
                  },
                ]}
                done="The PR picked up 8b4e2d1 by itself, and the checks run again. Reply in the review thread to say what changed."
              />
              <p>
                &quot;Ahead by 1 commit&quot; is status comparing your branch with{" "}
                <code>origin/feat/fin-week-staging</code>, your clone&apos;s record
                of the branch on GitHub. The push brings the two level again. The
                PR follows the branch, so you don&apos;t need a new PR or a new
                branch for each comment.
              </p>
              <p>
                <strong>Don&apos;t force-push a branch under review.</strong>{" "}A
                force-push replaces the branch on GitHub with your copy. Reviewers
                lose their place, and any commit added on GitHub since your last
                pull is gone. You won&apos;t need one, because the squash merge
                tidies the history anyway.
              </p>
              <p>
                You don&apos;t need to keep your branch up to date with main. The
                merge queue tests your change against the latest main before it
                merges. If you need a colleague&apos;s newer change, select{" "}
                <em>Update branch</em>{" "}on the PR page. That adds a commit on
                GitHub your machine doesn&apos;t have, so pull before you edit
                again. Do the same when you come back to the branch the next day.
              </p>
              <CodeBlock
                lang="bash"
                code={`
git switch feat/fin-week-staging
git pull
`}
              />
              <p>
                If GitHub reports a conflict, the walkthrough{" "}
                <Link href="/practice/undoing-changes">Undoing things in git</Link>{" "}
                shows how to resolve it. The first time, ask a colleague to sit
                with you.
              </p>
            </>
          ),
          check: {
            prompt: "A reviewer asks for a change to your open PR. What do you do?",
            options: [
              "Commit the change on the same branch and push. The PR updates itself",
              "Open a new PR from a new branch with the change in it",
              "Amend the old commit and force-push so the history stays tidy",
              "Reply in the thread and wait for the reviewer to make the edit",
            ],
            answer: 0,
            explain:
              "The PR follows its branch, so a new commit and a push update it and re-run the checks, with the review history in one place. Force-pushing loses reviewers' place, and the squash merge tidies the history anyway.",
            affirm: "same branch, new commit, push. No force-push under review.",
          },
        },
        {
          id: "after-merge",
          title: "8 · After merge, back to main",
          body: (
            <>
              <p>
                After the merge, switch back to main, pull the merged change and
                delete your local branch. Say the reviewer approves, you select
                Merge when ready, and the PR page says <strong>Merged</strong>.
                GitHub has squashed your two commits into one new commit on main
                and deleted the branch on its side.
              </p>
              <TryIt
                stages={[
                  {
                    cmd: "git switch main",
                    out: `Switched to branch 'main'
Your branch is up to date with 'origin/main'.`,
                    prompt: "leave the finished branch and go back to main",
                  },
                  {
                    cmd: "git pull",
                    prompt: "that \"up to date\" is an old record again, so pull",
                    out: `From https://github.com/wnl-icb-analytics/dbt-analytics
   e43d0af..c71f5e2  main       -> origin/main
Updating e43d0af..c71f5e2
Fast-forward
 .../stg_reference_lookup_ncl_fin_week_number_2019_2031.sql |  4 ++--
 .../stg_reference_lookup_ncl_fin_week_number_2019_2031.yml | 32 ++++++++++++++++
 2 files changed, 34 insertions(+), 2 deletions(-)
 create mode 100644 models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.yml`,
                  },
                  {
                    cmd: "git branch -d feat/fin-week-staging",
                    prompt: "delete your local copy of the finished branch",
                    out: `warning: deleting branch 'feat/fin-week-staging' that has been merged to
         'refs/remotes/origin/feat/fin-week-staging', but not yet merged to HEAD
Deleted branch feat/fin-week-staging (was 8b4e2d1).`,
                  },
                ]}
                done="Main now holds your change as commit c71f5e2, and the old branch is gone. You're ready for the next task."
              />
              <p>
                <code>git branch -d</code>{" "}only deletes a branch whose commits
                are safe somewhere else, and the warning says what it checked.
                Your branch&apos;s commits all match your clone&apos;s record of
                the GitHub branch, so nothing is lost. They aren&apos;t on main
                itself, because the squash merge made a new commit instead.
              </p>
              <p>
                If your clone has already dropped its record of the GitHub
                branch, <code>-d</code>{" "}refuses with &quot;not fully
                merged&quot;. That&apos;s normal after a squash merge. The
                walkthrough{" "}
                <Link href="/practice/review-and-merge">Review &amp; merge</Link>{" "}
                shows how to check the PR holds everything before you force the
                delete with <code>-D</code>.
              </p>
              <p>
                The next task starts back at step 1, with a fresh branch from the
                main you just pulled.
              </p>
            </>
          ),
          check: {
            prompt:
              "`git branch -d` deletes your merged branch with a warning. What did git check first?",
            options: [
              "That the branch's commits are all in its GitHub branch, as your clone last saw it",
              "That a reviewer approved the PR",
              "That production deployed successfully",
              "Nothing. -d always deletes the branch",
            ],
            answer: 0,
            explain:
              "-d refuses to delete a branch whose commits aren't safe in its upstream branch, or in the branch you're on if it has no upstream. It knows nothing about reviews or deployments. -D skips the check.",
            affirm: "-d checks the commits are safe elsewhere. -D skips that check.",
          },
        },
        {
          id: "loop",
          title: "The working loop in one block",
          body: (
            <>
              <p>
                These are the working loop&apos;s commands in order, from a fresh
                main back to main.
              </p>
              <WorkingLoop variant="course" />
              <p>
                Update main, make one branch per piece of work, then status, add
                and commit as you go. Push at least once a day. Answer review
                with new commits on the same branch. After the merge, go back to
                main and start again. The{" "}
                <Link href="/learn/git-and-prs#the-working-loop">Git &amp; pull
                requests</Link>{" "}chapter explains each stage.
              </p>
              <p>
                <code>git status</code>{" "}lists file names, not content.{" "}
                <code>git diff --staged</code>{" "}shows exactly what the next
                commit will record. Before you mark the PR ready, read its{" "}
                <em>Files changed</em>{" "}tab. It shows everything your branch
                would add to main.
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
              "Commit is local. The snapshot is safe on your branch, but only push sends it to GitHub. And nothing reaches main until a pull request is merged.",
            affirm: "commit saves locally. Push is what shares it.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "tools-do-the-typing",
      title: "Tools that run Git for you",
      blurb: "VS Code, AI assistants, and what stays your job",
      minutes: 6,
      steps: [
        {
          id: "vscode",
          body: (
            <>
              <p>
                VS Code&apos;s <strong>Source Control</strong>{" "}view runs the same
                commands as buttons, so you&apos;ll rarely type them. It&apos;s the
                branching icon in the left-hand bar.
              </p>
              <ul>
                <li>The list of changed files is <code>git status</code>. Click a file to see its diff.</li>
                <li>The <strong>+</strong>{" "}next to a file stages it, like <code>git add</code>.</li>
                <li>The message box and <strong>Commit</strong>{" "}button run <code>git commit</code>.</li>
                <li><strong>Publish Branch</strong>{" "}does a new branch&apos;s first push. <strong>Sync Changes</strong>{" "}runs <code>git pull</code>, then <code>git push</code>.</li>
                <li>The branch name in the status bar at the bottom switches branches, like <code>git switch</code>.</li>
              </ul>
            </>
          ),
        },
        {
          id: "agents",
          title: "AI assistants can run the loop, and you check what they did",
          body: (
            <>
              <p>
                AI coding assistants can stage, commit and push from a plain
                instruction like &quot;commit this as a fix and push it&quot;, and
                write a decent commit message too. Use them, but{" "}
                <strong>you&apos;re accountable for what lands on the branch</strong>.
                That&apos;s why this course taught you the commands.
                Knowing what add, commit and push do is how you check what a tool
                did for you. It&apos;s also how you notice when it staged a file
                you never meant to share.
              </p>
            </>
          ),
          check: {
            prompt:
              "An AI assistant commits and pushes for you. What's your job before trusting it?",
            options: [
              "Nothing, because the assistant validated it",
              "Check what was actually committed (the diff and the file list), because you are accountable for it",
              "Re-type the commands yourself to make it official",
              "Ask the assistant to confirm twice",
            ],
            answer: 1,
            explain:
              "Tools handle the mechanics. You own the decisions and the outcome. git status only lists file names, so read the content too. Use git diff --staged before a commit, and the PR's Files changed tab before you mark it ready. That's how you keep ownership while the tools do the typing.",
            affirm: "tools type the commands, but the diff is still yours to own.",
          },
        },
        {
          id: "wrap",
          title: "Next, Understanding dbt and Your first PR",
          body: (
            <>
              <p>
                You&apos;ve covered the Git you need for day-to-day work on this
                project. That&apos;s repos, branches, commits, pushes, PRs and
                merges. Next,{" "}
                <strong>Understanding dbt</strong>{" "}shows what dbt is and why the
                project is shaped the way it is. It&apos;s all pictures and
                questions, with nothing to install. After that,{" "}
                <strong>Your first PR</strong>{" "}puts both together on the real
                repository, including the one-off setup for signed commits.
              </p>
            </>
          ),
        },
      ],
    },
  ],
};
