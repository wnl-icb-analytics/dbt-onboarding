import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Checklist } from "@/components/Checklist";
import { GuidedCourseLink } from "@/components/GuidedCourseLink";
import { SourceSetupFlow } from "@/components/SourceSetupFlow";

export const metadata: Metadata = { title: "Find your source" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="find-a-source"
      kicker="Field guide · 2"
      title="Find your source"
      lede="Your staging model reads from a raw model — a generated, cleaned view of one source table. Usually the raw model already exists and finding it takes a minute. When it doesn't, you need to understand how raw models come to exist at all."
      minutes={12}
    >
      <GuidedCourseLink href="/courses/first-pr/find-or-add-the-source" />

      <h2>How source data enters the project</h2>
      <p>
        Feeds land in the data lake databases — <code>DATA_LAKE</code>{" "}and{" "}
        <code>DATA_LAKE__NCL</code> — without dbt&apos;s involvement. The
        project&apos;s first contact with them is the raw layer, and the thing
        to understand is that <strong>nobody writes raw models by hand</strong>.
        There are around seven hundred of them, one per source table, each a
        near-identical view that quotes the source&apos;s columns and renames
        them to clean snake_case. Hand-writing them would mean seven hundred
        opportunities for drift and typos; instead, a pipeline generates them.
      </p>
      <p>
        The pipeline works from a registry —{" "}
        <code>scripts/sources/source_mappings.yml</code> — which lists every
        database and schema the project reads. When the generation script runs,
        it queries Snowflake&apos;s own metadata for those schemas, writes the
        source declarations (the YAML that <code>source()</code>{" "}calls point
        at), and writes a raw model for each table. Run it again next month and
        everything is regenerated to match what Snowflake actually contains.
      </p>
      <p>
        That regeneration is why the rule about generated files is absolute:
        an edit to anything under <code>models/raw/</code>{" "}or to an{" "}
        <code>auto_*.yml</code>{" "}survives only until the next run. If a raw
        model is wrong, the fix belongs in the registry, the manual YAML or the
        generator — the places the pipeline reads from — never in its output.
      </p>
      <SourceSetupFlow />
      <p>
        One wrinkle in the registry matters for the steps below. Most schemas
        are registered as <em>automatic</em>: every table in them gets a raw
        model, no decisions needed. A few are marked <code>manual: true</code>,
        which means tables are opted in one at a time — used for wide schemas
        where most tables are irrelevant to the project and generating hundreds
        of unused raw models would be noise. Whether your schema is automatic
        or manual decides how much work “adding a source” actually is.
      </p>

      <h2>First: establish what already exists</h2>
      <p>
        Start from the table&apos;s full <code>DATABASE.SCHEMA.TABLE</code>{" "}
        address — the schema matters as much as the table name, because it
        decides the route:
      </p>
      <CodeBlock
        lang="text"
        code={`DATA_LAKE__NCL.ANALYST_MANAGED.OPENING_HOURS`}
      />
      <p>
        Then search the project (<code>Ctrl+P</code>) three ways, in order: the
        likely staging name (<code>stg_reference_opening_hours</code> — if it
        exists, your work may already be done; reuse it), the likely raw name
        (<code>raw_reference_opening_hours</code> — this is the input you will{" "}
        <code>ref()</code>), and finally the bare table name across the repo,
        which catches a source prefix you did not guess. If the raw model
        exists, preview it and you are done with this page:
      </p>
      <CodeBlock lang="bash" code={`dbt show -s raw_reference_opening_hours`} />

      <h2>If there is no raw model</h2>
      <p>
        Then the table has never been brought into the project, and the
        registry tells you how big a job that is. Open{" "}
        <code>scripts/sources/source_mappings.yml</code>{" "}and search for the
        schema:
      </p>
      <table>
        <thead>
          <tr>
            <th>What the registry says</th>
            <th>What that means</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Schema present, no <code>manual: true</code></td>
            <td>
              Automatic — the table should appear on the next generation run
              with no YAML edits at all. Just run the pipeline.
            </td>
          </tr>
          <tr>
            <td>Schema present, marked <code>manual: true</code></td>
            <td>
              Opt-in — add one table block to that source&apos;s{" "}
              <code>manual_*.yml</code>, then run the pipeline.
            </td>
          </tr>
          <tr>
            <td>Schema absent</td>
            <td>
              The project has never read this schema. Registering one is a
              governance decision as much as a technical one — pair with the
              team rather than adding a mapping alone.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        For the manual case, the block you add is small. Find the source in
        the matching <code>models/sources/manual_*.yml</code>{" "}and add your
        table inside its <code>tables:</code>{" "}list, copying a neighbouring
        block so the indentation is right:
      </p>
      <CodeBlock
        lang="yaml"
        title="models/sources/manual_analyst_managed.yml"
        code={`- name: OPENING_HOURS
  identifier: '"OPENING_HOURS"'
  columns:
  - name: SITE_CODE
    data_type: TEXT
  - name: DAY_OF_WEEK
    data_type: NUMBER(2,0)`}
      />

      <h2>Run the generation and check what it did</h2>
      <CodeBlock
        lang="bash"
        code={`python scripts/sources/run_all_source_generation.py`}
      />
      <p>
        The script signs into Snowflake (a browser window opens) and runs four
        stages: it queries the metadata, extracts it, writes the source YAML,
        and writes the raw models. Because it regenerates from live metadata,
        its output can include changes you did not cause — a column added to
        someone else&apos;s feed since the last run, for example. So the check
        afterwards is a genuine review, not a formality:
      </p>
      <CodeBlock
        lang="bash"
        code={`git status --short
git diff -- models/sources models/raw
dbt parse
dbt show -s raw_reference_opening_hours`}
      />
      <p>
        You are confirming four things: the expected source YAML changed, your
        raw model appeared in the right domain folder, the project still
        parses, and the preview shows the cleaned snake_case columns you will
        build on. If the diff includes changes to sources you never touched,
        ask the team about them before bundling them into your PR — they are
        probably legitimate drift, but that is a decision to make knowingly.
      </p>

      <h2>When the input is a seed</h2>
      <p>
        Small, team-owned reference data — a mapping of status codes, a list
        of thresholds — can skip the source machinery entirely and live as a
        CSV under <code>seeds/</code>. <code>dbt seed</code>{" "}loads it into the
        warehouse and models <code>ref()</code>{" "}it like anything else. The
        boundary: a seed is reference data that belongs to the project&apos;s
        logic and changes by review, the way code does. An extract, a feed, or
        anything at patient level is not a seed, however convenient the folder
        looks.
      </p>

      <h2>Before writing the model</h2>
      <Checklist
        id="find-source"
        items={[
          { key: "found", label: <>Located or generated the raw model</> },
          { key: "columns", label: <>Reviewed its cleaned columns and sample rows</> },
          { key: "grain", label: <>Can state the source grain in one sentence</> },
          { key: "nodupe", label: <>Confirmed no staging model already exists</> },
        ]}
      />
    </LessonShell>
  );
}
