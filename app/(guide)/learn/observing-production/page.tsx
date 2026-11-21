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
      kicker="Learn 14"
      title="Observing production"
      lede="Elementary, a dbt package, records what each production run built, what failed or was skipped, and how long it took. The team's Snowflake app reads that history so you can check production health and compare runs."
      minutes={13}
    >
      <h2>Observing production means checking what ran and on which data</h2>
      <p>
        Observing production means looking at what dbt ran, which checks
        passed, how long it took, and what period of data the outputs now
        describe. You need it because a model can fail when its code
        hasn&apos;t changed. It can build happily on yesterday&apos;s input and
        fail on today&apos;s.
      </p>
      <p>
        The project uses Elementary, a dbt package that records the result of
        every model and test in each run. It&apos;s switched on only for the
        production target, so your local DEV builds don&apos;t appear. A shared
        Streamlit app in Snowflake reads that history and lets you compare
        failures, model timings and row counts across runs. The{" "}
        <Link href="/reference/operations#observability-records">
          production reference
        </Link>{" "}
        lists its tables and pages. Here we&apos;ll use it to follow one
        made-up failure.
      </p>

      <h2>The latest run only covers the models it selected</h2>
      <p>
        A run tells you about the models it selected, and nothing about the
        rest. Each time a dbt command runs, that&apos;s one invocation. An
        invocation might select the whole project, one scheduled tag, or a
        small set of changed models. A green SDL intraday run
        can&apos;t prove that a broken monthly model has recovered. A deploy
        that only built your change may not include the model whose test
        failed yesterday.
      </p>
      <p>
        The app&apos;s home page is laid out around that problem. The top half
        shows what&apos;s wrong now, anywhere in the project. It lists models
        and tests that are failing, warning, stale, losing rows or skipped.
        Failures and warnings come from the latest real result for each model
        and test across all runs, so a failure stays listed even if a later run
        skipped that model. Below that,{" "}
        <strong>Latest build</strong> shows what happened in the most recent
        invocation and, when it was a partial run, which selection it used.{" "}
        <strong>Recent runs</strong> then gives the sequence of invocations
        that connects the two.
      </p>
      <Callout kind="warn" title="Latest doesn't mean everything">
        <p>
          Read the command and selection before you treat a green run as a
          green project. Health is the latest result for each model and test,
          not the colour of whichever invocation finished last.
        </p>
      </Callout>

      <h2>Follow a failed grain test</h2>
      <p>
        This example follows one failed uniqueness test through a daily build
        and the runs after it. Imagine the daily build of a person-level
        activity model. The SQL runs,
        but the uniqueness test finds one person twice. The times and results
        below are illustrative.
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
            <td>06:10</td>
            <td>The person activity table builds.</td>
            <td>The new table exists, but its tests haven&apos;t all passed.</td>
          </tr>
          <tr>
            <td>06:11</td>
            <td>The person-key test fails.</td>
            <td>The promised one row per person no longer holds.</td>
          </tr>
          <tr>
            <td>06:11</td>
            <td>A dashboard table downstream is skipped.</td>
            <td>
              This run didn&apos;t refresh it, so it may still hold older data.
            </td>
          </tr>
          <tr>
            <td>09:05</td>
            <td>The SDL intraday run succeeds.</td>
            <td>
              That run didn&apos;t select the activity model, so it says
              nothing about recovery.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Open the failed test and the model&apos;s history. Compare the failure
        with recent changes, and look at the duplicated keys in an approved
        data environment, never in the repository. Say a new input now has two
        qualifying records for some people. That points to the selection or
        join rule. It doesn&apos;t justify deleting the uniqueness test while
        the model still promises one row per person.
      </p>
      <p>
        Check each consumer too. The skipped dashboard table may be out of
        date, but anyone querying the failed model directly sees its new rows,
        duplicates included. A downstream view reads those same rows, because a
        view runs its SQL each time someone queries it. The graph hasn&apos;t
        rolled back to one consistent earlier state.
      </p>

      <h2>Investigate a failure in the same order each time</h2>
      <p>
        Start with what the run selected and the first model or test that
        failed. Then work out from there to what it affected, and check the
        history before you decide the SQL needs changing. If you start
        from the visible symptom and go straight to editing SQL, you risk
        treating a skipped descendant, or a passing platform glitch, as the
        root cause.
      </p>
      <ol>
        <li>
          <strong>Establish the invocation.</strong> Check its command, target,
          selection and time. Was it a deploy, a scheduled build, or a
          deliberately narrow run?
        </li>
        <li>
          <strong>Find the first failed node.</strong> Separate a model error or
          failed test from the descendants dbt skipped because their parent
          didn&apos;t succeed. Skipped nodes aren&apos;t broken. They just
          didn&apos;t run.
        </li>
        <li>
          <strong>Read the history.</strong> Decide whether the problem is new,
          recurring, flaky, or part of a longer trend in run time or row
          counts.
        </li>
        <li>
          <strong>Inspect the message and the model&apos;s rules.</strong> Start from the
          model or test page in the app, then open the SQL, YAML and lineage in
          the dbt project. Did the data break an assertion, did the code break,
          or is the assertion itself no longer right?
        </li>
        <li>
          <strong>Assess impact.</strong> Use the{" "}
          <Link href="/learn/refs-and-sources">DAG</Link> to see how many
          downstream models were skipped and which products read the affected
          table. Descendants that still exist may hold their last good data. You
          can still query them, but stale data is part of the incident.
        </li>
        <li>
          <strong>Recover through the normal workflow.</strong> Fix code on a
          branch and merge it through review. If the cause was temporary, or
          upstream data arrived late, re-run the reviewed code on purpose. If an
          incremental model&apos;s history needs repairing, plan a full refresh.
          The <Link href="/advanced/materialisations">materialisations guide</Link>{" "}
          explains why that history doesn&apos;t fix itself.
        </li>
        <li>
          <strong>Confirm resolution.</strong> You&apos;re done when the model,
          its tests and its descendants have succeeded and the data is as fresh
          as consumers expect. A merged PR on its own doesn&apos;t prove
          recovery.
        </li>
      </ol>

      <h2>A successful build can still contain old data</h2>
      <p>
        A run timestamp records when dbt ran. It says nothing about whether the
        inputs had arrived in full, so to know how current an output is, check
        the period its inputs cover. Suppose today&apos;s source file
        hasn&apos;t arrived, and a model runs successfully on yesterday&apos;s
        file. Its row count and uniqueness test may look perfectly normal. The
        build succeeded. The output still fails the requirement to show
        today&apos;s data.
      </p>
      <p>
        Compare the period the source covers with the period the consumer
        expects. A change in row count
        is useful evidence, but it doesn&apos;t explain its own cause.
      </p>
      <p>
        The app checks staleness from both ends, using each item&apos;s own
        history. On the home page, <strong>Stale outputs</strong> lists tables
        whose last successful build is more than twice their usual gap between
        scheduled builds, and at least 72 hours old. That catches a model that
        stopped building. The <strong>Sources</strong> page shows whether each
        source feed is still delivering. It marks a feed late when no new rows
        have arrived for more than twice its usual gap between updates, and for
        more than 48 hours. Use that page to tell a dbt problem from a late
        feed.
      </p>

      <h2>Run results can&apos;t tell you a definition is right</h2>
      <p>
        The app can show that a model ran, kept close to its usual row count,
        and passed every declared test. It can&apos;t prove that an assumption
        nobody wrote down is correct. A definition can be wrong in the
        same way every day, and look perfectly reliable. Observability works
        best when model contracts are clear,{" "}
        <Link href="/learn/tests-and-docs">
          tests protect the important decisions
        </Link>
        , and owners respond to changes in the real world as well as failures
        in the code.
      </p>
      <p>
        It works the other way too. Not every red result means the data is
        bad. A source may have changed for good reason. A test may encode the
        wrong population. A warning may be a temporary condition the team has
        agreed to accept. The result gives you evidence and asks for a
        decision. It doesn&apos;t make the decision for you.
      </p>

      <h2>The model owner decides how to respond to a failure</h2>
      <p>
        A model&apos;s owner works out what a failure means for the people who
        use the data. They warn the affected consumers and decide what kind of
        response fits. That might be a data
        correction, a code change, a revised test, or an agreed period of
        stale data. So analysts take part in observability for the models and
        products whose meaning they own. Engineering helps when the cause lies
        in ingestion, orchestration, permissions or the platform itself.
      </p>
      <p>
        In the example, recovery needs three things. The person model and its
        tests pass, the skipped dashboard table refreshes, and the expected
        source period is present. Merging the code fix doesn&apos;t give you
        any of those on its own.
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
              "Read the selection. Recovery needs evidence for the affected model, its tests and its consumers, plus data as fresh as consumers need.",
          },
          {
            prompt:
              "A daily table builds today using yesterday's late-arriving source file. Which statement is justified?",
            options: [
              "Today's source data has all arrived",
              "Every consumer is current",
              "The build succeeded, but freshness needs a separate check",
              "The model must have failed its uniqueness test",
            ],
            answer: 2,
            explain:
              "When dbt ran and what period the source covers are different things. Successful SQL and passing structural tests don't show that the expected delivery arrived.",
          },
        ]}
      />
    </LessonShell>
  );
}
