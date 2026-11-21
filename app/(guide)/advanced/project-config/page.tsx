import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Project configuration" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="project-config"
      kicker="Going further 05"
      title="Project configuration"
      lede="Why does a staging model become a view in the right schema with the right grants, when your file contains nothing but a SELECT? Because dbt_project.yml decided it already."
      minutes={7}
    >
      <h2>One file, all the defaults</h2>
      <p>
        <code>dbt_project.yml</code>{" "}at the repo root configures every model by{" "}
        <strong>folder path</strong>. An abridged view of ours:
      </p>
      <CodeBlock
        lang="yaml"
        title="dbt_project.yml (abridged)"
        code={`
name: 'wnl_analytics'
profile: 'wnl_analytics'

models:
  wnl_analytics:
    +materialized: table          # project default
    +persist_docs:
      columns: true               # YAML descriptions -> Snowflake comments
    +post-hook: ["{{ grant_ownership_with_copy() }}"]

    raw:
      +materialized: view
      +database: "STAGING"
      +schema: "DBT_RAW"

    staging:
      +materialized: view         # staging overrides the default
      +database: "STAGING"
      +tags: ["staging", "daily"]

    reporting:
      +database: "REPORTING"
      +tags: ["reporting"]
      commissioning:
        +schema: "COMMISSIONING_REPORTING"

    published:
      +tags: ["published_reporting"]
      direct_care:
        +database: "PUBLISHED_REPORTING__DIRECT_CARE"
      secondary_use:
        +database: "PUBLISHED_REPORTING__SECONDARY_USE"
`}
      />
      <p>
        Read it top-down: settings cascade from project → folder → subfolder, with
        deeper levels winning. The <code>+</code>{" "}prefix marks a config property (as
        opposed to a folder name).
      </p>
      <p>
        Raw is the exception with one fixed schema: <code>STAGING.DBT_RAW</code>.
        Staging models use source or domain schemas within the <code>STAGING</code>{" "}
        database, including <code>CSDS</code>, <code>OLIDS</code>{" "}and
        <code>REFERENCE</code>. The project&apos;s schema configuration derives or assigns
        the appropriate schema rather than putting every staging model into one
        shared schema.
      </p>

      <h2>The hierarchy</h2>
      <p>When the same setting is defined in more than one place, the most specific wins:</p>
      <table>
        <thead>
          <tr>
            <th>Level</th>
            <th>Example</th>
            <th>Wins over</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>config()</code>{" "}in the model file
            </td>
            <td>
              <code>{"{{ config(materialized='view') }}"}</code>
            </td>
            <td>everything below</td>
          </tr>
          <tr>
            <td>Folder in dbt_project.yml</td>
            <td>
              <code>staging: +materialized: view</code>
            </td>
            <td>project default</td>
          </tr>
          <tr>
            <td>Project default</td>
            <td>
              <code>+materialized: table</code>
            </td>
            <td>dbt&apos;s built-in default</td>
          </tr>
        </tbody>
      </table>
      <p>
        This is why your staging model file contains only a SELECT: location does the
        configuring. It is also why <strong>putting a file in the right folder is a
        real decision</strong> — it sets materialisation, database, schema, tags and
        post-hooks in one move.
      </p>

      <h2>Tags drive the schedules</h2>
      <p>
        Those <code>+tags</code>{" "}are not decoration. The nightly build selects models by
        tag — <code>daily</code>-tagged layers rebuild every night; heavier marts run on
        their own cadence. You can use them too:
      </p>
      <CodeBlock
        lang="bash"
        code={`
dbt build -s tag:daily          # everything in the nightly selection
dbt ls -s tag:reporting         # list models carrying a tag
`}
      />

      <h2>Variables: one value, overridable per run</h2>
      <p>
        Some values need to be consistent everywhere but changeable for a single run —
        reference dates are the project&apos;s main example. The QOF reference date is
        defined once and read through a macro; every register model calls{" "}
        <code>{"{{ qof_reference_date() }}"}</code>{" "}rather than hardcoding a date. To
        rebuild a register as of a different date, override it at the command line:
      </p>
      <CodeBlock
        lang="bash"
        code={`
dbt build -s fct_person_diabetes_register --vars '{"qof_reference_date": "2025-03-31"}'
`}
      />
      <p>
        One definition in normal use, an explicit override when you need to rewind —
        and the override is visible in the command, not hidden in an edited file.
      </p>

      <h2>Post-hooks: governance on autopilot</h2>
      <p>
        The project-level <code>+post-hook</code>{" "}runs after every model build —
        transferring ownership so the right roles can manage the object. Published
        models add hooks for Snowflake governance tags. You get all of this without
        writing a line: it is the layer doing the work.
      </p>

      <Callout kind="info" title="Schemas from folders (OLIDS)">
        <p>
          In the OLIDS domain a custom <code>generate_schema_name</code>{" "}macro derives
          the schema from the folder path —{" "}
          <code>models/modelling/olids/diagnoses/</code>{" "}builds into{" "}
          <code>MODELLING.OLIDS_DIAGNOSES</code>{" "}with no config at all. Creating a
          folder is creating a schema.
        </p>
      </Callout>

      <Callout kind="warn" title="Touching dbt_project.yml is a wide-radius change">
        <p>
          A one-line edit here can re-materialise hundreds of models. If your change
          needs it, say so prominently in the PR — and expect the review to involve more
          people than usual.
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt:
              "A model file has config(materialized='view') but its folder sets +materialized: table. What builds?",
            options: [
              "A table — dbt_project.yml takes precedence over model files",
              "A view — the model-level config() is most specific and wins",
              "dbt warns about the conflict and falls back to the project default",
              "Whichever setting was added to the repo more recently",
            ],
            answer: 1,
            explain:
              "There is no conflict warning — overriding is the designed behaviour. Specificity decides: model config() beats folder config beats project default.",
          },
          {
            prompt: "Moving a model file between layer folders can change…",
            options: [
              "Its schema only — materialisation is always set per model",
              "Its materialisation, database, schema, tags and post-hooks — all at once",
              "Nothing — configuration travels with the file's config() block",
              "Its tags and docs grouping, but not where it builds",
            ],
            answer: 1,
            explain:
              "Most models carry no config() block at all — the folder supplies everything. Move the file and it inherits the new folder's full configuration, including where it builds.",
          },
        ]}
      />
    </LessonShell>
  );
}
