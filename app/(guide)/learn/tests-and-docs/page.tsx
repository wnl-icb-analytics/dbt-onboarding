import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { LessonQuote } from "@/components/LessonQuote";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Tests & documentation" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="tests-and-docs"
      kicker="Learn 11"
      title="Tests & documentation"
      lede="Document what your model returns so others know when to use it. Then add tests that check the data follows the rules you've written down. Both take analytical judgement."
      minutes={18}
    >
      <h2>Tests catch the breaks your SQL won&apos;t</h2>
      <p>
        A data test checks that a model&apos;s output still follows a rule you
        rely on, such as one row per practice. You need them because source
        data can change in ways that don&apos;t make your SQL fail. A supplier
        adds a status code. A reference file arrives with a practice listed
        twice. Someone upstream changes a join for their own reasons. The model
        builds, the run goes green, and the numbers move.
      </p>
      <p>
        Here&apos;s an example. A practice moves to a new primary care network,
        and the lookup from practice to PCN keeps both its old and new rows.
        Each patient at that practice now joins to two networks. The old
        network&apos;s case-finding list picks up people it no longer looks
        after, and ICB totals count them twice. Nothing errors, and the numbers
        look plausible.
      </p>
      <p>
        A <code>unique</code> test on the lookup&apos;s practice code catches
        the duplicate. Production runs tests in its scheduled builds, so the run
        fails instead of going green, and dbt doesn&apos;t build the models
        that depend on the failed test. The workflow opens a{" "}
        <Link href="/learn/merge-to-production">failure issue</Link> naming the
        test, and GitHub&apos;s Teams app posts it to the team channel.
      </p>
      <p>
        Tests also carry trust between people. A reviewer can&apos;t re-derive
        your model row by row. A grain test tells them one row per person was
        checked against the data, not just written in the description. The
        next developer gets the same help. If their change breaks a rule you
        wrote down, the build fails and tells them which one.
      </p>

      <h2>A data test is a query that looks for rule-breaking rows</h2>
      <p>
        A dbt data test runs a query that returns the rows breaking a rule. If
        it returns none, the test passes. Say a register should hold one row
        per included person. You can check a sample today, but next week&apos;s
        data might bring a duplicate you&apos;ve never seen. A data test writes
        the rule down so dbt can check it again whenever a build selects it.
      </p>
      <p>
        An <strong>assertion</strong> is a statement that must hold. Here, the
        person key must be present and unique. In YAML, a dash starts a list
        item, and indentation puts that item under its parent. So the two test
        names below belong to <code>person_id</code>.
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
        You&apos;ll see <code>tests:</code> in older files and{" "}
        <code>data_tests:</code> in newer ones. They do the same job. dbt
        renamed the key when it added unit tests, and the project asks for{" "}
        <code>data_tests:</code> in anything new or changed.
      </p>
      <p>
        dbt turns each assertion into a query that hunts for counterexamples.
        For <code>unique</code>, it runs something like this:
      </p>
      <CodeBlock
        lang="sql"
        title="the assertion, as executed · a simplified version of dbt's `unique` test"
        code={[
          "select person_id",
          "from fct_person_example_register",
          "where person_id is not null",
          "group by person_id",
          "having count(*) > 1",
        ].join("\n")}
      />
      <p>
        <code>group by person_id</code> collects rows with the same identifier.{" "}
        <code>having count(*) &gt; 1</code> keeps only the groups with more than
        one row. The result is exactly the identifiers that disprove the
        uniqueness claim. Missing identifiers are left to the separate{" "}
        <code>not_null</code> test.
      </p>
      <table>
        <thead>
          <tr>
            <th>Fictional model rows</th>
            <th>Unique-test result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>P1, P2, P2, P3</td>
            <td>P2</td>
          </tr>
          <tr>
            <td>P1, P2, P3</td>
            <td>No rows returned</td>
          </tr>
        </tbody>
      </table>
      <p>
        No rows back means the assertion held for the data it checked. In the
        first case the test finds the duplicated P2. It doesn&apos;t tell you
        which P2 row is right. If an upstream join caused the duplicate, fix the
        join and rebuild. Don&apos;t just delete one of the rows.
      </p>
      <p>
        <code>dbt build</code> builds the selected models and runs their tests.{" "}
        <code>dbt run</code> builds models without testing them.{" "}
        <code>dbt test</code> tests what&apos;s already in the warehouse without
        rebuilding anything. In this project&apos;s pull requests, pushing a
        commit only compiles the project. The real build, which runs your models
        and tests in Snowflake, happens in the merge queue once you choose to
        merge. The{" "}
        <Link href="/learn/building-and-checking">build chapter</Link> covers
        what each command tells you.
      </p>

      <h2>Document the model in a YAML file beside its SQL</h2>
      <p>
        A model&apos;s properties file is a YAML file next to its SQL. It gives
        the model a description, names its owner and attaches its tests. Keeping
        it beside the SQL lets a reviewer see whether the code and its stated
        meaning changed together. The register below is made up, to show the
        structure.
      </p>

      <CodeBlock
        lang="yaml"
        title="models/reporting/olids/disease_registers/fct_person_example_register.yml"
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
          "          name: Example Programme Team",
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
          "                quote: false",
        ].join("\n")}
      />
      <p>
        The description states the population, time and grain. The two key tests
        enforce one row per included person. The flag&apos;s description heads
        off a surprise. This model has no rows where the flag is false. The
        owner is the business stakeholder or team accountable for the
        definition, not whoever happened to write the code. Questions and
        proposed changes to the definition go to them.
      </p>
      <p>
        Note two details in the test. A generic test takes its
        inputs under <code>arguments:</code>. The project switches on dbt&apos;s{" "}
        <code>require_generic_test_arguments_property</code> flag, so inputs
        placed anywhere else won&apos;t be accepted. And{" "}
        <code>accepted_values</code> wraps each value in quotes by default,
        which suits text. For a boolean or a number, set{" "}
        <code>quote: false</code>, as dbt&apos;s{" "}
        <a href="https://docs.getdbt.com/reference/resource-properties/data-tests">
          data-test reference
        </a>{" "}
        advises.
      </p>
      <p>
        YAML is simple but strict. A colon names a property. A dash starts an
        item in a list. Indentation decides what belongs to what. This project
        uses two spaces per level, and never tabs. When the parser complains,
        the error usually points near the first line where the intended
        structure became ambiguous.
      </p>

      <h3>Descriptions record the decisions behind a model</h3>
      <p>
        A description should tell the reader something the name and data type
        can&apos;t. &quot;Person identifier&quot; adds little to a column
        already called <code>person_id</code>. &quot;OLIDS person identifier
        kept at the model&apos;s one-row-per-person grain; never null&quot;
        tells a consumer which identity system applies and what each row
        represents.
      </p>
      <p>
        A model description should normally cover the subject, population,
        reference time and grain. If filters or clinical rules decide who is in
        the population, spell them out: inclusion and exclusion rules,
        thresholds, date windows, and the code list, value set or upstream
        definition used. An analyst should be able to tell who is selected
        without reading the SQL. Name a managed code list rather than pasting
        its codes into the prose.
      </p>
      <p>
        Column descriptions earn their place when they explain units, code
        systems, effective dates, what a null means, how a value is derived, or
        a relationship that isn&apos;t obvious. Turning every column name into a
        sentence gives you coverage, not understanding.
      </p>
      <p>
        Keep the agreed definition separate from how the SQL implements it. A
        consumer needs to know that the model picks the latest qualifying blood
        pressure by clinical effective date, and how it breaks ties. They rarely
        need the window function behind that rule written out in prose.
      </p>

      <h2>Every model tests its grain</h2>
      <p>
        The project has one firm rule. Each model tests its stated grain with
        its key, or with the combination of keys that makes a row unique. A
        person-grain register tests <code>person_id</code>. A table at one row
        per practice per month tests the pair. The description says what one
        row means, and the test has dbt check it on each build.
      </p>
      <p>
        CI checks part of this for you. When a PR changes a model&apos;s SQL,
        the Model Test Coverage check looks in the YAML files in that folder
        and its parent for at least one test on the model. If there isn&apos;t
        one, the check fails. Raw and semantic models are exempt. The check
        only counts tests. It can&apos;t read your description, so it
        can&apos;t tell what the grain is. A lone <code>not_null</code> on a
        date column passes it. You and your reviewer confirm that a test covers
        the key.
      </p>
      <p>
        Code clusters have a check of their own. A model that reads a cluster
        through <code>get_observations</code> or one of its sibling macros
        lists that cluster in a <code>cluster_ids_exist</code> test. The LTC
        LCS macros use <code>valuesets_have_codes</code> instead. The Cluster
        Existence Tests check fails a PR when the SQL reads a cluster that no
        such test lists. Then a cluster dropped or renamed in the codesets fails
        the build, rather than leaving the model to find nobody.
      </p>

      <h2>Choose tests that match the model&apos;s rules</h2>
      <p>
        Start with a rule the data could break, then pick a test that would
        catch the break. Each kind of test protects a different part of the
        model.
      </p>
      <table>
        <thead>
          <tr>
            <th>Test</th>
            <th>What it protects</th>
            <th>What a failure means</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>unique</code> + <code>not_null</code>
            </td>
            <td>At most one row per key, and no missing keys</td>
            <td>The claimed grain or key isn&apos;t true</td>
          </tr>
          <tr>
            <td>
              <code>dbt_utils.unique_combination_of_columns</code>
            </td>
            <td>
              A grain made of several columns, such as person, pathway and
              snapshot
            </td>
            <td>The combination appears more than once</td>
          </tr>
          <tr>
            <td>
              <code>accepted_values</code>
            </td>
            <td>A deliberately fixed list of allowed values</td>
            <td>A new or invalid value needs investigating</td>
          </tr>
          <tr>
            <td>
              <code>relationships</code>
            </td>
            <td>A key resolves to the intended parent population</td>
            <td>
              A match is missing, or the parent covers the wrong population
            </td>
          </tr>
          <tr>
            <td>Row-count or expectation test</td>
            <td>A plausible operating range</td>
            <td>The feed or model moved outside the expected range</td>
          </tr>
        </tbody>
      </table>
      <p>
        The right test follows from a decision recorded in the description.
        Here&apos;s a fixed list of values and a relationship, as tests:
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
        Each one makes a claim the data could prove false. The first says this
        column&apos;s list of values is closed, so a value outside it is news,
        not noise. The second says every non-null person key here exists in the
        chosen person table. Whether each claim <em>should</em> be true is a
        design decision. The next sections look at which claims to test first,
        and at cases where the choice needs care.
      </p>

      <h3>Test what&apos;s most likely to break next</h3>
      <p>
        Once the grain is covered, add tests where a change to a source or a
        rule would do the most damage. Work down this order.
      </p>
      <ol>
        <li>
          Grain comes first. It&apos;s the key, or key combination, that says
          what one row means.
        </li>
        <li>
          Join uniqueness comes next. If your SQL joins to a parent expecting
          one match, the parent&apos;s key has to be unique. That was the PCN
          lookup above. Often the parent&apos;s own grain test covers it, so
          check the test exists before you rely on the join.
        </li>
        <li>
          Population boundaries decide who&apos;s in. Age limits, date windows
          and inclusion rules move when a definition changes. A singular test
          that returns anyone included who fails the rule catches a boundary
          that slipped.
        </li>
        <li>
          Maintained lists change under you. When a column&apos;s values come
          from a list someone maintains, such as organisation codes, test the
          relationship to the model that holds the list. Copying the values into{" "}
          <code>accepted_values</code> goes out of date the first time the list
          changes.
        </li>
      </ol>
      <p>
        Bugs add one more rule. When you fix a bug that could happen again, add
        the test that would have caught it. The fix repairs today&apos;s data.
        The test stops the same cause coming back unnoticed next quarter. If
        the cause was a one-off that can&apos;t recur, the fix is enough.
      </p>
      <p>
        Some tests compare a model with data built separately, such as a
        source&apos;s row count or the keys it kept. Tag those{" "}
        <code>reconciliation</code>. PR validation and state-based deploys
        leave the tag out, because a partial build refreshes only one side.
        Scheduled and full builds rebuild both sides and run them.
      </p>

      <h3>Add tests whose failures mean something is wrong</h3>
      <p>
        A test earns its place when a failure means something is wrong. Adding
        each generic test dbt offers doesn&apos;t create quality. A{" "}
        <code>not_null</code> test helps when a null would contradict the
        model&apos;s meaning. It does harm when &quot;unknown&quot; is a real
        clinical state. It fails on valid data, and it pushes developers to
        coalesce unknown into false or zero just to make it pass. A test that
        fails for no good reason teaches people to ignore failures.
      </p>
      <p>
        Tests also cost something. They run on each build and use Snowflake
        compute. So don&apos;t test implementation details, like a helper
        column the SQL uses on the way to its output. And don&apos;t repeat a
        check an upstream model already owns. Where each test belongs is
        covered below.
      </p>

      <h3>Grain tests catch duplicate and missing keys</h3>
      <p>
        A grain test checks that the key identifies one row and is never
        missing. It&apos;s usually the most valuable structural test a model
        has. If a model promises one row per person, its person
        key must be unique and not null. At one row per person, pathway and
        snapshot week, the combination of all three must be unique,
        even though each column repeats on its own.
      </p>
      <CodeBlock
        lang="yaml"
        title="Fictional pathway history with one row per person, pathway and week"
        code={[
          "models:",
          "  - name: example_pathway_history",
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
        A separate <code>unique</code> test on each of those columns would
        describe the wrong model. One person can have several pathways, and
        each snapshot week holds many people. A row-count test would miss a lot
        of fan-outs too, because it can&apos;t tell you which rows repeated or
        whether the new total is legitimate. Only the combined key states the
        real grain.
      </p>
      <p>
        That&apos;s why grain documentation and grain tests belong together. The
        description tells a reader what one row means. The test lets dbt notice
        when a code change makes that statement false.
      </p>
      <p>
        Uniqueness and not-null tests don&apos;t prove that everyone who should
        be there is there. An empty table passes both. Checking that nobody is
        missing takes separate evidence, such as reconciling against the
        expected input population and looking at the records the model excluded.
      </p>

      <h3>Relationship tests need domain judgement</h3>
      <p>
        A relationship test checks that every non-null key in one model has a
        match in another. Whether the parent key is unique isn&apos;t part of
        the check. If your join relies on finding exactly one match, test the parent&apos;s
        uniqueness separately. Add <code>not_null</code> on the child key only
        if a missing key really is invalid.
      </p>
      <p>
        Checking that values in one model exist in another sounds like something
        you&apos;d always want. It&apos;s only right when the two populations
        are meant to line up. An events model may legitimately include people
        who aren&apos;t in a current active-patient dimension. A point-in-time
        fact shouldn&apos;t necessarily match a dimension that only describes
        today.
      </p>
      <p>
        Before adding the test, write down the relationship you mean. For
        example, every current medication fact belongs to a person in the
        current person dimension. Or organisation codes all resolve to the
        organisation reference model. If some exceptions are valid, either point
        the test at a parent that covers them or encode the exception.
        Don&apos;t loosen a failing test until it passes before you&apos;ve
        decided what the relationship should mean.
      </p>

      <h3>Test each rule on the model that owns it</h3>
      <p>
        Attach each test to the model that owns the rule. Staging can test
        the source&apos;s grain, its required keys and any fixed value lists the
        feed guarantees. It shouldn&apos;t normally test a programme&apos;s
        eligibility rule, because staging doesn&apos;t own that meaning.
      </p>
      <p>
        Modelling models can test the evidence or relationship they create. That
        might be one latest qualifying observation per person, no overlapping
        effective periods, or a resolved code only ever appearing after a
        diagnosis. Reporting models protect business-ready populations, facts
        and dimensions. Their tests catch a model that keeps its name but loses
        its grain or its clinical meaning.
      </p>
      <p>
        Published models test the delivery rules they own. A dashboard base
        might need one row per person and practice, a fixed set of output
        statuses, or an exclusion applied for its audience. Those tests
        don&apos;t belong on the shared facts just because the product uses
        them.
      </p>
      <p>
        Don&apos;t copy the same check onto each descendant. If a shared
        register already guarantees unique people, a downstream product
        doesn&apos;t need to repeat the register&apos;s clinical tests. It does
        need its own grain test after joining that register to other models,
        because the join is a new place for duplicates to appear.
      </p>
      <p>
        Placing tests this way makes failures informative. A source test failing
        points to ingestion or source preparation. A register population test
        failing points to the clinical definition. A published grain test
        failing points to how the product was put together. Repeat broad checks
        everywhere and you get noise. Test what each layer owns and a failure
        tells you where to look.
      </p>

      <h2>Write singular tests for domain rules</h2>
      <p>
        A singular test checks a rule that no generic test covers. Generic
        tests cover patterns that turn up in many models. Domain rules
        are often narrower. A waiting-list decision date can&apos;t come before
        its referral date. A register rebuilt for a reference date can&apos;t
        use evidence recorded after that date. A clinical value can be
        impossible even when it&apos;s non-null and the right type.
      </p>
      <p>
        A singular data test states one of those rules as plain SQL, saved in
        the <code>tests/</code> folder. Like any data test, it returns the
        rows that break the rule:
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
          "from {{ ref('example_pathway_history') }}",
          "where decision_date < referral_request_received_date",
        ].join("\n")}
      />
      <p>
        This made-up test uses <code>ref()</code>, so dbt knows it depends on{" "}
        <code>example_pathway_history</code>. That&apos;s also how it gets
        picked up. <code>dbt build -s example_pathway_history</code> runs it
        along with the model&apos;s other tests. Returning the identifying
        columns, rather than a count, makes a failure much easier to
        investigate.
      </p>

      <h3>Data tests check built rows and unit tests check logic</h3>
      <p>
        dbt has two kinds of test. Data tests look at the rows your model built
        from real warehouse data and ask whether they obey the assertions. Unit
        tests feed the model a few rows you write yourself and compare its
        output with the result you expect. They suit logic with many branches,
        where the awkward edge cases might not exist in development data.
      </p>
      <p>
        This project mostly uses data tests, and they run in development, in the
        merge queue and in production. It also has a few hundred unit tests,
        mostly for branch-heavy logic such as medication classification. The
        distinction matters when you read a result. A passing data test means no
        current row broke the assertion. It doesn&apos;t prove that every branch
        of the SQL behaves correctly for inputs that aren&apos;t there yet.
      </p>
      <p>
        dbt&apos;s{" "}
        <a href="https://docs.getdbt.com/docs/build/unit-tests">
          unit-test guide
        </a>{" "}
        covers the syntax. Reach for a unit test when listing the edge cases
        yourself is clearer than waiting for production data to hit them.
      </p>

      <h3>Passing tests only cover the rules they check</h3>
      <p>
        A passing test tells you the data met the rule you wrote. It
        can&apos;t tell you the rule was the right one.
      </p>
      <LessonQuote
        attribution="Edsger W. Dijkstra"
        work="The Humble Programmer (EWD 340)"
        href="https://www.cs.utexas.edu/~EWD/transcriptions/EWD03xx/EWD340.html"
      >
        Program testing can be a very effective way to show the presence of
        bugs, but is hopelessly inadequate for showing their absence.
      </LessonQuote>
      <p>
        Dijkstra was talking about programs in 1972, and data tests have the
        same limit. A model can pass a uniqueness test while selecting the wrong
        clinical population. A generous row-count range can pass while a join
        doubles a small cohort. An accepted-values test can guard a list that
        should have allowed &quot;unknown&quot;.
      </p>
      <p>
        So good tests start with design and review. Decide what the model means
        first. Then choose tests that could disprove the important parts of that
        meaning. You still need data inspection, comparison with known totals,
        clinical review and reconciliation with existing models. The test suite
        keeps those decisions in force once you&apos;ve made them.
      </p>
      <p>
        After deployment, failures become evidence about production. The{" "}
        <Link href="/learn/observing-production">observing production</Link>{" "}
        chapter shows how to read test history, model results and downstream
        impact together.
      </p>

      <h3>Write tests that explain their failures</h3>
      <p>
        A test documents an assumption as well as guarding it. Its name,
        arguments and returned columns should tell the person handling a failure
        which assumption broke. A singular test called{" "}
        <code>assert_no_future_evidence_in_pit_register</code> says far more
        than <code>assert_register_valid</code>. Returning the person, evidence
        date and reference date lets them see the broken relationship straight
        away.
      </p>
      <p>
        Broad plausibility tests need care. &quot;The model must have at least
        one row&quot; catches a feed that vanished, but says nothing about a 60%
        drop. A tight expected range creates routine noise when activity is
        seasonal. Base each threshold on a known operational expectation, give
        it an owner, and change it when the expectation changes. Investigate a
        failure before you widen any threshold.
      </p>
      <p>
        dbt can save a failing test&apos;s rows to a table, a feature called
        stored failures. This project switches it off for all tests (
        <code>+store_failures: false</code> in <code>dbt_project.yml</code>),
        and dbt&apos;s{" "}
        <a href="https://docs.getdbt.com/reference/resource-configs/store_failures">
          store_failures reference
        </a>{" "}
        says that config overrides the <code>--store-failures</code> flag. To
        see the failing rows, run the compiled test SQL in a Snowflake session
        approved for patient-level data. Those rows are diagnostic data. Keep
        them out of pull requests and the repository.
      </p>

      <h2>A failed error-level test stops downstream builds</h2>
      <p>
        During <code>dbt build</code>, dbt runs a model&apos;s selected unit
        tests first. If one fails, the model isn&apos;t built. Otherwise dbt
        builds the model and then runs its data tests. If a data test at error
        severity fails, the newly built table stays in the warehouse. dbt
        doesn&apos;t roll it back. It records the failure and skips the selected
        models downstream. So the downstream tables keep their last successful
        version, while anyone querying the failed model directly sees its new
        rows.
      </p>
      <p>
        A failed test is a warning to consumers and a brake on the failure
        spreading. It isn&apos;t an undo. Anyone investigating a production
        failure needs to know which model failed, which descendants were
        skipped, and which outputs are now stale.
      </p>
      <p>
        A test set to <code>severity: warn</code> reports the problem but
        doesn&apos;t stop downstream models building. You set it in the
        test&apos;s <code>config:</code> block:
      </p>
      <CodeBlock
        lang="yaml"
        title="a test that warns instead of failing"
        code={[
          "      - name: practice_code",
          "        data_tests:",
          "          - not_null:",
          "              config:",
          "                severity: warn",
        ].join("\n")}
      />
      <p>
        Warn suits a condition that&apos;s informative, or a source-quality
        problem the team has agreed to tolerate for now. Don&apos;t use it to
        turn a red build green. Severity records the consequence the team has
        chosen for that broken assertion.
      </p>
      <p>
        Debugging starts with the compiled test SQL. dbt writes it under{" "}
        <code>target/compiled/</code>, and running it shows the rows that broke
        the rule. From there, work out which of three things happened. The data
        changed, the model changed, or the test encoded the wrong rule. Only
        the third case means the test needs fixing.
      </p>

      <h2>Change the description, tests and SQL together</h2>
      <p>
        When a model&apos;s definition changes, update the SQL, the
        description and the affected tests in the same change, so they keep
        agreeing. Take the example register. Its description states the age
        and clinical criteria, whether it describes the current population or
        a past date, and that non-members are absent. Its key tests protect
        uniqueness and presence. If you change its age rule, the description
        needs the new threshold, and the eligibility test needs to find any
        included person who falls outside it.
      </p>
      <p>
        Keep the dates and criteria columns
        that explain why a person was included. The next reviewer should be able
        to compare the stated rule with the evidence without rebuilding each
        step in their head.
      </p>
      <p>
        The <Link href="/practice/yaml-and-tests">YAML walkthrough</Link> shows
        how to generate a properties file and add tests. Generation can fill in
        column names and descriptions inherited from upstream. You still have to
        write the population, time, null meaning and the decisions that belong
        to this model.
      </p>

      <h2>Checklist for documenting and testing a model</h2>
      <ol>
        <li>
          State the model&apos;s subject, population, reference time and grain.
        </li>
        <li>Name an owner who can answer questions about the definition.</li>
        <li>
          Explain how the population is selected in the model description,
          including thresholds, date rules and the code list or definition used.
        </li>
        <li>
          Document units, codes and null meaning where they change how a column
          reads.
        </li>
        <li>
          Test the key, or combination of keys, that enforces the grain. CI
          checks that a test exists, not that it covers the key.
        </li>
        <li>
          List each code cluster the SQL reads in a{" "}
          <code>cluster_ids_exist</code> or <code>valuesets_have_codes</code>{" "}
          test.
        </li>
        <li>
          Test join uniqueness, population boundaries and maintained lists
          where a source or rule change could break them.
        </li>
        <li>
          Add accepted-values and relationship tests only where the model&apos;s
          definition makes them true.
        </li>
        <li>
          Use singular tests for important business rules that generic tests
          can&apos;t express.
        </li>
        <li>
          When you fix a bug that could recur, add the test that would have
          caught it.
        </li>
        <li>
          Choose warn or error severity by what should happen when the test
          fails.
        </li>
        <li>
          Treat generated YAML as a skeleton, and review the documentation
          whenever the model&apos;s meaning changes.
        </li>
      </ol>
      <p>
        dbt&apos;s{" "}
        <Link href="https://docs.getdbt.com/docs/build/data-tests">
          data-test guide
        </Link>{" "}
        lists the available test forms and their configuration. The earlier{" "}
        <Link href="/learn/finding-models">finding models</Link> chapter shows
        how someone using a model reads these contracts to decide whether
        it&apos;s safe to reuse.
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
              "Each column repeats on its own, legitimately. Only the three-column combination identifies one row, so that's the test that can catch a fan-out.",
          },
          {
            prompt:
              "A PR changes a person-grain model, and the Model Test Coverage check passes. What has the check established?",
            options: [
              "person_id is unique in the built table",
              "The model has at least one test declared in YAML",
              "The model's tests pass in Snowflake",
              "The description states the grain",
            ],
            answer: 1,
            explain:
              "The check reads YAML, not data, and can't infer the grain. You and your reviewer confirm a test covers the key. The tests themselves run in your local build and the merge-queue build.",
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
              "The failure may come from a mismatched contract, not bad data. Settle which population and time relationship you intend before changing the model or the test.",
          },
          {
            prompt: "What does a passing dbt data test establish?",
            options: [
              "The model is clinically correct",
              "No current row disproved that assertion",
              "Every branch of the SQL has been exercised",
              "The model is safe for every downstream use",
            ],
            answer: 1,
            explain:
              "Data tests check stated assertions against the current rows. They're strong evidence against regressions, but they can't prove a requirement nobody wrote down or an edge case the data hasn't hit.",
          },
        ]}
      />
    </LessonShell>
  );
}
