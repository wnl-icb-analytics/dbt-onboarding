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
      kicker="Learn 12"
      title="Building and checking a change"
      minutes={13}
      lede="Building a model runs its SQL in Snowflake and saves the result as a view or table. Build your edited model in development, then check that its rows changed the way you meant."
    >
      <h2>Read the model&apos;s description and SQL before you build it</h2>
      <p>
        Read the description first, so you know what the built rows should
        look like. For a person-level appointment summary, that&apos;s who
        appears, which appointments count and what period it covers. Then read
        the SQL a step at a time. The model below is made
        up. It has one intermediate query and one final query, and names
        starting <code>example_</code> don&apos;t exist in the project.
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
        <code>attended</code>. That&apos;s a common table expression, or CTE.
        It lets you read the query in steps. It doesn&apos;t create another
        table in the warehouse. The final <code>select</code> then groups the
        attended appointments by person.
      </p>
      <p>
        So the output holds people with at least one attended appointment.
        There&apos;s no date filter, so the period is whatever history the
        input happens to hold. Those facts matter more than whether the SQL
        looks tidy. If the description promises every person, or the last
        twelve months, the code doesn&apos;t match it.
      </p>

      <h2>Choose the dbt command by what you need to check</h2>
      <p>
        <code>dbt compile</code>, <code>run</code>, <code>test</code> and{" "}
        <code>build</code> each do a different job, and a command that
        succeeds has only shown what that command checks. In the table,{" "}
        <code>my_model</code> stands for the real model you&apos;re working on.
      </p>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>What happens</th>
            <th>What&apos;s still unchecked</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>dbt compile -s my_model</code>
            </td>
            <td>
              Turns the model&apos;s Jinja into plain SQL. Fusion also checks
              that SQL against column and type information from the warehouse,
              so it can catch a misspelt column before anything runs.
            </td>
            <td>Nothing has been built, and no tests have run.</td>
          </tr>
          <tr>
            <td>
              <code>dbt run -s my_model</code>
            </td>
            <td>Builds the model in the warehouse as a view or table.</td>
            <td>No tests run as part of this command.</td>
          </tr>
          <tr>
            <td>
              <code>dbt test -s my_model</code>
            </td>
            <td>Runs the tests selected for the model.</td>
            <td>
              Data tests check what&apos;s already in the warehouse. They
              don&apos;t rebuild it from your edited SQL first.
            </td>
          </tr>
          <tr>
            <td>
              <code>dbt build -s my_model</code>
            </td>
            <td>
              Builds the selected models and runs their tests, in dependency
              order.
            </td>
            <td>
              Whether the output is right. You still have to inspect it and
              judge whether it meets the analytical requirement.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        For a normal model change, a focused <code>dbt build</code> tells you
        the model ran and its tests passed. Read the summary at the end to see
        which models and tests actually ran. Don&apos;t assume every related
        test was included. A <code>relationships</code> test touches two
        models, and whether it runs depends on dbt&apos;s{" "}
        <a href="https://docs.getdbt.com/reference/node-selection/test-selection-examples">
          indirect selection
        </a>{" "}
        rules and on which of those models you selected.
      </p>
      <p>
        Build with the <code>dev</code> target from the project&apos;s tracked{" "}
        <code>profiles.yml</code>. It writes to development databases such as{" "}
        <code>DEV__MODELLING</code> and <code>DEV__REPORTING</code>, and reads
        the shared data lake where it needs to. The whole team shares those
        databases. They aren&apos;t private to your Git branch, so if someone
        else is working on the same model, your builds overwrite each
        other&apos;s. Check which table your build wrote to, and talk to them
        first.
      </p>
      <p>
        dbt&apos;s{" "}
        <a href="https://docs.getdbt.com/reference/commands/build">build</a> and{" "}
        <a href="https://docs.getdbt.com/reference/commands/run">run</a>{" "}
        references cover each command and test selection in more depth.
      </p>

      <h2>Select the upstream and downstream models you need</h2>
      <p>
        Selection decides which models a command runs. A <code>ref()</code>{" "}
        declares a dependency, but selecting one model doesn&apos;t rebuild its
        parents. If an upstream model is new, or you&apos;ve changed it too, you
        may need to select it as well.
      </p>
      <table>
        <thead>
          <tr>
            <th>Selection</th>
            <th>Models included</th>
            <th>Why choose it?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>my_model</code>
            </td>
            <td>The named model</td>
            <td>Check your change against the inputs that already exist.</td>
          </tr>
          <tr>
            <td>
              <code>+my_model</code>
            </td>
            <td>The model and its ancestors</td>
            <td>Rebuild the upstream models first, then check the result.</td>
          </tr>
          <tr>
            <td>
              <code>my_model+</code>
            </td>
            <td>The model and its descendants</td>
            <td>Rebuild and test the models your change might affect.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Run <code>dbt ls -s my_model+ --output name</code> to see what a
        selection includes before you build it. A short command can select a
        big slice of the warehouse. A shared person model can have hundreds of
        descendants. Start with what you need to investigate the change, then
        widen the build if its impact calls for it.
      </p>

      <h2>Know whether you&apos;re building a view or a table</h2>
      <p>
        A materialisation is how dbt creates the model in the warehouse. A view
        stores only the query, and reads its inputs fresh each time someone
        queries it. A table stores the rows produced when it was built. If its
        inputs change afterwards, the table doesn&apos;t notice until it&apos;s
        rebuilt.
      </p>
      <p>
        That affects how you investigate. If a view reads a table that was last
        rebuilt yesterday, the view shows yesterday&apos;s data too. And
        querying the same view twice can return different rows if its inputs
        changed in between. Write down the source period and the build time
        when you compare results.
      </p>
      <p>
        <code>dbt_project.yml</code> sets defaults by folder, and a model can
        override them in its own <code>config()</code>. In this project, raw
        and staging models are views, while modelling, reporting and published
        models are tables. The <code>pit_</code> registers are an exception.
        They sit in reporting but set <code>materialized=&apos;view&apos;</code>{" "}
        in their own config. So check a model&apos;s config before you assume
        how it refreshes.
      </p>
      <p>
        Incremental models are another case. On later runs they only process
        new or changed rows, so changing their SQL can leave older rows built
        by the old logic. The{" "}
        <Link href="/advanced/materialisations">materialisations chapter</Link>{" "}
        covers these choices and when history needs a full rebuild.
      </p>

      <h2>After a green build, check the rows changed as you expected</h2>
      <p>
        A successful build tells you the model ran and its selected tests
        passed. It can&apos;t tell you the output is right, so next you check
        which rows changed and why. Say your change to the appointment summary
        raises one provider&apos;s total from 100 to 112. You expected extra attended appointments from a
        service that&apos;s newly covered. But the size of the increase
        can&apos;t tell you that&apos;s the reason.
      </p>
      <p>
        Compare old and new results for the same reporting period and, where
        you can, the same inputs. Otherwise a new source delivery can look like
        an effect of your code. Compare row counts and distinct keys, then find
        the records that were added, removed or changed. Break the difference
        down by the affected service or status instead of checking only the
        grand total.
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
              Whether those records meet the agreed criteria and fall in the
              period.
            </td>
          </tr>
          <tr>
            <td>12 more rows, but no new appointment identifiers</td>
            <td>
              A join or a duplicated input may have repeated existing
              appointments.
            </td>
          </tr>
          <tr>
            <td>Same total, but 12 records added and 12 removed</td>
            <td>The population changed, and the total hides it.</td>
          </tr>
        </tbody>
      </table>
      <p>
        For joins, also compare matched and unmatched records. An unchanged row
        count can hide attributes that went missing. A bigger count can be an
        intended grain change or an accidental fan-out. The population, time
        and grain you meant to deliver tell you which evidence matters.
      </p>
      <p>
        Then look at a few cases you choose on purpose: one person who should
        be included, one who shouldn&apos;t, one on a boundary date and one
        with missing evidence. Do any row-level checking on real data in an
        approved environment. Keep patient records and identifying results out
        of repository files, public pull requests and AI assistant output. Use
        made-up examples to explain the logic, and aggregates that can&apos;t
        identify anyone to record what you checked.
      </p>

      <h2>The type of error tells you which step failed</h2>
      <p>
        When a build fails, the kind of error tells you where to look. A
        template or
        compilation error happened while dbt was preparing the query. An
        execution error means the warehouse couldn&apos;t finish running it. A
        failing data test means the rows were built but break an assertion.
        Find the first real error, and set aside the descendants that were only
        skipped because their input failed.
      </p>
      <p>
        Don&apos;t weaken a test just to get a green run. Work out whether the
        source changed, the code is wrong, or the test encodes a wrong
        assumption. If it&apos;s the assumption, update the description too,
        and explain the decision alongside the test change.
      </p>
      <p>
        The <Link href="/practice/build-and-test">local build walkthrough</Link>{" "}
        gives the commands and shows how to read a failure. Once the model and
        your evidence are ready, they go into the pull request, following the{" "}
        <Link href="/learn/git-and-prs#the-working-loop">working loop</Link>.
        The next chapter follows the change from merge to production.
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
              "Data tests query whatever is already in the warehouse. Build the changed model if you want to test what your new SQL produces.",
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
              "Equal totals can hide records that came and went. Compare keys, and the breakdowns that matter for the change.",
          },
        ]}
      />
    </LessonShell>
  );
}
