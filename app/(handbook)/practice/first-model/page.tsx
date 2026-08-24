import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Checklist } from "@/components/Checklist";
import { GuidedCourseLink } from "@/components/GuidedCourseLink";

export const metadata: Metadata = { title: "Write a staging model" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="first-model"
      kicker="Field guide · 3"
      title="Write a staging model"
      lede="A staging model has one job: turn one raw table into its clean, standard form, once, for everyone. Each rule of the contract exists to protect that job."
      minutes={7}
    >
      <GuidedCourseLink href="/courses/first-pr/write-the-model" />

      <h2>Place and name it</h2>
      <p>
        The file goes in <code>models/staging/&#123;domain&#125;/</code>{" "}and is
        named <code>stg_&#123;source&#125;_&#123;table&#125;.sql</code>, mirroring
        the raw model it reads. Placement is not tidiness: in this project the
        folder <em>is</em>{" "}configuration — it decides the schema the model
        builds into and the materialisation it gets. Check a neighbouring model
        before inventing a new path; if your file sits where its siblings sit,
        its configuration is already correct.
      </p>
      <CodeBlock
        lang="text"
        code={`models/staging/shared/stg_reference_opening_hours.sql`}
      />

      <h2>The contract, and why each rule exists</h2>
      <CodeBlock
        lang="sql"
        title="stg_reference_opening_hours.sql"
        code={`
select
    organisation_code,
    upper(trim(site_code)) as site_code,
    day_of_week,
    opens_at::time as opens_at,
    closes_at::time as closes_at
from {{ ref('raw_reference_opening_hours') }}
`}
      />
      <p>
        <strong>One raw model, through <code>ref()</code>.</strong>{" "}The raw
        model is the project&apos;s single stable interface to that feed. Read
        it and you inherit that stability; go around it — a{" "}
        <code>source()</code>{" "}call or a hardcoded table — and your model
        breaks dev/prod separation and disappears from the part of the lineage
        everyone else relies on.
      </p>
      <p>
        <strong>Explicit columns, never <code>select *</code>.</strong>{" "}The
        column list is the promise downstream models build against. With{" "}
        <code>*</code>, a column added to the feed appears downstream
        unannounced and a removed one breaks consumers with no warning from
        you. Naming the columns makes every change to the interface a
        deliberate, reviewable act.
      </p>
      <p>
        <strong>Clean and cast here, once.</strong>{" "}The{" "}
        <code>upper(trim(...))</code>{" "}and the <code>::time</code>{" "}casts are
        the point of the layer: every downstream model inherits them, so
        nobody ever parses that string or wonders about stray whitespace
        again. This is also where names move to the project&apos;s conventions
        — <code>is_</code>/<code>has_</code>{" "}for booleans, <code>_date</code>,{" "}
        <code>_at</code>, <code>_id</code>{" "}suffixes — so the whole warehouse
        speaks one language.
      </p>
      <p>
        <strong>Keep every row.</strong>{" "}A staging model is a faithful copy,
        cleaned. Dropping rows is a business decision — “only active
        registrations”, “exclude test patients” — and business decisions
        belong in the modelling layer, where they are named, visible and
        reusable. The only rows staging may remove are true technical
        duplicates.
      </p>
      <p>
        <strong>Normally no joins.</strong>{" "}A staging join is justified only
        for cleaning, standardisation or enrichment that every consumer of the
        source should inherit. Business populations and consumer-specific
        enrichment belong in an <code>int_</code>{" "}model.
      </p>

      <Callout kind="smell" title="The one-sentence check">
        <p>
          A staging model should be describable as “this source table,
          cleaned”. If the sentence needs “only the ones that” or an enrichment
          that not every consumer needs, part of the model belongs in modelling.
        </p>
      </Callout>

      <h2>Look at the output, not just the status</h2>
      <CodeBlock
        lang="bash"
        code={`
dbt show -s stg_reference_opening_hours
dbt compile -s stg_reference_opening_hours
`}
      />
      <p>
        A green build proves the SQL ran; it says nothing about whether the
        rows are right. Read the sample from <code>dbt show</code>{" "}against
        what you know of the source: is the grain what you expected, are the
        nulls where you expected them, did the casts behave — a{" "}
        <code>::time</code>{" "}on a malformed string, for example, fails at
        build, but a lossy rename fails silently. Thirty seconds of looking at
        rows here saves a review round later.
      </p>

      <Checklist
        id="first-model"
        items={[
          { key: "file", label: <>Correct folder and <code>stg_</code>{" "}name</> },
          { key: "ref", label: <>One raw <code>ref()</code>{" "}and explicit columns</> },
          { key: "scope", label: <>No consumer-specific joins or business filters</> },
          { key: "show", label: <><code>dbt show</code>{" "}returns sensible rows</> },
        ]}
      />
    </LessonShell>
  );
}
