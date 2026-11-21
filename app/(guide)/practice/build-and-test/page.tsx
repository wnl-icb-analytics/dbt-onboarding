import type { Metadata } from "next";
import Link from "next/link";
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
      kicker="Walkthrough · 5"
      title="Build & test locally"
      lede="Start with your staging model and its YAML tests. You'll build them in dev, read the results and trace any failure back to its cause."
      minutes={8}
    >
      <GuidedCourseLink href="/courses/first-pr/build-and-test" />

      <p>
        For the reasoning behind these commands, materialisations and comparing
        results, read{" "}
        <Link href="/learn/building-and-checking">Building and checking a change</Link>.
      </p>

      <h2>Build only what you need to check</h2>
      <p>
        Start with the model you changed. <code>dbt build -s my_model</code>{" "}
        builds that model and runs its tests. Widen the selection when you also
        need to check its inputs or the models that read it. Every build is a
        loop of change, build and read the result, and a smaller selection
        keeps that loop fast.
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
            <td>The same, after rebuilding everything upstream of it first</td>
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
      <p>
        <code>build_changed.ps1</code>{" "}is a PowerShell script, so it runs on
        Windows. Add <code>-d</code>{" "}to include downstream models, or{" "}
        <code>-u</code>{" "}for upstream ones. It finds changes by comparing your
        branch with <code>main</code>, so it doesn&apos;t see a brand-new file
        until you&apos;ve staged it with <code>git add</code>. Until then, name
        the model with <code>-s</code>.
      </p>

      <h2>The three kinds of failure</h2>
      <p>
        dbt failures come in three kinds, and each looks different in the
        output. Once you know which kind you&apos;re looking at, you know where
        to look for the fix.
      </p>
      <p>
        <strong>Compilation errors</strong>{" "}happen while dbt prepares and
        checks your SQL, before it builds anything. Typical causes are a{" "}
        <code>ref()</code>{" "}to a model that doesn&apos;t exist, broken Jinja, or
        YAML with the wrong indentation, or a SQL syntax slip. The message names
        the file and usually the line.
      </p>
      <p>
        The dbt Fusion engine can also check column names and types against
        Snowflake&apos;s metadata, but only in its strict mode. No model in
        this project uses strict mode. Most use the default baseline mode, so a
        wrong column name gets past this stage and fails at the next one.
      </p>
      <p>
        These are the cheapest failures you&apos;ll ever have. That&apos;s why the
        editor&apos;s live checking is worth trusting. It runs the same baseline
        checks as you type, so it flags a broken <code>ref()</code>{" "}or a
        syntax slip straight away. It won&apos;t flag a misspelt column.
      </p>
      <p>
        <strong>Database errors</strong>{" "}mean the SQL compiled and reached
        Snowflake, and Snowflake rejected it. Maybe a column doesn&apos;t exist,
        a type won&apos;t cast, or there&apos;s a syntax slip that dbt didn&apos;t
        catch. The message in
        dbt&apos;s output is Snowflake&apos;s own, quoted back to you.
      </p>
      <p>
        Sometimes the message doesn&apos;t seem to match what you wrote. That&apos;s
        because Snowflake never saw what you wrote. It saw the compiled SQL,
        after every <code>ref()</code>{" "}and macro had expanded. Open the
        compiled version under <code>target/compiled/</code>{" "}and the mismatch
        is usually obvious.
      </p>
      <p>
        <strong>Test failures</strong>{" "}are a different kind of thing. Your SQL
        ran fine. Then the data broke a rule you&apos;d set for it. Your code
        may be fine. A test failure means one of three things.
        Your code produced wrong rows, your assumption about the data was wrong,
        or the source has a real quality problem. Working out which one is
        investigation, not debugging.
      </p>

      <h2>Find the first failure in the output</h2>
      <p>
        Find the first <code>Failed</code>{" "}line and read the error just
        above it. dbt builds in dependency order. When one model fails, dbt
        skips everything downstream of it, including that model&apos;s own
        tests, and prints a line for each skip. So most of a failing
        build&apos;s output is consequence, not cause. Here&apos;s a build of
        the staging model from walkthrough 3, with a column name misspelt.
      </p>
      <CodeBlock
        lang="text"
        code={`
[DbSyntaxInvalid (dbt1302)]: Database Error in model stg_reference_lookup_ncl_fin_week_number_2019_2031
  [Snowflake] 000904 (42000): SQL compilation error: error line 5 at position 4
  invalid identifier 'NEW_FIN_WEEK_NUMBER'
    Failed model REFERENCE.stg_reference_lookup_ncl_fin_week_number_2019_2031 (view) [1 of 3 in 1.10s]
   Skipped test  not_null_stg_reference_lookup_ncl_fin_week_number_2019_2031_calendar_date [2 of 3]
   Skipped test  unique_stg_reference_lookup_ncl_fin_week_number_2019_2031_calendar_date [3 of 3]

==================== Execution Summary =====================
Finished 'build' with 1 error for target 'dev' [14.2s]
Summary: 8 total | 5 success | 1 error | 2 skipped
`}
      />
      <p>
        One thing failed here, not three. The skips only happened{" "}
        <em>because</em>{" "}of the error above them. The error block above
        the <code>Failed</code>{" "}line is Snowflake saying the column doesn&apos;t exist, because
        the raw column is <code>new_fin_week_num</code>. Ignore everything
        downstream until you&apos;ve fixed it. Then rerun the same selection to
        see whether anything else fails. The summary counts are a little higher
        than the nodes you selected, because they include the housekeeping hooks
        the project runs on every build.
      </p>

      <h2>When a test fails, look at the rows</h2>
      <p>
        A failed test prints a <code>Failed test</code>{" "}line and a count,
        like <code>Test failed (14 failed row(s))</code>. The count tells you
        how many failures dbt found. To see what broke the rule, look at the
        rows yourself in an approved Snowflake session. You can do that two
        ways.
      </p>
      <Callout kind="warn" title="Keep row-level output in an approved tool">
        <p>
          A coding agent can send command output to its provider. Only let one
          run <code>dbt show</code>{" "}or failing-test SQL when the query is built
          to return a high-level, non-identifying aggregate. Never use a coding
          agent to look at failing rows or model rows. Look at those yourself, in
          an approved Snowflake session that you control.
        </p>
      </Callout>
      <p>The first way is to look at the model&apos;s output.</p>
      <CodeBlock
        lang="bash"
        code={`
dbt show -s my_model --limit 20     # run the model's SQL again, show 20 rows
`}
      />
      <p>
        <code>dbt show</code>{" "}runs the model&apos;s SQL again. It doesn&apos;t
        read what the build stored. For a view the two are the same. For a table
        they can differ if the source moved since the build. For an incremental
        model they often differ, because the stored rows came from many runs and
        the incremental filter. When your question is about the stored rows,
        query the built table in a Snowflake worksheet instead. Your dev copy
        sits where production keeps it, with <code>DEV__</code>{" "}in front of
        the database name.
      </p>
      <p>
        The second way is to run the test itself. Every test compiles to a query
        that selects the rows that break it. Fusion writes that query
        under <code>target/compiled/</code>, in a file named after the test. For
        generic tests like <code>unique</code>, look in{" "}
        <code>target/compiled/wnl_analytics/target/generic_tests/</code>. Open
        the file, paste the SQL into a Snowflake worksheet and run it.
        Now you&apos;re looking at the 14 rows directly, which usually tells you
        which kind of failure this is.
      </p>
      <ul>
        <li>
          <strong>The grain test failed.</strong>{" "}Look at a pair of duplicated
          rows side by side. If they differ in some column, your grain sentence
          missed something. The table is really &quot;one row per date{" "}
          <em>per something else</em>&quot;. If they&apos;re identical, either a
          join in your model fanned out or the source itself has duplicates.
        </li>
        <li>
          <strong><code>not_null</code>{" "}failed.</strong>{" "}Look at the null
          rows before you decide anything. Sometimes the null is legitimate and
          the test came from a misunderstanding. Then drop the test and explain
          what the null means in the column description. Sometimes the rows are
          junk from the feed. Tell the team, rather than adding a
          quiet filter.
        </li>
      </ul>
      <Callout kind="tip" title="Write down what the failure taught you">
        <p>
          A failing test on real data nearly always teaches you something nobody
          had written down. Record it in a description, a changed test or a line
          in the PR. A green build that loses the reasoning is only half the
          work.
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
