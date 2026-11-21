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
      kicker="Learn 04"
      title="The data we model"
      minutes={10}
      lede="The project combines GP records, service activity and shared reference data. Before you join them, learn what each source records and how it identifies people."
    >
      <h2>OLIDS holds GP records and commissioning feeds hold service activity</h2>
      <p>
        Most person-level work draws on two families of source. OLIDS holds GP
        clinical records: observations, diagnoses, medication orders, encounters
        and registrations. Commissioning feeds record hospital activity, waiting
        lists, community and mental health services, prescribing and other
        administrative activity. Reference data sits alongside both and supplies
        organisations, geographies and clinical classifications.
      </p>
      <p>
        Each source sees a different part of someone&apos;s care. A GP
        medication order and a hospital attendance are different events. A
        provider may correct a submission later. A missing record could mean no
        activity, a gap in coverage or a link that failed. Knowing why a source
        exists tells you what its records can support.
      </p>
      <p>
        In the repository, GP source preparation lives under{" "}
        <code>models/staging/olids/</code> and commissioning under{" "}
        <code>models/staging/commissioning/</code>. You don&apos;t need to
        memorise every folder. The{" "}
        <Link href="/reference/datasets">dataset and model directory</Link> has
        the full lists when you need them.
      </p>

      <h2>One person can have several patient records</h2>
      <p>
        A patient record belongs to a source context, such as a registration at
        one practice. Someone who has been registered at two practices can have
        two patient records. So counting patient records doesn&apos;t always
        count people. In OLIDS, <code>stg_olids_patient_person</code> links each
        patient record to the project&apos;s person identity.
      </p>
      <p>
        A <strong>person spine</strong> is the starting list of people that you
        attach other information to. The reporting person models have already
        resolved patient records into people, so start from the one whose
        population matches your question. Don&apos;t build another list of
        people from event records. Check what each candidate includes, too.{" "}
        <code>dim_person_demographics</code> has one row per person, but it
        includes inactive, deceased and test patients, so it isn&apos;t the list
        of people registered today.
      </p>
      <table>
        <thead>
          <tr>
            <th>Identifier</th>
            <th>What it identifies</th>
            <th>Where it&apos;s used</th>
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
        The team&apos;s upstream <code>dbt-olids</code> project creates the
        patient and person identities. <code>person_id</code> isn&apos;t derived
        from an NHS number, so people without one can still appear.
        Commissioning datasets identify people by <code>sk_patient_id</code>.
        Some feeds, such as CSDS, have a column called <code>person_id</code>,
        but it&apos;s that feed&apos;s own identifier, not an OLIDS one. Joining
        on it doesn&apos;t link anyone to OLIDS. Link through{" "}
        <code>sk_patient_id</code>.
      </p>

      <h2>Linking to commissioning data can leave people unmatched</h2>
      <p>
        We link OLIDS people to commissioning records through{" "}
        <code>sk_patient_id</code>, the pseudonymised NHS number both sides
        carry. Someone without an <code>sk_patient_id</code> can&apos;t be
        linked this way, so their service activity won&apos;t show up in the
        join. <code>dim_person_pseudo</code> holds the mapping on its own.{" "}
        <code>dim_person_demographics</code> carries <code>sk_patient_id</code>{" "}
        next to person context such as practice and geography. These made-up
        rows show why the mapping is a relationship of its own.
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
        That&apos;s three patient records but two people. P1 can match a
        commissioning record that carries X101. P2 has no NHS-number-based
        identifier here, so there&apos;s nothing to link on. That doesn&apos;t
        mean P2 had no service activity. It means this route can&apos;t see it.
      </p>
      <p>
        Two details of <code>dim_person_pseudo</code> matter when you join. It
        only holds people who have an <code>sk_patient_id</code>, so P2 has no
        row in it at all. And the mapping isn&apos;t always one-to-one. Two{" "}
        <code>person_id</code> values can share one <code>sk_patient_id</code>,
        so joining a commissioning record on <code>sk_patient_id</code> can
        bring back two people.
      </p>
      <p>
        An inner join to commissioning activity keeps only the people who match.
        A left join keeps your whole starting population and leaves the activity
        columns empty for people who didn&apos;t match. Either join can repeat a
        person when several activity rows match. The next chapter covers how
        joins change rows. For now, keep two questions apart. How many people
        linked? And what activity was recorded for the people who did?
      </p>
      <p>
        Report linkage coverage for the population you chose, and check that the
        keys you join on are unique. Don&apos;t assume every commissioning feed
        links to people at all. SLAM aggregate contract monitoring,{" "}
        <code>stg_lsacm</code>, holds activity and prices by provider and has no
        patient-level fields. A provider&apos;s activity total there can&apos;t
        be split back into people.
      </p>

      <h2>OLIDS models turn records into clinical concepts</h2>
      <p>
        Our OLIDS models turn GP records into clinical concepts, such as a
        person&apos;s latest HbA1c result or whether they&apos;re on the
        diabetes register. Their inputs arrive from <code>dbt-olids</code> with
        identifiers, names and clinical terminology already prepared.
        Observation and medication order models carry mapped SNOMED codes and
        descriptions, and medication orders carry BNF classifications too. In
        this guide, those prepared tables are the source.
      </p>
      <p>
        <code>int_hba1c_all</code> holds qualifying HbA1c results.{" "}
        <code>int_hba1c_latest</code> picks the latest valid result for each
        person. A register such as <code>fct_person_diabetes_register</code>{" "}
        applies an agreed clinical definition, so its rows mean something
        different from a list of diagnosis records.
      </p>
      <p>
        That difference matters when you check an answer. Finding a diagnosis
        code is evidence. Deciding someone is on a register can also depend on
        dates, exclusions and other criteria. In the diabetes register, someone
        aged 17 or over with a diabetes diagnosis qualifies unless a resolution
        code was recorded on a later date. The model&apos;s description and the
        evidence columns it keeps tell you which interpretation it made. Its
        name helps you find it, but doesn&apos;t prove it fits your question.
      </p>

      <h2>Commissioning models describe activity and pathways</h2>
      <p>
        Each commissioning feed covers one area of care and has its own
        identifiers, submission rules and units of activity. SUS covers
        admitted care, outpatients, and urgent and emergency care. CSDS covers
        community services, and MHSDS covers mental health activity.
        Waiting-list feeds record pathways as they stood on each reporting
        date.
      </p>
      <p>
        A hospital spell, an appointment and a waiting-list pathway are
        different things to count, and one person can have several of each. Some
        models summarise activity per person.{" "}
        <code>fct_person_sus_uec_recent</code>, for example, holds one row per
        patient with their A&amp;E attendance counts over the last 12 months.
        Event models keep each encounter as its own row. Use the person summary
        when you need people&apos;s totals, and the event model when you need
        the events.
      </p>
      <p>
        <code>int_wl_current</code> keeps the latest week-ending date found in
        its staging input. A recent date doesn&apos;t prove every provider has
        submitted for that week. Check which providers and which period the data
        covers before you read a movement as a change in demand.
      </p>

      <h2>Pick models that describe the period your question covers</h2>
      <p>
        Some models describe people as they are today and others keep their
        history, so choose the one that matches the period your question is
        about. Someone&apos;s practice today may not be the practice that was
        responsible for them during last year&apos;s activity.{" "}
        <code>dim_person_demographics</code> holds each person&apos;s latest
        demographics. <code>dim_person_demographics_historical</code> keeps each
        period of change. Neither model is better. They answer different
        questions.
      </p>
      <p>
        <code>fct_person_condition_episodes</code> records condition episodes
        with start and end dates. <code>person_month_analysis_base</code>{" "}
        combines historical demographics and condition flags into one row per
        registered person per finished calendar month. Lining up time is part of
        its job, so it&apos;s a good place to start for monthly population
        trends.
      </p>
      <p>
        Read a model&apos;s documented population and period before you use it.
        Adding an earlier date to a table that describes people today
        doesn&apos;t turn it into a historical population.
      </p>

      <h2>Each published product has an approved purpose</h2>
      <p>
        Published models assemble data for a named report, dashboard, extract or
        operational process. The project keeps direct-care and secondary-use
        products apart, so you can see each one&apos;s purpose and audience. The
        access, disclosure and exclusion rules come from the product&apos;s
        approved governance and from its sources.
      </p>
      <p>
        When a product needs it, <code>dim_person_secondary_use_allowed</code>{" "}
        supplies the people the project allows for secondary use. Today a person
        needs two things. Their latest National Data Opt-Out record has to say{" "}
        <code>OPT_IN</code>, and they can&apos;t have an active Type 1 opt-out.
        Someone with no National Data Opt-Out record, or an unknown status,
        isn&apos;t included. Joining to that model doesn&apos;t make a new use
        approved. Pseudonymisation doesn&apos;t settle which controls apply
        either, and neither does a broad label on the source family.
      </p>
      <p>
        The <Link href="/learn/data-layers">data layers chapter</Link> explains
        where shared definitions and product rules belong. First,{" "}
        <Link href="/learn/analytical-tables">
          Understanding analytical tables
        </Link>{" "}
        shows how to reason about the rows you&apos;ll join.
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
              "Patient records and people are different things to count. Use the supported person relationship instead of assuming one patient record per person.",
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
              "Missing linkage isn't evidence of no activity. The analysis should state its starting population and the coverage its joins achieved.",
          },
        ]}
      />
    </LessonShell>
  );
}
