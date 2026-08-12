import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Tests & documentation" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="tests-and-docs"
      kicker="Learn 09"
      title="Tests & documentation"
      lede="A reusable model needs more than correct SQL. Its contract must be written down where consumers can read it, and protected by assertions that run against real data on every build."
      minutes={18}
    >
      <h2>A test is an assertion, not an inspection</h2>
      <p>
        The word “test” carries baggage. In most analytical teams it suggests
        quality assurance: someone checks the output before release, compares a
        few totals, eyeballs a dashboard, signs it off. That is an inspection —
        performed once, by a person, on one version of the output.
      </p>
      <p>
        A dbt data test is a different kind of thing: an{" "}
        <strong>assertion</strong>. It is a statement about the data that must
        always be true — <em>person_id is never null</em>;{" "}
        <em>there is one row per person</em>;{" "}
        <em>every status comes from this list</em>{" "}— written next to the
        model and executed automatically. Two lines of YAML:
      </p>
      <CodeBlock
        lang="yaml"
        title="the assertion, as written"
        code={[
          "columns:",
          "  - name: person_id",
          "    data_tests:",
          "      - unique",
          "      - not_null",
        ].join("\n")}
      />
      <p>
        become queries that hunt for counterexamples:
      </p>
      <CodeBlock
        lang="sql"
        title="the assertion, as executed · what dbt runs for `unique`"
        code={[
          "select person_id",
          "from fct_person_example_register",
          "where person_id is not null",
          "group by person_id",
          "having count(*) > 1",
        ].join("\n")}
      />
      <p>
        Any rows returned are violations; zero rows means the assertion holds.
        The difference from inspection is not thoroughness but{" "}
        <em>repetition</em>. An inspection examines one build and is over. An
        assertion runs every time the model builds — in development, in CI when
        a pull request is opened, and in production on every scheduled run. When
        a source feed changes shape next year and a join quietly starts to fan
        out, nobody will be inspecting; the assertion will still be running, and
        it will fail.
      </p>
      <p>
        The rest of this page is about which assertions to write, and why. The
        short answer: assertions are how a model&apos;s contract — its
        population, time, grain and meaning — stays true after everyone has
        stopped looking at it.
      </p>

      <h2>A model is reusable when its promise is visible</h2>
      <p>
        SQL shows how a result is produced. It does not necessarily tell a
        consumer which people are included, when the result is true, what one row
        represents or whether a missing value means unknown, not applicable or
        absent from the source. Those decisions are the model&apos;s public
        contract.
      </p>
      <p>
        In dbt, the YAML beside a model is where that contract becomes part of the
        project. It gives the model a description and owner, documents important
        columns and attaches assertions to the model and its fields. dbt can then
        surface the information in documentation, include tests in the DAG and
        report which promise failed during a build.
      </p>
      <p>
        This is essential to the compounding value of a mature project. The next
        analyst should be able to discover a model, assess whether its contract
        fits and reuse it without reverse-engineering every CTE. Documentation
        makes the meaning readable; tests provide continuing evidence that the
        data still behaves as the model claims.
      </p>

      <h3>The YAML is part of the model</h3>
      <p>
        A SQL file without its properties is incomplete. The project keeps the
        YAML close to the SQL so that implementation and contract change together:
      </p>
      <CodeBlock
        lang="yaml"
        title="models/reporting/olids/fct_person_example_register.yml"
        code={[
          "models:",
          "  - name: fct_person_example_register",
          "    description: >",
          "      Current example-register population. One row per included person",
          "      aged 18 or over who meets the documented clinical criteria,",
          "      evaluated at the current build date.",
          "    config:",
          "      meta:",
          "        owner:",
          "          name: Your Name",
          "    columns:",
          "      - name: person_id",
          "        description: Unique identifier for the included person",
          "        data_tests:",
          "          - unique",
          "          - not_null",
          "      - name: is_on_register",
          "        description: True for every row because non-members are excluded",
          "        data_tests:",
          "          - accepted_values:",
          "              arguments:",
          "                values: [true]",
        ].join("\n")}
      />
      <p>
        The description states population, time and grain. The key tests enforce
        one row per included person. The flag description explains something that
        would otherwise be surprising: false rows do not exist in this model. The
        owner identifies where questions and proposed definition changes should
        go.
      </p>
      <p>
        YAML syntax is simple but exact. A colon names a property, a dash begins
        an item in a list and indentation establishes ownership. This project
        uses two spaces for each level and spaces rather than tabs. A parser error
        usually points near the first place that the intended structure became
        ambiguous.
      </p>

      <h3>Good descriptions record decisions</h3>
      <p>
        A description should add information that the name and data type cannot
        provide. “Person identifier” does not help much if the column is already
        called <code>person_id</code>. “OLIDS person identifier retained at the
        model&apos;s one-row-per-person grain; never null” tells a consumer which
        identity system and row contract apply.
      </p>
      <p>
        Model descriptions should normally settle the subject, population,
        reference time and grain. Column descriptions earn their place when they
        explain units, code systems, selection rules, effective dates, null
        meaning, derivation or a non-obvious relationship. Repeating every column
        name in a sentence creates coverage without understanding.
      </p>
      <p>
        Documentation should also distinguish an agreed definition from an
        implementation detail. A consumer needs to know that the model selects
        the latest qualifying blood pressure by clinical-effective date and how
        ties are resolved. They rarely need a prose transcription of the window
        function used to implement that rule.
      </p>

      <h2>Tests turn assumptions into executable evidence</h2>
      <p>
        A dbt data test is an assertion about a model, source or other project
        resource. Underneath, it is a SQL query that returns records which disprove
        the assertion. A uniqueness test searches for duplicated keys; a
        not-null test searches for nulls. Zero failing records means the test
        passes.
      </p>
      <p>
        This inversion matters. Tests do not look for representative good rows.
        They describe conditions that must not occur. When a source changes or a
        join begins to fan out, the same assertion runs again and turns that
        unexpected condition into a visible failure rather than a silent change
        in a dashboard.
      </p>
      <table>
        <thead>
          <tr>
            <th>Assertion</th>
            <th>Contract it can protect</th>
            <th>What a failure means</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>unique</code> + <code>not_null</code></td>
            <td>One valid row for each key</td>
            <td>The claimed grain or key is not true</td>
          </tr>
          <tr>
            <td><code>dbt_utils.unique_combination_of_columns</code></td>
            <td>A composite grain such as person, pathway and snapshot</td>
            <td>The combination appears more than once</td>
          </tr>
          <tr>
            <td><code>accepted_values</code></td>
            <td>A deliberately finite vocabulary</td>
            <td>A new or invalid state needs investigation</td>
          </tr>
          <tr>
            <td><code>relationships</code></td>
            <td>A foreign key resolves to the intended parent population</td>
            <td>A relationship is missing or the parent scope is wrong</td>
          </tr>
          <tr>
            <td>Row-count or expectation test</td>
            <td>An operational plausibility boundary</td>
            <td>The feed or model moved outside an expected range</td>
          </tr>
        </tbody>
      </table>
      <p>
        The right test follows from a decision in the model contract. Adding every
        available generic test does not create quality. A <code>not_null</code>{" "}
        test is valuable when null would contradict the model&apos;s meaning; it is
        harmful when unknown is a legitimate clinical state and the test pressures
        developers to coalesce it into false or zero.
      </p>
      <p>
        The vocabulary and relationship assertions look like this in practice —
        each one records a decision the model has made:
      </p>
      <CodeBlock
        lang="yaml"
        title="a vocabulary and a relationship, asserted"
        code={[
          "columns:",
          "  - name: attendance_status",
          "    description: Deliberately finite; a new value means the feed changed",
          "    data_tests:",
          "      - accepted_values:",
          "          arguments:",
          "            values: ['attended', 'did_not_attend', 'cancelled']",
          "  - name: sk_patient_id",
          "    data_tests:",
          "      - relationships:",
          "          arguments:",
          "            to: ref('dim_person_demographics_basic')",
          "            field: sk_patient_id",
        ].join("\n")}
      />
      <p>
        Read as assertions, both say something falsifiable. The first: this
        column&apos;s vocabulary is closed, and a value outside it is news, not
        noise. The second: every person in this model resolves to the person
        spine. Whether each statement <em>should</em>{" "}be true is a design
        decision — the sections below take the two hardest cases in turn.
      </p>

      <h3>The grain test protects every downstream measure</h3>
      <p>
        The highest-value structural assertion is usually the one that enforces
        the model&apos;s grain. If a model promises one row per person, its person
        key should be unique and not null. If it promises one row per person,
        pathway and snapshot week, the combination—not each column separately—is
        unique.
      </p>
      <CodeBlock
        lang="yaml"
        title="protecting a composite grain"
        code={[
          "models:",
          "  - name: int_wl_current",
          "    data_tests:",
          "      - dbt_utils.unique_combination_of_columns:",
          "          arguments:",
          "            combination_of_columns:",
          "              - person_id",
          "              - pathway_id",
          "              - snapshot_week",
        ].join("\n")}
      />
      <p>
        Separate uniqueness tests on those three columns would describe the wrong
        model: one person can have several pathways and every snapshot week
        contains many people. A row-count test would also miss many fan-outs
        because it cannot identify which rows are duplicated or whether the new
        total is legitimate. The composite key expresses the actual contract.
      </p>
      <p>
        This is why grain documentation and grain testing belong together. The
        prose tells a reader what one row means; the assertion gives dbt a way to
        detect when an implementation change makes that statement false.
      </p>

      <h3>Relationship tests require domain judgement</h3>
      <p>
        A relationship test asks whether values in one model exist in another.
        That sounds universally desirable, but it is only correct when both
        populations are meant to align. An events model may legitimately contain
        people outside a current active-patient dimension. A point-in-time fact
        should not necessarily resolve to a dimension that only represents today.
      </p>
      <p>
        Before adding the test, state the intended relationship: every current
        medication fact belongs to a person in the current person dimension, or
        every organisation identifier resolves to the organisation reference
        model. If exceptions are valid, either select the appropriate parent
        population or encode the accepted exception. Do not weaken a failing test
        until it passes without first deciding what the relationship should mean.
      </p>

      <h3>Tests belong where the promise is made</h3>
      <p>
        A useful assertion is attached to the model that owns the corresponding
        promise. Staging can test the prepared source grain, required source keys
        and the finite vocabularies guaranteed by the feed contract. It should not
        normally assert a programme&apos;s definition of eligibility, because staging
        does not own that meaning.
      </p>
      <p>
        Modelling models can test the reusable evidence or relationship they
        establish: one latest qualifying observation per person, no overlapping
        effective intervals, or a resolved code occurring only after a diagnosis.
        Reporting models protect business-ready populations, facts and dimensions.
        Their tests should make it difficult for a model to keep its name while
        silently losing its grain or clinical meaning.
      </p>
      <p>
        Published models test the delivery contract they own. A dashboard base may
        require one row per person and practice, a fixed set of output statuses or
        the application of an audience-specific exclusion. Those checks do not
        belong in the shared facts merely because the product consumes them.
      </p>
      <p>
        The same logical condition should not be copied onto every descendant.
        If a shared register fact guarantees unique people, a downstream product
        does not need to reimplement the register&apos;s clinical tests. It does need
        a grain test after joining that register to other models, because the
        composition introduces a new way for duplicates to appear.
      </p>
      <p>
        This placement makes failures informative. A source-contract failure
        points to ingestion or source preparation. A register-population failure
        points to clinical definition logic. A published-grain failure points to
        product composition. Repeating broad checks everywhere produces noise;
        testing each layer&apos;s own promise narrows the search.
      </p>

      <h2>Semantic rules need semantic tests</h2>
      <p>
        Generic tests cover patterns that recur across many models. Domain rules
        are often more specific. A waiting-list decision date must not precede its
        referral date. A register reconstructed for a reference date must not use
        evidence recorded after that date. A clinical range may be impossible
        even though the value is non-null and correctly typed.
      </p>
      <p>
        A singular data test expresses one of those rules directly as SQL in the
        <code> tests/</code>{" "}directory. Like every data test, it returns the
        violating records:
      </p>
      <CodeBlock
        lang="sql"
        title="tests/assert_decision_not_before_referral.sql"
        code={[
          "select",
          "    person_id,",
          "    pathway_id,",
          "    referral_request_received_date,",
          "    decision_date",
          "from {{ ref('int_wl_current') }}",
          "where decision_date < referral_request_received_date",
        ].join("\n")}
      />
      <p>
        Because the test uses <code>ref()</code>, it becomes part of the DAG and
        runs with the model it protects. Returning the identifying columns also
        makes a failure easier to investigate than returning only a count.
      </p>

      <h3>Data tests and unit tests answer different questions</h3>
      <p>
        dbt distinguishes data tests from unit tests. Data tests examine the rows
        produced from real warehouse inputs and ask whether the resulting dataset
        obeys its assertions. Unit tests provide small, controlled input rows and
        compare the model&apos;s output with an expected result. They are useful for
        isolated, branch-heavy logic where important edge cases may not happen to
        exist in development data.
      </p>
      <p>
        This project relies primarily on data tests, which run in development, CI
        and production. The distinction is still useful: a passing data test says
        no current row disproved the assertion. It does not prove that every branch
        of the SQL behaves correctly for inputs that are not present.
      </p>
      <p>
        dbt&apos;s <a href="https://docs.getdbt.com/docs/build/unit-tests">unit-test guide</a>
        {" "}covers the controlled-input syntax. Use it where enumerating edge cases is
        clearer than waiting for production data to exercise them.
      </p>

      <h3>A passing suite cannot rescue the wrong contract</h3>
      <p>
        Tests prove only what they assert. A model can be uniquely wrong: one row
        per person, consistently calculated, for the wrong clinical population. A
        generous row-count range can pass while a join doubles a small cohort.
        An accepted-values test can protect a vocabulary that should have allowed
        unknown.
      </p>
      <p>
        Good tests therefore begin with design and review. First decide what the
        model means; then choose assertions capable of disproving important parts
        of that meaning. Data inspection, comparison with known totals, clinical
        review and reconciliation with existing models remain necessary evidence.
        The test suite preserves those decisions once they have been made.
      </p>
      <p>
        After deployment, failures become operational evidence. The{" "}
        <Link href="/learn/observing-production">observing production</Link> lesson
        shows how test history, model results and downstream impact are investigated
        together.
      </p>

      <h3>Tests should make failure understandable</h3>
      <p>
        A test is operational documentation as well as a gate. Its name,
        arguments and returned columns should help the person responding to a
        failure understand which assumption broke. A singular test called
        <code> assert_no_future_evidence_in_pit_register</code>{" "}communicates more
        than <code>assert_register_valid</code>. Returning person, evidence and
        reference dates makes the violating relationship inspectable.
      </p>
      <p>
        Broad plausibility tests require particular care. “The model must contain
        at least one row” catches a completely absent feed but says nothing about
        a 60% fall. A narrow expected range may create routine noise when activity
        is seasonal. Thresholds should reflect a known operational expectation,
        include an owner and be revised when the expectation changes—not widened
        automatically whenever they fail.
      </p>
      <p>
        Stored failures can help investigation in development by materialising the
        records returned by a data test. They must be handled under the same data
        governance as the model itself. Failure rows are diagnostic data, not
        suitable material for a public PR or repository.
      </p>

      <h2>A failure changes what downstream users can trust</h2>
      <p>
        During <code>dbt build</code>, dbt builds a model and then runs its data
        tests. If an error-level test fails, the newly built relation normally
        remains in the warehouse. dbt marks the node as failed and skips selected
        downstream nodes. Existing downstream tables may therefore remain on
        their last successful version while direct consumers of the failed model
        can see its new rows.
      </p>
      <p>
        A failed test is a trust signal and a control on further propagation,
        not a transaction rollback. Anyone investigating a production failure
        needs to know which relation failed, which descendants were skipped and
        whether existing outputs are stale.
      </p>
      <p>
        Tests configured with <code>severity: warn</code>{" "}report a problem but
        do not block downstream execution. That is appropriate when a condition is
        informative or a source-quality issue is tolerated temporarily. It should
        not be used merely to make a red build green. Severity records the
        operational consequence the team has chosen for a broken assertion.
      </p>
      <p>
        Debugging begins with the compiled test SQL. Running it shows the records
        that violated the rule. From there, determine whether the data changed,
        the model changed or the assertion encoded the wrong contract. Fixing the
        test is correct only in the third case.
      </p>

      <h2>Documentation makes the project discoverable</h2>
      <p>
        Model and column descriptions appear in the project documentation and are
        persisted as warehouse comments where configured. They travel with
        lineage, ownership and test results, giving developers and consumers a
        shared place to understand what a relation is intended to provide.
      </p>
      <p>
        This is more than an aid for readers. Documentation is part of how the
        project avoids duplicate work. A well-described model can be found and
        evaluated during discovery. An undocumented model may be technically
        reusable but practically invisible, encouraging the next developer to
        create the same concept again.
      </p>
      <p>
        Documentation also reduces coordination cost. A consumer can answer common
        questions without finding the original author, while ownership provides a
        route for questions that genuinely require judgement. This does not make
        the YAML a substitute for conversation; it reserves conversation for
        decisions that have not already been settled and recorded.
      </p>
      <p>
        Because documentation is an interface, a semantic change requires a
        documentation change. If a register&apos;s reference date, population or
        treatment of unknown values changes, leaving the old description in place
        is equivalent to shipping an API with an incorrect contract. Reviewers
        should read SQL, descriptions and tests as one change.
      </p>
      <p>
        The project provides a generator for the repetitive part:
      </p>
      <CodeBlock
        lang="bash"
        code={[
          "dbt run-operation generate_model_yaml --args \\",
          "  '{\"model_names\": [\"stg_your_model\"], \"upstream_descriptions\": true}'",
        ].join("\n")}
      />
      <p>
        The command can create the model and column skeleton and inherit upstream
        descriptions. It cannot decide the population, reference time, grain,
        ownership, null meaning or assertions that make the model trustworthy.
        Generation removes typing; it does not supply understanding.
      </p>

      <h2>Worked example: documenting a clinical register</h2>
      <p>
        A person-level asthma-register fact needs more than a description saying
        “QOF asthma register”. A useful contract states that the model contains
        one row per included person, identifies the relevant age and clinical
        criteria, says whether it is current or point in time and explains whether
        non-members are absent or represented with a false flag.
      </p>
      <p>
        Its person key should be unique and not null. Criterion flags can use
        accepted-value tests when their allowed states are deliberately boolean.
        A semantic test can check that no included row contradicts a mandatory
        criterion. Relationship tests should use a person model with a compatible
        population and temporal contract.
      </p>
      <p>
        Dates, contributing codes and criterion flags deserve descriptions because
        they explain why a person was included. That documentation supports
        clinical review and makes later reuse safer: another programme can
        understand whether the existing register fits without extracting its
        definition from the SQL.
      </p>
      <p>
        If the definition changes, SQL, description and tests change in the same
        pull request. The diff then shows not only how the implementation moved
        but which public promise changed and how the new promise will be
        protected.
      </p>

      <h2>A contract checklist</h2>
      <ol>
        <li>
          State the model&apos;s subject, population, reference time and grain.
        </li>
        <li>
          Name an owner who can answer questions about the definition.
        </li>
        <li>
          Document units, codes, selection rules and null meaning where they
          affect interpretation.
        </li>
        <li>
          Test the key or key combination that enforces the grain.
        </li>
        <li>
          Add accepted-value and relationship assertions only where the domain
          contract makes them true.
        </li>
        <li>
          Use singular tests for important business rules that generic tests
          cannot express.
        </li>
        <li>
          Choose warning or error severity according to the intended operational
          response.
        </li>
        <li>
          Treat generated YAML as a skeleton and review documentation whenever
          the model&apos;s meaning changes.
        </li>
      </ol>
      <p>
        The{" "}
        <Link href="https://docs.getdbt.com/docs/build/data-tests">
          official dbt data-test guide
        </Link>{" "}
        documents the available test forms and configuration. The earlier{" "}
        <Link href="/learn/finding-models">finding models</Link>{" "}lesson shows
        how a consumer uses these contracts to decide whether a model is safe to reuse.
      </p>

      <Quiz
        title="Contracts, not checkboxes"
        questions={[
          {
            prompt:
              "A model contains one row per person, pathway and snapshot week. Which test protects its grain?",
            options: [
              "unique on person_id",
              "unique on snapshot_week",
              "unique_combination_of_columns across all three grain columns",
              "not_null on all output columns",
            ],
            answer: 2,
            explain:
              "Each individual column legitimately repeats. The three-column combination identifies one row, so that is the assertion capable of detecting a fan-out.",
          },
          {
            prompt:
              "A relationships test fails because historical events contain people outside the current active-patient dimension. What should happen first?",
            options: [
              "Change the test to severity warn",
              "Remove the failing people from the event model",
              "Decide which parent population and temporal relationship the contract actually requires",
              "Replace the relationship test with not_null",
            ],
            answer: 2,
            explain:
              "The failure may reflect a mismatched contract rather than bad data. Establish the intended population and time relationship before changing either the model or the test.",
          },
          {
            prompt:
              "What does a passing dbt data test establish?",
            options: [
              "The model is clinically correct",
              "No current row disproved the specific assertion",
              "Every branch of the SQL has been exercised",
              "The model is safe for every downstream use",
            ],
            answer: 1,
            explain:
              "Data tests evaluate explicit assertions against current results. They are strong regression evidence, but they cannot prove an unstated requirement or an unexercised edge case.",
          },
        ]}
      />
    </LessonShell>
  );
}
