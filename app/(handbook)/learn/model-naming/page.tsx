import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { Callout } from "@/components/Callout";
import { FactDimensionDiagram } from "@/components/FactDimensionDiagram";
import { ModelFinder } from "@/components/ModelFinder";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Naming models" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="model-naming"
      kicker="Learn 05"
      title="Naming models"
      lede="Most readers encounter a model name before they encounter its SQL."
      minutes={13}
    >
      <h2>A model name is a small sentence</h2>
      <p>
        Names in this project normally contain three parts: a layer prefix, the
        domain subject, and a suffix where the model&apos;s shape needs to be made
        explicit.
      </p>

      <div className="my-6 flex flex-col gap-3">
        {[
          {
            parts: ["int_", "hba1c", "_latest"],
            meaning:
              "modelling block · HbA1c results · the most recent result per person",
          },
          {
            parts: ["fct_", "person_diabetes", "_register"],
            meaning:
              "reporting fact · a person's diabetes state · a disease register",
          },
          {
            parts: ["stg_", "olids_observation", ""],
            meaning:
              "staging model · the OLIDS observation table · universally cleaned",
          },
        ].map(({ parts, meaning }) => (
          <div
            key={meaning}
            className="rounded-xl border border-line bg-paper-warm/60 px-4 py-3"
          >
            <p className="!my-0 font-mono text-[14px]">
              <span className="font-bold text-flame-deep">{parts[0]}</span>
              <span className="text-ink">{parts[1]}</span>
              <span className="font-bold text-layer-modelling">{parts[2]}</span>
            </p>
            <p className="!mb-0 !mt-1 text-sm !text-ink-soft">{meaning}</p>
          </div>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th>Part</th>
            <th>Question it answers</th>
            <th>Examples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Prefix</td>
            <td>What role does this model play?</td>
            <td><code>stg_</code>, <code>int_</code>, <code>fct_</code></td>
          </tr>
          <tr>
            <td>Subject</td>
            <td>Which domain concept is it about?</td>
            <td><code>person_diabetes</code>, <code>blood_pressure</code></td>
          </tr>
          <tr>
            <td>Suffix</td>
            <td>Which shape or variant does it contain?</td>
            <td><code>_all</code>, <code>_latest</code>, <code>_register</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        Not every name needs all three parts. A staging model mirrors its source,
        so <code>stg_olids_observation</code> is complete. A canonical dimension
        such as <code>dim_person</code> needs no suffix.
      </p>

      <h2>Prefix: the model&apos;s role</h2>
      <table>
        <thead>
          <tr>
            <th>Prefix</th>
            <th>What to expect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>raw_</code></td>
            <td>A generated one-to-one interface to a landed source table</td>
          </tr>
          <tr>
            <td><code>stg_</code></td>
            <td>One source made legible and ready for downstream use</td>
          </tr>
          <tr>
            <td><code>int_</code></td>
            <td>A purposeful transformation that prepares data for marts</td>
          </tr>
          <tr>
            <td><code>dim_</code></td>
            <td>Descriptive context used to understand and group facts</td>
          </tr>
          <tr>
            <td><code>fct_</code></td>
            <td>An event or measurable state at a declared grain</td>
          </tr>
          <tr>
            <td><code>pit_</code></td>
            <td>A point-in-time view for retrospective reporting</td>
          </tr>
          <tr>
            <td><code>obt_</code></td>
            <td>A wide analytical table composed from established concepts</td>
          </tr>
          <tr>
            <td><code>dq_</code></td>
            <td>A data-quality output containing records that need attention</td>
          </tr>
        </tbody>
      </table>
      <p>
        Choose the prefix from the model&apos;s responsibility, not its size or its
        grain.
      </p>
      <Callout kind="info" title="These are this project&apos;s conventions">
        <p>
          dbt does not require <code>fct_</code>, <code>dim_</code> or this set of
          suffixes. The value comes from using one project naming grammar
          consistently. When generic dbt guidance differs, follow the documented
          project convention and make the difference explicit.
        </p>
      </Callout>

      <h2>Choose the layer before fact or dimension</h2>
      <p>
        <code>int_</code>, <code>fct_</code>{" "}and <code>dim_</code>{" "}do not
        describe three different physical shapes. First they distinguish a
        private modelling component from a supported reporting mart.
      </p>
      <p>
        An <code>int_</code>{" "}model is a purposeful transformation with a clear
        responsibility. It can have an explicit grain, contain substantial
        domain logic and produce rows that could be counted. It may exist to
        isolate complex logic and keep mart SQL readable, as well as to support
        reuse. Its intended consumers are still other dbt models rather than
        people looking for the supported analytical starting point for that
        subject.
      </p>
      <p>
        A <code>fct_</code>{" "}or <code>dim_</code>{" "}model is a reporting mart.
        It presents a business-defined subject at a documented population, time
        and grain as a stable starting point for analysis. It may complete the
        definition of its core concept as well as compose reusable definitions
        from upstream.
      </p>

      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th><code>int_</code></th>
            <th><code>fct_</code> / <code>dim_</code></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Primary purpose</td>
            <td>Prepare or reshape data, or isolate a coherent concern</td>
            <td>Offer a supported, business-ready subject for analysis</td>
          </tr>
          <tr>
            <td>Typical consumers</td>
            <td>Other dbt models</td>
            <td>Analysts, dashboards and downstream products</td>
          </tr>
          <tr>
            <td>Expected shape</td>
            <td>Whatever grain the modelling step requires</td>
            <td>A documented core entity or concept at a useful grain</td>
          </tr>
          <tr>
            <td>Expected context</td>
            <td>Enough to perform its modelling job</td>
            <td>Enough to use the subject without rebuilding routine joins</td>
          </tr>
          <tr>
            <td>Can its rows be counted?</td>
            <td>Yes</td>
            <td>Yes</td>
          </tr>
        </tbody>
      </table>

      <h3>Example: a countable model can still be intermediate</h3>
      <p>
        <code>int_hba1c_latest</code>{" "}contains one selected HbA1c result per
        person. You could count its rows or group its results. It remains
        {" "}<code>int_</code>{" "}because its project role is to provide a reusable
        latest-result block for registers, care-process measures and other
        reporting models.
      </p>
      <p>
        <code>fct_person_diabetes_register</code>{" "}is different. Register
        membership is a business-ready clinical subject that analysts and
        products need to count, validate and break down. The model is a mart,
        so it uses a reporting prefix. Within the reporting layer it is a fact
        because the register is the subject being measured, not context that
        describes another subject.
      </p>

      <Callout kind="tip" title="Two decisions, in order">
        <p>
          First ask whether this is a modelling block or a business-ready mart.
          If it is a mart, then ask whether it establishes the subject being
          measured (<code>fct_</code>) or describes another entity
          (<code>dim_</code>).
        </p>
      </Callout>

      <h2>Facts and dimensions in population health</h2>
      <h3>Start with the traditional pattern</h3>
      <p>
        Facts and dimensions describe two different roles in an analytical
        model. A <strong>fact</strong> records an event, state, relationship or
        membership at a declared population, time and grain. It is the subject
        being counted or assessed. A <strong>dimension</strong> provides reusable
        descriptive context for grouping, filtering and understanding facts.
      </p>
      <p>
        Take GP appointments. An appointment fact would contain one row per
        appointment. Its columns might include the appointment date, wait time,
        duration and attendance status. These are facts about something that
        happened, and analysts can count or measure them.
      </p>
      <p>
        The appointment becomes more useful when it is joined to dimensions. A
        person dimension can supply age and ethnicity. A practice dimension can
        supply organisation name and neighbourhood. A date dimension can supply
        month, financial year and day of week. Those attributes let an analyst
        group, filter and label the appointments without changing what the fact
        row represents.
      </p>

      <FactDimensionDiagram variant="traditional" />
      <p>
        In that traditional pattern, fact rows often represent transactions or
        events and contain numeric measures. Dimension rows represent entities
        and contain descriptive attributes. This is a useful starting point,
        but it is not the definition: <strong>fact and dimension describe the
        model&apos;s analytical role, not whether the delivered mart must keep them
        in separate physical tables.</strong>
      </p>

      <h3>Population health facts often define a state</h3>
      <p>
        Population health questions are often about concepts that do not arrive
        as single source events. “On the diabetes register”, “blood pressure is
        controlled” and “eligible for vaccination” must be derived from several
        records and rules.
      </p>
      <p>
        <code>fct_person_diabetes_register</code>{" "}evaluates diabetes diagnosis,
        type and resolution observations together with the person&apos;s age. It
        contains one row for each person whose records meet the model&apos;s current
        register rules at build time. It does not use medication data.
      </p>
      <p>
        The result is closer to a current-state or factless fact than to a
        transaction fact: membership itself is the thing being counted and
        assessed. A numeric measure is not required. For retrospective analysis,
        a point-in-time model must make the reference date part of its contract.
      </p>
      <FactDimensionDiagram variant="population" />
      <p>
        The dimensions still provide context about an existing entity.{" "}
        <code>dim_person_ethnicity</code>{" "}does not establish a new clinical
        population; it supplies a descriptive attribute of the person so the
        register can be analysed by ethnic group.{" "}
        <code>dim_person_current_practice</code>{" "}adds the organisational
        relationship used to group the same register by practice. Both models
        establish useful derived concepts of their own, but their primary
        analytical role here is to describe the person rather than record the
        register membership being measured.
      </p>
      <p>
        The same rule applies elsewhere. <code>fct_person_bp_control</code>{" "}
        establishes the clinical outcome being assessed.{" "}
        <code>fct_covid_eligibility</code>{" "}establishes the programme population.
        Age, ethnicity, geography and practice remain dimensions when they are
        attached to explain or segment those facts.
      </p>

      <Callout kind="tip" title="Once it is a mart, use this test">
        <p>
          Ask what consumers principally do with its rows. If they count or
          assess the cohort, activity, outcome, eligibility or state represented
          by each row, it is usually a fact. If they use its attributes to
          describe, group or filter other subjects, it is usually a dimension.
        </p>
      </Callout>

      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>What the model establishes</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>fct_person_diabetes_register</code></td>
            <td>
              Current diabetes-register membership: one row for each person
              whose records meet the model&apos;s rule at build time
            </td>
            <td>Fact</td>
          </tr>
          <tr>
            <td><code>fct_person_bp_control</code></td>
            <td>
              The clinical outcome of controlled or uncontrolled blood pressure
              for each eligible person
            </td>
            <td>Fact</td>
          </tr>
          <tr>
            <td><code>fct_covid_eligibility</code></td>
            <td>
              The population-health concept of eligibility under a defined set
              of programme rules
            </td>
            <td>Fact</td>
          </tr>
          <tr>
            <td><code>dim_person_ethnicity</code></td>
            <td>
              A descriptive attribute of the existing person entity, used to
              group facts
            </td>
            <td>Dimension</td>
          </tr>
          <tr>
            <td><code>dim_person_current_practice</code></td>
            <td>
              A descriptive relationship that adds organisational context to
              the existing person entity
            </td>
            <td>Dimension</td>
          </tr>
        </tbody>
      </table>

      <h3>Use the model&apos;s subject, not its columns</h3>
      <p>
        Both kinds of model can be one row per person. Both can contain dates,
        flags, categories and descriptive columns. A fact does not need a numeric
        measure, and a dimension does not need to be a small lookup table.
      </p>
      <p>
        The difference is what the row is <em>about</em>. In
        {" "}<code>fct_person_diabetes_register</code>, the row asserts a clinical
        membership about a person. That membership is the model&apos;s subject. In
        {" "}<code>dim_person_ethnicity</code>, the row adds ethnicity to the person;
        the person remains the subject and ethnicity helps describe them.
      </p>
      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>Fact signal</th>
            <th>Dimension signal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>What is this model for?</td>
            <td>Count or assess this cohort, activity, state or outcome</td>
            <td>Describe, label, group or filter another subject</td>
          </tr>
          <tr>
            <td>What does one row principally support?</td>
            <td>Counting or assessing the subject represented by the row</td>
            <td>Grouping, filtering or describing another subject</td>
          </tr>
          <tr>
            <td>How is it normally used?</td>
            <td>As the population or result at the centre of an analysis</td>
            <td>Joined on to provide context for that analysis</td>
          </tr>
        </tbody>
      </table>
      <Callout kind="info" title="A model can be used both ways">
        <p>
          A register flag can later be used to segment another fact, and a
          dimension attribute can be counted. Name the model for its primary
          analytical contract rather than every possible downstream use. When
          the answer is still unclear, inspect similar model families before
          inventing a new convention.
        </p>
      </Callout>

      <h2>Subject: the domain concept</h2>
      <p>
        Use stable entities, events and states rather than the ticket or first
        dashboard that needs them.
      </p>
      <table>
        <thead>
          <tr>
            <th>Avoid</th>
            <th>Prefer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>int_dashboard_data</code></td>
            <td><code>int_wl_open_pathways</code></td>
          </tr>
          <tr>
            <td><code>fct_monthly_report</code></td>
            <td><code>fct_provider_wl_monthly_summary</code></td>
          </tr>
          <tr>
            <td><code>int_request_1847</code></td>
            <td><code>int_person_waiting_time_current</code></td>
          </tr>
          <tr>
            <td><code>fct_final_v2</code></td>
            <td>Name the entity or state the model represents</td>
          </tr>
        </tbody>
      </table>
      <p>
        Put the entity first so related names stay together:{" "}
        <code>dim_person_age</code>, <code>dim_person_ethnicity</code>{" "}and{" "}
        <code>dim_person_housebound_status</code>. Use the vocabulary already in
        the project; a new synonym makes an otherwise good model harder to find.
      </p>
      <Callout kind="info" title="Published models name the product">
        <p>
          The rule changes at the published boundary because a named consumer is
          the model&apos;s contract. Models such as{" "}
          <code>covid_flu_dashboard_base</code>,{" "}
          <code>ltc_lcs_cf_dashboard_base</code>{" "}and{" "}
          <code>valproate_dashboard_base_secondary_use</code>{" "}are appropriately
          named for the products they serve. They compose reusable reporting
          marts; they do not turn the dashboard&apos;s full logic into a new shared
          fact or intermediate model.
        </p>
      </Callout>

      <h2>Suffix: the model&apos;s shape</h2>
      <p>
        A suffix is useful when it distinguishes models about the same subject
        or warns that one row means something different.
      </p>
      <table>
        <thead>
          <tr>
            <th>Suffix</th>
            <th>What it tells the reader</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>_all</code></td>
            <td>Every qualifying event; several rows per person are possible</td>
            <td><code>int_hba1c_all</code></td>
          </tr>
          <tr>
            <td><code>_latest</code></td>
            <td>The most recent qualifying event at the model&apos;s documented grain</td>
            <td><code>int_hba1c_latest</code></td>
          </tr>
          <tr>
            <td><code>_current</code></td>
            <td>The state effective now</td>
            <td><code>dim_person_current_practice</code></td>
          </tr>
          <tr>
            <td><code>_historical</code></td>
            <td>The history of a changing state</td>
            <td><code>dim_person_demographics_historical</code></td>
          </tr>
          <tr>
            <td><code>_register</code></td>
            <td>A defined disease-register population</td>
            <td><code>fct_person_diabetes_register</code></td>
          </tr>
          <tr>
            <td><code>_summary</code></td>
            <td>A roll-up at the grain named elsewhere in the model</td>
            <td><code>fct_ltc_lcs_practice_summary</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        Joining <code>int_hba1c_all</code> to a person-grain model can multiply
        its rows. The <code>_all</code>/<code>_latest</code> pair makes that grain
        difference visible before the join is written.
      </p>
      <Callout kind="info" title="The name is not the full contract">
        <p>
          “Latest” does not explain which date is used or how ties are resolved.
          Put those details in the model description, SQL and tests.
        </p>
      </Callout>

      <h2>Families make the project searchable</h2>
      <p>
        Consistent names allow one search to enumerate a whole group of related
        models:
      </p>
      <table>
        <thead>
          <tr>
            <th>Pattern</th>
            <th>What it finds</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>dim_person_*</code></td>
            <td>Person-level attribute models</td>
          </tr>
          <tr>
            <td><code>fct_person_*_register</code></td>
            <td>Disease registers across conditions</td>
          </tr>
          <tr>
            <td><code>int_*_all</code> / <code>int_*_latest</code></td>
            <td>Event histories and their latest variants</td>
          </tr>
          <tr>
            <td><code>int_*_medications_all</code></td>
            <td>Medication events by drug class</td>
          </tr>
          <tr>
            <td><code>stg_&#123;source&#125;_&#123;table&#125;</code></td>
            <td>The staged version of a source table</td>
          </tr>
        </tbody>
      </table>

      <h3>Read a family sideways</h3>
      <p>
        The repository already contains dozens of person dimensions, latest-event
        models and person-register facts. Looking across one family is often the
        fastest way to understand its taxonomy because the repeated parts stay
        fixed while the meaningful differences become visible.
      </p>
      <table>
        <thead>
          <tr>
            <th>Search</th>
            <th>Models you will meet</th>
            <th>What the family teaches</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>dim_person_</code></td>
            <td>
              <code>dim_person_age</code>, <code>dim_person_ethnicity</code>,{" "}
              <code>dim_person_current_practice</code>,{" "}
              <code>dim_person_demographics</code>
            </td>
            <td>
              The person is the described entity; the remaining words identify
              the attribute, relationship or composed person view.
            </td>
          </tr>
          <tr>
            <td><code>_latest</code></td>
            <td>
              <code>int_hba1c_latest</code>,{" "}
              <code>int_blood_pressure_latest</code>,{" "}
              <code>int_bmi_latest</code>,{" "}
              <code>int_smoking_status_latest</code>
            </td>
            <td>
              Each model selects one qualifying record from a richer history.
              Compare it with the matching <code>_all</code> model to see the
              grain change, selected date and tie-breaking rule.
            </td>
          </tr>
          <tr>
            <td><code>fct_person_</code> + <code>_register</code></td>
            <td>
              <code>fct_person_asthma_register</code>,{" "}
              <code>fct_person_ckd_register</code>,{" "}
              <code>fct_person_diabetes_register</code>
            </td>
            <td>
              These are related person-grain clinical facts. Compare their
              population, reference time, evidence and resolution rules rather
              than assuming every register is constructed identically.
            </td>
          </tr>
        </tbody>
      </table>
      <Callout kind="tip" title="Open neighbours before writing SQL">
        <p>
          Search the prefix, subject and suffix separately. Read two or three
          neighbouring SQL and YAML files. The family shows the expected name,
          grain, tests and documentation more reliably than an isolated example.
        </p>
      </Callout>

      <h2>Search before you build</h2>
      <p>
        Search the domain concept in VS Code, the project documentation and
        Snowflake. You may find that the model already exists. If it does not,
        nearby results show the vocabulary and naming family to follow.
      </p>
      <ModelFinder />

      <h2>Choose a name</h2>
      <ol>
        <li>
          <strong>State the concept and grain.</strong> For example: “current
          open waiting-list pathways, one row per pathway”.
        </li>
        <li>
          <strong>Search the important nouns.</strong> Check for an existing
          model and inspect related names.
        </li>
        <li>
          <strong>Choose the role.</strong>{" "}Use the model&apos;s layer and analytical
          responsibility to select the prefix.
        </li>
        <li>
          <strong>Use established vocabulary.</strong> Match the terms and word
          order used by neighbouring models.
        </li>
        <li>
          <strong>Add a suffix only when it carries information.</strong>{" "}Avoid{" "}
          <code>_data</code>, <code>_table</code>, <code>_new</code>{" "}and{" "}
          <code>_final</code>.
        </li>
        <li>
          <strong>Document the exact promise.</strong> State the grain, selection
          rules and important exceptions in YAML, then protect them with tests.
        </li>
      </ol>
      <p>
        The <Link href="/reference">command reference</Link> keeps the prefix,
        suffix and family tables available as a quick lookup.
      </p>

      <Quiz
        title="Read and choose model names"
        questions={[
          {
            prompt:
              "What is the important difference between int_hba1c_all and int_hba1c_latest?",
            options: [
              "They are maintained by different teams",
              "They have different grains: one row per result versus the latest result per person",
              "Only the latest model belongs in the DAG",
              "The all model is raw while the latest model is staged",
            ],
            answer: 1,
            explain:
              "The suffix exposes a shape and grain change. _all retains every qualifying event; _latest selects one per person.",
          },
          {
            prompt:
              "A ticket asks for an asthma dashboard combining register membership, SABA prescribing and other measures. What should you create?",
            options: [
              "A published asthma_dashboard_base composed from reporting marts",
              "More columns in fct_person_asthma_register until it serves the dashboard",
              "An int_asthma_dashboard_data model queried directly by the dashboard",
              "A replacement fct_asthma_dashboard fact containing every measure",
            ],
            answer: 0,
            explain:
              "The register remains a reusable reporting fact. A named dashboard is served by a published model that composes the register, prescribing and other reporting marts at the product's required grain. The *_dashboard_base family already expresses this pattern in the project.",
          },
          {
            prompt:
              "You think a new person-level housebound model is needed. What should happen first?",
            options: [
              "Search for housebound and inspect the dim_person_* family",
              "Choose the shortest available filename",
              "Add _v2 so it cannot clash with older work",
              "Start from the dashboard query and name it when the SQL is finished",
            ],
            answer: 0,
            explain:
              "Searching reveals that dim_person_housebound_status already exists. When a model is genuinely new, neighbouring names show the convention to follow.",
          },
        ]}
      />
    </LessonShell>
  );
}
