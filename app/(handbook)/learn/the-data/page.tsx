import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "The data we model" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="the-data"
      kicker="Learn 03"
      title="The data we model"
      lede="The project turns GP clinical records, commissioning datasets and shared reference data into a supported analytical estate: people, clinical populations, results, activity, pathways, measures and governed data products."
      minutes={11}
    >
      <h2>The project has two main data families</h2>
      <p>
        Most person-level work in the project draws from one or both of two broad
        families. <strong>OLIDS</strong>{" "}provides the detailed GP clinical
        record. <strong>Commissioning data</strong>{" "}provides hospital activity,
        waiting lists, prescribing, community and mental-health activity, referrals
        and other administrative flows. Shared reference models add organisations,
        geographies, deprivation and clinical classifications to both.
      </p>
      <p>
        The distinction is visible in the repository. OLIDS staging models live in{" "}
        <code>models/staging/olids/</code>. National and local commissioning feeds
        live under <code>models/staging/commissioning/</code>, with a folder for
        each source. Their downstream models remain separated where provenance
        matters and are joined where the project has a supported person-level
        relationship.
      </p>
      <p>
        You rarely need to begin in either staging directory. The project already
        contains reporting models for common clinical populations, demographics,
        recent activity and waiting-list measures. Understanding the source
        families helps you interpret those models; it should not send every new
        question back to the source.
      </p>

      <h2>What the project creates from those sources</h2>
      <p>
        The dbt project does more than clean the incoming tables. It creates named,
        tested relations in the modelling, reporting and published databases. Each
        family removes a different piece of work that would otherwise be repeated
        in individual analyses.
      </p>
      <table>
        <thead>
          <tr>
            <th>What the project creates</th>
            <th>Models to recognise</th>
            <th>What they provide</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Person spines and descriptive dimensions</td>
            <td>
              <code>dim_person_demographics</code>,{" "}
              <code>dim_person_demographics_historical</code>,{" "}
              <code>dim_person_pseudo</code>
            </td>
            <td>
              Current and historical OLIDS demographics, registration, geography,
              and the bridge used where cross-dataset linkage is available
            </td>
          </tr>
          <tr>
            <td>Clinical populations</td>
            <td><code>fct_person_*_register</code></td>
            <td>
              Reusable definitions of diabetes, asthma, COPD, CKD and other
              clinical registers, with the evidence behind membership
            </td>
          </tr>
          <tr>
            <td>Condition histories</td>
            <td><code>fct_person_condition_episodes</code></td>
            <td>
              Diagnosis-based episodes with start and end dates, including repeated
              cycles where a condition can resolve and recur
            </td>
          </tr>
          <tr>
            <td>Latest clinical states</td>
            <td><code>int_*_latest</code></td>
            <td>
              One selected HbA1c, blood pressure, eGFR, smoking status or other
              qualifying result per person
            </td>
          </tr>
          <tr>
            <td>Activity facts</td>
            <td>
              <code>fct_person_sus_*_recent</code>,{" "}
              <code>fct_person_gp_recent</code>
            </td>
            <td>
              Recent urgent care, admitted care, outpatient and GP activity at a
              documented person grain
            </td>
          </tr>
          <tr>
            <td>Waiting-list facts and summaries</td>
            <td>
              <code>int_wl_current</code>,{" "}
              <code>fct_person_wl_current_count_*</code>,{" "}
              <code>fct_provider_wl_current_count_total</code>
            </td>
            <td>
              The current open-pathway population and supported counts by person,
              provider and treatment function
            </td>
          </tr>
          <tr>
            <td>Wide analytical marts</td>
            <td>
              <code>person_month_analysis_base</code>,{" "}
              <code>obt_person_activity</code>,{" "}
              <code>fct_person_resource_index</code>
            </td>
            <td>
              Person-month population-health history and other related reporting
              facts composed at convenient analytical grains
            </td>
          </tr>
          <tr>
            <td>Data-quality outputs</td>
            <td><code>dq_*</code></td>
            <td>
              Records that fail a documented quality expectation and need
              investigation rather than ordinary analysis
            </td>
          </tr>
          <tr>
            <td>Products for named uses</td>
            <td><code>models/published/</code></td>
            <td>
              Tables and views composed for specific dashboards, reports, extracts
              and operational processes
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        These outputs are the project&apos;s accumulated domain knowledge. Staging
        makes the inputs dependable enough to model; modelling and reporting create
        reusable concepts; published models assemble those concepts for a named
        use. The rest of this page shows how the two source families feed that
        estate.
      </p>

      <h2>OLIDS supplies the GP clinical record</h2>
      <p>
        OLIDS delivers the GP record as a set of related entities: a patient
        and person spine, clinical events such as observations, medication
        orders, encounters and referrals, appointment and practitioner records,
        and the concept tables that resolve source codes. The feed arrives
        already conformed and tested upstream, so the staging models —{" "}
        <code>stg_olids_observation</code>{" "}and its neighbours — are
        deliberately thin: the project&apos;s names and types, and nothing more.
      </p>
      <p>
        That preparation is our own work, done upstream in a separate dbt
        project, <code>dbt-olids</code>, which conforms and tests the OneLondon
        feed before it lands in this project&apos;s data lake. It mints the
        patient and person identifiers used throughout these models — a local
        identity, not the one OneLondon supplies — and maps every observation
        and medication order to its SNOMED concept (
        <code>mapped_concept_code</code>,{" "}
        <code>mapped_concept_display</code>), with medication orders
        additionally carrying the full BNF hierarchy: code, chapter, section
        and product name. Filtering by clinical concept or drug class therefore
        needs no terminology join; the codes are usable columns from the first
        query. This handbook does not cover <code>dbt-olids</code>{" "}itself —
        from here, its outputs are simply the source.
      </p>
      <p>
        The investment sits in the modelling and reporting layers, where
        several hundred models turn those events into reusable clinical
        meaning. Unlike most domains, which occupy one folder, OLIDS is split
        into a folder per family — and because folder paths become schemas,
        this table is also a map of the warehouse:
      </p>
      <table>
        <thead>
          <tr>
            <th>Folder</th>
            <th>What it holds</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>modelling/olids/observations</code></td>
            <td>
              ~50 clinical measurements as <code>_all</code>/<code>_latest</code>{" "}
              pairs (96 models)
            </td>
            <td><code>int_hba1c_latest</code></td>
          </tr>
          <tr>
            <td><code>modelling/olids/medications</code></td>
            <td>Drug-class order histories and polypharmacy (33 models)</td>
            <td><code>int_statin_medications_all</code></td>
          </tr>
          <tr>
            <td><code>modelling/olids/diagnoses</code></td>
            <td>Diagnosis and resolution evidence per condition (39 models)</td>
            <td><code>int_diabetes_diagnoses_all</code></td>
          </tr>
          <tr>
            <td><code>modelling/olids/person_attributes</code></td>
            <td>Ethnicity, smoking, housebound, registrations</td>
            <td><code>int_ethnicity_all</code></td>
          </tr>
          <tr>
            <td><code>modelling/olids/risk_stratification</code></td>
            <td>Frailty and case-management scores</td>
            <td><code>int_efi2_scores</code></td>
          </tr>
          <tr>
            <td><code>modelling/olids/programme/*</code></td>
            <td>
              Programme logic composing the shared blocks (~250 models:
              immunisations, screening, LTC case-finding, SMI…)
            </td>
            <td><code>programme/flu</code></td>
          </tr>
          <tr>
            <td><code>reporting/olids/person_demographics</code></td>
            <td>The person spine, current and historical</td>
            <td><code>dim_person_demographics</code></td>
          </tr>
          <tr>
            <td><code>reporting/olids/person_status</code></td>
            <td>Care home, housebound, carer, opt-out and other statuses</td>
            <td><code>dim_person_care_home</code></td>
          </tr>
          <tr>
            <td><code>reporting/olids/disease_registers</code></td>
            <td>
              21 QOF registers, each with a <code>pit_</code>{" "}point-in-time
              twin, ~18 further registers, condition episodes
            </td>
            <td><code>fct_person_diabetes_register</code></td>
          </tr>
          <tr>
            <td><code>reporting/olids/measures</code></td>
            <td>Care-process and control measures</td>
            <td><code>fct_person_bp_control</code></td>
          </tr>
          <tr>
            <td><code>reporting/olids/data_quality</code></td>
            <td>Records failing a documented quality expectation</td>
            <td><code>dq_hba1c_issues</code></td>
          </tr>
          <tr>
            <td><code>reporting/olids/person_analytics</code></td>
            <td>The person-month analysis mart</td>
            <td><code>person_month_analysis_base</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        The measurement models also handle screening and standardisation:
        implausible values are nulled, HbA1c results are resolved to IFCC or
        DCCT, and results are categorised where thresholds are agreed. The
        medication models do the equivalent — statin orders are classified by
        intensity from their BNF codes, and polypharmacy is counted against the
        NHSBSA 5+ and 10+ thresholds.
      </p>
      <p>
        <code>fct_person_bp_control</code>{" "}is a typical composition of
        these blocks. It scores each person&apos;s latest reading against their
        NICE NG136 target, selected by age, Type 2 diabetes, CKD and ACR status
        from the register models — home and ambulatory readings are scored
        against the lower thresholds that apply to them — then stages
        hypertension and flags elevated readings in people not on the
        hypertension register.
      </p>
      <p>
        Because these families follow the naming grammar, what OLIDS already
        covers can be enumerated by search:
      </p>
      <table>
        <thead>
          <tr>
            <th>What you need</th>
            <th>Search for</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Every recorded value of a measurement</td>
            <td><code>int_*_all</code></td>
            <td><code>int_hba1c_all</code></td>
          </tr>
          <tr>
            <td>The latest qualifying value per person</td>
            <td><code>int_*_latest</code></td>
            <td><code>int_egfr_latest</code></td>
          </tr>
          <tr>
            <td>Medication orders for a drug class</td>
            <td><code>int_*_medications_all</code></td>
            <td><code>int_sglt2_medications_all</code></td>
          </tr>
          <tr>
            <td>Diagnosis evidence for a condition</td>
            <td><code>int_*_diagnoses_all</code></td>
            <td><code>int_ckd_diagnoses_all</code></td>
          </tr>
          <tr>
            <td>Current register membership</td>
            <td><code>fct_person_*_register</code></td>
            <td><code>fct_person_diabetes_register</code></td>
          </tr>
          <tr>
            <td>A register as at a reference date</td>
            <td><code>pit_*_register</code></td>
            <td><code>pit_diabetes_register</code></td>
          </tr>
          <tr>
            <td>A person attribute or status</td>
            <td><code>dim_person_*</code></td>
            <td><code>dim_person_care_home</code></td>
          </tr>
          <tr>
            <td>Records failing a quality expectation</td>
            <td><code>dq_*</code></td>
            <td><code>dq_hba1c_issues</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        These models express what the GP record can support. For example, a register
        is based on qualifying codes, dates and exclusions found in the available
        record. It does not claim that an unrecorded condition cannot exist. The
        important practical point is that the project settles the supported
        definition once and makes its evidence available for inspection.
      </p>

      <h2>OLIDS is delivered in current, historical and analytical shapes</h2>
      <p>
        The same clinical concepts are delivered in several shapes, each making
        a different claim about time.{" "}
        <code>dim_person_demographics</code>{" "}gives the supported current
        person view. <code>dim_person_demographics_historical</code>{" "}keeps one
        row per person per change period, recording when practice registration,
        ethnicity or geography changed. Use it when an analysis needs the
        attributes that applied at an earlier point rather than today&apos;s values.
      </p>
      <p>
        Conditions also have more than a current-register shape.{" "}
        <code>fct_person_condition_episodes</code>{" "}creates one row per clinical
        condition episode, with start and end dates and repeated cycles where the
        condition can resolve and recur. It is not restricted to the current QOF
        register definition. This makes it suitable for analysing onset, duration,
        resolution and a person&apos;s clinical history.
      </p>
      <p>
        <code>person_month_analysis_base</code>{" "}composes those histories into a
        wide person-month mart. It contains one row per actively registered person
        per month for the latest five years, with the demographics that applied in
        that month, calendar and financial-period fields, active-condition flags and
        new-episode flags. It is the practical starting point for population trends,
        prevalence, incidence and inequalities analysis that would otherwise have
        to rebuild the same temporal joins for every measure.
      </p>
      <p>
        These shapes serve different questions. Use the current dimension for a
        current population, the historical dimension for change periods, the
        episode fact for condition journeys, and the person-month mart when the
        analysis itself is monthly. Choosing among them is usually more important
        than writing another transformation.
      </p>

      <h2>Commissioning models cover activity and pathways</h2>
      <p>
        Commissioning feeds are commonly submission-based. Providers send files to
        a timetable and may later correct them, while each national collection has
        its own grain and vocabulary. The staging models make each feed consistent
        for downstream use; modelling and reporting models then express the
        analytical concepts we use repeatedly.
      </p>
      <table>
        <thead>
          <tr>
            <th>Folder</th>
            <th>What we use it for</th>
            <th>Examples downstream</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>sus</code></td>
            <td>Admitted care, outpatients and urgent and emergency care</td>
            <td>
              <code>fct_person_sus_apc_recent</code>,{" "}
              <code>fct_person_sus_op_recent</code>,{" "}
              <code>fct_person_sus_uec_recent</code>
            </td>
          </tr>
          <tr>
            <td><code>wl</code></td>
            <td>Referral-to-treatment waiting-list snapshots</td>
            <td>
              <code>int_wl_current</code>,{" "}
              <code>fct_provider_wl_current_count_total</code>
            </td>
          </tr>
          <tr>
            <td><code>epd</code></td>
            <td>Primary-care prescribing in the English Prescribing Dataset</td>
            <td>Practice- and organisation-level prescribing analysis</td>
          </tr>
          <tr>
            <td><code>csds</code></td>
            <td>Community services referrals, contacts and activity</td>
            <td>Community-service pathway and activity models</td>
          </tr>
          <tr>
            <td><code>mhsds</code></td>
            <td>Mental-health referrals, contacts, spells and ward stays</td>
            <td>Mental-health pathway and activity models</td>
          </tr>
          <tr>
            <td><code>ers</code></td>
            <td>NHS e-Referral Service referrals and actions</td>
            <td>Referral models linked through UBRN and person keys</td>
          </tr>
          <tr>
            <td><code>asc_cld</code></td>
            <td>Adult social care client-level records</td>
            <td>Adult social care analysis</td>
          </tr>
        </tbody>
      </table>
      <p>
        These are the most-used feeds; the staging layer covers thirteen source
        folders in all, each following the same pattern. The modelling and
        reporting layers then settle the concepts the feeds only imply:
      </p>
      <table>
        <thead>
          <tr>
            <th>Folder</th>
            <th>What it holds</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>modelling/commissioning/encounters</code></td>
            <td>
              SUS, CSDS and MHSDS activity standardised into encounters and
              spells — including merging and imputing admitted-patient spells
            </td>
            <td><code>int_sus_apc_merged_spells</code></td>
          </tr>
          <tr>
            <td><code>modelling/commissioning/demographics</code></td>
            <td>
              A person view assembled from PDS and other national datasets
            </td>
            <td><code>int_person_pmi_combined</code></td>
          </tr>
          <tr>
            <td><code>modelling/commissioning/activities</code></td>
            <td>Named activity groupings defined once</td>
            <td><code>int_comm_ambulatory_sensitive_nel</code></td>
          </tr>
          <tr>
            <td><code>modelling/commissioning/cost_index</code></td>
            <td>Monthly costed activity per person across the activity feeds</td>
            <td><code>int_person_cost_index_actual_monthly</code></td>
          </tr>
          <tr>
            <td><code>reporting/commissioning/person_level</code></td>
            <td>
              Person-grain recent-activity facts and current waiting-list
              counts
            </td>
            <td><code>fct_person_sus_apc_recent</code></td>
          </tr>
          <tr>
            <td><code>reporting/commissioning/events</code></td>
            <td>
              Event-grain wide tables for admitted, outpatient and emergency
              care
            </td>
            <td><code>obt_encounter_apc</code></td>
          </tr>
          <tr>
            <td><code>reporting/commissioning/person_history</code></td>
            <td>Monthly person-level activity history</td>
            <td><code>fct_person_activity_by_month</code></td>
          </tr>
          <tr>
            <td><code>reporting/commissioning/resource_index</code></td>
            <td>
              Actual versus expected resource use, with area, deprivation and
              borough breakdowns
            </td>
            <td><code>fct_person_resource_index</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        The folder names are useful search terms. If work concerns emergency
        attendances, search for <code>sus_uec</code>; if it concerns current
        waiting, search for <code>wl_current</code>. That normally leads to a
        reporting model before it leads to staging. The{" "}
        <Link href="/learn/finding-models">Finding models</Link>{" "}lesson turns
        this into a repeatable search process.
      </p>

      <h2>OLIDS uses person_id; cross-dataset linkage uses sk_patient_id</h2>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>What it is</th>
            <th>Use it for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>person_id</code></td>
            <td>
              Our own person identity, minted upstream — not derived from an
              NHS number, so it covers everyone in OLIDS
            </td>
            <td>Every join within OLIDS</td>
          </tr>
          <tr>
            <td><code>sk_patient_id</code></td>
            <td>The pseudonymised NHS number</td>
            <td>
              Linking to commissioning records: SUS activity, waiting lists,
              prescribing
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        One person can hold several patient records across practice
        registrations; <code>stg_olids_patient_person</code>{" "}resolves them,
        and the <code>dim_person_*</code>{" "}models are already at person
        grain.
      </p>
      <p>
        To cross into commissioning data, join{" "}
        <code>dim_person_demographics</code>: it carries{" "}
        <code>sk_patient_id</code>{" "}alongside active status, practice, PCN,
        neighbourhood and borough, so the identifier crossing and the person
        context arrive in one join (<code>dim_person_pseudo</code>{" "}is the
        bare mapping if that is all you need). People without an NHS number sit
        outside that bridge — report the linkage coverage your join achieves,
        and test uniqueness at your model&apos;s grain.
      </p>
      <h2>Use the taxonomy to find a more specific model</h2>
      <p>
        The overview above describes the main kinds of output. Within them, model
        names let you search for the exact question the project has already settled:
      </p>
      <table>
        <thead>
          <tr>
            <th>Question already settled</th>
            <th>Models to search for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Who is the person and where are they registered or resident?</td>
            <td>
              <code>dim_person_demographics</code>,{" "}
              <code>dim_person_current_practice</code>,{" "}
              <code>dim_person_residence</code>
            </td>
          </tr>
          <tr>
            <td>Does the person meet a clinical register definition?</td>
            <td><code>fct_person_*_register</code></td>
          </tr>
          <tr>
            <td>When was a condition active, resolved or diagnosed again?</td>
            <td><code>fct_person_condition_episodes</code></td>
          </tr>
          <tr>
            <td>What did the population look like in each recent month?</td>
            <td><code>person_month_analysis_base</code></td>
          </tr>
          <tr>
            <td>What is their latest qualifying clinical result?</td>
            <td><code>int_*_latest</code></td>
          </tr>
          <tr>
            <td>What recent contact have they had with services?</td>
            <td>
              <code>fct_person_sus_*_recent</code>,{" "}
              <code>fct_person_gp_recent</code>,{" "}
              <code>obt_person_activity</code>
            </td>
          </tr>
          <tr>
            <td>Who is currently waiting and where?</td>
            <td>
              <code>int_wl_current</code>,{" "}
              <code>fct_person_wl_current_count_*</code>,{" "}
              <code>fct_provider_wl_current_count_total</code>
            </td>
          </tr>
          <tr>
            <td>How does service use compare with expectation?</td>
            <td><code>fct_person_resource_index</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        The table is deliberately a search guide rather than a complete catalogue.
        This is why model names matter so much in this project. The prefix tells
        you the model&apos;s role; the entity and subject tell you what it
        describes; suffixes such as <code>_latest</code>{" "}or{" "}
        <code>_current</code>{" "}tell you which shape of the concept it offers.
        The{" "}
        <Link href="/learn/model-naming">model taxonomy</Link>{" "}lesson explains
        the grammar, while Finding models shows how to use it as the project&apos;s
        index.
      </p>

      <h2>A new question should compose these models</h2>
      <p>
        Suppose the request is for people on the diabetes register, their latest
        HbA1c and their recent emergency-care use. The project already provides the
        three main blocks: <code>fct_person_diabetes_register</code>,{" "}
        <code>int_hba1c_latest</code>{" "}and{" "}
        <code>fct_person_sus_uec_recent</code>. The register and HbA1c model join
        within OLIDS on <code>person_id</code>.{" "}
        <code>dim_person_demographics</code>{" "}then supplies{" "}
        <code>sk_patient_id</code>{" "}for the people who can be linked to the SUS
        activity model — along with the practice and status context the output
        will want anyway.
      </p>
      <p>
        It should not return to <code>stg_olids_observation</code>{" "}to derive
        diabetes or HbA1c again, nor to the SUS emergency-care source to recount
        attendances. Doing that would fork definitions the project already owns.
        If an existing model is missing evidence or expresses the wrong contract,
        improve that shared model deliberately; otherwise, reuse it.
      </p>
      <p>
        The result is the practical experience this project is designed to create:
        source cleaning, clinical coding, identity resolution and activity
        deduplication have already been handled upstream. Most downstream work
        should feel like composing named domain concepts rather than rebuilding the
        warehouse from raw records.
      </p>
      <p>
        The <Link href="/learn/data-layers">data layers</Link> lesson explains where
        each of those responsibilities is settled. When answering a new question, use
        the <Link href="/learn/finding-models">model-discovery method</Link> to begin
        from these supported outputs rather than tracing back to source tables.
      </p>

      <h2>Published products apply the required controls</h2>
      <p>
        Models used for a specific report, dashboard, extract or operational
        process are assembled under <code>models/published/</code>. The project
        separates <code>direct_care/</code>{" "}and{" "}
        <code>secondary_use/</code>{" "}products so that purpose and audience are
        visible in the repository rather than left to a dashboard filter.
      </p>
      <p>
        Where an approved secondary-use product needs the project&apos;s opt-out
        population, it can use{" "}
        <code>dim_person_secondary_use_allowed</code>{" "}when composing that
        product. The precise controls follow the product&apos;s approved governance
        and data sources; they should not be inferred simply from the fact that
        data is pseudonymised or belongs to a broad source family. Shared reporting
        models remain reusable, while the published model owns the requirements of
        the product it serves.
      </p>

      <Quiz
        title="Check the project"
        questions={[
          {
            prompt:
              "You need recent emergency attendances for people on the diabetes register. Where should you start?",
            options: [
              "Rebuild both definitions from OLIDS and SUS staging",
              "Join the register to OLIDS models on person_id, bring in dim_person_demographics for sk_patient_id and person context, then join SUS activity",
              "Join OLIDS models to SUS activity directly on person_id",
              "Create a new raw source",
            ],
            answer: 1,
            explain:
              "OLIDS uses person_id internally, and SUS knows nothing about it. dim_person_demographics supplies sk_patient_id where the NHS-number-based pseudonym exists — plus the status and practice context most outputs need — so one join crosses identifier systems and attaches context.",
          },
          {
            prompt:
              "Which model is designed for monthly population-health trends with historical demographics and condition flags already aligned?",
            options: [
              "dim_person_demographics",
              "dim_person_demographics_historical",
              "fct_person_condition_episodes",
              "person_month_analysis_base",
            ],
            answer: 3,
            explain:
              "person_month_analysis_base provides one row per active person per month, combining the demographics for that period with active-condition and new-episode flags.",
          },
          {
            prompt:
              "Where should rules required only by a particular product's purpose or audience be applied?",
            options: [
              "In every staging model",
              "Manually in the dashboard",
              "In the published model that assembles that governed product",
              "In the raw source",
            ],
            answer: 2,
            explain:
              "Published models compose shared reporting concepts for a specific report, dashboard or process and own the controls required by that product.",
          },
        ]}
      />
    </LessonShell>
  );
}
