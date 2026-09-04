import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Quiz } from "@/components/Quiz";
import { Callout } from "@/components/Callout";
import { MartShapeCompare } from "@/components/MartShapeCompare";

export const metadata: Metadata = { title: "Designing models" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="model-design"
      kicker="Learn 08"
      title="Designing models"
      lede="Good model design makes data easier to understand, change and use. It gives important concepts clear homes, makes every model's contract explicit, and still delivers convenient analytical datasets."
      minutes={30}
    >
      <h2>Good design contains the impact of change</h2>
      <p>
        Model design decides which model should own a definition and what its
        consumers can expect. In a well-designed project, a reader can tell what
        one row means, a developer can confidently change one definition without
        inspecting or rewriting unrelated logic, and an analyst receives data in
        a useful shape.
      </p>
      <p>
        Design begins once the required outcome is clear and discovery has shown
        what the project already provides and what is missing. The remaining
        concepts can then be separated and composed. One readiness test before
        encoding anything: if nobody can describe a person who should be
        included and one who should not, the population is not yet ready to
        become SQL.
      </p>
      <p>
        Model boundaries must balance separation with usability. Putting
        everything in one model produces convenient output but hides several
        responsibilities inside one file. Separating every expression produces a
        deep DAG of fragments that nobody wants to use. A good boundary isolates
        a coherent concept, grain or reason to change. A good mart then composes
        those settled pieces generously for its consumers.
      </p>
      <p>
        A business definition needs one owner when several models depend on it.
        A maintained provider list, code set, threshold or date rule should not
        be copied across model SQL. Put shared data in a shared or correctly
        scoped model and join to it; use a macro for reused SQL logic and a
        project variable only for a value supplied per run or environment. A
        value that defines one model&apos;s concept belongs in that model even
        if it may change. Do not create another DAG node merely to extract a
        local literal.
      </p>

      <h3>Begin with the missing decision</h3>
      <p>
        A request gives you something concrete to deliver. Discovery establishes
        which definitions already exist. Design begins with the remaining
        decision: perhaps a new time window, a missing clinical measure or the
        way a product combines existing models. Describe that gap before adding
        files.
      </p>
      <p>
        A waiting-list dashboard might need a new provider summary while already
        having suitable pathway records. Keep the pathway definition available
        for other uses, and give the summary its own stated grain. You do not
        need to predict every future report. You do need to avoid making the
        first report&apos;s filters part of a model presented as a shared
        definition.
      </p>

      <h2>Reusable models need explicit contracts</h2>
      <p>
        A consumer should be able to understand a model without reading every
        line of its SQL. A recognisable name is not enough. Consumers need to
        know which records can appear, when each claim is true and what will
        happen when the model is joined to something else. Those promises form
        the model&apos;s contract.
      </p>

      <h3 id="population-time-and-grain-define-one-row">
        State the contract for the new model
      </h3>
      <p>
        The <Link href="/learn/analytical-tables">foundations chapter</Link>{" "}
        explains grain and join multiplicity. Apply those ideas before writing
        this model: one row per what, which records qualify, and as of when? A
        contract here means the model&apos;s documented analytical promises.
      </p>
      <p>
        For an asthma measure, one row per person is only the start. Does it
        contain all registered people or only register members? Does it assess
        prescribing in the last year or in a fixed reporting period? Can people
        with missing evidence appear? Different answers produce different
        populations even if every result has a unique person key.
      </p>

      <h3>Time is part of the model&apos;s meaning</h3>
      <p>
        Grain is necessary, but it is not sufficient. Two models can contain one
        row per person and still answer different questions because they make
        different claims about time. A current-state model describes what is
        true when the project runs. A historical model records how something
        changed. A point-in-time model reconstructs what would have been known
        or true at a specified reference date.
      </p>
      <table>
        <thead>
          <tr>
            <th>Temporal contract</th>
            <th>What one row means</th>
            <th>Typical use</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Current</td>
            <td>The latest valid state for an entity at build time</td>
            <td>Operational lists and current population views</td>
          </tr>
          <tr>
            <td>Historical</td>
            <td>A state, event or relationship during a recorded interval</td>
            <td>Change over time and audit</td>
          </tr>
          <tr>
            <td>Point in time</td>
            <td>The result for an entity at a declared reference date</td>
            <td>Cohort comparison and reproducible reporting periods</td>
          </tr>
        </tbody>
      </table>
      <p>
        This distinction matters especially in population health. A
        person&apos;s current practice is not necessarily the practice
        responsible for them at the end of the reporting period. Their age today
        is not their age when a criterion was assessed. For a result meant to
        reproduce what was known last March, a diagnosis first recorded next
        month must not be included. A retrospective clinical view may
        deliberately use later-recorded evidence about earlier events. State
        which interpretation the model provides.
      </p>
      <p>
        <code>dim_person_current_practice</code> therefore makes a deliberately
        current claim. It is useful whenever today&apos;s organisational
        relationship is the required context. The <code>pit_*_register</code>{" "}
        family makes a different promise: register membership is evaluated for a
        supplied point in time. The prefix is not merely a naming convention; it
        warns a consumer that dates, eligibility and evidence must all be
        interpreted relative to the same reference date.
      </p>
      <p>
        A date column alone does not make a model point-in-time correct. Every
        time-dependent input must be evaluated at the reference date. Adding a{" "}
        <code>snapshot_date</code> to today&apos;s register result would label
        the rows, but it would not recreate the historical population.
      </p>

      <h3>Relationships are part of the contract</h3>
      <p>
        A contract must also survive composition. Grain describes one table;
        cardinality describes what happens when that table meets another. A
        person can have many observations, medication orders and registrations.
        A practice has many people. Some relationships are one-to-one only after
        a rule has selected a current, latest or otherwise preferred record.
      </p>
      <p>
        A selected ethnicity can be joined safely into a person-grain mart when
        its model guarantees one result per person. Raw observations cannot:
        they must first be selected or summarised. A registration history needs
        a temporal choice as well as a key, because several practices may be
        correct for the same person at different times. Many-to-many
        relationships, such as people belonging to several clinically defined
        populations, may be clearest at their natural relationship grain.
      </p>
      <p>
        A relationship can be an important domain concept in its own right.
        Register membership relates a person to a clinically defined population;
        a registration history relates a person to an organisation during an
        effective interval. Flattening either relationship into a person model
        too early can discard dates, create arbitrary choices or make several
        simultaneously valid relationships look like one attribute.
      </p>
      <p>
        This is why a visually simple join deserves design attention. If the
        right-hand model is not unique on the join key, the join changes the
        left-hand grain. That may be correct when the result is intentionally at
        relationship grain. It is a defect when the model still claims to be one
        row per person and isn&apos;t.
      </p>
      <p>
        Important relationships should be documented alongside the inputs, with
        tests on the uniqueness that makes them safe. A model&apos;s row
        contract depends on those assumptions surviving upstream change.
      </p>

      <h2>Define once, then compose for use</h2>
      <p>
        A clearly described component can still be awkward to use. If every
        analyst has to rediscover the right models and rebuild the same joins,
        the project has moved complexity without removing it. Good design
        therefore separates the ownership of a definition from the delivery of
        useful analytical data.
      </p>

      <h3>Definition and delivery are different responsibilities</h3>
      <p>
        A model can be wide and convenient without becoming the place where
        every included concept is defined. The design distinction is:
      </p>
      <ul>
        <li>
          <strong>Definition:</strong> the rule that decides what a concept
          means and the tests that protect it.
        </li>
        <li>
          <strong>Delivery:</strong> the composition of established concepts
          into a useful analytical shape.
        </li>
      </ul>

      <p>
        The central rule is to{" "}
        <strong>
          define concepts independently and compose them generously
        </strong>
        . A wide model may deliver many concepts while reusing their definitions
        from upstream models.
      </p>

      <p>
        <code>obt_person_activity</code> follows the composed design. It
        provides one useful person-level row covering recent A&amp;E, admitted
        patient, outpatient and GP activity. Each activity dataset is first
        summarised in a model that owns that dataset&apos;s rules:
      </p>
      <CodeBlock
        lang="sql"
        title="obt_person_activity, simplified"
        code={`select
    person.sk_patient_id,
    ae.attendances_12mo,
    apc.admissions_12mo,
    op.attendances_12mo as outpatient_attendances_12mo,
    gp.appointments_12mo as gp_appointments_12mo
from {{ ref('dim_person_demographics_basic') }} as person
left join {{ ref('fct_person_sus_uec_recent') }} as ae
    using (sk_patient_id)
left join {{ ref('fct_person_sus_apc_recent') }} as apc
    using (sk_patient_id)
left join {{ ref('fct_person_sus_op_recent') }} as op
    using (sk_patient_id)
left join {{ ref('fct_person_gp_recent') }} as gp
    using (sk_patient_id)`}
      />
      <p>
        The wide model owns the composition and its person grain. It does not
        privately redefine an A&amp;E attendance, an admission or a GP
        appointment. Those definitions can be changed and tested independently.
      </p>

      <h3>A mart should be organised around a core concept</h3>
      <p>
        Reporting models are marts: business-defined entities or concepts at a
        documented grain. A mart should contain the context analysts commonly
        need about its core concept.
      </p>
      <p>
        <code>dim_person_demographics</code> is one current row per person. It
        includes age, gender, ethnicity, language, practice, geography and
        deprivation because these attributes are routinely analysed together.
        Performing those joins once in the project is more useful and consistent
        than asking every analyst to rebuild them.
      </p>
      <p>
        Width is useful here because the added columns preserve the core grain
        and are commonly consumed together. The derivations stay where they are
        owned: the mart presents ethnicity and practice while their definitions
        remain in their own reusable models.
      </p>
      <p>
        The same principle applies to coded categories. Keep a code when it is
        useful for traceability, filtering or joins, but do not make every
        analyst look up its meaning. An analyst-facing mart should also provide
        the authoritative label supplied by the source or owned by a shared
        reference model. A narrow modelling block may keep only the code when
        the downstream mart adds the label. If no authoritative description
        exists, do not invent one or hide a maintained mapping in a local{" "}
        <code>case</code> expression.
      </p>

      <h2>Facts, dimensions and the reporting taxonomy</h2>
      <p>
        The project&apos;s <code>fct_</code> and <code>dim_</code> prefixes
        distinguish models that establish an analytical subject from models that
        describe one. The terms come from Kimball&apos;s dimensional modelling,
        but population health applies them beyond traditional transaction facts.
      </p>

      <h3>A modelling block or a business-ready mart?</h3>
      <p>
        <code>int_</code>, <code>fct_</code> and <code>dim_</code> do not
        describe physical shapes. An <code>int_</code> model is a modelling
        component intended for other dbt models. A <code>fct_</code> or{" "}
        <code>dim_</code> model is a supported reporting mart at a documented
        population, time and grain.
      </p>

      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>
              <code>int_</code>
            </th>
            <th>
              <code>fct_</code> / <code>dim_</code>
            </th>
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
            <td>Analysts and downstream reporting models</td>
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
        </tbody>
      </table>

      <p>
        <code>int_hba1c_latest</code> contains one selected HbA1c result per
        person, but remains <code>int_</code> because it is a reusable input to
        registers and care-process models. By contrast,{" "}
        <code>fct_person_diabetes_register</code> publishes register membership
        as the subject analysts count, validate and break down.
      </p>

      <Callout kind="tip" title="Two decisions, in order">
        <p>
          First ask whether this is a modelling block or a business-ready mart.
          If it is a mart, then ask whether it establishes the subject being
          measured (<code>fct_</code>) or describes another entity (
          <code>dim_</code>).
        </p>
      </Callout>

      <h3>Use the model&apos;s primary purpose</h3>
      <p>
        The{" "}
        <Link href="/learn/analytical-tables#facts-record-the-subject-dimensions-provide-context">
          facts and dimensions example
        </Link>{" "}
        starts with appointments and then clinical states. Use that distinction
        here: the asthma register records membership as the subject of analysis;
        ethnicity and practice provide context about its people. A model&apos;s
        primary purpose determines its name, even when another analysis uses it
        differently.
      </p>

      <h3>Facts and dimensions, delivered as wide tables</h3>
      <p>
        Kimball&apos;s roles still govern wide marts: each fact has a declared
        grain, shared dimensions provide consistent context, and the
        relationships are documented and tested. The difference is physical.
        Routine joins are performed in dbt rather than repeated by each
        consumer.
      </p>

      <MartShapeCompare />

      <p>
        Columnar storage makes repeated descriptive values relatively cheap,
        while repeated joins consume compute and risk multiplying rows.
        Performing common joins in dbt keeps those decisions in reviewed code.
        Wide marts repeat values and take more work to build, so each derivation
        must still have one reusable home.
      </p>
      <p>
        <code>dim_person_ethnicity</code> can remain the canonical model that
        selects a person&apos;s ethnicity while several marts include its
        resulting <code>ethnic_group</code> column. The value is repeated; the
        rule that selects it is not.
      </p>
      <p>
        A semantic layer changes where this responsibility sits: it can define
        joins and metrics centrally over more modular models. This project does
        not currently rely on one, so its reporting marts include routine
        context themselves. dbt documents both patterns in its{" "}
        <a href="https://docs.getdbt.com/best-practices/how-we-structure/4-marts">
          marts guidance
        </a>
        .
      </p>

      <h2>Useful boundaries make reuse possible</h2>
      <p>
        A definition can only be reused confidently when it has a recognisable
        home and can change without disturbing unrelated concepts. That makes
        model boundaries important, but it does not mean that every calculation
        deserves a separate node in the DAG.
      </p>

      <h3>A boundary is useful when logic changes independently</h3>
      <p>
        &quot;One model, one job&quot; does not mean one CTE or one calculation
        per model. A model can perform several transformations when they
        contribute to one coherent responsibility.
      </p>
      <p>
        The boundary test is whether the transformations describe the same thing
        and would normally change for the same reason.
      </p>
      <p>
        The activity datasets in <code>obt_person_activity</code> have different
        reasons to change. A&amp;E attendance can change when valid-attendance
        rules or ECDS handling changes. Emergency admissions depend on admission
        methods and spell construction. Outpatient activity has its own
        attendance and DNA handling, while GP appointments depend on a different
        dataset and status vocabulary.
      </p>
      <p>
        Keeping those definitions in separate models means a change to spell
        construction does not require rechecking the A&amp;E or GP selection.
        The final activity model remains wide because that is useful to
        consumers.
      </p>

      <h3>When a separate model earns its place</h3>
      <p>
        Separate a definition when it is reused, has its own grain, needs
        distinct tests or changes independently. Keep related calculations
        together when they implement one rule. SQL length alone does not decide
        the boundary.
      </p>
      <p>
        Width is useful when consumers repeatedly need the same context and the
        joins preserve the grain. A person mart can include practice and
        ethnicity while the definitions of those attributes remain in their
        shared models.
      </p>

      <h3>Keep maintained definitions shared</h3>
      <p>
        A code set is part of a clinical definition. Reference the
        project&apos;s managed code sets rather than copying codes into several
        models. The same applies to a maintained provider mapping. A change to
        that shared input can then be reviewed once, with its consumers visible
        in the DAG.
      </p>
      <p>
        A local calculation is different. Converting a duration already in this
        model from days to weeks does not automatically need a separate model. A
        reused selection of the latest qualifying observation may deserve one
        because it has its own grain and clinical rules.
      </p>

      <h2>A worked example: designing beyond the first dashboard</h2>
      <p>
        Suppose a team needs an asthma dashboard. The dashboard will show people
        on the asthma register, recent asthma management, prescribing measures,
        demographic breakdowns and practice context. (The{" "}
        <Link href="/learn/finding-models">Finding models</Link> lesson walks
        through this same scenario from the consumer&apos;s side: discovering
        these models; this section is about why they are designed the way they
        are.) It would be possible to write one query that reaches into clinical
        records, medication orders and registration data and returns exactly
        those columns. That query might answer the ticket, but it would make the
        dashboard responsible for every concept it happens to use.
      </p>
      <p>
        The better design begins by recognising that the dashboard contains
        several claims with different reasons to change. Register membership is
        a clinical fact. Medication activity is another clinical subject with
        its own time windows and measures. Ethnicity and current practice
        describe the people in those facts. The dashboard is a product that
        composes those subjects for a particular audience.
      </p>

      <h3>Intermediate models make the evidence legible</h3>
      <p>
        In the project, <code>int_asthma_diagnoses_all</code> identifies asthma
        diagnosis and resolution evidence at observation grain.{" "}
        <code>int_asthma_medications_all</code> makes relevant medication orders
        available at order grain. These models create things that can be
        counted, but that does not make them facts in the reporting sense. Their
        job is to prepare coherent, reusable evidence inside the modelling
        layer. Their names and grains reflect that supporting role.
      </p>
      <p>
        This separation also makes the eventual register SQL readable. The
        register does not need to contain all of the mechanics for finding coded
        observations and medication orders. It can focus on the business rule
        that defines membership: the relevant age threshold, an active diagnosis
        and recent medication evidence. A reviewer can see the definition
        without first unpicking source-specific extraction.
      </p>

      <h3>The reporting fact owns the clinical concept</h3>
      <p>
        <code>fct_person_asthma_register</code> completes the register
        definition at one row per included person. It combines the prepared
        evidence, applies the inclusion criteria and retains dates, codes and
        criterion flags that explain the result. That is appropriate
        reporting-layer work. Modelling is not the only layer where meaning can
        be established; it isolates complex or reusable steps so that the
        business-ready fact can state its central definition clearly.
      </p>
      <p>
        The <code>fct_</code> prefix describes the analytical role of that
        result, not how early its rows became countable. Register membership is
        the subject being measured. By contrast, a person&apos;s ethnicity or
        current practice supplies context about people already in the register,
        so those models have a dimensional role.
      </p>

      <h3>The published model owns the product composition</h3>
      <p>
        The asthma register is not the asthma dashboard. A dashboard may also
        need SABA prescribing, other management measures, demographics and
        organisational fields. Adding every requirement to the register would
        make one reusable clinical fact change whenever one product changes.
      </p>
      <p>
        Instead, any additional clinical subject should first have a
        business-ready reporting model at a declared grain. A published model
        such as <code>asthma_dashboard_base</code> can then compose the
        register, prescribing or management facts and relevant dimensions into
        the exact shape the dashboard needs. It owns product-specific filters,
        audience policy, column names and the final delivery grain. The register
        remains reusable for other analyses, and the published model remains
        free to evolve with the dashboard.
      </p>
      <p>
        The result is a set of reusable, clearly defined building blocks.
        Another question in the asthma domain can compose the existing register,
        prescribing measures, management facts and person dimensions in a
        different way without first recovering their logic from a dashboard
        query. Work already done to define those concepts remains useful beyond
        the product that first needed it.
      </p>
      <p>
        A legitimately different question may need another time window,
        threshold or population rule. It can build that new concept from the
        appropriate underlying evidence model while leaving the established
        register and measures unchanged. The difference is then explicit and
        reviewable. The DAG shows both the shared foundations and the point at
        which the new definition diverges.
      </p>

      <h2>Stable shared models let products vary</h2>
      <p>
        The asthma example leaves two kinds of model behind: stable domain
        models that can support many questions, and a published composition
        designed for one product. Treating those as different interfaces allows
        shared meaning to improve deliberately while products continue to
        respond to their own users and obligations.
      </p>

      <h3>Reporting models are supported interfaces</h3>
      <p>
        A reporting mart is not just the final SQL file in a chain. Its name,
        population, time, grain and column meanings form an interface used by
        analysts and downstream models. Treating that interface deliberately
        makes changes safer.
      </p>
      <p>
        Adding a descriptive column that preserves the existing grain is often
        an additive change. Changing one row per person to one row per person
        and month is not: every count and join may behave differently even if
        the old columns still exist. Changing the definition of register
        membership is similarly consequential because the rows themselves now
        make a different clinical claim.
      </p>
      <p>
        When a new subject or temporal contract is needed, a new model is
        usually clearer than quietly changing the old one. When the concept is
        unchanged and only a new attribute is being delivered, extending the
        existing mart may be simpler. The decision follows the contract, not a
        preference for creating or avoiding files.
      </p>
      <p>
        Published models provide another useful boundary. They can change with a
        dashboard or extract while stable reporting facts continue to serve
        several products. Conversely, a correction to a shared clinical
        definition should be made in its reporting fact and allowed to flow to
        every product that depends on it. Model design makes the intended blast
        radius visible before the SQL changes.
      </p>

      <h3>Rules should live at the scope that owns them</h3>
      <p>
        Not every rule is product-specific. An organisation may agree one way to
        report a measure, assign a current practice or interpret a clinical
        definition across all of its work. When that rule is authoritative for
        the whole project, it can belong in a shared model even though it
        reflects an organisational decision rather than an objective property of
        the source data.
      </p>
      <p>
        Programme logic and terminology have narrower authority. A respiratory
        programme might define its own labels, classifications, priority groups,
        thresholds and reporting periods. That vocabulary and logic are entirely
        appropriate in dbt, but they should live in the programme&apos;s folders
        or schemas and build on shared asthma, prescribing and person models.
        The programme should not alter those shared models as though its
        terminology or rules were the only valid interpretation of the domain.
      </p>
      <p>
        Audience and product rules are narrower again. Shared person
        demographics can support both direct-care and secondary-use products,
        while a secondary-use published view applies the relevant opt-out
        filtering. That filter should not remove people from the shared person
        model, where other lawful uses still need them.
      </p>
      <p>
        These scopes can overlap because products use programme definitions and
        programmes use shared domain concepts. The boundary is about authority:
        a narrower consumer may compose, filter or extend a shared definition,
        but it should not silently make its own requirement part of the shared
        meaning for everyone else.
      </p>

      <h2>Clinical meaning must remain visible</h2>
      <p>
        A model can have a clear grain, a stable interface and the correct owner
        while still concealing an important clinical distinction. Reusable
        models need to preserve uncertainty and enough supporting evidence for
        another consumer to understand what their results mean.
      </p>

      <h3>Unknown is not the same as false</h3>
      <p>
        Clinical data often distinguishes &quot;does not meet the
        definition&quot; from &quot;we do not have enough information to
        decide&quot;. A missing observation, an explicit negative result, an
        inapplicable rule and an exclusion are not automatically the same state.
      </p>
      <p>
        The necessary states need to be understood before they are reduced to a
        boolean. A model might keep a result such as <code>met</code>,{" "}
        <code>not_met</code>, <code>insufficient_data</code> or{" "}
        <code>not_applicable</code>, together with a simpler flag for consumers
        that need one. This keeps missing records from silently becoming
        clinical conclusions.
      </p>
      <p>
        The population rule should state how nulls, missing evidence, exclusions
        and unresolved cases affect inclusion. Those decisions need tests just
        as the model&apos;s grain does.
      </p>

      <h3>Important results should remain explainable</h3>
      <p>
        A model should usually retain the columns needed to understand and
        validate its result. A final flag without dates, criteria or
        contributing values forces every investigation back into the SQL.
      </p>
      <p>
        <code>fct_person_diabetes_register</code> keeps diagnosis dates,
        criteria flags and contributing codes alongside{" "}
        <code>is_on_register</code>. This lets a clinician inspect why a person
        was included. Similarly, <code>fct_person_resource_index</code> retains
        actual and expected costs, registration exposure and imputation
        information alongside the final index.
      </p>
      <p>
        A useful result retains the inputs and flags a reviewer needs to answer
        &quot;why did this row receive this result?&quot; It should not expose
        unnecessary source detail, but neither should it reduce an explainable
        decision to an opaque verdict.
      </p>

      <h2 id="naming-the-model">
        Give the result a name readers can interpret
      </h2>
      <p>
        After choosing its purpose, population, time and grain, use the
        project&apos;s <Link href="/learn/model-naming"> naming grammar</Link>.
        The shared clinical fact names its subject; the published dashboard
        model names its product. Check the description and name together.
        Neither should suggest broader coverage than the model actually
        provides.
      </p>

      <h2>A model-design checklist</h2>
      <ol>
        <li>
          <strong>Name the domain concept.</strong> Identify the entity, event,
          state or relationship that remains useful beyond the first output.
        </li>
        <li>
          <strong>State population, time and grain.</strong> Complete &quot;one
          row per…, included when…, as of…&quot; and identify the uniqueness
          test that protects it.
        </li>
        <li>
          <strong>Search for existing definitions.</strong> Follow the
          project&apos;s{" "}
          <Link href="/learn/finding-models">discovery method</Link> and reuse
          or extend them instead of creating a parallel meaning.
        </li>
        <li>
          <strong>Choose the boundary.</strong> Separate logic that has its own
          grain, tests, owner, reuse or reason to change.
        </li>
        <li>
          <strong>Design for consumers.</strong> Include commonly needed context
          while preserving the core grain. Prefer a useful denormalised mart
          when it removes routine consumer joins.
        </li>
        <li>
          <strong>Keep scoped rules at the scope that owns them.</strong> Shared
          models may contain agreed organisation-wide definitions. Programme,
          audience and product rules belong in their respective folders or
          schemas and should compose shared domain models rather than redefine
          them for everyone.
        </li>
        <li>
          <strong>Handle uncertainty explicitly.</strong> Do not silently turn
          missing evidence or not-applicable cases into false.
        </li>
        <li>
          <strong>Retain useful evidence.</strong> Keep enough information to
          explain and validate important results.
        </li>
      </ol>
      <p>
        Once those boundaries are chosen, the{" "}
        <Link href="/learn/tests-and-docs">tests and documentation</Link> lesson
        turns each intended contract into something consumers and the pipeline
        can verify.
      </p>

      <Quiz
        title="Model-design decisions"
        questions={[
          {
            prompt:
              "A dashboard needs current waiting counts by provider. What should be defined independently of that chart?",
            options: [
              "Its colours and sort order",
              "Open pathway, current snapshot and responsible provider",
              "The dashboard refresh button",
              "Only the final provider total",
            ],
            answer: 1,
            explain:
              "Those are durable domain concepts. The chart is one way of grouping and presenting them.",
          },
          {
            prompt:
              "A person-grain model needs the latest HbA1c. Why reference int_hba1c_latest rather than all observations?",
            options: [
              "Latest models always build faster",
              "It preserves one row per person and reuses the shared selection rule",
              "Reporting models cannot reference observation data",
              "The all model contains undocumented columns",
            ],
            answer: 1,
            explain:
              "The latest model has already selected one qualifying result per person. That protects the target grain and keeps the selection rule in one place.",
          },
          {
            prompt:
              "When is adding columns to an existing mart usually preferable to creating another narrow model?",
            options: [
              "Whenever the SQL is shorter than 100 lines",
              "When the columns preserve its grain and consumers commonly need them together",
              "Whenever the columns come from staging",
              "When no uniqueness test exists",
            ],
            answer: 1,
            explain:
              "Useful width avoids repeated downstream joins. The model should still preserve one clear core grain and reuse upstream definitions.",
          },
          {
            prompt:
              "A register is needed as it stood on 31 March. Adding a snapshot_date column of 31 March to today's register result: does that make the model point-in-time correct?",
            options: [
              "Yes, the reference date is now recorded on every row",
              "No, every time-dependent input must be evaluated as of the reference date, not merely labelled with it",
              "Yes, provided the model was built during March",
              "No, point-in-time models require a snapshot table",
            ],
            answer: 1,
            explain:
              "A label does not recreate the historical population. Ages, diagnoses, resolutions and registrations must all be evaluated at the reference date. That is the contract the pit_ family makes.",
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
              "A respiratory programme needs its own priority groups built on the asthma register. Where does that logic belong?",
            options: [
              "In fct_person_asthma_register, so every consumer benefits",
              "In the programme's own models, composing the shared register without altering it",
              "In staging, so it is applied as early as possible",
              "In each dashboard that mentions asthma",
            ],
            answer: 1,
            explain:
              "Programme rules and terminology carry programme-level authority. They should compose shared domain models rather than make one programme's interpretation part of the shared meaning for everyone.",
          },
        ]}
      />
    </LessonShell>
  );
}
