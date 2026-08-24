import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Dag } from "@/components/Dag";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "The DAG" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="refs-and-sources"
      kicker="Learn 05"
      title="The DAG"
      lede="source() and ref() do more than replace hardcoded table names: they turn the project into a dependency graph that dbt can build, test and explain."
      minutes={7}
    >
      <h2>Never hardcode a table</h2>
      <p>
        In a Snowflake worksheet you would write{" "}
        <code>from STAGING.CSDS.STG_CSDS_BRIDGING</code>. In dbt you write:
      </p>
      <CodeBlock
        lang="sql"
        code={`
from {{ ref('stg_csds_bridging') }}
`}
      />
      <p>
        And not only in <code>from</code> — <code>ref()</code>{" "}goes anywhere a table
        name would: joins, CTEs, subqueries. A model reading two upstream models looks
        like this:
      </p>
      <CodeBlock
        lang="sql"
        code={`
select
    wl.sk_patient_id,
    wl.week_ending_date,
    dict.specialty_name
from {{ ref('stg_wl_wl_openpathways_data') }} wl
left join {{ ref('stg_dictionary_dbo_specialties') }} dict
    on wl.treatment_function_code = dict.bk_specialty_code
`}
      />
      <p>Each call does two things:</p>
      <ul>
        <li>
          <strong>dbt resolves the location for you.</strong>{" "}Developing, it points at
          the DEV__ databases; in production, the production ones. Same SQL, every
          environment.
        </li>
        <li>
          <strong>dbt records the dependency.</strong>{" "}Your model now officially sits
          downstream of <code>stg_csds_bridging</code> — it appears in lineage, builds in
          the right order, and anyone changing that staging model can see you depend on
          it.
        </li>
      </ul>

      <h2>How the resolution works</h2>
      <p>
        The mechanism has three steps. When dbt starts, it{" "}
        <strong>parses</strong>{" "}every file in the project, extracting the{" "}
        <code>ref()</code>{" "}and <code>source()</code>{" "}calls without running
        any SQL — that alone is enough to assemble the whole dependency graph.
        It then <strong>compiles</strong>{" "}each model, replacing every call
        with a fully qualified table name. Only then does it{" "}
        <strong>run</strong>{" "}anything, walking the graph in dependency order.
      </p>
      <p>
        The name a call compiles to depends on the <strong>target</strong>. A
        target is a named set of connection settings in the project&apos;s{" "}
        <code>profiles.yml</code>: which Snowflake account and role dbt connects
        with, and — the part that matters here — which databases it reads from
        and builds into. Environment setup gave you a development target that
        points at the <code>DEV__</code>{" "}databases; the scheduled workflows
        run the same project with a <code>prod</code>{" "}target that points at
        the production ones. The same line compiles differently depending on
        which target runs it:
      </p>
      <CodeBlock
        lang="sql"
        title="one line, two targets"
        code={`
-- in the model
from {{ ref('stg_csds_bridging') }}

-- compiled with the development target
from DEV__STAGING.CSDS.STG_CSDS_BRIDGING

-- compiled with the prod target (deploys and scheduled builds)
from STAGING.CSDS.STG_CSDS_BRIDGING
`}
      />
      <p>
        Your SQL never mentions an environment; the target supplies the location
        at compile time, using the project&apos;s naming rules — database from
        the layer, schema from the domain. This is why development is safe by
        construction: the same model text writes to <code>DEV__</code>{" "}
        databases on your machine and to production in the workflows, and{" "}
        <code>dbt compile</code>{" "}shows you exactly what either would run. The{" "}
        <Link href="/learn/merge-to-production">production workflow lesson</Link>
        {" "}builds on the same mechanism — CI validation compiles your
        changed models with the development target while resolving unchanged
        parents to their production relations.
      </p>

      <h2>source() — the entry point</h2>
      <p>
        Tables we do not build — the feeds landing in the data lake databases (
        <code>DATA_LAKE</code>, plus <code>DATA_LAKE__NCL</code>) — are declared once in
        YAML under <code>models/sources/</code>, then referenced with{" "}
        <code>source()</code>:
      </p>
      <CodeBlock
        lang="sql"
        code={`
from {{ source('csds', 'ActiveSubmission') }}
`}
      />
      <p>
        In this project, <strong>only generated raw models call source()</strong>.
        Everything you write uses <code>ref()</code>. That keeps a single, stable
        interface to the outside world: if a feed changes, only the raw layer moves.
        Source declarations themselves are produced by a mapping pipeline — covered in
        the <Link href="/practice/find-a-source">Find your source</Link> field guide —
        so you rarely write them by hand either. The official dbt documentation explains
        the general behaviour of <a href="https://docs.getdbt.com/reference/dbt-jinja-functions/ref">ref()</a>
        {" "}and <a href="https://docs.getdbt.com/reference/dbt-jinja-functions/source">source()</a>;
        this project&apos;s raw-layer restriction is a local convention on top of it.
      </p>
      <p>
        A few older staging models still call <code>source()</code>{" "}directly.
        Treat those as legacy debt, not examples to copy. In an enhancement PR,
        mention the bypass as a non-blocking follow-up unless the change adds or
        depends on it.
      </p>

      <h2>The DAG</h2>
      <p>
        From every <code>ref()</code>{" "}and <code>source()</code>{" "}call, dbt assembles the
        whole project into a directed acyclic graph. This is a real slice of ours:
      </p>
      <Dag />
      <p>
        The DAG is what makes <code>dbt build -s +my_model</code>{" "}possible: the{" "}
        <code>+</code>{" "}means “and everything upstream”, and dbt knows exactly what that
        is. It is also why circular references are impossible — dbt refuses to compile
        them.
      </p>
      <p>
        The same graph is a discovery tool. The{" "}
        <Link href="/learn/finding-models">finding models</Link> lesson shows how to
        inspect ancestors and descendants before deciding that a new model is needed.
      </p>

      <Callout kind="smell" title="A pattern reviewers flag">
        <p>
          A hardcoded <code>DATABASE.SCHEMA.TABLE</code>{" "}in a model, or a{" "}
          new <code>source()</code>{" "}call outside the raw layer, will draw a review
          comment. Point at a model with <code>ref()</code> — and if no model exists
          yet, that missing model is the real gap to fill. An untouched legacy
          staging call is a follow-up, not a reason to redesign an enhancement.
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt: "Why is hardcoding STAGING.CSDS.STG_X a problem?",
            options: [
              "dbt will refuse to compile a hardcoded table name",
              "It breaks dev/prod separation and hides the dependency from the DAG",
              "It only becomes a problem if the table is later renamed",
              "Queries against fully-qualified names are slower in Snowflake",
            ],
            answer: 1,
            explain:
              "The danger is that dbt compiles it without complaint — your dev build silently reads prod objects, and the dependency is invisible to lineage and build ordering.",
          },
          {
            prompt: "Where are you allowed to use source()?",
            options: [
              "Anywhere, as long as the source is declared in YAML",
              "In staging models — the standard dbt convention",
              "Only in generated raw models",
              "In any model reading a table the raw layer doesn't cover yet",
            ],
            answer: 2,
            explain:
              "Many dbt projects do put source() in staging — this one goes a step further. The raw layer is generated, so source() never appears in hand-written SQL; if a table has no raw model, generate one.",
          },
          {
            prompt:
              "ref('stg_csds_bridging') compiles to DEV__STAGING.CSDS.STG_CSDS_BRIDGING on your machine and STAGING.CSDS.STG_CSDS_BRIDGING in production. What decides?",
            options: [
              "The folder the model file sits in",
              "The target the command runs with — resolution happens at compile time",
              "A find-and-replace step in the deploy workflow",
              "Snowflake session settings",
            ],
            answer: 1,
            explain:
              "ref() is resolved when dbt compiles, using the target's naming rules. The SQL text never changes between environments — the target supplies the location.",
          },
          {
            prompt: "What does the + in dbt build -s +int_wl_current select?",
            options: [
              "The model plus everything upstream of it",
              "The model plus everything downstream of it",
              "The model plus its direct parents, one level up",
              "The model plus its tests",
            ],
            answer: 0,
            explain:
              "+model includes all ancestors, not just direct parents; model+ includes all descendants. Tests are included by dbt build either way.",
          },
        ]}
      />
    </LessonShell>
  );
}
