import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Clustering" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="clustering"
      kicker="Going further 04"
      title="Clustering"
      lede="Snowflake stores tables in micro-partitions and skips those a query cannot match. cluster_by orders the data so that pruning is effective."
      minutes={5}
    >
      <h2>How Snowflake stores data</h2>
      <p>
        Every table is split into <strong>micro-partitions</strong> — compressed chunks
        of rows. For each chunk Snowflake records the min and max of every column. When
        a query filters on <code>person_id = 123</code>, chunks whose person_id range
        cannot contain 123 are never read at all. This is{" "}
        <strong>partition pruning</strong>. It happens automatically, but it is only
        effective when similar values are stored together: in a table loaded in random
        order, every chunk spans the whole range of person_ids and nothing can be
        skipped.
      </p>
      <p>
        <code>cluster_by</code>{" "}tells dbt to sort the data as it builds the table, so
        values that are queried together are stored together.
      </p>

      <h2>The default is usually fine</h2>
      <p>
        Without any <code>cluster_by</code>, Snowflake still micro-partitions
        everything — the data just sits in whatever order it was written. This{" "}
        <strong>natural clustering</strong>{" "}is often adequate: data loaded or built in
        date order prunes well for date filters; a table built from an ordered
        upstream inherits much of that ordering; small and medium tables scan quickly
        regardless. Snowflake manages the partitioning itself and does a reasonable
        job with no help.
      </p>
      <p>
        So treat <code>cluster_by</code>{" "}as an <strong>optimisation, not a
        default</strong>. The reason to add it is a known access pattern on a large
        table — or a measured problem, a query profile showing scans touching far
        more partitions than the filter should need. Adding it to every model as
        boilerplate buys nothing on most of them and obscures the cases where it
        matters.
      </p>

      <h2>The project pattern</h2>
      <p>
        You will see this on materialised reporting and published models whose
        consumers repeatedly use the same selective filters or joins. It is one line
        in the same <code>config()</code>{" "}block you already know:
      </p>
      <CodeBlock
        lang="sql"
        title="models/reporting/olids/disease_registers/fct_person_adhd_register.sql"
        code={`
{{
    config(
        cluster_by=['person_id'])
}}

select ...
`}
      />
      <p>The project conventions:</p>
      <ul>
        <li>
          <strong>Reused person-level outputs often cluster on <code>person_id</code></strong>
          {" "}— disease registers, vaccination status and dimensions can benefit when
          several downstream models repeatedly join or filter by person.
        </li>
        <li>
          <strong>Dashboard bases cluster on their filter columns</strong> — for
          example the covid/flu dashboard base uses{" "}
          <code>cluster_by=[&apos;programme_type&apos;, &apos;campaign_id&apos;,
          &apos;practice_code&apos;, &apos;person_id&apos;]</code>, matching the order
          users slice the dashboard.
        </li>
        <li>
          <strong>Event-style tables add the date</strong> —{" "}
          <code>cluster_by=[&apos;person_id&apos;, &apos;effective_date&apos;]</code>.
        </li>
      </ul>

      <h2>What makes a good clustering key</h2>
      <p>
        The objective in one sentence:{" "}
        <strong>
          cluster by the columns the next consumer will filter or join on
        </strong>
        . Not what the model groups by internally, not its primary key for its own
        sake — what the queries reading it will put in their <code>where</code>{" "}and{" "}
        <code>on</code>{" "}clauses. That means the right key can change as the same data
        moves down the pipeline, because the consumer changes.
      </p>
      <p>
        The OLIDS clinical-event pipeline is a worked example. Its dbt-olids
        inputs are usually already clustered by mapped concept code and clinical
        date for the expensive code-filter scan. A <code>cluster_by</code>{" "}config
        on the consuming model controls its new output; it does not make that
        upstream scan cheaper.
      </p>
      <ul>
        <li>
          <strong>Upstream, retain the mapped-concept clustering.</strong>{" "}Building
          <code>int_</code>{" "}models filters to observations or diagnoses such as
          blood pressure, HbA1c and condition codes. Those filters prune against
          the existing code-ordered input.
        </li>
        <li>
          <strong>Downstream, cluster by person.</strong>{" "}Once an <code>int_</code>{" "}
          model has extracted its observations, its consumers stop filtering by code —
          registers and demographics join and filter by patient. So the{" "}
          <code>int_</code>{" "}outputs switch to{" "}
          <code>cluster_by=[&apos;person_id&apos;, &apos;clinical_effective_date&apos;]</code>,
          and everything built on them joins efficiently.
        </li>
      </ul>
      <p>Three practical rules follow:</p>
      <ol>
        <li>
          <strong>Ask who reads this model and what they filter or join on.</strong>{" "}If
          you cannot answer, you are not ready to choose a key.
        </li>
        <li>
          <strong>Order matters</strong>: put the coarser, most-filtered column first.
          A handful of columns is the ceiling — more dilutes the benefit.
        </li>
        <li>
          <strong>Small tables don&apos;t need it.</strong>{" "}A 50,000-row lookup fits in
          a few micro-partitions; there is nothing to prune. Clustering pays off on
          large person-level and event tables.
        </li>
        <li>
          <strong>Cardinality matters at both extremes.</strong>{" "}A two-value flag
          barely narrows anything; a unique timestamp scatters grouping. Mid-cardinality
          columns — person, code, practice, date — sit in the useful range. When the
          natural column is too fine-grained, Snowflake&apos;s advice is to cluster on
          an expression that coarsens it — a timestamp cast to a date, for example —
          keeping the ordering while giving the partitions something to group by.
        </li>
      </ol>
      <p>
        Clustering a rebuilt dbt table is not free: the build must sort its result, and
        a large sort can use substantial memory or spill to disk. That cost can still
        be worthwhile when one shared model gives several downstream consumers much
        better pruning. Compare the shared build cost and downstream saving rather
        than judging the config in isolation.
      </p>

      <h2>How to tell it is working</h2>
      <p>
        Clustering is measurable, not a matter of faith. Two checks, both in
        Snowflake:
      </p>
      <ul>
        <li>
          <strong>Query Profile.</strong>{" "}Run a representative filtered query and open
          its profile in Snowsight. The TableScan node shows{" "}
          <em>partitions scanned</em>{" "}against <em>partitions total</em> — a
          well-clustered table scans a small fraction; scanning nearly all of them
          means the key is not helping that query.
        </li>
        <li>
          <strong><code>system$clustering_information</code>.</strong>{" "}Pass it a table
          and a candidate column list and it reports overlap depth — how jumbled the
          data is with respect to that key — letting you evaluate a key before
          committing to it.
        </li>
      </ul>
      <p>
        If a model is large, clustered, and its consumers still scan most partitions,
        the key does not match how the table is actually queried — change the key, not
        the queries.
      </p>

      <Callout kind="info" title="Going deeper">
        <p>
          SELECT.dev&apos;s{" "}
          <a
            href="https://select.dev/posts/introduction-to-snowflake-clustering"
            target="_blank"
            rel="noopener noreferrer"
          >
            Effective Clustering in Snowflake
          </a>{" "}
          is the best practical guide to this topic — including natural clustering
          (data loaded in date order is often already well clustered for free) and why
          they find clustering worthwhile from hundreds of megabytes, well below
          Snowflake&apos;s official multi-terabyte guidance.
        </p>
      </Callout>

      <Callout kind="tip" title="A useful self-check">
        <p>
          Building a sizeable materialised model used by several downstream queries?
          Consider clustering on their repeated selective filter or join key. Do not
          suggest it for a tiny reference table. For OLIDS, distinguish the existing
          mapped-concept clustering used by the input scan from person-level
          clustering that may benefit consumers of the reduced output.
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt: "What does cluster_by actually change?",
            options: [
              "It creates an index on the chosen columns",
              "The physical ordering of rows, so partition min/max ranges become narrow and prunable",
              "It splits the table into one micro-partition per distinct value",
              "It tells the optimiser which columns queries will filter on",
            ],
            answer: 1,
            explain:
              "Snowflake has no indexes and takes no hints — the only mechanism is micro-partition pruning on min/max statistics, and clustering works by physically ordering rows so those ranges become tight.",
          },
          {
            prompt: "Which model benefits most from cluster_by?",
            options: [
              "A 2,000-row specialty lookup joined by almost every model",
              "A 100M-row person-level fact that dashboards filter by practice and person",
              "A 5M-row extract table that consumers always read in full",
              "A large staging view over an event feed",
            ],
            answer: 1,
            explain:
              "Pruning needs both scale and selective filters. The busy lookup is too small to prune; the full-read extract has no filter to prune on; the staging view stores no data at all.",
          },
        ]}
      />
    </LessonShell>
  );
}
