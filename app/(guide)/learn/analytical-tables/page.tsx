import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { FactDimensionDiagram } from "@/components/FactDimensionDiagram";
import { GrainFanout } from "@/components/GrainFanout";
import { LessonQuote } from "@/components/LessonQuote";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Understanding analytical tables" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="analytical-tables"
      kicker="Learn 05"
      title="Understanding analytical tables"
      minutes={18}
      lede="Before you pick a model or write a join, work out what one row represents, which rows are included and what period they cover. That one habit stops a lot of plausible-looking queries from answering the wrong question."
    >
      <h2>What does one row represent?</h2>
      <p>
        The <strong>grain</strong> of a table is what one row represents.
        Work it out before you count anything. Say someone asks how many
        people attended an appointment at each practice. You find a table of
        appointments, where the grain is one appointment. Counting its rows
        sounds reasonable, but a person can attend more than once. A count of
        appointments and a count of people answer different questions, even
        when they come from the same table.
      </p>
      <p>Every identifier on this page is made up.</p>
      <LessonQuote
        attribution="Kimball Group"
        work="Kimball Dimensional Modeling Techniques: Grain"
        href="https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/"
      >
        Declaring the grain is the pivotal step in a dimensional design. The
        grain establishes exactly what a single fact table row represents. The
        grain declaration becomes a binding contract on the design.
      </LessonQuote>
      <p>
        Hold on to that word &quot;contract&quot;. It comes back at the end of
        this page, and it runs through the rest of the guide.
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
        Four rows, four appointments, three people. P1 appearing twice is
        expected, and removing the repeat would throw away a real appointment.
        Whether a repeated value counts as a duplicate depends on what the
        table promises.
      </p>
      <p>
        A <strong>key</strong> is a column, or a combination of columns, that
        identifies a row. Here, <code>appointment_id</code> identifies each
        appointment. <code>person_id</code> tells you whose appointment it is,
        but it doesn&apos;t identify the appointment, because P1 has two. A
        column can be a perfectly good join key without being unique in both
        tables.
      </p>

      <h2>Population and time decide which rows count</h2>
      <p>
        Grain tells you what a row is. The population and the reporting period
        tell you which rows count. The request is about people who attended,
        so the cancelled appointment doesn&apos;t count. It also needs a
        period. Without one, the query might count all recorded
        history when the requester meant March.
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
        The <code>where</code> clause picks the qualifying rows.{" "}
        <code>group by</code> collects them by practice and returns one row for
        each practice with at least one qualifying appointment. Inside each
        group, <code>count(*)</code> counts rows and{" "}
        <code>count(distinct person_id)</code> counts different people.
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
        The output is now at practice grain. The individual appointments are
        gone, so it can&apos;t tell you which dates P1 attended. Aggregating is
        a useful way to change grain, but it throws detail away. Keep the
        appointment model around for the questions that need it.
      </p>
      <p>
        A practice with no qualifying appointments gets no row at all. If you
        want every practice, zeros included, you need a starting list of
        practices joined to the counts. That&apos;s a decision about
        population. Don&apos;t leave it as a formatting fix for the dashboard.
      </p>

      <h2>A join can change the grain</h2>
      <p>
        A join returns one row for each matching pair, so it can multiply
        rows. Say a person table has one row each for P1, P2 and P3. Joining
        appointments to it adds person attributes without changing the
        appointment grain, as long as each appointment matches at most one
        person. Flip the starting point and the question changes. Join all
        appointments onto the person table and P1 now has two rows.
      </p>
      <p>
        This is a <strong>one-to-many relationship</strong>. One person can
        have many appointments. The admissions example below works the same
        way. Guess how many rows the result will have before you reveal the
        join.
      </p>
      <GrainFanout />
      <p>
        SQL did exactly what it was asked. It returns a row for each matching
        pair. The mistake comes later, when we keep describing or counting the
        output as one row per person. This multiplying of rows is usually
        called <strong>fan-out</strong>.
      </p>
      <p>
        If you need one row per person with an appointment count, group
        appointments by person first, then join the counts. If you need the
        latest appointment, pick one per person using an agreed date and
        tie-break rule. If you need every appointment, keep appointment grain
        and say so. Those are three answers to three different questions, not
        interchangeable fixes.
      </p>
      <p>
        Adding <code>distinct</code> to the final query doesn&apos;t tell you
        which answer you need. Different appointment dates still produce
        different rows. Strip the dates out as well and the rows may collapse,
        hiding what was lost. Decide the grain you want first. Then
        choose the transformation.
      </p>

      <h2>Missing matches also change the answer</h2>
      <p>
        An <code>inner join</code> keeps matching pairs. A{" "}
        <code>left join</code> also keeps left-hand rows with no match, and
        fills the right-hand columns with nulls. Neither join guarantees one
        row per left-hand record. Several matches still produce several rows.
      </p>
      <p>
        Picture a fourth person, P4, with no appointment record. An inner join
        from people to appointments drops P4. A left join keeps P4, with null
        appointment fields. Which one is right depends on the question. Are you
        asking about attendees, or about everyone, including people with no
        recorded appointment?
      </p>
      <p>
        A filter on a right-hand column can quietly undo the left join. After a
        left join, <code>where appointment.status = &apos;attended&apos;</code>{" "}
        removes the unmatched rows, because null doesn&apos;t satisfy the
        condition. If you meant to keep every person, filter the appointments
        before joining, or put the condition in the join itself. Then check who
        ended up in the result, not just whether the SQL ran.
      </p>
      <p>
        A null doesn&apos;t tell you why a match is missing. The person may
        have had no appointment. Their identifier may be unavailable. The feed
        may not cover their provider. Only turn missing counts into zero when
        the data&apos;s coverage and definition back that up. A missing
        clinical measurement is not evidence of a normal result.
      </p>

      <h2>Facts record the subject; dimensions provide context</h2>
      <p>
        Dimensional modelling organises data around what an analysis measures
        and the context used to describe it. An appointment{" "}
        <strong>fact</strong> records appointments, perhaps with duration or
        waiting time. Person, practice and date <strong>dimensions</strong>{" "}
        supply attributes like ethnicity, practice name and financial year.
      </p>
      <FactDimensionDiagram variant="traditional" />
      <p>
        These names describe analytical roles, not sizes. A fact doesn&apos;t
        have to be a big table, and a dimension doesn&apos;t have to be small.
        Having a numeric column doesn&apos;t make something a fact either. Age
        describes a person, and you can count appointments without storing a
        count column.
      </p>
      <p>
        In this project, facts also record clinical states. A disease-register
        model can hold one row for each person who meets an agreed definition.
        Counting those rows measures register membership. Ethnicity and
        practice dimensions describe the people included.
      </p>
      <FactDimensionDiagram variant="population" />
      <p>
        Someone might later use a register flag to group another analysis, and
        analysts do count dimension rows. We name a model for its main purpose,
        not for every way it could be used. The naming chapter later explains
        the project&apos;s <code>fct_</code> and <code>dim_</code> prefixes.
      </p>
      <p>
        A <strong>mart</strong> is a supported dataset prepared for analysis
        around a subject such as appointments or people. It may already include
        descriptive columns joined in from dimensions, which saves every analyst
        repeating those joins. The extra columns should keep the stated grain,
        and the shared definitions behind them should still have clear owners
        upstream.
      </p>

      <h2>Choose current or historical context for a join</h2>
      <p>
        Details such as a person&apos;s registered practice change over time,
        so a join has to pick which version to use. P1 might attend at GP_A in March and register with GP_B in April. Join
        March&apos;s activity to today&apos;s registration and that activity
        lands under GP_B. That&apos;s useful if you&apos;re reviewing the
        current population&apos;s past service use. It doesn&apos;t tell you
        which practice was responsible in March.
      </p>
      <p>
        Decide which relationship the question needs. Current models describe
        the state right now. Historical models keep the changes or events. A
        point-in-time result evaluates its inputs as of a date you choose.
        Adding a date label to today&apos;s rows doesn&apos;t recreate an
        earlier population.
      </p>
      <p>
        Historical tables often need a combined key. One row per person per
        month means a person can repeat and a month can repeat, but a
        person-month pair shouldn&apos;t. Join on the person identifier alone
        and you may match several months. The time relationship has to be part
        of the join too.
      </p>

      <h2>Describe the rows before you write the SQL</h2>
      <p>
        Before you write the SQL, describe what one row represents, which
        records qualify and what period the result covers. For our summary
        that&apos;s &quot;one row per practice with an attended appointment in
        March 2026, with appointment and distinct-person counts for that
        month&quot;. Now someone can challenge the population or the time
        window before anyone reads the query.
      </p>
      <p>
        The guide calls these documented statements about a model&apos;s rows
        its <strong>contract</strong>.
        That&apos;s broader than dbt&apos;s optional enforced model contracts,
        which check declared columns and types. Tests can protect individual
        promises, like a unique key. They can&apos;t tell you whether you asked
        the right question.
      </p>
      <p>
        The next chapter shows how dbt connects these tables through{" "}
        <Link href="/learn/refs-and-sources">model dependencies</Link>.{" "}
        <Link href="/learn/model-design">Designing models</Link> comes back
        later to the harder choices about history, uncertainty and where a
        definition should live.
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
              "The table is at appointment grain, so P1 appearing twice is valid. Counting distinct person identifiers answers the separate question about people.",
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
              "A left join keeps unmatched people, but it still returns one row for every match. Several appointments can multiply a person row.",
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
              "Person and month can each repeat on their own. The person-month combination is what expresses this grain.",
          },
        ]}
      />
    </LessonShell>
  );
}
