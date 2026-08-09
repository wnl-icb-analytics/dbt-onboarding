import type { Metadata } from "next";
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
      kicker="Learn 03"
      title="The DAG"
      lede="source() and ref() do more than replace hardcoded table names: they turn the project into a dependency graph that dbt can build, test and explain."
      minutes={4}
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
        the “Find your source” practice step — so you rarely write them by hand either.
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

      <Callout kind="smell" title="A pattern reviewers flag">
        <p>
          A hardcoded <code>DATABASE.SCHEMA.TABLE</code>{" "}in a model, or a{" "}
          <code>source()</code>{" "}call outside the raw layer, will draw a review comment.
          The fix is always the same: point at a model with <code>ref()</code> — and if
          no model exists yet, that missing model is the real gap to fill.
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
