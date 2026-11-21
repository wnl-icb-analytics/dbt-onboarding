import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Semantic views" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="semantic-views"
      kicker="Going further 07"
      title="Semantic views"
      lede="The sixth layer: instead of producing rows, a semantic view declares what the data means — facts, dimensions, metrics and how tables relate — so query tools can't get the joins wrong."
      minutes={9}
    >
      <h2>Why declare meaning?</h2>
      <p>
        A reporting table answers questions if you already know how to query it: which
        column is the grain, which flags are QOF registers, how tables join. A{" "}
        <strong>Snowflake semantic view</strong>{" "}writes that knowledge down as part of
        the pipeline. Once defined, any consumer — BI tools, or the semantic layer chat
        interface the team is developing — can compose correct queries from named
        metrics instead of guessing at joins.
      </p>

      <h2>Joins are the hard part</h2>
      <p>
        To see why this matters, watch what happens when a tool — or an AI agent — is
        pointed at the warehouse with no semantic layer. It can read table and column
        names, so simple single-table queries usually work. Joins are where it breaks
        down, because the information a correct join needs is not written anywhere it
        can see:
      </p>
      <ul>
        <li>
          <strong>Which columns are the keys?</strong>{" "}Nothing in the schema says{" "}
          <code>person_id</code>{" "}is the primary key of{" "}
          <code>dim_person_demographics</code>. An agent guessing from column names
          might join on <code>sk_patient_id</code>{" "}in one place and{" "}
          <code>person_id</code>{" "}in another — both look plausible.
        </li>
        <li>
          <strong>Which direction is one-to-many?</strong>{" "}Join a one-row-per-person
          dimension to a many-rows-per-person observation table and count people:
          every patient is now counted once per observation. The query runs, returns
          confident numbers, and is wrong — the classic <strong>fan-out</strong>, and
          nothing in the warehouse flags it.
        </li>
        <li>
          <strong>Which tables should join at all?</strong>{" "}Two tables sharing a
          column name is not evidence they are meant to be joined, but it is exactly
          the evidence an agent uses. Worse, tables that <em>do</em>{" "}share a key can
          sit over very different populations — a <code>person_id</code>{" "}in a GP
          registration table and the same column in an acute activity table cover
          different people, on different inclusion rules. Join them naively and the
          result is not “the population” but their accidental overlap, with no error
          to tell you so.
        </li>
      </ul>
      <p>
        A human analyst avoids these traps with knowledge held in their head. The
        semantic view moves that knowledge into the warehouse:{" "}
        <code>PRIMARY KEY</code>{" "}declarations say what the grain is,{" "}
        <code>RELATIONSHIPS</code>{" "}say what references what, and a consumer derives
        joins from the declarations instead of guessing. The fan-out case stops being
        possible to write by accident, because the metric&apos;s aggregation is
        defined against the right grain.
      </p>

      <h2>What one looks like</h2>
      <p>
        Semantic views live in <code>models/semantic/</code>, prefixed{" "}
        <code>sem_</code>, materialised as <code>semantic_view</code>. Instead of a
        SELECT, the body declares structure (abridged from{" "}
        <code>sem_olids_population</code>):
      </p>
      <CodeBlock
        lang="sql"
        title="models/semantic/sem_olids_population.sql (abridged from the real view)"
        code={`
{{
    config(
        materialized='semantic_view',
        schema='SEMANTIC'
    )
}}

TABLES(
    demographics AS {{ ref('dim_person_demographics') }}
        PRIMARY KEY (person_id)
        COMMENT = 'Core patient demographics: registration, geography, ethnicity',
    conditions AS {{ ref('dim_person_conditions') }}
        PRIMARY KEY (person_id)
        COMMENT = 'Boolean flags for all LTC registers (QOF Business Rules v50)',
    ccms AS {{ ref('dim_person_ccms') }}
        PRIMARY KEY (person_id)
        COMMENT = 'Cambridge Comorbidity Score. Continuous score only — the
                   literature defines no risk bands. Persons aged 16+ only.'
)

RELATIONSHIPS(
    conditions (person_id) REFERENCES demographics,
    ccms (person_id) REFERENCES demographics
)

FACTS(
    demographics.age AS age COMMENT = 'Current age in years',
    conditions.total_conditions AS total_conditions
        COMMENT = 'Total number of active conditions',
    ccms.cambridge_comorbidity_score AS cambridge_comorbidity_score
        WITH SYNONYMS = ('CCMS', 'comorbidity score', 'Cambridge score')
        COMMENT = 'Higher = greater comorbidity burden; can be negative.',
    demographics.esp_weight AS esp_weight
        COMMENT = 'ESP 2013 weight for this person''s age band. Use with
                   age_band_esp for age-standardised rates.'
)

DIMENSIONS(
    demographics.gender AS gender COMMENT = 'Patient gender (Male, Female, Unknown)',
    demographics.age_band_nhs AS age_band_nhs COMMENT = 'NHS Digital standard age bands',
    demographics.borough_registered AS borough_registered
        COMMENT = 'Borough where the registered GP practice is located',
    demographics.registered_pcn_name AS pcn_name
        WITH SYNONYMS = ('PCN', 'primary care network')
        COMMENT = 'PCN name of the registered practice'
)

METRICS(
    demographics.patient_count AS COUNT(DISTINCT demographics.person_id)
        COMMENT = 'Total number of patients',
    demographics.active_patient_count AS COUNT(DISTINCT CASE
        WHEN demographics.is_active THEN demographics.person_id END)
        COMMENT = 'Currently registered patients',
    conditions.diabetes_count AS COUNT(DISTINCT CASE
        WHEN conditions.has_diabetes THEN conditions.person_id END)
        COMMENT = 'Patients with diabetes (all types)'
)
`}
      />
      <p>The pieces:</p>
      <ul>
        <li>
          <strong>TABLES</strong> — which reporting models participate, with primary
          keys. Note they are still <code>ref()</code>s: semantic views sit on top of
          the reporting layer in the same DAG.
        </li>
        <li>
          <strong>RELATIONSHIPS</strong> — how they join, declared once, correctly.
        </li>
        <li>
          <strong>FACTS</strong> — row-level numeric attributes at the table&apos;s
          grain: an age, a condition count, a score. Facts are the raw material
          metrics aggregate; a consumer can also read them directly.
        </li>
        <li>
          <strong>DIMENSIONS</strong> — categorical attributes to slice by, each
          with a comment explaining what it means.
        </li>
        <li>
          <strong>METRICS</strong> — named, agreed aggregations over the facts.
          “Diabetes count” is defined exactly once; every consumer gets the same
          number.
        </li>
        <li>
          <strong>SYNONYMS</strong> — the other names people use. A question
          about “PCN” or “comorbidity score” resolves to the right field even
          though neither is the column name.
        </li>
      </ul>

      <h2>Querying one yourself</h2>
      <p>
        These are queryable today, with regular SQL — analysts use the same
        views the tools do. A semantic view changes the rules of the query
        rather than the language: the joins come from the declarations, metrics
        arrive pre-defined, and you ask for them with{" "}
        <code>AGG()</code>:
      </p>
      <CodeBlock
        lang="sql"
        title="diabetes count by borough — no join written"
        code={`
SELECT
    borough_registered,
    AGG(active_patient_count) AS active_patients,
    AGG(diabetes_count) AS diabetes_patients
FROM REPORTING.SEMANTIC.SEM_OLIDS_POPULATION
WHERE is_active = TRUE
GROUP BY borough_registered
HAVING AGG(patient_count) > 5;
`}
      />
      <p>The quirks worth knowing before your first attempt:</p>
      <ul>
        <li>
          <strong>Metrics are wrapped in <code>AGG()</code></strong>{" "}— the
          view supplies the aggregation; <code>AGG(diabetes_count)</code>{" "}
          asks for it at your chosen grouping. Facts use ordinary functions
          (<code>AVG(age)</code>), never <code>AGG()</code>.
        </li>
        <li>
          <strong>Every selected dimension must appear in{" "}
          <code>GROUP BY</code></strong>, and a metric cannot appear in{" "}
          <code>WHERE</code>{" "}— filter on metrics with{" "}
          <code>HAVING AGG(metric)</code>.
        </li>
        <li>
          <strong>Never alias the view</strong>{" "}(<code>FROM … AS t</code>{" "}
          fails) or prefix its columns as <code>t.column</code>{" "}— use bare
          column names.
        </li>
        <li>
          <strong>No joins, subqueries, windows or pivots in the same query
          block as the view.</strong>{" "}Isolate each semantic-view query in a
          CTE; ordinary SQL — joins, aliases, window functions — is fine over
          the CTE results.
        </li>
      </ul>

      <h3>Joining views</h3>
      <p>
        Cross-view questions — “people with X who also had Y” — follow one
        pattern: read each view in its own person-grain CTE, join the CTE
        results on the linkage key, and aggregate only at the end. OLIDS views
        link to each other on <code>person_id</code>; non-OLIDS views (SUS
        activity, cost, resource) are reached through the population
        view&apos;s <code>sk_patient_id</code>{" "}bridge.
      </p>
      <CodeBlock
        lang="sql"
        title="the cross-view pattern"
        code={`
WITH cohort AS (
    SELECT person_id, borough_registered
    FROM REPORTING.SEMANTIC.SEM_OLIDS_POPULATION
    WHERE is_active = TRUE AND has_diabetes = TRUE
    GROUP BY person_id, borough_registered
), events AS (
    SELECT person_id
    FROM REPORTING.SEMANTIC.SEM_OLIDS_APPOINTMENTS
    WHERE is_dna = TRUE
    GROUP BY person_id
)
SELECT
    c.borough_registered,
    COUNT(DISTINCT c.person_id) AS denominator,
    COUNT(DISTINCT e.person_id) AS numerator
FROM cohort AS c
LEFT JOIN events AS e ON c.person_id = e.person_id
GROUP BY c.borough_registered
HAVING COUNT(DISTINCT c.person_id) > 5;
`}
      />
      <p>
        Three habits from the team&apos;s guidance are worth copying: suppress
        every released aggregate at <code>&gt; 5</code>; count people with{" "}
        <code>COUNT(DISTINCT …)</code>{" "}so linkage can never inflate a
        headcount; and keep <code>person_id</code>{" "}and{" "}
        <code>sk_patient_id</code>{" "}out of final output — they exist for
        joining, not releasing. Snowflake&apos;s documentation also describes a{" "}
        <code>SEMANTIC_VIEW(...)</code>{" "}clause form of query; it works, but
        the project&apos;s guidance uses the plain form above.
      </p>

      <h2>What exists today</h2>
      <p>
        Fourteen views cover the estate, named{" "}
        <code>sem_</code>{" "}plus their domain:
      </p>
      <table>
        <thead>
          <tr>
            <th>View</th>
            <th>What it answers questions about</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>sem_olids_population</code></td>
            <td>The registered population: demographics sliced by condition registers</td>
          </tr>
          <tr>
            <td><code>sem_olids_trends</code></td>
            <td>Population change over time, at person-month grain</td>
          </tr>
          <tr>
            <td><code>sem_olids_conditions</code></td>
            <td>Condition registers in detail — current membership and episodes</td>
          </tr>
          <tr>
            <td><code>sem_olids_observations</code></td>
            <td>Latest clinical observations per person</td>
          </tr>
          <tr>
            <td><code>sem_olids_observations_history</code></td>
            <td>The full observation history behind those latest values</td>
          </tr>
          <tr>
            <td><code>sem_olids_diabetes_care</code></td>
            <td>Diabetes care processes, treatment targets and foot checks</td>
          </tr>
          <tr>
            <td><code>sem_olids_prescribing</code></td>
            <td>GP prescribing</td>
          </tr>
          <tr>
            <td><code>sem_olids_appointments</code></td>
            <td>GP appointments</td>
          </tr>
          <tr>
            <td><code>sem_olids_vaccinations</code></td>
            <td>COVID and flu uptake by person, campaign and risk group</td>
          </tr>
          <tr>
            <td><code>sem_olids_screening</code></td>
            <td>Bowel, breast and cervical screening programme cohorts</td>
          </tr>
          <tr>
            <td><code>sem_olids_ltc_lcs</code></td>
            <td>LTC case-finding candidates and their programme indicators</td>
          </tr>
          <tr>
            <td><code>sem_sus_acute_activity</code></td>
            <td>Acute activity: admission spells, A&amp;E attendances, outpatient appointments</td>
          </tr>
          <tr>
            <td><code>sem_cost_index</code></td>
            <td>Costed activity per patient-month by service grouping</td>
          </tr>
          <tr>
            <td><code>sem_resource_index</code></td>
            <td>Actual versus expected resource use for the registered population</td>
          </tr>
        </tbody>
      </table>
      <p>
        Their descriptions do working duty, not just documentation:{" "}
        <code>sem_olids_conditions</code>{" "}warns that its two grains must not
        be mixed, and <code>sem_olids_vaccinations</code>{" "}states that
        headcounts must count distinct people. A tool reading the view learns
        the traps as well as the joins.
      </p>

      <h2>Who consumes them</h2>
      <p>
        Analysts already can, as above. BI tools are the second consumer:
        Tableau and Sigma read Snowflake semantic views natively, and Snowsight
        can export a view as a Tableau data source, so a dashboard can sit on
        the governed metric definitions rather than rebuilding them. Snowflake&apos;s
        own Cortex Analyst would be the other natural consumer — it answers
        plain-English questions directly from these declarations — but it is
        not currently enabled for our account.
      </p>
      <p>
        The team&apos;s semantic-layer chat prototype (not yet generally
        available) shows the machinery end to end. A plain-English question is
        first <strong>routed</strong>{" "}to one view: each view carries a short
        description of the questions it serves — current cohort questions to{" "}
        <code>sem_olids_population</code>, trajectories and recheck intervals
        to <code>sem_olids_observations_history</code>{" "}— and the model
        chooses a view from those descriptions before writing any SQL. The
        view, not the table, is the unit a question lands on.
      </p>
      <p>
        The model then composes SQL from the chosen view&apos;s declared
        dimensions and metrics. It never sees the rows a query returns — it
        writes the query and describes what the chart will show, and the app
        executes it. Two checks stand between that draft and the user: every
        referenced field is verified against the view&apos;s real columns
        before execution, so a misremembered name fails fast rather than
        silently; and a second model reviews the draft for analytical fitness —
        right cohort, right denominator, right grain, no causal claims from
        descriptive data — using the same view definitions as its evidence.
      </p>
      <p>
        Every stage leans on what the view declares. Routing reads the
        descriptions, generation reads the dimensions, metrics and comments,
        and validation reads the grain. A vague comment or an undeclared
        relationship doesn&apos;t just read badly — it degrades every answer
        built on that view.
      </p>

      <Callout kind="tip" title="Comments carry real weight here">
        <p>
          In a normal model, a vague description is a documentation problem. In a
          semantic view, comments are read by tools deciding which metric answers a
          question — write each one as a precise explanation of what the field means
          and when to use it.
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt: "A semantic view differs from a reporting model because…",
            options: [
              "It pre-aggregates the data so dashboards query less",
              "It declares structure and meaning (joins, dimensions, metrics) rather than producing rows with a SELECT",
              "It is a normal view with richer documentation attached",
              "It replaces the reporting models it is built on",
            ],
            answer: 1,
            explain:
              "Nothing is pre-computed and nothing is replaced — it sits over the reporting models via ref() and declares how to query them correctly. The declarations are functional, not documentation.",
          },
          {
            prompt: "Why define metrics like diabetes_count in the semantic view?",
            options: [
              "So the definition exists once and every consumer computes the same number",
              "Because aggregations should not be computed in reporting models",
              "Pre-defined metrics execute faster than ad-hoc aggregations",
              "So the metric appears in dbt docs alongside the model",
            ],
            answer: 0,
            explain:
              "The value is agreement, not speed — the metric compiles to the same aggregation an analyst would write, but there is exactly one definition of it. Reporting models still aggregate where appropriate.",
          },
        ]}
      />
    </LessonShell>
  );
}
