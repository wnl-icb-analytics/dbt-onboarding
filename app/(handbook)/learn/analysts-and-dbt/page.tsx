import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Analysts and dbt" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="analysts-and-dbt"
      kicker="Learn 02"
      title="Analysts and dbt"
      lede="Analysts can contribute models as well as use them. The question is which decisions you can make, which evidence you need and who else should help review the change."
      minutes={10}
    >
      <h2>Analytical decisions still need domain knowledge</h2>
      <p>
        There is a real reason people associate dbt with engineering. A dbt
        project is code in Git. Changes are reviewed, tested and deployed
        through controlled environments. Models have dependencies and production
        schedules. Someone has to operate the platform, manage access and
        recover it when it fails. Those are engineering concerns, and pretending
        otherwise would make the system less safe.
      </p>
      <p>
        But dbt is not only the platform that runs the SQL. It is also where the
        organisation records what its data means. Which diagnoses define a
        register, what counts as a current relationship, which date should be
        used for recency, what one row represents and which population an output
        includes are analytical and domain decisions. Engineers can help make
        those decisions reproducible; their job title does not give them sole
        authority to make them.
      </p>
      <p>
        Analysts already make these decisions in worksheets, stored procedures
        and dashboards. Contributing through dbt does not turn the decisions
        into a new category of work. It gives them a shared home, exposes their
        dependencies and makes them available for review and testing before
        others rely on them.
      </p>

      <h2>One change can need several kinds of expertise</h2>
      <p>
        Suppose a register misses an agreed inclusion criterion. An analyst can
        investigate the records, explain the mismatch and propose a model
        change. The domain owner confirms the intended criterion. An engineer
        may help if the change also affects a shared ingestion rule or requires
        a new access arrangement. Those contributions can meet in the same pull
        request.
      </p>
      <p>
        The analyst does not need to hand over the whole task because it uses
        dbt. Nor should the author settle an uncertain clinical definition
        alone. Bring in the expertise needed for the decision, while keeping the
        requirement, implementation and validation evidence together.
      </p>

      <h2>Different work needs different authority</h2>
      <p>
        A better boundary than &quot;analysts use dashboards; engineers use
        dbt&quot; is to ask what kind of decision is being made and who has the
        knowledge and authority to make it. Several people may contribute to one
        change.
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
            <td>
              What does the request mean, and what evidence would make the
              answer credible?
            </td>
            <td>
              Data preparation, domain models, tests, governed outputs and
              products
            </td>
          </tr>
          <tr>
            <td>Analytics or data engineer</td>
            <td>
              How should data move, build and remain reliable at project scale?
            </td>
            <td>
              Ingestion, architecture, reusable patterns, CI, orchestration and
              recovery
            </td>
          </tr>
          <tr>
            <td>Data scientist</td>
            <td>
              What statistical or predictive method is justified, and how should
              it be evaluated?
            </td>
            <td>
              Cohorts, features, experiments, predictive models and evaluation
            </td>
          </tr>
          <tr>
            <td>Domain owner or decision-maker</td>
            <td>
              Which real-world definition and outcome should the organisation
              stand behind?
            </td>
            <td>
              Definitions, acceptance criteria, interpretation and approval
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        These are typical contributions. Job titles do not settle who can make a
        particular decision. An analyst who understands the project can safely
        change a shared reporting model. An engineer who does not own a clinical
        definition should not silently settle it. Review brings the other hats
        to the change when its consequences require them.
      </p>

      <h2>Participation grows with familiarity</h2>
      <p>
        A first contribution may be a description, a test or a small staging
        correction. Later work may define a shared measure, assemble a published
        dataset or investigate a production failure. These are all parts of
        analytical work, and each can be reviewed at an appropriate scope.
      </p>
      <p>
        You are not expected to know the whole platform before contributing. You
        are expected to understand the change you propose, explain its limits
        and involve another person where the decision needs their authority.
      </p>

      <h2>What an analyst is not expected to own alone</h2>
      <p>
        Participation does not mean operating every part of the platform. An
        analyst may use an established ingestion route or build under agreed
        Snowflake conventions; changes to the ingestion platform, warehouse-wide
        permissions, deployment architecture, service credentials or shared cost
        and security controls need engineering support. Clinical definitions,
        legal bases and disclosure policies need domain and governance
        authority, even when the analyst implements them. Contributors should
        recognise when a change crosses these boundaries and involve the right
        reviewer early.
      </p>
      <Callout kind="info" title="The boundary follows risk and authority">
        <p>
          &quot;This creates a table, pipeline or user interface&quot; is not
          enough reason to remove it from analysts. &quot;This changes shared
          infrastructure, production access, an organisation-wide clinical
          definition or the behaviour of hundreds of downstream models&quot; is
          a reason to widen the conversation.
        </p>
      </Callout>

      <p>
        The following <Link href="/learn/the-data">data chapter</Link>{" "}
        introduces the sources and identifiers. The later discovery, design and
        review chapters show how to turn your understanding of a question into a
        change the team can inspect.
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
