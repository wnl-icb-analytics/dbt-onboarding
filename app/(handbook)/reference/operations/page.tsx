import type { Metadata } from "next";
import Link from "next/link";
import { ReferenceShell } from "@/components/ReferenceShell";
export const metadata: Metadata = { title: "Production reference" };
export default function Page() {
  return (
    <ReferenceShell
      title="Production reference"
      lede="Workflow names, schedules and investigation records. The learning chapters explain how to interpret them."
    >
      <p>
        Workflow details checked against dbt-analytics commit{" "}
        <a href="https://github.com/wnl-icb-analytics/dbt-analytics/tree/18534e65301c26d8dca5b735854861d0c4837a4f/.github/workflows">
          {" "}
          18534e6
        </a>{" "}
        on 4 September 2026. The repository workflow files remain the source for
        later changes.
      </p>
      <p>
        Read{" "}
        <Link href="/learn/merge-to-production">From merge to production</Link>{" "}
        for the delivery sequence and{" "}
        <Link href="/learn/observing-production">Observing production</Link> for
        a worked investigation.
      </p>
      <h2>Workflows</h2>
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
            <td>Every PR commit and the merge queue</td>
            <td>
              Compiles against DEV metadata on a PR and PROD metadata before
              merge
            </td>
          </tr>
          <tr>
            <td>
              <code>dbt-pr-validation.yml</code>
            </td>
            <td>The merge queue, or manual dispatch</td>
            <td>
              Builds the exact merge candidate&apos;s{" "}
              <code>state:modified</code> nodes in the <code>DEV__</code>{" "}
              databases
            </td>
          </tr>
          <tr>
            <td>
              <code>dbt-deploy.yml</code>
            </td>
            <td>
              A relevant change is pushed to <code>main</code>
            </td>
            <td>Builds changed nodes and their descendants in production</td>
          </tr>
          <tr>
            <td>
              <code>dbt-scheduled.yml</code>
            </td>
            <td>Daily, weekly, monthly and intraday schedules</td>
            <td>
              Refreshes production models, snapshots and the intraday SDL
              lineage
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Production jobs share the <code>dbt-prod</code> concurrency queue.
        Merge-queue validation has a separate serial queue because candidates
        write to shared DEV relations.
      </p>
      <h2>Scheduled selections</h2>
      <p>
        Times are UTC. The corresponding UK local time is one hour later during
        British Summer Time.
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
            <td>04:00, Sunday and Tuesday to Saturday</td>
            <td>
              <code>
                build --select +tag:daily source:olids+ resource_type:snapshot+
                tag:indicator_definitions+
              </code>
            </td>
          </tr>
          <tr>
            <td>Weekly</td>
            <td>04:00 Monday, skipped on the first of the month</td>
            <td>
              <code>build --select +staging+ tag:indicator_definitions+</code>
            </td>
          </tr>
          <tr>
            <td>Monthly</td>
            <td>04:00 on the first</td>
            <td>
              <code>
                build --select +staging+ tag:indicator_definitions+
                --full-refresh
              </code>
            </td>
          </tr>
          <tr>
            <td>SDL intraday</td>
            <td>07:00 and 12:00 daily</td>
            <td>
              SDL refresh, then <code>build --select source:sdl_wnl+</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Snapshots are included in the daily build and ordered before their
        consumers. A snapshots-only run is available by manual dispatch. The
        first-of-month run replaces the weekly run when they coincide; the daily
        cron is separately defined.
      </p>
      <h2>Validation and deployment state</h2>
      <p>
        Validation builds <code>state:modified</code> nodes using the
        development target. With a deployed manifest,{" "}
        <code>--defer --state state --favor-state</code> resolves unselected
        parents to their recorded production relations. Without a manifest,
        validation falls back to directly changed nodes.
      </p>
      <p>
        Deployment selects <code>state:modified+</code>. Manual dispatch or an
        absent state manifest triggers a full production build. A manifest is
        the structured record of project resources and configuration used for
        this comparison.
      </p>
      <p>
        Once compilation succeeds and the build step runs, the deployment can
        publish a new baseline even if execution fails. A compilation failure,
        or a failure before building, preserves the previous baseline and stores
        available attempt artefacts. This behaviour is defined in the{" "}
        <a href="https://github.com/wnl-icb-analytics/dbt-analytics/blob/18534e65301c26d8dca5b735854861d0c4837a4f/.github/actions/publish-dbt-artifacts/action.yml">
          {" "}
          artefact publishing action
        </a>
        . Scheduled runs do not advance deployment state.
      </p>
      <p>
        The deployment workflow recognises <code>[skip deploy]</code> and{" "}
        <code> [skip-deploy]</code> markers. These are exceptional controls:
        skipped deployment can leave main ahead of the warehouse. The next state
        comparison still depends on the recorded deployment baseline.
      </p>
      <h2>Observability records</h2>
      <p>
        The Streamlit observability app reads from{" "}
        <code> DATA_LAKE__NCL.DBT_OBSERVABILITY</code>. Its implementation is in
        the{" "}
        <a href="https://github.com/wnl-icb-analytics/snowflake-dbt-observability-streamlit">
          {" "}
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
              Which assertions passed, warned or failed, and is the problem
              recurring?
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
            <td>How have materialised table row counts changed over time?</td>
          </tr>
        </tbody>
      </table>
      <h2>App pages</h2>
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
            <td>
              Current project health, the latest build and recent invocations
            </td>
          </tr>
          <tr>
            <td>Alerts</td>
            <td>
              Active and historical model or test failures, failure streaks and
              resolution time
            </td>
          </tr>
          <tr>
            <td>Models</td>
            <td>
              Models by project path, slow models and individual run histories
            </td>
          </tr>
          <tr>
            <td>Tests</td>
            <td>
              Test history, flaky tests and models for which no tests are
              recorded
            </td>
          </tr>
          <tr>
            <td>Runs</td>
            <td>
              Invocation selection, results, duration, skipped nodes and
              execution timeline
            </td>
          </tr>
          <tr>
            <td>Growth</td>
            <td>
              Unexpected growth or shrinkage in materialised table row counts
            </td>
          </tr>
          <tr>
            <td>Performance</td>
            <td>
              Total and average execution time, including the models consuming
              most build time
            </td>
          </tr>
        </tbody>
      </table>
    </ReferenceShell>
  );
}
