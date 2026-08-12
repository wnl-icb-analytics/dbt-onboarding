import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";
import { LessonQuote } from "@/components/LessonQuote";

export const metadata: Metadata = { title: "Analysts and dbt" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="analysts-and-dbt"
      kicker="Learn 02"
      title="Analysts and dbt"
      lede="dbt applies software-engineering practices to analytical work. That makes the workflow engineering-shaped, but it does not make analytical meaning the exclusive responsibility of engineers or data scientists."
      minutes={10}
    >
      <h2>Engineering practices do not settle analytical meaning</h2>
      <p>
        There is a real reason people associate dbt with engineering. A dbt project is
        code in Git. Changes are reviewed, tested and deployed through controlled
        environments. Models have dependencies and production schedules. Someone has
        to operate the platform, manage access and recover it when it fails. Those are
        engineering concerns, and pretending otherwise would make the system less safe.
      </p>
      <p>
        But dbt is not only the platform that runs the SQL. It is also where the
        organisation records what its data means. Which diagnoses define a register,
        what counts as a current relationship, which date should be used for recency,
        what one row represents and which population an output includes are analytical
        and domain decisions. Engineers can help make those decisions reproducible;
        their job title does not give them sole authority to make them.
      </p>
      <p>
        Analysts already make these decisions in worksheets, stored procedures and
        dashboards. Contributing through dbt does not turn the decisions into a new
        category of work. It gives them a shared home, exposes their dependencies and
        puts them through review and testing before the organisation relies on them.
      </p>

      <h2>Hats, not badges</h2>
      <LessonQuote
        source="Tristan Handy, The Analytics Development Lifecycle"
        href="https://www.getdbt.com/resources/the-analytics-development-lifecycle"
      >
        The most effective data practitioners can wear all three hats. And the
        best data tooling enables as many people as possible to wear all three
        hats. Even with great tooling, you will still have a hat you prefer. But
        the ability to wear all of them as the situation demands allows you to
        complete a single end-to-end task yourself, without getting stuck behind
        someone else&apos;s queue.
      </LessonQuote>
      <p>
        A person normally has a strongest discipline, but useful analytical work
        often requires more than one hat. An analyst may bring in a dataset, define
        a tested model, build the output that uses it and then investigate a failed
        production run. An engineer may explore model outputs to diagnose an
        ingestion problem. A clinical lead may challenge an unexpected result and
        change the requirement. The work moves between modes even when the people do
        not change.
      </p>
      <p>
        Rigid hand-offs make the work slower and less reliable. If every analytical
        definition becomes a ticket for an engineer, the person writing the code is
        separated from the person who understands the question. If every platform or
        information-governance decision is left to an analyst working alone, specialist
        risks are missed. The aim is to bring the required expertise into one reviewable
        workflow.
      </p>
      <h2>Different work needs different authority</h2>
      <p>
        A better boundary than “analysts use dashboards; engineers use dbt” is to ask
        what kind of decision is being made and who has the knowledge and authority to
        make it. Several people may contribute to one change.
      </p>
      <table>
        <thead>
          <tr>
            <th>Hat</th>
            <th>Questions it is especially equipped to answer</th>
            <th>Typical contribution</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Domain analyst</td>
            <td>What does the request mean, and what evidence would make the answer credible?</td>
            <td>Data preparation, domain models, tests, governed outputs and products</td>
          </tr>
          <tr>
            <td>Analytics or data engineer</td>
            <td>How should data move, build and remain reliable at project scale?</td>
            <td>Ingestion, architecture, reusable patterns, CI, orchestration and recovery</td>
          </tr>
          <tr>
            <td>Data scientist</td>
            <td>What statistical or predictive method is justified, and how should it be evaluated?</td>
            <td>Cohorts, features, experiments, predictive models and evaluation</td>
          </tr>
          <tr>
            <td>Domain owner or decision-maker</td>
            <td>Which real-world definition and outcome should the organisation stand behind?</td>
            <td>Definitions, acceptance criteria, interpretation and approval</td>
          </tr>
        </tbody>
      </table>
      <p>
        These are centres of gravity, not permissions attached to job titles. An
        analyst who understands the project can safely change a shared reporting model.
        An engineer who does not own a clinical definition should not silently settle
        it. Review brings the other hats to the change when its consequences require
        them.
      </p>

      <h2>Analysts can work across the analytical system</h2>
      <p>
        Analysts are not merely downstream consumers of this dbt project. They are
        often end-to-end builders of analytical products, and the project should help
        them work safely across the lifecycle rather than forcing artificial hand-offs.
        Depending on the work, that might mean:
      </p>
      <ul>
        <li>
          bringing data in through an established{" "}
          <Link href="/practice/find-a-source">ingestion route</Link>, then cleaning,
          linking or indexing it so that it is usable downstream;
        </li>
        <li>
          translating a question into a subject, population, grain and time relationship,
          then finding and extending the relevant models as tested dbt models or, where
          target-lag refresh is appropriate, a{" "}
          <Link href="/advanced/materialisations">Snowflake dynamic table</Link>;
        </li>
        <li>
          composing shared models into a governed{" "}
          <Link href="/learn/data-layers">published product</Link>, including disclosure
          controls and the dashboard or application through which it is used; or
        </li>
        <li>
          reviewing, validating and following a change into production, including
          investigating failures in the models they understand.
        </li>
      </ul>
      <p>
        No analyst is expected to perform every task on every change. The point is that
        analytical work does not stop at the entrance to dbt. Git makes decisions
        reviewable, tests record expectations and the DAG exposes dependencies. These
        practices let other people inspect and rely on analytical judgement.
      </p>

      <h2>What an analyst is not expected to own alone</h2>
      <p>
        Participation does not mean operating every part of the platform. An analyst may
        use an established ingestion route or build under agreed Snowflake conventions;
        changes to the ingestion platform, warehouse-wide permissions, deployment
        architecture, service credentials or shared cost and security controls need
        engineering support. Clinical definitions, legal bases and disclosure policies
        need domain and governance authority, even when the analyst implements them.
        Contributors should recognise when a change crosses these boundaries and involve
        the right reviewer early.
      </p>
      <Callout kind="info" title="The boundary follows risk and authority">
        <p>
          “This creates a table, pipeline or user interface” is not enough reason to
          remove it from analysts. “This changes shared infrastructure, production
          access, an organisation-wide clinical definition or the behaviour of hundreds
          of downstream models” is a reason to widen the conversation.
        </p>
      </Callout>

      <h2>Why this gives analysts more leverage</h2>
      <p>
        A worksheet can answer one question quickly, but the analyst usually pays the
        source-cleaning and interpretation cost again when the next question arrives.
        A well-designed dbt change leaves behind a tested model that other analysts can
        find, understand and compose. Over time, new work starts nearer the decision and
        farther from messy source mechanics.
      </p>
      <p>
        That is why analyst participation is essential in a mature project. The value
        is not simply that more people can write models. It is that the people closest
        to the questions can improve the shared domain model as they answer them. The
        next lessons explain the data and conventions they are contributing to; later,
        <Link href="/learn/finding-models"> finding models</Link> and{" "}
        <Link href="/learn/model-design">designing models</Link> show how a request
        becomes a safe piece of project work.
      </p>

      <Quiz
        title="Authority follows the decision"
        questions={[
          {
            prompt:
              "An analyst finds that an agreed clinical register definition is missing from the project. What is the appropriate response?",
            options: [
              "Keep the logic in the dashboard because dbt is engineering work",
              "Ask an engineer to choose the definition and implement it alone",
              "Work with the definition's domain owner, implement it in dbt and request the reviewers its risk requires",
              "Wait until a data scientist needs the same register",
            ],
            answer: 2,
            explain:
              "The domain owner supplies authority, the analyst can supply domain understanding and implementation, and review brings in engineering or governance expertise where the change needs it. dbt is the shared workflow through which those contributions become durable.",
          },
        ]}
      />
    </LessonShell>
  );
}
