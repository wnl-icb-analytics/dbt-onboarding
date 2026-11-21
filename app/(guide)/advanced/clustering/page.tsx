import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { LessonQuote } from "@/components/LessonQuote";
import { PartitionPruning } from "@/components/PartitionPruning";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Clustering" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="clustering"
      kicker="Going further 05"
      title="Clustering"
      lede="Clustering is how a table's rows are arranged in storage. That arrangement decides how much of the table a query has to read, so it drives how fast the query runs and what it costs. In dbt you choose it with cluster_by."
      minutes={14}
    >
      <h2>What clustering is</h2>
      <p>
        Every table lives on disk in some order. Clustering describes that
        order, meaning which rows end up stored next to each other. If the rows
        a query wants sit together, Snowflake can read that part of the table
        and leave the rest alone. If they&apos;re scattered, it has to read
        almost everything.
      </p>
      <p>
        You care because reading data is what you wait for and what you pay
        for. A filter that touches 1% of a large table can finish in seconds or
        in minutes, depending only on how its rows are arranged. The warehouse
        bills for those minutes in credits.
      </p>
      <p>
        You may know indexes from other databases. Snowflake does have them,
        on hybrid tables, and it offers a search optimisation service for
        point lookups. Neither is what this page covers. The tables dbt builds
        are standard tables, and on those, speed comes from row order.{" "}
        <code>cluster_by</code>{" "}doesn&apos;t create an index. It changes the
        order.
      </p>

      <h2>How Snowflake stores a table</h2>
      <p>
        Snowflake splits every table into <strong>micro-partitions</strong>.
        A micro-partition is a file. It holds a contiguous group of whole rows,
        between 50 and 500 MB before compression. In practice that&apos;s
        often hundreds of thousands of rows, so a table of a hundred million
        rows has hundreds of them. A small table may fit in one.
      </p>
      <p>
        Inside each micro-partition, the values are stored column by column,
        and each column is compressed on its own. A query only fetches the
        columns it names. That&apos;s why <code>select *</code>{" "}costs more
        than picking the five columns you need.
      </p>
      <p>
        As Snowflake writes each micro-partition, it records facts about every
        column in it. These include the smallest and largest value, the number
        of distinct values and the number of nulls. This metadata is stored
        apart from the data, so Snowflake can check it without opening the
        file.
      </p>
      <p>
        Rows go into micro-partitions in the order they&apos;re loaded or
        inserted. Nothing re-sorts them afterwards. A table that gets a new
        batch each day ends up grouped by load date, because each day&apos;s
        rows fill their own partitions. Snowflake calls this{" "}
        <strong>natural clustering</strong>. Every table has some order. The
        question is whether it suits the queries people run.
      </p>
      <p>
        When you update or delete rows, Snowflake re-creates the
        micro-partitions those rows sit in, with the change applied. The old
        versions stay in storage for Time Travel for a while.
        New rows go into new partitions. So a table&apos;s order drifts as it
        changes. Updates and late-arriving rows land in fresh partitions whose
        ranges overlap the old ones. That&apos;s how a well-ordered table
        becomes a poorly ordered one.
      </p>

      <h3>A small example</h3>
      <p>
        Here are 16 fictional events for four people, loaded month by month
        from January to April. Each micro-partition holds four rows. Real ones
        hold far more, but the logic is the same. Under each partition you can
        see the min and max that Snowflake records for <code>person_id</code>{" "}
        and <code>event_date</code>. Try both queries, then sort the rows by
        person and try them again.
      </p>
      <PartitionPruning />

      <h2>How pruning uses the min and max</h2>
      <p>
        Before it reads anything, Snowflake compares the query&apos;s filter
        with each partition&apos;s min and max. If a partition&apos;s range
        can&apos;t contain the value, Snowflake skips it. This is{" "}
        <strong>pruning</strong>. It happens on every query, with no set-up.
      </p>
      <p>
        In load order, the February filter prunes well. Each partition covers
        one month, so only one range overlaps February. The person filter
        doesn&apos;t prune at all. Every partition&apos;s{" "}
        <code>person_id</code>{" "}range runs from 101 to 104, so each one might
        hold person 103. Snowflake only sees the ranges. It can&apos;t tell
        that each partition has just one matching row, so it reads all four.
      </p>
      <LessonQuote
        attribution="Niall Woodward"
        work="Micro-Partitions: Understanding Snowflake's File Structure"
        href="https://select.dev/posts/snowflake-micro-partitions"
      >
        For this to work, the micro-partitions have to contain a narrow range
        of values for the column you&apos;re filtering on.
      </LessonQuote>
      <p>
        Two partitions <strong>overlap</strong>{" "}on a column when their
        ranges share values. <strong>Clustering depth</strong>{" "}counts how
        many partitions overlap at a given value. Snowflake reports the average
        across the table. A depth of 1 is the best you can get, because each
        value lives in one partition. In load order, the example&apos;s{" "}
        <code>person_id</code>{" "}depth is 4. After sorting by person, it&apos;s
        1, and its <code>event_date</code>{" "}depth has gone from 1 to 4.
      </p>
      <p>
        That swap matters. A table has one physical order, so it can suit one
        access pattern well. Sorting for person filters gave up the date
        pruning that load order provided for free.
      </p>
      <p>
        Now picture rows in random order. Each partition gets a spread of
        values from the lowest to the highest, so every range overlaps every
        filter value. Depth equals the number of partitions, and nothing can be
        skipped. On a real table that&apos;s thousands of partitions read to
        find a few rows.
      </p>
      <p>
        Pruning also needs a filter it can compare with the metadata. Wrapping
        the filtered column in a function can stop it. So can a filter whose
        value comes from a subquery, even one that returns a single value.
      </p>

      <h2>What cluster_by does in dbt</h2>
      <p>
        On Snowflake, <code>cluster_by</code>{" "}does two things when dbt builds
        a table or incremental model. It adds an <code>order by</code>{" "}on
        the columns you name, so the rows are written in that order. Then it
        sets those columns as the table&apos;s clustering key.
      </p>
      <CodeBlock
        lang="sql"
        title="What dbt runs, roughly"
        code={`
-- your model
{{ config(materialized='table', cluster_by=['person_id']) }}
select ...

-- what dbt sends to Snowflake
create or replace table <schema>.<model> as (
    select * from ( select ... )
    order by person_id
);

alter table <schema>.<model> cluster by (person_id);
`}
      />
      <p>
        The <code>order by</code>{" "}is what makes the new table well clustered.
        A table model is rebuilt from scratch on every run, so every build
        writes freshly sorted partitions.
      </p>
      <p>
        The clustering key tells Snowflake which order to keep. Once a table
        has one, Snowflake&apos;s <strong>Automatic Clustering</strong>{" "}
        service can reorganise its partitions in the background. It runs on
        Snowflake&apos;s own compute, not your warehouse, and only when
        Snowflake judges the table will benefit. You pay for it in credits.
        You also pay for storage, because the partitions it rewrites are kept
        for Time Travel and Fail-safe.
      </p>
      <p>
        For a table rebuilt in order each run, there&apos;s usually little
        left for the service to do. Incremental models are different. dbt
        sorts each new batch before merging it in, but the batch still lands in
        new partitions. A day of events covers most patients, so each
        day&apos;s partitions span much the same <code>person_id</code>{" "}range
        as the last. Overlap grows with every run, and Automatic Clustering
        spends credits pulling it back.
      </p>
      <p>
        dbt also has an <code>automatic_clustering</code>{" "}config. It only
        affects accounts still on Snowflake&apos;s old manual clustering.
        Automatic Clustering is on by default everywhere else, so the project
        doesn&apos;t set it.
      </p>

      <h2>When a clustering key helps</h2>
      <p>
        Snowflake aims clustering keys at large tables, typically several
        terabytes, with many micro-partitions. It also wants most queries to
        filter selectively on the same columns, and far more queries than
        writes. SELECT has found that keys can pay off on tables from a few
        hundred megabytes. The project clusters tables well below
        Snowflake&apos;s guide, where many downstream models read them with the
        same filter or join.
      </p>
      <p>
        Small tables don&apos;t benefit. A 50,000-row lookup sits in one or two
        micro-partitions, so there&apos;s nothing to skip. And remember that
        every table rebuild already writes rows in some order. If the build
        produces date order and readers filter by date, you may not need a key
        at all.
      </p>

      <h3>Cluster by what the next reader filters on</h3>
      <p>
        Choose the columns that the queries reading this model put in their{" "}
        <code>where</code>{" "}and <code>on</code>{" "}clauses. That isn&apos;t
        what the model groups by internally, and it isn&apos;t the primary key
        for its own sake. Because the reader changes as data moves down the
        pipeline, the right key can change too.
      </p>
      <p>
        The OLIDS clinical-event pipeline shows this. Its inputs come from the
        team&apos;s dbt-olids project, where <code>stable_observation</code>{" "}is
        clustered by <code>mapped_concept_code</code>{" "}and{" "}
        <code>clinical_effective_date</code>. That suits the expensive step,
        pulling every observation with a given code. Each <code>int_</code>{" "}
        model here filters for one kind of observation, such as blood pressure
        or HbA1c, and those filters prune well because the input is sorted by
        code.
      </p>
      <p>
        Once an <code>int_</code>{" "}model has extracted its observations,
        nobody filters it by code any more. Registers and demographics join it
        by patient. So those models switch to{" "}
        <code>cluster_by=[&apos;person_id&apos;, &apos;clinical_effective_date&apos;]</code>
        , and the joins built on them prune well. A <code>cluster_by</code>{" "}
        here only controls this project&apos;s own tables. It can&apos;t make
        the upstream scan cheaper.
      </p>

      <h3>Choosing the columns</h3>
      <p>
        Aim for a column with a middling number of distinct values. A yes/no
        flag splits the table into two groups, which barely narrows anything. A
        column where nearly every value is unique, like a precise timestamp,
        gives Snowflake too little to group by. Person, code, practice and date
        sit in the useful middle. When a column is too fine, cluster on an
        expression that coarsens it, such as <code>to_date(event_timestamp)</code>
        . That cuts the distinct values to the number of days.
      </p>
      <p>
        Snowflake suggests three or four columns at most. More usually adds
        cost without adding speed. Put them in order from fewest distinct
        values to most. A monthly history table puts <code>reporting_date</code>{" "}
        before <code>person_id</code>, because there are far fewer months than
        people.
      </p>
      <p>
        The first column gets the most benefit. Later columns only order rows
        within each value of the ones before them. A filter on the second
        column alone prunes less well than a filter on the first.
      </p>
      <p>
        Clustering has two costs. dbt has to sort the result on every build,
        and a large sort can use a lot of memory or spill to disk. Then
        Automatic Clustering spends credits as the table changes. Both can be
        worth paying when one shared model gives many readers much better
        pruning. Weigh them against the saving across every reader, not for
        the model on its own.
      </p>

      <h2>How to check a table&apos;s clustering</h2>
      <p>
        Start with a real query. Run a typical filtered query and open its
        profile in Snowsight. The TableScan node shows{" "}
        <em>partitions scanned</em>{" "}against <em>partitions total</em>. A
        well-clustered table scans a small share. If it scans nearly all of
        them, its order doesn&apos;t suit that query.
      </p>
      <p>
        Then ask Snowflake how the partitions overlap. Pass{" "}
        <code>system$clustering_information</code>{" "}a table and a list of
        columns. It returns JSON with the total partition count, the average
        overlap, the average depth and a histogram of depths. It works on any
        column list, even on a table with no key, so you can test a candidate
        key before you add it. <code>system$clustering_depth</code>{" "}returns
        just the average depth.
      </p>
      <CodeBlock
        lang="sql"
        title="Snowflake worksheet"
        code={`
-- how well ordered is this table for person filters?
select system$clustering_information(
    '<database>.<schema>.int_adhd_diagnoses_all',
    '(person_id, clinical_effective_date)'
);

-- just the average depth (1 is the best possible)
select system$clustering_depth(
    '<database>.<schema>.int_adhd_diagnoses_all',
    '(person_id)'
);
`}
      />
      <p>
        If a large clustered model still scans most of its partitions, the key
        doesn&apos;t match how people query it. Change the key, not the
        queries.
      </p>

      <h2>How the project uses it</h2>
      <p>
        On main, 869 of the project&apos;s 3,460 SQL models set{" "}
        <code>cluster_by</code>. That&apos;s about a quarter. Nearly all of
        them are OLIDS modelling and reporting models. None set{" "}
        <code>automatic_clustering</code>, and <code>dbt_project.yml</code>{" "}
        sets no project-wide default. Each model chooses its own key in its{" "}
        <code>config()</code>{" "}block.
      </p>
      <CodeBlock
        lang="sql"
        title="models/reporting/olids/disease_registers/fct_person_adhd_register.sql"
        code={`
{{
    config(
        materialized='table',
        cluster_by=['person_id'])
}}

select ...
`}
      />
      <p>A handful of keys cover most models.</p>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Models</th>
            <th>Typical model</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>[&apos;person_id&apos;]</code>
            </td>
            <td>210</td>
            <td>Person-level registers and dimensions</td>
          </tr>
          <tr>
            <td>
              <code>[&apos;reporting_date&apos;, &apos;person_id&apos;]</code>
            </td>
            <td>203</td>
            <td>
              Monthly profiles, such as <code>int_ckd_profile_by_month</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>
                [&apos;person_id&apos;, &apos;clinical_effective_date&apos;]
              </code>
            </td>
            <td>190</td>
            <td>
              Observation extracts, such as <code>int_adhd_diagnoses_all</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>[&apos;sk_patient_id&apos;]</code>
            </td>
            <td>70</td>
            <td>Person-level models built on SUS and other secondary-care data</td>
          </tr>
          <tr>
            <td>
              <code>[&apos;month_end_date&apos;, &apos;person_id&apos;]</code>
            </td>
            <td>45</td>
            <td>
              Register history, such as{" "}
              <code>fct_person_adhd_register_by_month</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>[&apos;person_id&apos;, &apos;order_date&apos;]</code>
            </td>
            <td>34</td>
            <td>Medication orders</td>
          </tr>
        </tbody>
      </table>
      <p>
        Dashboard bases follow their readers instead. The COVID and flu
        dashboard base uses{" "}
        <code>
          cluster_by=[&apos;programme_type&apos;, &apos;campaign_id&apos;,
          &apos;practice_code&apos;, &apos;person_id&apos;]
        </code>
        , which matches the order users slice the dashboard. That&apos;s four
        columns, the most Snowflake suggests.
      </p>
      <p>
        Only 25 of the clustered models are incremental. They&apos;re the ones
        where Automatic Clustering does the most work. The SUS healthcare event
        stream is one, and it clusters on an expression.
      </p>
      <CodeBlock
        lang="sql"
        title="models/modelling/acute/int_sus_healthcare_event.sql"
        code={`
{{ config(
    materialized='incremental', incremental_strategy='delete+insert',
    unique_key=['source_record_type', 'source_record_id'],
    cluster_by=['sk_patient_id', 'coalesce(event_at, event_date::timestamp_ntz)'],
    ...
) }}
`}
      />
      <p>
        Patient comes first, then event time. The <code>coalesce</code>{" "}
        falls back to the event date for records with no time, so every row
        gets a value to sort on.
      </p>

      <Callout kind="info" title="Further reading">
        <p>
          SELECT&apos;s{" "}
          <a
            href="https://select.dev/posts/snowflake-micro-partitions"
            target="_blank"
            rel="noopener noreferrer"
          >
            Micro-Partitions: Understanding Snowflake&apos;s File Structure
          </a>{" "}
          and{" "}
          <a
            href="https://select.dev/posts/snowflake-clustering"
            target="_blank"
            rel="noopener noreferrer"
          >
            3 Ways to Achieve Effective Clustering in Snowflake
          </a>{" "}
          build the idea up with diagrams. Snowflake&apos;s own pages cover{" "}
          <a
            href="https://docs.snowflake.com/en/user-guide/tables-clustering-micropartitions"
            target="_blank"
            rel="noopener noreferrer"
          >
            micro-partitions and clustering depth
          </a>
          ,{" "}
          <a
            href="https://docs.snowflake.com/en/user-guide/tables-clustering-keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            choosing a clustering key
          </a>{" "}
          and{" "}
          <a
            href="https://docs.snowflake.com/en/user-guide/tables-auto-reclustering"
            target="_blank"
            rel="noopener noreferrer"
          >
            Automatic Clustering
          </a>
          . dbt documents <code>cluster_by</code>{" "}in its{" "}
          <a
            href="https://docs.getdbt.com/reference/resource-configs/snowflake-configs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Snowflake configurations
          </a>
          .
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt: "What does cluster_by actually change?",
            options: [
              "It creates an index on the chosen columns",
              "The physical order of rows, so each partition's min and max cover a narrow range",
              "It splits the table into one micro-partition per distinct value",
              "It tells the optimiser which columns queries will filter on",
            ],
            answer: 1,
            explain:
              "cluster_by creates no index and gives the optimiser no hint. Snowflake does have indexes elsewhere, on hybrid tables and through search optimisation, but a standard table relies on pruning by each partition's min and max. Clustering orders the rows so those ranges are narrow.",
          },
          {
            prompt:
              "Every partition of a table has a person_id range of 101 to 104. A query filters on person_id = 103. How many partitions does Snowflake read?",
            options: [
              "Only the partitions that contain person 103",
              "One, because Snowflake stops at the first match",
              "All of them, because every range could contain 103",
              "None, because the metadata answers the query",
            ],
            answer: 2,
            explain:
              "Pruning only sees each partition's min and max. Every range overlaps 103, so none can be ruled out, even if most hold no matching rows.",
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
              "Pruning needs both scale and selective filters. The lookup is too small to prune. The extract is always read in full, so there's no filter to prune on. The view stores no data, so it has no partitions of its own.",
          },
          {
            prompt:
              "Why does an incremental model usually cost more in Automatic Clustering than a table model with the same key?",
            options: [
              "dbt doesn't sort incremental batches",
              "Each run adds new partitions whose ranges overlap the old ones, so the order drifts",
              "Automatic Clustering only runs on incremental models",
              "Incremental models can't have a clustering key",
            ],
            answer: 1,
            explain:
              "dbt sorts each batch, but the batch lands in new partitions that span much the same values as earlier ones. A table model is rebuilt in sorted order every run, so there's little left to recluster.",
          },
        ]}
      />
    </LessonShell>
  );
}
