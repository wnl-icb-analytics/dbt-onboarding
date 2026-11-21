import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Macros" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="macros"
      kicker="Going further 02"
      title="Macros"
      lede="Organisation codes, age bands, deduplication — the same cleaning logic is needed in model after model. Macros define it once so every model agrees."
      minutes={5}
    >
      <h2>SQL functions, written in Jinja</h2>
      <p>
        A macro is a reusable snippet of SQL with parameters. Anything between{" "}
        <code>{"{% … %}"}</code>{" "}or <code>{"{{ … }}"}</code>{" "}in a model is Jinja — dbt
        renders it to plain SQL before Snowflake sees it. You have been using macros
        from the start: <code>ref()</code>{" "}and <code>source()</code>{" "}are macros. The
        project keeps shared ones in <code>macros/</code>.
      </p>

      <h2>A familiar pain point: organisation codes</h2>
      <p>
        Provider, practice and ICB codes arrive in inconsistent forms. Feeds often carry
        site-level codes with suffixes (<code>RRP00</code>) where reference data holds
        the parent organisation (<code>RRP</code>) — so joins to the organisation
        dictionary quietly return nothing. The project handles this once, in a macro:
      </p>
      <CodeBlock
        lang="sql"
        title="any model that joins on organisation codes"
        code={`
select
    {{ clean_organisation_id('provider_code') }} as provider_code,
    ...
from {{ ref('stg_some_activity_feed') }}
`}
      />
      <p>
        <code>clean_organisation_id()</code>{" "}keeps the code if it is a recognised
        organisation, and otherwise falls back to the 3-character parent code. Every
        model that uses it resolves codes the same way — and when the rule needs to
        change, it changes in one place.
      </p>

      <h2>Another example: age attributes</h2>
      <p>
        The same principle applies to derivations. Instead of each model defining its
        own age bands:
      </p>
      <CodeBlock
        lang="sql"
        code={`
select
    person_id,
    {{ calculate_age_attributes('birth_date', 'current_date()') }}
from {{ ref('stg_olids_patient') }}
`}
      />
      <p>
        One call expands into <code>age</code>, <code>age_band_5y</code>,{" "}
        <code>age_band_10y</code>, <code>age_band_nhs</code>, <code>age_band_ons</code>,{" "}
        <code>life_stage</code>{" "}and school-age flags — consistent across every model,
        with the band boundaries defined once.
      </p>

      <h2>The ones you will reach for</h2>
      <table>
        <thead>
          <tr>
            <th>Macro</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>clean_organisation_id()</code>
            </td>
            <td>Resolves organisation codes against the dictionary, with a parent-code fallback</td>
          </tr>
          <tr>
            <td>
              <code>clean_icd10_code()</code>
            </td>
            <td>Standardises ICD-10 codes before joining to reference data</td>
          </tr>
          <tr>
            <td>
              <code>calculate_age_attributes()</code>
            </td>
            <td>Age plus every standard age band and life stage</td>
          </tr>
          <tr>
            <td>
              <code>deduplicate_table()</code>
            </td>
            <td>Removes duplicate rows by key and ordering rule</td>
          </tr>
          <tr>
            <td>
              <code>join_concept_display()</code>
            </td>
            <td>Joins clinical concept codes to display terms</td>
          </tr>
          <tr>
            <td>
              <code>temporal_join()</code>
            </td>
            <td>“What was true at the time” joins against effective-dated tables</td>
          </tr>
          <tr>
            <td>
              <code>qof_reference_date()</code>
            </td>
            <td>The current QOF reference date, overridable with --vars</td>
          </tr>
        </tbody>
      </table>

      <h2>Writing your own</h2>
      <p>
        A macro definition is the SQL you would have written, with the varying parts
        as parameters. A realistic small example — a standard “not yet ended” filter
        used across effective-dated reference tables:
      </p>
      <CodeBlock
        lang="sql"
        title="macros/transformations/is_active_record.sql (illustrative)"
        code={`
{% macro is_active_record(start_date_col, end_date_col, as_of='current_date()') %}
    {{ start_date_col }} <= {{ as_of }}
    and ({{ end_date_col }} is null or {{ end_date_col }} > {{ as_of }})
{% endmacro %}
`}
      />
      <CodeBlock
        lang="sql"
        title="used in a model"
        code={`
select organisation_code, organisation_name
from {{ ref('stg_dictionary_dbo_organisation') }}
where {{ is_active_record('open_date', 'close_date') }}
`}
      />
      <p>Practical notes when writing one:</p>
      <ul>
        <li>
          <strong>Parameters arrive as text.</strong>{" "}
          <code>start_date_col</code>{" "}is the string <code>open_date</code>{" "}pasted into
          the SQL — the macro never sees data, only names. Defaults (like{" "}
          <code>as_of</code>{" "}above) keep the common case short.
        </li>
        <li>
          <strong>Debug with <code>dbt compile</code>.</strong>{" "}If a macro misbehaves,
          read the rendered SQL — the mistake is usually visible immediately in the
          expansion.
        </li>
        <li>
          <strong>Navigate with the editor.</strong>{" "}In VS Code, go-to-definition on
          any macro call opens its source — the fastest way to learn what the existing
          macros actually do.
        </li>
        <li>
          <strong>Place it with its peers.</strong>{" "}Shared macros live in{" "}
          <code>macros/</code>, grouped by purpose (<code>transformations/</code>,{" "}
          <code>governance/</code>, <code>qof_registers/</code>…). A macro used by one
          model probably should not exist yet — inline it until the rule of three says
          otherwise.
        </li>
      </ul>

      <h2>The two mistakes everyone makes first</h2>
      <p>
        <strong>Nesting curlies.</strong>{" "}Once you are inside{" "}
        <code>{"{{ … }}"}</code>{" "}or <code>{"{% … %}"}</code>, you are already in
        Jinja — opening another pair does not evaluate anything, it passes the
        literal text. So a macro that takes a model as an argument is called with{" "}
        <code>ref()</code>{" "}bare:
      </p>
      <CodeBlock
        lang="sql"
        code={`
{{ deduplicate_table(ref('stg_olids_patient'), 'person_id') }}   -- right
{{ deduplicate_table("{{ ref('stg_olids_patient') }}", ...) }}   -- passes literal text
`}
      />
      <p>
        <strong>Missing quotes.</strong>{" "}Column names passed to a macro are
        strings and need quoting:{" "}
        <code>{"{{ calculate_age_attributes('birth_date') }}"}</code>. Without the
        quotes, Jinja looks for a <em>variable</em>{" "}called{" "}
        <code>birth_date</code>, finds nothing, and renders nothing — which
        surfaces later as baffling SQL rather than a helpful error. When either
        mistake has you stuck, <code>dbt compile</code>{" "}and read what was
        actually rendered.
      </p>

      <Callout kind="tip" title="The rule of three — and its counterweight">
        <p>
          Pasting the same logic into a third model is the signal to stop — it should
          become a macro (or an <code>int_</code>{" "}model, if it is more data than logic).
          First check whether <code>dbt_utils</code>{" "}already provides it. And dbt&apos;s
          own counterweight applies: a model made of macro calls is harder to read than
          one with a little repeated SQL, so favour readability when the abstraction
          saves only a line or two.
        </p>
      </Callout>

      <Callout kind="warn">
        <p>
          Macros are rendered <em>before</em>{" "}the SQL runs — they can respond to
          arguments and project configuration, but not to data. Logic that needs to read
          rows to make decisions belongs in a model, not a macro.
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt: "When does macro Jinja get evaluated?",
            options: [
              "At query time, inside Snowflake, like a SQL function",
              "At compile time, before the SQL is sent to Snowflake",
              "After the model runs, to post-process the results",
              "Once, when the package is installed with dbt deps",
            ],
            answer: 1,
            explain:
              "A macro looks like a function call but is template expansion — dbt renders it to plain SQL before Snowflake is involved. dbt compile shows the rendered result.",
          },
          {
            prompt:
              "A provider code column contains site-level codes that fail to join the organisation dictionary. The project-standard fix is…",
            options: [
              "left(provider_code, 3) written inline in your model",
              "clean_organisation_id(), so every model resolves codes the same way",
              "A where clause excluding unmatched codes",
              "Editing the dictionary",
            ],
            answer: 1,
            explain:
              "An inline left(…, 3) works until the rule needs to change — then every copy needs finding. The macro is the single agreed definition.",
          },
        ]}
      />
    </LessonShell>
  );
}
