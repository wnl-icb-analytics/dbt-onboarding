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
      lede="A snapshot is a table that records how rows looked each time it ran, so you can ask what was true on any date since it started. You use one when a source only keeps the current state."
      minutes={16}
    >
      <h2>A snapshot keeps the history a source overwrites</h2>
      <p>
        A <strong>snapshot</strong>{" "}is a table dbt adds to and never
        rebuilds. It records how the rows of a source or model looked each time
        it ran. Later you can ask what a row said on any date since the
        snapshot started.
      </p>
      <p>
        You need one when the source only holds the current state. When a
        patient moves practice, many feeds update the row in place, and the old
        practice code is gone. Ask how many patients practice A81001 had in
        January and the source can&apos;t answer. Referral statuses and
        register membership work the same way.
      </p>
      <p>
        Each time a snapshot runs, dbt reads the current rows and compares them
        with the versions it recorded last time. If a row has changed, dbt
        closes off the old version and inserts a new one. A new row gets
        inserted. A row that hasn&apos;t changed is left alone. Over time the
        table builds up a history the source never kept.
      </p>

      <h2>Each run closes changed rows and adds new versions</h2>
      <p>
        Say a snapshot watches a model with one row per person and their
        registered practice. It runs at 06:00 each day. On the first run dbt
        copies the source and adds its own columns:
      </p>
      <CodeBlock
        lang="text"
        title="run 1, 3 March"
        code={`
source
person_id  practice_code
1234       A81001
5678       A81002

snapshot
person_id  practice_code  dbt_valid_from    dbt_valid_to  dbt_scd_id
1234       A81001         2025-03-03 06:00  null          9c1e4b
5678       A81002         2025-03-03 06:00  null          27fa80
`}
      />
      <p>
        By the next morning, person 1234 has moved to A81005. dbt sees that the
        row differs from the version it holds. It sets{" "}
        <code>dbt_valid_to</code>{" "}on the old version and inserts the new one:
      </p>
      <CodeBlock
        lang="text"
        title="run 2, 4 March"
        code={`
source
person_id  practice_code
1234       A81005
5678       A81002

snapshot
person_id  practice_code  dbt_valid_from    dbt_valid_to      dbt_scd_id
1234       A81001         2025-03-03 06:00  2025-03-04 06:00  9c1e4b
1234       A81005         2025-03-04 06:00  null              d41f7a
5678       A81002         2025-03-03 06:00  null              27fa80
`}
      />
      <p>On the third run a new person appears and nobody else has changed:</p>
      <CodeBlock
        lang="text"
        title="run 3, 5 March"
        code={`
source
person_id  practice_code
1234       A81005
5678       A81002
9012       A81001

snapshot
person_id  practice_code  dbt_valid_from    dbt_valid_to      dbt_scd_id
1234       A81001         2025-03-03 06:00  2025-03-04 06:00  9c1e4b
1234       A81005         2025-03-04 06:00  null              d41f7a
5678       A81002         2025-03-03 06:00  null              27fa80
9012       A81001         2025-03-05 06:00  null              e0b392
`}
      />
      <p>
        Read the table one person at a time. Person 1234 has two versions. The
        first was current from 3 March until 4 March. The second is current
        now, because its <code>dbt_valid_to</code>{" "}is null. Person 5678 has
        one version, because nothing about them has changed. Each version gets a{" "}
        <code>dbt_scd_id</code>, a hash dbt builds to identify that version
        (shortened here). dbt also adds <code>dbt_updated_at</code>, which it
        uses internally.
      </p>

      <h3>This pattern is called SCD type 2</h3>
      <p>
        SCD stands for slowly changing dimension, a term from Ralph
        Kimball&apos;s dimensional modelling. A dimension is a table describing
        things, like patients or practices, whose attributes change now and
        then. The types number the ways of handling a change. Type 1 overwrites
        the old value, which is what the source did. Type 2 keeps the old row,
        closes it and adds a new one, with dates saying when each was current.
        A dbt snapshot is a type 2 table.
      </p>

      <h3>A snapshot only knows what each run saw</h3>
      <p>
        The dates mark when a run noticed a change. Person 1234 may have moved
        on the afternoon of 3 March, but the snapshot says 4 March at 06:00,
        because that&apos;s the first run that saw it.
      </p>
      <p>
        Between runs the snapshot sees nothing. Suppose person 5678 had moved
        practice on the afternoon of 3 March and moved back before the next
        morning. Both runs would see A81002. The snapshot would hold one
        unchanged version and no record of the move. It records the states it
        observed at its runs, not the changes in between.
      </p>

      <h2>You define a snapshot in YAML</h2>
      <p>
        Since dbt 1.9 a snapshot lives in a YAML file in <code>snapshots/</code>.
        It names the relation to watch and gives a config block. Here&apos;s a
        small one that works:
      </p>
      <CodeBlock
        lang="yaml"
        title="snapshots/practice_registration_snapshot.yml (illustrative)"
        code={`
snapshots:
  - name: practice_registration_snapshot
    relation: ref('int_practice_registration')
    config:
      unique_key: person_id
      strategy: check
      check_cols: [practice_code]
`}
      />
      <p>
        The <code>relation</code>{" "}is a <code>ref()</code>{" "}to a model or a{" "}
        <code>source()</code>{" "}to a raw table. A snapshot can&apos;t filter
        rows or pick columns itself. If you need to, build a model that does it
        and point the snapshot at that. dbt&apos;s docs suggest an ephemeral
        model. This project uses thin views, as you&apos;ll see below.
      </p>
      <p>
        <code>dbt snapshot</code>{" "}runs snapshots and nothing else.{" "}
        <code>dbt build</code>{" "}runs them alongside models and tests, in DAG
        order. <code>dbt run</code>{" "}skips them.
      </p>

      <h3>The unique key matches rows between runs</h3>
      <p>
        <code>unique_key</code>{" "}tells dbt which column identifies a record.
        dbt uses it to pair each source row with the version it already holds.
        If the key isn&apos;t unique, dbt pairs rows wrongly and writes a wrong
        history, so test the key on the input model. When one column
        isn&apos;t enough, give a list. The NICE indicator snapshots here track
        each person against each indicator, so their key has two columns:
      </p>
      <CodeBlock
        lang="yaml"
        code={`
config:
  unique_key: [person_id, indicator_id]
`}
      />

      <h3>Older projects wrap a SELECT in snapshot tags</h3>
      <p>
        Before dbt 1.9, a snapshot was a <code>.sql</code>{" "}file with the
        config and a SELECT inside <code>{"{% snapshot %}"}</code>{" "}tags. You
        may see this in older projects and tutorials. All the snapshots in
        dbt-analytics uses YAML, so write new ones that way.
      </p>
      <CodeBlock
        lang="sql"
        title="snapshots/orders_snapshot.sql (legacy form)"
        code={`
{% snapshot orders_snapshot %}
{{ config(
    target_schema='snapshots',
    unique_key='id',
    strategy='timestamp',
    updated_at='updated_at'
) }}
select * from {{ source('shop', 'orders') }}
{% endsnapshot %}
`}
      />

      <h3>Snapshots build in their own schema</h3>
      <p>
        With no location set, a snapshot builds wherever the project&apos;s{" "}
        <code>generate_schema_name</code>{" "}macro puts it, like a model. You can
        set <code>schema</code>{" "}and <code>database</code>{" "}in the config.
        dbt recommends a separate schema, so it&apos;s obvious these tables
        can&apos;t be rebuilt. This project sets the location once in{" "}
        <code>dbt_project.yml</code>:
      </p>
      <CodeBlock
        lang="yaml"
        title="dbt_project.yml (abridged)"
        code={`
snapshots:
  wnl_analytics:
    +database: "MODELLING"
    +target_schema: "DBT_SNAPSHOTS"
`}
      />
      <p>
        <code>target_schema</code>{" "}is the older config, and dbt uses it as
        written. The database still goes through the project&apos;s{" "}
        <code>generate_database_name</code>{" "}macro. So production snapshots
        land in <code>MODELLING.DBT_SNAPSHOTS</code>{" "}and dev runs land in{" "}
        <code>DEV__MODELLING.DBT_SNAPSHOTS</code>. A new snapshot file
        doesn&apos;t need a location of its own.
      </p>

      <h2>The strategy decides what counts as a change</h2>
      <p>
        dbt has two ways to tell whether a row has changed. You pick one with{" "}
        <code>strategy</code>.
      </p>

      <h3>timestamp reads a last-updated column</h3>
      <p>
        The <code>timestamp</code>{" "}strategy looks at one column, named by{" "}
        <code>updated_at</code>. If a row&apos;s value is later than the version
        dbt holds, dbt closes the old version and inserts the new one. It also
        uses that column for <code>dbt_valid_from</code>, so the dates show when
        the source made the change rather than when a run saw it.
      </p>
      <CodeBlock
        lang="yaml"
        code={`
config:
  unique_key: referral_id
  strategy: timestamp
  updated_at: last_modified_at
`}
      />
      <p>
        It&apos;s cheap. dbt compares one column per row, and columns added to
        or dropped from the source don&apos;t need a config change. dbt
        recommends it when the source has a timestamp you can trust. That trust
        is the catch. If the source edits a row without bumping the timestamp,
        dbt sees no change and records nothing. No error tells you. If
        you&apos;re not sure the feed updates the column on each edit, use{" "}
        <code>check</code>.
      </p>

      <h3>check compares column values</h3>
      <p>
        The <code>check</code>{" "}strategy compares the values in{" "}
        <code>check_cols</code>{" "}with the version it holds. If any differ,
        dbt writes a new version. It needs no timestamp, so it works on any
        table, including models the team builds.
      </p>
      <CodeBlock
        lang="yaml"
        code={`
config:
  unique_key: person_id
  strategy: check
  check_cols: [practice_code, pcn_code]   # or: check_cols: all
`}
      />
      <p>
        <code>check_cols: all</code>{" "}compares every column. It picks up new
        columns without a config change, which is handy. It&apos;s also the
        easy way to make a mess. Each column you check is a reason to open a
        version. If one moves on its own, like an age or a load timestamp, all
        rows get a new version on each run. The history fills with noise and
        the table grows by a copy of the source each day. dbt&apos;s docs
        advise listing the columns you care about. <code>all</code>{" "}is safe
        when no column changes unless the record does.
      </p>
      <p>
        <code>check</code>{" "}also costs more. dbt compares each checked column
        on each row on each run. With <code>check</code>, the dates are run
        times. You can add <code>updated_at</code>{" "}under <code>check</code>{" "}
        too, and dbt uses that column for the dates instead.
      </p>

      <h2>hard_deletes decides what happens when a row disappears</h2>
      <p>
        Sometimes a row is in the source on one run and gone the next. A person
        dies, moves away or stops meeting a register rule. The{" "}
        <code>hard_deletes</code>{" "}config sets what dbt does with their last
        version.
      </p>
      <table>
        <thead>
          <tr>
            <th>Setting</th>
            <th>What happens to the missing row</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>ignore</code>{" "}(default)
            </td>
            <td>
              Nothing. The last version keeps a null <code>dbt_valid_to</code>,
              so it still looks current.
            </td>
          </tr>
          <tr>
            <td>
              <code>invalidate</code>
            </td>
            <td>
              dbt sets <code>dbt_valid_to</code>{" "}on the last version to the run
              time. The row stops looking current.
            </td>
          </tr>
          <tr>
            <td>
              <code>new_record</code>
            </td>
            <td>
              dbt closes the last version and inserts a new row with{" "}
              <code>dbt_is_deleted</code>{" "}set to True. The deletion becomes a
              version you can query.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        For population data, <code>ignore</code>{" "}gives wrong answers.
        Someone who left a register three months ago would show as a
        current member. If a row comes back after <code>invalidate</code>, dbt
        treats it as new and opens a fresh version.
      </p>

      <h3>Two options change the columns dbt adds</h3>
      <p>
        <code>dbt_valid_to_current</code>{" "}puts a value of your choice in{" "}
        <code>dbt_valid_to</code>{" "}for current rows instead of null, usually a
        far-future date. Then a date range check needs no null case.{" "}
        <code>snapshot_meta_column_names</code>{" "}renames the columns dbt adds.
        This project uses neither, so here current rows have a null{" "}
        <code>dbt_valid_to</code>.
      </p>
      <CodeBlock
        lang="yaml"
        code={`
config:
  dbt_valid_to_current: "to_date('9999-12-31')"
  snapshot_meta_column_names:
    dbt_valid_from: valid_from
    dbt_valid_to: valid_to
`}
      />

      <h2>You query a snapshot by its validity window</h2>
      <p>
        For the current version of each record, keep the rows whose window is
        still open. If a snapshot sets <code>dbt_valid_to_current</code>,
        filter on that value instead.
      </p>
      <CodeBlock
        lang="sql"
        code={`
select *
from {{ ref('dim_person_demographics_snapshot') }}
where dbt_valid_to is null
`}
      />
      <p>
        For the state on a date, keep the version whose window contains it.{" "}
        <code>dbt_valid_from</code>{" "}is inclusive and{" "}
        <code>dbt_valid_to</code>{" "}is exclusive, so at most one version
        matches each key.
      </p>
      <CodeBlock
        lang="sql"
        code={`
select *
from {{ ref('dim_person_demographics_snapshot') }}
where dbt_valid_from <= '2025-01-15'
  and (dbt_valid_to > '2025-01-15' or dbt_valid_to is null)
`}
      />
      <p>
        The same condition works as a join. Here each A&amp;E attendance gets
        the practice the patient was registered with on the day:
      </p>
      <CodeBlock
        lang="sql"
        title="illustrative"
        code={`
select
    a.attendance_id,
    a.attendance_date,
    s.practice_code
from {{ ref('int_ae_attendances') }} a
left join {{ ref('dim_person_demographics_snapshot') }} s
    on a.person_id = s.person_id
    and a.attendance_date >= s.dbt_valid_from
    and (a.attendance_date < s.dbt_valid_to or s.dbt_valid_to is null)
`}
      />
      <p>
        The project&apos;s <code>temporal_join()</code>{" "}macro writes this join
        for you. It compares whole dates, so a version opened at 06:00 counts
        for that whole day. Where several versions open on the same day, you get
        the last one. Pass it the snapshot&apos;s column names:
      </p>
      <CodeBlock
        lang="sql"
        title="models/reporting/cltcs/cltcs_monthly_covariates.sql (abridged)"
        code={`
select f.sk_patient_id, f.index_date,
       d.practice_code, d.main_language, d.gender, d.ethnicity_category
from {{ temporal_join('spine', 'index_date', ref('dim_person_demographics_snapshot'),
                      join_key='person_id', join_type='left',
                      valid_from_col='dbt_valid_from', valid_to_col='dbt_valid_to') }}
`}
      />
      <p>
        A snapshot is a node in the DAG, so models build on it with{" "}
        <code>ref()</code>{" "}like anything else.{" "}
        <code>cltcs_monthly_covariates</code>{" "}reads each person&apos;s
        practice, language and conditions as at a monthly index date this way.
        Age isn&apos;t in the snapshot, so that model works it out from date of
        birth as at the same date.
      </p>

      <h2>This project snapshots its own models with check and invalidate</h2>
      <p>
        dbt-analytics has 55 snapshots in <code>snapshots/</code>, all YAML.
        Every one uses <code>strategy: check</code>{" "}and{" "}
        <code>hard_deletes: invalidate</code>. Most watch models the team
        builds, not raw sources. Here&apos;s one in full:
      </p>
      <CodeBlock
        lang="yaml"
        title="snapshots/dim_person_demographics_snapshot.yml"
        code={`
snapshots:
  - name: dim_person_demographics_snapshot
    relation: ref('dim_person_demographics_snapshot_input')
    description: >
      SCD2 history of stable / structural demographic match keys (gender, ethnicity,
      language, registered practice, PCN, registered neighbourhood, death) for
      control-cohort matching and to track structural change (practice moves, death).
      Sources the thin \`dim_person_demographics_snapshot_input\` view, which excludes
      \`age\` (it changes continuously and would version every person on their
      birthday). \`check_cols: all\` over the thin, stable projection. Rows leaving the
      source are closed via \`hard_deletes: invalidate\`.

    config:
      strategy: check
      unique_key: [person_id]
      check_cols: all
      hard_deletes: invalidate

    columns:
      - name: person_id
        description: "Person identifier; snapshot unique_key."
        data_tests:
          - not_null

      - name: dbt_valid_from
        description: "When this snapshot version became active (SCD2)."
        data_tests:
          - not_null
`}
      />
      <p>
        The models these snapshots watch are rebuilt on each run. A
        person&apos;s practice, segment or indicator status is worked out afresh
        each time, and nothing stamps the row when the answer changes. So
        there&apos;s no <code>updated_at</code>{" "}to trust. The change only
        exists as a difference between two builds, and <code>check</code>{" "}
        finds differences.
      </p>
      <p>
        People leave these models all the time. They die, deregister or stop
        meeting an indicator&apos;s rules. Under the default, their last version
        would stay open for good. <code>invalidate</code>{" "}closes it on the
        run when they drop out.
      </p>
      <p>
        Eleven snapshots also set <code>updated_at: table_refresh_date</code>.
        Their input views fill that column with the build time, so the dates
        mean &quot;when the pipeline saw it&quot;.
      </p>

      <h3>Input views leave out columns that change on their own</h3>
      <p>
        <code>dim_person_demographics_snapshot</code>{" "}doesn&apos;t watch{" "}
        <code>dim_person_demographics</code>. It watches{" "}
        <code>dim_person_demographics_snapshot_input</code>, a view that keeps
        the stable columns and leaves out <code>age</code>. Age moves on each
        birthday, so with <code>check_cols: all</code>{" "}it would open a new
        version for each person once a year, with nothing else changed. Most
        snapshots here read a <code>_snapshot_input</code>{" "}view for the same
        reason, usually to drop columns calculated from the current date. The
        description says which columns trigger a version. Read it before you
        query a snapshot.
      </p>
      <p>
        One input view shows why the team snapshots at all.{" "}
        <code>int_patient_registrations_current_snapshot_input</code>{" "}notes
        that EMIS rewrites registration dates after the event. History rebuilt
        later from the source differs from the list as it stood on the day. The
        snapshot keeps the list as it stood.
      </p>

      <h3>Snapshots run inside the scheduled build</h3>
      <p>
        There&apos;s no separate snapshot job. The daily scheduled run is a{" "}
        <code>dbt build</code>{" "}whose selector includes{" "}
        <code>resource_type:snapshot+</code>, which picks every snapshot and
        everything downstream of it. Because it&apos;s one build, dbt runs each
        input model first, then the snapshot, then the models that read it. The
        workflow also has a <code>snapshots</code>{" "}option that runs{" "}
        <code>dbt snapshot</code>{" "}by hand.
      </p>
      <p>
        dbt ignores <code>--full-refresh</code>{" "}for snapshots. A full-refresh
        build that includes one runs it as normal and keeps its history.
      </p>
      <p>
        When you build a snapshot in dev, it writes to{" "}
        <code>DEV__MODELLING.DBT_SNAPSHOTS</code>. That table only holds
        history from dev runs. It tells you nothing about production.
      </p>
      <Callout kind="tip" title="Run a new snapshot twice">
        <p>
          Build it, then build it again with no change to the source. If the
          checked columns are right, the second run adds no rows. If it adds some, a checked column
          changes on its own, and you need to drop it from the input view or
          list <code>check_cols</code>{" "}by hand.
        </p>
      </Callout>

      <h3>Missed runs and dropped tables can&apos;t be recovered</h3>
      <p>
        The snapshot table is the only place its history exists. The source has
        already overwritten the old values.
      </p>
      <p>
        If a run fails or is skipped, nothing records that day&apos;s state.
        The next run compares the source with the last version it holds. A
        change that&apos;s still there gets picked up, dated to the late run. A
        change that came and went in the gap is lost. You can&apos;t rerun
        yesterday, because the source no longer has yesterday&apos;s rows.
      </p>
      <p>
        You can&apos;t rebuild a snapshot the way you rebuild a model. A
        model&apos;s contents come from its sources, so you can drop it and get
        the same table back. Drop a snapshot and the next run creates a new one
        holding only today&apos;s state, with all versions starting today.
        Don&apos;t drop or recreate a snapshot table without the team agreeing
        first.
      </p>

      <h2>Some history needs something other than a snapshot</h2>
      <p>
        If the source already keeps history, use that. A feed with start and
        end dates, or an audit trail, holds each version, including the ones a
        daily snapshot would miss between runs. Model it with an incremental
        model or plain SQL over the dated rows.
      </p>
      <p>
        If you need history from before today, a snapshot can&apos;t give it.
        It starts on its first run and can&apos;t backfill. Work out past states
        from dated events instead, the way the <code>pit_*_register</code>{" "}
        models evaluate a register at a reference date you supply.
      </p>
      <p>
        If the columns you care about change on most runs, a snapshot versions
        most rows every run. Rolling 12-month activity counts are like this.
        The project captures them with{" "}
        <code>cltcs_activity_monthly_capture</code>, an incremental model that
        appends one row per patient per month.
      </p>

      <Quiz
        questions={[
          {
            prompt: "How do you select only the current rows from a snapshot in this project?",
            options: [
              "where is_current = true",
              "where dbt_valid_to is null",
              "where dbt_valid_to > current_date",
              "where dbt_valid_from = (select max(dbt_valid_from) from the snapshot)",
            ],
            answer: 1,
            explain:
              "Current rows have an open window, and this project doesn't set dbt_valid_to_current, so dbt_valid_to is null. A null fails a > comparison, so option c returns nothing. There's no is_current column, and max(dbt_valid_from) is one date for the whole table, not one per record.",
          },
          {
            prompt:
              "A feed changes a patient's practice_code but leaves updated_at alone. The snapshot uses strategy: timestamp. What does the next run record?",
            options: [
              "A new version with the new practice",
              "Nothing. The old version stays current",
              "An error, because the row changed without a new timestamp",
              "A new version dated to the run time",
            ],
            answer: 1,
            explain:
              "timestamp only looks at updated_at. If it hasn't moved, dbt sees no change and raises no error. check would have caught it, because it compares the values.",
          },
          {
            prompt:
              "A person drops out of a snapshot's input model. The snapshot leaves hard_deletes at its default. What does the snapshot show?",
            options: [
              "Their last version, closed at the run time",
              "Their last version, still open, so they look current",
              "Nothing, because dbt deletes their rows",
              "A new row with dbt_is_deleted set to True",
            ],
            answer: 1,
            explain:
              "The default is ignore, which does nothing. invalidate would close the version, and new_record would add a dbt_is_deleted row. This project sets invalidate on every snapshot.",
          },
          {
            prompt: "Why is dropping a snapshot table worse than dropping a model?",
            options: [
              "Snapshots usually have more downstream dependencies",
              "dbt can't rebuild a snapshot from its source. The recorded history is gone for good",
              "Snapshot tables are larger, so the rebuild takes longer",
              "It isn't worse. The next run with --full-refresh restores it",
            ],
            answer: 1,
            explain:
              "The next run does recreate the table, but only with today's state. A model's contents can be rebuilt from its sources. A snapshot's history exists nowhere else, and dbt ignores --full-refresh for snapshots anyway.",
          },
        ]}
      />
    </LessonShell>
  );
}
