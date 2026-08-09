import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Materialisations" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="materialisations"
      kicker="Going further 03"
      title="Materialisations"
      lede="The same SELECT can become a view, a rebuilt table, an incremental table or a Snowflake-managed dynamic table. The choice determines when computation happens, who refreshes it and how its freshness is observed."
      minutes={11}
    >
      <h2>What a materialisation is</h2>
      <p>
        Your model is a SELECT; the materialisation decides what dbt turns it into in
        Snowflake. You rarely need to choose — the project sets sensible defaults by
        layer — but knowing the options explains why builds behave the way they do.
      </p>
      <table>
        <thead>
          <tr>
            <th>Materialisation</th>
            <th>What it builds</th>
            <th>Default for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>view</code>
            </td>
            <td>A view — no data stored, query runs at read time</td>
            <td>Raw and staging layers</td>
          </tr>
          <tr>
            <td>
              <code>table</code>
            </td>
            <td>A table, rebuilt from scratch every run</td>
            <td>Modelling, reporting, published</td>
          </tr>
          <tr>
            <td>
              <code>incremental</code>
            </td>
            <td>A table that only processes new/changed rows after the first build</td>
            <td>Opt-in, for very large data</td>
          </tr>
          <tr>
            <td>
              <code>dynamic_table</code>
            </td>
            <td>A Snowflake dynamic table refreshed towards a declared target lag</td>
            <td>Opt-in, where Snowflake-managed freshness is intentional</td>
          </tr>
          <tr>
            <td>
              <code>ephemeral</code>
            </td>
            <td>Nothing — inlined as a CTE into downstream models</td>
            <td>Rare; small shared snippets</td>
          </tr>
        </tbody>
      </table>
      <p>
        The logic of the defaults: staging is cheap renaming, so views keep it always
        fresh for free. Modelling and reporting do real computation, so tables pay the
        cost once per night instead of on every query.
      </p>
      <p>
        dbt&apos;s own guidance compresses the whole decision into one escalation
        ladder, worth memorising: start with a view; when the view gets too slow to{" "}
        <em>query</em>, make it a table; when the table gets too slow to{" "}
        <em>build</em>, make it incremental. Each promotion is a response to a
        pain you have actually felt, never a precaution.
      </p>

      <h2>Overriding per model</h2>
      <p>
        A <code>config()</code>{" "}block at the top of the model wins over the project
        default:
      </p>
      <CodeBlock
        lang="sql"
        code={`
{{
    config(
        materialized='view'
    )
}}

select ...
`}
      />

      <h2>Incremental models</h2>
      <p>
        A full rebuild of a multi-billion-row activity table every night is wasteful
        when yesterday is the only new data. An incremental model builds the full table
        once, then on later runs only processes rows matching the{" "}
        <code>is_incremental()</code>{" "}filter and merges them in:
      </p>
      <CodeBlock
        lang="sql"
        title="the incremental pattern"
        code={`
{{
    config(
        materialized='incremental',
        unique_key='event_id'
    )
}}

select
    event_id,
    sk_patient_id,
    event_date,
    ...
from {{ ref('stg_big_event_feed') }}

{% if is_incremental() %}
  -- only rows newer than what's already in this table
  where event_date > (select max(event_date) from {{ this }})
{% endif %}
`}
      />
      <ul>
        <li>
          <code>{"{{ this }}"}</code>{" "}refers to the already-built table itself.
        </li>
        <li>
          <code>unique_key</code>{" "}lets dbt update changed rows rather than duplicate
          them.
        </li>
        <li>
          <code>dbt build --full-refresh -s my_model</code>{" "}drops and rebuilds from
          scratch — required after logic changes, so existing rows pick up the new
          logic.
        </li>
      </ul>

      <h2>Dynamic tables move refresh responsibility to Snowflake</h2>
      <p>
        Analysts increasingly create <strong>Snowflake dynamic tables</strong> for
        transformations that need to refresh more continuously than a batch workflow.
        The author still supplies a SELECT, but Snowflake monitors the upstream data
        and refreshes the result towards a declared <code>target_lag</code>. dbt&apos;s{" "}
        <a
          href="https://docs.getdbt.com/reference/resource-configs/snowflake-configs#dynamic-tables"
          target="_blank"
          rel="noopener noreferrer"
        >
          Snowflake adapter
        </a>{" "}
        can manage the definition with the <code>dynamic_table</code>{" "}
        materialisation:
      </p>
      <CodeBlock
        lang="sql"
        title="a Snowflake dynamic table managed by dbt"
        code={`{{
    config(
        materialized='dynamic_table',
        snowflake_warehouse='WH_NCL_ENGINEERING_XS',
        target_lag='30 minutes',
        refresh_mode='INCREMENTAL'
    )
}}

select ...`}
      />
      <p>
        Target lag is a freshness objective, not a promise to refresh at an exact
        interval. A target of 30 minutes means Snowflake should try to keep the result
        no more than 30 minutes behind its base tables. Actual lag can be greater when
        refresh work, warehouse capacity or pipeline depth prevents Snowflake meeting
        the target. The consumer requirement should therefore determine the lag, and
        monitoring must compare actual freshness with it.
      </p>
      <p>
        Refresh mode is a separate decision. <code>INCREMENTAL</code>{" "}processes
        changes where the query is compatible; <code>FULL</code>{" "}recomputes the
        result; and <code>AUTO</code>{" "}allows Snowflake to choose. Production work
        should make that behaviour deliberate rather than treating “dynamic” as an
        automatic guarantee of efficient incremental processing. Snowflake documents
        the supported modes and query limitations in its{" "}
        <a
          href="https://docs.snowflake.com/en/user-guide/dynamic-tables/refresh-modes"
          target="_blank"
          rel="noopener noreferrer"
        >
          dynamic-table refresh guidance
        </a>
        .
      </p>

      <h3>Where dynamic tables fit around this dbt project</h3>
      <p>
        The current dbt project does not define models with the{" "}
        <code>dynamic_table</code>{" "}materialisation. Its normal model freshness is
        controlled by the deployment and scheduled workflows described in{" "}
        <Link href="/learn/merge-to-production">From merge to production</Link>.
        Dynamic tables nevertheless exist in the wider Snowflake working environment
        and are legitimate analytical assets for analysts to create when their use
        requires that refresh model.
      </p>
      <p>
        The important point is to make the orchestration boundary explicit. A dynamic
        table created directly in Snowflake is not automatically present in dbt
        lineage, CI, contracts or the project&apos;s Elementary run history. If a dbt model
        consumes it, declare and document the source, its owner and its freshness
        expectation. If the organisation decides to manage dynamic tables through dbt,
        their definitions can gain Git review and DAG lineage, while their background
        refresh health still needs Snowflake-specific monitoring.
      </p>
      <p>
        An analyst can own the SELECT and propose the freshness needed by a consumer.
        The warehouse used for refresh, access controls, cost guardrails and integration
        with production monitoring may require engineering support. This is the same
        “hats, not badges” boundary described in{" "}
        <Link href="/learn/analysts-and-dbt">Analysts and dbt</Link>: responsibility
        follows the decision and its risk, not the presence of a CREATE statement.
      </p>
      <Callout kind="info" title="Choose a dynamic table for a freshness requirement">
        <p>
          Use one when Snowflake-managed, target-lag refresh is part of the intended
          service. Do not use one merely because a normal table is slow; first decide
          whether the problem is query performance, batch build time or required
          latency. Those lead to different materialisation choices.
        </p>
      </Callout>

      <h2>Where incremental models go wrong</h2>
      <p>
        The pattern above looks simple; the failure modes are where the care goes:
      </p>
      <ul>
        <li>
          <strong>Late-arriving data.</strong>{" "}If Tuesday&apos;s rows arrive on
          Thursday, a strict “newer than my max date” filter never picks them up. The
          common fix is a reprocessing window — recompute the last N days every run
          and let <code>unique_key</code>{" "}merge the overlap.
        </li>
        <li>
          <strong>Logic changes don&apos;t propagate.</strong>{" "}Edit the SQL and only
          new rows get the new logic; history silently keeps the old behaviour until a{" "}
          <code>--full-refresh</code>. Easy to forget, hard to spot afterwards.
        </li>
        <li>
          <strong>Schema changes need a decision.</strong>{" "}Adding a column to the
          SELECT does not backfill it for existing rows — they hold null until a full
          refresh. The <code>on_schema_change</code>{" "}config decides whether dbt adds
          the column or fails loudly.
        </li>
        <li>
          <strong>Dev tables drift.</strong>{" "}Your dev copy was built from whatever
          existed when you last full-refreshed it. When dev results look stale or
          impossible, full-refresh your dev table before debugging anything else.
        </li>
      </ul>
      <p>
        A reasonable decision rule: stay with <code>table</code>{" "}until the scheduled
        rebuild of a specific model is measurably slow or expensive, then make that
        model incremental and write its <code>is_incremental()</code>{" "}filter with the
        failure modes above in mind.
      </p>

      <Callout kind="warn" title="Incremental is a performance tool, not a default">
        <p>
          Incremental models add real complexity: late-arriving data, schema changes and
          logic edits all need thought, and a model that silently misses updates is worse
          than a slow one. Reach for it when a table rebuild is measurably painful —
          and expect the review to probe your <code>is_incremental()</code>{" "}filter.
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt: "Staging models are views because…",
            options: [
              "Views are faster to query than tables",
              "Their work is trivial, so computing it at query time costs little and the data is always current",
              "Storing the same patient-level rows twice would be a governance issue",
              "Tables in staging would force downstream models to rebuild more often",
            ],
            answer: 1,
            explain:
              "Views are not faster — they defer computation to query time. For rename-and-cast logic that deferred cost is negligible, so the always-fresh, zero-storage trade is worth it. Where real computation happens, tables win.",
          },
          {
            prompt: "You changed the logic of an incremental model. What must you remember?",
            options: [
              "Nothing — dbt detects the logic change and rebuilds the affected rows",
              "Run with --full-refresh so existing rows are rebuilt under the new logic",
              "Run dbt build twice — the second pass picks up the new logic",
              "Update the model version in its YAML so dbt knows to rebuild",
            ],
            answer: 1,
            explain:
              "Incremental runs only process new rows, regardless of what changed in the SQL — dbt does not diff your logic. Until a full refresh, history reflects the old logic while new rows get the new logic.",
          },
        ]}
      />
    </LessonShell>
  );
}
