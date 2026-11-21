import type { Metadata } from "next";
import Link from "next/link";
import { ReferenceShell } from "@/components/ReferenceShell";
export const metadata: Metadata = { title: "Production reference" };
export default function Page() {
  return (
    <ReferenceShell
      title="Production reference"
      lede="This page lists the project's workflows, their schedules and the records you use to investigate a run. The guide chapters explain how to read them."
    >
      <p>
        <Link href="/learn/merge-to-production">From merge to production</Link>{" "}
        walks through the delivery sequence.{" "}
        <Link href="/learn/observing-production">Observing production</Link>{" "}
        works through an investigation.
      </p>
      <p>
        We checked these details against dbt-analytics commit{" "}
        <a href="https://github.com/wnl-icb-analytics/dbt-analytics/tree/f32bda79d5d5a3d698a72e81b57465f2fc13c44d/.github/workflows">
          f32bda7
        </a>{" "}
        on 20 November 2026. If the repository has changed since, its workflow
        files win.
      </p>
      <h2>Workflows that build the project</h2>
      <p>
        These four workflows compile or build the project for pull requests,
        the merge queue and production. Others handle PR checks, docs and
        housekeeping.
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
            <td>
              <code>dbt-compile.yml</code>
            </td>
            <td>Every PR commit and every merge-queue candidate</td>
            <td>
              Compiles the project. A PR compiles against DEV metadata, a merge
              candidate against PROD metadata.
            </td>
          </tr>
          <tr>
            <td>
              <code>dbt-pr-validation.yml</code>
            </td>
            <td>
              The merge queue, the <code>❄️snowflake-ci</code> label, or manual
              dispatch
            </td>
            <td>
              Builds the candidate&apos;s <code>state:modified</code> nodes in
              the <code>DEV__</code> databases, plus any unchanged nodes that sit
              between two modified ones
            </td>
          </tr>
          <tr>
            <td>
              <code>dbt-deploy.yml</code>
            </td>
            <td>
              A push to <code>main</code> that touches models, macros, seeds,
              snapshots or project config
            </td>
            <td>
              Builds changed nodes and everything downstream of them in
              production
            </td>
          </tr>
          <tr>
            <td>
              <code>dbt-scheduled.yml</code>
            </td>
            <td>Dispatched on a timetable by Snowflake tasks</td>
            <td>
              Runs the daily, weekly, monthly and intraday production builds
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Production jobs wait in one queue, <code>dbt-prod</code>, so two never
        build at once. Merge-queue validation has its own queue and runs one
        candidate at a time, because every candidate writes to the same DEV
        relations.
      </p>
      <p>
        The <code>❄️snowflake-ci</code> label runs that DEV build once for your
        PR merged with current <code>main</code>, then removes itself. It
        reports as a separate check that can&apos;t block the merge. Later
        commits don&apos;t rebuild, so add the label again if you need a fresh
        result.
      </p>
      <h2>Scheduled selections</h2>
      <p>
        Snowflake tasks start the scheduled runs. The table gives each
        run&apos;s UK start time and the models it selects. The daily build
        waits until 06:00 so it reads a fresh OLIDS build from dbt-olids, which
        starts at 04:00. The team moved scheduling to Snowflake because
        GitHub&apos;s own cron started runs hours late or skipped them.
      </p>
      <table>
        <thead>
          <tr>
            <th>Run</th>
            <th>Time</th>
            <th>Selection</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Daily</td>
            <td>06:00, Sunday and Tuesday to Saturday</td>
            <td>
              <code>
                build --select +tag:daily source:olids+ resource_type:snapshot+
                tag:indicator_definitions+ --indirect-selection cautious
                --exclude tag:monthly-full
              </code>
            </td>
          </tr>
          <tr>
            <td>Weekly</td>
            <td>06:00 Monday, skipped on the first of the month</td>
            <td>
              <code>
                build --select +staging+ tag:indicator_definitions+ --exclude
                tag:monthly-full
              </code>
            </td>
          </tr>
          <tr>
            <td>Monthly</td>
            <td>06:00 on the first</td>
            <td>
              <code>
                build --select +staging+ tag:indicator_definitions+
                --full-refresh
              </code>
            </td>
          </tr>
          <tr>
            <td>SDL intraday</td>
            <td>09:00 and 13:00 daily</td>
            <td>
              SDL refresh procedures, then{" "}
              <code>
                build --select source:sdl_wnl+ stg_reference_pod_group_mapping
              </code>
            </td>
          </tr>
          <tr>
            <td>DEV monthly</td>
            <td>20:17 on the first</td>
            <td>
              <code>build --full-refresh --target dev</code>, from the latest{" "}
              <code>main</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Snapshots run inside the daily build, so dbt orders each one before the
        models that read it. You can also dispatch a snapshots-only run by hand.
        On the first of the month the monthly run replaces the weekly one. The
        daily run keeps its own schedule, so both can run that morning.
      </p>
      <p>
        The daily build uses cautious indirect selection. A test runs only when
        every model it reads is in the selection. That stops a test comparing a
        daily staging view with a weekly table from failing on the days between
        weekly builds. Those cross-cadence tests run in the weekly build, where{" "}
        <code>+staging+</code> selects both sides.
      </p>
      <h2>Validation and deployment state</h2>
      <p>
        A manifest is dbt&apos;s structured record of the project&apos;s
        resources and configuration. Each production deployment publishes one.
        Validation and deployment both compare your change with that record to
        decide what to build.
      </p>
      <p>
        Validation builds <code>state:modified</code> nodes on the development
        target. It passes <code>--defer --favor-state</code> with the deployed
        manifest, so any parent you didn&apos;t select resolves to its
        production relation. Without a manifest, it maps changed files to nodes
        instead. A changed model SQL file selects that model. A changed model
        YAML file selects the model of the same name and the YAML&apos;s own
        tests. A changed macro selects models whose SQL calls it as{" "}
        <code>{"{{ macro_name("}</code>, matched on the macro&apos;s file name.
        Changed seeds count too. Nothing further downstream is built.
      </p>
      <p>
        Deployment selects <code>state:modified+</code> and{" "}
        <code>tag:indicator_definitions+</code>. The indicator definitions are
        built from model metadata and have no <code>ref()</code> parents, so a
        state comparison can miss changes to their YAML. Manual dispatch, or a
        missing manifest, triggers a full production build. Neither validation
        nor a state-based deploy runs tests tagged{" "}
        <code>reconciliation</code>, because a partial build mixes fresh and
        stale relations. Scheduled and full builds run them.
      </p>
      <p>
        If a PR carries the <code>🔄full-refresh</code> label, validation and
        deployment add <code>--full-refresh</code>. Validation rebuilds the
        modified models from scratch, and deployment rebuilds everything
        downstream of them too. Models configured with{" "}
        <code>full_refresh=false</code> keep their history.
      </p>
      <p>
        A deployment publishes a new baseline once compilation succeeds and the
        build step starts, even if the build then fails. That stops later,
        unrelated deploys from retrying the failed nodes. If compilation fails,
        or the run stops before building, the previous baseline stays and the
        attempt&apos;s artefacts are stored separately. The{" "}
        <a href="https://github.com/wnl-icb-analytics/dbt-analytics/blob/f32bda79d5d5a3d698a72e81b57465f2fc13c44d/.github/actions/publish-dbt-artifacts/action.yml">
          artefact publishing action
        </a>{" "}
        defines this. Scheduled runs never advance deployment state.
      </p>
      <p>
        The deployment workflow skips a push when a pushed commit message, or
        the title of its PR, contains <code>[skip deploy]</code> or{" "}
        <code>[skip-deploy]</code>. Treat these as exceptional. A skipped
        deployment can leave <code>main</code> ahead of the warehouse, and the
        next state comparison still starts from the last recorded baseline.
      </p>
      <h2>Observability records</h2>
      <p>
        The Streamlit observability app reads Elementary&apos;s tables in{" "}
        <code>DATA_LAKE__NCL.DBT_OBSERVABILITY</code>. Its Sources page also
        reads feed freshness from <code>DATA_LAKE.META</code>. The code lives in
        the{" "}
        <a href="https://github.com/wnl-icb-analytics/snowflake-dbt-observability-streamlit">
          observability repository
        </a>
        .
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
            <td>
              <code>dbt_invocations</code>
            </td>
            <td>
              Which command, target, warehouse and selection ran, and when?
            </td>
          </tr>
          <tr>
            <td>
              <code>dbt_run_results</code>
            </td>
            <td>
              Which models succeeded, failed or were skipped, and how long did
              they take?
            </td>
          </tr>
          <tr>
            <td>
              <code>elementary_test_results</code>
            </td>
            <td>
              Which tests passed, warned or failed, and does the problem keep
              coming back?
            </td>
          </tr>
          <tr>
            <td>
              <code>dbt_models</code> and <code>dbt_tests</code>
            </td>
            <td>
              Which project resource, path, SQL and relationship does a result
              describe?
            </td>
          </tr>
          <tr>
            <td>
              <code>ROW_COUNT_LOG</code>
            </td>
            <td>How have row counts in materialised tables changed over time?</td>
          </tr>
        </tbody>
      </table>
      <h2>App pages</h2>
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Use it to see</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Home</td>
            <td>
              What is failing, warning, stale or skipped now, then the latest
              build and recent runs
            </td>
          </tr>
          <tr>
            <td>Alerts</td>
            <td>
              Past model and test failures, failure streaks and how long they
              took to resolve
            </td>
          </tr>
          <tr>
            <td>Sources</td>
            <td>
              Whether a stale model is down to dbt or to its source feed
            </td>
          </tr>
          <tr>
            <td>Jobs</td>
            <td>
              Runs grouped by GitHub Actions job, with late starts and missing
              scheduled runs
            </td>
          </tr>
          <tr>
            <td>Runs</td>
            <td>
              Each invocation&apos;s selection, results, duration, skipped nodes
              and timeline
            </td>
          </tr>
          <tr>
            <td>Models</td>
            <td>
              Models by project path, slow models and each model&apos;s run
              history
            </td>
          </tr>
          <tr>
            <td>Tests</td>
            <td>Pass rates, flaky tests and models with no tests</td>
          </tr>
          <tr>
            <td>Growth</td>
            <td>Unexpected growth or shrinkage in table row counts</td>
          </tr>
          <tr>
            <td>Performance</td>
            <td>
              Slowdowns, model runtimes and which models take the most build
              time
            </td>
          </tr>
        </tbody>
      </table>
    </ReferenceShell>
  );
}
