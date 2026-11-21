import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";
import { LessonQuote } from "@/components/LessonQuote";

export const metadata: Metadata = { title: "Materialisations" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="materialisations"
      kicker="Going further 04"
      title="Materialisations"
      lede="A materialisation tells dbt what to build from your model in Snowflake. It decides when the query runs, whether the rows are stored and who refreshes them. The project sets a default for each layer, so you only choose one when a model needs something different."
      minutes={12}
    >
      <h2>Each layer has a default materialisation</h2>
      <p>
        Most of the time you won&apos;t choose a materialisation, because{" "}
        <code>dbt_project.yml</code>{" "}sets one for each layer. Raw and staging
        models build as views, and most other layers build as tables. Knowing the
        options explains why builds behave the way they do, and what to change when
        a model is too slow.
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
            <td>A view. No data is stored, and the query runs each time someone reads it</td>
            <td>Raw and staging layers</td>
          </tr>
          <tr>
            <td>
              <code>table</code>
            </td>
            <td>A table, rebuilt from scratch on every run</td>
            <td>The project default, used by every layer except raw, staging and semantic</td>
          </tr>
          <tr>
            <td>
              <code>incremental</code>
            </td>
            <td>A table that, after its first build, processes only the rows its filter selects</td>
            <td>Opt-in, for very large data</td>
          </tr>
          <tr>
            <td>
              <code>dynamic_table</code>
            </td>
            <td>A Snowflake dynamic table, refreshed by Snowflake towards a declared target lag</td>
            <td>Opt-in, where you want Snowflake to manage freshness</td>
          </tr>
          <tr>
            <td>
              <code>ephemeral</code>
            </td>
            <td>Nothing in Snowflake. dbt pastes the SQL into downstream models as a CTE</td>
            <td>Rare. Small shared snippets</td>
          </tr>
        </tbody>
      </table>
      <p>
        Semantic views use their own <code>semantic_view</code>{" "}materialisation,
        covered in <Link href="/advanced/semantic-views">Semantic views</Link>.
      </p>
      <p>
        The defaults follow the cost of the work. Staging only renames and casts
        columns, so a view costs almost nothing to query and is never out of date.
        Modelling and reporting do real joins and aggregations. Storing those as
        tables means Snowflake pays for the work once per scheduled build, not every
        time a dashboard opens.
      </p>
      <p>dbt Labs sums up the whole decision in one rule.</p>
      <LessonQuote
        attribution="dbt Labs"
        work="Best practices for materializations"
        href="https://docs.getdbt.com/best-practices/materializations/5-best-practices"
      >
        Start with models as views, when they take too long to query, make them
        tables, when the tables take too long to build, make them incremental.
      </LessonQuote>
      <p>
        Notice what triggers each step. A view becomes a table when it&apos;s too
        slow to <em>query</em>. A table becomes incremental when it&apos;s too slow
        to <em>build</em>. Each move answers a problem you&apos;ve actually
        measured. None of them is a precaution.
      </p>

      <h2>A config block overrides the default</h2>
      <p>
        To change one model, put a <code>config()</code>{" "}block at the top of its
        file. It wins over the layer default:
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

      <h2>An incremental model updates part of a table</h2>
      <p>
        An incremental model builds the whole table on its first run. On later runs
        its SQL selects only some rows, and dbt adds them to the existing table or
        updates the rows it already holds. Usually that&apos;s the new rows, but it
        can include older rows that have changed, if the filter selects them.
      </p>
      <p>
        It&apos;s for tables too big to rebuild every run. Rebuilding a billion-row
        activity table every night repeats work when only yesterday&apos;s rows are
        new. The <code>is_incremental()</code>{" "}filter decides which rows each run
        processes:
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
  -- coalesce covers an empty table, where max() returns null
  where event_date > (
      select coalesce(max(event_date), '1900-01-01') from {{ this }}
  )
{% endif %}
`}
      />
      <p>
        <code>is_incremental()</code>{" "}is true only when the table already exists
        and you haven&apos;t asked for a full refresh. On the very first run it&apos;s
        false, so the filter drops out and the model selects everything. Inside the
        filter, <code>{"{{ this }}"}</code>{" "}means the table this model has already
        built. So the subquery asks, in effect, &quot;what&apos;s the latest date I
        already hold?&quot; The <code>coalesce</code>{" "}matters. If the first
        build creates an empty table, <code>max()</code>{" "}returns null, every
        comparison with null fails, and the model never accepts another row.
      </p>
      <p>
        <code>unique_key</code>{" "}tells dbt how to recognise a row it already has.
        On Snowflake, dbt&apos;s default strategy is <code>merge</code>. Say
        tonight&apos;s batch contains event 501, which is already in the table, and
        event 502, which isn&apos;t. Merge updates 501 in place and inserts 502.
        Without a <code>unique_key</code>, both rows would simply be appended, and
        a corrected event 501 would sit next to the old one as a duplicate.
      </p>
      <p>
        The project&apos;s healthcare-event models, such as{" "}
        <code>int_sus_healthcare_event</code>, use{" "}
        <code>incremental_strategy=&apos;delete+insert&apos;</code>{" "}instead. dbt
        deletes every existing row whose key appears in the new batch, then inserts
        the batch. That matches a merge only when each key appears once in the
        batch. If the batch holds two rows for event 501, merge fails with a
        &quot;nondeterministic merge&quot; error, but delete+insert inserts both
        without complaint and the table gains a duplicate. So test the incoming grain, for
        example with a <code>unique</code>{" "}test on the key, rather than trusting
        the strategy to enforce it.
      </p>
      <p>
        To throw the existing table away and build it again from scratch, run{" "}
        <code>dbt build --full-refresh -s my_model</code>. You&apos;ll need that
        whenever you change the model&apos;s logic, for the reason the next section
        explains.
      </p>

      <h2>Four ways an incremental model goes wrong</h2>
      <p>
        An incremental run only touches the rows its filter selects. Every other row
        keeps the values from earlier runs. Each of these four cases follows from
        that.
      </p>
      <ul>
        <li>
          <strong>Late-arriving data.</strong>{" "}If Tuesday&apos;s rows arrive on
          Thursday, a strict &quot;newer than my latest date&quot; filter never picks
          them up, because Wednesday&apos;s rows already moved the latest date on.
          The usual fix is a reprocessing window. Recompute the last few days on
          every run, for example{" "}
          <code>
            where event_date &gt;= (select dateadd(day, -3, coalesce(max(event_date),
            &apos;1900-01-01&apos;)) from {"{{ this }}"})
          </code>
          , and let <code>unique_key</code>{" "}absorb the overlap. A window only
          reaches back so far. A correction to a row older than the window is never
          picked up unless the filter selects it, for example on a load or
          modified timestamp instead of the event date.
        </li>
        <li>
          <strong>Logic changes don&apos;t reach old rows.</strong>{" "}Edit the SQL
          and only new rows get the new logic. History keeps the old behaviour until
          someone runs <code>--full-refresh</code>, and nothing warns you in the
          meantime. The project&apos;s scheduled build on the 1st of each month runs
          with <code>--full-refresh</code>, so drift doesn&apos;t last forever. A
          logic change still needs its own full refresh when it merges. The
          exceptions are models like <code>cltcs_population_monthly_capture</code>,
          which keep monthly history that can&apos;t be rebuilt from source. They
          set <code>full_refresh=false</code>{" "}so the monthly run leaves them
          alone.
        </li>
        <li>
          <strong>New columns need a decision.</strong>{" "}The{" "}
          <code>on_schema_change</code>{" "}config decides what happens when the
          SELECT&apos;s columns no longer match the table. The default,{" "}
          <code>ignore</code>, leaves a new column out of the table altogether.{" "}
          <code>append_new_columns</code>{" "}adds it, and{" "}
          <code>sync_all_columns</code>{" "}also drops columns you removed. With
          either of those, existing rows hold null in the new column, because none
          of the options backfills old rows. Only a full refresh does that. The
          project&apos;s healthcare-event and clinical-record models use{" "}
          <code>fail</code>, which stops the build so a person makes the call. The
          monthly capture models, like{" "}
          <code>cltcs_population_monthly_capture</code>, use{" "}
          <code>append_new_columns</code>, so a new column joins the history without
          stopping the capture.
        </li>
        <li>
          <strong>Dev tables drift.</strong>{" "}Your dev copy holds whatever existed
          when you last full-refreshed it. If dev results look stale or impossible,
          full-refresh your dev table before you debug anything else.
        </li>
      </ul>
      <p>
        So stay with <code>table</code>{" "}until one model&apos;s scheduled rebuild
        is measurably slow or expensive. Then make that model incremental, and write
        its <code>is_incremental()</code>{" "}filter with these four failures in mind.
      </p>

      <Callout kind="warn" title="Incremental is a performance tool, not a default">
        <p>
          A model that misses updates without telling anyone is worse than a slow
          one. Late data,
          schema changes and logic edits all need thought before you switch. Expect
          the reviewer to ask hard questions about your{" "}
          <code>is_incremental()</code>{" "}filter.
        </p>
      </Callout>

      <h2>Dynamic tables hand the refresh to Snowflake</h2>
      <p>
        A dynamic table is a Snowflake object that keeps its own result up to date.
        You still write a SELECT. Snowflake then watches the tables it reads from and
        refreshes the result to stay within a <code>target_lag</code>{" "}you declare.
        Analysts in the wider Snowflake environment create them for work that needs
        fresher data than a nightly batch gives. dbt&apos;s{" "}
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
        Target lag is a freshness goal, not a timetable. A 30-minute target means
        Snowflake tries to keep the result no more than 30 minutes behind its base
        tables. It can fall further behind if a refresh is slow, the warehouse is
        busy or a long chain of tables has to refresh first. So set the lag from what
        the consumer actually needs, and monitor the real lag against it.
      </p>
      <p>
        Refresh mode is a separate choice. <code>INCREMENTAL</code>{" "}processes only
        the changes, and Snowflake refuses to create the table if the query
        can&apos;t be refreshed that way. <code>FULL</code>{" "}recomputes the whole
        result each time. <code>AUTO</code>{" "}lets Snowflake pick, but it picks once,
        when the table is created, and never looks again. That&apos;s why Snowflake
        recommends naming the mode yourself in production. &quot;Dynamic&quot;
        doesn&apos;t guarantee cheap incremental refreshes. Snowflake lists which
        queries support each mode in its{" "}
        <a
          href="https://docs.snowflake.com/en/user-guide/dynamic-tables/refresh-modes"
          target="_blank"
          rel="noopener noreferrer"
        >
          refresh mode guidance
        </a>
        .
      </p>

      <h3>This project doesn&apos;t use dynamic tables</h3>
      <p>
        No model in dbt-analytics uses the <code>dynamic_table</code>{" "}
        materialisation. The project&apos;s freshness comes from the deployment and
        scheduled workflows described in{" "}
        <Link href="/learn/merge-to-production">From merge to production</Link>.
        Dynamic tables do exist elsewhere in our Snowflake account, and they&apos;re
        a legitimate choice when a use case needs that refresh model.
      </p>
      <p>
        What matters is being clear about who orchestrates what. A dynamic table
        created straight in Snowflake doesn&apos;t appear in dbt lineage, CI,
        contracts or the project&apos;s Elementary run history. If a dbt model reads
        one, declare it as a source and document its owner and expected freshness.
        If we decide to manage dynamic tables through dbt, their definitions get Git
        review and DAG lineage. Their background refreshes still need monitoring in
        Snowflake, because dbt doesn&apos;t run them.
      </p>
      <p>
        An analyst can own the SELECT and propose the freshness a consumer needs. The
        refresh warehouse, access controls, cost limits and links into production
        monitoring may need engineering help. It&apos;s the same &quot;hats, not
        badges&quot; split described in{" "}
        <Link href="/learn/analysts-and-dbt">Analysts and dbt</Link>. Who&apos;s
        responsible depends on the decision and its risk, not on who can run a CREATE
        statement.
      </p>
      <Callout kind="info" title="Choose a dynamic table for a freshness requirement">
        <p>
          Use one when a target lag that Snowflake maintains is part of the service
          you&apos;re offering. Don&apos;t use one just because a table is slow.
          First work out whether the problem is query speed, build time or how fresh
          the data must be. Each points to a different materialisation.
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
              "Views aren't faster. They put the computation off until someone queries them. For rename-and-cast logic that cost is tiny, so you get always-fresh data with no storage. Where real computation happens, tables win.",
          },
          {
            prompt: "You changed the logic of an incremental model. What must you remember?",
            options: [
              "Nothing. dbt detects the logic change and rebuilds the affected rows",
              "Run with --full-refresh so existing rows are rebuilt under the new logic",
              "Run dbt build twice. The second pass picks up the new logic",
              "Update the model version in its YAML so dbt knows to rebuild",
            ],
            answer: 1,
            explain:
              "Incremental runs only process the rows their filter selects, whatever changed in the SQL. dbt doesn't compare your old and new logic. Until a full refresh, history reflects the old logic and new rows get the new logic.",
          },
        ]}
      />
    </LessonShell>
  );
}
