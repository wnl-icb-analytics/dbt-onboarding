import Link from "next/link";
import type { Course } from "@/lib/course-types";
import { AnnotatedCode } from "@/components/AnnotatedCode";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { FolderPicker } from "@/components/FolderPicker";
import { TryIt } from "@/components/TryIt";
import { DbtExecutionFlow } from "@/components/DbtExecutionFlow";
import { CommandDAG } from "@/components/CommandDAG";
import { CommandLab } from "@/components/CommandLab";
import { SelectorPlayground } from "@/components/SelectorPlayground";
import { ProjectFilesMap } from "@/components/ProjectFilesMap";
import { SourceSetupFlow } from "@/components/SourceSetupFlow";
import { SetupDeviceGuide } from "@/components/SetupDeviceGuide";
import { CommitSigningGuide } from "@/components/CommitSigningGuide";

export const FIRST_PR_COURSE: Course = {
  slug: "first-pr",
  title: "Your first PR",
  tagline: "A guided mechanics lab: from a blank machine to a merged staging model",
  audience:
    "Hands-on, at your own machine. Assumes Git essentials and Understanding dbt (or equivalent experience). This course deliberately uses one missing staging model to teach the mechanics cleanly; most later work will discover, change and compose existing domain models. Best done with real access in your first week.",
  hours: "~3.5 hrs hands-on",
  accent: "var(--layer-reporting)",
  lessons: [
    // ------------------------------------------------------------------
    {
      slug: "set-up-your-machine",
      waypoint: "set up",
      title: "Set up your development environment",
      blurb: "Windows, macOS or Codespaces, ending with a green dbt debug",
      minutes: 30,
      steps: [
        {
          id: "before",
          body: (
            <>
              <p>
                This course is hands-on: every lesson is <em>do this → you should
                see this → here&apos;s why</em>. Before starting you need three
                things from your team lead: a GitHub account added to the org,
                Snowflake access with the analyst role or higher, and the connection
                details (account identifier, username, role and warehouse).
              </p>
              <p>
                Setup is the slowest part of the whole course — and you only ever do
                it once.
              </p>
            </>
          ),
        },
        {
          id: "install",
          title: "Choose your setup path",
          body: (
            <>
              <p>
                Setup differs slightly between managed Windows laptops, Macs and a
                browser-based Codespace. Pick the environment you will actually use;
                the guide will show only the relevant commands.
              </p>
              <SetupDeviceGuide />
            </>
          ),
          interact: true,
        },
        {
          id: "script",
          title: "What the project just set up",
          body: (
            <>
              <p>
                All three routes prepare the same project: the pinned dbt Fusion engine,
                Git hooks, dbt packages, the recommended editor extensions and the
                optional Python environment used by helper scripts. dbt itself is the
                Fusion executable; it is not installed into the Python environment.
              </p>
              <p>
                On Windows and macOS, opening a terminal from the workspace launches
                <code>start_dbt.ps1</code>{" "}or <code>start_dbt.sh</code>{" "}and guides
                you through creating a local <code>.env</code>. Codespaces runs its
                devcontainer setup once when the cloud environment is created and reads
                your Snowflake values from Codespaces secrets instead.
              </p>
              <Callout kind="warn" title="Credentials stay outside Git">
                <p>
                  Local credentials live in the ignored <code>.env</code>{" "}file;
                  Codespaces credentials live in GitHub&apos;s encrypted secret store.
                  Neither belongs in SQL, YAML, comments, screenshots, commit messages
                  or pull requests.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt: "Where should Snowflake credentials live?",
            options: [
              "In profiles.yml so every developer receives them",
              "In an ignored local .env, or in Codespaces secrets for a cloud workspace",
              "In the pull request description while setup is reviewed",
              "In dbt_project.yml because dbt needs them",
            ],
            answer: 1,
            explain:
              "Local setup keeps credentials in the ignored .env file. Codespaces injects encrypted user secrets as environment variables. Neither route commits them to Git.",
            affirm: "credentials come from the environment — never from tracked project files.",
          },
        },
        {
          id: "files-map",
          title: "The four files around the project",
          body: (
            <>
              <p>
                Your <code>.env</code>{" "}is one of four names you will keep
                meeting. Each has exactly one job — click through:
              </p>
              <ProjectFilesMap />
              <p>
                One word trap: <code>target: dev</code>{" "}in{" "}
                <code>profiles.yml</code>{" "}names a Snowflake connection, while{" "}
                <code>target/</code>{" "}with a slash is the generated folder on
                your machine. Same word, different jobs — the slash is the
                clue.
              </p>
            </>
          ),
          check: {
            prompt: "You want to inspect the SQL dbt actually compiled on your machine. Where do you look?",
            options: ["`.env`", "`profiles.yml`", "`target/compiled/`", "`dbt_project.yml`"],
            answer: 2,
            explain:
              "target/ is dbt's generated output folder; compiled SQL sits under target/compiled/. You inspect it, never edit it.",
            affirm: "target/ holds generated output — compiled SQL included.",
          },
        },
        {
          id: "signing",
          title: "Do: set up commit signing (one-off)",
          body: (
            <>
              <p>
                This repo requires commits to be <em>signed</em> — cryptographic
                proof that a commit really came from you. Choose your environment for
                the correct one-time setup:
              </p>
              <CommitSigningGuide />
            </>
          ),
        },
        {
          id: "debug",
          title: "Do: prove the connection works",
          body: (
            <>
              <CodeBlock lang="bash" code={`dbt debug`} />
              <p>
                <strong>You should see:</strong>{" "}a series of checks ending in{" "}
                <strong>“All checks passed!”</strong>. Local setup may open a browser
                window for Snowflake sign-in; Codespaces uses the PAT stored in your
                Codespaces secrets.
              </p>
              <p>
                <strong>If it fails:</strong>{" "}check the connection values for your
                route: <code>.env</code>{" "}on Windows or macOS, or GitHub Codespaces
                secrets in the cloud route. A mistyped account identifier, unavailable
                role or missing PAT causes most first-day connection failures.
              </p>
              <p>
                Green? Your development environment is ready. Everything from here is
                the actual work.
              </p>
            </>
          ),
          check: {
            prompt: "`dbt debug` fails to connect. Where do you look first?",
            options: [
              "Reinstall dbt",
              "The connection values: local `.env` or Codespaces secrets, depending on your route",
              "Snowflake's status page",
              "The `dbt_project.yml` file",
            ],
            answer: 1,
            explain:
              "dbt debug tests connection and configuration. Local routes read .env; Codespaces reads injected secrets. Check the account, user, role, warehouse and authentication value for the route you chose, then retry.",
            affirm: "when dbt cannot connect, check the environment values for your setup route.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "pick-your-table",
      waypoint: "pick data",
      title: "Pick your table",
      blurb: "Choose familiar data and state its grain",
      minutes: 12,
      steps: [
        {
          id: "familiar",
          body: (
            <>
              <p>
                You are about to build your first model. The single best decision
                you can make now: <strong>build it on data you already know</strong>{" "}
                — a reference table you maintain, a feed you have queried for
                reports. You are learning dbt&apos;s mechanics; don&apos;t make
                yourself learn an unfamiliar dataset at the same time.
              </p>
              <Callout kind="info" title="This is a mechanics exercise">
                <p>
                  A missing staging model gives you a bounded way to practise files,
                  YAML, builds, tests and Git. It is not the default starting point for
                  normal analytical requests. In the mature project, those should begin
                  by finding and composing the domain models that already exist.
                </p>
              </Callout>
              <p>
                Your existing judgement is the test harness: you can glance at the
                output and know whether it looks right.
              </p>
            </>
          ),
        },
        {
          id: "grain",
          title: "Do: state the grain in one sentence",
          body: (
            <>
              <p>
                Before any SQL, answer: <strong>one row per what?</strong>{" "}One row
                per site per weekday? Per patient per referral per week? Write the
                sentence down — it decides your tests later, and not being able to
                say it is the signal you don&apos;t know the table well enough yet.
              </p>
              <p>
                <strong>You should have:</strong>{" "}a table in mind, and its grain in
                one sentence. The rest of the course uses a practice-opening-hours
                reference table (“one row per site per day of week”) as its example —
                substitute yours throughout.
              </p>
            </>
          ),
          check: {
            prompt: "Why insist on stating the grain before writing SQL?",
            options: [
              "dbt requires it in configuration",
              "It defines what unique means for this table — which becomes your most important test",
              "It determines which warehouse the model uses",
              "It is needed for the file name",
            ],
            answer: 1,
            explain:
              "The grain is the table's contract: one row per what. Your grain test (next lessons) asserts it forever — and a join that breaks it is the most common serious modelling bug.",
            affirm: "one row per what — the grain sentence becomes your most important test.",
          },
        },
        {
          id: "branch",
          title: "Do: branch from fresh main",
          body: (
            <>
              <p>
                You know what you are building, so create the branch before changing
                project files. First make sure the working tree is clean, then update{" "}
                <code>main</code>{" "}and branch from that latest commit:
              </p>
              <CodeBlock
                lang="bash"
                code={`git status
git switch main
git pull
git switch -c feat/opening-hours-staging`}
              />
              <p>
                Replace <code>opening-hours-staging</code>{" "}with a short description of
                your model. From this point onward, every edit in the course should be
                on that feature branch. If <code>git status</code>{" "}is not clean, stop
                before pulling and work out what those existing changes are.
              </p>
              <p>
                <strong>You should see:</strong>{" "}
                <code>Switched to a new branch</code>, followed by your branch name.
              </p>
            </>
          ),
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "find-or-add-the-source",
      waypoint: "find source",
      title: "Find your source",
      blurb: "1,500+ models already exist — your input is almost certainly one of them",
      minutes: 10,
      steps: [
        {
          id: "start",
          title: "Start from what already exists",
          body: (
            <>
              <p>
                The project already holds more than 1,500 tested models. Before you
                write anything, the first job is not to build — it is to{" "}
                <strong>find</strong>{" "}what is already there. Your staging model will
                read from a <strong>raw model</strong>: a generated, 1:1 cleaned view
                of a source table. You never write raw models by hand — the source
                pipeline generates them — so your job is to find the raw model for
                your table and build staging on top of it with <code>ref()</code>.
              </p>
              <SourceSetupFlow />
              <p>
                The diagram shows where a raw model comes from. The detail that
                matters for your first PR is the last box: the <strong>raw layer is
                always generated</strong>, never edited by hand. How a table earns a
                raw model in the first place — the source registry, manual versus
                automatic schemas, the generation pipeline — is a larger,
                project-specific topic the handbook covers in full.
              </p>
            </>
          ),
        },
        {
          id: "search",
          title: "Search before you build",
          body: (
            <>
              <p>
                Start with the table&apos;s three-part Snowflake address. For the worked
                example it is:
              </p>
              <CodeBlock
                lang="text"
                code={`DATA_LAKE__NCL.ANALYST_MANAGED.OPENING_HOURS`}
              />
              <p>
                In VS Code press <code>Ctrl+P</code>{" "}(<code>⌘P</code>{" "}on a
                Mac) to open the file search, and search in this order.
                Zeroth, before any of it: type the <em>concept</em>{" "}itself —
                the naming grammar means an existing <code>dim_</code>,{" "}
                <code>int_</code>{" "}or <code>fct_</code>{" "}model for your idea
                shows up by name, and finding one can change (or finish) your
                plan. Then:
              </p>
              <ol>
                <li>
                  <code>stg_reference_opening_hours</code>{" "}— the staging model. If it
                  already exists, your work may be done: reuse it, don&apos;t duplicate it.
                </li>
                <li>
                  <code>raw_reference_opening_hours</code>{" "}— the raw model. This is the
                  input your staging model will <code>ref()</code>.
                </li>
                <li>
                  Search <code>OPENING_HOURS</code>{" "}across the repo to catch an
                  unexpected existing name.
                </li>
              </ol>
              <p>
                For the worked example the raw model exists but no staging model does
                yet — so staging is exactly the gap your first PR fills. Preview the
                raw input and note its cleaned, snake_case columns; those are what you
                will select from:
              </p>
              <CodeBlock lang="bash" code={`dbt show -s raw_reference_opening_hours`} />
              <Callout kind="warn" title="Know where query output goes">
                <p>
                  <code>dbt show</code>{" "}executes the query and prints rows. When a
                  coding agent runs it, its provider can receive that output. Use it
                  there only for a query designed to return a high-level,
                  non-identifying aggregate. Do not use a coding agent to preview model
                  rows. Inspect those in an approved human-controlled tool.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt:
              "You find a `raw_` model for your table but no `stg_` model. What is the first-PR move?",
            options: [
              "Build your staging model on top of the existing raw model with `ref()`",
              "Regenerate the raw model first, to be safe",
              "Edit the raw model to add the columns you need",
              "Add the table as a new source before doing anything",
            ],
            answer: 0,
            explain:
              "The raw model is your input, and staging is the missing piece — writing it is exactly what your first PR is for. Raw models are generated, so you never edit or regenerate them by hand.",
            affirm: "find the raw model, then build staging on top of it with ref().",
          },
        },
        {
          id: "no-raw",
          title: "No raw model yet?",
          body: (
            <>
              <p>
                Occasionally a table has no raw model because its source has never been
                added to the project. Adding one is a bigger, more project-specific job:
                finding the schema in{" "}
                <code>scripts/sources/source_mappings.yml</code>, deciding between a
                manual and an automatic schema, and running the generation pipeline. It
                is worth learning — just not the best thing to spend your very first PR on.
              </p>
              <Callout kind="info" title="Pick a table that already has a raw model">
                <p>
                  With 1,500+ models, most tables you would reach for already have one.
                  For your first PR, choose one of those and let the win be the staging
                  model you write. When you do need to add a source, the handbook&apos;s{" "}
                  <strong>Find your source</strong>{" "}field guide walks the whole route —
                  the registry, manual versus automatic schemas and the pipeline — and
                  assumes the dbt basics this course gives you.
                </p>
              </Callout>
            </>
          ),
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "where-does-it-go",
      waypoint: "place it",
      title: "Where does it go?",
      blurb: "Layers × domains: choosing the folder (it chooses your config)",
      minutes: 12,
      steps: [
        {
          id: "why-folders",
          body: (
            <>
              <p>
                In this project, the folder you put a file in is not tidiness — it{" "}
                <strong>is</strong>{" "}configuration. The folder decides whether your
                model builds as a view or table, which database and schema it lands
                in, what tags and governance hooks it gets. Choose the folder and
                you have configured the model.
              </p>
              <p>
                The choice is two simple questions: which <strong>layer</strong>{" "}
                (what job is the model doing) and which <strong>domain</strong>{" "}
                (what data is it about).
              </p>
              <Callout kind="info" title="Raw and staging share the STAGING database">
                <p>
                  Raw models all build in <code>STAGING.DBT_RAW</code>. Staging models
                  use a proper schema for the source or domain, such as
                  <code>STAGING.OLIDS</code>{" "}or <code>STAGING.REFERENCE</code>.
                  Development mirrors the same layout in <code>DEV__STAGING</code>.
                </p>
              </Callout>
            </>
          ),
        },
        {
          id: "picker",
          title: "Try it",
          body: (
            <>
              <FolderPicker />
              <p>
                For our worked example — cleaning one reference table about sites —
                the answers are <em>staging</em> + <em>shared reference</em>:{" "}
                <code>models/staging/shared/</code>, file starting{" "}
                <code>stg_</code>.
              </p>
            </>
          ),
          check: {
            prompt:
              "You're building a model that joins GP observations to derive a reusable smoking-status block. Folder?",
            options: [
              "`models/staging/olids/` — it reads staged data",
              "`models/modelling/olids/` — joins and reusable derivations are modelling-layer work",
              "`models/reporting/olids/` — analysts will use it",
              "`models/modelling/commissioning/` — derivations live under commissioning",
            ],
            answer: 1,
            explain:
              "Job first: deriving reusable smoking status is modelling work. Staging joins are reserved for universal source cleaning, standardisation or enrichment; reporting assembles analyst-facing datasets that can ref() this block.",
            affirm: "the job picks the layer, the data picks the domain.",
          },
        },
        {
          id: "name",
          title: "Do: create the file",
          body: (
            <>
              <p>
                Name = layer prefix + source + table, matching the raw model:
              </p>
              <CodeBlock
                lang="text"
                code={`models/staging/shared/stg_reference_opening_hours.sql`}
              />
              <p>
                <strong>You should have:</strong>{" "}an empty <code>.sql</code>{" "}file in
                the right folder. That empty file is already configured — the
                staging folder will make it a view in the staging schema.
              </p>
            </>
          ),
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "write-the-model",
      waypoint: "model",
      title: "Write the model",
      blurb: "One SELECT, project style, previewed as you go",
      minutes: 25,
      steps: [
        {
          id: "write",
          body: (
            <>
              <p>
                A staging model is one SELECT from the raw model: explicit columns,
                light cleaning, renames to conventions. Here is the worked example —
                every choice in it is deliberate, and each explanation sits on the
                line it belongs to. Tap the numbers, then write yours:
              </p>
              <AnnotatedCode
                lang="sql"
                title="stg_reference_opening_hours.sql"
                segments={[
                  {
                    code: "select",
                    note: "Lowercase keywords (the linter in CI checks it), and explicit columns — never select *. The column list is the interface downstream models rely on; with *, a source change slips through unannounced.",
                  },
                  { code: "    organisation_code," },
                  {
                    code: "    upper(trim(site_code)) as site_code,",
                    note: "Light cleaning and renames to conventions happen here, once — every downstream model inherits them. Identifiers end _id, dates _date, timestamps _at; CodeRabbit flags departures on every PR.",
                  },
                  { code: "    day_of_week," },
                  {
                    code: "    opens_at::time as opens_at,\n    closes_at::time as closes_at,",
                    note: "Casting text to real types is staging work. Do it here and nobody downstream ever parses a string again.",
                  },
                  {
                    code: "    is_open_24h::boolean as is_open_24h",
                    note: "Booleans are named is_ or has_ — a reader knows what the column holds from the name alone.",
                  },
                  {
                    code: "from {{ ref('raw_reference_opening_hours') }}",
                    note: "ref(), never a hardcoded table — dbt fills in the right database per environment and records the dependency. And exactly one table, no filters with business meaning: the moment you want either, that is a modelling-layer (int_) model instead.",
                  },
                ]}
              />
            </>
          ),
        },
        {
          id: "inside-a-command",
          title: "What a dbt command actually does",
          body: (
            <>
              <p>
                You are about to run dbt against your model, so it is worth
                seeing the three moves inside every command. Click each one:
              </p>
              <DbtExecutionFlow />
              <p>
                The split that matters: parse and compile only read and render
                — they cannot touch Snowflake. Only execution does warehouse
                work. That is why <code>dbt compile</code>{" "}is always safe, and
                why it is your window into what dbt generated whenever a{" "}
                <code>ref()</code>{" "}or macro surprises you.
              </p>
            </>
          ),
          check: {
            prompt: "Which command shows the rendered SQL without building anything?",
            options: ["`dbt build`", "`dbt compile`", "`dbt test`", "`dbt debug`"],
            answer: 1,
            explain:
              "compile stops after rendering: templates become plain SQL, and nothing is created in Snowflake.",
            affirm: "compile reveals the SQL dbt generated — nothing is built.",
          },
        },
        {
          id: "preview",
          title: "Do: look at it before building it",
          body: (
            <>
              <CodeBlock
                lang="bash"
                code={`
dbt show -s stg_reference_opening_hours    # run the SELECT, print 5 rows
dbt compile                                # render every model to plain SQL
`}
              />
              <p>
                <strong>You should see:</strong>{" "}five sensible-looking rows from{" "}
                <code>dbt show</code>; and <code>dbt compile</code>{" "}finishing in
                seconds with no errors. While you type, the dbt extension is doing
                the same checking live — a red underline now is an error{" "}
                <code>dbt build</code>{" "}would have given you later.
              </p>
              <p>
                <strong>If show fails:</strong>{" "}read the message — a misspelled{" "}
                <code>ref()</code>{" "}names the model it can&apos;t find; a SQL error
                points at the line.
              </p>
            </>
          ),
          check: {
            prompt: "Why explicit columns rather than `select *` in staging?",
            options: [
              "`select *` is slower in Snowflake",
              "The column list is the interface downstream models depend on — * silently changes when the source does",
              "dbt cannot compile `select *`",
              "It makes the file longer, which reviewers prefer",
            ],
            answer: 1,
            explain:
              "With *, a new upstream column appears downstream unannounced, and a removed one breaks consumers without warning. Naming columns makes the model's contract explicit and changes deliberate.",
            affirm: "explicit columns are the contract downstream models rely on.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "describe-and-test",
      waypoint: "YAML",
      title: "Describe and test it",
      blurb: "Eight lines of YAML, written by hand, that work forever",
      minutes: 20,
      steps: [
        {
          id: "why-yaml",
          body: (
            <>
              <p>
                Next to your <code>.sql</code>{" "}goes a <code>.yml</code>{" "}file with
                the same name. It does three jobs: names an owner, documents the
                columns, and declares <strong>tests</strong> — assertions checked on
                every build, forever. CI requires it; more importantly, it is where
                your knowledge of the data gets written down.
              </p>
              <p>
                Write it by hand — it is short, and writing it is how you make the
                decisions it contains. Tap the numbers to see what each part is
                for:
              </p>
              <AnnotatedCode
                lang="yaml"
                title="stg_reference_opening_hours.yml"
                segments={[
                  { code: "models:\n  - name: stg_reference_opening_hours" },
                  {
                    code: "    description: Site opening hours reference, one row per site per day of week",
                    note: "The description states the grain — one row per what. It ends up in dbt docs and as a comment on the Snowflake object.",
                  },
                  {
                    code: "    config:\n      meta:\n        owner:\n          name: Your Name",
                    note: "Every model names a human owner; CI checks it. This is who a reviewer or a 2 am incident asks about the model.",
                  },
                  {
                    code: "    data_tests:\n      - dbt_utils.unique_combination_of_columns:\n          arguments:\n            combination_of_columns: [site_code, day_of_week]",
                    note: "Your one-sentence grain, turned into the single most valuable test you can write: it fails the moment anything — a dirty feed, a future join — duplicates rows.",
                  },
                  {
                    code: "    columns:\n      - name: site_code\n        description: Standardised site identifier\n        data_tests: [not_null]\n      - name: day_of_week\n        description: ISO day of week (1 = Monday)\n        data_tests: [not_null]",
                    note: "not_null on the key columns the grain depends on — a null here would make the grain test meaningless. Column descriptions travel to docs and Snowflake too.",
                  },
                ]}
              />
            </>
          ),
        },
        {
          id: "anatomy",
          title: "How much is enough?",
          body: (
            <>
              <p>
                Three tests is right for a staging model: the grain test, and{" "}
                <code>not_null</code>{" "}on the columns the grain depends on. Every
                test compiles to a query that hunts for violating rows — zero rows
                back means pass.
              </p>
              <p>
                Resist the urge to test everything. A test that cannot fail
                meaningfully is noise; the grain test is the one that catches real
                accidents, which is why it gets written first.
              </p>
            </>
          ),
          check: {
            prompt:
              "Your grain is one row per site per weekday. Which single test catches a future join accidentally duplicating rows?",
            options: [
              "`not_null` on `site_code`",
              "`unique` on `site_code`",
              "`unique_combination_of_columns` on `[site_code, day_of_week]`",
              "A row-count test",
            ],
            answer: 2,
            explain:
              "unique on site_code alone would fail now (each site has 7 rows). Only the combination test matches your actual grain — and it fires the moment anything fans the table out.",
            affirm: "test the combination — that's what your grain actually is.",
          },
        },
        {
          id: "agents",
          title: "On tooling and agents",
          body: (
            <>
              <p>
                AI assistants write competent YAML, and a generator command exists
                that scaffolds the column list from the built model (see the command
                reference). Use either to save typing — but notice what cannot be
                delegated: <em>what is the grain, which columns matter, what does
                null mean here</em>. Those are your decisions; tools are the junior
                partner that types them up.
              </p>
            </>
          ),
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "build-and-test",
      waypoint: "build",
      title: "Build it",
      blurb: "run, test, build and selectors — learned on your own model",
      minutes: 35,
      steps: [
        {
          id: "build",
          body: (
            <>
              <CodeBlock lang="bash" code={`dbt build -s stg_reference_opening_hours`} />
              <p>
                <code>build</code> = run the model <em>and</em>{" "}its tests, in
                order, in the <strong>DEV__ databases</strong> — the shared
                development copy of the warehouse. Nothing you do here touches
                production.
              </p>
              <p>
                <strong>You should see:</strong>
              </p>
              <CodeBlock
                lang="text"
                code={`
1 of 4 OK created sql view model ...stg_reference_opening_hours  [SUCCESS]
2 of 4 PASS not_null_..._site_code                               [PASS]
3 of 4 PASS not_null_..._day_of_week                             [PASS]
4 of 4 PASS dbt_utils_unique_combination_of_columns_...          [PASS]
Completed successfully
`}
              />
            </>
          ),
        },
        {
          id: "run-test-build",
          title: "Why build, and not run?",
          body: (
            <>
              <p>
                Three commands sound alike. The quickest way to tell them apart
                is to watch the same small project react to each — run all
                three:
              </p>
              <CommandDAG />
              <p>
                <code>run</code>{" "}creates without testing; <code>test</code>{" "}
                tests without creating; <code>build</code>{" "}does both, in DAG
                order — and, as the build run just showed, a failing test stops
                the spread downstream without rolling back the model itself.
                For everyday model work, build is the answer.
              </p>
            </>
          ),
          check: {
            prompt: "`dbt run -s your_model` finishes green. What has it proved?",
            options: [
              "The model was created — but its data tests have not run",
              "The model and all its tests passed",
              "The whole project is healthy",
              "Nothing — run is a dry run",
            ],
            answer: 0,
            explain:
              "run only creates. A green run with a broken grain is still broken — which is why build, which adds the tests, is the everyday command.",
            affirm: "run creates; build creates and tests.",
          },
        },
        {
          id: "fail",
          title: "If a test fails",
          body: (
            <>
              <p>
                A FAIL line prints the count of violating rows. This is not a
                setback — <strong>your test just told you something true about the
                data</strong>{" "}that nobody had written down. The usual first-model
                discoveries:
              </p>
              <Callout kind="warn" title="The model has already been built">
                <p>
                  Build first, then test: a failing test does not roll the
                  relation back. The rows that failed are in your dev table, and
                  anything querying that model directly can see them — dbt only
                  stops them spreading downstream.
                </p>
              </Callout>
              <ul>
                <li>
                  <strong>Grain test fails</strong> — the source has duplicates you
                  didn&apos;t expect. Investigate: is your grain sentence wrong, or
                  is the feed dirty? Either answer is progress.
                </li>
                <li>
                  <strong>not_null fails</strong> — nulls are real. Decide whether
                  the column is genuinely optional (drop the test, document the
                  meaning of null) or the rows are junk worth flagging to the team.
                </li>
              </ul>
              <p>
                Investigate with <code>dbt show -s your_model --limit 20</code>, or
                run the failing test&apos;s compiled SQL from{" "}
                <code>target/compiled/</code>{" "}to see the exact offending rows.
              </p>
            </>
          ),
          check: {
            prompt:
              "Your grain test fails with 14 duplicate site/day pairs. What does that mean?",
            options: [
              "Your YAML is misconfigured",
              "dbt built the model twice",
              "The data genuinely contains duplicates your grain didn't expect — investigate before changing anything",
              "Snowflake's cache is stale; rebuild",
            ],
            answer: 2,
            explain:
              "The test ran a real query against real rows. Either your understanding of the grain is incomplete or the feed has a quality issue — both are findings worth a sentence in your PR description.",
            affirm: "a failing test is information about the data, not a verdict on you.",
          },
        },
        {
          id: "green",
          title: "Do: get to green",
          body: (
            <>
              <p>
                Iterate — edit, <code>dbt build -s stg_reference_opening_hours</code>,
                read — until everything passes.{" "}
                <strong>You should have:</strong>{" "}a fully green build, and (worth the
                30 seconds) a look at your actual table in Snowflake, sitting in the
                DEV__ database for its layer.
              </p>
            </>
          ),
        },
        {
          id: "selectors",
          title: "Choose what runs: selectors",
          body: (
            <>
              <p>
                You have been typing <code>-s your_model</code>{" "}all along —
                that is a <strong>selector</strong>. The command says what to
                do; the selector says which nodes to do it to. A <code>+</code>{" "}
                extends the selection along the DAG:
              </p>
              <SelectorPlayground />
              <p>
                To leave something out, there is no bare <code>-</code>{" "}
                operator — say it explicitly:
              </p>
              <CodeBlock
                lang="bash"
                code={`dbt build -s int_current_waits+ --exclude weekly_waits`}
              />
            </>
          ),
          check: {
            prompt: "Which selector means a model and everything upstream of it?",
            options: ["`my_model+`", "`+my_model`", "`-my_model`", "`my_model --up`"],
            answer: 1,
            explain:
              "A plus before the name walks upstream; after it, downstream. You'll use +my_model when your model needs fresh parents.",
            affirm: "prefix + goes upstream; suffix + goes downstream.",
          },
        },
        {
          id: "ls-first",
          title: "Do: look before a broad build",
          body: (
            <>
              <p>
                Before running a selector wider than one model, see what it
                catches — replace <code>build</code>{" "}with <code>ls</code>:
              </p>
              <TryIt
                stages={[
                  {
                    cmd: "dbt ls -s +stg_reference_opening_hours",
                    out: `source:reference.opening_hours
raw_reference_opening_hours
stg_reference_opening_hours`,
                  },
                ]}
                done="You saw the selection without running any of it."
              />
              <p>
                <strong>You should see:</strong>{" "}just your model and its raw
                parent. Cheap, instant, and there is nothing left to guess.
              </p>
            </>
          ),
        },
        {
          id: "daily-loop",
          title: "Your daily loop",
          body: (
            <>
              <p>
                That is the whole toolkit. From your second model on, the loop
                is: use the smallest command that proves the next thing.
              </p>
              <div className="my-6 flex flex-col gap-2">
                {[
                  ["1", "dbt compile -s my_model", "Does the SQL make sense?"],
                  ["2", "dbt show -s my_model", "Do a few rows look right?"],
                  ["3", "dbt build -s my_model", "Can it be created and pass its tests?"],
                  ["4", "dbt ls -s my_model+", "What downstream work might be affected?"],
                ].map(([number, command, question]) => (
                  <div key={number} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-paper">{number}</span>
                    <div className="min-w-0">
                      <code className="!whitespace-normal">{command}</code>
                      <span className="mt-1 block text-xs text-ink-faint">{question}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p>
                Five quick situations to lock it in — choose the smallest
                useful command for each:
              </p>
              <CommandLab />
            </>
          ),
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "open-the-pr",
      waypoint: "PR",
      title: "Open the PR",
      blurb: "Branch, commit, push, propose — then watch the checks",
      minutes: 20,
      steps: [
        {
          id: "branch-commit",
          body: (
            <>
              <p>
                Time for the git loop from the essentials course — for real this
                time. You should still be on the feature branch you created before
                editing any project files. Confirm that before staging anything:
              </p>
              <CodeBlock
                lang="bash"
                code={`git status`}
              />
              <p>
                <strong>You should see:</strong>{" "}your <code>.sql</code>{" "}and{" "}
                <code>.yml</code>{" "}listed as untracked/modified — and nothing else.
                If generated source files from earlier are listed, they belong in
                this PR too. Anything you don&apos;t recognise: don&apos;t stage it.
              </p>
              <p>
                If status says <code>On branch main</code>, create your feature branch
                now with <code>git switch -c feat/opening-hours-staging</code>; your
                uncommitted changes will move with you. Do not pull until those
                changes are safely on a branch.
              </p>
              <CodeBlock
                lang="bash"
                code={`
git add models/staging/shared/stg_reference_opening_hours.sql
git add models/staging/shared/stg_reference_opening_hours.yml
git commit -m "feat: add opening hours staging model"
git push
`}
              />
            </>
          ),
        },
        {
          id: "pr",
          title: "Do: open the pull request",
          body: (
            <>
              <p>
                <strong>You should see:</strong>{" "}the push output includes a “Create a
                pull request” link — click it (or run <code>gh pr create</code>).
                Write a description a stranger could follow:
              </p>
              <CodeBlock
                lang="text"
                code={`
## What
Adds stg_reference_opening_hours: one row per site per weekday.

## Why
Needed for the access dashboard; nothing currently stages this table.

## Checks
- dbt build green locally; grain verified on (site_code, day_of_week)
- ~40 rows have null closes_at where is_open_24h = true - kept, noted in column description
`}
              />
              <p>
                That third section — what you checked and what you noticed — is the
                habit that makes reviews fast.
              </p>
            </>
          ),
        },
        {
          id: "checks",
          title: "Then: watch what happens",
          body: (
            <>
              <p>
                <strong>You should see, within a couple of minutes:</strong>{" "}checks
                appearing at the bottom of the PR (compile, code quality, ownership)
                and <strong>CodeRabbit</strong> — an automated reviewer — commenting
                on your diff. A human reviewer is auto-assigned; once they are, the
                heavier validation check builds your changed models in a shared dev
                environment.
              </p>
              <p>
                While you wait, read your own diff in the Files changed tab.
                Everyone finds something.
              </p>
            </>
          ),
          check: {
            prompt: "CodeRabbit leaves a comment you're fairly sure is wrong. You should…",
            options: [
              "Apply it anyway — automated reviewers are authoritative",
              "Ignore it silently",
              "Reply explaining why you're keeping it as is — disagreeing with reasons is a normal review response",
              "Close the PR and re-open to clear the comments",
            ],
            answer: 2,
            explain:
              "Automated review comments are suggestions, not gates. Address the valid ones, push back on the rest in a reply — the human reviewer sees both the comment and your reasoning.",
            affirm: "automated comments are suggestions — disagreeing with reasons is a valid response.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "merge-and-after",
      waypoint: "merge",
      title: "Merge — and what happens next",
      blurb: "Responding to review, landing on main, and your model's new life",
      minutes: 15,
      steps: [
        {
          id: "respond",
          body: (
            <>
              <p>
                Review comments arrive. The loop for each: make the change locally,
                then —
              </p>
              <CodeBlock
                lang="bash"
                code={`
git add -u
git commit -m "fix: rename site identifier to match conventions"
git push
`}
              />
              <p>
                — and <strong>reply to the comment</strong>{" "}(“done in abc123”) so the
                reviewer doesn&apos;t have to re-read your whole diff. Disagree with
                a comment? Say why in the thread; reviewers are often missing
                context you have.
              </p>
            </>
          ),
        },
        {
          id: "merge",
          title: "Do: merge",
          body: (
            <>
              <p>
                Approval plus green checks unlocks the merge button. We
                squash-merge: your branch&apos;s commits become one tidy commit on
                main. Delete the branch when GitHub offers, then locally:
              </p>
              <CodeBlock
                lang="bash"
                code={`
git switch main
git pull
`}
              />
              <p>
                <strong>You should see:</strong>{" "}your model in the pulled main — and
                shortly after the merge, the deploy workflow building it into
                production Snowflake.
              </p>
            </>
          ),
        },
        {
          id: "after",
          title: "Your model's new life",
          body: (
            <>
              <p>From its next scheduled run, without you doing anything:</p>
              <ul>
                <li>a production build that selects it rebuilds your model and runs its tests;</li>
                <li>
                  if the feed changes in six months, your grain test raises the
                  alarm; dbt skips selected descendants, leaving existing downstream
                  tables on their last successful version;
                </li>
                <li>
                  your column descriptions are live in dbt docs and as Snowflake
                  comments;
                </li>
                <li>anyone can <code>ref()</code>{" "}your model and build on it.</li>
              </ul>
              <p>
                That is the development-to-deployment loop, and it is the same route for everything from a
                one-line fix to a new disease register. It felt heavyweight this
                time; from the second PR on, the loop is minutes.
              </p>
              <p>
                One heads-up for that second PR: it will probably begin with a business
                question and <em>change or compose</em>{" "}models that already exist.
                Start with <Link href="/learn/finding-models">Finding models</Link>; then use
                the <Link href="/practice/change-a-model">Change an existing model</Link>
                {" "}field guide for the downstream checks. After merge, the{" "}
                <Link href="/learn/observing-production">observability lesson</Link>
                {" "}shows how the team follows the model in production.
              </p>
            </>
          ),
          check: {
            prompt: "Six months on, the feed starts sending duplicate rows. Who finds out, and how?",
            options: [
              "A dashboard user notices odd numbers and emails around",
              "A scheduled build that selects it — your model is updated, its grain test fails, and selected downstream nodes are skipped",
              "Nobody, unless someone re-checks the model",
              "Snowflake blocks the duplicate rows automatically",
            ],
            answer: 1,
            explain:
              "The failed model has already been built, but dbt isolates the problem in the DAG. Existing downstream relations are not rebuilt from it, so consumers of those relations see older data rather than newly propagated bad data.",
            affirm: "tests isolate failed data; downstream relations stay on their previous version.",
          },
        },
      ],
    },
  ],
};
