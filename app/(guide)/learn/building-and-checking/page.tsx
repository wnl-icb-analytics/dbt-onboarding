import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Building and checking a change" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="building-and-checking"
      kicker="Learn 11"
      title="Building and checking a change"
      minutes={13}
      lede="Editing a model changes a file. Building it changes a warehouse object. Checking the result establishes what evidence you have for the proposed analytical change."
    >
      <h2>Read the model before running it</h2>
      <p>
        Suppose you are changing a person-level appointment summary. Begin with
        its description: who appears, which appointments count and what period
        it covers. Then read the SQL in stages. The following fictional model
        has one intermediate query and one final query; the names beginning with{" "}
        <code>example_</code> are illustrative, not models to run in the
        project.
      </p>
      <CodeBlock
        lang="sql"
        title="example_person_appointments.sql"
        code={`with attended as (
    select person_id, appointment_id
    from {{ ref('example_appointments') }}
    where status = 'attended'
)

select
    person_id,
    count(*) as attended_appointments
from attended
group by person_id`}
      />
      <p>
        The <code>with</code> block gives the filtered query a local name,{" "}
        <code> attended</code>. This is a common table expression, or CTE. It
        helps us read the query in steps; it does not create another warehouse
        table. The final SELECT groups the qualifying appointment rows by
        person.
      </p>
      <p>
        The output contains people with at least one attended appointment. It
        has no date filter, so its period is whatever history the input
        provides. Those facts are more important than whether the SQL looks
        tidy. If the description promises every person or the last twelve
        months, the implementation does not match it.
      </p>

      <h2>Choose the command for the question</h2>
      <p>
        dbt commands do different work. A successful command establishes only
        what that command checked. Here, <code>my_model</code> stands for the
        real model you are working on.
      </p>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>What happens</th>
            <th>What remains to check</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>dbt compile -s my_model</code>
            </td>
            <td>
              Renders the model&apos;s templates into SQL. Fusion can also
              analyse SQL using available catalogue metadata.
            </td>
            <td>
              The model&apos;s query has not been materialised and its data
              tests have not run.
            </td>
          </tr>
          <tr>
            <td>
              <code>dbt run -s my_model</code>
            </td>
            <td>Executes the model using its materialisation.</td>
            <td>Data tests do not run as part of this command.</td>
          </tr>
          <tr>
            <td>
              <code>dbt test -s my_model</code>
            </td>
            <td>Runs the tests selected for the model.</td>
            <td>
              Data tests inspect the existing relation; they do not first
              rebuild it from your edited SQL.
            </td>
          </tr>
          <tr>
            <td>
              <code>dbt build -s my_model</code>
            </td>
            <td>
              Builds selected resources and runs selected tests in dependency
              order.
            </td>
            <td>
              Inspect the output and judge whether the change meets the
              analytical requirement.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        For a normal model change, a focused <code>dbt build</code> gives
        evidence about both execution and the selected assertions. Read its
        summary to confirm which models and tests actually ran. Tests involving
        several parents have selection rules too; do not assume every related
        test was included.
      </p>
      <p>
        Use the project&apos;s development target. In this project, development
        writes to <code> DEV__</code> databases and reads the shared data lake
        where needed. Those databases are not automatically private to your Git
        branch. Check the resolved relation and coordinate if someone else is
        developing the same model.
      </p>
      <p>
        The official{" "}
        <a href="https://docs.getdbt.com/reference/commands/build">build</a> and{" "}
        <a href="https://docs.getdbt.com/reference/commands/run">run</a>{" "}
        references describe command behaviour and test selection in more detail.
      </p>

      <h2>Select the dependencies you need to exercise</h2>
      <p>
        A reference declares a dependency; selection determines which resources
        this command runs. Selecting one model does not automatically rebuild
        all its parents. If an upstream model is new or has changed too, it may
        need to be selected.
      </p>
      <table>
        <thead>
          <tr>
            <th>Selection</th>
            <th>Model scope</th>
            <th>Why choose it?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>my_model</code>
            </td>
            <td>The named model</td>
            <td>Check its change using available inputs.</td>
          </tr>
          <tr>
            <td>
              <code>+my_model</code>
            </td>
            <td>The model and its ancestors</td>
            <td>
              Rebuild required upstream resources before checking the result.
            </td>
          </tr>
          <tr>
            <td>
              <code>my_model+</code>
            </td>
            <td>The model and its descendants</td>
            <td>Exercise consumers that may be affected by the change.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Use <code>dbt ls -s my_model+ --output name</code> to inspect a
        selection before running it. A shared person model can have many
        descendants. Start with the scope needed to investigate the change, then
        widen the validation where its impact warrants it. A short command can
        select a large part of the warehouse.
      </p>

      <h2>Know whether you are building a view or a table</h2>
      <p>
        A materialisation is how dbt implements the model in the warehouse. A
        normal view stores a query definition and reads its inputs when queried.
        A table stores the results produced when it is built. If the source
        changes afterwards, that table needs another refresh before it reflects
        the change.
      </p>
      <p>
        This affects investigation. If a view reads a table last refreshed
        yesterday, the view does not make that input current. Conversely,
        querying a view twice can return different rows if its inputs changed.
        Record the source period and the build time when comparing results.
      </p>
      <p>
        Project configuration supplies defaults, and a model can override them.
        Inspect the effective configuration before assuming how it refreshes.
        Incremental models process a selected portion of data on later runs;
        changing their SQL may leave older rows untouched. The{" "}
        <Link href="/advanced/materialisations">materialisations chapter</Link>{" "}
        explains those choices and when history needs rebuilding.
      </p>

      <h2>Reconcile the analytical change</h2>
      <p>
        A green build is a starting point for validation. Suppose a change to
        the appointment summary increases a provider&apos;s total from 100 to
        112. You expected additional attended appointments from a newly covered
        service, but the size of the increase alone cannot establish that
        explanation.
      </p>
      <p>
        Compare old and new results for the same reporting period and, where
        possible, the same inputs. Otherwise, a new source delivery can look
        like an effect of the code change. Compare the number of rows and
        distinct keys, then identify records added, removed or changed. Break
        the difference down by the affected service or status rather than
        checking only the grand total.
      </p>
      <table>
        <thead>
          <tr>
            <th>Illustrative finding</th>
            <th>What to investigate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>12 new appointment identifiers, all from the added service</td>
            <td>
              Whether those records meet the agreed criteria and belong to the
              period.
            </td>
          </tr>
          <tr>
            <td>12 more rows, but no new appointment identifiers</td>
            <td>
              A join or duplicated input may have repeated existing
              appointments.
            </td>
          </tr>
          <tr>
            <td>Same total, but 12 records added and 12 removed</td>
            <td>A changed population that the total conceals.</td>
          </tr>
        </tbody>
      </table>
      <p>
        For joins, also compare matched and unmatched records. An unchanged row
        count can hide missing attributes, and a larger count can be a
        legitimate grain change or an unintended fan-out. The intended contract
        determines which evidence matters.
      </p>
      <p>
        Inspect a few deliberately chosen cases: one that should be included,
        one excluded, a boundary date and missing evidence. Use an approved
        environment for real row-level inspection. Keep patient records and
        identifying results out of repository files, public PRs and assistant
        output. Fictional examples can explain the logic; suitable
        non-identifying aggregates can record validation evidence.
      </p>

      <h2>A failure tells you where to investigate</h2>
      <p>
        A template or compilation error concerns preparing the query. An
        execution error means the warehouse could not complete it. A failing
        data test means the resulting rows violate an assertion. Find the first
        relevant error and separate it from descendants skipped because their
        input failed.
      </p>
      <p>
        Do not weaken a test merely to obtain a green run. Inspect whether the
        source changed, the implementation is wrong or the test expresses an
        inappropriate assumption. If the assumption was wrong, update the
        description and explain the decision alongside the test change.
      </p>
      <p>
        The <Link href="/practice/build-and-test">local build field guide</Link>{" "}
        gives the commands and failure-reading steps. Once the model and its
        evidence are ready,{" "}
        <Link href="/learn/git-and-prs">Git and pull requests</Link> explains
        how the team reviews the proposed change.
      </p>
      <Quiz
        title="What does the evidence establish?"
        questions={[
          {
            prompt:
              "You edit a model, then run only its data tests. What do those tests inspect?",
            options: [
              "The existing warehouse relation",
              "The edited SQL rebuilt automatically",
              "Every upstream source",
              "Only the changed rows",
            ],
            answer: 0,
            explain:
              "Data tests query the existing relation. Build the changed model to test the result of your new SQL.",
          },
          {
            prompt:
              "Old and new provider totals agree. What should you conclude?",
            options: [
              "The populations are identical",
              "No validation is needed",
              "The total agrees, but records may have entered and left",
              "Every join is one-to-one",
            ],
            answer: 2,
            explain:
              "Equal totals can conceal offsetting population changes. Compare keys and the breakdowns relevant to the change.",
          },
        ]}
      />
    </LessonShell>
  );
}
