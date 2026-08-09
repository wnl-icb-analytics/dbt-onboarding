import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { Callout } from "@/components/Callout";

export const metadata: Metadata = { title: "Observing production" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="observing-production"
      kicker="Learn 13"
      title="Observing production"
      lede="Every dbt run leaves structured evidence about what ran, what failed, how long it took and what was skipped. The project’s Snowflake observability app turns that Elementary history into a shared view of production health."
      minutes={13}
    >
      <h2>Deployment is not the end of the work</h2>
      <p>
        A green pull request establishes that a proposed change meets the checks run
        before merge. A successful deployment establishes that the selected production
        graph built at that moment. Neither guarantees that future source data will
        continue to satisfy the model&apos;s assumptions, that every scheduled lineage will
        finish on time or that the analytical definition matches every change in the
        real world.
      </p>
      <p>
        Observability is how the team learns what the production system is doing after
        code has been deployed. It connects individual run results into history: a
        failure can be seen as new or recurring, a slow model can be compared with its
        normal execution time, a row-count movement can be separated from a build
        error, and the downstream effect of a failed node can be assessed without
        reconstructing the run from terminal output.
      </p>
      <p>
        This is an active part of the analytics development lifecycle. The platform can
        collect the evidence, but people still decide what healthy means, investigate
        deviations and feed what they learn back into the next plan and change.
      </p>

      <h2>Elementary gives runs a common history</h2>
      <p>
        The project records invocation, model and test results in the Elementary schema
        after dbt runs. <a href="https://docs.elementary-data.com/">Elementary</a>{" "}
        provides dbt-native result and observability tables. Instead of each workflow producing an isolated log that is hard
        to compare, these records give scheduled builds, deployments and other
        invocations a common structure. The observability app reads that history from{" "}
        <code>DATA_LAKE__NCL.DBT_OBSERVABILITY</code>.
      </p>
      <table>
        <thead>
          <tr>
            <th>Elementary record</th>
            <th>What it lets the app answer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>dbt_invocations</code></td>
            <td>Which command, target, warehouse and selection ran, and when?</td>
          </tr>
          <tr>
            <td><code>dbt_run_results</code></td>
            <td>Which models succeeded, failed or were skipped, and how long did they take?</td>
          </tr>
          <tr>
            <td><code>elementary_test_results</code></td>
            <td>Which assertions passed, warned or failed, and is the problem recurring?</td>
          </tr>
          <tr>
            <td><code>dbt_models</code> and <code>dbt_tests</code></td>
            <td>Which project resource, path, SQL and relationship does a result describe?</td>
          </tr>
          <tr>
            <td><code>ROW_COUNT_LOG</code></td>
            <td>How have materialised table row counts changed over time?</td>
          </tr>
        </tbody>
      </table>
      <p>
        The app is a Snowflake-native Streamlit application maintained in the{" "}
        <a
          href="https://github.com/wnl-icb-analytics/snowflake-dbt-observability-streamlit"
          target="_blank"
          rel="noopener noreferrer"
        >
          snowflake-dbt-observability-streamlit repository
        </a>
        . Its queries and thresholds are version-controlled, so the organisation&apos;s
        definition of project health is inspectable and can improve through review.
      </p>

      <h2>Read project health before reading one run</h2>
      <p>
        A dbt invocation may select the whole project, one scheduled tag or a small
        changed subgraph. The latest run is therefore not automatically a statement
        about the health of every model. A successful intraday run cannot prove that a
        failing monthly model has recovered; a partial deployment may not include the
        model whose test failed yesterday.
      </p>
      <p>
        The app&apos;s home page deliberately separates <strong>open or recurring
        issues across runs</strong> from <strong>issues in the latest build</strong>.
        The first answers “what is currently unhealthy anywhere in the project?” The
        second explains what happened in the most recent invocation and displays its
        selection when it was partial. Recent runs then provide the operational
        sequence connecting those two views.
      </p>
      <Callout kind="warn" title="Latest does not mean complete">
        <p>
          Always read the command and selection before treating a green run as a green
          project. Health is the latest relevant state of each model and test, not the
          colour of whichever invocation finished last.
        </p>
      </Callout>

      <h2>The app supports several kinds of investigation</h2>
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Use it to understand</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Home</td>
            <td>Current project health, the latest build and recent invocations</td>
          </tr>
          <tr>
            <td>Alerts</td>
            <td>Active and historical model or test failures, failure streaks and resolution time</td>
          </tr>
          <tr>
            <td>Models</td>
            <td>Models by project path, slow models and individual run histories</td>
          </tr>
          <tr>
            <td>Tests</td>
            <td>Test history, flaky tests and models for which no tests are recorded</td>
          </tr>
          <tr>
            <td>Runs</td>
            <td>Invocation selection, results, duration, skipped nodes and execution timeline</td>
          </tr>
          <tr>
            <td>Growth</td>
            <td>Unexpected growth or shrinkage in materialised table row counts</td>
          </tr>
          <tr>
            <td>Performance</td>
            <td>Total and average execution time, including the models consuming most build time</td>
          </tr>
        </tbody>
      </table>
      <p>
        Model detail connects operational evidence back to implementation. It exposes
        recent status, success rate, execution and row-count trends, compiled SQL and
        applied tests. Test detail shows the assertion&apos;s SQL, its run history and its
        related model. The app is therefore not just a red-light dashboard; it is a
        route from an observed symptom to the project resource that needs investigation.
      </p>

      <h2>Investigate from failure to impact</h2>
      <p>
        A useful investigation moves in a consistent order. Beginning with the visible
        symptom and immediately editing SQL risks treating a skipped descendant or a
        transient platform error as the root cause.
      </p>
      <ol>
        <li>
          <strong>Establish the invocation.</strong> Check its command, target,
          selection and time. Determine whether it was a deploy, scheduled build or
          deliberately narrow run.
        </li>
        <li>
          <strong>Find the first failed node.</strong> Separate a model error or failed
          test from descendants that dbt skipped because their parent did not succeed.
        </li>
        <li>
          <strong>Read the history.</strong> Decide whether the issue is new, recurring,
          flaky or part of a longer performance or row-count trend.
        </li>
        <li>
          <strong>Inspect the contract and message.</strong> Use the model or test detail,
          then open its SQL, YAML and lineage in the dbt project. Ask whether the data
          broke an assertion, the implementation broke, or the asserted expectation is
          no longer correct.
        </li>
        <li>
          <strong>Assess impact.</strong> Use the{" "}
          <Link href="/learn/refs-and-sources">DAG</Link> to check how many downstream models were skipped
          and which products consume the affected relation. Existing descendants may
          still contain their last successful data, which makes staleness part of the
          incident even when they remain queryable.
        </li>
        <li>
          <strong>Recover through the normal workflow.</strong> Correct code on a branch
          and merge it through review. Retry reviewed code deliberately when the cause
          was transient or upstream data arrived late. Plan a full refresh where an
          incremental model&apos;s history must be repaired. The{" "}
          <Link href="/advanced/materialisations">materialisations guide</Link> explains
          why that history does not change automatically.
        </li>
        <li>
          <strong>Confirm resolution.</strong> A fix is complete when the relevant model,
          tests and descendants have succeeded and the expected data freshness has been
          restored—not merely when a PR has merged.
        </li>
      </ol>

      <h2>Operational evidence is not semantic proof</h2>
      <p>
        The app can show that a model ran successfully, remained near its normal row
        count and passed every declared test. It cannot prove that an undeclared
        business assumption is correct. A consistently wrong definition can be
        perfectly reliable. Observability is strongest when model contracts are clear,
        <Link href="/learn/tests-and-docs"> tests protect the important decisions</Link>
        {" "}and owners respond to changes in the real
        world as well as failures in the code.
      </p>
      <p>
        The reverse is also important: not every red result means the data is bad. A
        source may have legitimately changed, a test may encode the wrong population or
        a warning may be an accepted temporary condition. The result creates evidence
        and demands a decision; it does not make that decision automatically.
      </p>

      <h2>Ownership closes the loop</h2>
      <p>
        Model ownership is not only a documentation convenience. It identifies who can
        interpret a failure, coordinate affected consumers and decide whether the right
        response is a data correction, a code change, a revised assertion or an agreed
        period of stale service. Analysts therefore participate in observability for
        the models and products whose meaning they own, with engineering support when
        the cause crosses into ingestion, orchestration, permissions or platform
        behaviour.
      </p>
      <p>
        The preceding <Link href="/learn/merge-to-production">production lesson</Link>{" "}
        explains how code is deployed and scheduled. This page completes that part of
        the lifecycle: observe what actually happened, understand its effect, recover
        safely and let the evidence improve the next change.
      </p>
    </LessonShell>
  );
}
