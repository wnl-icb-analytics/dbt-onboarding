import type { Course } from "@/lib/course-types";
import { Callout } from "@/components/Callout";
import { CodeBlock } from "@/components/CodeBlock";
import { Dag } from "@/components/Dag";
import { LayerCake } from "@/components/LayerCake";
import { LayerSorter } from "@/components/LayerSorter";
import { ModelFinder } from "@/components/ModelFinder";
import { ModelJourney } from "@/components/ModelJourney";
import { ScriptChaos } from "@/components/ScriptChaos";
import { TestFailFlow } from "@/components/TestFailFlow";
import { TestProbe } from "@/components/TestProbe";
import { GrainFanout } from "@/components/GrainFanout";
import { BranchToProd } from "@/components/BranchToProd";
import { YamlWorkshop } from "@/components/YamlWorkshop";

export const UNDERSTANDING_DBT_COURSE: Course = {
  slug: "understanding-dbt",
  title: "Understanding dbt",
  tagline: "What dbt is and why it exists, in pictures, before you ever run it",
  audience:
    "For SQL analysts who have never used dbt. Nothing to install and nothing to run. Short visual steps, with a question at each one. Take it after Git essentials and before Your first PR.",
  hours: "~1¼ hrs",
  accent: "var(--layer-modelling)",
  lessons: [
    // ------------------------------------------------------------------
    {
      slug: "the-problem",
      title: "The problem dbt solves",
      blurb: "dbt works out the order your SQL runs in, so nobody has to remember it",
      minutes: 7,
      steps: [
        {
          id: "chaos",
          body: (
            <>
              <p>
                dbt builds tables and views from SQL files called{" "}
                <strong>models</strong>. When one model reads another, dbt
                spots the link and builds the input first. Nobody has to
                remember the order.
              </p>
              <p>
                Without dbt, somebody does. Analytics teams build up a pile of
                SQL, with views, scripts and a &quot;FINAL_v3&quot; table
                nobody dares drop. The SQL itself is usually fine. The trouble
                is everything around it, starting with the order it runs in.
                Here are four scripts from a shared folder. Click them in the
                order you think they run.
              </p>
              <ScriptChaos />
            </>
          ),
          interact: true,
        },
        {
          id: "two-ideas",
          title: "The team shares the code, and dbt reads the dependencies",
          body: (
            <>
              <p>
                dbt (data build tool) rests on two ideas. The team keeps its
                models in one shared Git repository. And each model names its
                inputs, so dbt can work out what has to build first.
              </p>
              <p>
                <strong>One shared codebase</strong>{" "}means each concept gets
                one definition, every change has a history, and someone reviews
                the work before it ships. That&apos;s why Git essentials came
                first.
              </p>
              <p>
                <strong>Every transformation is a SELECT statement</strong>{" "}
                whose inputs dbt can read. dbt works out the run order from the
                code itself, fresh each time it runs. So the order can&apos;t
                walk out of the door when someone leaves.
              </p>
            </>
          ),
          check: {
            prompt:
              "The analyst who knew the run order leaves, and their notes are lost. The team is on dbt. What breaks?",
            options: [
              "Nothing. Every model names its inputs, so dbt works out the order from the code on every run",
              "The nightly run, until someone reconstructs the order",
              "Only the models the analyst wrote",
              "dbt keeps working from the last order it remembers",
            ],
            answer: 0,
            explain:
              "There's no run-order knowledge to lose. dbt recomputes the order from the SQL every time, so none of it lives in anyone's head.",
            affirm: "the order lives in the SQL, and dbt works it out.",
          },
        },
        {
          id: "what-it-is-not",
          title: "dbt transforms data that's already in Snowflake",
          body: (
            <>
              <p>
                dbt{" "}
                <strong>transforms data that&apos;s already in the warehouse</strong>{" "}
                into clean, tested tables and views that analysts and dashboards
                can query. It doesn&apos;t load the feeds. They land in
                Snowflake by other routes. It doesn&apos;t serve dashboards
                either. That happens downstream.
              </p>
              <div className="my-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <span className="rounded-xl border-2 border-dashed border-line px-4 py-2 text-sm text-ink-faint">
                  feeds land
                </span>
                <span className="font-mono text-flame">→</span>
                <span className="rounded-xl border-2 border-ink bg-flame-soft px-4 py-2 font-display text-sm font-bold">
                  dbt transforms
                </span>
                <span className="font-mono text-flame">→</span>
                <span className="rounded-xl border-2 border-dashed border-line px-4 py-2 text-sm text-ink-faint">
                  dashboards consume
                </span>
              </div>
              <p>
                You still write SELECT statements against Snowflake. What
                changes is where the SQL lives and what happens to it there.
                dbt runs it in the right order and tests it when it builds, and
                a teammate reviews it before it ships.
              </p>
            </>
          ),
          check: {
            prompt:
              "A brand-new feed needs to start landing in Snowflake every night. Is that dbt work?",
            options: [
              "No. Loading happens upstream of dbt, and dbt transforms the data once it has landed",
              "Yes. dbt loads and transforms",
              "Yes, as long as the feed is declared in YAML first",
              "Only if the feed arrives as SQL",
            ],
            answer: 0,
            explain:
              "dbt is the T in ELT (extract, load, transform). Getting the feed into the warehouse is a separate job. Once it lands, dbt takes over.",
            affirm: "dbt transforms what's already in the warehouse.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "a-model-is-a-select",
      title: "A model is a SELECT",
      blurb: "You write the SELECT. dbt writes the CREATE and picks the destination",
      minutes: 8,
      steps: [
        {
          id: "build-it",
          body: (
            <>
              <p>
                A <strong>model</strong>{" "}is a <code>.sql</code>{" "}file
                holding a SELECT statement. The SELECT describes the rows you
                want, and dbt builds the result in Snowflake as a view or a
                table. Step through what happens when dbt builds this one.
              </p>
              <ModelJourney />
              <p>
                You describe the rows and dbt does the rest. It resolves the
                references, wraps your SELECT in a <code>CREATE VIEW</code>{" "}or{" "}
                <code>CREATE TABLE</code>, picks where to build it and sends the
                finished SQL to Snowflake.
              </p>
            </>
          ),
          interact: true,
        },
        {
          id: "whats-missing",
          title: "dbt writes the CREATE statement for you",
          body: (
            <>
              <p>
                You write the SELECT, and dbt writes the SQL that creates the
                view or table. That&apos;s why the file has no{" "}
                <code>CREATE</code>, no <code>DROP</code>{" "}and no database or
                schema names. A worksheet script needs all of that around its
                SELECT. In dbt, the project&apos;s settings supply it.
              </p>
              <p>
                Whether dbt wraps your SELECT in a view or a table is the
                model&apos;s <strong>materialisation</strong>. You rarely choose
                it model by model. In this project the folder decides. Staging
                models build as views. Modelling and reporting models build as
                tables.
              </p>
              <p>
                Either way, dbt rebuilds the object from scratch on each run.
                Run it twice and you get the same object twice, so rebuilding
                is safe. The exception is <strong>incremental</strong> models.
                They add new rows to a table that already exists instead of
                rebuilding it, which saves time on very large tables. The
                project has a handful. You won&apos;t need them yet.
              </p>
            </>
          ),
          check: {
            prompt:
              "A colleague pastes their old worksheet script into a new model file. It has a CREATE TABLE, some INSERTs and a DROP. What needs to change?",
            options: [
              "Strip it back to one SELECT. dbt supplies the CREATE and the destination",
              "Nothing. dbt runs whatever SQL it finds",
              "Add the schema name so dbt knows where to build it",
              "Swap the DROP for TRUNCATE",
            ],
            answer: 0,
            explain:
              "A model describes rows, nothing more. The DDL around it is dbt's job. That's what makes rebuilds safe, and it lets the same file build in any environment.",
            affirm: "you write the SELECT. dbt writes the DDL.",
          },
        },
        {
          id: "two-destinations",
          title: "The same file builds in dev and in production",
          body: (
            <>
              <p>
                When you build a model on your machine, dbt writes it to a
                shared development database. After your change merges into{" "}
                <code>main</code>, the deploy builds the production version from
                the same file. You never hardcode where a model builds.
              </p>
              <CodeBlock
                lang="text"
                code={`
your SQL:    select person_id, postcode from …
development: DEV__STAGING.OLIDS.STG_PEOPLE
production:  STAGING.OLIDS.STG_PEOPLE
`}
              />
              <p>
                Shared project configuration handles the difference. Here,
                development databases get a <code>DEV__</code>{" "}prefix. You
                write the SELECT once, and dbt picks the destination for
                whichever environment is running it.
              </p>
            </>
          ),
          check: {
            prompt: "What changes between your dev build and the production build of a model?",
            options: [
              "The destination it builds into. The SQL file is identical",
              "You maintain a dev copy and a prod copy of the file",
              "The SELECT is rewritten for production",
              "Nothing. Dev builds go straight to production",
            ],
            answer: 0,
            explain:
              "One file serves all environments. Configuration decides where the object is created, not your SQL.",
            affirm: "one file, a different destination per environment.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "ref-draws-the-map",
      title: "ref() draws the map",
      blurb: "Name the model you read from, and dbt records the dependency",
      minutes: 9,
      steps: [
        {
          id: "ref",
          body: (
            <>
              <p>
                <code>ref()</code>{" "}names the model your query reads. dbt
                swaps it for the right table or view name for your build, and
                notes that your model depends on that input. In a worksheet
                you&apos;d write <code>from STAGING.DBT_RAW.RAW_PEOPLE</code>.
                In dbt you point at the model that builds that table instead.
              </p>
              <CodeBlock
                lang="sql"
                code={`
select person_id, postcode
from {{ ref('raw_people') }}
`}
              />
              <p>
                The double curly braces are <strong>Jinja</strong>, the
                templating language dbt uses. Before anything reaches
                Snowflake, dbt swaps everything between <code>{"{{"}</code>{" "}
                and <code>{"}}"}</code>{" "}for plain SQL. While you develop,
                this one becomes <code>DEV__STAGING.DBT_RAW.RAW_PEOPLE</code>.
              </p>
              <p>
                So <code>ref(&apos;raw_people&apos;)</code>{" "}means &quot;the
                table that <code>raw_people.sql</code>{" "}builds, wherever that
                is&quot;. The second job matters as much. Each call{" "}
                <strong>records a dependency</strong>. Your model now sits
                downstream of <code>raw_people</code>, and dbt knows to build{" "}
                <code>raw_people</code>{" "}first.
              </p>
            </>
          ),
          check: {
            prompt: "What does `ref('raw_people')` give dbt besides a table name?",
            options: [
              "A dependency arrow, so dbt knows the build order",
              "A copy of every row",
              "A test for duplicates",
              "Permission to change production",
            ],
            answer: 0,
            explain:
              "ref() resolves the table name and records the dependency. Put all those arrows together and you have the build order.",
            affirm: "ref() names the table and draws the dependency.",
          },
        },
        {
          id: "dag",
          title: "The DAG is the map of every dependency",
          body: (
            <>
              <p>
                The <strong>DAG</strong>{" "}is the map dbt draws from every{" "}
                <code>ref()</code>{" "}call in the project, plus the{" "}
                <code>source()</code>{" "}calls you&apos;ll meet next. The
                letters stand for directed acyclic graph. Directed, because each
                arrow points from an input to the model that uses it. Acyclic,
                because no model can end up depending on itself. Here&apos;s a
                real slice of ours. Hover over any node.
              </p>
              <Dag />
              <p>
                The DAG is how dbt always builds upstream models first.
                It&apos;s also how anyone can trace what feeds a number, or what
                breaks if a column changes, without opening a single file.
              </p>
            </>
          ),
          check: {
            prompt: "You want to rename a column in a staging model. How do you know what might break?",
            options: [
              "Search every file and hope",
              "Follow the model's downstream arrows in the DAG",
              "Rename it and wait for complaints",
              "You can't know until the nightly build",
            ],
            answer: 1,
            explain:
              "dbt records dependencies, so you can follow them both ways. Everything downstream of your model is the list of things that could break.",
            affirm: "the DAG shows what depends on your model before you change it.",
          },
        },
        {
          id: "source",
          title: "source() reads tables built outside this project",
          body: (
            <>
              <p>
                <code>source()</code>{" "}names an input table that this project
                doesn&apos;t build. You declare the table once in YAML, then read
                it with <code>source()</code>{" "}instead of <code>ref()</code>.
                These <strong>sources</strong>{" "}are the dotted nodes in the
                DAG, the feeds landing in the data lake. Some come from outside
                the team. Others, like OLIDS, are built by the team&apos;s own
                upstream dbt-olids project. A generated raw model reads one like
                this.
              </p>
              <CodeBlock
                lang="sql"
                code={`
-- raw_olids_observation.sql (generated)
select
    "PERSON_ID" as person_id,
    …
from {{ source('olids', 'OBSERVATION') }}
`}
              />
              <p>
                In this project, only the generated raw layer calls{" "}
                <code>source()</code>. Every model you write uses{" "}
                <code>ref()</code>. So if a feed changes, only one layer has to
                change with it.
              </p>
              <Callout kind="smell" title="Spot the smell">
                <p>
                  The trap is that a hardcoded{" "}
                  <code>DATABASE.SCHEMA.TABLE</code>{" "}in a model still
                  compiles. Your dev build reads production tables without
                  warning, and the dependency never appears on the map. The PR&apos;s code quality check fails on three-part
                  names after <code>FROM</code>{" "}or <code>JOIN</code>, and a
                  reviewer will ask for the same fix. The fix is always{" "}
                  <code>ref()</code>.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt: "Why is hardcoding `STAGING.CSDS.STG_X` in a model a problem?",
            options: [
              "dbt refuses to compile it",
              "It breaks dev/prod separation and hides the dependency from the DAG",
              "Fully-qualified names are slower in Snowflake",
              "It only matters if the table is renamed",
            ],
            answer: 1,
            explain:
              "The danger is that it works. Your dev build quietly reads production objects, and lineage and build order can't see the dependency.",
            affirm: "hardcoded names hide the arrow and break dev/prod separation.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "the-layer-cake",
      title: "Which layer a model belongs in",
      blurb: "Five core layers, each with its own job",
      minutes: 11,
      steps: [
        {
          id: "why-layers",
          body: (
            <>
              <p>
                A <strong>layer</strong>{" "}groups models by the job they do.
                Staging, for example, cleans one source table, so every model
                that reads it gets the same column names and types.
              </p>
              <p>
                Without layers, each script repeats the whole journey from raw
                feed to finished number. The same column gets cleaned a dozen
                slightly different ways in a dozen scripts. The project avoids
                this by giving each model one clear{" "}
                <strong>responsibility</strong>, then stacking those
                responsibilities in layers. Clean once near the bottom. Build
                reusable blocks in the middle. Assemble finished datasets at
                the top. Data mostly flows upward, but it isn&apos;t a rigid
                ladder. A modelling block can build on a reporting fact or
                dimension rather than repeat its logic. What never bends is the
                rule that the job decides the layer.
              </p>
              <p>
                Each layer also makes a <strong>promise</strong>{" "}to everything
                above it. Once data leaves staging, its names and types are
                settled. Modelling settles the definitions, reporting fixes the
                shape and published locks down governance. Anything a lower
                layer has settled is a question you never ask again, and the
                strictness exists to buy you that.
              </p>
            </>
          ),
          check: {
            prompt: "What decides which layer a model belongs in?",
            options: [
              "The job the model is doing",
              "Which data source it touches",
              "How large the result is",
              "Who wrote it",
            ],
            answer: 0,
            explain:
              "Job, not data. Cleaning one table is staging work. Joining and deriving is modelling work, whatever the data is about.",
            affirm: "the job picks the layer, not the data.",
          },
        },
        {
          id: "cake",
          title: "Staging prepares one table, and modelling adds shared meaning",
          body: (
            <>
              <p>
                The project has five core layers. Click each one to see its job
                and how it builds.
              </p>
              <LayerCake />
              <p>
                Two layers need pinning down now.{" "}
                <strong>Staging</strong>{" "}prepares one source table for the
                rest of the project. It normally has no joins. A join belongs
                there only when it cleans, standardises or enriches the data in
                a way every consumer should inherit.{" "}
                <strong>Modelling</strong>{" "}is where shared domain meaning
                lives, along with most of the joins and derived values.
              </p>
              <p>
                Watch out for one naming trap. The Snowflake database is also
                called <code>STAGING</code>, and it holds two layers. Raw models
                all build in its single <code>DBT_RAW</code>{" "}schema. Staging
                models build in a schema named after their source system, such
                as <code>STAGING.CSDS</code>, <code>STAGING.OLIDS</code>{" "}and{" "}
                <code>STAGING.REFERENCE</code>. Development mirrors the same
                layout in <code>DEV__STAGING</code>.
              </p>
            </>
          ),
          check: {
            prompt: "A staging model needs a join to apply one programme's eligibility rule. What does that tell you?",
            options: [
              "Programme rules are fine in staging if the join is small",
              "This isn't universal source preparation. It belongs in a programme-scoped modelling model",
              "The join should go in the raw layer instead",
              "All joins belong in reporting",
            ],
            answer: 1,
            explain:
              "One programme's rule isn't universal source preparation. Staging joins are kept for cleaning, standardisation or enrichment that every consumer should inherit.",
            affirm: "universal source preparation can stay in staging. Programme rules can't.",
          },
        },
        {
          id: "sorter",
          title: "Place five real models in their layers",
          body: (
            <>
              <p>
                Here are five real model descriptions. For each one, ask
                &quot;what job is this model doing?&quot; and place it.
              </p>
              <LayerSorter />
              <p>
                One practical payoff before you move on. Hundreds of tested
                models already sit in these layers. Most new analysis starts by
                joining two or three of them. It doesn&apos;t start by
                rebuilding a patient spine from raw feeds.
              </p>
            </>
          ),
          interact: true,
        },
        {
          id: "define-vs-deliver",
          title: "Defining a concept and delivering it are separate jobs",
          body: (
            <>
              <p>
                Defining a concept and delivering it are different jobs, done by
                different models. <em>Defining</em>{" "}means deciding what
                counts, once, with tests. <em>Delivering</em>{" "}means putting
                it in a shape people can use. A wide model can present many concepts without owning the logic
                of any of them. Each definition lives in its own upstream model
                and gets tested there.
              </p>
              <p>
                The guide&apos;s <em>Designing models</em>{" "}lesson goes much
                further, into grain, boundaries and when to split a model or
                widen it.
              </p>
            </>
          ),
          check: {
            prompt:
              "obt_person_activity presents A&E, admission, outpatient and GP counts in one wide row. Which of those definitions does it own?",
            options: [
              "All of them. It delivers them, so it defines them",
              "None of them. Each recent-activity model owns its dataset, and the wide model owns only how they're put together",
              "Only the A&E selection",
              "Whichever one changed most recently",
            ],
            answer: 1,
            explain:
              "Delivering a concept and defining it are separate jobs. Each fct_person_*_recent model owns its dataset's selection. The wide model puts those settled answers together, one row per person.",
            affirm: "wide models put settled definitions together. They don't own them.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "names-are-the-map",
      title: "Names are the map",
      blurb: "Read any model name, and search before you build",
      minutes: 9,
      steps: [
        {
          id: "grammar",
          body: (
            <>
              <p>
                A model&apos;s name tells you its{" "}
                <strong>layer, subject and shape</strong>, so you can tell what
                it holds before you open it. Use those clues to search for a
                model before you write one. The project has more than 3,000
                models, far too many to browse, and the names are built the same
                way so they work as an index. Read these three without opening
                a file.
              </p>
              <div className="my-6 flex flex-col gap-2.5">
                {[
                  {
                    name: ["int_", "hba1c", "_latest"],
                    gloss: "modelling layer · HbA1c results · most recent per person",
                  },
                  {
                    name: ["fct_", "person_diabetes", "_register"],
                    gloss: "reporting layer · people with diabetes · a disease register",
                  },
                  {
                    name: ["stg_", "olids_observation", ""],
                    gloss: "staging layer · the OLIDS observation table, cleaned",
                  },
                ].map(({ name, gloss }) => (
                  <div
                    key={gloss}
                    className="rounded-xl border border-line bg-paper-warm/60 px-4 py-3"
                  >
                    <p className="!my-0 font-mono text-[13px]">
                      <span className="font-bold text-flame-deep">{name[0]}</span>
                      <span className="text-ink">{name[1]}</span>
                      <span className="font-bold text-layer-modelling">{name[2]}</span>
                    </p>
                    <p className="!mb-0 !mt-1 text-xs !text-ink-faint">{gloss}</p>
                  </div>
                ))}
              </div>
              <div className="my-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-flame)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-flame-deep">
                    prefix · the layer
                  </p>
                  <p className="!mb-0 !mt-2 text-sm !text-ink-soft">
                    The job, from the layers lesson. <code>stg_</code>{" "}cleans,{" "}
                    <code>int_</code>{" "}derives, and <code>dim_</code>/<code>fct_</code>{" "}
                    serve analysis.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-ink)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-ink">
                    middle · the subject
                  </p>
                  <p className="!mb-0 !mt-2 text-sm !text-ink-soft">
                    Entity first, then attribute, as in{" "}
                    <code>person_ethnicity</code>{" "}or{" "}
                    <code>practice_neighbourhood</code>. Related models then sit
                    together in any sorted list.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-modelling)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-layer-modelling">
                    suffix · the shape
                  </p>
                  <p className="!mb-0 !mt-2 text-sm !text-ink-soft">
                    What one row means, as in <code>_all</code>,{" "}
                    <code>_latest</code>, <code>_register</code>{" "}or{" "}
                    <code>_summary</code>. More on this next.
                  </p>
                </div>
              </div>
              <p>
                Two things follow. First, the skill travels with you.{" "}
                <code>stg_</code>{" "}and <code>int_</code>{" "}come from dbt
                Labs&apos; own style guide, and lots of dbt projects use{" "}
                <code>fct_</code>{" "}and <code>dim_</code>{" "}for their finished
                tables. Second, the grammar cuts both ways. When you name a
                model, you&apos;re writing the search result the next analyst
                will find, or miss.
              </p>
            </>
          ),
          check: {
            prompt:
              "Without opening it, what does `int_smoking_status_latest` contain?",
            options: [
              "A modelling-layer block holding each person's most recent smoking status",
              "Every smoking status ever recorded, one row per observation",
              "A staging model cleaning the smoking feed",
              "A report on smoking rates by practice",
            ],
            answer: 0,
            explain:
              "int_ is the modelling layer, smoking_status is the subject and _latest means most recent per person. The name gave you all three.",
            affirm: "layer, subject, shape. The name is a sentence.",
          },
        },
        {
          id: "words",
          title: "Facts are what you measure, and dimensions describe it",
          body: (
            <>
              <p>
                A <code>fct_</code>{" "}model records what you measure. A{" "}
                <code>dim_</code>{" "}model describes it, so you can break the
                count down. One might record who is on the diabetes register.
                Another gives each person&apos;s ethnicity, so you can group the
                register by it.
              </p>
              <p>
                The words come from <strong>dimensional modelling</strong>, the
                approach to warehouse design that Ralph Kimball wrote down in the
                1990s. Most analytics teams still build on it.
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-reporting)]">
                  <p className="!my-0 font-mono text-[13px] font-bold !text-ink">fct_ · fact</p>
                  <p className="!mb-0 !mt-2 text-sm !text-ink-soft">
                    <strong>What you measure.</strong> Events that happened, or
                    states that hold, always at a stated grain. The textbook
                    example is <code>fct_sales</code>, one row per transaction.
                    Ours is <code>fct_person_diabetes_register</code>, one row
                    per person on the register.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                  <p className="!my-0 font-mono text-[13px] font-bold !text-ink">dim_ · dimension</p>
                  <p className="!mb-0 !mt-2 text-sm !text-ink-soft">
                    <strong>How you slice it.</strong> The context around the
                    measurement, like who the person is, which practice
                    they&apos;re registered with and what area they live in. The
                    textbook example is <code>dim_customer</code>. Ours is{" "}
                    <code>dim_person_ethnicity</code>.
                  </p>
                </div>
              </div>
              <p>
                Healthcare analytics bends the textbook examples, but the idea
                survives. Our facts are rarely tills ringing. They&apos;re
                person-level clinical states, like being on a register, a
                screening status or blood pressure control. Person dimensions
                look different too. There is a <code>dim_person</code>{" "}and a
                wider <code>dim_person_demographics</code>, but many person
                attributes also get their own narrow model, like{" "}
                <code>dim_person_ethnicity</code>{" "}or{" "}
                <code>dim_person_housebound_status</code>. You join the ones you
                need. The roles still hold.{" "}
                <em>
                  Facts are the thing you count. Dimensions are what you break
                  the count down by.
                </em>
              </p>
              <p>The other prefixes sit around that pair:</p>
              <ul>
                <li>
                  <code>stg_</code>{" "}is a source table, cleaned. No meaning has
                  been added yet.
                </li>
                <li>
                  <code>int_</code>{" "}is dbt&apos;s own term, not
                  Kimball&apos;s. It&apos;s the intermediate workbench where
                  facts and dimensions get assembled. You can reuse it, but it
                  isn&apos;t the finished article.
                </li>
                <li>
                  <code>obt_</code>{" "}stands for &quot;one big table&quot;. It
                  joins facts and dimensions in advance, for tools that want one
                  wide table instead of a star of joins.
                </li>
                <li>
                  <code>pit_</code>{" "}means point in time. It&apos;s a fact as
                  it stood on a reference date, for reporting on a past period
                  the way QOF does.
                </li>
              </ul>
            </>
          ),
          check: {
            prompt:
              "`fct_person_asthma_register` is one row per person on the asthma register. Why is it a fact, not a dimension?",
            options: [
              "It's the thing being measured and reported. Dimensions like ethnicity or practice are the context you break it down by",
              "Facts are always larger tables than dimensions",
              "Anything at person grain is automatically a fact",
              "Because it lives in the reporting layer",
            ],
            answer: 0,
            explain:
              "Fact or dimension is about role, not size or grain. The register is what you count. Ethnicity, age and practice are how you slice the count. Both can be one row per person.",
            affirm: "facts are what you measure. Dimensions are how you slice it.",
          },
        },
        {
          id: "suffixes",
          title: "_all and _latest differ in what one row means",
          body: (
            <>
              <p>
                <code>_all</code>{" "}and <code>_latest</code>{" "}models hold the
                same subject at different grains. What separates them is{" "}
                <strong>what one row means</strong>. These pairs turn up all
                over the modelling layer.
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-modelling)]">
                  <p className="!my-0 font-mono text-[13px] font-bold !text-ink">int_hba1c_all</p>
                  <p className="!mb-0 !mt-1.5 text-sm !text-ink-soft">
                    Every HbA1c test recorded, valid or not.{" "}
                    <strong>One row per observation and source cluster.</strong>{" "}
                    A person with twenty tests has at least twenty rows.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                  <p className="!my-0 font-mono text-[13px] font-bold !text-ink">int_hba1c_latest</p>
                  <p className="!mb-0 !mt-1.5 text-sm !text-ink-soft">
                    The latest valid HbA1c only.{" "}
                    <strong>One row per person.</strong> Built for joining onto
                    person-level analysis.
                  </p>
                </div>
              </div>
              <p>
                Blood pressure, BMI, eGFR, cholesterol and smoking status follow
                the same pattern, but each <code>_all</code>{" "}has its own grain.{" "}
                <code>int_blood_pressure_all</code>{" "}keeps one paired reading per
                person per clinical date, not every reading. The model&apos;s YAML
                description states its grain, so read it first. Pick by the
                question. Trends over time need{" "}
                <code>_all</code>. &quot;What is it now, for each
                person?&quot; needs <code>_latest</code>. Join the wrong one and
                anyone with repeat tests silently multiplies your rows.
              </p>
            </>
          ),
          check: {
            prompt:
              "You join `int_blood_pressure_all` onto a one-row-per-person list, when you wanted `_latest`. What happens?",
            options: [
              "Nothing. The tables hold the same data",
              "Each person repeats once per date with a blood pressure reading, so your row count multiplies",
              "dbt refuses the join because the grains differ",
              "Only people with no readings are affected",
            ],
            answer: 1,
            explain:
              "int_blood_pressure_all has one row per person per clinical date, so the join fans your list out. The suffix was the warning. It tells you what one row means before you join.",
            affirm: "the suffix says what one row means. Read it before you join.",
          },
        },
        {
          id: "finder",
          title: "Search for a model by its concept before you build one",
          body: (
            <>
              <p>
                To find a model, type its concept into a search box. In VS Code,
                press <code>Ctrl+P</code>{" "}(<code>⌘P</code>{" "}on a Mac) to
                open <strong>file search</strong>. It filters the
                project&apos;s files as you type, and because names follow the
                grammar, the concept usually finds the model. Most models build a Snowflake object with
                the same name, so the same trick usually works in Snowsight&apos;s
                search box. Some set an <code>alias</code>{" "}instead.{" "}
                <code>emis_olids_reg_comparison_all_direct_care</code>{" "}builds as{" "}
                <code>emis_olids_reg_comparison_all</code>, for example. In{" "}
                <code>ref()</code>, always use the model name. When Snowsight
                can&apos;t find one, check the model&apos;s config for an alias.
                Or compile a model that refs it, and read the real table name in
                the compiled SQL.
              </p>
              <p>
                Here are five real situations. Find each model by typing the
                concept.
              </p>
              <ModelFinder />
              <p>
                This habit saves more time than any other in this project.
                Someone has probably built it already, and the name will find
                it. Searching first takes thirty seconds. Rebuilding an existing
                block takes days, and earns you a review comment.
              </p>
            </>
          ),
          interact: true,
          check: {
            prompt:
              "A colleague asks whether the project tracks who is housebound. Your fastest first move?",
            options: [
              "Type `housebound` into the editor's file search",
              "Ask in the team channel and wait",
              "Start writing a model that derives it from observations",
              "Browse the folder tree top to bottom",
            ],
            answer: 0,
            explain:
              "The naming convention turns search into an index, and dim_person_housebound_status turns up in seconds. The channel and the folder tree work too, but the name is faster. Building first is how duplicates happen.",
            affirm: "search names first. Someone has probably built it.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "yaml-describes-the-project",
      title: "YAML describes the project",
      blurb: "A YAML file beside each model holds its description and tests",
      minutes: 9,
      steps: [
        {
          id: "two-files",
          body: (
            <>
              <p>
                A model&apos;s <code>.yml</code>{" "}file tells dbt about the rows
                its <code>.sql</code>{" "}file builds. The SQL says which rows to
                build. The YAML beside it records the model&apos;s name, its
                columns, what it means and the rules its data must obey.
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink bg-graphite-deep p-4 text-white shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                  <span className="font-display text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7ee2c0]">
                    stg_people.sql
                  </span>
                  <p className="!mb-0 !mt-2 font-mono text-[12px] leading-6 !text-white/80">
                    select person_id, postcode
                    <br />
                    from {"{{ ref('raw_people') }}"}
                  </p>
                  <p className="!mb-0 !mt-3 text-sm !text-white/65">What rows should exist?</p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-modelling)]">
                  <span className="font-display text-[10px] font-extrabold uppercase tracking-[0.16em] text-layer-modelling">
                    stg_people.yml
                  </span>
                  <p className="!mb-0 !mt-2 font-mono text-[12px] leading-6 !text-ink-soft">
                    models:<br />
                    {"  - name: stg_people"}<br />
                    {"    columns: …"}
                  </p>
                  <p className="!mb-0 !mt-3 text-sm">What does dbt know about them?</p>
                </div>
              </div>
              <p>
                YAML isn&apos;t another programming language. It&apos;s a
                compact way to write nested information. dbt calls these files{" "}
                <strong>properties files</strong>. You can name them anything,
                as long as they end in <code>.yml</code>{" "}and sit inside the
                folders dbt reads. In this project, a model&apos;s YAML file
                normally has the same name as its SQL file and sits right next
                to it.
              </p>
            </>
          ),
          check: {
            prompt: "Which file tells dbt that `person_id` should be unique?",
            options: [
              "The model's SQL file",
              "A YAML properties file beside the model",
              "The compiled SQL in `target/`",
              "The Snowflake worksheet that first explored the data",
            ],
            answer: 1,
            explain:
              "SQL describes the rows. YAML attaches knowledge to the model, like descriptions, columns and data tests.",
            affirm: "SQL builds the rows. YAML describes and tests them.",
          },
        },
        {
          id: "grammar",
          title: "Keys, dashes and indentation carry the structure",
          body: (
            <>
              <p>
                YAML uses three marks. A key and value name a property, a dash
                starts a list item, and indentation shows what belongs to what.
                Here&apos;s a short properties file.
              </p>
              <CodeBlock
                lang="yaml"
                code={`version: 2
models:
  - name: stg_people
    description: One row per person
    columns:
      - name: person_id
        data_tests:
          - not_null
          - unique`}
              />
              <p>
                Read it from the left edge. A <code>key: value</code>{" "}pair
                names a property. A dash starts one item in a list. Extra
                indentation means &quot;this belongs to the thing above&quot;.
                So <code>person_id</code>{" "}is a column inside{" "}
                <code>stg_people</code>, and its two tests belong to that
                column.
              </p>
              <p>
                The first line, <code>version: 2</code>, labels the file format.
                Newer versions of dbt don&apos;t need it, and many of the
                project&apos;s files leave it out. When it&apos;s there, it
                stays against the left edge.
              </p>
              <Callout kind="warn" title="Spaces carry meaning">
                <p>
                  YAML has no brackets to show nesting. The spaces do that job.
                  Use spaces, never tabs, and match the file&apos;s existing
                  indentation. This project uses two spaces per level.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt: "In YAML, what makes `data_tests` belong to the `person_id` column?",
            options: [
              "The filename",
              "Its indentation beneath the column item",
              "The order dbt reads the lines",
              "The word `columns` earlier in the file",
            ],
            answer: 1,
            explain:
              "Indentation is structure in YAML. Move data_tests left or right and a different object owns it, even though every word stays the same.",
            affirm: "indentation says what belongs inside what.",
          },
        },
        {
          id: "workshop",
          title: "Repair a YAML file and add a column",
          body: (
            <>
              <p>
                Repair the first file, then add a second column. Work from the
                top down, and put each line inside its parent before moving on.
                Pressing Tab inserts two spaces. If you get stuck, ask for the
                next move and the workshop explains one line at a time.
              </p>
              <YamlWorkshop />
            </>
          ),
          interact: true,
        },
        {
          id: "meaning",
          title: "Siblings line up, and children move right",
          body: (
            <>
              <p>
                Indentation shows which tests belong to which column. In the{" "}
                <code>stg_people</code>{" "}file, <code>person_id</code>{" "}sits
                in the model&apos;s columns list, and its tests sit one level
                further in, under <code>data_tests</code>. It helps to read YAML
                as a tree rather than punctuation. The file has a list of
                models. The model has a list of columns. Each column has a list
                of tests. Siblings line up. Children move right.
              </p>
              <p>
                You don&apos;t need to memorise every property. In the real
                repo, copy the nearest good example and change the values. For
                now, you need to see the structure and keep the indentation
                intact. One misplaced line changes what dbt thinks you
                described.
              </p>
            </>
          ),
          check: {
            prompt: "You add `postcode` directly beneath `person_id` with four extra spaces. What have you described?",
            options: [
              "A second column beside person_id",
              "A property nested inside person_id, not a sibling column",
              "A second model",
              "Valid YAML that dbt automatically moves into columns",
            ],
            answer: 1,
            explain:
              "Items in the same list have to start at the same indentation. Push postcode farther right and it nests inside the person_id item instead of becoming another column.",
            affirm: "siblings line up. Children move right.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "tests-are-promises",
      title: "Tests are promises",
      blurb: "Rules you write in YAML, which dbt checks against the built data",
      minutes: 8,
      steps: [
        {
          id: "probe",
          body: (
            <>
              <p>
                A <strong>data test</strong>{" "}finds rows that break a rule. You
                declare the rule in the model&apos;s YAML, and dbt turns it into
                a query. A <code>not_null</code>{" "}test, for example, looks for
                rows where the column has no value. Tests are some of the most
                useful lines in the file. Run all three against this table.
              </p>
              <TestProbe />
            </>
          ),
          interact: true,
          check: {
            prompt: "A `dbt test` passes when its query returns…",
            options: [
              "All the rows that satisfy the rule",
              "A single row containing true",
              "Zero rows",
              "The same row count as the model",
            ],
            answer: 2,
            explain:
              "Tests select the rows that break the rule, not the ones that pass. An empty result means nothing broke it.",
            affirm: "tests hunt for rule-breakers. Zero rows means pass.",
          },
        },
        {
          id: "grain",
          title: "A uniqueness test checks the grain",
          body: (
            <>
              <p>
                A <code>unique</code>{" "}test checks the table&apos;s{" "}
                <em>grain</em>, its answer to{" "}
                <strong>one row per what?</strong>{" "}If you expect one row per
                person, testing <code>person_id</code>{" "}for duplicates catches
                a join that gives someone two rows. Without the test, that join
                fails silently. Watch it happen.
              </p>
              <GrainFanout />
              <p>
                Sometimes the grain spans two columns, like &quot;one row per
                site per weekday&quot;. Neither column is unique on its own, so
                the test goes on the <strong>combination</strong>. In this
                project that&apos;s usually{" "}
                <code>dbt_utils.unique_combination_of_columns</code>, which
                takes the list of columns that make up the grain.
              </p>
            </>
          ),
          interact: true,
          check: {
            prompt: "Grain: one row per site per weekday. Which test catches a join that duplicates rows?",
            options: [
              "`unique` on `site_code`",
              "`unique` on the combination of `site_code` and `day_of_week`",
              "`not_null` on both columns",
              "A row-count test with a generous range",
            ],
            answer: 1,
            explain:
              "unique on site_code alone fails straight away, because each site rightly has seven rows. Only the combination matches the grain, so only that test catches a fan-out.",
            affirm: "test the combination. That's what the grain is.",
          },
        },
        {
          id: "always-on",
          title: "dbt build tests each model before building what depends on it",
          body: (
            <>
              <p>
                <code>dbt build</code>{" "}builds each selected model, then runs
                its tests before it builds the models downstream. The team
                builds this way locally, when a pull request is built in DEV,
                and in production builds that select the model. You can also
                run tests on their own with <code>dbt test</code>. The PR checks
                expect at least one test on every model outside the raw layer.
              </p>
              <p>
                Now picture the feed starting to send duplicates six months
                from now. Step through what the scheduled run does.
              </p>
              <TestFailFlow />
              <p>
                Look at the order. dbt builds first, then tests. So the failed
                model keeps its new rows, and anyone who queries it directly
                sees them. What the failure stops is the <em>spread</em>. dbt
                skips the models downstream, so they keep their last good
                version. dbt offers you a deal. Write down what you know about
                the data once, and the pipeline checks it whenever the model is
                selected, without you.
              </p>
            </>
          ),
          interact: true,
          check: {
            prompt: "Six months on, a feed starts sending duplicate rows. Who finds out first, and how?",
            options: [
              "A dashboard user notices odd numbers",
              "A scheduled build that selects it. The model is updated, its grain test fails and the selected downstream models are skipped",
              "Nobody, unless someone re-checks the model",
              "Snowflake blocks duplicates automatically",
            ],
            answer: 1,
            explain:
              "A test is your understanding of the data, written as an assertion that runs whenever the model is selected. The failed model stays updated, but dbt doesn't pass it on through the selected DAG. Downstream tables stay on their previous version.",
            affirm: "the failed model is isolated. Downstream data stays on its previous version.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "branch-to-production",
      title: "From branch to production",
      blurb: "How a reviewed change reaches production, and when production runs it",
      minutes: 8,
      steps: [
        {
          id: "path",
          body: (
            <>
              <p>
                Your model reaches production through a reviewed pull request.
                Follow one change from your branch, through the checks and
                review, to the deploy from <code>main</code>. This brings
                together Git from the first course and the models and tests
                from this one. Click each stage.
              </p>
              <BranchToProd />
            </>
          ),
          interact: true,
          check: {
            prompt: "How does new code become eligible to run in production?",
            options: [
              "Running an unmerged branch with a production target",
              "A pull request that passes its checks and is merged to `main`",
              "Asking an administrator to copy it across",
              "Waiting. The dev environment syncs its code to production nightly",
            ],
            answer: 1,
            explain:
              "Review and merge decide which code may run in production. Scheduled runs and authorised manual runs then execute code from main. They shouldn't be used to run unreviewed branch code.",
            affirm: "review and merge decide which code production is allowed to run.",
          },
        },
        {
          id: "freedom",
          title: "Development stays separate from production",
          body: (
            <>
              <p>
                Your local builds and the team&apos;s merge checks write to
                shared development databases. Production builds run the
                reviewed code on <code>main</code>{" "}and write to the
                production databases. Both sets live in the same Snowflake
                account, so know which one you&apos;re touching before you work
                in the real project.
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-layer-staging">
                    dev · where you work
                  </p>
                  <p className="!mb-0 !mt-2 font-mono text-[11px] leading-5 !text-ink-soft">
                    DEV__STAGING · DEV__MODELLING · DEV__REPORTING
                  </p>
                  <dl className="!mb-0 !mt-3 flex flex-col gap-1.5 text-sm">
                    <div className="rounded-lg bg-paper-warm px-3 py-1.5">
                      <dt className="font-mono text-[10px] uppercase text-ink-faint">written by</dt>
                      <dd className="!my-0 text-ink-soft">your builds, your teammates&apos; builds and merge-queue checks</dd>
                    </div>
                    <div className="rounded-lg bg-paper-warm px-3 py-1.5">
                      <dt className="font-mono text-[10px] uppercase text-ink-faint">read by</dt>
                      <dd className="!my-0 text-ink-soft">no report or dashboard, ever</dd>
                    </div>
                  </dl>
                  <p className="!mb-0 !mt-3 text-sm !text-ink-soft">
                    Build nonsense, break a model, rebuild it. Dev objects are
                    cheap to recreate.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-reporting)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-layer-reporting">
                    prod · what the org reads
                  </p>
                  <p className="!mb-0 !mt-2 font-mono text-[11px] leading-5 !text-ink-soft">
                    STAGING · MODELLING · REPORTING
                  </p>
                  <dl className="!mb-0 !mt-3 flex flex-col gap-1.5 text-sm">
                    <div className="rounded-lg bg-paper-warm px-3 py-1.5">
                      <dt className="font-mono text-[10px] uppercase text-ink-faint">written by</dt>
                      <dd className="!my-0 text-ink-soft">deploys and scheduled runs of reviewed code from main</dd>
                    </div>
                    <div className="rounded-lg bg-paper-warm px-3 py-1.5">
                      <dt className="font-mono text-[10px] uppercase text-ink-faint">read by</dt>
                      <dd className="!my-0 text-ink-soft">every dashboard and report</dd>
                    </div>
                  </dl>
                  <p className="!mb-0 !mt-3 text-sm !text-ink-soft">
                    Reached only through a merge, or a deliberate, authorised
                    manual run.
                  </p>
                </div>
              </div>
              <p>
                One honest caveat. Dev is shared by the whole analytics team.
                It isn&apos;t a private sandbox. If a teammate rebuilds the same
                model, they overwrite your dev copy. That&apos;s normal, and
                sometimes worth a heads-up in the team channel.
              </p>
              <p>
                dbt connects to Snowflake through a named{" "}
                <strong>target</strong>, and your everyday target is dev. The
                target routes model builds. With dev, the project&apos;s naming
                macro sends them to the <code>DEV__</code>{" "}databases, so a
                normal build can&apos;t overwrite a production model.
              </p>
              <p>
                The target isn&apos;t a permission boundary, though. Both local
                targets connect with the same <code>SNOWFLAKE_ROLE</code>{" "}from
                your <code>.env</code>. Snowflake grants on that role decide what
                you can read and write. And seeds use shared locations. They skip
                the <code>DEV__</code>{" "}prefix and always load to{" "}
                <code>DATA_LAKE__NCL.DBT_SEEDS</code>, so <code>dbt seed</code>{" "}
                on your machine writes the table production reads. Leave
                production builds to the workflows, and ask the team before you
                load a seed.
              </p>
            </>
          ),
        },
        {
          id: "manual-production",
          title: "You can start a production run, but ask the team first",
          body: (
            <>
              <p>
                Analysts can trigger production runs. That helps when
                upstream data arrives late and a model needs rerunning before
                the next scheduled run. It also helps when an incremental model
                needs a deliberate <code>--full-refresh</code>. That throws away
                the existing table and rebuilds it from scratch, to recover from
                a problem or pick up a change.
              </p>
              <p>
                Manual production runs shouldn&apos;t be your everyday route,
                though. They reach further, they can overlap scheduled work, and
                they need the same care as any operational change. Run reviewed
                code from <code>main</code>, through the GitHub workflows rather
                than your own machine. Pick the workflow by what it selects:
              </p>
              <ul>
                <li>
                  <em>dbt Deploy to Production</em>{" "}(<code>dbt-deploy.yml</code>)
                  has a <em>Run workflow</em>{" "}button. A manual run takes no
                  selection and builds the whole project in production, without a
                  full refresh. It&apos;s a heavy tool.
                </li>
                <li>
                  The scheduled workflow (<code>dbt-scheduled.yml</code>) runs one
                  named run type, such as <code>daily</code>,{" "}
                  <code>weekly</code>{" "}or <code>monthly-full-refresh</code>. Each
                  builds the same selection as its scheduled run.
                </li>
              </ul>
              <p>
                Ask the team before you start either, and avoid clashing with
                scheduled work. When an incremental model needs a full refresh
                because of your change, add the <code>🔄full-refresh</code>{" "}
                label to the PR before it merges. The deploy then rebuilds your
                changed models and everything downstream of them from scratch.
              </p>
              <Callout kind="info" title="Merge controls what. The run controls when">
                <p>
                  A manual run doesn&apos;t publish branch code. It reruns code
                  that has already passed review and reached <code>main</code>.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt: "When does a manual production run make sense?",
            options: [
              "To test unreviewed changes from your branch against production",
              "As the default way to develop a model",
              "To rerun reviewed code after late upstream data, or deliberately `--full-refresh` an incremental model",
              "Whenever a dev build is slower than expected",
            ],
            answer: 2,
            explain:
              "Manual production runs are an operational tool for reviewed code. They help when timing or incremental state needs a hand. The normal development loop is dev, PR, merge and scheduled production.",
            affirm: "manual production runs are deliberate operational work, not the development loop.",
          },
        },
        {
          id: "handoff",
          title: "Next, you take one model down this path yourself",
          body: (
            <>
              <p>
                In <strong>Your first PR</strong>, you&apos;ll take one staging
                model through this whole path. You&apos;ll set up a development
                connection, build and test the model, then open it for review.
                You learn the dbt commands as you need them. The guide is there
                when you want more depth.
              </p>
              <p>
                Here&apos;s the mental model to take with you. Models are
                SELECTs. <code>ref()</code>{" "}draws the map. Layers give each
                model one job. Names tell you what exists. YAML records what dbt
                knows about each model. Tests check the data when their models
                build. And only reviewed code from <code>main</code>{" "}runs in
                production.
              </p>
            </>
          ),
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "fundamentals-check",
      title: "Can you predict dbt?",
      blurb: "Eight situations to confirm the mental model",
      minutes: 8,
      steps: [
        {
          id: "intro",
          body: (
            <p>
              For each of these eight situations, predict what dbt does.
              There are no commands to remember.
            </p>
          ),
        },
        {
          id: "q-model",
          title: "1. What a model file holds",
          body: <p>A colleague opens <code>stg_people.sql</code>{" "}for the first time.</p>,
          check: {
            prompt: "What do they find inside?",
            options: [
              "A SELECT statement, with no CREATE or INSERT",
              "CREATE TABLE and INSERT statements",
              "A YAML description of the columns",
              "A list of models to run, in order",
            ],
            answer: 0,
            explain: "A model is a SELECT. The DDL around it is dbt's job, and the YAML lives in a separate file beside it.",
            affirm: "a model is a SELECT. dbt writes the DDL.",
          },
        },
        {
          id: "q-ref",
          title: "2. What ref() tells dbt",
          body: <p><code>dim_people.sql</code>{" "}contains <code>{"{{ ref('stg_people') }}"}</code>.</p>,
          check: {
            prompt: "What does dbt learn from that?",
            options: [
              "dim_people depends on stg_people, so stg_people builds first",
              "Both models must always run together",
              "stg_people is a source feed",
              "dim_people belongs in the staging layer",
            ],
            answer: 0,
            explain: "ref() records the dependency. The build order comes from all the arrows together.",
            affirm: "ref() draws the dependency arrow.",
          },
        },
        {
          id: "q-yaml",
          title: "3. Why two columns line up",
          body: (
            <CodeBlock
              lang="yaml"
              code={`models:
  - name: stg_people
    columns:
      - name: person_id
      - name: postcode`}
            />
          ),
          check: {
            prompt: "Why do `person_id` and `postcode` start at exactly the same indentation?",
            options: [
              "They are sibling items in the model's columns list",
              "YAML requires every name to start in the same place",
              "They belong to different models",
              "The indentation is cosmetic; only the dashes matter",
            ],
            answer: 0,
            explain:
              "Both dashes start items in the same columns list. If one moved farther right, it would nest inside the other item instead of sitting beside it.",
            affirm: "siblings line up at the same indentation.",
          },
        },
        {
          id: "q-layer",
          title: "4. Which layer a reusable derived block belongs in",
          body: <p>A model joins GP observations to derive a reusable smoking-status block.</p>,
          check: {
            prompt: "Which layer does it belong in?",
            options: [
              "Staging, because it reads staged data",
              "Modelling, because joining and deriving reusable blocks is its job",
              "Raw, because it's close to the source",
              "Reporting, because analysts will use it",
            ],
            answer: 1,
            explain: "The responsibility picks the layer. A reusable smoking status is shared domain meaning, so it belongs in modelling. Staging joins are limited to universal source preparation.",
            affirm: "the job picks the layer.",
          },
        },
        {
          id: "q-test",
          title: "5. What three rows from a test mean",
          body: <p>A <code>unique</code>{" "}test on <code>person_id</code>{" "}compiles and runs its query.</p>,
          check: {
            prompt: "The query returns 3 rows. What happened?",
            options: [
              "Pass. It found 3 valid people",
              "Fail. It found 3 values breaking the uniqueness rule",
              "Pass. Fewer than 10 rows counts as passing",
              "Nothing. Tests don't query real data",
            ],
            answer: 1,
            explain: "Tests select violations. Three rows back means three duplicated values. Only an empty result is a pass.",
            affirm: "rows returned means the rule is broken.",
          },
        },
        {
          id: "q-dev",
          title: "6. What a bad dev build affects",
          body: <p>While developing, you build a model with a bad join and ruin its output.</p>,
          check: {
            prompt: "Which reports or dashboards show wrong numbers?",
            options: [
              "None. It built into the shared DEV__ databases, and nothing downstream reads from dev",
              "Any dashboard on that model, immediately",
              "Any dashboard on that model, from tonight's build",
              "None, because dbt refused to build it",
            ],
            answer: 0,
            explain:
              "Your normal local target builds into the DEV__ databases, the team's shared, disposable copy of the warehouse. Production is a separate target, used for deploys, schedules and authorised manual runs.",
            affirm: "the normal development target builds into shared dev, separate from production.",
          },
        },
        {
          id: "q-name",
          title: "7. Where new work starts",
          body: <p>A new piece of work needs each person&apos;s most recent smoking status.</p>,
          check: {
            prompt: "Your first move?",
            options: [
              "Search the project for `smoking`. A model like int_smoking_status_latest probably exists",
              "Write a new model deriving it from observations",
              "Query the raw feed directly in a worksheet",
              "Ask the team to build it",
            ],
            answer: 0,
            explain:
              "The naming grammar of layer, subject and shape turns search into an index. int_smoking_status_latest is the one-row-per-person block the work needs, and it already exists.",
            affirm: "search names before building anything.",
          },
        },
        {
          id: "q-change",
          title: "8. What merging does to production",
          body: <p>Your PR is approved, the checks are green and you merge it to main.</p>,
          check: {
            prompt: "What happens to production?",
            options: [
              "The deploy builds your change into production, and scheduled builds keep it fresh after that",
              "Nothing until you run `dbt build` from your machine",
              "An administrator copies your tables across manually",
              "Production updates only at the end of the month",
            ],
            answer: 0,
            explain: "Merging makes the change eligible for production. The deploy builds what changed plus everything downstream of it, and scheduled runs keep selected models fresh on their own timetable.",
            affirm: "merge deploys. Scheduled builds keep the production model fresh.",
          },
        },
        {
          id: "finish",
          title: "Ready for the real repo",
          body: (
            <Callout kind="info" title="That's the primer">
              <p>
                You can predict what dbt will do, and you know why the project
                is shaped the way it is. Next comes{" "}
                <strong>Your first PR</strong>, where you set up your machine
                and do all of this for real.
              </p>
            </Callout>
          ),
        },
      ],
    },
  ],
};
