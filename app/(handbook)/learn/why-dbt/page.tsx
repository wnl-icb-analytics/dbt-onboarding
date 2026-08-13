import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { LessonQuote } from "@/components/LessonQuote";
import { Quiz } from "@/components/Quiz";
import Image from "next/image";

export const metadata: Metadata = { title: "Why dbt?" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="why-dbt"
      kicker="Learn 01"
      title="Why dbt?"
      lede="You already write good SQL. dbt takes that SQL and gives it the things scripts in folders never have: order, tests, history and review."
      minutes={8}
    >
      <h2>The problem dbt solves</h2>
      <p>
        Every analytics team accumulates SQL: a view someone built a year ago, a script
        that has to run before another script, a “FINAL_v3” table nobody is sure is
        safe to drop. The SQL itself is usually fine — the problems sit around it:
      </p>
      <ul>
        <li>
          <strong>Order of operations is manual.</strong>{" "}The summary table is only
          right if the reference data refreshed first, which is only right if the feed
          loaded — and the person who knows the sequence runs it by hand. One step out
          of order and the numbers are wrong, with nothing to say so.
        </li>
        <li>
          <strong>Nobody knows what depends on what.</strong>{" "}Renaming a column means
          guessing what might break.
        </li>
        <li>
          <strong>Nothing is tested.</strong>{" "}A duplicate patient row appears, and the first
          you hear is a dashboard looking wrong.
        </li>
        <li>
          <strong>Everything is built end-to-end, every time.</strong>{" "}Each script
          runs the whole journey from source to product privately — the cleaning, the
          lookups, the business logic, all repeated per output and reused by nothing.
          The same column gets cleaned a dozen different ways across a dozen scripts.
        </li>
        <li>
          <strong>Everyone works alone.</strong>{" "}Logic lives in personal worksheets and
          scripts, so five people hold five slightly different definitions of “current
          registration”, there is no history of who changed what, and work leaves when
          its author does.
        </li>
      </ul>
      <p>
        None of this is anyone working badly. Each script was a sensible answer to a
        real request, built with the tools available — and if your current setup looks
        like the list above, it is because that is where every analytics team lands
        without shared machinery. These are properties of the system, not of the
        people in it; they only become visible as a problem when the team and the
        estate grow.
      </p>
      <LessonQuote
        attribution="Tristan Handy, co-creator of dbt and founder of dbt Labs"
        work="Building a Mature Analytics Workflow"
        href="https://www.getdbt.com/blog/building-a-mature-analytics-workflow"
      >
        Analytics doesn&apos;t have to be this way. In fact, the playbook for solving
        these problems already exists — on our software engineering teams.
      </LessonQuote>
      <p>
        dbt (data build tool) addresses this with two ideas working together. First,{" "}
        <strong>a shared codebase</strong>: every transformation lives in one git
        repository, so there is one definition of each concept, full history of every
        change, and a review step before anything ships. Second,{" "}
        <strong>every transformation is a SELECT statement</strong>{" "}whose dependencies
        dbt can read — so the order of operations is derived from the code itself,
        computed fresh on every run, and never something a person has to remember.
      </p>

      <h2>What a dbt model actually is</h2>
      <p>
        A <em>model</em>{" "}is one <code>.sql</code>{" "}file containing one SELECT statement.
        That is the whole definition. This is a real (small) model from our project:
      </p>
      <CodeBlock
        lang="sql"
        title="models/staging/commissioning/stg_csds_bridging.sql"
        code={`
select
    person_id,
    pseudo_nhs_number as sk_patient_id
from {{ ref('raw_csds_bridging') }}
`}
      />
      <p>
        Notice what is missing: no CREATE TABLE, no DROP, no database or schema names.
        That is because <strong>you describe the result; dbt produces the object</strong>.
        When you run <code>dbt run -s stg_csds_bridging</code>, two things happen:
      </p>
      <ol>
        <li>
          <strong>Compile.</strong>{" "}dbt renders the template parts — here,{" "}
          <code>{"{{ ref('raw_csds_bridging') }}"}</code>{" "}becomes the real
          database-qualified table name for whichever environment you are in (the
          DEV__ databases while developing, production after merge).
        </li>
        <li>
          <strong>Run.</strong>{" "}dbt wraps the compiled SELECT in the right DDL and
          executes it in Snowflake. For this model that means, roughly:
        </li>
      </ol>
      <CodeBlock
        lang="sql"
        title="what Snowflake actually receives (dev environment)"
        code={`
create or replace view DEV__STAGING.CSDS.STG_CSDS_BRIDGING as (
    select
        person_id,
        pseudo_nhs_number as sk_patient_id
    from DEV__STAGING.DBT_RAW.RAW_CSDS_BRIDGING
);
`}
      />
      <p>
        Whether the wrapper is <code>create view</code>{" "}or <code>create table</code>,
        and which database it lands in, comes from project configuration — not from
        your file. Rebuilding is always safe because models are{" "}
        <code>create or replace</code>: run it again, get the same object again. You
        can see the compiled SQL for any model with <code>dbt compile</code>.
      </p>
      <p>
        The <code>{"{{ ref('…') }}"}</code>{" "}call is the key mechanism — and remember, a
        model is just another <code>.sql</code>{" "}file in the project. So instead of
        hardcoding a table name, you point at a file: <code>ref(&apos;raw_csds_bridging&apos;)</code>{" "}
        means “the table that <code>raw_csds_bridging.sql</code>{" "}builds, wherever that
        is”. From those references dbt assembles the full dependency graph (the{" "}
        <strong>DAG</strong>) and always builds upstream models first.
      </p>

      <h2>Where dbt sits in the workflow</h2>
      <p>In this team the pipeline looks like:</p>
      <ol>
        <li>
          <strong>Source data lands in Snowflake</strong> — in the{" "}
          <code>DATA_LAKE</code>{" "}database (the main source) and{" "}
          <code>DATA_LAKE__NCL</code>: SUS, CSDS, OLIDS GP data, reference files.
        </li>
        <li>
          <strong>dbt transforms it</strong>{" "}through five layers, explained later in
          this sequence, into
          analytics-ready and published datasets.
        </li>
        <li>
          <strong>Everything downstream consumes dbt outputs</strong> — dashboards,
          ad-hoc analysis, semantic views for AI tools.
        </li>
      </ol>
      <p>
        You are still writing SELECT statements against Snowflake. What changes is that
        your SQL now lives in a repo where it is ordered,
        tested, reviewed and rerun automatically every day.
      </p>

      <Callout kind="info" title="What dbt is not">
        <p>
          dbt does not extract or load data — it only transforms what is already in
          Snowflake (the “T” in ELT). It is also not a scheduler by itself: scheduled
          builds and deployments are run by GitHub Actions workflows — the final
          lesson covers how.
        </p>
      </Callout>

      <h2>Couldn&apos;t we build this ourselves?</h2>
      <p>
        A fair question — Snowflake has stored procedures and tasks, and a determined
        team can replicate much of what dbt does with them: chained procedures,
        scheduled refreshes, even hand-rolled logging. The problem is not building it
        once; it is what you have after building it fifty times. Every procedure is
        bespoke — its own error handling, its own logging table, its own schedule, its
        own documentation (or none) — and each one adds to a pile that someone has to
        monitor, debug and remember.
      </p>
      <p>
        This is the observability argument for dbt: <strong>visibility is a property
        of the platform, not something each author rebuilds</strong>. Every model run
        is logged and timed the same way; selected test results are recorded with
        their runs;
        lineage is derived rather than documented; one failure surfaces in one place,
        with the affected downstream models known immediately. The question “did last
        night&apos;s build work, and if not, what is affected?” has a single answer —
        not fifty procedures to check one by one.
      </p>

      <h2>The bigger picture: the analytics development lifecycle</h2>
      <p>
        The deeper idea — the one dbt was built around — is that analytics work follows
        the same lifecycle as software, often called the{" "}
        <strong>analytics development lifecycle (ADLC)</strong>. It is a loop, not a
        line: delivering one product surfaces the next question, and each pass
        around begins with more settled meaning than the last. Every stage has a
        concrete counterpart in how this team works:
      </p>
      <Image
        src="/adlc-loop.png"
        alt="The analytics development lifecycle as an infinity loop: plan, develop, test, deploy, operate, observe, discover, analyze"
        width={1850}
        height={906}
        className="my-6 w-full max-w-2xl"
      />
      <p className="!-mt-3 text-sm !text-ink-faint">
        Diagram: dbt Labs&apos;{" "}
        <a
          href="https://www.getdbt.com/resources/the-analytics-development-lifecycle"
          target="_blank"
          rel="noopener noreferrer"
        >
          Analytics Development Lifecycle
        </a>.
      </p>
      <ul>
        <li>
          <strong>Plan</strong> — agreeing the requirement and definitions before
          writing SQL.
        </li>
        <li>
          <strong>Develop</strong> — models on a branch, built into the{" "}
          <code>DEV__</code>{" "}databases.
        </li>
        <li>
          <strong>Test</strong> — assertions run locally and in CI, before
          anything merges.
        </li>
        <li>
          <strong>Deploy</strong> — merge to main; changed models deploy to
          production automatically.
        </li>
        <li>
          <strong>Operate</strong> — scheduled builds rebuild every model on its
          cadence: daily, weekly, monthly.
        </li>
        <li>
          <strong>Observe</strong> — every run is logged; failures open issues
          naming the exact failed models.
        </li>
        <li>
          <strong>Discover</strong> — docs, lineage and contracts make what
          already exists findable.
        </li>
        <li>
          <strong>Analyze</strong> — dashboards and the semantic layer consume
          the outputs, raising the next question.
        </li>
      </ul>
      <p>
        Before dbt, much analyst work lives almost entirely in develop — the other
        stages are manual, fragmented or missing. dbt supplies common machinery and
        evidence for the rest of the loop, but the work does not happen by itself.
        People still agree requirements, choose tests, review changes, respond to
        failures and validate analytical outputs. The rest of this handbook explains
        how <Link href="/learn/analysts-and-dbt">analysts, engineers and domain owners</Link>
        {" "}share those responsibilities in this project. Later lessons make the loop
        concrete through <Link href="/learn/model-design">model design</Link>,{" "}
        <Link href="/learn/merge-to-production">deployment</Link> and{" "}
        <Link href="/learn/observing-production">production observation</Link>.
      </p>

      <h2>Where the speed comes from</h2>
      <p>
        It would be fair to read everything above as overhead — conventions, reviews,
        tests, a process. So it is worth being direct about why working this way is{" "}
        <em>faster</em>, not slower, after the first week:
      </p>
      <ul>
        <li>
          <strong>You start from finished work.</strong>{" "}Demographics, disease
          registers, geography lookups, waiting lists — hundreds of tested models
          already exist. A new analysis usually begins by joining two or three{" "}
          <code>ref()</code>s, not by rebuilding a person spine from raw feeds. The
          weeks that used to go into “assemble the population” collapse into a SELECT.
        </li>
        <li>
          <strong>The boilerplate writes itself.</strong>{" "}Source declarations and raw
          models are generated by scripts; documentation YAML is scaffolded by a
          command; age bands and organisation-code cleaning are one-line macro calls.
          The typing you do is the interesting part.
        </li>
        <li>
          <strong>Mistakes surface in seconds, not days.</strong>{" "}The editor underlines
          a broken ref or a missing column as you type; compiling the whole project
          takes seconds. Compare that with discovering a typo when a scheduled script
          fails overnight.
        </li>
        <li>
          <strong>Refreshes stop being your job.</strong>{" "}Whatever you build reruns
          on its defined schedule without you. No more Monday mornings re-running a chain of
          worksheets so a report is current.
        </li>
      </ul>
      <p>
        The honest cost profile: setup is a slow first day, your first PR is a slow
        first week — and the everyday loop after that (edit a model, build it, open a
        PR) is minutes.
      </p>

      <h2>What changes for you</h2>
      <p>
        In a worksheet you can do anything, immediately — and that freedom is exactly
        why worksheet logic ends up unordered, untested and unshared. Working in this
        project means working to its conventions: naming, layers, a review step, tests
        before merge. Those rules are the team&apos;s, not dbt&apos;s — dbt is just the
        machinery that makes them enforceable.
      </p>
      <p>
        What you get back: your work runs on an agreed cadence without you, failures surface
        immediately rather than silently, and nobody has to reverse-engineer your logic
        from a worksheet — including you, six months from now.
      </p>
      <p>
        And because everyone can see everyone else&apos;s code, dependencies are
        visible in both directions: change something here and you know immediately
        that it breaks something over there — in lineage, in compile errors, in CI on
        your pull request — before production is touched, rather than weeks later when
        a number looks wrong or a dashboard stops refreshing.
      </p>

      <Quiz
        questions={[
          {
            prompt: "A dbt model is…",
            options: [
              "A .sql file containing a single SELECT statement",
              "A .sql file containing the CREATE TABLE and INSERT statements for a table",
              "The YAML file that defines a table's columns and tests",
              "Any SQL file in the repo, including helper scripts",
            ],
            answer: 0,
            explain:
              "A model is one SELECT — dbt generates the surrounding DDL itself. The YAML alongside it documents and tests the model but is not the model.",
          },
          {
            prompt: "How does dbt know which order to build models in?",
            options: [
              "The order models are listed in dbt_project.yml",
              "It reads the ref() calls in each model and derives the dependency graph",
              "Folder order: raw, then staging, then modelling, and so on",
              "A run-order file maintained alongside the models",
            ],
            answer: 1,
            explain:
              "Order is derived entirely from ref() — there is no run-order config anywhere. Folders organise the code for humans; the DAG comes from the SQL.",
          },
        ]}
      />
    </LessonShell>
  );
}
