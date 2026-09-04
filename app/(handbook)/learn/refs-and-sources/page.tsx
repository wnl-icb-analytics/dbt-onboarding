import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Dag } from "@/components/Dag";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "How models depend on each other" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="refs-and-sources"
      kicker="Learn 05"
      title="How models depend on each other"
      lede="source() and ref() do more than replace hardcoded table names: they turn the project into a dependency graph that dbt can build, test and explain."
      minutes={7}
    >
      <h2>Give dbt the dependency</h2>
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
        Use <code>ref()</code> when a query reads another model, including in
        joins and subqueries. A model reading two upstream models looks like
        this:
      </p>
      <CodeBlock
        lang="sql"
        code={`
select
    wl.sk_patient_id,
    wl.week_ending_date,
    dict.specialty_name
from {{ ref('stg_wl_openpathways_data') }} wl
left join {{ ref('stg_dictionary_dbo_specialties') }} dict
    on wl.treatment_function_code = dict.bk_specialty_code
    and dict.is_treatment_function = true
`}
      />
      <p>
        The braces mark a template expression. dbt evaluates <code>ref()</code>{" "}
        before Snowflake runs the SQL. The quoted name identifies another model;
        it is not text to search for in the warehouse. Each call does two
        things:
      </p>
      <ul>
        <li>
          <strong>dbt resolves the location for you.</strong> Developing, it
          points at the DEV__ databases; in production, the production ones.
          Same SQL, every environment.
        </li>
        <li>
          <strong>dbt records the dependency.</strong> Your model now officially
          sits downstream of <code>stg_wl_openpathways_data</code> and the
          specialty lookup. It appears in lineage, runs in the right order, and
          anyone changing that staging model can see you depend on it.
        </li>
      </ul>

      <h2>How the resolution works</h2>
      <p>
        The mechanism has three steps. When dbt starts, it{" "}
        <strong>parses</strong> every file in the project, extracting the{" "}
        <code>ref()</code> and <code>source()</code> calls without running the
        model query. The declared references let it assemble the dependency
        graph. It then <strong>compiles</strong> each model, replacing every
        call with a fully qualified table name. Only then does it{" "}
        <strong>run</strong> anything, walking the graph in dependency order.
      </p>
      <p>
        The name a call compiles to depends on the <strong>target</strong>. A
        target is a named set of connection settings in the project&apos;s{" "}
        <code>profiles.yml</code>: which Snowflake account and role dbt connects
        with, and which database settings it uses. Project naming rules also
        determine the final locations. The project uses a development target
        that points at the <code>DEV__</code> databases; the scheduled workflows
        run the same project with a <code>prod</code> target that points at the
        production ones. The same line compiles differently depending on which
        target runs it:
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
        Your SQL refers to model names; the target and project configuration
        determine their warehouse locations. Normal development writes to the{" "}
        <code> DEV__</code> databases. Snowflake roles and grants determine what
        you are allowed to read or write, so a target name alone is not a
        security boundary. The production chapter explains how validation can
        deliberately read unchanged production parents while building changed
        models in DEV.
      </p>

      <h2>Sources are the entry point</h2>
      <p>
        The feeds landing in <code>DATA_LAKE</code> and{" "}
        <code>DATA_LAKE__NCL</code> are declared in YAML under{" "}
        <code>models/sources/</code>, then referenced with <code>source()</code>
        :
      </p>
      <CodeBlock
        lang="sql"
        code={`
from {{ source('csds', 'ActiveSubmission') }}
`}
      />
      <p>
        In this project,{" "}
        <strong>only generated raw models call source()</strong>. Everything you
        write uses <code>ref()</code>. That keeps a single, stable source entry
        point. A feed change can still require downstream changes, but readers
        do not each need a separate connection to the physical source table. The{" "}
        <Link href="/practice/find-a-source">Find your source</Link> field guide
        explains the mapping pipeline that produces source declarations. The
        official dbt documentation explains the general behaviour of{" "}
        <a href="https://docs.getdbt.com/reference/dbt-jinja-functions/ref">
          ref()
        </a>{" "}
        and{" "}
        <a href="https://docs.getdbt.com/reference/dbt-jinja-functions/source">
          source()
        </a>
        ; this project&apos;s raw-layer restriction is a local convention on top
        of it.
      </p>
      <p>
        You may find older staging models that call <code>source()</code>{" "}
        directly. The{" "}
        <Link href="/practice/find-a-source">source field guide</Link> explains
        the current route to follow when working on those models.
      </p>

      <h2>The DAG</h2>
      <p>
        From every <code>ref()</code> and <code>source()</code> call, dbt
        assembles the whole project into a directed acyclic graph. This is a
        real slice of ours:
      </p>
      <p>
        A parent is an input to another model. Upstream means following those
        inputs towards their origins; downstream means following consumers
        towards their outputs. A directed acyclic graph, or DAG, has arrows
        showing that direction and no circular dependencies.
      </p>
      <Dag />
      <p>
        The DAG is what makes <code>dbt build -s +my_model</code> possible: the{" "}
        <code>+</code> means &quot;and everything upstream&quot;, and dbt knows
        exactly what that is. It is also why dbt rejects circular model
        dependencies: neither model can be built first if each requires the
        other.
      </p>
      <p>
        The same graph is a discovery tool. The{" "}
        <Link href="/learn/finding-models">finding models</Link> lesson shows
        how to inspect ancestors and descendants before deciding that a new
        model is needed.
      </p>

      <h2>Dependencies and selection are separate</h2>
      <p>
        A reference tells dbt that a model needs another relation. It does not
        mean every command rebuilds that relation.{" "}
        <code>dbt build -s my_model</code> selects that model and the tests
        included by test selection. Its parents must already be available unless
        the command also selects them.
      </p>
      <p>
        Think of two questions: what does this model depend on, and what does
        this run include? The graph answers the first; selectors answer the
        second.{" "}
        <Link href="/learn/building-and-checking">
          {" "}
          Building and checking a change
        </Link>{" "}
        returns to that distinction with a complete development example.
      </p>

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
              "The danger is that dbt compiles it without complaint. Your development build silently reads prod objects, and the dependency is invisible to lineage and build ordering.",
          },
          {
            prompt: "Where are you allowed to use source()?",
            options: [
              "Anywhere, as long as the source is declared in YAML",
              "In staging models, as in many dbt projects",
              "Only in generated raw models",
              "In any model reading a table the raw layer doesn't cover yet",
            ],
            answer: 2,
            explain:
              "Many dbt projects use source() in staging. This project uses generated raw models as the source entry point. The raw layer is generated, so source() never appears in hand-written SQL; if a table has no raw model, generate one.",
          },
          {
            prompt:
              "ref('stg_csds_bridging') compiles to DEV__STAGING.CSDS.STG_CSDS_BRIDGING on your machine and STAGING.CSDS.STG_CSDS_BRIDGING in production. What decides?",
            options: [
              "The folder the model file sits in",
              "The target the command runs with; resolution happens at compile time",
              "A find-and-replace step in the deploy workflow",
              "Snowflake session settings",
            ],
            answer: 1,
            explain:
              "ref() is resolved when dbt compiles, using the target's naming rules. The SQL text never changes between environments. The target and project naming rules supply the location.",
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
              "+model includes all ancestors, not just direct parents; model+ includes all descendants. Which tests run also depends on dbt test selection.",
          },
        ]}
      />
    </LessonShell>
  );
}
