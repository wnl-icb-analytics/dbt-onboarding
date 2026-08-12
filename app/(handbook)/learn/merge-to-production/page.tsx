import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "From merge to production" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="merge-to-production"
      kicker="Learn 11"
      title="From merge to production"
      lede="Four GitHub Actions workflows compile every relevant pull request, conditionally validate changed models in Snowflake, deploy merged changes and rebuild production on schedule. This is what they run and what a model author needs to look after."
      minutes={11}
    >
      <h2>Four workflows operate the project</h2>
      <p>
        The production lifecycle is defined in <code>.github/workflows/</code>.
        The workflow files are committed with the dbt project, so changes to the
        way models are checked or deployed go through the same Git review as model
        changes.
      </p>
      <table>
        <thead>
          <tr>
            <th>Workflow</th>
            <th>When it runs</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>dbt-compile.yml</code></td>
            <td>Every relevant PR commit and the merge queue</td>
            <td>Compiles against DEV metadata on a PR and PROD metadata before merge</td>
          </tr>
          <tr>
            <td><code>dbt-pr-validation.yml</code></td>
            <td>
              Conditionally: when review is requested, the Snowflake CI label is
              added, or it is run manually
            </td>
            <td>
              Builds the PR&apos;s changed nodes in the <code>DEV__</code>{" "}
              databases; it does not run for every PR update
            </td>
          </tr>
          <tr>
            <td><code>dbt-deploy.yml</code></td>
            <td>A relevant change is pushed to <code>main</code></td>
            <td>Builds changed nodes and their descendants in production</td>
          </tr>
          <tr>
            <td><code>dbt-scheduled.yml</code></td>
            <td>Daily, weekly, monthly and intraday schedules</td>
            <td>Refreshes production models, snapshots and the intraday SDL lineage</td>
          </tr>
        </tbody>
      </table>
      <p>
        These workflows run dbt Fusion directly on GitHub-hosted runners and connect
        to Snowflake with the project&apos;s service credentials. Their production
        jobs share one <code>dbt-prod</code>{" "}concurrency queue, so a deploy and
        a scheduled build cannot write to production at the same time.
      </p>

      <h2>Development builds go to the DEV__ databases</h2>
      <p>
        The project&apos;s <code>profiles.yml</code>{" "}defines development,
        production and compile-only targets. When you run{" "}
        <code>dbt build</code>{" "}with the normal development target, the project
        naming macros route relations to mirror databases such as{" "}
        <code>DEV__STAGING</code>, <code>DEV__MODELLING</code>{" "}and{" "}
        <code>DEV__REPORTING</code>. The data lake is the one exception — it has
        no mirror, so development reads real source data in place while writing
        only to the <code>DEV__</code>{" "}databases. Production workflows use the{" "}
        <code>prod</code>{" "}target and build the supported production relations.
      </p>
      <p>
        This routing is what keeps normal local and PR builds away from the tables
        consumers use. Snowflake roles and grants remain the underlying permission
        boundary — targets choose destinations; grants decide permissions. In normal
        work, use the development target locally and let the workflows perform
        production builds.
      </p>

      <h2>Every PR commit passes the compile gate</h2>
      <p>
        <code>dbt-compile.yml</code>{" "}runs when a relevant pull request is
        opened, reopened or updated. It executes{" "}
        <code>dbt compile --target ci-dev</code>. This is read-only: it renders the
        project, reads Snowflake catalogue metadata and analyses the compiled SQL
        without materialising models.
      </p>
      <p>
        Fusion includes a SQL engine rather than treating the model body as an
        opaque string. The compile gate can therefore reject invalid SQL as well as
        broken <code>ref()</code>{" "}and <code>source()</code>{" "}calls or
        invalid YAML and Jinja. Where the target catalogue contains the required
        metadata, it can also identify unresolved columns and incompatible types.
        When GitHub creates a merge-queue run, the same workflow compiles with{" "}
        <code>ci-prod</code>{" "}so the final queued change is analysed against
        production metadata before it reaches <code>main</code>.
      </p>
      <p>
        What compile does not establish is how the query behaves when Snowflake
        executes it against real data. It does not materialise the relation, count
        its rows or run its data tests. The conditional validation workflow performs
        that Snowflake build and exercises the model&apos;s data contracts.
      </p>

      <h2>Snowflake PR validation is conditional</h2>
      <p>
        Unlike the compile gate, full Snowflake validation does not run
        automatically for every pull-request update. It runs only when review is
        requested, when the{" "}
        <code>❄️snowflake-ci</code>{" "}label is added, or when somebody dispatches
        the workflow manually. A new trigger rebuilds the PR&apos;s complete changed
        set relative to <code>main</code>; a newer run for the same PR cancels the
        older one.
      </p>
      <p>
        The workflow collects changed model SQL, the SQL models associated with
        changed YAML, seeds and snapshots, and models that use a changed macro. For
        an ordinary change it builds those selected nodes with the development
        target. If more than 100 nodes are selected, it switches to a full
        development build.
      </p>
      <p>
        When a deployed manifest is available, validation adds{" "}
        <code>--defer --state state --favor-state</code>. Unselected parents then
        resolve to the production relations recorded in that manifest instead of
        relying on a complete or fresh DEV mirror. The changed nodes still write
        only to the <code>DEV__</code>{" "}databases.
      </p>
      <p>
        A green validation means the selected nodes built and their tests passed
        with the inputs used by that run. Review still has to establish that the
        definition, grain and change are the right ones. The{" "}
        <Link href="/learn/git-and-prs">Git and pull requests</Link>{" "}lesson
        explains how those forms of evidence come together before merge.
      </p>

      <h2>A merge deploys the changed graph</h2>
      <p>
        A push to <code>main</code>{" "}that changes models, macros, seeds,
        snapshots, packages or project configuration starts{" "}
        <code>dbt-deploy.yml</code>. The workflow fetches the state manifest
        published by the previous deploy and runs:
      </p>
      <p>
        <code>dbt build --target prod --select state:modified+ --state state</code>
      </p>
      <p>
        <code>state:modified</code>{" "}selects nodes whose compiled definition has
        changed. The trailing <code>+</code>{" "}also selects every descendant. A
        change to <code>int_wl_current</code>, for example, deploys that model and
        the waiting-list facts, provider summaries and published products that
        depend on it. If no state manifest exists, or the workflow is started
        manually, it performs a full production build.
      </p>
      <p>
        The project publishes the deploy&apos;s manifest and run results after
        every non-cancelled attempt, including a failed attempt. This is a
        deliberate project behaviour: a failed node is attributed to the deploy
        that introduced it and is not retried by a later unrelated merge. A fix
        changes the node again, making it <code>state:modified</code>{" "}for the
        fixing deploy. Scheduled runs can retry transient failures on lineages they
        cover.
      </p>
      <p>
        Merge commits can contain <code>[skip deploy]</code>{" "}or{" "}
        <code>[skip-deploy]</code>, but that is an exceptional control rather than
        the normal route. Skipping means the code on <code>main</code>{" "}and the
        last deployed state intentionally differ; use it only when the change
        should genuinely not build models.
      </p>

      <h2>Five schedules keep production current</h2>
      <p>
        Deployment applies changed code. <code>dbt-scheduled.yml</code>{" "}then
        rebuilds the relevant parts of that code as new source data arrives. The
        current schedules are expressed in UTC:
      </p>
      <table>
        <thead>
          <tr>
            <th>Run</th>
            <th>Schedule</th>
            <th>dbt selection</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Daily</td>
            <td>04:00 UTC, Sunday and Tuesday–Saturday</td>
            <td><code>build --select +tag:daily</code></td>
          </tr>
          <tr>
            <td>Weekly</td>
            <td>04:00 UTC Monday, except the first of the month</td>
            <td><code>build --select +staging+</code></td>
          </tr>
          <tr>
            <td>Monthly full refresh</td>
            <td>04:00 UTC on the first</td>
            <td><code>build --select +staging+ --full-refresh</code></td>
          </tr>
          <tr>
            <td>Snapshots</td>
            <td>05:00 UTC every day</td>
            <td><code>snapshot</code></td>
          </tr>
          <tr>
            <td>SDL intraday</td>
            <td>07:00 and 12:00 UTC every day</td>
            <td>Refresh SDL, then <code>build --select source:sdl_wnl+</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        A model tagged <code>daily</code>{" "}is selected by the daily build; the
        leading <code>+</code>{" "}also brings in the ancestors it needs. The weekly
        selection rebuilds from staging upwards, and the first-of-month run replaces
        that week&apos;s normal run with a full refresh. Scheduled runs do not
        publish the deployment state manifest: that manifest records what was
        deployed from <code>main</code>, not which relations happened to refresh
        most recently.
      </p>

      <h2>Failures become GitHub issues</h2>
      <p>
        Deploy and scheduled workflows pass their run results to{" "}
        <code>report_dbt_failures.py</code>. A failed scheduled run creates or
        updates one GitHub issue for that run type and names the failed nodes.
        Repeated failures add comments to the same issue; a later successful run
        closes it. The GitHub–Teams subscription carries issues labelled{" "}
        <code>dbt-run-failure</code>{" "}into the team channel. SDL intraday is
        currently excluded from this issue flow.
      </p>
      <p>
        dbt skips descendants of a failed model or test, so those downstream
        relations normally retain their previous versions. The failed relation
        itself still needs inspection. In particular, a model can finish building
        and then fail a data test, leaving its new relation in place while its dbt
        descendants are skipped. A red run contains the failure; it does not roll
        the entire graph back.
      </p>
      <p>
        The issue identifies what failed and links to the Actions run. Start with
        the first failed node rather than the skipped descendants, read its log and
        run result, reproduce the problem in development where possible, and send
        the correction through the normal branch and pull-request process. Deploy
        failures remain attached to the change that caused them until the tracked
        nodes build successfully again or leave the project.
      </p>

      <h2>What a model author is responsible for</h2>
      <p>
        The workflows remove manual deployment and scheduling, but the repository
        still needs enough information to operate a model correctly. Before merge,
        make sure the model:
      </p>
      <ul>
        <li>uses <code>ref()</code>{" "}and <code>source()</code>{" "}so its place in the deploy graph is visible;</li>
        <li>has tests that protect its grain and important business rules;</li>
        <li>has the correct tags for the cadence its consumers require;</li>
        <li>builds in development and has passed the appropriate PR validation;</li>
        <li>documents any unusual operational dependency or recovery step.</li>
      </ul>
      <p>
        After merge, check the deploy when the change is time-sensitive or
        high-impact. If the model later appears in a failure issue, its SQL,
        description, tests, lineage and run artifacts should give the responding
        analyst enough context to act without reconstructing the original piece of
        work.
      </p>
      <p>
        Deployment answers whether the change built. Ongoing health is a separate
        responsibility: <Link href="/learn/observing-production">Observing production</Link>
        {" "}explains how the Elementary-backed app connects later runs, failures,
        performance and downstream impact.
      </p>

      <Quiz
        title="Check the workflows"
        questions={[
          {
            prompt:
              "Which check runs automatically on every relevant pull-request update?",
            options: [
              "A full production build",
              "The compile gate against DEV metadata",
              "The monthly full refresh",
              "The Snowflake validation workflow only",
            ],
            answer: 1,
            explain:
              "dbt-compile.yml runs on relevant PR commits. Snowflake validation is triggered when review is requested, the Snowflake CI label is added, or the workflow is dispatched manually.",
          },
          {
            prompt:
              "A change to int_wl_current merges. Why are its downstream facts selected for deployment?",
            options: [
              "Their names begin with fct_",
              "The deploy always rebuilds the entire project",
              "The state:modified+ selector includes changed nodes and their descendants in the DAG",
              "A developer lists them manually in the workflow",
            ],
            answer: 2,
            explain:
              "The trailing plus follows ref() dependencies downstream, so consumers of the changed definition are rebuilt without maintaining a separate deployment list.",
          },
          {
            prompt:
              "A model builds but its data test fails during a scheduled run. What happens?",
            options: [
              "The entire warehouse is rolled back",
              "The model's new relation may exist; dbt skips its descendants and the failure is reported",
              "Every downstream model builds anyway",
              "The failed model is deleted",
            ],
            answer: 1,
            explain:
              "Tests can fail after materialisation. dbt contains the failure by skipping descendants, while the failed relation and its direct consumers need investigation.",
          },
        ]}
      />
    </LessonShell>
  );
}
