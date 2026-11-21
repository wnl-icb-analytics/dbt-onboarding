import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";
import { LessonQuote } from "@/components/LessonQuote";

export const metadata: Metadata = { title: "Python models" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="python-models"
      kicker="Going further 09"
      title="Python models"
      lede="A Python model is a .py file in models/ that returns a DataFrame, which dbt builds as a table in Snowflake. dbt tracks which models it reads, SQL models can ref() it, and you test it like any other model. It's for work SQL can't express well."
      minutes={8}
    >
      <Callout kind="info" title="We don't have any yet">
        <p>
          This project has no Python models, so talk to the team before you add the
          first one. Fusion supports them on Snowflake, which makes them an option
          when a problem really needs Python, for example when you already have a
          validated Python method for the analysis.
        </p>
      </Callout>

      <h2>A Python model returns a DataFrame</h2>
      <p>
        A Python model is a <code>.py</code>{" "}file in <code>models/</code>{" "}that
        defines one function, <code>model(dbt, session)</code>. The function returns
        a DataFrame, which is a table held in code, with rows, named columns and
        methods for transforming them. A SQL model ends in a final SELECT. A Python model
        ends in a final DataFrame, and dbt saves whatever it returns as a table, just
        as it would the result of a SELECT.
      </p>
      <CodeBlock
        lang="text"
        title="models/.../my_python_model.py: the minimal shape"
        code={`
def model(dbt, session):

    # read upstream models, same DAG as SQL
    obs = dbt.ref("int_blood_pressure_all")

    final_df = ...   # the part SQL couldn't do

    return final_df
`}
      />
      <p>dbt passes in two arguments.</p>
      <ul>
        <li>
          <strong>
            <code>dbt</code>.
          </strong>{" "}
          The project context. <code>dbt.ref()</code>{" "}and <code>dbt.source()</code>{" "}
          return DataFrames that point at upstream models and sources, so the Python
          model takes its place in the DAG like any other. <code>dbt.config()</code>{" "}
          sets configuration, and <code>dbt.is_incremental</code>{" "}supports the
          incremental pattern.
        </li>
        <li>
          <strong>
            <code>session</code>.
          </strong>{" "}
          The connection to the platform&apos;s Python runtime. On Snowflake this is
          a <strong>Snowpark</strong>{" "}session, and the code runs inside
          Snowflake, next to the data. Nothing runs on your laptop, and the data
          never leaves the warehouse.
        </li>
      </ul>
      <p>
        Downstream models don&apos;t care that it was Python.{" "}
        <code>{"{{ ref('my_python_model') }}"}</code>{" "}works from any SQL model. The
        YAML file beside it carries the same description, owner and{" "}
        <code>data_tests</code>{" "}as everything else. Grain tests matter at least as
        much here as on a SQL model, and arguably more, because fewer reviewers can
        check Python logic by eye.
      </p>

      <h2>Configure the model and declare its packages</h2>
      <p>
        Configure the model inside the file with <code>dbt.config()</code>, or in
        YAML as usual. You declare any third-party packages so the platform can
        install them:
      </p>
      <CodeBlock
        lang="text"
        code={`
def model(dbt, session):
    dbt.config(
        materialized="table",
        packages=["scikit-learn", "numpy==1.23.1"]
    )
`}
      />
      <p>
        On Snowflake, packages come from the Anaconda channel that Snowpark provides,
        which covers most of the scientific Python stack. Snowflake only allows
        Anaconda packages once an organisation admin has accepted its third-party
        terms, so check that before you rely on one. Python models support two materialisations:{" "}
        <code>table</code>, the default, and <code>incremental</code>. They can&apos;t
        be views or ephemeral, so they always write a table.
      </p>

      <h2>Use Python only where SQL struggles</h2>
      <p>
        Use SQL when the team can write and review the transformation clearly in
        SQL. Consider Python when you need a method that&apos;s hard to express
        there, such as fuzzy record matching. dbt Labs sets the same default in its
        Python model docs.
      </p>
      <LessonQuote
        attribution="dbt Labs"
        work="Python models"
        href="https://docs.getdbt.com/docs/build/python-models"
      >
        As a general rule, if there&apos;s a transformation you could write equally
        well in SQL or Python, we believe that well-written SQL is preferable:
        it&apos;s more accessible to a greater number of colleagues, and it&apos;s
        easier to write code that&apos;s performant at scale. If there&apos;s a
        transformation you <em>can&apos;t</em>{" "}write in SQL, or where ten lines of
        elegant and well-annotated Python could save you 1000 lines of hard-to-read
        Jinja-SQL, Python is the way to go.
      </LessonQuote>
      <p>
        The test is in the last sentence. If the SQL version is merely longer, keep
        the SQL. In population health, Python tends to earn its place in three
        situations.
      </p>
      <ul>
        <li>
          <strong>Statistical and machine learning methods.</strong>{" "}Risk-score
          models, clustering, survival analysis. Anything that wants scikit-learn or
          scipy rather than a tower of CASE statements.
        </li>
        <li>
          <strong>Algorithms that fight SQL.</strong>{" "}Fuzzy matching, scoring for
          complex record linkage, walking a graph.
        </li>
        <li>
          <strong>An existing Python method.</strong>{" "}When a validated version
          already exists in Python, porting it to SQL adds risk and buys nothing.
        </li>
      </ul>
      <p>Know the costs before you reach for it.</p>
      <ul>
        <li>
          <strong>It&apos;s slower and costs more</strong>{" "}than the same work in
          SQL. pandas-style code runs on a single node unless you write it against
          the Snowpark DataFrame API.
        </li>
        <li>
          <strong>It&apos;s harder to review.</strong>{" "}Fewer of the team read Python
          fluently. That raises the bar for comments, tests and the PR description.
        </li>
        <li>
          <strong>
            You can&apos;t debug with <code>print()</code>.
          </strong>{" "}
          The code runs remotely. Debugging means reading platform logs or writing
          diagnostics into a column.
        </li>
      </ul>

      <Quiz
        questions={[
          {
            prompt: "Where does a dbt Python model's code execute?",
            options: [
              "On your machine, with results uploaded to Snowflake",
              "Inside Snowflake, via Snowpark. dbt only submits it",
              "On the GitHub Actions runner during deployment",
              "In a separate Python service dbt manages",
            ],
            answer: 1,
            explain:
              "dbt keeps definition separate from execution. It sends the model to the platform, and Snowpark runs it next to the data. Nothing runs locally, which is also why print() output never appears.",
          },
          {
            prompt:
              "You need a rolling 12-month average per patient. SQL or Python?",
            options: [
              "Python. Averages over time are statistical work",
              "SQL. Window functions express this directly, and more of the team can read it",
              "Python. It will run faster",
              "Either, it makes no difference",
            ],
            answer: 1,
            explain:
              "A window function does this in a few lines of SQL. Python is for what SQL can't express well, like machine learning, fuzzy matching or complex algorithms. For work SQL does natively, Python is slower and harder to review.",
          },
        ]}
      />
    </LessonShell>
  );
}
