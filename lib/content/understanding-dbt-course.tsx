import type { Course } from "@/lib/course-types";
import { Callout } from "@/components/Callout";
import { CodeBlock } from "@/components/CodeBlock";
import { Dag } from "@/components/Dag";
import { LayerCake } from "@/components/LayerCake";
import { LayerSorter } from "@/components/LayerSorter";
import { ModelDesignCompare } from "@/components/ModelDesignCompare";
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
  tagline: "What dbt is and why it exists — in pictures, before you ever run it",
  audience:
    "For SQL analysts who have never used dbt. Nothing to install, nothing to run — short visual chunks with a question at each step. Take it after Git essentials, before Your first PR.",
  hours: "~1¼ hrs",
  accent: "var(--layer-modelling)",
  lessons: [
    // ------------------------------------------------------------------
    {
      slug: "the-problem",
      title: "The problem dbt solves",
      blurb: "Why a folder of good SQL still goes wrong",
      minutes: 7,
      steps: [
        {
          id: "chaos",
          body: (
            <>
              <p>
                Every analytics team accumulates SQL: views, scripts, a
                “FINAL_v3” table nobody dares drop. The SQL itself is usually
                fine. The problem sits around it. Try this:
              </p>
              <ScriptChaos />
            </>
          ),
          interact: true,
        },
        {
          id: "two-ideas",
          title: "Two ideas fix this",
          body: (
            <>
              <p>
                dbt (data build tool) is built on two ideas working together.
              </p>
              <p>
                First, <strong>one shared codebase</strong>: every
                transformation lives in a single git repository, so there is
                one definition of each concept, a full history of every change,
                and a review step before anything ships. That is why Git
                essentials came first.
              </p>
              <p>
                Second, <strong>every transformation is a SELECT statement</strong>{" "}
                whose dependencies dbt can read. The order of operations is
                derived from the code itself, computed fresh on every run —
                never something a person has to remember.
              </p>
            </>
          ),
          check: {
            prompt:
              "The analyst who knew the run order leaves, and their notes are lost. The team is on dbt. What breaks?",
            options: [
              "Nothing — every model names its inputs, so dbt re-derives the order from the code on every run",
              "The nightly run, until someone reconstructs the order",
              "Only the models the analyst wrote",
              "dbt keeps working from the last order it remembers",
            ],
            answer: 0,
            explain:
              "There is no run-order knowledge to lose. The order is recomputed from the SQL itself every time — nothing lives in anyone's head.",
            affirm: "the order lives in the SQL, and dbt derives it.",
          },
        },
        {
          id: "what-it-is-not",
          title: "What dbt is not",
          body: (
            <>
              <p>
                dbt does not move data into Snowflake — feeds land there
                without it. And it does not query data for dashboards — that
                happens downstream. dbt does exactly one job: it{" "}
                <strong>transforms data already in the warehouse</strong>{" "}into
                clean, tested, analysis-ready tables.
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
                You are still writing SELECT statements against Snowflake.
                What changes is that your SQL now lives somewhere it is
                ordered, tested, reviewed and rerun automatically.
              </p>
            </>
          ),
          check: {
            prompt:
              "A brand-new feed needs to start landing in Snowflake every night. Is that dbt work?",
            options: [
              "No — loading happens upstream of dbt; dbt transforms the data once it has landed",
              "Yes — dbt loads and transforms",
              "Yes, as long as the feed is declared in YAML first",
              "Only if the feed arrives as SQL",
            ],
            answer: 0,
            explain:
              "dbt is the T in ELT. Getting the feed into the warehouse is a different job; once it lands, dbt takes over.",
            affirm: "dbt transforms what is already in the warehouse — nothing else.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "a-model-is-a-select",
      title: "A model is a SELECT",
      blurb: "One file, one SELECT — dbt does the rest",
      minutes: 7,
      steps: [
        {
          id: "build-it",
          body: (
            <>
              <p>
                The unit of work in dbt is the <strong>model</strong>: one{" "}
                <code>.sql</code>{" "}file containing one SELECT statement. That is
                the whole definition. Walk this one through what happens when
                dbt builds it:
              </p>
              <ModelJourney />
              <p>
                You describe the rows. dbt resolves the references, adds the{" "}
                <code>CREATE VIEW</code>{" "}or <code>CREATE TABLE</code>, picks
                the right destination, and sends the finished SQL to Snowflake.
              </p>
            </>
          ),
          interact: true,
        },
        {
          id: "whats-missing",
          title: "Notice what's missing",
          body: (
            <>
              <p>
                No <code>CREATE</code>. No <code>DROP</code>. No database or
                schema names. Everything a worksheet script needs around the
                SELECT, dbt supplies — and because models build as{" "}
                <code>create or replace</code>, rebuilding is always safe. Run
                it again, get the same object again.
              </p>
            </>
          ),
          check: {
            prompt:
              "A colleague pastes their old worksheet script — CREATE TABLE, INSERTs, a DROP — into a new model file. What needs to change?",
            options: [
              "Strip it back to one SELECT — dbt supplies the CREATE and the destination itself",
              "Nothing — dbt runs whatever SQL it finds",
              "Add the schema name so dbt knows where to build it",
              "Swap the DROP for TRUNCATE",
            ],
            answer: 0,
            explain:
              "A model is a description of rows, nothing more. The DDL around it is dbt's job — that is exactly what makes rebuilds safe and environments interchangeable.",
            affirm: "one file, one SELECT — dbt writes the DDL.",
          },
        },
        {
          id: "two-destinations",
          title: "Same file, two destinations",
          body: (
            <>
              <p>
                You never hardcode where the model builds. The same file lands
                somewhere safe while you develop, and in production after
                review:
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
                Shared project configuration handles the difference. You write
                the SELECT once; dbt decides the destination for whichever
                environment is doing the work.
              </p>
            </>
          ),
          check: {
            prompt: "What changes between your dev build and the production build of a model?",
            options: [
              "The destination it builds into — the SQL file is identical",
              "You maintain a dev copy and a prod copy of the file",
              "The SELECT is rewritten for production",
              "Nothing — dev builds go straight to production",
            ],
            answer: 0,
            explain:
              "One file serves every environment. Configuration, not your SQL, decides where the object is created.",
            affirm: "one file, different safe destinations.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "ref-draws-the-map",
      title: "ref() draws the map",
      blurb: "One function replaces every hardcoded table name",
      minutes: 8,
      steps: [
        {
          id: "ref",
          body: (
            <>
              <p>
                In a worksheet you would write{" "}
                <code>from STAGING.OLIDS.STG_PEOPLE</code>. In dbt you
                point at the model that builds it:
              </p>
              <CodeBlock
                lang="sql"
                code={`
select person_id, postcode
from {{ ref('raw_people') }}
`}
              />
              <p>
                <code>ref(&apos;raw_people&apos;)</code>{" "}means “the table that{" "}
                <code>raw_people.sql</code>{" "}builds, wherever that is”. Each
                call does two jobs: it resolves to the right location for your
                environment, and it <strong>records the dependency</strong> —
                your model now officially sits downstream of{" "}
                <code>raw_people</code>.
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
              "ref() resolves the relation name and records the dependency. Collect every arrow and you have the build order.",
            affirm: "ref() names the relation and draws the dependency.",
          },
        },
        {
          id: "dag",
          title: "All the arrows together: the DAG",
          body: (
            <>
              <p>
                From every <code>ref()</code>{" "}in the project, dbt assembles one
                map — the <strong>DAG</strong>{" "}(directed acyclic graph). This
                is a real slice of ours. Hover over any node:
              </p>
              <Dag />
              <p>
                The DAG is how dbt always builds upstream models first, and how
                anyone can trace what feeds a number — or what breaks if a
                column changes — without reading a single file.
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
              "Dependencies are recorded, so they are visible in both directions. Everything downstream of your model is exactly the list of things that could break.",
            affirm: "the DAG shows what depends on your model before you change it.",
          },
        },
        {
          id: "source",
          title: "Where the map starts: source()",
          body: (
            <>
              <p>
                The dotted nodes in the DAG are tables nobody in the project
                builds — the feeds landing in the data lake. They are declared
                once in YAML, then referenced with <code>source()</code>{" "}
                instead of <code>ref()</code>.
              </p>
              <p>
                In this project only the generated raw layer calls{" "}
                <code>source()</code>. Everything you write uses{" "}
                <code>ref()</code> — so if a feed changes, only one layer
                moves.
              </p>
              <Callout kind="smell" title="Spot the smell">
                <p>
                  A hardcoded <code>DATABASE.SCHEMA.TABLE</code>{" "}in a model
                  compiles fine — and silently breaks dev/prod separation while
                  hiding the dependency from the map. It will draw a review
                  comment every time. The fix is always <code>ref()</code>.
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
              "The danger is that it works: your dev build quietly reads production objects, and the dependency is invisible to lineage and build ordering.",
            affirm: "hardcoded names hide the arrow and pierce dev/prod separation.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "the-layer-cake",
      title: "Layers: where a model belongs",
      blurb: "Five layers, each with exactly one job",
      minutes: 11,
      steps: [
        {
          id: "why-layers",
          body: (
            <>
              <p>
                Without structure, every script repeats the whole journey from
                raw feed to finished number — so the same column gets cleaned a
                dozen slightly different ways across a dozen scripts.
              </p>
              <p>
                The project fixes this by giving every model exactly one{" "}
                <strong>job</strong>, and stacking the jobs in layers: clean
                once near the bottom, build reusable blocks in the middle,
                assemble finished datasets at the top. Data flows broadly
                upward — though not rigidly: a modelling block can also build
                on reporting facts and dims rather than repeat their logic.
                The rule that never bends is the job.
              </p>
              <p>
                Each layer also makes a <strong>promise</strong>{" "}to everything
                above it: staging promises names and types are settled, modelling
                promises definitions are settled, reporting promises the shape is
                settled, published promises governance is settled. A promise you
                can rely on is a question you never have to ask again — that is
                what the strictness buys.
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
              "Job, not data. Cleaning one table is staging work; joining and deriving is modelling work — whatever the data is about.",
            affirm: "the job picks the layer, not the data.",
          },
        },
        {
          id: "cake",
          title: "Click through the layers",
          body: (
            <>
              <LayerCake />
              <p>
                Two are worth pinning down now. <strong>Staging</strong>{" "}cleans
                one source table — no joins, no business logic, ever.{" "}
                <strong>Modelling</strong>{" "}is where joins and derivations live,
                and where most analyst work happens.
              </p>
              <p>
                The Snowflake database is also named <code>STAGING</code>. Raw models
                all build in its single <code>DBT_RAW</code>{" "}schema. Staging models
                use proper source or domain schemas in the same database, such as
                <code>STAGING.CSDS</code>, <code>STAGING.OLIDS</code>{" "}and
                <code>STAGING.REFERENCE</code>. Development mirrors that layout in
                <code>DEV__STAGING</code>.
              </p>
            </>
          ),
          check: {
            prompt: "A staging model needs a join to look up specialty names. What does that tell you?",
            options: [
              "Joins are fine in staging if they're small",
              "The moment it needs a join, it isn't staging work — it belongs in the modelling layer",
              "The join should go in the raw layer instead",
              "Staging models can join but not filter",
            ],
            answer: 1,
            explain:
              "Staging's one job is cleaning a single source table. Wanting a join is the signal you've started a different job — a modelling (int_) model.",
            affirm: "staging never joins — a join means modelling-layer work.",
          },
        },
        {
          id: "sorter",
          title: "Your turn",
          body: (
            <>
              <p>
                Five real model descriptions. Ask “what job is this model
                doing?” and place each one:
              </p>
              <LayerSorter />
              <p>
                One practical payoff before moving on: hundreds of tested
                models already exist in these layers. Most new analysis starts
                by joining two or three of them — not by rebuilding a patient
                spine from raw feeds.
              </p>
            </>
          ),
          interact: true,
        },
        {
          id: "define-vs-deliver",
          title: "One idea to carry upward",
          body: (
            <>
              <p>
                The layers separate jobs. One more separation matters before you
                design anything: <em>defining</em>{" "}a concept — deciding what
                counts, once, with tests — is a different job from{" "}
                <em>delivering</em>{" "}it in a convenient shape. A wide model can
                present many concepts without owning any of their logic. Toggle
                the two designs:
              </p>
              <ModelDesignCompare />
              <p>
                The handbook&apos;s <em>Designing models</em>{" "}lesson takes this
                much further — grain, boundaries, and when to split versus widen.
              </p>
            </>
          ),
          interact: true,
          check: {
            prompt:
              "obt_person_activity presents A&E, admission, outpatient and GP counts in one wide row. Which of those definitions does it own?",
            options: [
              "All of them — it delivers them, so it defines them",
              "None of them — each recent-contact model owns its dataset; the wide model owns only the composition",
              "Only the A&E selection",
              "Whichever one changed most recently",
            ],
            answer: 1,
            explain:
              "Delivering a concept and defining it are separate jobs. Each fct_person_*_recent model owns its dataset's selection; the wide row composes those settled answers at one row per person.",
            affirm: "wide models compose settled definitions — they don't own them.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "names-are-the-map",
      title: "Names are the map",
      blurb: "Read any model name — and search before you build",
      minutes: 9,
      steps: [
        {
          id: "grammar",
          body: (
            <>
              <p>
                With 1,500+ models, nobody finds anything by browsing folders.
                What makes the project navigable is that every name is built
                the same way — so the names themselves become the index, the
                way a consistent address format is what makes a city
                searchable. Every model name is a little sentence:{" "}
                <strong>layer, subject, shape</strong>. Read these three
                without opening a single file:
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
                    The job, from the layers lesson: <code>stg_</code>{" "}cleans,{" "}
                    <code>int_</code>{" "}derives, <code>dim_</code>/<code>fct_</code>{" "}
                    serve analysis.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-ink)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-ink">
                    middle · the subject
                  </p>
                  <p className="!mb-0 !mt-2 text-sm !text-ink-soft">
                    Entity first, then attribute —{" "}
                    <code>person_ethnicity</code>, <code>practice_neighbourhood</code> —
                    so related models sit together in any sorted list.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-modelling)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-layer-modelling">
                    suffix · the shape
                  </p>
                  <p className="!mb-0 !mt-2 text-sm !text-ink-soft">
                    What one row means — <code>_all</code>, <code>_latest</code>,{" "}
                    <code>_register</code>, <code>_summary</code>. More on this
                    next.
                  </p>
                </div>
              </div>
              <p>
                Two things follow. This is not project-specific cleverness —{" "}
                <code>stg_</code>/<code>int_</code>/<code>fct_</code>/<code>dim_</code>{" "}
                are the wider dbt community&apos;s convention, so reading names
                is a skill that travels. And the grammar cuts both ways: when
                you name a model, you are writing the search result the next
                analyst will find — or miss.
              </p>
            </>
          ),
          check: {
            prompt:
              "Without opening it, what does `int_smoking_status_latest` contain?",
            options: [
              "A modelling-layer block: each person's most recent smoking status",
              "Every smoking status ever recorded, one row per observation",
              "A staging model cleaning the smoking feed",
              "A report on smoking rates by practice",
            ],
            answer: 0,
            explain:
              "int_ = modelling layer, smoking_status = the subject, _latest = most recent per person. The name told you the layer, the subject and the shape.",
            affirm: "layer, subject, shape — the name is a sentence.",
          },
        },
        {
          id: "words",
          title: "What the words actually mean",
          body: (
            <>
              <p>
                These prefixes are not arbitrary labels — most come from{" "}
                <strong>dimensional modelling</strong>, the warehouse-design
                tradition Ralph Kimball wrote down in the 1990s and most
                analytics teams still build on. Two words carry the core idea:
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-reporting)]">
                  <p className="!my-0 font-mono text-[13px] font-bold !text-ink">fct_ · fact</p>
                  <p className="!mb-0 !mt-2 text-sm !text-ink-soft">
                    <strong>What you measure</strong> — events that happened or
                    states that hold, always at a stated grain. The classic
                    example is <code>fct_sales</code>, one row per transaction.
                    Ours: <code>fct_person_diabetes_register</code>, one row
                    per person on the register.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                  <p className="!my-0 font-mono text-[13px] font-bold !text-ink">dim_ · dimension</p>
                  <p className="!mb-0 !mt-2 text-sm !text-ink-soft">
                    <strong>How you slice it</strong> — the descriptive context
                    around the measurement: who the person is, which practice,
                    what area. The classic example is <code>dim_customer</code>.
                    Ours: <code>dim_person_ethnicity</code>.
                  </p>
                </div>
              </div>
              <p>
                Healthcare analytics bends the classic examples without
                changing the idea. Our facts are rarely tills ringing — they
                are person-level clinical states: being on a register, a
                screening status, blood pressure control. And instead of one
                wide <code>dim_person</code>{" "}table, the person dimension is
                decomposed into narrow attribute blocks you join as needed.
                The roles hold: <em>facts are the thing you count; dimensions
                are what you break it down by.</em>
              </p>
              <p>The other prefixes sit around that pair:</p>
              <ul>
                <li>
                  <code>stg_</code> — a source table cleaned, nothing more. No
                  meaning has been added yet.
                </li>
                <li>
                  <code>int_</code> — dbt&apos;s own term, not Kimball&apos;s:
                  the intermediate workbench where facts and dimensions get
                  assembled. Reusable, but not the finished article.
                </li>
                <li>
                  <code>obt_</code> — “one big table”: a fact pre-joined to its
                  dimensions for tools that want one wide table instead of a
                  star of joins.
                </li>
                <li>
                  <code>pit_</code> — point-in-time: a fact as it stood on a
                  reference date, for retrospective (QOF-style) reporting.
                </li>
              </ul>
            </>
          ),
          check: {
            prompt:
              "`fct_person_asthma_register` is one row per person on the asthma register. Why is it a fact, not a dimension?",
            options: [
              "It is the thing being measured and reported — dimensions like ethnicity or practice are the context you break it down by",
              "Facts are always larger tables than dimensions",
              "Anything at person grain is automatically a fact",
              "Because it lives in the reporting layer",
            ],
            answer: 0,
            explain:
              "The fact/dimension split is about role, not size or grain. The register is what you count; ethnicity, age and practice are how you slice the count. Both can be one row per person.",
            affirm: "facts are what you measure; dimensions are how you slice it.",
          },
        },
        {
          id: "suffixes",
          title: "_all and _latest are different tables of the same thing",
          body: (
            <>
              <p>
                The suffix pairs recur across the whole modelling layer, and
                the difference between them is <strong>what one row means</strong>:
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-modelling)]">
                  <p className="!my-0 font-mono text-[13px] font-bold !text-ink">int_hba1c_all</p>
                  <p className="!mb-0 !mt-1.5 text-sm !text-ink-soft">
                    Every HbA1c ever recorded. <strong>One row per test</strong>{" "}
                    — a person with twenty tests has twenty rows.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                  <p className="!my-0 font-mono text-[13px] font-bold !text-ink">int_hba1c_latest</p>
                  <p className="!mb-0 !mt-1.5 text-sm !text-ink-soft">
                    The most recent HbA1c only. <strong>One row per person</strong>{" "}
                    — built for joining onto person-level analysis.
                  </p>
                </div>
              </div>
              <p>
                Same pattern for blood pressure, BMI, eGFR, cholesterol, smoking
                status. Pick by the question: trends over time need{" "}
                <code>_all</code>; “what is it now, per person” needs{" "}
                <code>_latest</code>. Join the wrong one and every person with
                repeat tests silently multiplies your rows.
              </p>
            </>
          ),
          check: {
            prompt:
              "You join `int_blood_pressure_all` onto a one-row-per-person list, when you wanted `_latest`. What happens?",
            options: [
              "Nothing — the tables hold the same data",
              "Each person repeats once per recorded blood pressure — your row count multiplies",
              "dbt refuses the join because the grains differ",
              "Only people with no readings are affected",
            ],
            answer: 1,
            explain:
              "_all is one row per reading, so the join fans your list out. The suffix was the warning — it tells you what one row means before you join.",
            affirm: "the suffix says what one row means — read it before you join.",
          },
        },
        {
          id: "finder",
          title: "Your turn: search before you build",
          body: (
            <>
              <p>
                Because names follow the grammar, any search box becomes an
                index of everything the team has built. In VS Code, press{" "}
                <code>Ctrl+P</code>{" "}(<code>⌘P</code>{" "}on a Mac) to open the{" "}
                <strong>file search</strong>: a box that filters every file in
                the project as you type. And since every model builds a
                Snowflake object with the same name, the same trick works in
                Snowsight&apos;s search box too.
              </p>
              <p>
                Five real situations — find each model by typing the concept:
              </p>
              <ModelFinder />
              <p>
                This is the reflex that saves the most time in this project:
                someone has probably built it, and the name will find it.
                Starting an analysis by searching costs thirty seconds;
                rebuilding an existing block costs days — and a review comment.
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
              "The naming convention makes search the index: dim_person_housebound_status turns up in seconds. The channel and the folder tree work too — but the name is faster, and building first is how duplicates happen.",
            affirm: "search the name space first — someone has probably built it.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "yaml-describes-the-project",
      title: "YAML describes the project",
      blurb: "Keys, lists and indentation, written by you",
      minutes: 9,
      steps: [
        {
          id: "two-files",
          body: (
            <>
              <p>
                A dbt model usually has two sides. The <code>.sql</code>{" "}file
                describes the rows to build. A nearby <code>.yml</code>{" "}file
                describes what dbt should know about those rows: the model&apos;s name,
                its columns, its meaning, and the rules its data must obey.
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink bg-graphite-deep p-4 text-paper shadow-[4px_4px_0_0_var(--color-layer-staging)]">
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
                YAML is not another programming language. It is a compact way to write
                nested information. dbt calls these <strong>properties files</strong>.
                They can have any useful filename, as long as they are <code>.yml</code>{" "}
                files inside the project paths dbt reads.
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
              "SQL describes the rows. YAML attaches knowledge to the model, including descriptions, columns and data tests.",
            affirm: "SQL builds the rows; YAML describes and tests the resource.",
          },
        },
        {
          id: "grammar",
          title: "Three marks carry the structure",
          body: (
            <>
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
                Read it from the left edge. A <code>key: value</code>{" "}pair names a
                property. A dash starts one item in a list. Extra indentation means
                “this belongs inside the thing above.” So <code>person_id</code>{" "}is
                a column inside <code>stg_people</code>, and its two tests belong to that column.
              </p>
              <Callout kind="warn" title="Spaces carry meaning">
                <p>
                  YAML has no brackets to show nesting. The spaces are the brackets.
                  Use spaces, never tabs, and follow the file&apos;s existing indentation.
                  This project uses two spaces for each level.
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
              "Indentation is structure in YAML. Moving data_tests left or right changes which object owns it, even when every word remains the same.",
            affirm: "indentation says what belongs inside what.",
          },
        },
        {
          id: "workshop",
          title: "Your turn: write the structure",
          body: (
            <>
              <p>
                Repair the first file, then add a second column. Work from the top
                down: place each line inside its parent before moving to the next one.
                Pressing Tab inserts two spaces. If you get stuck, ask for the next
                move and the workshop will explain one line at a time.
              </p>
              <YamlWorkshop />
            </>
          ),
          interact: true,
        },
        {
          id: "meaning",
          title: "The shape mirrors the thing described",
          body: (
            <>
              <p>
                The useful trick is to stop seeing YAML as punctuation. Read it as a
                tree: this file has a list of models; this model has a list of columns;
                this column has a list of tests. Siblings line up. Children move right.
              </p>
              <p>
                You do not need to memorise every property. In the real repo, copy the
                nearest good example and change the values. What matters now is being
                able to see the structure, keep the indentation intact, and know that a
                misplaced line changes what dbt thinks you described.
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
              "Sibling list items must start at the same indentation. Moving postcode farther right nests it inside the person_id item instead of adding another column.",
            affirm: "siblings line up; children move right.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "tests-are-promises",
      title: "Tests are promises",
      blurb: "Assertions that run every night, forever",
      minutes: 7,
      steps: [
        {
          id: "probe",
          body: (
            <>
              <p>
                You can now read the YAML structure. One of the most useful things
                nested inside it is a list of <strong>data tests</strong>: rules the
                model&apos;s rows must obey. Each test compiles to a query that hunts for
                rows breaking the rule. Run all three against this table:
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
              "Tests select violations, not successes. An empty result means nothing broke the rule.",
            affirm: "tests hunt for rule-breakers — zero rows means pass.",
          },
        },
        {
          id: "grain",
          title: "The one test that matters most",
          body: (
            <>
              <p>
                Every table answers one question: <strong>one row per
                what?</strong>{" "}That sentence is the table&apos;s{" "}
                <em>grain</em> — and the classic silent failure is a join that
                breaks it. Watch it happen:
              </p>
              <GrainFanout />
              <p>
                When the grain is more than one column — say “one row per site
                per weekday” — neither column is unique on its own, so the
                test goes on the <strong>combination</strong>.
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
              "unique on site_code alone fails immediately — each site legitimately has seven rows. Only the combination matches the grain, so only it detects a fan-out.",
            affirm: "test the combination — that is what the grain actually is.",
          },
        },
        {
          id: "always-on",
          title: "Written once, checked forever",
          body: (
            <>
              <p>
                Tests run when a model is built, again on every pull request,
                and again in the nightly production build. Six months from now
                the feed starts sending duplicates. Step through what that
                night looks like:
              </p>
              <TestFailFlow />
              <p>
                Note the order: dbt builds first, then tests, so the failed
                model itself keeps its new rows — anyone querying it directly
                sees them. What the failure stops is the <em>spread</em>{" "}
                downstream. That is the trade dbt offers: write down what you
                know about the data once, and the pipeline checks it every
                night, forever, without you.
              </p>
            </>
          ),
          interact: true,
          check: {
            prompt: "Six months on, a feed starts sending duplicate rows. Who finds out first, and how?",
            options: [
              "A dashboard user notices odd numbers",
              "The nightly build — the model is updated, its grain test fails, and selected downstream models are skipped",
              "Nobody, unless someone re-checks the model",
              "Snowflake blocks duplicates automatically",
            ],
            answer: 1,
            explain:
              "A test is your understanding of the data turned into an assertion that runs nightly. The failed model remains updated, but dbt does not propagate it through the selected DAG; existing downstream relations stay on their previous version.",
            affirm: "the failed model is isolated; downstream data stays on its previous version.",
          },
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      slug: "branch-to-production",
      title: "From branch to production",
      blurb: "How reviewed code runs safely, on schedule or by deliberate request",
      minutes: 8,
      steps: [
        {
          id: "path",
          body: (
            <>
              <p>
                Put the pieces together: git from the first course, models and
                tests from this one. New code takes one reviewed path before it
                is allowed to run in production. Click each stage:
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
              "Waiting — the dev environment syncs its code to production nightly",
            ],
            answer: 1,
            explain:
              "Review and merge decide which code may run in production. A scheduled or authorised manual production run then executes code from main; it should not be used to run unreviewed branch code.",
            affirm: "review and merge decide which code production is allowed to run.",
          },
        },
        {
          id: "freedom",
          title: "Development stays separate from production",
          body: (
            <>
              <p>
                This is the most useful thing to internalise before touching
                the real project. There are exactly two environments, and they
                are different lanes of the same warehouse:
              </p>
              <div className="my-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-staging)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-layer-staging">
                    dev — where you work
                  </p>
                  <p className="!mb-0 !mt-2 font-mono text-[11px] leading-5 !text-ink-soft">
                    DEV__STAGING · DEV__MODELLING · DEV__REPORTING
                  </p>
                  <dl className="!mb-0 !mt-3 flex flex-col gap-1.5 text-sm">
                    <div className="rounded-lg bg-paper-warm px-3 py-1.5">
                      <dt className="font-mono text-[10px] uppercase text-ink-faint">written by</dt>
                      <dd className="!my-0 text-ink-soft">your local builds — and your teammates&apos;</dd>
                    </div>
                    <div className="rounded-lg bg-paper-warm px-3 py-1.5">
                      <dt className="font-mono text-[10px] uppercase text-ink-faint">read by</dt>
                      <dd className="!my-0 text-ink-soft">no report or dashboard, ever</dd>
                    </div>
                  </dl>
                  <p className="!mb-0 !mt-3 text-sm !text-ink-soft">
                    Build nonsense, break a model, rebuild it — dev objects are
                    cheap to recreate.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_0_var(--color-layer-reporting)]">
                  <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.16em] !text-layer-reporting">
                    prod — what the org reads
                  </p>
                  <p className="!mb-0 !mt-2 font-mono text-[11px] leading-5 !text-ink-soft">
                    STAGING · MODELLING · REPORTING
                  </p>
                  <dl className="!mb-0 !mt-3 flex flex-col gap-1.5 text-sm">
                    <div className="rounded-lg bg-paper-warm px-3 py-1.5">
                      <dt className="font-mono text-[10px] uppercase text-ink-faint">written by</dt>
                      <dd className="!my-0 text-ink-soft">scheduled runs of reviewed code from main</dd>
                    </div>
                    <div className="rounded-lg bg-paper-warm px-3 py-1.5">
                      <dt className="font-mono text-[10px] uppercase text-ink-faint">read by</dt>
                      <dd className="!my-0 text-ink-soft">every dashboard and report</dd>
                    </div>
                  </dl>
                  <p className="!mb-0 !mt-3 text-sm !text-ink-soft">
                    Reached only through merge — or a deliberate, authorised
                    manual run.
                  </p>
                </div>
              </div>
              <p>
                One honest caveat: dev is shared by the whole analytics team,
                not a private sandbox. If a teammate rebuilds the same model,
                they overwrite your dev copy — normal, and occasionally worth
                a heads-up in the team channel. What normal development cannot do
                is touch production accidentally: production uses a separate,
                explicit target and role.
              </p>
            </>
          ),
        },
        {
          id: "manual-production",
          title: "Production can be run manually",
          body: (
            <>
              <p>
                Analysts are authorised to trigger production runs. That is useful
                when upstream data arrives late and a model needs rerunning without
                waiting for the schedule, or when an incremental model needs a
                deliberate <code>--full-refresh</code>{" "}to recover or apply a change.
              </p>
              <p>
                Manual production runs are discouraged as the everyday route. They
                have a wider impact, can overlap scheduled work, and need the same
                care as any operational change: run reviewed code from <code>main</code>,
                select the smallest affected part of the DAG, confirm the production
                target, and tell the team when the run is significant.
              </p>
              <Callout kind="info" title="Merge controls what; the run controls when">
                <p>
                  A manual run does not publish branch code. It reruns code that has
                  already passed review and reached <code>main</code>.
                </p>
              </Callout>
            </>
          ),
          check: {
            prompt: "When is a manual production run appropriate?",
            options: [
              "To test unreviewed changes from your branch against production",
              "As the default way to develop a model",
              "To rerun reviewed code after late upstream data, or deliberately `--full-refresh` an incremental model",
              "Whenever a dev build is slower than expected",
            ],
            answer: 2,
            explain:
              "Manual production runs are an operational tool for reviewed code. They are useful when timing or incremental state needs intervention, but the normal development loop remains dev, PR, merge and scheduled production.",
            affirm: "manual production runs are deliberate operational work, not the development loop.",
          },
        },
        {
          id: "handoff",
          title: "What comes next",
          body: (
            <>
              <p>
                You now have the mental model: models are SELECTs,{" "}
                <code>ref()</code>{" "}draws the map, layers give each model one
                job, names tell you what exists, YAML records what dbt should
                know, tests guard the data nightly, and only reviewed code from{" "}
                <code>main</code>{" "}should run in production.
              </p>
              <p>
                <strong>Your first PR</strong>{" "}makes it real: you will set up
                your machine, learn the actual dbt commands at the moment you
                need them, and take a model of your own down that whole path.
                The handbook stays available for depth when you want it.
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
              No commands to remember. For each situation,
              predict what dbt does.
            </p>
          ),
        },
        {
          id: "q-model",
          title: "1. The model",
          body: <p>A colleague opens <code>stg_people.sql</code>{" "}for the first time.</p>,
          check: {
            prompt: "What do they find inside?",
            options: [
              "One SELECT statement — nothing else",
              "CREATE TABLE and INSERT statements",
              "A YAML description of the columns",
              "A list of models to run, in order",
            ],
            answer: 0,
            explain: "A model is a single SELECT. The DDL around it is dbt's job; the YAML lives in a separate file beside it.",
            affirm: "a model is one SELECT.",
          },
        },
        {
          id: "q-ref",
          title: "2. The arrow",
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
            explain: "ref() records the dependency. The build order falls out of all the arrows together.",
            affirm: "ref() draws the dependency arrow.",
          },
        },
        {
          id: "q-yaml",
          title: "3. The YAML",
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
              "Both dashes begin items in the same columns list. If one moved farther right, it would become nested inside the other item instead of sitting beside it.",
            affirm: "siblings line up at the same indentation.",
          },
        },
        {
          id: "q-layer",
          title: "4. The layer",
          body: <p>A model joins GP observations to derive a reusable smoking-status block.</p>,
          check: {
            prompt: "Which layer does it belong in?",
            options: [
              "Staging — it reads staged data",
              "Modelling — joining and deriving reusable blocks is its job",
              "Raw — it's close to the source",
              "Reporting — analysts will use it",
            ],
            answer: 1,
            explain: "The job picks the layer. Joins and derivations are modelling work; staging never joins; reporting assembles finished datasets that would ref() this block.",
            affirm: "the job picks the layer.",
          },
        },
        {
          id: "q-test",
          title: "5. The test",
          body: <p>A <code>unique</code>{" "}test on <code>person_id</code>{" "}compiles and runs its query.</p>,
          check: {
            prompt: "The query returns 3 rows. What happened?",
            options: [
              "Pass — it found 3 valid people",
              "Fail — it found 3 values breaking the uniqueness rule",
              "Pass — fewer than 10 rows counts as passing",
              "Nothing — tests don't query real data",
            ],
            answer: 1,
            explain: "Tests select violations. Three rows back means three duplicated values; only an empty result is a pass.",
            affirm: "rows returned = rule broken.",
          },
        },
        {
          id: "q-dev",
          title: "6. The dev environment",
          body: <p>While developing, you build a model with a bad join and ruin its output.</p>,
          check: {
            prompt: "Which reports or dashboards show wrong numbers?",
            options: [
              "None — it built into the shared DEV__ databases, and nothing downstream reads from dev",
              "Any dashboard on that model, immediately",
              "Any dashboard on that model, from tonight's build",
              "None, because dbt refused to build it",
            ],
            answer: 0,
            explain:
              "The normal local target lands in the DEV__ databases — the team's shared, disposable copy of the warehouse. Production is a separate explicit target used for deployment, schedules and authorised manual operations.",
            affirm: "the normal development target builds into shared dev, separate from production.",
          },
        },
        {
          id: "q-name",
          title: "7. The name",
          body: <p>A new piece of work needs each person&apos;s most recent smoking status.</p>,
          check: {
            prompt: "Your first move?",
            options: [
              "Search the project for `smoking` — a model like int_smoking_status_latest probably exists",
              "Write a new model deriving it from observations",
              "Query the raw feed directly in a worksheet",
              "Ask the team to build it",
            ],
            answer: 0,
            explain:
              "The naming grammar makes search the index: layer, subject, shape. int_smoking_status_latest is exactly the one-row-per-person block the work needs — and it already exists.",
            affirm: "search the name space before building anything.",
          },
        },
        {
          id: "q-change",
          title: "8. The change",
          body: <p>Your PR is approved, checks are green, and you merge it to main.</p>,
          check: {
            prompt: "What happens to production?",
            options: [
              "The deployment builds your change into production, and the nightly build maintains it from then on",
              "Nothing until you run `dbt build` from your machine",
              "An administrator copies your tables across manually",
              "Production updates only at the end of the month",
            ],
            answer: 0,
            explain: "Merge is the moment a change becomes real: deployment builds it, and the nightly run — models and tests — keeps it fresh without you.",
            affirm: "merge deploys; the nightly build takes it from there.",
          },
        },
        {
          id: "finish",
          title: "Ready for the real repo",
          body: (
            <Callout kind="info" title="Primer complete">
              <p>
                You can predict what dbt will do and why the project is shaped
                the way it is. Next: <strong>Your first PR</strong>, where you
                set up your machine and do all of this for real.
              </p>
            </Callout>
          ),
        },
      ],
    },
  ],
};
