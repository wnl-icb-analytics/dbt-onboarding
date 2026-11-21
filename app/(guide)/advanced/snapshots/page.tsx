import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Snapshots" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="snapshots"
      kicker="Going further 06"
      title="Snapshots"
      lede="Some sources only keep the present: a patient's practice today, an address today. Snapshots record every change so you can ask what was true at any point in time."
      minutes={6}
    >
      <h2>The problem: sources that overwrite</h2>
      <p>
        When a patient moves practice, many feeds simply update the row — the old
        practice is gone. Next month someone asks “how many patients did practice X
        have in January?” and the source can no longer answer. A{" "}
        <strong>snapshot</strong>{" "}solves this by checking the source on every run and
        recording each change as a new row, building history the source never kept.
      </p>

      <h2>How it looks</h2>
      <p>
        Snapshots live in <code>snapshots/</code>{" "}and use the same SELECT-plus-config
        shape as models. dbt adds bookkeeping columns; a row is “current” while{" "}
        <code>dbt_valid_to</code>{" "}is null:
      </p>
      <CodeBlock
        lang="text"
        title="snapshot output — one patient over time"
        code={`
sk_patient_id  practice_code  dbt_valid_from  dbt_valid_to
1234           A81001         2024-03-01      2025-06-12
1234           A81002         2025-06-12      null          <- current row
`}
      />
      <p>
        This is the classic <strong>slowly changing dimension (type 2)</strong>{" "}pattern.
        The project uses it where history matters — for example{" "}
        <code>dim_snapshot_person_pds_demographics</code>{" "}tracks demographic changes
        from the PDS feed.
      </p>

      <h2>How a snapshot is defined</h2>
      <p>
        Snapshot files look like models with extra configuration: a unique key, and a{" "}
        <strong>strategy</strong>{" "}for detecting that a row has changed:
      </p>
      <CodeBlock
        lang="sql"
        title="snapshots/snapshot_patient_registration.sql (illustrative)"
        code={`
{% snapshot snapshot_patient_registration %}

{{
    config(
        unique_key='person_id',
        strategy='timestamp',
        updated_at='updated_at'
    )
}}

select person_id, practice_code, registration_status, updated_at
from {{ ref('stg_pds_registration') }}

{% endsnapshot %}
`}
      />
      <ul>
        <li>
          <strong><code>timestamp</code>{" "}strategy</strong> — dbt compares an{" "}
          <code>updated_at</code>{" "}column and processes only rows whose timestamp moved.
          Fast and simple, when the source has a reliable last-updated column.
        </li>
        <li>
          <strong><code>check</code>{" "}strategy</strong> — dbt compares the actual
          values of a configured column list and records a new version when any of
          them change. Slower, but it works on data that has no timestamp at all —
          which makes it the natural choice for most of what we want to snapshot.
        </li>
      </ul>
      <p>
        dbt&apos;s general advice is to prefer <code>timestamp</code>{" "}wherever the
        source has a reliable last-updated column — it is cheaper and more robust.
        Much of what this project snapshots has no such column, for the reason the
        next section explains, so <code>check</code>{" "}appears here more often than
        in most projects. Whichever strategy you use, the <code>unique_key</code>{" "}
        must genuinely be unique: it is how dbt matches this run&apos;s rows to the
        recorded versions, and a duplicated key corrupts the very history the
        snapshot exists to protect.
      </p>

      <h2>Why check strategy fits population health</h2>
      <p>
        The textbook snapshot watches a source table with an <code>updated_at</code>{" "}
        column. Much of what this team needs history for is different:{" "}
        <strong>derived states, not events</strong>. A person&apos;s risk group or
        population segment is computed from several temporal factors at once —
        conditions, age, latest results, service contacts. Nothing in the data says
        “this person moved from low to medium risk”; their computed segment is simply
        different the next time the model builds. There is no timestamp to watch,
        because the transition only exists as a difference between two builds.
      </p>
      <p>
        That is exactly what <code>check</code>{" "}strategy captures: snapshot the
        stratification model and list the columns that define the state — dbt notices
        when a person&apos;s computed values differ from the last recorded version and
        writes a new row:
      </p>
      <CodeBlock
        lang="sql"
        title="snapshotting risk segments (illustrative)"
        code={`
{% snapshot snapshot_person_risk_segment %}

{{
    config(
        unique_key='person_id',
        strategy='check',
        check_cols=['risk_band', 'segment']
    )
}}

select person_id, risk_band, segment
from {{ ref('fct_person_risk_stratification') }}

{% endsnapshot %}
`}
      />
      <p>
        Now the questions the stratification model alone cannot answer become simple
        queries on the snapshot: when did this person move from low to medium risk?
        Who entered the high-risk band this quarter, and from where? How long do
        people typically stay in a segment before stepping up? Each transition is a
        pair of adjacent rows — the old state closing (<code>dbt_valid_to</code>) at
        the moment the new one opens — without the upstream models having to model
        their own history.
      </p>
      <p>
        Keep <code>check_cols</code>{" "}to the columns that define the state: every
        column listed is a reason to write a new version, so incidental columns
        inflate the history.
      </p>
      <Callout kind="info" title="Snapshots have their own command">
        <p>
          <code>dbt run</code>{" "}does not execute snapshots. <code>dbt build</code>{" "}can
          execute a snapshot when its selector includes that snapshot, but this
          project runs them explicitly via <code>dbt snapshot</code>, scheduled before
          the main nightly model build so downstream models read the latest history.
        </p>
      </Callout>

      <h2>Querying a snapshot</h2>
      <CodeBlock
        lang="sql"
        code={`
-- current state
select * from {{ ref('my_snapshot') }}
where dbt_valid_to is null

-- as of a specific date
select * from {{ ref('my_snapshot') }}
where '2025-01-15' >= dbt_valid_from
  and ('2025-01-15' < dbt_valid_to or dbt_valid_to is null)
`}
      />
      <p>
        That “as of” pattern is common enough that the project wraps it in the{" "}
        <code>temporal_join()</code>{" "}macro — reach for that before writing your own.
      </p>

      <Callout kind="warn" title="Snapshots only record what they observe">
        <p>
          A snapshot captures changes from the day it starts running — it cannot
          reconstruct history before that, and if a run is skipped, changes that
          happened and reverted in between are not recorded. For the same reason,
          never drop or full-refresh a snapshot table without team agreement: the
          history cannot be regenerated.
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt: "How do you select only the current rows from a snapshot?",
            options: [
              "where is_current = true",
              "where dbt_valid_to is null",
              "where dbt_valid_to > current_date",
              "where dbt_valid_from = (select max(dbt_valid_from) from the snapshot)",
            ],
            answer: 1,
            explain:
              "Current rows have an open-ended window: dbt_valid_to is null, and null fails a > comparison, so option c returns nothing. There is no is_current column, and max(dbt_valid_from) is one global date, not per record.",
          },
          {
            prompt: "Why is dropping a snapshot table worse than dropping a model?",
            options: [
              "Snapshots usually have more downstream dependencies",
              "dbt cannot rebuild snapshots from source — the recorded history is gone for good",
              "Snapshot tables are larger, so the rebuild takes longer",
              "It is not worse — the next snapshot run restores it",
            ],
            answer: 1,
            explain:
              "The next run does recreate the table — but only with today's state. A model's contents are derivable from its sources; a snapshot's history exists nowhere else.",
          },
        ]}
      />
    </LessonShell>
  );
}
