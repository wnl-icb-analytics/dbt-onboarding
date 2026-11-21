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
      lede="If you have written a SQL query, you have a starting point for dbt. This chapter follows a query into a shared project where its dependencies, tests and changes can be inspected."
      minutes={8}
    >
      <h2>The problem dbt solves</h2>
      <p>
        Every analytics team accumulates SQL: a view someone built a year ago, a
        script that has to run before another script, a &quot;FINAL_v3&quot;
        table nobody is sure is safe to drop. Even when each query is correct,
        maintaining the collection creates problems:
      </p>
      <ul>
        <li>
          <strong>Order of operations is manual.</strong> The summary table is
          only right if the reference data refreshed first, which is only right
          if the feed loaded. The person who knows the sequence runs it by hand.
          One step out of order and the numbers are wrong, with nothing to say
          so.
        </li>
        <li>
          <strong>Nobody knows what depends on what.</strong> Renaming a column
          means guessing what might break.
        </li>
        <li>
          <strong>Nothing is tested.</strong> A duplicate patient row appears,
          and the first you hear is a dashboard looking wrong.
        </li>
        <li>
          <strong>Everything is built end-to-end, every time.</strong> Each
          script contains its own source cleaning, lookups and business logic.
          The same column can end up cleaned differently in several outputs.
        </li>
        <li>
          <strong>Everyone works alone.</strong> Logic lives in personal
          worksheets and scripts, so five people hold five slightly different
          definitions of &quot;current registration&quot;, there is no history
          of who changed what, and work leaves when its author does.
        </li>
      </ul>
      <p>
        Each script may have been a reasonable answer to a real request. The
        difficulty grows as more people depend on the collection. A shared
        approach to dependencies, tests and review gives the team a way to
        manage that growth.
      </p>
      <LessonQuote
        attribution="Tristan Handy, co-creator of dbt and founder of dbt Labs"
        work="Building a Mature Analytics Workflow"
        href="https://www.getdbt.com/blog/building-a-mature-analytics-workflow"
      >
        Analytics doesn&apos;t have to be this way. In fact, the playbook for
        solving these problems already exists — on our software engineering
        teams.
      </LessonQuote>
      <p>
        dbt (data build tool) addresses this with two ideas working together.
        First, <strong>a shared codebase</strong>: every transformation lives in
        one git repository, so there is one definition of each concept, full
        history of every change, and a review step before anything ships.
        Second,{" "}
        <strong>
          SQL models describe their results with SELECT statements
        </strong>{" "}
        whose dependencies dbt can read. The order of operations can then be
        derived from the code, computed fresh on every run, and never something
        a person has to remember.
      </p>

      <h2>What a dbt model actually is</h2>
      <p>
        The SQL models in this handbook are <code>.sql</code> files that each
        describe a result with a SELECT statement. SELECT chooses the columns
        and rows to return. This small example is from our project:
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
        Notice what is missing: no CREATE TABLE, no DROP, no database or schema
        names. That is because{" "}
        <strong>you describe the result; dbt produces the object</strong>. When
        you run <code>dbt run -s stg_csds_bridging</code>, two things happen:
      </p>
      <ol>
        <li>
          <strong>Compile.</strong> dbt renders the template expressions. Here,{" "}
          <code>{"{{ ref('raw_csds_bridging') }}"}</code> becomes the real
          database-qualified table name for whichever environment you are in
          (the DEV__ databases while developing, production after merge).
        </li>
        <li>
          <strong>Run.</strong> dbt adds the database commands needed to create
          the chosen object, then executes it in Snowflake. For this model that
          means, roughly:
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
        Whether the wrapper is <code>create view</code> or{" "}
        <code>create table</code>, and which database it lands in, comes from
        project configuration rather than this SELECT. This example creates a
        view, a saved query that reads its inputs when queried. A table stores
        the result produced at build time. That choice affects refresh
        behaviour; repeated builds are not a guarantee that the data is correct.
        You can inspect rendered model SQL with <code>dbt compile</code>.
      </p>
      <p>
        The <code>{"{{ ref('…') }}"}</code> call identifies another model in the
        project. That model has its own <code>.sql</code> file to build its
        result. Instead of hardcoding a table name, you point at a file:{" "}
        <code>ref(&apos;raw_csds_bridging&apos;)</code> means &quot;the table
        that <code>raw_csds_bridging.sql</code> builds, wherever that is&quot;.
        From those references dbt assembles the full dependency graph (the{" "}
        <strong>DAG</strong>) and orders the selected models so their
        dependencies run first. Referencing a parent does not, by itself, select
        it for rebuilding.
      </p>

      <h2>Where dbt sits in the workflow</h2>
      <p>In this team the pipeline looks like:</p>
      <ol>
        <li>
          <strong>Source data lands in Snowflake</strong>, in the{" "}
          <code>DATA_LAKE</code> database (the main source) and{" "}
          <code>DATA_LAKE__NCL</code>: SUS, CSDS, OLIDS GP data, reference
          files.
        </li>
        <li>
          <strong>dbt transforms it</strong> through five layers, explained
          later in this sequence, into analytics-ready and published datasets.
        </li>
        <li>
          <strong>Downstream tools consume dbt outputs</strong>: dashboards,
          ad-hoc analysis, semantic views for AI tools.
        </li>
      </ol>
      <p>
        You are still writing SELECT statements against Snowflake. What changes
        is that your SQL now lives in a repo where it is ordered, tested,
        reviewed and rerun on an agreed schedule.
      </p>

      <Callout kind="info" title="What dbt is not">
        <p>
          dbt transforms what is already in Snowflake (the &quot;T&quot; in
          ELT). It is also not a scheduler by itself: scheduled builds and
          deployments are run by GitHub Actions workflows. The production
          chapters explain how.
        </p>
      </Callout>

      <h2>Why use a shared tool?</h2>
      <p>
        Snowflake procedures and tasks can also run transformations. The
        advantage of dbt here is having one way to declare dependencies,
        document models and report results across the project. Each author can
        work within that system instead of maintaining a separate run order and
        logging scheme.
      </p>

      <h2>The bigger picture: the analytics development lifecycle</h2>
      <p>
        Analytics work has a lifecycle, often called the{" "}
        <strong>analytics development lifecycle (ADLC)</strong>. A delivered
        product can raise another question or expose a definition that needs
        revisiting. The diagram groups the work involved:
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
        </a>
        .
      </p>
      <p>
        For this team, the loop begins with an agreed question. We find or
        design models, develop them in the development environment, test the
        result and review the change. A merge triggers deployment. Scheduled
        runs then use the same code on newer data, and their results inform the
        next investigation.
      </p>
      <p>
        dbt supplies parts of that workflow; people still choose definitions,
        inspect results and respond to failures. The following chapters explain
        those responsibilities in the order you are likely to encounter them.
      </p>

      <h2>What changes in everyday work</h2>
      <p>
        Suppose a new analysis needs demographics and recent hospital activity.
        If suitable shared models exist, you can compose their results rather
        than repeat source cleaning and interpretation. A correction to one
        shared definition can then reach its consumers through their
        dependencies.
      </p>
      <p>
        There is a cost to learning the workflow. The first setup and pull
        request take time. You also need to describe your model and show why its
        output is credible. That effort leaves something another person can
        inspect, reuse and maintain, including you when you return to it months
        later.
      </p>
      <p>
        Tests and lineage make problems easier to detect, but they do not reveal
        every incorrect assumption. A model can run successfully and answer the
        wrong question. The handbook therefore teaches analytical judgement as
        well as the mechanics of using dbt.
      </p>
      <p>
        The conventions belong to this project. dbt does not require our folder
        names, model prefixes or division of responsibilities. Next,{" "}
        <Link href="/learn/analysts-and-dbt"> Analysts and dbt</Link> explains
        how analysts, engineers and domain owners contribute to that shared
        work.
      </p>

      <Quiz
        questions={[
          {
            prompt: "A SQL model in these examples is…",
            options: [
              "A .sql file containing a single SELECT statement",
              "A .sql file containing the CREATE TABLE and INSERT statements for a table",
              "The YAML file that defines a table's columns and tests",
              "Any SQL file in the repo, including helper scripts",
            ],
            answer: 0,
            explain:
              "A SQL model describes a result with SELECT. dbt generates the database commands around it. The YAML alongside it documents and tests the model but is not the model.",
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
              "dbt uses declared dependencies to order the selected resources. Folder order does not establish the build order.",
          },
        ]}
      />
    </LessonShell>
  );
}
