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
      kicker="Learn 13"
      title="From merge to production"
      lede="Follow one reviewed change into the warehouse, then see how the same code runs again when new source data arrives."
      minutes={15}
    >
      <h2>Release small, useful changes often</h2>
      <p>
        We aim to deliver a useful change, check its effect and learn what to do
        next. A correction to one measure need not wait for an entire dashboard
        redesign. When the correction is complete, reviewed and validated, it
        can go through the release process on its own.
      </p>
      <p>
        This is the practical purpose of agile development here. Work with the
        people who need the analysis, agree a manageable next outcome and use
        what you learn to shape the following one. Requirements often become
        clearer when someone can inspect real columns, definitions and results.
        Frequent feedback lets us resolve a misunderstanding before it spreads
        through several models and products.
      </p>
      <p>
        A small release still needs a complete, defensible definition. An
        exploratory result with unresolved population rules should stay in
        development and discussion. Speed comes from reducing how much changes
        at once and how long feedback takes. The review and validation still
        need to establish that the proposed result is fit for its intended use.
      </p>

      <h3>Split the outcome into independently useful steps</h3>
      <p>
        Suppose a service wants a new appointments dashboard. Keeping every
        source change, measure and visualisation on one branch means the team
        sees the complete proposal late. A problem with the population then
        forces revisions across work that already assumes it is correct. A
        possible sequence is:
      </p>
      <table>
        <thead>
          <tr>
            <th>Change</th>
            <th>Evidence before release</th>
            <th>What becomes possible</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Add a missing appointment staging model, with its description and
              tests.
            </td>
            <td>
              Check source fields, row preservation and agreed type conversions.
            </td>
            <td>Other work can use a documented source representation.</td>
          </tr>
          <tr>
            <td>Add a shared attended-appointment measure.</td>
            <td>
              Agree its grain, status rules and time window; reconcile its
              output with the source.
            </td>
            <td>Analysts can inspect and reuse a defined measure.</td>
          </tr>
          <tr>
            <td>Add the dashboard&apos;s published summary.</td>
            <td>
              Check grouping, totals and the service&apos;s interpretation
              against the agreed measure.
            </td>
            <td>
              The service can use the summary and give feedback on the next
              requirement.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Each step includes the SQL, tests and documentation that make it usable.
        Later work begins from the accepted earlier change. This is an example,
        not a rule to create one PR per layer. Reuse existing models when they
        already answer the question. If a producer and its consumer must change
        together to remain compatible, release that coherent change together.
      </p>
      <p>
        A breaking change needs a transition. For example, adding a replacement
        column while retaining the old one can let consumers migrate before a
        later removal. Agree the meaning and migration with those consumers;
        renaming a column in a small PR still breaks a query that expects the
        old name. Small releases reduce the number of changes to reason about,
        but their effect can still reach many users.
      </p>

      <h3>Use each release to test an expectation</h3>
      <p>
        Before changing an age boundary, state which records should move and
        which should remain unchanged. After the focused build, compare those
        groups against the same inputs and reference date. If the result differs
        from the expectation, there are fewer changed rules to investigate.
        Combining that correction with a new join and a different reporting
        period would make the cause much harder to identify.
      </p>
      <p>
        Carry that evidence through review, then check the deployment and the
        affected result. Feedback may confirm the change or reveal a further
        requirement. Record that next piece of work separately when it can be
        delivered independently. Frequent releases mean repeating this cycle
        whenever a useful change is ready, rather than aiming for a fixed number
        of releases or accumulating unrelated work for a large launch.
      </p>
      <p>
        The cycle is: agree an outcome, implement it on a branch, validate,
        review, merge, deploy, inspect the result and decide the next change. A
        merge is the hand-off to deployment. It is not evidence that the
        warehouse now contains the intended result. The stages below explain
        what happens between that decision and the data people use.
      </p>

      <h2>Follow one change into production</h2>
      <p>
        Suppose a reviewed change corrects a waiting-list count. The SQL and its
        tests have changed in Git, but production still contains the earlier
        result. A workflow is an automated job defined in the repository. GitHub
        Actions runs these jobs on a runner, a machine that checks out the
        project and executes its commands.
      </p>
      <table>
        <thead>
          <tr>
            <th>Stage</th>
            <th>Question answered</th>
            <th>Warehouse effect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>PR compilation</td>
            <td>Can the project be rendered and analysed?</td>
            <td>No models are materialised.</td>
          </tr>
          <tr>
            <td>Merge-queue validation</td>
            <td>
              Do selected changes build and pass tests in the candidate to be
              merged?
            </td>
            <td>Changed models build in DEV.</td>
          </tr>
          <tr>
            <td>Deployment</td>
            <td>
              Did the changed production models and selected consumers build?
            </td>
            <td>Production objects are created or refreshed.</td>
          </tr>
          <tr>
            <td>Scheduled refresh</td>
            <td>
              Does the relevant production selection build on later inputs?
            </td>
            <td>The same code processes new source data.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Those are separate results. An approved PR can still fail during
        deployment, and a successful deployment says nothing about a source
        delivery that has not arrived yet.
      </p>

      <h2>Development builds go to the DEV__ databases</h2>
      <p>
        The project&apos;s <code>profiles.yml</code> defines development,
        production and compile-only targets. When you run <code>dbt build</code>{" "}
        with the normal development target, the project naming macros route
        relations to mirror databases such as <code>DEV__STAGING</code>,{" "}
        <code>DEV__MODELLING</code> and <code>DEV__REPORTING</code>. The data
        lake has no mirror, so development reads real source data in place while
        writing only to the <code>DEV__</code> databases. Production workflows
        use the <code>prod</code> target and build the supported production
        relations.
      </p>
      <p>
        This routing is what keeps normal local and PR builds away from the
        tables consumers use. Snowflake roles and grants remain the underlying
        permission boundary. Targets choose destinations; grants decide
        permissions. In normal work, use the development target locally and let
        the workflows perform production builds.
      </p>

      <h2>Every PR commit passes the compile gate</h2>
      <p>
        <code>dbt-compile.yml</code> runs when a relevant pull request is
        opened, reopened or updated. It executes{" "}
        <code>dbt compile --target ci-dev</code>. This is read-only: it renders
        the project, reads Snowflake catalogue metadata and analyses the
        compiled SQL without materialising models.
      </p>
      <p>
        Fusion includes a SQL engine rather than treating the model body as an
        opaque string. The compile gate can therefore reject invalid SQL as well
        as broken <code>ref()</code> and <code>source()</code> calls or invalid
        YAML and Jinja. Where the target catalogue contains the required
        metadata, it can also identify unresolved columns and incompatible
        types. When GitHub creates a merge-queue run, the same workflow compiles
        with <code>ci-prod</code> so the final queued change is analysed against
        production metadata before it reaches <code>main</code>.
      </p>
      <p>
        What compile does not establish is how the query behaves when Snowflake
        executes it against real data. It does not materialise the relation,
        count its rows or run its data tests. The merge-queue validation
        workflow performs that Snowflake build and exercises the model&apos;s
        data contracts.
      </p>

      <h2>Snowflake validation runs in the merge queue</h2>
      <p>
        Pull-request events report that runtime validation is deferred. Once
        Merge when ready is selected, GitHub places the change in its merge
        queue and creates the candidate it would merge into <code>main</code>,
        including the relevant earlier queued changes. The validation workflow
        runs against that merge-group commit. It can also be dispatched
        manually.
      </p>
      <p>
        A manifest records the project resources and configuration from a run.
        The workflow compiles against production metadata, fetches the recorded
        deployment manifest and builds <code>state:modified</code> nodes with
        the development target. If no manifest exists, it falls back to the dbt
        nodes changed by the candidate rather than silently running a full
        build.
      </p>
      <p>
        When a deployed manifest is available, validation adds{" "}
        <code>--defer --state state --favor-state</code>. Unselected parents
        then resolve to the production relations recorded in that manifest
        instead of relying on a complete or fresh DEV mirror. The changed nodes
        still write only to the <code>DEV__</code> databases.
      </p>
      <p>
        A green validation means the selected nodes built and their tests passed
        with the inputs used by that run. Review still has to establish that the
        definition, grain and change are the right ones. The{" "}
        <Link href="/learn/git-and-prs">Git and pull requests</Link> lesson
        explains how those forms of evidence come together before merge.
      </p>

      <h2>A merge deploys the changed graph</h2>
      <p>
        A push to <code>main</code> that changes models, macros, seeds,
        snapshots, packages or project configuration starts{" "}
        <code>dbt-deploy.yml</code>. The workflow fetches the state manifest
        published by the previous deploy and runs:
      </p>
      <p>
        <code>
          dbt build --target prod --select state:modified+ --state state
        </code>
      </p>
      <p>
        <code>state:modified</code> selects nodes whose compiled definition has
        changed. The trailing <code>+</code> also selects every descendant. A
        change to <code>int_wl_current</code>, for example, deploys that model
        and the waiting-list facts, provider summaries and published products
        that depend on it. If no state manifest exists, or the workflow is
        started manually, it performs a full production build.
      </p>
      <p>
        The state comparison uses a recorded deployment baseline. Failed runs
        need explicit investigation; an unrelated later merge does not
        necessarily retry their failed models. The{" "}
        <Link href="/reference/operations">production reference</Link> describes
        baseline publication and fallback behaviour.
      </p>

      <h2>Refreshing data is different from deploying code</h2>
      <p>
        After deployment, the waiting-list SQL may stay unchanged for weeks
        while providers submit newer records. Scheduled builds run the relevant
        models again so their stored outputs reflect those inputs. A table does
        not refresh merely because its source changed.
      </p>
      <p>
        The project has daily, weekly, monthly and intraday selections. Tags and
        source lineage help determine which models run. Snapshots are included
        with their consumers in the daily build. The{" "}
        <Link href="/reference/operations#scheduled-selections">
          {" "}
          schedule reference
        </Link>{" "}
        contains the exact times and selectors.
      </p>
      <p>
        Check that the selection covers the model and that its cadence meets the
        consumer&apos;s need. A daily model built successfully at 04:00 can
        still describe yesterday&apos;s source if today&apos;s delivery was
        late. Build time, source period and the user&apos;s freshness
        requirement are different things to inspect.
      </p>

      <h2>Failures become GitHub issues</h2>
      <p>
        Deploy and scheduled workflows pass their run results to{" "}
        <code>report_dbt_failures.py</code>. A failed scheduled run creates or
        updates one GitHub issue for that run type and names the failed nodes.
        Repeated failures add comments to the same issue; a later successful run
        closes it. The GitHub–Teams subscription carries issues labelled{" "}
        <code>dbt-run-failure</code> into the team channel. SDL intraday is
        currently excluded from this issue flow.
      </p>
      <p>
        dbt skips descendants of a failed model or test, so those downstream
        relations normally retain their previous versions. The failed relation
        itself still needs inspection. In particular, a model can finish
        building and then fail a data test, leaving its new relation in place
        while its dbt descendants are skipped. A red run contains the failure;
        it does not roll the entire graph back.
      </p>
      <p>
        The issue links to the run that failed. The{" "}
        <Link href="/learn/observing-production"> next chapter</Link> follows
        the investigation, including how to tell a failed model from its skipped
        descendants and how to confirm recovery.
      </p>

      <h2>What a model author is responsible for</h2>
      <p>
        The workflows remove manual deployment and scheduling, but the
        repository still needs enough information to operate a model correctly.
        Before merge, make sure the model:
      </p>
      <ul>
        <li>
          uses <code>ref()</code> for model dependencies, with{" "}
          <code>source()</code> kept in generated raw models;
        </li>
        <li>has tests that protect its grain and important business rules;</li>
        <li>has the correct tags for the cadence its consumers require;</li>
        <li>
          builds in development and has passed the appropriate PR validation;
        </li>
        <li>documents any unusual operational dependency or recovery step.</li>
      </ul>
      <p>
        After merge, check the deployment result and confirm the expected
        analytical effect. Give high-impact changes the additional comparisons
        and consumer communication agreed during review. If the model later
        appears in a failure issue, its SQL, description, tests, lineage and run
        artifacts should give the responding analyst enough context to act
        without reconstructing the original piece of work.
      </p>
      <p>
        Deployment answers whether the change built. Ongoing health is a
        separate responsibility:{" "}
        <Link href="/learn/observing-production">Observing production</Link>{" "}
        explains how the Elementary-backed app connects later runs, failures,
        performance and downstream impact.
      </p>

      <Quiz
        title="Check the workflows"
        questions={[
          {
            prompt:
              "Why release an age-boundary correction separately from an unrelated practice-join change?",
            options: [
              "A small change never needs review",
              "It lets the team check a specific expected effect and investigate differences more easily",
              "Git cannot merge changes to several files",
              "Each release must contain exactly one commit",
            ],
            answer: 1,
            explain:
              "Focused changes make cause and effect easier to check. Include the tests, documentation and any necessary consumer changes so the release is complete.",
          },
          {
            prompt:
              "A PR has merged. What completes the author's release check?",
            options: [
              "Seeing the branch disappear",
              "Waiting for an unrelated later PR to pass",
              "Checking the deployment result and confirming the intended analytical effect",
              "Assuming the scheduled refresh has already run",
            ],
            answer: 2,
            explain:
              "Merge records the accepted code. Deployment and checks of the resulting data establish whether the intended change reached consumers.",
          },
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
              "dbt-compile.yml runs on PR commits. Runtime Snowflake validation runs against the exact merge-queue candidate, or by manual dispatch.",
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
