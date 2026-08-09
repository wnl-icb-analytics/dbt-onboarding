import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { Callout } from "@/components/Callout";
import { CodeBlock } from "@/components/CodeBlock";

export const metadata: Metadata = { title: "Planning a change" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="planning-a-change"
      kicker="Learn 08"
      title="Planning a change"
      lede="A request describes a desired outcome, not necessarily the model that should be built. Planning turns that request into an agreed, testable change before implementation makes the assumptions expensive."
      minutes={11}
    >
      <h2>Start with the outcome, not the proposed table</h2>
      <p>
        A ticket may ask for a new table, a field in a dashboard or a copy of an
        existing report with a different filter. Those are useful clues, but they are
        proposed solutions. Before deciding what to change in dbt, establish what the
        consumer is trying to decide or deliver and what must be true of the data for
        that use to be legitimate.
      </p>
      <p>
        This is the <strong>Plan</strong> stage of the{" "}
        <a
          href="https://www.getdbt.com/resources/the-analytics-development-lifecycle"
          target="_blank"
          rel="noopener noreferrer"
        >
          analytics development lifecycle
        </a>. It is iterative: initial requirements guide discovery, and what the
        project already contains changes the proposed plan.
      </p>
      <p>
        For example, “add an asthma table for the programme dashboard” leaves several
        important questions open. Does the programme need the agreed asthma register or
        a different eligible population? Is the result current or point-in-time? Is one
        row a person, a person-month or a practice? Does the dashboard require only
        register membership, or also prescribing and control measures? Is the programme
        allowed to narrow a shared definition, and who has authority to agree that rule?
      </p>
      <p>
        A useful plan resolves enough of those questions to guide discovery, design and
        testing. It does not need to predict every CTE. The purpose is to make the
        consequential decisions visible while they are still cheap to change.
      </p>

      <h2>Write the analytical contract in ordinary language</h2>
      <p>
        Before SQL, write a short contract for the proposed output. The same dimensions
        used to evaluate an existing model are useful here:
      </p>
      <table>
        <thead>
          <tr>
            <th>Decision to settle</th>
            <th>Question to answer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Outcome</td>
            <td>What decision, report or operational action will this support?</td>
          </tr>
          <tr>
            <td>Subject</td>
            <td>What real-world entity or analytical concept is being described?</td>
          </tr>
          <tr>
            <td>Population</td>
            <td>Who or what is included, excluded and absent?</td>
          </tr>
          <tr>
            <td>Grain</td>
            <td>What does one row represent?</td>
          </tr>
          <tr>
            <td>Time</td>
            <td>Is the output current, latest-known, event-based, period-based or point-in-time?</td>
          </tr>
          <tr>
            <td>Measures</td>
            <td>Which values are required, with what units, thresholds and denominators?</td>
          </tr>
          <tr>
            <td>Audience</td>
            <td>Who will use it, under which legal basis and access rules?</td>
          </tr>
          <tr>
            <td>Acceptance</td>
            <td>Which examples, totals or comparisons would convince the consumer it is correct?</td>
          </tr>
        </tbody>
      </table>
      <p>
        Unknowns are allowed. Recording “reference date still to be agreed” is better
        than silently choosing the current date in SQL. The plan should distinguish
        settled requirements from questions that need an owner.
      </p>

      <h2>Discovery changes the plan</h2>
      <p>
        Planning is not completed in isolation and handed to development. Once the
        initial contract is clear enough to search, inspect the existing project. The
        required register, current-practice relationship and prescribing measures may
        already exist. A model with the right subject may have the wrong temporal
        contract. A published product for another programme may reveal a useful pattern
        without being appropriate to reuse directly.
      </p>
      <p>
        This evidence changes the proposed implementation. The gap may be only a new
        published composition; it may be a missing reusable fact; or the request may be
        asking for a definition that conflicts with an agreed organisational one. The
        <Link href="/learn/finding-models"> finding and reusing models</Link> lesson
        provides the detailed search method. Planning is where its findings become a
        decision about the work.
      </p>
      <table>
        <thead>
          <tr>
            <th>What discovery finds</th>
            <th>Likely change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>All domain concepts exist; only the named output is missing</td>
            <td>Compose them in a published model for the product</td>
          </tr>
          <tr>
            <td>A shared model is correct but lacks a generally useful attribute</td>
            <td>Extend its contract and validate affected consumers</td>
          </tr>
          <tr>
            <td>A durable domain concept does not exist</td>
            <td>Design a new modelling component or reporting mart</td>
          </tr>
          <tr>
            <td>The source capability itself is missing</td>
            <td>Plan ingestion or source-generation work with engineering support</td>
          </tr>
          <tr>
            <td>The request conflicts with an established definition</td>
            <td>Resolve authority and naming before implementing a second meaning</td>
          </tr>
        </tbody>
      </table>

      <h2>Plan the evidence before the implementation</h2>
      <p>
        “The model builds” is not an acceptance criterion. Decide how the proposed
        meaning will be tested before writing it. That normally includes three kinds of
        evidence:
      </p>
      <ul>
        <li>
          <strong>Contract evidence</strong> — tests for grain, required values,
          relationships and any bounded business rule the model owns.
        </li>
        <li>
          <strong>Change evidence</strong> — development-to-production comparisons that
          show which row counts, populations or measures move and why.
        </li>
        <li>
          <strong>Consumer evidence</strong> — worked examples or reconciliations that a
          domain owner can use to confirm the result answers the intended question.
        </li>
      </ul>
      <p>
        Thinking about evidence early often reveals an unclear requirement. If nobody
        can describe a person who should be included and one who should not, the
        population is not ready to encode. If no expected difference can be stated for
        a logic change, review will have no basis on which to judge it.
      </p>

      <h2>Plan for the existing system, not only the new output</h2>
      <p>
        A change to a shared model is also a change to every product that relies on its
        contract. Inspect downstream lineage, identify owners and decide whether the
        change is additive, corrective or breaking. Renaming a column, changing grain
        or redefining a population may require coordinated consumer changes or a period
        in which old and new interfaces coexist. Incremental descendants may require a
        planned full refresh so historical rows do not retain the previous logic.
      </p>
      <p>
        Maintenance belongs in the plan too. A durable model needs an owner, a refresh
        cadence appropriate to its use and tests somebody is prepared to respond to.
        A published product needs a clear audience and a place for product-specific
        rules. The person who requested the first output is not automatically the
        long-term authority for every domain definition used to produce it.
      </p>
      <Callout kind="info" title="Small plan, small delivery slices">
        <p>
          Planning is not permission to design the entire domain in advance. For a
          larger change, deliver coherent pieces that can be reviewed independently:
          settle a missing shared concept, then add the product that composes it. Each
          slice should leave the project correct and useful.
        </p>
      </Callout>

      <h2>A useful change brief fits on one screen</h2>
      <p>
        The plan should be proportionate. A one-line correction may need only a clear PR
        description. A new clinical product needs wider agreement. This compact brief
        is enough to expose the important decisions without turning analytical work
        into document production:
      </p>
      <CodeBlock
        lang="text"
        title="analytical change brief"
        code={[
          "Outcome:      who will use this, and for what decision or product?",
          "Contract:     subject, population, grain, time and required measures",
          "Authority:    who agrees the definition and any programme-specific rules?",
          "Reuse:        which existing models were inspected, and what is missing?",
          "Change:       extend, create, compose or deprecate — and in which layer?",
          "Impact:       which downstream models, owners and refreshes are affected?",
          "Evidence:     tests, comparisons and examples that will demonstrate correctness",
          "Operation:    owner, cadence, access and response when the product fails",
        ].join("\n")}
      />
      <p>
        This is part of the project&apos;s velocity, not an obstacle to it. A mature dbt
        estate makes discovery quick and leaves fewer unresolved definitions in each
        new request. Planning ensures that only the genuinely new question becomes new
        logic. The next lesson, <Link href="/learn/model-design">designing models</Link>,
        turns that agreed gap into model boundaries that remain readable and reusable.
      </p>
    </LessonShell>
  );
}
