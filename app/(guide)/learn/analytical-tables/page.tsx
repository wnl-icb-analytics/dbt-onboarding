import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { FactDimensionDiagram } from "@/components/FactDimensionDiagram";
import { GrainFanout } from "@/components/GrainFanout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Understanding analytical tables" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="analytical-tables"
      kicker="Learn 04"
      title="Understanding analytical tables"
      minutes={18}
      lede="Before choosing a model or writing a join, work out what its rows mean. That one habit prevents many plausible queries from answering the wrong question."
    >
      <h2>What does one row represent?</h2>
      <p>
        Suppose someone asks how many people attended an appointment at each
        practice. You find a table of appointments. Counting its rows sounds
        reasonable, but a person can attend more than once. A count of
        appointments and a count of people answer different questions, even when
        they come from the same table.
      </p>
      <p>
        The <strong>grain</strong> of a table is what one row represents. In
        this fictional example, the grain is one appointment. All example
        identifiers on this page are invented.
      </p>
      <table>
        <thead>
          <tr>
            <th>appointment_id</th>
            <th>person_id</th>
            <th>practice_code</th>
            <th>appointment_date</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A1</td>
            <td>P1</td>
            <td>GP_A</td>
            <td>2026-03-03</td>
            <td>attended</td>
          </tr>
          <tr>
            <td>A2</td>
            <td>P1</td>
            <td>GP_A</td>
            <td>2026-03-17</td>
            <td>attended</td>
          </tr>
          <tr>
            <td>A3</td>
            <td>P2</td>
            <td>GP_A</td>
            <td>2026-03-18</td>
            <td>cancelled</td>
          </tr>
          <tr>
            <td>A4</td>
            <td>P3</td>
            <td>GP_B</td>
            <td>2026-03-20</td>
            <td>attended</td>
          </tr>
        </tbody>
      </table>
      <p>
        Four rows describe four appointments and three people. P1 appearing
        twice is expected. Removing that repetition would throw away an
        appointment. Whether a repeated value is a duplicate depends on what the
        table promises.
      </p>
      <p>
        A <strong>key</strong> is a column, or combination of columns, that
        identifies a row. Here, <code>appointment_id</code> identifies each
        appointment. <code> person_id</code> identifies its person, but does not
        identify the appointment: P1 has two. A column can be a useful join key
        without being unique in both tables.
      </p>

      <h2>Population and time complete the question</h2>
      <p>
        Grain alone is not enough. The request concerns people who attended, so
        the cancelled appointment does not qualify. We also need a reporting
        period. Without one, the same query might count all recorded history
        when the requester meant March.
      </p>
      <CodeBlock
        lang="sql"
        title="Illustrative SQL against the appointments above"
        code={`select
    practice_code,
    count(*) as attended_appointments,
    count(distinct person_id) as people_who_attended
from example_appointments
where status = 'attended'
    and appointment_date >= '2026-03-01'
    and appointment_date < '2026-04-01'
group by practice_code`}
      />
      <p>
        The <code>where</code> clause chooses the qualifying rows.{" "}
        <code> group by</code> collects them by practice and produces one output
        row for each practice that has a qualifying appointment. Within each
        group, <code> count(*)</code> counts rows and{" "}
        <code>count(distinct person_id)</code> counts different person
        identifiers.
      </p>
      <table>
        <thead>
          <tr>
            <th>practice_code</th>
            <th>attended_appointments</th>
            <th>people_who_attended</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GP_A</td>
            <td>2</td>
            <td>1</td>
          </tr>
          <tr>
            <td>GP_B</td>
            <td>1</td>
            <td>1</td>
          </tr>
        </tbody>
      </table>
      <p>
        The output now has practice grain. It no longer contains individual
        appointments, so it cannot answer which date P1 attended. Aggregation is
        a useful change of grain, but it removes detail. Keep the appointment
        model available for questions that need that detail.
      </p>
      <p>
        A practice with no qualifying appointments has no row in this result.
        Showing every practice, including zero counts, requires a starting list
        of practices and a join to the counts. That is a population decision,
        not a formatting choice to leave until the dashboard.
      </p>

      <h2>A join can change the grain</h2>
      <p>
        Suppose a person table contains one row each for P1, P2 and P3. Joining
        appointments to that table can add person attributes without changing
        appointment grain, provided each appointment matches at most one person
        row. Reversing the starting point changes the question: joining all
        appointments onto the person table gives P1 two rows.
      </p>
      <p>
        This is a <strong>one-to-many relationship</strong>. One person can have
        many appointments. The same thing happens with admissions below. Predict
        the number of result rows before revealing the join.
      </p>
      <GrainFanout />
      <p>
        SQL has done what it was asked to do. It returns a row for each matching
        pair. The error appears when we continue describing or counting the
        output as one row per person. This multiplication of rows is often
        called <strong>fan-out</strong>.
      </p>
      <p>
        If the required output is one row per person with an appointment count,
        group the appointments by person first and then join the counts. If it
        needs the latest appointment, choose one appointment per person using an
        agreed date and tie-breaking rule. If it needs all appointments, keep
        appointment grain and describe it honestly. These are different answers,
        not interchangeable fixes.
      </p>
      <p>
        Adding <code>distinct</code> to the final query does not decide which
        answer you need. Different appointment dates still produce different
        rows. If you remove the dates too, the rows may collapse while the lost
        information goes unnoticed. First decide the intended grain; then choose
        the transformation.
      </p>

      <h2>Missing matches also change the answer</h2>
      <p>
        An <code>inner join</code> retains matching pairs. A{" "}
        <code>left join</code> also retains rows from the left-hand table with
        no match, filling the right-hand columns with nulls. Neither join
        guarantees one row per left-hand record: several matches still produce
        several rows.
      </p>
      <p>
        Imagine a fourth person, P4, with no appointment record. An inner join
        from people to appointments excludes P4. A left join keeps P4 with null
        appointment fields. Which is right depends on whether the question
        concerns attendees or all people, including those with no recorded
        appointment.
      </p>
      <p>
        A filter on a right-hand column can undo that preservation. After a left
        join, <code> where appointment.status = &apos;attended&apos;</code>{" "}
        removes the unmatched rows because null does not satisfy the condition.
        If the intention is to keep every person, filter the appointment input
        before joining, or put that condition in the join itself. Check the
        resulting population, not just the SQL syntax.
      </p>
      <p>
        Null does not explain why a match is missing. A person may have no
        appointment, an identifier may be unavailable, or a feed may not cover
        their provider. Turning every missing count into zero is justified only
        when the data&apos;s coverage and definition support that
        interpretation. A missing clinical measurement is not evidence of a
        normal result.
      </p>

      <h2>Facts record the subject; dimensions provide context</h2>
      <p>
        Dimensional modelling organises data around the things an analysis
        measures and the context used to describe them. An appointment{" "}
        <strong>fact</strong> records appointments, perhaps with duration or
        waiting time. Person, practice and date <strong>dimensions</strong>{" "}
        provide attributes such as ethnicity, practice name and financial year.
      </p>
      <FactDimensionDiagram variant="traditional" />
      <p>
        These names describe analytical roles. A fact does not need to be a
        large table, and a dimension does not need to be small. A numeric column
        is not enough to make something a fact: age can describe a person, while
        an appointment can be counted without a stored count column.
      </p>
      <p>
        In this project, facts also record clinical states. A disease-register
        model can contain one row for each person meeting an agreed definition.
        Counting those rows measures register membership. Ethnicity and practice
        dimensions describe the people included.
      </p>
      <FactDimensionDiagram variant="population" />
      <p>
        A register flag might later be used to group another analysis, and
        analysts can count dimension rows. The model&apos;s name follows its
        primary purpose, not every possible use. The later naming chapter
        explains the project&apos;s <code> fct_</code> and <code>dim_</code>{" "}
        prefixes.
      </p>
      <p>
        A <strong>mart</strong> is a supported dataset prepared for analysis
        around a subject such as appointments or people. It may include
        descriptive columns already joined from dimensions. That saves each
        analyst repeating the joins. Those extra columns should preserve the
        stated grain, and the shared definitions should still have clear owners
        upstream.
      </p>

      <h2>The same person can have different context over time</h2>
      <p>
        P1 might attend at GP_A in March and register with GP_B in April.
        Joining March activity to today&apos;s registration would group that
        activity under GP_B. That can be useful for reviewing the current
        population&apos;s past service use, but it does not answer which
        practice was responsible in March.
      </p>
      <p>
        Decide which relationship the question needs. Current models describe a
        current state; historical models retain changes or events. A
        point-in-time result evaluates the relevant inputs at a specified date.
        A date label added to today&apos;s rows does not recreate an earlier
        population.
      </p>
      <p>
        Historical tables often need a combined key. One row per person per
        month means a person can repeat and a month can repeat, but the same
        person-month combination should not. Joining on the person identifier
        alone may match several months. The time relationship belongs in the
        join as well.
      </p>

      <h2>Write the promise before the query</h2>
      <p>
        A useful model description answers what one row represents, which
        records qualify and when the result is true. For our summary: one row
        per practice with an attended appointment in March 2026, with
        appointment and distinct-person counts for that month. Someone can now
        challenge the population or time window before SQL obscures the
        disagreement.
      </p>
      <p>
        The handbook calls these promises a model&apos;s{" "}
        <strong>contract</strong>. Here that means its documented analytical
        meaning. It is broader than dbt&apos;s optional enforced model-contract
        feature, which checks declared columns and types. Tests can protect
        particular promises, such as a unique key; they cannot decide whether we
        chose the right question.
      </p>
      <p>
        The next chapter explains how dbt connects these tables through{" "}
        <Link href="/learn/refs-and-sources">model dependencies</Link>.{" "}
        <Link href="/learn/model-design">Designing models</Link> later returns
        to harder choices about history, uncertainty and where a definition
        should live.
      </p>
      <Quiz
        title="Read the rows"
        questions={[
          {
            prompt:
              "P1 has two attended appointments at GP_A. What does counting the appointment rows measure?",
            options: [
              "Two appointments",
              "Two different people",
              "Two practices",
              "A duplicate that must be removed",
            ],
            answer: 0,
            explain:
              "The table is at appointment grain. P1 appearing twice is valid; distinct person identifiers answer the separate question about people.",
          },
          {
            prompt:
              "A person table is left-joined to all appointments. Does the left join preserve one row per person?",
            options: [
              "Always",
              "Only if each person matches at most one appointment row",
              "Only if all columns are selected",
              "Yes, if person_id is unique in the person table",
            ],
            answer: 1,
            explain:
              "A left join preserves unmatched people, but still returns one row for every match. Several appointments can multiply a person row.",
          },
          {
            prompt:
              "A model promises one row per person per month. Which values must identify a row together?",
            options: [
              "Person alone",
              "Month alone",
              "Person and month",
              "Practice and age",
            ],
            answer: 2,
            explain:
              "Both individual columns can repeat. It is the person-month combination that expresses this grain.",
          },
        ]}
      />
    </LessonShell>
  );
}
