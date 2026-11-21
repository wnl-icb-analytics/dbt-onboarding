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
      lede="Analysts can build models as well as use them. What matters is which decisions you can make yourself, what evidence you need, and who else should review the change."
      minutes={10}
    >
      <h2>A dbt model records analytical decisions</h2>
      <p>
        A dbt model writes analytical decisions down in code. Which diagnoses
        define a register? What counts as a current relationship? Which date
        decides recency? What does one row represent, and which population
        does an output include? Answering those takes knowledge of the data
        and the domain, which is what analysts bring.
      </p>
      <p>
        People link dbt with engineering for a real reason. A dbt project is
        code in Git. Changes get reviewed, tested and deployed through
        controlled environments. Models have dependencies and production
        schedules. Someone has to run the platform, manage access and recover
        it when it breaks. Those are engineering concerns, and pretending
        otherwise would make the system less safe. Engineers can help make
        analytical decisions reproducible, but their job title doesn&apos;t
        make them the only people allowed to decide.
      </p>
      <p>
        Analysts already make these decisions, in worksheets, stored
        procedures and dashboards. Doing the same work in dbt doesn&apos;t turn
        it into a new kind of job. It gives the decisions a shared home, shows
        what they depend on, and lets others review and test them before
        anyone relies on them.
      </p>

      <h2>One change can need several kinds of expertise</h2>
      <p>
        A single change can need people with different knowledge, each
        deciding a different part of it. Say a register is missing an agreed
        inclusion criterion. An analyst investigates the records, explains the
        mismatch and proposes a model change. The domain owner confirms what
        the criterion should be. An engineer might help if the change also
        touches a shared ingestion rule or needs new access. All of that can
        happen in the same pull request.
      </p>
      <p>
        The analyst doesn&apos;t have to hand the whole task over just because
        it uses dbt. Equally, the author shouldn&apos;t settle an uncertain
        clinical definition alone. Bring in whoever the decision needs, and
        keep the requirement, the code and the validation evidence together.
      </p>

      <h2>Match each decision to the person who can make it</h2>
      <p>
        For each decision in a change, ask who has the knowledge to make it
        and the authority to approve it. One person might own the clinical
        definition while another owns the access rules, and a single pull
        request can need both. Splitting the work as &quot;analysts use
        dashboards, engineers use dbt&quot; misses this. The table shows the
        questions each role, or hat, is usually best placed to answer.
      </p>
      <table>
        <thead>
          <tr>
            <th>Hat</th>
            <th>Questions it&apos;s best placed to answer</th>
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
              How should data move, build and stay reliable across the whole
              project?
            </td>
            <td>
              Ingestion, architecture, reusable patterns, CI, orchestration and
              recovery
            </td>
          </tr>
          <tr>
            <td>Data scientist</td>
            <td>
              Which statistical or predictive method is justified, and how
              should it be evaluated?
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
        These are typical contributions, not rules. An analyst who understands
        the project can safely change a shared reporting model. An engineer
        who doesn&apos;t own a clinical definition shouldn&apos;t quietly
        settle it. Review brings in the other hats when a change&apos;s
        consequences call for them.
      </p>

      <h2>Start small and take on more</h2>
      <p>
        You can contribute before you know the whole platform. Start with
        small changes and take on larger ones as you learn the project. Your
        first contribution might be a model description, a test or a small
        staging fix. Later you might define a shared measure, build a
        published dataset or investigate a production failure. All of these
        are analytical work, and each gets a review sized to its risk.
      </p>
      <p>
        What you are expected to do is understand the change you propose,
        explain its limits, and bring in someone else when the decision needs
        their authority.
      </p>

      <h2>Some changes need engineering or governance sign-off</h2>
      <p>
        Some changes need engineering support or governance sign-off, even
        when you write the code. You can use an established ingestion route,
        or build within the agreed Snowflake conventions. Changes to the ingestion platform,
        warehouse-wide permissions, deployment setup, service credentials or
        shared cost and security controls need engineering support. Clinical
        definitions, legal bases and disclosure policies need domain and
        governance sign-off, even when you&apos;re the one writing the code.
        Learn to spot when a change crosses one of these lines, and bring the
        right reviewer in early.
      </p>
      <Callout kind="info" title="The boundary follows risk and authority">
        <p>
          &quot;It creates a table, pipeline or user interface&quot; isn&apos;t
          a reason to take work away from analysts. &quot;It changes shared
          infrastructure, production access, an organisation-wide clinical
          definition or the behaviour of hundreds of downstream models&quot;
          is a reason to widen the conversation.
        </p>
      </Callout>

      <p>
        <Link href="/learn/git-and-prs">Git &amp; pull requests</Link> comes
        next. A pull request is where the analyst, the domain owner and the
        engineer meet over one change, so the way the team uses Git underpins
        each later chapter. After that, the{" "}
        <Link href="/learn/the-data">data chapter</Link> introduces the sources
        and identifiers, and later chapters on discovery and design show how to
        turn what you know about a question into a change the team can check.
      </p>

      <Quiz
        title="Authority follows the decision"
        questions={[
          {
            prompt:
              "An analyst finds that an agreed clinical register definition is missing from the project. What should they do?",
            options: [
              "Keep the logic in the dashboard because dbt is engineering work",
              "Ask an engineer to choose the definition and implement it alone",
              "Work with the definition's domain owner, implement it in dbt and request the reviewers its risk requires",
              "Wait until a data scientist needs the same register",
            ],
            answer: 2,
            explain:
              "The domain owner supplies the authority. The analyst can supply domain understanding and the implementation. Review brings in engineering or governance expertise where the change needs it, and dbt is the shared workflow that makes the result last.",
          },
        ]}
      />
    </LessonShell>
  );
}
