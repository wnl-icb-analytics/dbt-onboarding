import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Checklist } from "@/components/Checklist";
import { GuidedCourseLink } from "@/components/GuidedCourseLink";

export const metadata: Metadata = { title: "Add the YAML" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="yaml-and-tests"
      kicker="Field guide · 4"
      title="Add the YAML"
      lede="The .yml beside a model is where what you know about the data becomes part of the pipeline — read by the docs site, by Snowflake, by CI, and by tests whenever the model is selected to build."
      minutes={8}
    >
      <GuidedCourseLink href="/courses/first-pr/describe-and-test" />

      <h2>What this file actually does</h2>
      <p>
        The SQL file describes the rows to build. The YAML file records
        everything else worth knowing about them — and unlike a comment or a
        wiki page, what you write here is <em>used</em>. The descriptions
        publish to the dbt docs site and become column comments on the
        Snowflake object itself, so they appear on hover in Snowsight and in
        every tool that reads warehouse metadata. The owner block tells CI —
        and, later, a colleague at 2 am — who understands this model. And the
        tests compile into queries that run whenever the model is selected: in your
        local build, in conditional Snowflake PR validation and in the relevant
        production schedules.
      </p>
      <p>
        That last audience is the one that changes how you write the file.
        Documentation elsewhere goes stale the day after it is written; this
        file is executed. Writing it is less like documenting and more like
        setting the terms the data must keep meeting after you have moved on.
      </p>

      <h2>Generate the skeleton</h2>
      <CodeBlock
        lang="bash"
        code={`
dbt run -s stg_reference_opening_hours
dbt run-operation generate_model_yaml --args '{"model_names": ["stg_reference_opening_hours"], "upstream_descriptions": true}'
`}
      />
      <p>
        The generator reads the built model, emits the full column list, and
        copies descriptions from upstream where columns pass through
        unchanged — which is why the model is built first. Save the output
        beside the SQL with the same name.
      </p>
      <p>
        Be clear about what you just got. The generator knows what the columns{" "}
        <em>are</em>; it cannot know what they <em>mean</em>. It does not know
        the grain, which columns carry the model&apos;s contract, what a null
        represents, or which source quirks the next analyst needs warning
        about. Everything that follows is the part only you can write.
      </p>

      <h2>Descriptions that earn their space</h2>
      <p>
        A description that restates the column name is worse than none — it
        occupies the place where help would go. Compare:
      </p>
      <CodeBlock
        lang="yaml"
        code={`
# adds nothing — the name already said this
- name: day_of_week
  description: The day of the week

# adds what the name cannot say
- name: day_of_week
  description: ISO day of week, 1 = Monday. The source uses 0 = Sunday; converted here.
`}
      />
      <p>
        The useful material is always the same few things: units and coding
        (1 = Monday; mmol/mol; lowercase ODS code), what null means (never
        recorded? not applicable? awaiting a feed?), and anything the source
        does that would surprise someone. The test for a good description:
        would it answer the question a colleague hovers over this column with,
        six months from now, with you on leave?
      </p>
      <p>
        The model&apos;s own description carries one obligation — state the
        grain. “Site opening hours, one row per site per weekday” tells a
        reader whether this table can answer their question before they open
        the SQL.
      </p>

      <h2>The tests: grain first, then contract</h2>
      <CodeBlock
        lang="yaml"
        title="stg_reference_opening_hours.yml — the decisions"
        code={`
models:
  - name: stg_reference_opening_hours
    description: Site opening hours, one row per site per weekday
    config:
      meta:
        owner:
          name: Your Name
    data_tests:
      - dbt_utils.unique_combination_of_columns:
          arguments:
            combination_of_columns: [site_code, day_of_week]
    columns:
      - name: site_code
        description: Standardised site identifier
        data_tests: [not_null]
`}
      />
      <p>
        Every test compiles to a query that hunts for rows breaking the rule —
        zero rows back means pass. That framing helps you choose: a test is
        worth writing when the rows it would find represent something genuinely
        wrong, worth waking the pipeline up over.
      </p>
      <p>
        The grain test comes first because it catches the most damaging silent
        failure — a join, now or years from now, that fans the table out and
        multiplies every downstream count. Take the grain sentence from the
        description and assert it: <code>unique</code>{" "}for a single-column
        grain, <code>unique_combination_of_columns</code>{" "}when the grain is a
        combination. Then <code>not_null</code> — but only on columns where a
        null would genuinely break the contract, usually the grain columns
        themselves. A <code>not_null</code>{" "}on a column that is legitimately
        sometimes empty fails on the first real null, and a test that fails on
        valid data teaches everyone to ignore failures. If null is meaningful,
        the right place for that fact is the description, not a test.
      </p>

      <Callout kind="warn" title="Use the current YAML shape">
        <p>
          Tests go under <code>data_tests:</code>, and package test parameters
          nest under <code>arguments:</code>. The older <code>tests:</code>{" "}
          form still exists in legacy model YAML. Use the current form for new
          or changed test blocks; an unrelated enhancement does not need to
          migrate untouched legacy tests.
        </p>
      </Callout>

      <Checklist
        id="yaml"
        items={[
          { key: "owner", label: <>Owner names a real person</> },
          { key: "grain", label: <>Description states the grain and a test enforces it</> },
          { key: "nulls", label: <><code>not_null</code>{" "}only where null breaks the contract</> },
          { key: "desc", label: <>Descriptions add units, coding, null meaning or source quirks</> },
        ]}
      />
    </LessonShell>
  );
}
