import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
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
      lede="We use dbt to build a shared layer of Snowflake tables and views for population health, strategic commissioning and service activity. We agree what the models mean, document their definitions and test their outputs so analysts can combine them to answer new questions. This chapter follows one SQL query into that shared layer."
      minutes={8}
    >
      <h2>Shared SQL gets harder to look after as it grows</h2>
      <p>
        A collection of shared SQL gets harder to keep working as more people
        rely on it. Each query might be correct on its own. The trouble sits
        in the links between them, such as which script has to run first and
        which tables read which, and those links usually live in
        someone&apos;s head.
      </p>
      <p>
        Every analytics team builds up SQL like this. There&apos;s the view
        someone made a year ago, the script that has to run before another
        script, and the &quot;FINAL_v3&quot; table nobody is sure they can
        drop. These are the problems that come up.
      </p>
      <ul>
        <li>
          <strong>Order of operations is manual.</strong>{" "}
          The summary table is
          only right if the reference data refreshed first, and that&apos;s
          only right if the feed loaded. Whoever knows the sequence runs it by
          hand. Get one step out of order and the numbers are wrong, with
          nothing to warn you.
        </li>
        <li>
          <strong>Nobody knows what depends on what.</strong>{" "}
          Rename a column
          and you&apos;re guessing what might break.
        </li>
        <li>
          <strong>Nothing is tested.</strong> A duplicate patient row creeps
          in, and the first you hear of it is a dashboard that looks wrong.
        </li>
        <li>
          <strong>Every script builds everything from scratch.</strong> Each
          one does its own source cleaning, lookups and business logic. The
          same column ends up cleaned three different ways in three outputs.
        </li>
        <li>
          <strong>Everyone works alone.</strong>{" "}
          Logic lives in personal
          worksheets and scripts. Five people hold five slightly different
          definitions of &quot;current registration&quot;. There&apos;s no
          record of who changed what, and the work leaves when its author does.
        </li>
      </ul>
      <p>
        Each script was probably a reasonable answer to a real request. The
        trouble grows with the number of people who depend on the collection,
        and the team needs one shared way to handle dependencies, tests and
        review.
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
        dbt borrows that playbook through two ideas. The first is a{" "}
        <strong>shared codebase</strong>. The team keeps each model&apos;s SQL,
        documentation and tests in Git so people can review changes and see
        how a definition has evolved. The second is that{" "}
        <strong>each SQL model describes its result as a SELECT statement</strong>
        , with references to the data it needs. dbt follows those references
        to work out the build order and show which outputs depend on each
        model.
      </p>

      <h2>A SQL model is one SELECT statement in a file</h2>
      <p>
        A SQL model is a <code>.sql</code> file holding one SELECT statement.
        The SELECT describes the rows and columns you want, and dbt builds the
        table or view that holds them. dbt also supports{" "}
        <Link href="/advanced/python-models">Python models</Link>, which have
        their own page. Here&apos;s a small model from our project:
      </p>
      <CodeBlock
        lang="sql"
        title="models/staging/commissioning/csds/stg_csds_bridging.sql"
        code={`
select
    person_id,
    {{ consistent_sk_patient_id_format('pseudo_nhs_number') }} as sk_patient_id
from {{ ref('raw_csds_bridging') }}
`}
      />
      <p>
        Look at what&apos;s missing. There&apos;s no CREATE TABLE, no DROP and
        no database or schema name. <strong>You describe the result, and dbt
        produces the object.</strong>
      </p>
      <p>
        The double braces are <strong>Jinja</strong>, a templating language
        dbt lets you write inside SQL. dbt fills in the Jinja first, so
        Snowflake only ever sees plain SQL. This model has two pieces of
        Jinja.{" "}
        <code>ref(&apos;raw_csds_bridging&apos;)</code> points at another
        model. <code>consistent_sk_patient_id_format</code> is a macro, a
        reusable snippet of SQL shared across the project. This one turns the
        pseudonymised NHS number into text, and turns blanks and the
        placeholder value 1 into nulls.
      </p>
      <p>
        When you run <code>dbt run -s stg_csds_bridging</code>, two things
        happen:
      </p>
      <ol>
        <li>
          <strong>Compile.</strong> dbt fills in the Jinja. The{" "}
          <code>ref()</code>{" "}call becomes the real table name for the
          environment you&apos;re in. That&apos;s a <code>DEV__</code>{" "}database
          while you develop, and the production one after your change merges.
          The macro becomes plain SQL. The team uses dbt&apos;s Fusion engine,
          which can also check the rendered SQL before it runs.
        </li>
        <li>
          <strong>Run.</strong>{" "}dbt wraps the SELECT in the commands that
          create the object, and Snowflake runs them. For this model
          that&apos;s roughly:
        </li>
      </ol>
      <CodeBlock
        lang="sql"
        title="what Snowflake receives (dev environment)"
        code={`
create or replace view DEV__STAGING.CSDS.STG_CSDS_BRIDGING as (
    select
        person_id,
        nullif(nullif(trim(cast(pseudo_nhs_number as varchar)), ''), '1')
            as sk_patient_id
    from DEV__STAGING.DBT_RAW.RAW_CSDS_BRIDGING
);
`}
      />
      <p>
        Project configuration decides whether the wrapper is{" "}
        <code>create view</code> or <code>create table</code>, and which
        database the object lands in. The SELECT doesn&apos;t. Staging models
        build as views. A view is a saved query that reads its inputs each
        time someone queries it. A table stores the result as it was at build
        time. That choice changes how fresh the data is when you read it. It
        says nothing about whether the data is right. To see the rendered SQL
        for a model without building anything, run <code>dbt compile</code>.
      </p>
      <p>
        Every <code>{"{{ ref('…') }}"}</code> names another model in the
        project, and that model has its own <code>.sql</code> file. You point
        at a file, not a hardcoded table name.{" "}
        <code>ref(&apos;raw_csds_bridging&apos;)</code> means &quot;whatever{" "}
        <code>raw_csds_bridging.sql</code>{" "}builds, wherever that is&quot;. From
        all those references dbt assembles the project&apos;s dependency graph,
        called the <strong>DAG</strong>, and runs the models you select with
        their dependencies first. Referencing a parent doesn&apos;t select it
        for rebuilding. If you select only <code>stg_csds_bridging</code>, dbt
        expects <code>raw_csds_bridging</code> to exist already.
      </p>

      <h2>dbt transforms data that&apos;s already in Snowflake</h2>
      <p>
        Our feeds land in Snowflake before dbt touches them. dbt then builds
        models from that data for analysis and reporting. The team&apos;s
        pipeline has three stages, and dbt is the middle one.
      </p>
      <ol>
        <li>
          <strong>Source data lands in Snowflake.</strong> Most of it arrives
          in the <code>DATA_LAKE</code> database, with more in{" "}
          <code>DATA_LAKE__NCL</code>. That includes SUS, CSDS, OLIDS GP data
          and reference files.
        </li>
        <li>
          <strong>dbt transforms it.</strong>{" "}Models move the data through five
          layers, covered later in the guide, until it&apos;s ready for
          analysis and publishing.
        </li>
        <li>
          <strong>Other tools read what dbt builds.</strong> That means
          dashboards, ad hoc analysis and semantic views for AI tools.
        </li>
      </ol>
      <p>
        GitHub Actions runs dbt on a schedule and deploys reviewed changes.
        The <Link href="/learn/merge-to-production">production chapter</Link>{" "}
        follows a change through that process.
      </p>

      <h2>The analytics development lifecycle</h2>
      <p>
        The <strong>analytics development lifecycle (ADLC)</strong>{" "}applies
        ideas from software engineering to the way a team builds, maintains
        and uses data. The aim is to answer questions quickly, even as more
        people rely on the results. An analyst should be able to find
        another team&apos;s work, understand how it produced a figure and
        judge whether the same definition fits a new question.
      </p>
      <figure className="my-6 max-w-2xl">
        <div className="relative">
          <Image
            src="/adlc-loop.png"
            alt="The analytics development lifecycle as an infinity loop: plan, develop, test, deploy, operate, observe, discover, analyse"
            width={1850}
            height={906}
            className="h-auto w-full"
          />
          {/* Invert only the black DATA and OPS lettering in dark mode. */}
          <Image
            src="/adlc-loop.png"
            alt=""
            width={1850}
            height={906}
            className="pointer-events-none absolute inset-0 hidden h-auto w-full invert dark:block"
            style={{
              mask: "linear-gradient(white, white) 22% 51% / 13% 11% no-repeat, linear-gradient(white, white) 79% 51% / 11% 11% no-repeat",
            }}
          />
        </div>
        <figcaption className="mt-2 text-sm text-ink-soft">
          Diagram from dbt Labs&apos;{" "}
          <a
            href="https://www.getdbt.com/resources/the-analytics-development-lifecycle"
            target="_blank"
            rel="noopener noreferrer"
          >
            Analytics Development Lifecycle
          </a>
          .
        </figcaption>
      </figure>
      <p>
        The diagram is a loop because using data often reveals what needs
        to change. An exploratory analysis can turn up a measure worth
        tracking regularly. Analysts, engineers and the people making the
        decision agree what it means, test it and make it available to
        others. As fresh data arrives, the team monitors scheduled builds
        and uses over 8,000 data tests across the project to catch errors
        in the pipeline.
      </p>
      <p>
        When that feedback leads to a change, the team updates the shared
        dbt model. The analyses that use it pick up the revised definition
        when they refresh.
      </p>

      <h2>Model the concept behind the request</h2>
      <p>
        Does all this sound like overhead? A worksheet can be the quickest
        way to answer a request once. But stakeholders often come back for updated
        figures, other teams ask similar questions and colleagues want to
        build on earlier work. If the SQL lives in someone&apos;s worksheet,
        you can spend more time finding the right script than answering the
        question. You might never know someone has already done the work.
      </p>
      <p>
        In our dbt project, you can search the catalogue for what already
        exists. Read the current model&apos;s SQL, documentation and tests
        to decide whether its definition fits your question. Git shows who
        wrote it and how it&apos;s changed over time. You can get started without waiting
        for someone to send you their latest copy.
      </p>
      <p>
        As more people contribute models, the shared layer covers more of
        what stakeholders ask about. Our aim is to answer most new questions
        by joining concepts the team has already defined and tested. The
        time we invest in building useful data models pays off each time
        another analyst uses them to answer a new question.
      </p>
      <p>
        <Link href="/learn/analysts-and-dbt">Analysts and dbt</Link>
        {" · "}
        <Link href="/learn/git-and-prs">Git &amp; pull requests</Link>
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
              "A SQL model describes a result with SELECT, and dbt generates the database commands around it. The YAML next to it documents and tests the model, but isn't the model.",
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
              "dbt uses the declared dependencies to order the selected resources. Folder order has no effect on build order.",
          },
        ]}
      />
    </LessonShell>
  );
}
