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
  tagline: "A hands-on lab that takes you from a blank machine to a merged staging model",
  audience:
    "Hands-on, at your own machine. Assumes Git essentials and Understanding dbt, or similar experience. The course uses one missing staging model so you can learn the mechanics on something small. Most of your later work will find, change and combine models that already exist. Best done in your first week, once your access is set up.",
  hours: "~3.5 hrs hands-on",
  accent: "var(--layer-reporting)",
  lessons: [
    // ------------------------------------------------------------------
    {
      slug: "set-up-your-machine",
      waypoint: "set up",
      title: "Set up your development environment",
      blurb: "Windows, macOS or Codespaces, ending with a passing dbt debug",
      minutes: 30,
      steps: [
        {
          id: "before",
          body: (
            <>
              <p>
                In this lesson you&apos;ll connect dbt to Snowflake and set up
                signed Git commits. You&apos;re done when <code>dbt debug</code>{" "}
                passes. Setup is the slowest part of the course, and you only do
                it once.
              </p>
              <p>
                Before you start, you need a GitHub account added to the
                team&apos;s organisation and Snowflake access with the{" "}
                <code>ANALYST</code>{" "}role. Ask your team lead for both. You
                also need your connection details, meaning your account
                identifier, username, role and warehouse. You can find those
                yourself in Snowsight. Select your name in the bottom-left
                corner, then <strong>Connect a tool to Snowflake</strong>.
              </p>
              <p>
                Each lesson follows the same pattern. You do something, check
                the result, and learn why it matters.
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
                Setup is a little different on a managed Windows laptop, a Mac and
                a Codespace in the browser. Pick the one you&apos;ll actually use,
                and the steps below change to match.
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
                All three routes leave you with the same project. You get the dbt
                Fusion engine, the Git hooks, the dbt packages and a Python
                environment for the helper scripts. dbt itself is the Fusion
                program, separate from that Python environment.
              </p>
              <p>
                On Windows and macOS, opening a terminal in the VS Code workspace
                runs <code>start_dbt.ps1</code>{" "}or <code>start_dbt.sh</code>. The
                first time, it asks for your Snowflake details and writes them to a
                local <code>.env</code>{" "}file. Codespaces runs its own setup once,
                when the codespace is created, and reads your Snowflake details
                from your Codespaces secrets instead.
              </p>
              <Callout kind="warn" title="Credentials stay outside Git">
                <p>
                  Local credentials live in <code>.env</code>, which Git ignores.
                  Codespaces credentials live in GitHub&apos;s encrypted secret
                  store. Never put them in SQL, YAML, comments, screenshots, commit
                  messages or pull requests.
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
              "Local setup keeps credentials in the .env file, which Git ignores. Codespaces passes your encrypted secrets in as environment variables. Neither route commits them to Git.",
            affirm: "credentials come from your environment, never from files Git tracks.",
          },
        },
        {
          id: "files-map",
          title: "Where dbt reads settings and writes output",
          body: (
            <>
              <p>
                <code>dbt_project.yml</code>{" "}holds the project&apos;s
                settings. <code>profiles.yml</code>{" "}defines the Snowflake
                connections and reads their values from environment variables,
                which your <code>.env</code>{" "}supplies on your own machine.
                dbt writes what it generates, including compiled SQL, to the{" "}
                <code>target/</code>{" "}folder. You&apos;ll keep meeting all
                four. Click through them.
              </p>
              <ProjectFilesMap />
              <p>
                Watch out for one word. In <code>profiles.yml</code>,{" "}
                <code>target: dev</code>{" "}names a Snowflake connection. The{" "}
                <code>target/</code>{" "}folder, with a slash, is where dbt writes
                generated files on your machine. The slash tells you which one
                you&apos;re looking at.
              </p>
            </>
          ),
          check: {
            prompt: "You want to inspect the SQL dbt actually compiled on your machine. Where do you look?",
            options: ["`.env`", "`profiles.yml`", "`target/compiled/`", "`dbt_project.yml`"],
            answer: 2,
            explain:
              "target/ is where dbt writes its generated output, and compiled SQL goes in target/compiled/. You read those files. You never edit them.",
            affirm: "target/ holds generated output, including compiled SQL.",
          },
        },
        {
          id: "signing",
          title: "Do: set up commit signing (one-off)",
          body: (
            <>
              <p>
                This repository only accepts <em>signed</em>{" "}commits. A signature
                proves a commit really came from you. Choose your environment to
                get the one-time setup for it.
              </p>
              <CommitSigningGuide />
            </>
          ),
        },
        {
          id: "debug",
          title: "Do: check the connection with dbt debug",
          body: (
            <>
              <p>
                <code>dbt debug</code>{" "}checks your project setup and tries to
                connect to Snowflake. Run it in the VS Code terminal.
              </p>
              <CodeBlock lang="bash" code={`dbt debug`} />
              <p>
                <strong>You should see</strong>{" "}a list of checks ending in{" "}
                <code>All checks passed!</code>. On your own machine, a browser
                window may open so you can sign in to Snowflake. In Codespaces, dbt
                signs in with the access token in your Codespaces secrets.
              </p>
              <p>
                <strong>If it fails</strong>, check your connection values. On
                Windows or macOS they&apos;re in <code>.env</code>. In Codespaces
                they&apos;re your Codespaces secrets. Most first-day failures come
                from a mistyped account identifier, a role you don&apos;t have, or
                a missing token.
              </p>
              <p>
                Once it passes, your environment is ready and the real work starts.
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
              "dbt debug tests your connection and configuration. Local setups read .env, and Codespaces reads your secrets. Check the account, user, role, warehouse and sign-in value for your route, then try again.",
            affirm: "when dbt can't connect, check the connection values for your setup route.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "pick-your-table",
      waypoint: "pick data",
      title: "Pick your table",
      blurb: "Choose data you know and state its grain",
      minutes: 12,
      steps: [
        {
          id: "familiar",
          body: (
            <>
              <p>
                Pick a table you already know for your first model.{" "}
                <strong>Building on data you know</strong>{" "}is the best choice
                you can make now. That might be a reference table you maintain,
                or a feed you&apos;ve queried for reports. You&apos;re here to learn how dbt works, so
                don&apos;t learn a new dataset at the same time.
              </p>
              <Callout kind="info" title="This is a practice exercise">
                <p>
                  A missing staging model is a small, safe way to practise the
                  files, YAML, builds, tests and Git. It isn&apos;t where normal
                  analysis requests start. Those begin by finding the domain models
                  that already exist and building on them.
                </p>
              </Callout>
              <p>
                Knowing the data means you can check your own work. One look at
                the output and you&apos;ll know whether it&apos;s right.
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
                Write one sentence saying what a row in your table represents.
                It answers <strong>one row per what?</strong>, and it tells you
                which column to test for duplicates later. The course&apos;s
                example is a lookup of NHS financial weeks. Its grain is
                &quot;one row per calendar date&quot;, so the date is the column
                to test.
              </p>
              <p>
                Your table might be one row per practice per month, or per
                patient per referral per week. Write the sentence down before
                you write any SQL. If you can&apos;t say it, you don&apos;t know
                the table well enough yet.
              </p>
              <p>
                <strong>You should have</strong>{" "}a table in mind and its grain
                in one sentence. The financial weeks lookup is a real reference
                table. It holds no patient data, and nothing stages it yet. Swap
                in your own table as you go.
              </p>
            </>
          ),
          check: {
            prompt: "Why insist on stating the grain before writing SQL?",
            options: [
              "dbt requires it in configuration",
              "It defines what unique means for this table, which becomes your most important test",
              "It determines which warehouse the model uses",
              "It is needed for the file name",
            ],
            answer: 1,
            explain:
              "The grain is the table's promise: one row per what. Your grain test checks that promise on every build. A join that breaks the grain is the most common serious modelling bug.",
            affirm: "one row per what. The grain sentence becomes your most important test.",
          },
        },
        {
          id: "branch",
          title: "Do: create a branch from the latest main",
          body: (
            <>
              <p>
                Create a branch before you change any project files. Check the
                working tree is clean, update <code>main</code>, then branch from
                the latest commit.
              </p>
              <CodeBlock
                lang="bash"
                code={`git status
git switch main
git pull
git switch -c feat/fin-week-staging`}
              />
              <p>
                Expect <code>git status</code>{" "}to say{" "}
                <code>nothing to commit, working tree clean</code>. If it lists
                changes, stop before you pull and find out what they are.
              </p>
              <p>
                Replace <code>fin-week-staging</code>{" "}with a short
                description of your model. Every edit from here on happens on this
                branch.
              </p>
              <p>
                <strong>You should see</strong>{" "}
                <code>Switched to a new branch &apos;feat/fin-week-staging&apos;</code>.
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
      blurb: "Find the raw model your staging model will read",
      minutes: 10,
      steps: [
        {
          id: "start",
          title: "Your staging model reads a generated raw model",
          body: (
            <>
              <p>
                Your staging model will read from a <strong>raw model</strong>. A
                raw model is a generated view of one source table, with the
                columns renamed to readable snake_case. Nobody writes raw models
                by hand. The source pipeline generates them.
              </p>
              <p>
                So your first job is to <strong>find</strong>, not build. Start
                from the table&apos;s full Snowflake name, check nobody has
                staged it already, then find its raw model. Your staging SQL will
                read it with <code>ref()</code>. The project has more than 3,000
                models, so look before you write anything.
              </p>
              <SourceSetupFlow />
              <p>
                The diagram shows where a raw model comes from. For your first PR,
                the last box is what matters. The <strong>raw layer is always
                generated</strong>, and you never edit it. How a table gets a raw
                model in the first place is a bigger topic. It involves the source
                registry, manual and automatic schemas, and the generation
                pipeline, and the guide covers it.
              </p>
            </>
          ),
        },
        {
          id: "search",
          title: "Search for the staging and raw models by name",
          body: (
            <>
              <p>
                Start with the table&apos;s three-part Snowflake name. In the
                worked example it&apos;s this one.
              </p>
              <CodeBlock
                lang="text"
                code={`MODELLING.LOOKUP_NCL.FIN_WEEK_NUMBER_2019_2031`}
              />
              <p>
                Search first for the <em>idea</em>, not the table. Press{" "}
                <code>Ctrl+P</code>{" "}(<code>⌘P</code>{" "}on a Mac) to search file
                names and type the concept, such as <code>fin_week</code>.
                Project names follow a pattern, so an existing <code>dim_</code>,{" "}
                <code>int_</code>{" "}or <code>fct_</code>{" "}model for your idea
                shows up by name. Finding one can change your plan, or finish it.
              </p>
              <p>Then look for these, in order:</p>
              <ol>
                <li>
                  <code>stg_reference_lookup_ncl_fin_week_number_2019_2031</code>, the
                  staging model. If it already exists, your work may be done. Reuse
                  it rather than writing a second one.
                </li>
                <li>
                  <code>raw_reference_lookup_ncl_fin_week_number_2019_2031</code>, the
                  raw model. This is what your staging model will{" "}
                  <code>ref()</code>. It&apos;s in <code>models/raw/shared/</code>.
                </li>
                <li>
                  The table name itself. Press <code>Ctrl+Shift+F</code>{" "}
                  (<code>⇧⌘F</code>{" "}on a Mac) to search inside all files, and
                  type <code>FIN_WEEK_NUMBER_2019_2031</code>. This catches a model
                  with a name you didn&apos;t expect. Here it also finds the source
                  declaration in{" "}
                  <code>models/sources/auto_modelling_lookup_ncl.yml</code>.
                </li>
              </ol>
              <p>
                For this table you&apos;ll find the raw model and no staging model.
                That gap is what your first PR fills. Preview the raw model and
                note its snake_case column names. Those are the columns you&apos;ll
                select:
              </p>
              <CodeBlock
                lang="bash"
                code={`dbt show -s raw_reference_lookup_ncl_fin_week_number_2019_2031 --limit 5`}
              />
              <p>
                <strong>You should see</strong>{" "}five rows printed in your
                terminal, with lower-case columns from <code>full_date</code>{" "}to{" "}
                <code>new_fin_week_num</code>. A raw model reads its source
                directly, so this works without building anything first.
              </p>
              <Callout kind="warn" title="Know where query output goes">
                <p>
                  <code>dbt show</code>{" "}runs the query and prints the rows. If a
                  coding agent runs it, the agent&apos;s provider can receive that
                  output. Only let an agent run a query that returns a high-level
                  aggregate nobody could be identified from. Never use an agent to
                  preview model rows. Look at those yourself, in an approved tool
                  you control.
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
              "The raw model is your input and staging is the missing piece, so writing it is what your first PR is for. Raw models are generated. You never edit or regenerate them by hand.",
            affirm: "find the raw model, then build staging on top of it with ref().",
          },
        },
        {
          id: "no-raw",
          title: "If your table has no raw model, pick one that does",
          body: (
            <>
              <p>
                If you can&apos;t find a raw model, the project doesn&apos;t read
                that table yet. Getting it in is a bigger job than your first PR.
                You check how the project handles its schema in{" "}
                <code>scripts/sources/source_mappings.yml</code>, choose between
                a manual and an automatic schema, and run the generation
                pipeline. You&apos;ll learn it later.
              </p>
              <Callout kind="info" title="Pick a table that already has a raw model">
                <p>
                  Most tables you&apos;d reach for already have one. For your first
                  PR, pick one of those, and make the staging model your win. When
                  you do need to add a source, the{" "}
                  <Link href="/practice/find-a-source">Find your source</Link>{" "}
                  walkthrough takes you through the registry, the two kinds of
                  schema and the pipeline. It assumes you know the dbt basics this
                  course teaches.
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
      title: "Choose the model's folder",
      blurb: "The layer and domain pick the folder, and the folder sets the config",
      minutes: 12,
      steps: [
        {
          id: "why-folders",
          body: (
            <>
              <p>
                The model&apos;s job and its data decide which folder it goes in.
                You&apos;re cleaning one source table, so this model belongs in
                staging. Two questions pick the folder. Which{" "}
                <strong>layer</strong>, meaning what job is the model doing? And
                which <strong>domain</strong>, meaning what data is it about?
              </p>
              <p>
                The choice matters because the folder supplies the
                model&apos;s defaults. It decides whether your model builds as a
                view or a table, which database and schema it lands in, and which
                tags and hooks it gets. Choose the folder and you&apos;ve
                configured the model.
              </p>
              <Callout kind="info" title="Raw and staging share the STAGING database">
                <p>
                  Every raw model builds in <code>STAGING.DBT_RAW</code>. A staging
                  model&apos;s schema comes from the folder that holds the file. So{" "}
                  <code>models/staging/olids/</code>{" "}builds into{" "}
                  <code>STAGING.OLIDS</code>, and{" "}
                  <code>models/staging/shared/reference/</code>{" "}builds into{" "}
                  <code>STAGING.REFERENCE</code>. Your development builds use the
                  same layout in <code>DEV__STAGING</code>.
                </p>
              </Callout>
            </>
          ),
        },
        {
          id: "picker",
          title: "Choose the staging folder for the financial weeks lookup",
          body: (
            <>
              <p>
                Pick the job and the domain for the worked example, and the
                picker shows the folder and schema they lead to.
              </p>
              <FolderPicker />
              <p>
                Our worked example cleans one reference table of financial weeks. The
                answers are <em>staging</em>{" "}and <em>shared reference</em>, and
                the file name starts with <code>stg_</code>. Shared staging models
                sit one level deeper, in a folder named for the source. Reference
                tables go in <code>models/staging/shared/reference/</code>.
              </p>
            </>
          ),
          check: {
            prompt:
              "You're building a model that joins GP observations to derive a reusable smoking-status block. Folder?",
            options: [
              "`models/staging/olids/`, because it reads staged data",
              "`models/modelling/olids/`, because joins and reusable derivations are modelling-layer work",
              "`models/reporting/olids/`, because analysts will use it",
              "`models/modelling/commissioning/`, because derivations live under commissioning",
            ],
            answer: 1,
            explain:
              "Start with the job. Deriving a reusable smoking status is modelling work. Staging only joins for cleaning that every user of the source should get. Reporting builds analyst-facing datasets, which can ref() this block.",
            affirm: "the job picks the layer, the data picks the domain.",
          },
        },
        {
          id: "name",
          title: "Do: create the model's .sql file",
          body: (
            <>
              <p>
                The name is the layer prefix plus the rest of the raw model&apos;s
                name. <code>raw_reference_lookup_ncl_fin_week_number_2019_2031</code>{" "}
                becomes <code>stg_reference_lookup_ncl_fin_week_number_2019_2031</code>:
              </p>
              <CodeBlock
                lang="text"
                code={`models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.sql`}
              />
              <p>
                In the VS Code Explorer, right-click the{" "}
                <code>models/staging/shared/reference</code>{" "}folder, choose{" "}
                <strong>New File</strong>, and type the file name.
              </p>
              <p>
                <strong>You should have</strong>{" "}an empty <code>.sql</code>{" "}file
                next to the other <code>stg_reference_</code>{" "}models. Even empty,
                it&apos;s already configured. Its folder makes it a view in{" "}
                <code>STAGING.REFERENCE</code>.
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
      blurb: "One SELECT in project style, previewed as you go",
      minutes: 25,
      steps: [
        {
          id: "write",
          body: (
            <>
              <p>
                A staging model is one SELECT from the raw model. It lists its
                columns, does light cleaning and renames columns to project
                conventions. Here&apos;s the worked example. Nothing in it is
                accidental, and each note sits on the line it explains. Tap the
                numbers, then write yours.
              </p>
              <AnnotatedCode
                lang="sql"
                title="stg_reference_lookup_ncl_fin_week_number_2019_2031.sql"
                segments={[
                  {
                    code: "select",
                    note: "Lowercase keywords, which the project's SQLFluff config expects. And name every column instead of using select *. The column list is what downstream models rely on. With *, a change in the source reaches them without anyone noticing.",
                  },
                  {
                    code: "    full_date::date as calendar_date,\n    new_start_of_fin_week::date as fin_week_start_date,",
                    note: "The source stores each date as a timestamp at midnight. Casting to date is staging work. Do it here, once, and nobody downstream trips over a stray time part again. The renames follow project conventions: dates end in _date, timestamps in _at, IDs in _id, and booleans start with is_ or has_. CodeRabbit points out names that don't follow the pattern.",
                  },
                  {
                    code: "    new_fin_year as fin_year,\n    new_fin_week_num as fin_week_number",
                    note: "The new_ prefix goes, because a reader can't tell what it's new compared with. When you don't know what a source prefix means, ask in the PR rather than guess.",
                  },
                  {
                    code: "from {{ ref('raw_reference_lookup_ncl_fin_week_number_2019_2031') }}",
                    note: "Always ref(), never a table name typed out. dbt fills in the right database for each environment and records the dependency. Read one table and don't filter rows for business reasons. If you need a join or a business filter, that usually belongs in a modelling (int_) model.",
                  },
                ]}
              />
            </>
          ),
        },
        {
          id: "inside-a-command",
          title: "dbt parses, compiles, then executes",
          body: (
            <>
              <p>
                When dbt builds a model, it reads the project, compiles the model
                into plain Snowflake SQL, then executes it. Click each stage to
                see where <code>ref()</code>{" "}becomes a real table name. You&apos;re
                about to run dbt against your own model, so it helps to know
                which stages touch Snowflake.
              </p>
              <DbtExecutionFlow />
              <p>
                Parse and compile don&apos;t build your models. Only execution
                does. Compile still connects to Snowflake. It reads table metadata,
                and a macro can send a query of its own while it renders, through{" "}
                <code>run_query</code>. In this project those queries only look
                things up, so <code>dbt compile</code>{" "}is safe to run at any time.
                It&apos;s how you see the SQL dbt generated when a{" "}
                <code>ref()</code>{" "}or macro surprises you.
              </p>
            </>
          ),
          check: {
            prompt: "Which command shows the rendered SQL without building anything?",
            options: ["`dbt build`", "`dbt compile`", "`dbt test`", "`dbt debug`"],
            answer: 1,
            explain:
              "compile stops after rendering. Your templates become plain SQL, and no model is built in Snowflake.",
            affirm: "compile shows the SQL dbt generated and builds nothing.",
          },
        },
        {
          id: "preview",
          title: "Do: preview the rows and the compiled SQL",
          body: (
            <>
              <p>
                Look at your model&apos;s rows and its compiled SQL before you
                build it. First build the raw view it reads, then preview.
              </p>
              <CodeBlock
                lang="bash"
                code={`
dbt build -s raw_reference_lookup_ncl_fin_week_number_2019_2031
dbt show -s stg_reference_lookup_ncl_fin_week_number_2019_2031 --limit 5
dbt compile -s stg_reference_lookup_ncl_fin_week_number_2019_2031
`}
              />
              <p>
                The first command builds the raw view in your dev database. Your{" "}
                <code>ref()</code>{" "}points at that dev copy, and{" "}
                <code>dbt show</code>{" "}won&apos;t create it for you. It&apos;s a
                view, so it takes seconds.
              </p>
              <p>
                <strong>You should see</strong>{" "}five sensible-looking rows from{" "}
                <code>dbt show</code>, one per date, with no time part on the
                dates. <code>dbt compile</code>{" "}prints your SELECT with the{" "}
                <code>ref()</code>{" "}replaced by a real table name in{" "}
                <code>DEV__STAGING.DBT_RAW</code>, and finish with no errors.
              </p>
              <p>
                The dbt extension in VS Code runs the same checks as you type. A
                red underline now is an error <code>dbt build</code>{" "}would have
                given you later.
              </p>
              <p>
                <strong>If show fails</strong>, read the message. A misspelled{" "}
                <code>ref()</code>{" "}names the model it can&apos;t find. A SQL
                error points at the line.
              </p>
            </>
          ),
          check: {
            prompt: "Why explicit columns rather than `select *` in staging?",
            options: [
              "`select *` is slower in Snowflake",
              "The column list is what downstream models depend on, and * changes silently when the source does",
              "dbt cannot compile `select *`",
              "It makes the file longer, which reviewers prefer",
            ],
            answer: 1,
            explain:
              "With *, a new source column appears downstream without warning, and a removed one breaks the models that used it. Naming the columns makes the model's promise visible and every change deliberate.",
            affirm: "the column list is the promise downstream models rely on.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "describe-and-test",
      waypoint: "YAML",
      title: "Describe and test it",
      blurb: "Describe the staging model and test that each date appears once",
      minutes: 20,
      steps: [
        {
          id: "why-yaml",
          body: (
            <>
              <p>
                Now you describe your model in a <code>.yml</code>{" "}file and
                test that each date appears once. The file sits next to your{" "}
                <code>.sql</code>{" "}file with the same name,{" "}
                <code>stg_reference_lookup_ncl_fin_week_number_2019_2031.yml</code>.
                It names an owner, describes the columns and declares{" "}
                <strong>tests</strong>, the checks <code>dbt build</code>{" "}runs
                after it builds the model. CI checks the file is there. More
                importantly, it&apos;s where you write down what you know about
                the data.
              </p>
              <p>
                Write it by hand. It&apos;s short, and writing it is how you make
                the decisions in it. Tap the numbers to see what each part does.
              </p>
              <AnnotatedCode
                lang="yaml"
                title="stg_reference_lookup_ncl_fin_week_number_2019_2031.yml"
                segments={[
                  { code: "models:\n  - name: stg_reference_lookup_ncl_fin_week_number_2019_2031" },
                  {
                    code: "    description: >\n      NHS financial weeks, one row per calendar date\n      from 1 April 2019 to 31 March 2031",
                    note: "The description states the grain: one row per what. It appears in dbt docs and as a comment on the Snowflake view.",
                  },
                  {
                    code: "    config:\n      meta:\n        owner:\n          name: Owning Team or Person",
                    note: "Every new model names an owner. That's the person or group accountable for what the model means, not just whoever wrote it. If you don't know who it is, ask in the PR. CI flags a new model without one.",
                  },
                  {
                    code: "    columns:\n      - name: calendar_date\n        description: The date this row describes\n        data_tests: [unique, not_null]",
                    note: "Your one-sentence grain, turned into the most valuable test you can write. One column is the grain here, so unique on calendar_date asserts it, and not_null stops a null slipping past. It fails as soon as anything duplicates rows, whether that's a dirty source or a future join.",
                  },
                  {
                    code: "      - name: fin_week_number\n        description: 1 to 53. Weeks run Monday to Sunday, so some financial years have 53.",
                    note: "A description should say what the name can't. Column descriptions also appear in docs and Snowflake.",
                  },
                ]}
              />
            </>
          ),
        },
        {
          id: "anatomy",
          title: "Test the grain column for duplicates and nulls",
          body: (
            <>
              <p>
                This staging model needs two tests on{" "}
                <code>calendar_date</code>, the column the grain depends on.{" "}
                <code>unique</code>{" "}checks each date appears once, and{" "}
                <code>not_null</code>{" "}checks every row has one. Each test compiles to a query that
                looks for rows breaking the rule. If it finds none, the test
                passes.
              </p>
              <p>
                When the grain is a combination, such as one row per practice per
                month, use <code>dbt_utils.unique_combination_of_columns</code>{" "}
                at model level instead. It doesn&apos;t reject nulls, so give each
                key column its own <code>not_null</code>.
              </p>
              <p>
                Don&apos;t test everything. Tests run whenever their model builds and cost
                Snowflake compute. A test that can&apos;t fail in a useful way is
                just noise. The grain test catches real accidents, so you write it
                first.
              </p>
            </>
          ),
          check: {
            prompt:
              "Your next model's grain is one row per practice per month. Which single test catches a future join accidentally duplicating rows?",
            options: [
              "`not_null` on `practice_code`",
              "`unique` on `practice_code`",
              "`unique_combination_of_columns` on `[practice_code, report_month]`",
              "A row-count test",
            ],
            answer: 2,
            explain:
              "unique on practice_code alone would fail today, because each practice has a row for every month. Only the combination test matches the real grain, and it fails as soon as anything multiplies the rows.",
            affirm: "test the combination, because that's what the grain is.",
          },
        },
        {
          id: "agents",
          title: "You decide what the YAML says about the data",
          body: (
            <>
              <p>
                You decide what the YAML says about the data. Before you draft
                any entries, settle what one row represents and whether a missing
                value can be valid. Then copy the layout of a neighbouring{" "}
                <code>stg_reference_*.yml</code>, or let an AI assistant draft it.
                Both save typing. Neither can tell you the grain, which columns
                matter or what a null means here. The tool types up your answers.
                It doesn&apos;t make the decisions.
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
      blurb: "Build and test your model in dev, then learn run, test, build and selectors on it",
      minutes: 35,
      steps: [
        {
          id: "build",
          body: (
            <>
              <p>
                Build your model in dev and run its tests with one command.
              </p>
              <CodeBlock
                lang="bash"
                code={`dbt build -s stg_reference_lookup_ncl_fin_week_number_2019_2031`}
              />
              <p>
                <code>build</code>{" "}creates the model <em>and</em>{" "}runs its tests,
                in that order. It writes to the <strong>DEV__ databases</strong>,
                the shared development copy of the warehouse, so your model build
                doesn&apos;t touch production tables.
              </p>
              <p>
                <strong>You should see</strong>{" "}one <code>Succeeded model</code>{" "}
                line, two <code>Passed test</code>{" "}lines, and a summary with no
                errors. The tests can finish in any order.
              </p>
              <CodeBlock
                lang="text"
                code={`
 Succeeded model REFERENCE.stg_reference_lookup_ncl_fin_week_number_2019_2031 (view) [1 of 3 in 1.12s]
    Passed test  not_null_stg_reference_lookup_ncl_fin_week_number_2019_2031_calendar_date [2 of 3 in 0.41s]
    Passed test  unique_stg_reference_lookup_ncl_fin_week_number_2019_2031_calendar_date [3 of 3 in 0.43s]
==================== Execution Summary =====================
Finished 'build' successfully for target 'dev' [24.6s]
Processed: 5 hooks | 1 model | 2 tests
`}
              />
            </>
          ),
        },
        {
          id: "run-test-build",
          title: "dbt run builds, dbt test checks, and dbt build does both",
          body: (
            <>
              <p>
                <code>dbt run</code>{" "}builds models without testing them.{" "}
                <code>dbt test</code>{" "}runs data tests against what&apos;s
                already built. <code>dbt build</code>{" "}builds each model and
                then runs its tests, in DAG order. The names sound alike, so
                watch the same small project react to each one. Run all three.
              </p>
              <CommandDAG />
              <p>
                As you just saw, a failing test in a build stops dbt
                building anything downstream, but it doesn&apos;t undo the model
                itself. For everyday model work, use build.
              </p>
            </>
          ),
          check: {
            prompt: "`dbt run -s your_model` finishes green. What has it proved?",
            options: [
              "The model was created, but its data tests have not run",
              "The model and all its tests passed",
              "The whole project is healthy",
              "Nothing, because run is a dry run",
            ],
            answer: 0,
            explain:
              "run only creates. A model with a broken grain can run green and still be wrong. That's why build, which adds the tests, is the everyday command.",
            affirm: "run creates. build creates and tests.",
          },
        },
        {
          id: "fail",
          title: "A failed test found rows that break its rule",
          body: (
            <>
              <p>
                A failed data test means its query found rows that break the
                rule. dbt prints a <code>Failed test</code>{" "}line, then the
                number of rows the query returned, such as{" "}
                <code>Test failed (14 failed row(s))</code>. Check whether the
                cause is in the source data, your SQL or the rule you chose.
                Either way, <strong>your test has told you something true about
                the data</strong>{" "}that nobody had written down. These are the
                usual first-model findings.
              </p>
              <Callout kind="warn" title="The model has already been built">
                <p>
                  Build creates the model first, then tests it, and a failing test
                  doesn&apos;t undo the model. The failing rows are in your dev view,
                  and anything that queries it directly can see them. dbt only
                  skips building the models downstream of it.
                </p>
              </Callout>
              <ul>
                <li>
                  If the grain test fails, the model has duplicate keys you
                  didn&apos;t expect. They can come from the source, or from your
                  own cleaning. <code>upper()</code>, <code>trim()</code>{" "}or a
                  cast can turn two different source values into one. Here,{" "}
                  <code>::date</code>{" "}would merge two timestamps on the same day.
                  Find out whether your grain sentence is wrong, your SQL merged
                  values, or the source is dirty. Any answer is progress.
                </li>
                <li>
                  If a <code>not_null</code>{" "}test fails, the nulls are real.
                  Decide whether the column can legitimately be empty, in which case
                  drop the test and describe what a null means. Otherwise the rows
                  are junk, so tell the team.
                </li>
              </ul>
              <p>
                To dig in, open the failing test&apos;s compiled SQL under{" "}
                <code>target/compiled/</code>{" "}and run it in a Snowsight
                worksheet. For a grain test that gives you the failing keys, not the
                rows. A <code>unique</code>{" "}test returns each duplicated value
                once, as <code>unique_field</code>, with a count. Join the keys back
                to the model for the rows behind them:
              </p>
              <CodeBlock
                lang="sql"
                code={`
with failing_keys as (
    -- paste the test's compiled SQL here
)
select m.*
from DEV__STAGING.REFERENCE.STG_REFERENCE_LOOKUP_NCL_FIN_WEEK_NUMBER_2019_2031 as m
inner join failing_keys as f
    on m.calendar_date = f.unique_field
order by m.calendar_date
`}
              />
              <p>
                Compare a pair of duplicated rows side by side. If they differ in
                some column, your grain missed something. If they&apos;re
                identical, check the raw model for the same keys. Duplicates there
                came from the source. Duplicates only in staging came from your
                SQL.
              </p>
            </>
          ),
          check: {
            prompt:
              "Your grain test fails with 14 duplicated dates. What does that mean?",
            options: [
              "Your YAML is misconfigured",
              "dbt built the model twice",
              "The data really contains duplicates your grain didn't expect, so investigate before changing anything",
              "Snowflake's cache is stale; rebuild",
            ],
            answer: 2,
            explain:
              "The test ran a real query against real rows. Your grain sentence missed something, your own cleaning merged values, or the source has a quality problem. Whichever it is, note it in your PR description.",
            affirm: "a failing test tells you about the data. It isn't a verdict on you.",
          },
        },
        {
          id: "green",
          title: "Do: build until every test passes",
          body: (
            <>
              <p>
                Edit, run <code>dbt build -s stg_reference_lookup_ncl_fin_week_number_2019_2031</code>,
                read the output, and repeat until everything passes.
              </p>
              <p>
                <strong>You should have</strong>{" "}a build with no failures. Then
                spend 30 seconds looking at the real view in Snowsight. It&apos;s
                at{" "}
                <code>DEV__STAGING.REFERENCE.STG_REFERENCE_LOOKUP_NCL_FIN_WEEK_NUMBER_2019_2031</code>.
              </p>
            </>
          ),
        },
        {
          id: "selectors",
          title: "Selectors choose which models a command acts on",
          body: (
            <>
              <p>
                A <strong>selector</strong>{" "}picks which models a command acts
                on. It&apos;s the <code>-s your_model</code>{" "}part you&apos;ve
                been typing all along. The command says what to do, and the
                selector says which nodes to do it to. A <code>+</code>{" "}extends
                the selection along the DAG.
              </p>
              <SelectorPlayground />
              <p>
                There&apos;s no <code>-</code>{" "}operator for leaving something out.
                Use <code>--exclude</code>{" "}instead:
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
              "A plus before the name walks upstream. After the name, it walks downstream. You'll use +my_model when your model needs fresh parents.",
            affirm: "a + in front goes upstream. A + after goes downstream.",
          },
        },
        {
          id: "ls-first",
          title: "Do: list a selection with dbt ls before you build it",
          body: (
            <>
              <p>
                <code>dbt ls</code>{" "}lists what a selector picks up without
                running anything. When a selector reaches beyond one model, check
                it first by swapping <code>build</code>{" "}for <code>ls</code>.
              </p>
              <TryIt
                stages={[
                  {
                    cmd: "dbt ls -s +stg_reference_lookup_ncl_fin_week_number_2019_2031",
                    out: `wnl_analytics.raw.shared.raw_reference_lookup_ncl_fin_week_number_2019_2031
wnl_analytics.staging.shared.reference.stg_reference_lookup_ncl_fin_week_number_2019_2031
source:wnl_analytics.reference_lookup_ncl.FIN_WEEK_NUMBER_2019_2031
wnl_analytics.staging.shared.reference.not_null_stg_reference_lookup_ncl_fin_week_number_2019_2031_calendar_date
wnl_analytics.staging.shared.reference.unique_stg_reference_lookup_ncl_fin_week_number_2019_2031_calendar_date`,
                  },
                ]}
                done="You saw the selection without running any of it."
              />
              <p>
                <strong>You should see</strong>{" "}your model, its raw parent, the
                source table behind that, and your model&apos;s two tests. dbt
                adds a selected model&apos;s tests automatically. Listing builds
                nothing, so you don&apos;t have to guess.
              </p>
            </>
          ),
        },
        {
          id: "daily-loop",
          title: "Use the smallest command that answers your question",
          body: (
            <>
              <p>
                Choose the command for the question you have now. Use{" "}
                <code>dbt compile</code>{" "}to inspect the SQL, or{" "}
                <code>dbt build</code>{" "}when you need to check the built model
                and its tests. From your second model on, this is the loop.
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
                Here are five quick situations to practise on. Choose the smallest
                command that does the job for each.
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
      blurb: "Commit your model, push it and open a pull request, then read the checks",
      minutes: 20,
      steps: [
        {
          id: "branch-commit",
          body: (
            <>
              <p>
                Start with your tested model and its YAML file. You&apos;ll
                commit both, push the commit and open a pull request for review.
                It&apos;s the Git loop from Git essentials, for real this time.
                First check which branch you&apos;re on, before you stage either
                file.
              </p>
              <CodeBlock
                lang="bash"
                code={`git status`}
              />
              <p>
                <strong>You should see</strong>{" "}
                <code>On branch feat/fin-week-staging</code>, with your{" "}
                <code>.sql</code>{" "}and <code>.yml</code>{" "}files listed under{" "}
                <code>Untracked files</code>, and nothing else. Don&apos;t stage
                anything you don&apos;t recognise.
              </p>
              <p>
                If it says <code>On branch main</code>, create your branch now with{" "}
                <code>git switch -c feat/fin-week-staging</code>. Your
                uncommitted changes move with you. Don&apos;t pull until those
                changes are safely on a branch.
              </p>
              <p>Then stage, commit and push.</p>
              <CodeBlock
                lang="bash"
                code={`
git add models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.sql
git add models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.yml
git diff --staged
git commit -m "feat: add financial week staging model"
git push -u origin feat/fin-week-staging
`}
              />
              <p>
                <code>git diff --staged</code>{" "}shows what goes into the
                commit. Read it before you commit. The message follows Conventional
                Commits: a type such as <code>feat</code>{" "}or <code>fix</code>, a
                colon, then a short description. The <code>-u origin</code>{" "}part
                creates the branch on GitHub and links it to yours. After this first
                push, plain <code>git push</code>{" "}is enough.
              </p>
              <p>
                You cloned over HTTPS, which needs no sign-in for a public
                repository. Pushing does, so the first push asks who you are:
              </p>
              <ul>
                <li>
                  On Windows, Git Credential Manager opens a window asking you to
                  sign in to GitHub, usually through your browser. Sign in with the
                  account the organisation added. Git stores the result, so later
                  pushes don&apos;t ask.
                </li>
                <li>In Codespaces, you&apos;re already signed in.</li>
                <li>
                  On macOS, Git may ask for a username and password in the
                  terminal. GitHub doesn&apos;t accept your account password there.
                  Install{" "}
                  <a href="https://github.com/git-ecosystem/git-credential-manager">
                    Git Credential Manager
                  </a>{" "}
                  to get the browser sign-in, or ask the team which route they use.
                </li>
              </ul>
              <p>
                If the push fails with <code>403</code>{" "}or{" "}
                <em>permission denied</em>, your GitHub account probably isn&apos;t
                in the organisation yet. Ask your team lead.
              </p>
            </>
          ),
        },
        {
          id: "pr",
          title: "Do: open the pull request",
          body: (
            <>
              <p>
                Open the pull request from the link in your push output.{" "}
                <strong>You should see</strong>{" "}a line that starts{" "}
                <code>Create a pull request for</code>, followed by the link. If you&apos;ve installed the GitHub CLI and signed in
                with <code>gh auth login</code>,{" "}
                <code>gh pr create --web</code>{" "}opens the same form. Setup
                doesn&apos;t install it, so it&apos;s optional.
              </p>
              <p>
                Check the title. It needs the same Conventional Commits form as
                your commit, and a CI check enforces it. With one commit, GitHub
                fills it in from your commit message. The squash commit on main
                will use this title.
              </p>
              <p>
                The description box opens with the project&apos;s template. Fill it
                in so a stranger could follow it.
              </p>
              <CodeBlock
                lang="text"
                code={`
## Why

Adds stg_reference_lookup_ncl_fin_week_number_2019_2031, one row per
calendar date. Weekly activity reports need NHS financial weeks and nothing
stages this table today.

## Checks

- dbt build -s stg_reference_lookup_ncl_fin_week_number_2019_2031 green locally
- Grain test passes: calendar_date is unique and never null
- Review question: I dropped the NEW_ prefix from the source columns. Is there
  an older week definition the names should tell apart?

## Changelog

Changelog: NHS financial weeks are now available as a staging model.
`}
              />
              <p>
                The Checks section is the habit that makes reviews fast. Say what
                you checked and what you noticed. This repository is public, so use
                counts and other aggregates there. Never paste rows or screenshots
                of real data.
              </p>
              <p>
                Select <strong>Create pull request</strong>. Then, in the{" "}
                <strong>Reviewers</strong>{" "}box on the right, request a review from
                a teammate. Ask your team lead who reviews dbt changes if
                you&apos;re not sure. Nobody is assigned to review automatically.
              </p>
            </>
          ),
        },
        {
          id: "checks",
          title: "Read the checks on your pull request",
          body: (
            <>
              <p>
                Automated checks run on your pull request and report at the
                bottom of the PR page.{" "}
                <strong>Within a couple of minutes you should see</strong>{" "}them
                running. They compile the project, look for
                hard-coded table names, and check the PR title and your model&apos;s
                description, tests and owner. <strong>CodeRabbit</strong>, an
                automated reviewer, also comments on your changes.
              </p>
              <p>
                These checks compile and analyse the project, but they don&apos;t
                build your model. On an ordinary push, the validation check only
                reports that its work is waiting for the merge queue. The queue
                builds the exact change that would land, in DEV, once your PR is
                approved.
              </p>
              <p>
                To see a DEV build sooner, add the <code>❄️snowflake-ci</code>{" "}
                label to the PR. The workflow merges the current main into your
                branch, builds your changed models in DEV the same way, and removes
                the label. The result shows as a separate check that doesn&apos;t
                block merging. Later commits aren&apos;t rebuilt, so add the label
                again to repeat it.
              </p>
              <p>
                While you wait, read your own changes in the{" "}
                <strong>Files changed</strong>{" "}tab. Everyone finds something.
              </p>
            </>
          ),
          check: {
            prompt: "CodeRabbit leaves a comment you're fairly sure is wrong. You should…",
            options: [
              "Apply it anyway, because automated reviewers are authoritative",
              "Ignore it silently",
              "Reply explaining why you're keeping it as it is. Disagreeing with reasons is a normal review response",
              "Close the PR and re-open to clear the comments",
            ],
            answer: 2,
            explain:
              "Automated review comments are suggestions, not gates. Act on the good ones and reply to the rest with your reasons, so the human reviewer sees both. The exception is a data-safety finding, which you must fix before merging.",
            affirm: "automated comments are suggestions, and disagreeing with reasons is a fine response.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "merge-and-after",
      waypoint: "merge",
      title: "Merge, and what happens next",
      blurb: "Answer review comments, merge to main, and see what production does with your model",
      minutes: 15,
      steps: [
        {
          id: "respond",
          body: (
            <>
              <p>
                Read the reviewer&apos;s comments on your open PR. When a comment
                calls for a code change, make it on the same branch, then commit
                and push.
              </p>
              <CodeBlock
                lang="bash"
                code={`
git add -u
git commit -m "fix: rename week number column to match conventions"
git push
`}
              />
              <p>
                <code>git add -u</code>{" "}stages changes to files Git already
                tracks, so it won&apos;t pick up stray new files. Then{" "}
                <strong>reply to the comment</strong>, for example &quot;done in
                abc123&quot;, so the reviewer doesn&apos;t have to re-read
                everything. If you disagree with a comment, say why in the thread.
                Reviewers often lack context that you have.
              </p>
            </>
          ),
        },
        {
          id: "merge",
          title: "Do: merge through the merge queue",
          body: (
            <>
              <p>
                Once a reviewer approves and the checks pass, select{" "}
                <strong>Merge when ready</strong>. That puts your PR in the merge
                queue. The queue builds your changed models in the DEV__ databases
                and runs their tests. If they pass, it squash-merges your PR, so
                your branch&apos;s commits become one commit on main. If they fail,
                the PR leaves the queue and you fix it like any red check.
              </p>
              <p>
                Wait until the PR page says <strong>Merged</strong>. If GitHub
                offers a <strong>Delete branch</strong>{" "}button, use it. Then, on
                your machine, update main and delete your local branch.
              </p>
              <CodeBlock
                lang="bash"
                code={`
git switch main
git pull
git branch -d feat/fin-week-staging
`}
              />
              <p>
                <code>git branch -d</code>{" "}may refuse and say the branch is{" "}
                <em>not fully merged</em>. That&apos;s expected after a squash
                merge. The commit on main is new, so Git can&apos;t tell your
                branch&apos;s commits went into it. Before you force the delete,
                check the PR holds everything on your branch.
              </p>
              <CodeBlock
                lang="bash"
                code={`git log --oneline -1 feat/fin-week-staging`}
              />
              <p>
                Compare that commit ID with the last commit in the PR&apos;s{" "}
                <strong>Commits</strong>{" "}tab. If they match,{" "}
                <code>git branch -D feat/fin-week-staging</code>{" "}is safe. If they
                don&apos;t, you have a commit the PR never got. Keep it by pushing
                the branch under a new name, or ask the team, before you delete
                anything.
              </p>
              <p>
                <strong>You should see</strong>{" "}your two files in{" "}
                <code>models/staging/shared/reference/</code>{" "}on main. On GitHub,
                the <strong>Actions</strong>{" "}tab shows a{" "}
                <strong>dbt Deploy to Production</strong>{" "}run starting after the
                merge. It builds your model in production Snowflake, at{" "}
                <code>STAGING.REFERENCE.STG_REFERENCE_LOOKUP_NCL_FIN_WEEK_NUMBER_2019_2031</code>.
              </p>
            </>
          ),
        },
        {
          id: "after",
          title: "What happens to your model after merge",
          body: (
            <>
              <p>
                After merge, the deploy workflow builds your model in
                production. From then on, scheduled builds rebuild it and run its
                tests whenever their selection includes it. Staging models carry
                the <code>daily</code>{" "}tag, so a 06:00 scheduled build picks yours up
                each morning.
              </p>
              <ul>
                <li>
                  If duplicate dates reach the source in six months, your grain
                  test fails and dbt skips the downstream models in that build.
                  Skipped tables keep their old rows. Your model is a view, and so
                  are some of the models that read it. A view runs its query each
                  time someone reads it, so those show the duplicates straight
                  away.
                </li>
                <li>
                  Your descriptions show up in dbt docs and as comments in
                  Snowflake.
                </li>
                <li>Anyone can <code>ref()</code>{" "}your model and build on it.</li>
              </ul>
              <p>
                That&apos;s the whole loop from development to production. A
                one-line fix and a new disease register take the same route. It
                felt slow this time. Your second PR goes much faster.
              </p>
              <p>
                Your second PR will probably start from a business question, and it
                will change or combine models that already exist. Start with{" "}
                <Link href="/learn/finding-models">Finding models</Link>. Then use
                the <Link href="/practice/change-a-model">Change an existing model</Link>{" "}
                walkthrough for the downstream checks. To see how the team keeps an
                eye on models in production, read{" "}
                <Link href="/learn/observing-production">Observing production</Link>.
              </p>
            </>
          ),
          check: {
            prompt: "Six months on, duplicate rows reach the source. Who finds out, and how?",
            options: [
              "A dashboard user notices odd numbers and emails around",
              "The scheduled build: it rebuilds your model, the grain test fails, and dbt skips the downstream models",
              "Nobody, unless someone re-checks the model",
              "Snowflake blocks the duplicate rows automatically",
            ],
            answer: 1,
            explain:
              "The failing test fails the run and opens an issue. dbt skips the downstream models, so skipped tables keep their older rows. Your view, and any downstream view, already show the duplicates, because a view reads its inputs each time it's queried.",
            affirm: "a failed test stops dbt rebuilding downstream tables. Views still show the new rows.",
          },
        },
      ],
    },
  ],
};
