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
      kicker="Going further 06"
      title="Project configuration"
      lede="dbt_project.yml sets defaults for models by folder. That's why a SQL file you put in staging builds as a view, in the right database and schema, owned by the right role, with no config of its own."
      minutes={8}
    >
      <h2>dbt_project.yml configures models by folder</h2>
      <p>
        <code>dbt_project.yml</code>{" "}sits at the root of the repo. It configures
        models by <strong>folder path</strong>. Here&apos;s a cut-down version of
        ours:
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
    +post-hook:
      - "{{ grant_ownership_with_copy() }}"
      - "{{ set_managed_by_tag() }}"

    raw:
      +materialized: view
      +database: "STAGING"
      +schema: "DBT_RAW"
      +tags: ["raw"]

    staging:
      +materialized: view         # staging overrides the default
      +database: "STAGING"
      +tags: ["staging", "daily"]

    reporting:
      +database: "REPORTING"
      +tags: ["reporting"]
      olids:
        risk_stratification:
          +schema: "RISK_STRATIFICATION"

    published:
      +tags: ["published_reporting"]
      direct_care:
        +database: "PUBLISHED_REPORTING__DIRECT_CARE"
      secondary_use:
        +database: "PUBLISHED_REPORTING__SECONDARY_USE"
`}
      />
      <p>
        Read it from the top down. Each key without a <code>+</code>{" "}is a folder
        under <code>models/</code>, and each key with one is a setting. Settings flow
        down from the project to each folder and its subfolders. So a model in{" "}
        <code>models/staging/olids/</code>{" "}picks up <code>+materialized: view</code>{" "}
        from <code>staging</code>, and <code>+post-hook</code>{" "}from the project
        level.
      </p>
      <p>
        Raw is the only layer with one fixed schema, <code>STAGING.DBT_RAW</code>.
        Most other models don&apos;t set a schema at all. A custom macro works it out
        from the folder, as the next section explains.
      </p>

      <h2>A model&apos;s folder decides its schema</h2>
      <p>
        Most models get their Snowflake schema from the folder they sit in. The
        project overrides dbt&apos;s <code>generate_schema_name</code>{" "}macro to do
        this:
      </p>
      <ul>
        <li>
          Staging models go into a schema named after their source folder.{" "}
          <code>models/staging/olids/</code>{" "}builds into <code>STAGING.OLIDS</code>.
        </li>
        <li>
          Modelling and reporting models use their domain folder.{" "}
          <code>models/modelling/acute/</code>{" "}builds into{" "}
          <code>MODELLING.ACUTE</code>.
        </li>
        <li>
          OLIDS adds the subfolder too. <code>models/modelling/olids/diagnoses/</code>{" "}
          builds into <code>MODELLING.OLIDS_DIAGNOSES</code>.
        </li>
        <li>
          An explicit <code>+schema</code>, like <code>RISK_STRATIFICATION</code>{" "}
          above, always wins.
        </li>
      </ul>
      <p>
        In practice, creating a folder creates a schema. Dev builds keep the same
        schema names and use a separate dev database instead.
      </p>

      <h2>The closest setting wins</h2>
      <p>When the same setting appears in more than one place, the closest to the model wins:</p>
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
            <td>
              <code>config:</code>{" "}in the model&apos;s <code>.yml</code>{" "}file
            </td>
            <td>
              <code>config: {"{"}materialized: view{"}"}</code>
            </td>
            <td>dbt_project.yml</td>
          </tr>
          <tr>
            <td>Subfolder in dbt_project.yml</td>
            <td>
              <code>staging: +materialized: view</code>
            </td>
            <td>the folders above it, and the project default</td>
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
        Most settings work like that. The closer value replaces the further one. Three
        don&apos;t. <code>tags</code>{" "}and hooks <strong>add up</strong>. A staging
        model gets <code>staging</code>{" "}and <code>daily</code>{" "}from its folder
        plus any tags in its own config, and it runs the project&apos;s post-hooks
        and the staging ones. <code>meta</code>{" "}merges its top-level keys, so a
        model can add an <code>owner</code>{" "}without losing the folder&apos;s{" "}
        <code>custom_message</code>.
      </p>
      <p>
        This is why your staging model file holds only a SELECT. Its location does
        the configuring. It&apos;s also why{" "}
        <strong>putting a file in the right folder is a real decision</strong>. One
        move sets its materialisation, database, schema, tags and post-hooks.
      </p>

      <h2>Scheduled builds select models by tag</h2>
      <p>
        The scheduled builds use tags to choose which models to build, so a
        folder&apos;s tags decide when its models refresh. The daily build selects{" "}
        <code>+tag:daily</code>, which means every model tagged <code>daily</code>{" "}
        plus everything upstream of it. It also adds everything downstream of the
        OLIDS source, of each snapshot and of models tagged{" "}
        <code>indicator_definitions</code>.
      </p>
      <p>
        The Monday build is wider. It takes everything upstream and downstream of
        staging, plus everything downstream of the indicator definitions, so it
        catches models the daily selection misses. Both skip models tagged{" "}
        <code>monthly-full</code>, which wait for the full refresh on the 1st. You
        can select by tag yourself:
      </p>
      <CodeBlock
        lang="bash"
        code={`
dbt build -s tag:daily          # every model tagged daily
dbt ls -s tag:reporting         # list models carrying a tag
`}
      />

      <h2>Variables give one value you can override per run</h2>
      <p>
        A variable is a value defined once in <code>dbt_project.yml</code>{" "}that
        you can override for a single run. Reference dates are the main example
        here. <code>qof_reference_date</code>{" "}sits under <code>vars:</code>, and
        the{" "}
        <code>qof_reference_date()</code>{" "}macro reads it. The point-in-time
        register views, such as <code>pit_diabetes_register</code>, call it instead
        of hardcoding a date. The <code>fct_person_*_register</code>{" "}tables
        don&apos;t. They use <code>CURRENT_DATE()</code>, so the variable has no
        effect on them. To rebuild a PIT register as of a different date, override
        the variable on the command line:
      </p>
      <CodeBlock
        lang="bash"
        code={`
dbt build -s pit_diabetes_register --vars '{"qof_reference_date": "2025-03-31"}'
`}
      />
      <p>
        The view writes the date it used into its <code>reference_date</code>{" "}
        column. Select that column from your dev copy to confirm the override
        took.
      </p>
      <p>
        You get one definition in normal use and an explicit override when you need
        to rewind. The override shows in the command, rather than hiding in an edited
        file.
      </p>

      <h2>Post-hooks apply governance to every model</h2>
      <p>
        A post-hook is SQL that dbt runs straight after it builds a model. The
        project-level hooks run after every model.{" "}
        <code>grant_ownership_with_copy()</code>{" "}hands ownership to the analyst role
        so the team can manage the object. <code>set_managed_by_tag()</code>{" "}sets a
        Snowflake tag marking it as built by dbt-analytics. Most layers add{" "}
        <code>add_model_comment()</code>{" "}on top, and the table layers add{" "}
        <code>log_row_count()</code>. Hooks add up, so a model runs all of them. You get all of this without writing a line.
      </p>

      <Callout kind="warn" title="A change to dbt_project.yml reaches a lot of models">
        <p>
          A one-line edit here can rebuild hundreds of models in a different way. If
          your change needs it, say so clearly in the PR, and expect more people than
          usual to review it.
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt:
              "A model file has config(materialized='view') but its folder sets +materialized: table. What builds?",
            options: [
              "A table. dbt_project.yml takes precedence over model files",
              "A view. The model-level config() is closest to the model and wins",
              "dbt warns about the conflict and falls back to the project default",
              "Whichever setting was added to the repo more recently",
            ],
            answer: 1,
            explain:
              "There's no conflict warning, because overriding is how it's designed to work. The closest setting wins: model config(), then the model's YAML, then the folder, then the project default.",
          },
          {
            prompt: "Moving a model file between layer folders can change…",
            options: [
              "Its schema only. Materialisation is always set per model",
              "Its materialisation, database, schema, tags and post-hooks, all at once",
              "Nothing. Configuration travels with the file's config() block",
              "Its tags and docs grouping, but not where it builds",
            ],
            answer: 1,
            explain:
              "Most models have no config() block. The folder supplies everything. Move the file and it takes on the new folder's settings, including where it builds.",
          },
        ]}
      />
    </LessonShell>
  );
}
