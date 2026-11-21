import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Python models" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="python-models"
      kicker="Going further 08"
      title="Python models"
      lede="A dbt model doesn't have to be SQL. A .py file in models/ joins the same DAG and gets the same tests and lineage — for the work SQL cannot express well."
      minutes={8}
    >
      <Callout kind="info" title="We don't have any yet">
        <p>
          This project currently has no Python models — everything is SQL. This lesson
          exists because the capability is there (Fusion supports Python models on
          Snowflake), and the first person with a genuinely Python-shaped problem
          should know it is an option. Talk to the team before adding the first one.
        </p>
      </Callout>

      <h2>What a Python model is</h2>
      <p>
        A <code>.py</code>{" "}file in <code>models/</code>{" "}that defines one function,{" "}
        <code>model(dbt, session)</code>, and returns a DataFrame. Where a SQL model
        ends in a final SELECT, a Python model ends in a final DataFrame — dbt saves
        whatever it returns as a table, exactly as it would the result of a SELECT.
      </p>
      <CodeBlock
        lang="text"
        title="models/.../my_python_model.py — the minimal shape"
        code={`
def model(dbt, session):

    # read upstream models, same DAG as SQL
    obs = dbt.ref("int_blood_pressure_all")

    final_df = ...   # the part SQL couldn't do

    return final_df
`}
      />
      <p>The two arguments dbt passes in:</p>
      <ul>
        <li>
          <strong><code>dbt</code></strong> — the project context.{" "}
          <code>dbt.ref()</code>{" "}and <code>dbt.source()</code>{" "}return DataFrames
          pointing at upstream models and sources, so the Python model takes its place
          in the DAG like any other. <code>dbt.config()</code>{" "}sets configuration;{" "}
          <code>dbt.is_incremental</code>{" "}supports the incremental pattern.
        </li>
        <li>
          <strong><code>session</code></strong> — the connection to the platform&apos;s
          Python runtime. On Snowflake this is a <strong>Snowpark</strong>{" "}session: the
          code executes inside Snowflake, next to the data. Nothing runs on your
          laptop, and the data never leaves the warehouse.
        </li>
      </ul>
      <p>
        Downstream models do not care that it was Python:{" "}
        <code>{"{{ ref('my_python_model') }}"}</code>{" "}works from any SQL model, and
        the YAML file beside it carries the same description, owner and{" "}
        <code>data_tests</code>{" "}as everything else. Tests on a Python model&apos;s
        grain are exactly as valuable as on a SQL model&apos;s — arguably more,
        because reviewers are less able to eyeball the logic.
      </p>

      <h2>Configuration and packages</h2>
      <p>
        Configure inside the file with <code>dbt.config()</code>, or in YAML as usual.
        Third-party packages are declared so the platform can provide them:
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
        On Snowflake, packages come from the Anaconda channel available inside
        Snowpark — most of the scientific Python stack is there. Two materialisations
        are supported: <code>table</code>{" "}(default) and <code>incremental</code>.
        Python models cannot be views or ephemeral — they always write a table.
      </p>

      <h2>When Python is the right call</h2>
      <p>
        dbt&apos;s own guidance is the right default:{" "}
        <strong>
          if you can write it equally well in SQL, write it in SQL
        </strong>{" "}
        — more colleagues can read it, and it scales better. Python earns its place
        when SQL genuinely cannot express the work, or expresses it terribly:
      </p>
      <ul>
        <li>
          <strong>Statistical and ML methods</strong> — risk-score models, clustering,
          survival analysis, anything that wants scikit-learn or scipy rather than a
          tower of CASE statements.
        </li>
        <li>
          <strong>Algorithms that fight SQL</strong> — fuzzy matching, complex
          record-linkage scoring, graph traversal.
        </li>
        <li>
          <strong>Reusing an existing Python method</strong> — when a validated
          implementation already exists as Python, porting it to SQL adds risk rather
          than value.
        </li>
      </ul>
      <p>Know the trade-offs before reaching for it:</p>
      <ul>
        <li>
          <strong>Slower and costlier</strong>{" "}than the equivalent SQL — general
          Python compute, and pandas-style code runs single-node unless written
          against the Snowpark DataFrame API.
        </li>
        <li>
          <strong>Harder to review</strong> — fewer team members read Python fluently,
          which raises the bar on comments, tests and the PR description.
        </li>
        <li>
          <strong>No <code>print()</code>{" "}debugging</strong> — the code runs remotely;
          debugging means platform logs or writing diagnostics into a column.
        </li>
      </ul>

      <Callout kind="tip" title="The one-line test">
        <p>
          dbt Labs&apos; framing, which works well: if ten lines of clear Python
          replace a thousand lines of unreadable Jinja-SQL, write the Python. If the
          SQL version is merely longer, keep the SQL.
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt: "Where does a dbt Python model's code execute?",
            options: [
              "On your machine, with results uploaded to Snowflake",
              "Inside Snowflake, via Snowpark — dbt only submits it",
              "On the GitHub Actions runner during deployment",
              "In a separate Python service dbt manages",
            ],
            answer: 1,
            explain:
              "dbt separates definition from execution: it sends the model to the platform and Snowpark runs it next to the data. Nothing executes locally — which is also why print() output never appears.",
          },
          {
            prompt:
              "You need a rolling 12-month average per patient. SQL or Python?",
            options: [
              "Python — averages over time are statistical work",
              "SQL — window functions express this directly, and more of the team can read it",
              "Python — it will run faster",
              "Either, it makes no difference",
            ],
            answer: 1,
            explain:
              "A window function handles this in a few lines of SQL. Python is for what SQL can't express well — ML, fuzzy matching, complex algorithms — not for work SQL does natively, where it would be slower and less reviewable.",
          },
        ]}
      />
    </LessonShell>
  );
}
