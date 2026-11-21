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
      kicker="Learn 06"
      title="How models depend on each other"
      lede="ref() names another dbt model, and source() names an input table the project declares in YAML. dbt reads these calls to learn what each model depends on, then uses that graph to build models in order and show their lineage."
      minutes={7}
    >
      <h2>
        <code>ref()</code> tells dbt which model you&apos;re reading
      </h2>
      <p>
        Use <code>ref()</code> whenever your SQL reads another model, so dbt
        knows what your model depends on. In a Snowflake worksheet you&apos;d
        write{" "}
        <code>from STAGING.CSDS.STG_CSDS_BRIDGING</code>. In dbt you write this
        instead:
      </p>
      <CodeBlock
        lang="sql"
        code={`
from {{ ref('stg_csds_bridging') }}
`}
      />
      <p>
        That includes joins and subqueries. Here&apos;s a model that reads two
        upstream models:
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
        The double braces are Jinja, which dbt fills in before Snowflake runs
        anything. <code>ref()</code> is a Jinja function, and
        the quoted text inside it is the name of another dbt model, not a
        table dbt looks up in the warehouse. Each call does two jobs:
      </p>
      <ul>
        <li>
          <strong>dbt works out the location.</strong> While you develop, it
          points at the <code>DEV__</code> databases. In production it points
          at the production ones. The SQL stays the same in every environment.
        </li>
        <li>
          <strong>dbt records the dependency.</strong> Your model now sits
          downstream of <code>stg_wl_openpathways_data</code> and the specialty
          lookup. It shows up in lineage and builds in the right order, and
          anyone changing that staging model can see that you depend on it.
        </li>
      </ul>

      <h2>dbt parses, compiles, then runs</h2>
      <p>
        dbt turns your models into SQL for Snowflake in three steps. First it{" "}
        <strong>parses</strong> the project. It reads the <code>ref()</code>{" "}
        and <code>source()</code> calls without running any model query, and
        uses them to build the dependency graph. Next it{" "}
        <strong>compiles</strong> the selected models, swapping each call for
        the fully qualified name of the table or view it points to. An
        ephemeral model has no object of its own, so dbt puts its SQL into the
        query as a CTE instead. Then it <strong>runs</strong> the selected
        models in dependency order.
      </p>
      <p>
        Fusion, the engine the team uses, also analyses the rendered SQL
        during compile. It flags errors such as bad syntax before anything
        reaches Snowflake. dbt Core only renders the SQL at that step, so the
        same mistake would surface as a Snowflake error at run time.
      </p>
      <p>
        The name a call compiles to depends on the <strong>target</strong>. A
        target is a named set of connection settings in the project&apos;s{" "}
        <code>profiles.yml</code>. It says which Snowflake account and role dbt
        connects with, and which database and schema to start from. When you
        develop, you use the <code>dev</code> target. Folder settings in{" "}
        <code>dbt_project.yml</code> choose each model&apos;s database, such as{" "}
        <code>STAGING</code>. Then the project&apos;s{" "}
        <code>generate_database_name</code> macro sees the target name and
        puts <code>DEV__</code> in front. The scheduled workflows run the same
        project with the <code>prod</code> target, which gets no prefix. So the
        same line compiles differently depending on the target:
      </p>
      <CodeBlock
        lang="sql"
        title="one line, two targets"
        code={`
-- in the model
from {{ ref('stg_csds_bridging') }}

-- compiled with the dev target
from DEV__STAGING.CSDS.STG_CSDS_BRIDGING

-- compiled with the prod target (deploys and scheduled builds)
from STAGING.CSDS.STG_CSDS_BRIDGING
`}
      />
      <p>
        Your SQL names models. The target and project configuration decide
        where those models live in the warehouse. Normal development writes to
        the <code>DEV__</code> databases. Snowflake roles and grants decide
        what you&apos;re allowed to read or write, so the target name on its
        own isn&apos;t a security boundary. The production chapter explains how
        validation can deliberately read unchanged production parents while it
        builds changed models in DEV.
      </p>

      <h2>Sources declare the tables this project reads from outside</h2>
      <p>
        A source is a table that something outside this project loads into
        Snowflake, such as a feed or the upstream <code>dbt-olids</code>
        project. The project declares it in YAML so dbt knows where to find
        it and can show it in lineage. Most of our feeds land in{" "}
        <code>DATA_LAKE</code> and <code>DATA_LAKE__NCL</code>. Each one is
        declared in a YAML file under <code>models/sources/</code> and read
        with <code>source()</code>:
      </p>
      <CodeBlock
        lang="sql"
        code={`
from {{ source('csds', 'ActiveSubmission') }}
`}
      />
      <p>
        In this project,{" "}
        <strong>only generated raw models call source()</strong>. Everything
        you write uses <code>ref()</code>. That gives each source table one
        stable way in. A feed change can still ripple downstream, but no
        hand-written model connects to the physical source table directly. The{" "}
        <Link href="/practice/find-a-source">Find your source</Link>{" "}
        walkthrough explains the mapping pipeline that produces source
        declarations. dbt&apos;s own documentation covers how{" "}
        <a href="https://docs.getdbt.com/reference/dbt-jinja-functions/ref">
          ref()
        </a>{" "}
        and{" "}
        <a href="https://docs.getdbt.com/reference/dbt-jinja-functions/source">
          source()
        </a>{" "}
        behave in general. Keeping <code>source()</code> in the raw layer is
        our local convention on top of that.
      </p>
      <p>
        You may find older staging models that still call{" "}
        <code>source()</code> directly. <code>stg_reference_ncl_provider</code>{" "}
        is one. The{" "}
        <Link href="/practice/find-a-source">source walkthrough</Link> explains
        the current route to follow when you work on one of them.
      </p>

      <h2>References add up to a graph</h2>
      <p>
        Every <code>ref()</code> and <code>source()</code> call is an arrow
        from an input to the model that reads it. dbt joins all those arrows into a directed
        acyclic graph, or DAG. A parent is a model&apos;s input. Upstream
        means following inputs back towards their origins. Downstream means
        following consumers forward to their outputs. Directed means every
        arrow points one way, and acyclic means there are no loops.
        Here&apos;s a real slice of ours:
      </p>
      <Dag />
      <p>
        The DAG is what makes <code>dbt build -s +my_model</code> possible. The{" "}
        <code>+</code> means &quot;and everything upstream&quot;, and dbt knows
        exactly what that covers. It&apos;s also why dbt rejects circular
        dependencies. If two models each need the other, neither can be built
        first.
      </p>
      <p>
        The same graph helps you find things. The{" "}
        <Link href="/learn/finding-models">finding models</Link> lesson shows
        how to inspect a model&apos;s ancestors and descendants before you
        decide a new model is needed.
      </p>

      <h2>Dependencies and selection are separate</h2>
      <p>
        A reference tells dbt that a model needs another relation. It
        doesn&apos;t make every command rebuild that relation.{" "}
        <code>dbt build -s my_model</code> builds that model and runs the tests
        that test selection picks up. Its parents have to exist already, unless
        the command selects them too.
      </p>
      <p>
        Take <code>int_wl_current</code>. <code>dbt build -s int_wl_current</code>{" "}
        rebuilds that one view, which reads whatever{" "}
        <code>stg_wl_openpathways_data</code> holds right now.{" "}
        <code>dbt build -s +int_wl_current</code> first rebuilds everything
        upstream of it, including that staging model and the raw view under
        it.
      </p>
      <p>
        Keep two questions apart. What does this model depend on? What does
        this run include? The graph answers the first, and selectors answer the
        second.{" "}
        <Link href="/learn/building-and-checking">
          Building and checking a change
        </Link>{" "}
        comes back to this with a full development example.
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
              "The danger is that dbt compiles it without complaint. Your development build quietly reads production objects, and lineage and build ordering can't see the dependency.",
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
              "Many dbt projects use source() in staging. This project uses generated raw models as the way in, so source() never appears in hand-written SQL. If a table has no raw model, generate one.",
          },
          {
            prompt:
              "ref('stg_csds_bridging') compiles to DEV__STAGING.CSDS.STG_CSDS_BRIDGING on your machine and STAGING.CSDS.STG_CSDS_BRIDGING in production. What decides?",
            options: [
              "The folder the model file sits in",
              "The target the command runs with, applied when dbt compiles",
              "A find-and-replace step in the deploy workflow",
              "Snowflake session settings",
            ],
            answer: 1,
            explain:
              "dbt resolves ref() when it compiles, using the target and the project's naming rules. The SQL text never changes between environments.",
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
              "+model includes all ancestors, not only direct parents. model+ includes all descendants. Which tests run also depends on dbt's test selection.",
          },
        ]}
      />
    </LessonShell>
  );
}
