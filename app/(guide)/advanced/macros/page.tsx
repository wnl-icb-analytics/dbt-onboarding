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
      kicker="Going further 03"
      title="Macros"
      lede="A macro is a reusable piece of Jinja that writes SQL for you. The project keeps logic that many models share, like cleaning organisation codes and working out age bands, in macros. When a rule changes, it changes in one file, and every model that calls the macro picks it up."
      minutes={6}
    >
      <h2>A macro writes SQL for you</h2>
      <p>
        A macro is a reusable piece of Jinja that dbt turns into SQL when it
        compiles your model. It takes parameters, so one macro can serve many
        models. Anything inside{" "}
        <code>{"{% … %}"}</code>{" "}or <code>{"{{ … }}"}</code>{" "}in a model is
        Jinja, a templating language. dbt renders the Jinja into plain SQL before
        Snowflake sees anything. You&apos;ve been using macros since your first
        model, because <code>ref()</code>{" "}and <code>source()</code>{" "}are macros
        too. The
        project keeps its shared ones in <code>macros/</code>.
      </p>

      <h2>clean_organisation_id() makes organisation codes join</h2>
      <p>
        <code>clean_organisation_id()</code>{" "}turns the organisation codes in a feed
        into the codes the reference data uses, so your joins find a match. Use it
        whenever a model joins on provider, practice or ICB codes.
      </p>
      <p>
        The codes arrive in different forms. Feeds often carry site-level codes
        with a suffix, like <code>RRP00</code>, while the reference data holds the
        parent organisation, <code>RRP</code>. Join one to the other and you get no
        match, with no error to tell you. Call the macro instead:
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
        <code>clean_organisation_id()</code>{" "}checks the code against the
        organisation dictionary. If it&apos;s there, the code is kept. If not, the
        macro falls back to the first three characters, the parent code. Every
        model that calls it resolves codes the same way. When the rule changes, it
        changes in one file.
      </p>
      <p>
        To see what dbt actually sends, run <code>dbt compile</code>. That one line
        becomes a <code>case</code>{" "}expression:
      </p>
      <CodeBlock
        lang="sql"
        title="what the macro call renders to (simplified)"
        code={`
case
    when provider_code in (
        select organisation_code
        from STAGING.DICTIONARY.STG_DICTIONARY_DBO_ORGANISATION
        where SK_ORGANISATION_TYPE_ID = 41
    )
    then provider_code
    else left(provider_code, 3)
end as provider_code
`}
      />

      <h2>calculate_age_attributes() adds age and the standard age bands</h2>
      <p>
        <code>calculate_age_attributes()</code>{" "}takes a date of birth and a
        reference date. It writes the SQL for age and the project&apos;s standard age
        bands, so you don&apos;t write your own:
      </p>
      <CodeBlock
        lang="sql"
        code={`
select
    person_id,
    {{ calculate_age_attributes('birth_date', 'current_date()') }}
from {{ ref('some_person_model') }}
`}
      />
      <p>
        That one call expands into <code>age</code>, <code>age_band_5y</code>,{" "}
        <code>age_band_10y</code>, <code>age_band_nhs</code>,{" "}
        <code>age_band_ons</code>, <code>age_life_stage</code>{" "}and school-age
        flags. The band boundaries live in the macro, so they match in every model
        that calls it.
      </p>

      <h2>Shared macros you&apos;ll use most</h2>
      <p>
        These macros live in <code>macros/</code>, and any model can call them.
      </p>
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
            <td>Resolves organisation codes against the dictionary, falling back to the parent code</td>
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
            <td>Age plus the standard age bands and life stage</td>
          </tr>
          <tr>
            <td>
              <code>deduplicate_table()</code>
            </td>
            <td>Keeps one row per key, chosen by an ordering rule</td>
          </tr>
          <tr>
            <td>
              <code>join_concept_display()</code>
            </td>
            <td>Joins clinical concept codes to their display terms</td>
          </tr>
          <tr>
            <td>
              <code>temporal_join()</code>
            </td>
            <td>Joins each row to the version of a dimension that was valid on its date</td>
          </tr>
          <tr>
            <td>
              <code>qof_reference_date()</code>
            </td>
            <td>The QOF reference date, which you can override with --vars</td>
          </tr>
        </tbody>
      </table>

      <h2>Writing your own macro</h2>
      <p>
        A macro definition is the SQL you would have written anyway, with the parts
        that vary turned into parameters. Here&apos;s a realistic small one, a
        standard &quot;not yet ended&quot; filter for reference tables that have
        start and end dates:
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
      <p>A few things to know when you write one.</p>
      <ul>
        <li>
          <strong>Parameters arrive as text.</strong>{" "}Here,{" "}
          <code>start_date_col</code>{" "}is the string <code>open_date</code>, pasted
          into the SQL. The macro never sees data, only names. A default value, like{" "}
          <code>as_of</code>{" "}above, keeps the common case short.
        </li>
        <li>
          <strong>
            Debug with <code>dbt compile</code>.
          </strong>{" "}
          If a macro misbehaves, read the SQL it rendered. The mistake is usually
          obvious once you see the expansion.
        </li>
        <li>
          <strong>Let the editor take you to the source.</strong>{" "}In VS Code,
          go-to-definition on a macro call opens the macro&apos;s file. It&apos;s
          the quickest way to learn what the existing macros really do.
        </li>
        <li>
          <strong>Put it next to similar macros.</strong>{" "}Shared macros live in{" "}
          <code>macros/</code>, grouped by purpose: <code>transformations/</code>,{" "}
          <code>governance/</code>, <code>qof_registers/</code>{" "}and so on. A macro
          that only one model uses probably shouldn&apos;t exist yet. Keep the SQL
          in that model until a third copy is about to appear.
        </li>
      </ul>

      <h2>Pass models as bare ref() calls and columns in quotes</h2>
      <p>
        When you call a macro, pass a model as a bare <code>ref()</code>{" "}and a
        column name as a quoted string. Get either wrong and the macro writes broken
        SQL, often without a clear error.
      </p>
      <p>
        <strong>Nesting curly braces.</strong>{" "}Once you&apos;re inside{" "}
        <code>{"{{ … }}"}</code>{" "}or <code>{"{% … %}"}</code>, you&apos;re already
        writing Jinja. Opening another pair inside doesn&apos;t evaluate anything.
        Inside a string it&apos;s just characters, and the macro receives that literal
        text. So when a macro takes a model as an argument, call <code>ref()</code>{" "}
        bare:
      </p>
      <CodeBlock
        lang="sql"
        code={`
{{ deduplicate_table(ref('stg_olids_patient'), ['person_id'], ['lds_transform_datetime']) }}   -- right
{{ deduplicate_table("{{ ref('stg_olids_patient') }}", ...) }}   -- passes literal text
`}
      />
      <p>
        <strong>Missing quotes.</strong>{" "}Column names you pass to a macro are
        strings, so they need quotes:{" "}
        <code>{"{{ calculate_age_attributes('birth_date', 'current_date()') }}"}</code>.
        Leave the quotes off and Jinja reads <code>birth_date</code>{" "}as the name of
        a Jinja <em>variable</em>, not a column. There&apos;s no such variable, so
        the macro gets an empty value and writes broken SQL. You find out later, from
        a confusing Snowflake error, rather than from a clear message. When either
        mistake has you stuck, run <code>dbt compile</code>{" "}and read what was
        rendered.
      </p>

      <Callout kind="tip" title="The rule of three, and its counterweight">
        <p>
          When you&apos;re about to paste the same logic into a third model, stop. It
          should become a macro, or an <code>int_</code>{" "}model if it&apos;s more
          data than logic. Check first whether <code>dbt_utils</code>{" "}already does
          it. dbt&apos;s own counterweight applies too. A model made of macro calls is
          harder to read than one with a little repeated SQL. If the macro only saves
          a line or two, favour readability.
        </p>
      </Callout>

      <Callout kind="warn">
        <p>
          Macros are rendered <em>before</em>{" "}the SQL runs. They can respond to
          their arguments and to project configuration, but they can&apos;t look at
          the rows your model is about to produce. Logic that decides row by row
          belongs in the SQL itself.
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
              "A macro looks like a function call, but it's template expansion. dbt renders it to plain SQL before Snowflake is involved. dbt compile shows you the result.",
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
              "An inline left(…, 3) works until the rule needs to change. Then someone has to find every copy. The macro is the one agreed definition.",
          },
        ]}
      />
    </LessonShell>
  );
}
