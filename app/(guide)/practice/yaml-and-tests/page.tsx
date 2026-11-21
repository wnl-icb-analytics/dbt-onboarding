import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Checklist } from "@/components/Checklist";
import { GuidedCourseLink } from "@/components/GuidedCourseLink";

export const metadata: Metadata = { title: "Add the YAML" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="yaml-and-tests"
      kicker="Walkthrough · 4"
      title="Add the YAML"
      lede="Start with the staging SQL you wrote for the financial weeks lookup. You'll add a .yml file beside it that describes the columns, names an owner and tests that each date appears once."
      minutes={8}
    >
      <GuidedCourseLink href="/courses/first-pr/describe-and-test" />

      <h2>What the YAML file does</h2>
      <p>
        dbt publishes the descriptions in this file and runs its tests. The SQL
        file describes the rows to build. The YAML records what else you know
        about them, and unlike a comment or a wiki page, dbt puts it to use.
      </p>
      <ul>
        <li>
          Descriptions publish to the dbt docs site. They also become comments on
          the Snowflake table and its columns, so people see them on hover in
          Snowsight and in any tool that reads warehouse metadata.
        </li>
        <li>
          The owner block tells analysts who can answer questions about the
          model. It names the business stakeholder or group accountable for
          what the model means and how people use it. That isn&apos;t
          automatically you because you wrote the SQL. If you don&apos;t know
          who it is, ask in the PR. CI flags a new model that doesn&apos;t have
          one.
        </li>
        <li>
          Tests compile into queries. <code>dbt build</code>{" "}runs them
          whenever it selects the model. That means your local build, the
          merge-queue build before your PR lands, and the production schedules.{" "}
          <code>dbt run</code>{" "}builds models and skips tests, so use{" "}
          <code>dbt build</code>{" "}or <code>dbt test</code>{" "}when you want them.
          Unit tests, if a model has any, run before dbt builds it. Data tests,
          the kind on this page, run against the built result.
        </li>
      </ul>
      <p>
        That last point changes how you should write the file. Most
        documentation goes stale the day after someone writes it. This file
        runs. Writing it is closer to setting the terms the data has to keep
        meeting after you&apos;ve moved on.
      </p>

      <h2>Start the file</h2>
      <p>
        Create <code>stg_reference_lookup_ncl_fin_week_number_2019_2031.yml</code>{" "}in the same folder
        as the SQL, with the same name. Open a neighbouring staging YAML, such as
        another <code>stg_reference_*.yml</code>{" "}in{" "}
        <code>models/staging/shared/reference/</code>, and copy its layout. Then
        add one <code>- name:</code>{" "}entry under <code>columns:</code>{" "}for
        each column in your <code>select</code>. Your SQL already lists them, so
        nothing is guesswork.
      </p>
      <p>
        That gets you the structure. It can&apos;t tell you what the columns{" "}
        <em>mean</em>. It doesn&apos;t know the grain, which columns carry the
        model&apos;s promise, what a null represents, or which source quirks the
        next analyst needs warning about. Everything after this is the part only
        you can write.
      </p>

      <h2>Describe what the name leaves out</h2>
      <p>
        A description should tell the reader what the column name can&apos;t.
        For a financial week number, that&apos;s the range and why some years
        have a week 53. A description that repeats the name is worse than none,
        because it takes the spot where useful help should go. Compare these
        two.
      </p>
      <CodeBlock
        lang="yaml"
        code={`
# adds nothing, the name already said this
- name: fin_week_number
  description: The financial week number

# adds what the name can't say
- name: fin_week_number
  description: 1 to 53. Weeks run Monday to Sunday, so some financial years have 53.
`}
      />
      <p>
        Useful descriptions tend to cover the same few things. Units and coding
        come first, like a 2019/20 year format, mmol/mol or an upper-case ODS
        code. Then what
        a null means. Was it never recorded, not applicable, or waiting for a
        feed? Then anything the source does that would surprise someone.
      </p>
      <p>
        Here&apos;s a good test. Picture a colleague hovering over this column
        six months from now, while you&apos;re on leave. Would your description
        answer their question?
      </p>
      <p>
        The model&apos;s own description has one job above all others. It states
        the grain. &quot;NHS financial weeks, one row per calendar date&quot;
        tells a reader whether the table can answer their question before they
        open the SQL.
      </p>

      <h2>Test what one row represents</h2>
      <p>
        Start with the grain. This lookup has one row per calendar date, so{" "}
        <code>unique</code>{" "}and <code>not_null</code>{" "}on{" "}
        <code>calendar_date</code>{" "}catch a repeated or missing date.
      </p>
      <CodeBlock
        lang="yaml"
        title="stg_reference_lookup_ncl_fin_week_number_2019_2031.yml, the decisions"
        code={`
models:
  - name: stg_reference_lookup_ncl_fin_week_number_2019_2031
    description: >
      NHS financial weeks, one row per calendar date
      from 1 April 2019 to 31 March 2031
    config:
      meta:
        owner:
          name: Owning Team or Person
    columns:
      - name: calendar_date
        description: The date this row describes
        data_tests: [unique, not_null]
      - name: fin_week_number
        description: 1 to 53. Weeks run Monday to Sunday, so some financial years have 53.
`}
      />
      <p>
        Every test compiles to a query that hunts for rows that break its rule.
        Zero rows back means a pass. That helps you choose. A test pays its way
        when the rows it would find mean something is really wrong, bad enough
        to stop the pipeline for.
      </p>
      <p>
        The minimum is plain. Each model needs a test on its grain. CI&apos;s
        Model Test Coverage check fails a PR when a changed model has no test
        at all. It can&apos;t see whether the test covers the key, so that part
        is on you and your reviewer.
      </p>
      <p>
        The grain test comes first because it catches the most damaging silent
        failure. That&apos;s a join, now or years from now, that fans the table
        out and multiplies every count downstream. Take the grain sentence from
        your description and assert it. Here one column is the grain, so{" "}
        <code>unique</code>{" "}on <code>calendar_date</code>{" "}does it. When the
        grain is a combination, such as one row per practice per month, use{" "}
        <code>dbt_utils.unique_combination_of_columns</code>{" "}at model level
        instead.
      </p>
      <CodeBlock
        lang="yaml"
        title="a two-column grain, for comparison"
        code={`
    data_tests:
      - dbt_utils.unique_combination_of_columns:
          arguments:
            combination_of_columns: [practice_code, report_month]
    columns:
      - name: practice_code
        data_tests: [not_null]
      - name: report_month
        data_tests: [not_null]
`}
      />
      <p>
        The combination test doesn&apos;t reject nulls, so each key column needs
        its own <code>not_null</code>. Beyond the grain, add{" "}
        <code>not_null</code>{" "}only where a null would break the contract. Put{" "}
        <code>not_null</code>{" "}on a column that&apos;s sometimes empty for good
        reason, and it fails on the first real null. A test that fails on valid
        data teaches everyone to ignore failures. If null means something, say so
        in the description instead.
      </p>
      <p>
        For this lookup, the grain test is enough. It selects no population and
        joins to nothing. Most models you write next will do one or both. A
        register that includes people by age and date, or a fact that joins to
        a maintained practice list, makes a claim that a source change can
        break. Give that claim one more test, such as a relationship to the
        model that holds the list, or a singular test that returns anyone
        included who fails the rule.{" "}
        <Link href="/learn/tests-and-docs">Tests and documentation</Link> sets
        out what to test after the grain.
      </p>

      <Callout kind="warn" title="Use the current YAML shape">
        <p>
          Tests go under <code>data_tests:</code>. Arguments to a generic test
          nest under <code>arguments:</code>, and this project&apos;s settings
          require that. You&apos;ll still see the older <code>tests:</code>{" "}key
          in some existing YAML. Use <code>data_tests:</code>{" "}for any test
          block you add or change. You don&apos;t need to migrate legacy blocks
          you haven&apos;t touched.
        </p>
      </Callout>

      <h2>Build the model and run its tests</h2>
      <CodeBlock
        lang="bash"
        code={`dbt build -s stg_reference_lookup_ncl_fin_week_number_2019_2031`}
      />
      <p>
        This builds the view and then runs its tests. The summary at the end
        counts how many passed and failed. If dbt stops before
        it reaches Snowflake, the YAML probably has an indentation slip, and the
        error names the file. The next walkthrough covers what to do when a test
        fails.
      </p>

      <Checklist
        id="yaml"
        items={[
          { key: "owner", label: <>Owner names the accountable person or group</> },
          { key: "grain", label: <>Description states the grain and a test enforces it</> },
          { key: "nulls", label: <><code>not_null</code>{" "}only where null breaks the contract</> },
          { key: "desc", label: <>Descriptions add units, coding, null meaning or source quirks</> },
        ]}
      />
    </LessonShell>
  );
}
