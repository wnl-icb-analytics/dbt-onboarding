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
      kicker="Going further 08"
      title="Semantic views"
      lede="A Snowflake semantic view defines the metrics for a set of reporting tables and how those tables join. Analysts and tools query those definitions, so a metric means the same thing wherever it's used and nobody has to guess the joins."
      minutes={10}
    >
      <h2>A semantic view records how to query the reporting data</h2>
      <p>
        A semantic view declares what one row of each table represents, which
        measures you can query and how the tables join. Semantic views make up the
        project&apos;s semantic layer, built on the reporting models with{" "}
        <code>ref()</code>.
      </p>
      <p>
        A reporting table answers questions if you already know how to query it.
        Which column is the grain? Which flags are QOF registers? How does it join to
        the next table? A <strong>Snowflake semantic view</strong>{" "}writes that
        knowledge down as part of the pipeline. Once it exists, any consumer can build
        queries from named metrics and declared joins instead of guessing. That
        includes BI tools and the semantic layer chat tool the team is developing.
      </p>

      <h2>Undeclared joins can count people more than once</h2>
      <p>
        A join can count the same person more than once. If one person has four
        observations, joining their demographic row to those observations gives you
        four rows. A semantic view records the keys and relationships a tool needs
        to avoid that.
      </p>
      <p>
        A tool or an AI agent pointed at the warehouse with no semantic layer can
        read table and column names, so simple one-table queries usually work. Joins are where it breaks down, because what a correct
        join needs isn&apos;t written anywhere it can see.
      </p>
      <ul>
        <li>
          <strong>Which columns are the keys?</strong>{" "}Nothing in the schema says{" "}
          <code>person_id</code>{" "}is the primary key of{" "}
          <code>dim_person_demographics</code>. An agent guessing from column names
          might join on <code>sk_patient_id</code>{" "}in one place and{" "}
          <code>person_id</code>{" "}in another. Both look plausible.
        </li>
        <li>
          <strong>Which side has many rows?</strong>{" "}Join a one-row-per-person
          dimension to a table with many observations per person, then count people.
          Every patient is now counted once per observation. The query runs, returns
          confident numbers and is wrong. This is the classic <strong>fan-out</strong>,
          and nothing in the warehouse flags it.
        </li>
        <li>
          <strong>Which tables should be joined at all?</strong>{" "}Two tables sharing
          a column name doesn&apos;t mean they&apos;re meant to be joined, but
          that&apos;s the evidence an agent uses. Worse, tables that{" "}
          <em>do</em>{" "}share a key can cover very different populations. A{" "}
          <code>person_id</code>{" "}in a GP registration table and the same column in
          an acute activity table cover different people, chosen by different rules.
          Join them naively and you get their accidental overlap, not &quot;the
          population&quot;, with no error to warn you.
        </li>
      </ul>
      <p>
        A human analyst avoids these traps with knowledge in their head. The semantic
        view moves that knowledge into the warehouse. <code>PRIMARY KEY</code>{" "}
        declarations state the grain. <code>RELATIONSHIPS</code>{" "}state what refers
        to what. A consumer works out the joins from those declarations instead of
        guessing. Each metric&apos;s aggregation is defined once, at the grain of its
        table, so asking for a metric doesn&apos;t depend on you writing the join.
      </p>

      <h2>A semantic view declares tables, relationships and metrics</h2>
      <p>
        Instead of a SELECT, a semantic view&apos;s body declares its tables and
        their keys, how they relate, and the facts, dimensions and metrics built on
        them. Semantic views live in <code>models/semantic/</code>, with names
        starting <code>sem_</code>. They use the <code>semantic_view</code>{" "}
        materialisation, which comes from Snowflake&apos;s{" "}
        <code>dbt_semantic_view</code>{" "}package in <code>packages.yml</code>. This
        is a cut-down version of <code>sem_olids_population</code>:
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
        COMMENT = 'Boolean flags for LTC registers (QOF Business Rules v51)',
    ccms AS {{ ref('dim_person_ccms') }}
        PRIMARY KEY (person_id)
        COMMENT = 'Cambridge Comorbidity Score. Continuous score only; the
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
      <p>Here&apos;s what each part does.</p>
      <ul>
        <li>
          <strong>TABLES.</strong>{" "}The reporting models that take part, each with
          its primary key. They&apos;re still <code>ref()</code>s, so semantic views
          sit on top of the reporting layer in the same DAG.
        </li>
        <li>
          <strong>RELATIONSHIPS.</strong>{" "}How the tables join, declared once.{" "}
          <code>conditions (person_id) REFERENCES demographics</code>{" "}means each
          conditions row points at one demographics row through{" "}
          <code>person_id</code>.
        </li>
        <li>
          <strong>FACTS.</strong>{" "}Numeric values at the table&apos;s own grain: an
          age, a condition count, a score. Metrics aggregate them, and a consumer can
          also read them directly.
        </li>
        <li>
          <strong>DIMENSIONS.</strong>{" "}Categories to slice by, each with a comment
          saying what it means.
        </li>
        <li>
          <strong>METRICS.</strong>{" "}Named, agreed aggregations. &quot;Diabetes
          count&quot; is defined exactly once, so every consumer gets the same
          number.
        </li>
        <li>
          <strong>SYNONYMS.</strong>{" "}Other names people use. A question about
          &quot;PCN&quot; or &quot;comorbidity score&quot; finds the right field even
          though neither is the column name.
        </li>
      </ul>

      <h2>Query a semantic view with SQL</h2>
      <p>
        You can query these today with ordinary SQL. Analysts use the same views the
        tools do. A semantic view changes the rules of the query, not the language.
        The joins come from the declarations, the metrics are already defined, and
        you ask for a metric by wrapping it in <code>AGG()</code>:
      </p>
      <CodeBlock
        lang="sql"
        title="diabetes count by borough, with no join written"
        code={`
SELECT
    borough_registered,
    AGG(active_patient_count) AS active_patients,
    AGG(diabetes_count) AS diabetes_patients
FROM REPORTING.SEMANTIC.SEM_OLIDS_POPULATION
WHERE is_active = TRUE
GROUP BY borough_registered
HAVING AGG(active_patient_count) > 5
   AND AGG(diabetes_count) > 5;
`}
      />
      <p>Four rules catch most people on their first attempt.</p>
      <ul>
        <li>
          <strong>
            Wrap metrics in <code>AGG()</code>.
          </strong>{" "}
          The view already knows how to aggregate a metric.{" "}
          <code>AGG(diabetes_count)</code>{" "}asks for that aggregation at your
          grouping. Facts and dimensions are different. You aggregate them with
          ordinary functions, like <code>AVG(age)</code>.
        </li>
        <li>
          <strong>
            Every selected dimension goes in <code>GROUP BY</code>.
          </strong>{" "}
          And a metric can&apos;t appear in <code>WHERE</code>, which only takes
          dimensions and facts. Filter on a metric with{" "}
          <code>HAVING AGG(metric)</code>.
        </li>
        <li>
          <strong>Use bare column names.</strong>{" "}You only need to qualify a name
          with its table, as in <code>demographics.gender</code>, when two tables in
          the view define the same name. The team&apos;s examples use bare names
          throughout.
        </li>
        <li>
          <strong>Keep the view on its own in its query block.</strong>{" "}A query
          that reads a semantic view can&apos;t also contain joins, window functions,
          pivots or correlated subqueries. Put each semantic-view query in its own
          CTE. Ordinary SQL, joins and window functions included, works fine over the
          CTE results.
        </li>
      </ul>

      <h3>Combine views through CTEs</h3>
      <p>
        To answer a question across views, like &quot;people with X who also had
        Y&quot;, read each view in its own CTE, reduced to one row per person.
        Join the CTE results on the linkage key. Aggregate only at the end. OLIDS
        views link to each other on <code>person_id</code>. The SUS activity, cost and
        resource views use <code>sk_patient_id</code>, which the population view
        provides as a bridge.
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
), allowed AS (
    SELECT person_id
    FROM REPORTING.OLIDS_PERSON_STATUS.DIM_PERSON_SECONDARY_USE_ALLOWED
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
INNER JOIN allowed AS a ON c.person_id = a.person_id
LEFT JOIN events AS e ON c.person_id = e.person_id
GROUP BY c.borough_registered
HAVING COUNT(DISTINCT c.person_id) > 5
   AND COUNT(DISTINCT e.person_id) > 5
   AND COUNT(DISTINCT c.person_id) - COUNT(DISTINCT e.person_id) > 5;
`}
      />
      <p>
        Here, <code>GROUP BY person_id</code>{" "}in each CTE is what reduces the view
        to one row per person. The <code>allowed</code>{" "}CTE limits the cohort to
        people whose opt-outs permit secondary use. Join to{" "}
        <code>dim_person_secondary_use_allowed</code>{" "}for that, not the
        view&apos;s <code>is_allowed_secondary_use</code>{" "}field. The field comes
        from <code>dim_person_status_summary</code>, which marks anyone without a
        matching record as allowed.
      </p>
      <p>
        Copy three more habits. Suppress every small count you
        release. The project doesn&apos;t set a threshold, and the views leave
        suppression to whoever publishes the output, so use the rule your release
        requires. This example drops any row where the denominator, the numerator
        or the gap between them is 5 or fewer, because the gap is a count too.
        Dropping a row isn&apos;t always enough. If someone can get it back by
        subtracting the other boroughs from a published total, suppress a second
        cell as well. That&apos;s secondary suppression. Count people with{" "}
        <code>COUNT(DISTINCT …)</code>, so a join can never inflate a headcount. And
        keep <code>person_id</code>{" "}and <code>sk_patient_id</code>{" "}out of the
        final output, because they exist for joining, not for release.
      </p>
      <p>
        Snowflake also offers a <code>SEMANTIC_VIEW(...)</code>{" "}clause for querying.
        Unlike the plain form, its result can be joined directly. It works, but the
        project&apos;s guidance uses the plain form above.
      </p>

      <h2>The project has nineteen semantic views</h2>
      <p>
        Each view is named <code>sem_</code>{" "}plus its domain. Pick the one that
        covers your question:
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
            <td>Condition registers up close: current membership and episodes</td>
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
            <td><code>sem_olids_bp_indicators</code></td>
            <td>NICE blood pressure control indicators for hypertension, CHD, stroke/TIA and PAD</td>
          </tr>
          <tr>
            <td><code>sem_olids_nice_indicators</code></td>
            <td>Current NICE indicator results, one row per eligible person and indicator</td>
          </tr>
          <tr>
            <td><code>sem_olids_nice_indicators_history</code></td>
            <td>The same NICE indicators at each month-end over the last 60 months</td>
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
            <td>COVID and flu uptake by person, campaign and risk group, plus other vaccination programmes</td>
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
            <td><code>sem_csds</code></td>
            <td>Community services: contacts, referrals, caseload and waiting clocks</td>
          </tr>
          <tr>
            <td><code>sem_mhsds</code></td>
            <td>Mental health services: contacts, admissions, occupancy, caseload and Mental Health Act periods</td>
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
        Their descriptions do real work. <code>sem_olids_conditions</code>{" "}warns that
        its two grains must not be mixed in one query.{" "}
        <code>sem_olids_vaccinations</code>{" "}says headcounts must count distinct
        people, because one person can appear once per risk group. A tool reading the
        view learns the traps as well as the joins.
      </p>

      <h2>Analysts, BI tools and the team&apos;s chat prototype use them</h2>
      <p>
        Analysts can query a semantic view in SQL, as shown above. A BI tool can use
        the same metric definitions in a dashboard, so the dashboard sits on the
        agreed definitions rather than rebuilding them. Snowflake also works the
        other way round. Its Semantic View Autopilot can build a semantic view from
        an existing Tableau or Power BI file. Snowflake&apos;s Cortex Analyst would be another
        natural consumer, since it answers plain-English questions straight from these
        declarations. It isn&apos;t enabled for our account at the moment.
      </p>
      <p>
        The team&apos;s semantic-layer chat prototype, which isn&apos;t generally
        available yet, shows the whole process. First, a plain-English question is{" "}
        <strong>routed</strong>{" "}to one view. Each view carries an{" "}
        <code>AI_QUESTION_CATEGORIZATION</code>{" "}clause describing the questions it
        serves. Current cohort questions go to <code>sem_olids_population</code>, for
        example, and trajectories and recheck intervals go to{" "}
        <code>sem_olids_observations_history</code>. The model picks a view from
        those descriptions before it writes any SQL. A question lands on a view, not
        a table.
      </p>
      <p>
        Next, the model writes SQL from the chosen view&apos;s dimensions and metrics.
        It never sees the rows a query returns. It writes the query and describes
        what the chart will show, and the app runs it. Two checks stand between that
        draft and the user. Every field it refers to is checked against the
        view&apos;s real columns before the query runs, so a misremembered name fails
        straight away. Then a second model reviews the draft for
        analytical sense: right cohort, right denominator, right grain, and no causal
        claims from descriptive data. It uses the same view definitions as its
        evidence.
      </p>
      <p>
        Every step leans on what the view declares. Routing reads the descriptions.
        Writing the SQL reads the dimensions, metrics and comments. Checking reads the
        grain. So a vague comment or a missing relationship isn&apos;t only untidy. It
        makes every answer built on that view worse.
      </p>

      <Callout kind="tip" title="Comments carry real weight here">
        <p>
          In a normal model, a vague description is a documentation problem. In a
          semantic view, tools read the comments to decide which metric answers a
          question. Write each one as a precise statement of what the field means and
          when to use it.
        </p>
      </Callout>

      <Quiz
        questions={[
          {
            prompt: "A semantic view differs from a reporting model because…",
            options: [
              "It pre-aggregates the data so dashboards query less",
              "It declares structure and meaning (joins, dimensions, metrics) instead of being defined by a SELECT",
              "It is a normal view with richer documentation attached",
              "It replaces the reporting models it is built on",
            ],
            answer: 1,
            explain:
              "Nothing is pre-computed and nothing is replaced. It sits over the reporting models through ref() and declares how to query them correctly. The declarations change how queries work. They aren't just documentation.",
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
              "The point is agreement, not speed. The metric runs the same aggregation an analyst would write, but there's exactly one definition of it. Reporting models still aggregate where that makes sense.",
          },
        ]}
      />
    </LessonShell>
  );
}
