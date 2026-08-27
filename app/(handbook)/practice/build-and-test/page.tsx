import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Checklist } from "@/components/Checklist";
import { GuidedCourseLink } from "@/components/GuidedCourseLink";

export const metadata: Metadata = { title: "Build & test locally" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="build-and-test"
      kicker="Field guide · 5"
      title="Build & test locally"
      lede="dbt failures come in three kinds, and they announce themselves differently. Knowing which kind you are looking at is most of the work of fixing it."
      minutes={8}
    >
      <GuidedCourseLink href="/courses/first-pr/build-and-test" />

      <h2>Build the smallest thing that answers your question</h2>
      <p>
        Every build is a loop: change something, build, read the result. The
        tighter that loop, the faster you work — so the habit worth forming is
        to select only what the current question needs, and widen the
        selection only when the question widens.
      </p>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>The question it answers</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>dbt build -s my_model</code></td>
            <td>Does my model build, and does its data pass its tests?</td>
          </tr>
          <tr>
            <td><code>dbt build -s +my_model</code></td>
            <td>Same, after first rebuilding everything upstream of it</td>
          </tr>
          <tr>
            <td><code>dbt build -s my_model+</code></td>
            <td>Did my change break anything that reads this model?</td>
          </tr>
          <tr>
            <td><code>.\build_changed.ps1</code></td>
            <td>Do all the models my branch touches still build and pass?</td>
          </tr>
        </tbody>
      </table>

      <h2>The three kinds of failure</h2>
      <p>
        <strong>Compilation errors</strong>{" "}happen before Snowflake is
        involved at all. dbt could not turn your files into SQL — a misspelled{" "}
        <code>ref()</code>{" "}naming a model that does not exist, broken Jinja,
        a YAML file whose indentation went wrong. The message names the file
        and usually the line, and nothing was executed anywhere. These failures
        are usually quick to fix. They are the cheapest failures you will ever have,
        which is why the editor&apos;s live checking (which runs the same
        compilation as you type) is worth trusting.
      </p>
      <p>
        <strong>Database errors</strong>{" "}mean the SQL compiled, reached
        Snowflake, and Snowflake rejected it: a column that does not exist on
        the upstream table, a type that will not cast, a syntax slip. The
        message in dbt&apos;s output is Snowflake&apos;s own, quoted back to
        you. When it does not seem to match what you wrote, remember that
        Snowflake never saw what you wrote — it saw the compiled SQL, after
        every <code>ref()</code>{" "}and macro expanded. Open the rendered
        version in <code>target/compiled/</code>{" "}and the mismatch is usually
        obvious there.
      </p>
      <p>
        <strong>Test failures</strong>{" "}are different in kind, and the
        difference matters: your SQL ran successfully, and then the data broke
        a rule you had asserted about it. Nothing is necessarily wrong with
        your code. A test failure means one of three things — your code
        produced wrong rows, your assumption about the data was wrong, or the
        source has a genuine quality problem — and deciding which is
        investigation, not debugging.
      </p>

      <h2>Reading the output</h2>
      <p>
        A failing build prints a lot, and most of it is consequence rather
        than cause. dbt builds in dependency order, so when one node fails,
        everything downstream of it is skipped — and each skip prints its own
        line. Resist reading the wall of red from the bottom:
      </p>
      <CodeBlock
        lang="text"
        code={`
2 of 6 ERROR creating sql view model stg_reference_opening_hours  [ERROR in 1.2s]
3 of 6 SKIP relation int_site_capacity ......................... [SKIP]
4 of 6 SKIP test not_null_int_site_capacity_site_code ........... [SKIP]
...
Database Error in model stg_reference_opening_hours
  invalid identifier 'OPENS_AT'
`}
      />
      <p>
        One thing failed here, not three. The skips exist <em>because</em>{" "}of
        the error above them; fix the first failing node and they resolve
        themselves. Find the first <code>ERROR</code>{" "}or <code>FAIL</code>{" "}
        line, read the detailed message dbt prints for it at the end of the
        run, and ignore everything downstream until that is fixed.
      </p>

      <h2>When a test fails, look at the rows</h2>
      <p>
        A FAIL line prints a count — <code>Got 14 results, configured to fail
        if != 0</code> — but the count is not the information. The rows are.
        Two ways to see them:
      </p>
      <Callout kind="warn" title="Keep row-level output in an approved tool">
        <p>
          A coding agent can send command output to its provider. Run
          <code> dbt show</code>{" "}or failing-test SQL through one only for synthetic
          or non-identifying results, or when the tool has approved
          zero-data-retention controls for the data. Otherwise inspect the rows
          directly in an approved human-controlled Snowflake session.
        </p>
      </Callout>
      <CodeBlock
        lang="bash"
        code={`
dbt show -s my_model --limit 20     # eyeball the model's output
`}
      />
      <p>
        Or run the test itself: every test compiles to a query that selects
        exactly the violating rows, and the compiled query is sitting in{" "}
        <code>target/compiled/</code>. Paste it into Snowflake and you are
        looking at the 14 offenders directly — which usually settles the
        question of which kind of failure this is:
      </p>
      <ul>
        <li>
          <strong>The grain test failed:</strong>{" "}look at a pair of duplicated
          rows side by side. If they differ in some column, your grain sentence
          missed a dimension of the data — the table is “one row per site per
          day <em>per something else</em>”. If they are identical, either a
          join in your model fanned out, or the source itself has duplicates.
        </li>
        <li>
          <strong><code>not_null</code>{" "}failed:</strong>{" "}look at the null
          rows before deciding anything. Sometimes null is legitimate and the
          test was your misunderstanding — drop the test and write what null
          means in the column description instead. Sometimes the rows are junk
          from the feed, which is worth a message to the team, not a silent
          filter.
        </li>
      </ul>
      <Callout kind="tip" title="Write down what the failure taught you">
        <p>
          A failing test on real data almost always teaches you something
          nobody had written down. Capture it — in a description, a changed
          test, or a sentence in the PR. A green build with the reasoning lost
          is only half the work.
        </p>
      </Callout>

      <h2>Before the PR</h2>
      <Checklist
        id="build"
        items={[
          { key: "green", label: <><code>dbt build -s your_model</code>{" "}is green</> },
          { key: "downstream", label: <>Downstream models built where your change could affect them</> },
          { key: "finding", label: <>Any unexpected data condition is documented</> },
        ]}
      />
    </LessonShell>
  );
}
