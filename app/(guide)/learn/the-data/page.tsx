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
      minutes={10}
      lede="The project brings together GP records, service activity and shared reference data. Before joining them, understand what each source records and how its people are identified."
    >
      <h2>Two source families answer different questions</h2>
      <p>
        Most person-level work draws on two broad families. OLIDS provides
        detailed GP clinical records: observations, diagnoses, medication
        orders, encounters and registrations. Commissioning feeds record
        hospital activity, waiting lists, community and mental-health services,
        prescribing and other administrative activity. Reference data supplies
        organisations, geographies and clinical classifications.
      </p>
      <p>
        These sources observe different parts of a person&apos;s care. A GP
        medication order and a hospital attendance describe different events. A
        provider submission may be corrected later. The absence of a record can
        mean no activity, incomplete coverage or a failed link. The
        source&apos;s purpose helps you decide what its records can support.
      </p>
      <p>
        In the repository, GP source preparation is under{" "}
        <code>models/staging/olids/</code>. Commissioning source preparation is
        under <code>models/staging/commissioning/</code>. You do not need to
        remember every folder. The{" "}
        <Link href="/reference/datasets"> dataset and model directory</Link>{" "}
        keeps the detailed lists available when you need them.
      </p>

      <h2>A person can have several patient records</h2>
      <p>
        A patient record belongs to a source context, such as a practice
        registration. One person may have several such records. Counting patient
        records is therefore not necessarily counting people. In OLIDS,{" "}
        <code>stg_olids_patient_person</code> provides the relationship between
        those records and the project&apos;s person identity.
      </p>
      <p>
        A <strong>person spine</strong> is the starting list of people to which
        other information is attached. The reporting person models have already
        resolved the patient-to-person relationship. Start with the model whose
        included population matches the question, rather than constructing
        another person list from events.
      </p>
      <table>
        <thead>
          <tr>
            <th>Identifier</th>
            <th>What it identifies</th>
            <th>Where it is used</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>person_id</code>
            </td>
            <td>The project&apos;s OLIDS person identity</td>
            <td>Links between OLIDS person models</td>
          </tr>
          <tr>
            <td>
              <code>sk_patient_id</code>
            </td>
            <td>A pseudonymised NHS number</td>
            <td>Supported links to person-level commissioning data</td>
          </tr>
        </tbody>
      </table>
      <p>
        The upstream <code>dbt-olids</code> project creates the local patient
        and person identities. <code>person_id</code> is not derived from an NHS
        number, so people without one can still be represented. Commissioning
        datasets do not share that OLIDS identifier.
      </p>

      <h2>Cross-dataset linkage can leave people unmatched</h2>
      <p>
        <code>dim_person_demographics</code> supplies <code>sk_patient_id</code>{" "}
        alongside person context such as practice and geography.{" "}
        <code>dim_person_pseudo</code> provides the identifier mapping when that
        is all you need. The following fictional rows show why that mapping is a
        separate relationship.
      </p>
      <table>
        <thead>
          <tr>
            <th>Patient record</th>
            <th>person_id</th>
            <th>sk_patient_id</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Record A</td>
            <td>P1</td>
            <td>X101</td>
          </tr>
          <tr>
            <td>Record B</td>
            <td>P1</td>
            <td>X101</td>
          </tr>
          <tr>
            <td>Record C</td>
            <td>P2</td>
            <td>null</td>
          </tr>
        </tbody>
      </table>
      <p>
        There are three patient records but two people. P1 can be matched to a
        commissioning record carrying X101. P2 cannot be linked through an
        NHS-number-based identifier here. That does not establish that P2 had no
        service activity.
      </p>
      <p>
        An inner join to commissioning activity keeps matching people only. A
        left join can retain the starting population, with missing activity
        fields for unmatched people. Both joins can repeat a person if several
        activity rows match. The next chapter explains those row changes. For
        now, keep two questions separate: how many people linked, and what
        activity was recorded for those people?
      </p>
      <p>
        Report linkage coverage for your chosen population and check the
        uniqueness of the keys used. Do not assume every commissioning feed
        supports person linkage. For example, the English Prescribing Dataset
        supports practice-level prescribing analysis; a practice total is not a
        person&apos;s medication history.
      </p>

      <h2>OLIDS models turn records into clinical concepts</h2>
      <p>
        OLIDS arrives from the upstream dbt project with identifiers, names and
        clinical terminology already prepared. Observation and medication-order
        models include mapped SNOMED codes and descriptions; medication orders
        also carry BNF classifications. In this handbook, those prepared tables
        are the source.
      </p>
      <p>
        The analytical project then interprets those records. For example,{" "}
        <code> int_hba1c_all</code> contains qualifying HbA1c results, while{" "}
        <code> int_hba1c_latest</code> selects a result per person. A register
        such as <code> fct_person_diabetes_register</code> applies an agreed
        clinical definition. Its result has a different meaning from a list of
        diagnosis records.
      </p>
      <p>
        That distinction matters when validating an answer. Finding a code is
        evidence; determining register membership can also require dates,
        exclusions and other criteria. The model description and retained
        evidence explain which interpretation was made. The model name helps you
        find it, but does not establish its suitability.
      </p>

      <h2>Commissioning models describe activity and pathways</h2>
      <p>
        SUS covers admitted care, outpatients and urgent and emergency care.
        CSDS covers community services; MHSDS covers mental-health activity.
        Waiting-list feeds record pathways at reporting dates. These feeds have
        their own identifiers, submission rules and units of activity.
      </p>
      <p>
        A hospital spell, an appointment and a waiting-list pathway are
        different things to count. One person can have several of each. Models
        such as <code> fct_person_sus_uec_recent</code> summarise activity at
        person level, while event models retain individual encounters. Choose
        according to whether you need people&apos;s activity totals or the
        events themselves.
      </p>
      <p>
        <code>int_wl_current</code> selects the most recent waiting-list census
        date present in its staging input. A recent date alone does not
        establish that every provider&apos;s submission is complete. Check the
        coverage and period represented before interpreting a movement as a
        change in demand.
      </p>

      <h2>Choose the data&apos;s time as well as its subject</h2>
      <p>
        <code>dim_person_demographics</code> gives current person context.{" "}
        <code> dim_person_demographics_historical</code> retains change periods.
        A person&apos;s current practice may differ from the practice
        responsible for them during last year&apos;s activity. Neither shape is
        universally better; they answer different questions.
      </p>
      <p>
        <code>fct_person_condition_episodes</code> describes condition episodes
        with start and end dates. <code>person_month_analysis_base</code>{" "}
        combines historical demographics and condition information into one row
        per active person per month. It is a useful candidate for monthly
        population trends because the time alignment is part of its purpose.
      </p>
      <p>
        Read the documented population and period before using these models. A
        table describing people today cannot reconstruct a historical population
        merely by adding an earlier date to the output.
      </p>

      <h2>Products have an approved purpose</h2>
      <p>
        Published models assemble data for a named report, dashboard, extract or
        operational process. The project separates direct-care and secondary-use
        products so their purpose and audience are visible. The appropriate
        access, disclosure and exclusion rules follow the product&apos;s
        approved governance and its sources.
      </p>
      <p>
        Where required, <code>dim_person_secondary_use_allowed</code> supplies
        the project&apos;s allowed population for the relevant product. Its
        current definition considers National Data Opt-Out and Type 1 opt-out
        status. Using that model does not by itself establish that a new use is
        approved. Nor does pseudonymisation or a broad source-family label
        settle which controls apply.
      </p>
      <p>
        The <Link href="/learn/data-layers">data layers chapter</Link> explains
        where shared definitions and product-specific requirements belong.
        First,{" "}
        <Link href="/learn/analytical-tables">
          {" "}
          Understanding analytical tables
        </Link>{" "}
        shows how to reason about the rows you will join.
      </p>
      <Quiz
        title="Interpret the source"
        questions={[
          {
            prompt:
              "Two OLIDS patient records map to the same person_id. What does that establish?",
            options: [
              "There are two people",
              "There are two records for one person",
              "One record must be deleted",
              "Both records have hospital activity",
            ],
            answer: 1,
            explain:
              "Patient records and people are different things to count. Use the supported person relationship rather than assuming one patient record per person.",
          },
          {
            prompt:
              "A person has no sk_patient_id in the linkage model. What can you conclude?",
            options: [
              "They had no hospital care",
              "They should be excluded from every analysis",
              "This identifier route cannot link them to commissioning records",
              "Their OLIDS records are invalid",
            ],
            answer: 2,
            explain:
              "Missing linkage is not evidence of no activity. The analysis must state its starting population and the coverage achieved by its joins.",
          },
        ]}
      />
    </LessonShell>
  );
}
