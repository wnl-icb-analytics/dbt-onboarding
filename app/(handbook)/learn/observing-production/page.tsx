import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Observing production" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="observing-production"
      kicker="Learn 12"
      title="Observing production"
      lede="Every dbt run leaves structured evidence about what ran, what failed, how long it took and what was skipped. The project's Snowflake observability app turns that Elementary history into a shared view of production health."
      minutes={13}
    >
      <h2>What happened after the last change?</h2>
      <p>
        A model can work on yesterday&apos;s input and fail on today&apos;s.
        Observing production means examining what ran, which checks passed, how
        long the work took and what data the outputs now represent.
      </p>
      <p>
        The project uses Elementary to record run and test history. A shared
        Snowflake Streamlit app presents that history so you can compare
        failures, model timings and row-count changes. The{" "}
        <Link href="/reference/operations#observability-records">
          {" "}
          production reference
        </Link>{" "}
        lists its records and pages. Here we will use the evidence to follow one
        fictional failure.
      </p>

      <h2>Read project health before reading one run</h2>
      <p>
        A dbt invocation may select the whole project, one scheduled tag or a
        small changed subgraph. The latest run is therefore not automatically a
        statement about the health of every model. A successful intraday run
        cannot prove that a failing monthly model has recovered; a partial
        deployment may not include the model whose test failed yesterday.
      </p>
      <p>
        The app&apos;s home page deliberately separates{" "}
        <strong>open or recurring issues across runs</strong> from{" "}
        <strong>issues in the latest build</strong>. The first answers
        &quot;what is currently unhealthy anywhere in the project?&quot; The
        second explains what happened in the most recent invocation and displays
        its selection when it was partial. Recent runs then provide the
        operational sequence connecting those two views.
      </p>
      <Callout kind="warn" title="Latest does not mean complete">
        <p>
          Always read the command and selection before treating a green run as a
          green project. Health is the latest relevant state of each model and
          test, not the colour of whichever invocation finished last.
        </p>
      </Callout>

      <h2>Follow a failed grain test</h2>
      <p>
        Imagine the scheduled build of a person-level activity model. It
        completes its SQL, but the uniqueness test finds a person twice. The
        following times and results are illustrative.
      </p>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Evidence</th>
            <th>What it means</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>04:10</td>
            <td>Person activity table builds successfully.</td>
            <td>
              The new relation exists; its assertions have not all passed.
            </td>
          </tr>
          <tr>
            <td>04:11</td>
            <td>Person-key test fails.</td>
            <td>The claimed one-row-per-person grain is broken.</td>
          </tr>
          <tr>
            <td>04:11</td>
            <td>A selected dashboard table is skipped.</td>
            <td>
              It was not refreshed by this run and may retain earlier data.
            </td>
          </tr>
          <tr>
            <td>07:05</td>
            <td>An unrelated selection succeeds.</td>
            <td>That run does not establish recovery of the activity model.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Open the failed test and its model history. Compare the failure with
        recent changes and inspect the returned keys in an approved data
        environment. Suppose a new input now has two qualifying records per
        person. That evidence points to the selection or join rule. It does not
        justify deleting the uniqueness test while the output still promises
        person grain.
      </p>
      <p>
        Assess each consumer as well. The skipped dashboard table may be stale,
        but someone querying the failed model directly can see its new rows. A
        downstream view can also read those rows through its existing
        definition. The whole graph has not been rolled back to one consistent
        earlier state.
      </p>

      <h2>Investigate from failure to impact</h2>
      <p>
        A useful investigation moves in a consistent order. Beginning with the
        visible symptom and immediately editing SQL risks treating a skipped
        descendant or a transient platform error as the root cause.
      </p>
      <ol>
        <li>
          <strong>Establish the invocation.</strong> Check its command, target,
          selection and time. Determine whether it was a deploy, scheduled build
          or deliberately narrow run.
        </li>
        <li>
          <strong>Find the first failed node.</strong> Separate a model error or
          failed test from descendants that dbt skipped because their parent did
          not succeed.
        </li>
        <li>
          <strong>Read the history.</strong> Decide whether the issue is new,
          recurring, flaky or part of a longer performance or row-count trend.
        </li>
        <li>
          <strong>Inspect the contract and message.</strong> Use the model or
          test detail, then open its SQL, YAML and lineage in the dbt project.
          Ask whether the data broke an assertion, the implementation broke, or
          the asserted expectation is no longer correct.
        </li>
        <li>
          <strong>Assess impact.</strong> Use the{" "}
          <Link href="/learn/refs-and-sources">DAG</Link> to check how many
          downstream models were skipped and which products consume the affected
          relation. Existing descendants may still contain their last successful
          data, which makes staleness part of the incident even when they remain
          queryable.
        </li>
        <li>
          <strong>Recover through the normal workflow.</strong> Correct code on
          a branch and merge it through review. Retry reviewed code deliberately
          when the cause was transient or upstream data arrived late. Plan a
          full refresh where an incremental model&apos;s history must be
          repaired. The{" "}
          <Link href="/advanced/materialisations">materialisations guide</Link>{" "}
          explains why that history does not change automatically.
        </li>
        <li>
          <strong>Confirm resolution.</strong> A fix is complete when the
          relevant model, tests and descendants have succeeded and the expected
          data freshness has been restored. Merging a PR alone does not
          establish recovery.
        </li>
      </ol>

      <h2>A successful build can still contain old data</h2>
      <p>
        Suppose today&apos;s source file has not arrived, but a model
        successfully runs against yesterday&apos;s file. Its row count and
        uniqueness test may look normal. The build succeeded; the output still
        fails a requirement for today&apos;s data.
      </p>
      <p>
        Compare the source period represented with the consumer&apos;s expected
        period. A run timestamp records execution, not the arrival or
        completeness of its inputs. A row-count movement is useful evidence but
        does not explain its cause by itself.
      </p>

      <h2>Operational evidence is not semantic proof</h2>
      <p>
        The app can show that a model ran successfully, remained near its normal
        row count and passed every declared test. It cannot prove that an
        undeclared business assumption is correct. A consistently wrong
        definition can be perfectly reliable. Observability is strongest when
        model contracts are clear,{" "}
        <Link href="/learn/tests-and-docs">
          {" "}
          tests protect the important decisions
        </Link>{" "}
        and owners respond to changes in the real world as well as failures in
        the code.
      </p>
      <p>
        The reverse is also important: not every red result means the data is
        bad. A source may have legitimately changed, a test may encode the wrong
        population or a warning may be an accepted temporary condition. The
        result creates evidence and demands a decision; it does not make that
        decision automatically.
      </p>

      <h2>Ownership closes the loop</h2>
      <p>
        Model ownership is not only a documentation convenience. It identifies
        who can interpret a failure, coordinate affected consumers and decide
        whether the right response is a data correction, a code change, a
        revised assertion or an agreed period of stale service. Analysts
        therefore participate in observability for the models and products whose
        meaning they own, with engineering support when the cause crosses into
        ingestion, orchestration, permissions or platform behaviour.
      </p>
      <p>
        In the example, recovery requires the person model and its tests to
        pass, the affected consumer to refresh, and the expected source period
        to be present. Closing the code change alone does not establish those
        results.
      </p>
      <Quiz
        title="Interpret the run"
        questions={[
          {
            prompt:
              "An activity model's grain test fails. The next run is green but selects only a different source. Has the activity model recovered?",
            options: [
              "Yes, the latest run is green",
              "No recovery evidence is available from that unrelated run",
              "Yes, tests roll back failed models",
              "Only if the row count is unchanged",
            ],
            answer: 1,
            explain:
              "Read the selection. Recovery needs evidence for the affected model, its tests and consumers, plus the required data freshness.",
          },
          {
            prompt:
              "A daily table builds today using yesterday's late-arriving source file. Which statement is justified?",
            options: [
              "Today's source period is complete",
              "Every consumer is current",
              "The build succeeded, but freshness needs a separate check",
              "The model must have failed its uniqueness test",
            ],
            answer: 2,
            explain:
              "Execution time and source period are different. Successful SQL and structural tests do not establish that the expected delivery arrived.",
          },
        ]}
      />
    </LessonShell>
  );
}
