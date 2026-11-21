import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { LessonQuote } from "@/components/LessonQuote";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "From merge to production" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="merge-to-production"
      kicker="Learn 13"
      title="From merge to production"
      lede="When a reviewed dbt change merges into main, a GitHub workflow builds the changed models and everything downstream of them in production. Scheduled builds then rerun the deployed code on new source data."
      minutes={15}
    >
      <h2>Release small, useful changes often</h2>
      <p>
        We release each change once it&apos;s useful on its own. A fix to one
        measure doesn&apos;t have to wait for a whole dashboard redesign. Once
        the fix is finished, reviewed and validated, it can go through the
        release process by itself. The aim is to deliver a useful change, check
        what it did, and learn what to do next.
      </p>
      <p>
        That&apos;s what agile development means in practice here. Work with the
        people who need the analysis, agree a manageable next outcome, and let
        what you learn shape the one after. Requirements often get clearer once
        someone can look at real columns, definitions and results. Frequent
        feedback catches a misunderstanding before it spreads through several
        models and products.
      </p>
      <LessonQuote
        attribution="Kent Beck et al."
        work="Principles behind the Agile Manifesto"
        href="https://agilemanifesto.org/principles.html"
      >
        Our highest priority is to satisfy the customer through early and
        continuous delivery of valuable software.
      </LessonQuote>
      <p>
        Swap &quot;software&quot; for &quot;analysis&quot; and the principle
        fits. Note the word &quot;valuable&quot;, though. Early delivery
        only helps if what you deliver is worth using.
      </p>
      <p>
        So a small release still needs a finished, defensible definition. An
        exploratory result with unsettled population rules stays in development
        and discussion. The speed comes from changing less at once and getting
        feedback sooner. Review and validation have to show the result is fit for
        what it&apos;s meant to do.
      </p>

      <h3>Split the work into changes that are each useful</h3>
      <p>
        Split a larger piece of work into changes the team can review and use
        on their own. Suppose a service wants a new appointments dashboard. Put all the source
        changes, measures and visualisations on one branch and the team only sees
        the whole proposal at the end. If the population turns out to be wrong,
        you&apos;re revising work that was built on top of it. Here&apos;s one
        possible sequence instead:
      </p>
      <table>
        <thead>
          <tr>
            <th>Change</th>
            <th>Evidence before release</th>
            <th>What it makes possible</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Add a missing appointment staging model, with its description and
              tests.
            </td>
            <td>
              Check the source fields, that no rows are lost, and the agreed
              type conversions.
            </td>
            <td>Other work can use a documented version of the source.</td>
          </tr>
          <tr>
            <td>Add a shared attended-appointment measure.</td>
            <td>
              Agree its grain, status rules and time window, then reconcile its
              output with the source.
            </td>
            <td>Analysts can inspect and reuse a defined measure.</td>
          </tr>
          <tr>
            <td>Add the dashboard&apos;s published summary.</td>
            <td>
              Check grouping, totals and the service&apos;s reading of the
              numbers against the agreed measure.
            </td>
            <td>
              The service can use the summary and give feedback on what comes
              next.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Each step includes the SQL, tests and documentation that make it usable,
        and each one starts from the step already accepted. This is an example,
        not a rule to raise one PR per layer. Reuse existing models when they
        already answer the question. And if a model and its consumer have to
        change together to stay compatible, release them together.
      </p>
      <p>
        A breaking change needs a way across. You might add a replacement column
        and keep the old one for a while, so consumers can move before you
        remove it. Agree the meaning and the switch-over with those consumers
        first. Renaming a column in a small PR still breaks any query that
        expects the old name. Small releases mean fewer changes to reason about, not
        fewer people affected.
      </p>

      <h3>Write down what each release should change</h3>
      <p>
        A small release lets you check that a change did what you expected.
        Before you change an age boundary, write down which records should move
        and which should stay put. After a focused build, compare those groups
        on the same inputs and reference date. If the result surprises you,
        there are only a few changed rules to look at. Bundle that fix with a
        new join and a different reporting period and you&apos;ll struggle to
        find the cause.
      </p>
      <p>
        Carry that evidence through review, then check the deployment and the
        result it produced. Feedback might confirm the change or turn up a new
        requirement. If that next piece can be delivered on its own, record it
        separately. Releasing often means repeating this cycle whenever a useful
        change is ready. There&apos;s no release quota, and no reason to save
        unrelated work for one big launch.
      </p>
      <p>
        The cycle goes like this: agree an outcome, build it on a branch,
        validate, review, merge, deploy, look at the result, and decide the next
        change. A merge hands the change to deployment. Whether the
        warehouse now holds the result you wanted is a separate check. The rest of this chapter
        covers what happens between that decision and the data people use.
      </p>

      <h2>GitHub Actions checks each change and deploys it</h2>
      <p>
        GitHub Actions runs the checks a change needs before it merges, and
        deploys it to production afterwards. A workflow is a file under{" "}
        <code>.github/workflows/</code> that defines one or more automated
        jobs. GitHub Actions runs each job on a runner, a temporary machine
        that checks out the project and runs its commands. Suppose a reviewed
        change corrects a waiting-list count. The SQL and its tests have
        changed in Git, but production still holds the old result until these
        stages run.
      </p>
      <table>
        <thead>
          <tr>
            <th>Stage</th>
            <th>Question answered</th>
            <th>Warehouse effect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>PR compile gate</td>
            <td>Can dbt render and analyse the project?</td>
            <td>Nothing is built.</td>
          </tr>
          <tr>
            <td>Merge-queue validation</td>
            <td>
              Do the changed models build and pass their tests in the exact
              candidate GitHub would merge?
            </td>
            <td>
              Changed models, and any model between two of them, build in DEV.
              Their other descendants don&apos;t.
            </td>
          </tr>
          <tr>
            <td>Deployment</td>
            <td>
              Did the changed models and everything downstream of them build in
              production?
            </td>
            <td>Production tables and views are created or refreshed.</td>
          </tr>
          <tr>
            <td>Scheduled refresh</td>
            <td>Does the code build on the latest source data?</td>
            <td>The same code processes new source data.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Each stage gives its own result. An approved PR can still fail at
        deployment. A successful deployment says nothing about a source delivery
        that hasn&apos;t arrived yet.
      </p>

      <h2>Development builds go to the DEV__ databases</h2>
      <p>
        The project&apos;s <code>profiles.yml</code> defines a development
        target, a production target, and two CI targets the compile gate uses.
        When you run <code>dbt build</code> with the normal development target,
        the project&apos;s naming macro sends each model to a mirror database
        such as <code>DEV__STAGING</code>, <code>DEV__MODELLING</code> or{" "}
        <code>DEV__REPORTING</code>. The data lake has no mirror. Development
        reads real source data where it sits and writes its models to the{" "}
        <code>DEV__</code> databases. Seeds are the exception. They always load
        to <code>DATA_LAKE__NCL.DBT_SEEDS</code>, whatever the target, so a seed
        you load locally writes to the table production uses. Production
        workflows use the <code>prod</code> target, which writes to the
        databases consumers query.
      </p>
      <p>
        That routing keeps your local builds and the merge-queue builds away
        from the tables people use. It isn&apos;t a permission boundary, though.
        The target decides where dbt writes. Snowflake roles and grants decide
        what you&apos;re allowed to do. In normal work, use the development
        target locally and leave production builds to the workflows.
      </p>

      <h2>The compile gate checks every PR commit</h2>
      <p>
        The compile gate checks that dbt can render and analyse the project.
        A PR can&apos;t merge until it passes. <code>dbt-compile.yml</code>{" "}
        runs whenever a PR into <code>main</code>{" "}
        is opened, reopened, marked ready for review or gets a new commit. It
        has no path filter, because its <code>Fusion compile</code> check is
        required on every PR. It runs <code>dbt compile --target ci-dev</code>,
        which is read-only. dbt renders the project and analyses the compiled
        SQL without building anything. It still sends Snowflake some queries,
        because a few macros look things up with <code>run_query</code> while
        they render, but none of them create or change a table.
      </p>
      <p>
        Fusion, the dbt engine the project runs on, includes a SQL engine of its
        own, so it reads each model&apos;s SQL instead of treating it as an
        opaque string. That means the gate can reject invalid SQL, broken{" "}
        <code>ref()</code> and <code>source()</code> calls, and bad YAML or
        Jinja. It runs Fusion&apos;s default <code>baseline</code> analysis,
        because neither the workflow nor <code>dbt_project.yml</code> asks for
        more. Checking column names and data types against upstream models
        belongs to <code>strict</code> mode. So if you select{" "}
        <code>patient_age</code> from a model whose column is called{" "}
        <code>age</code>, the compile gate will usually pass, and the error
        appears when the model builds in the merge queue. dbt&apos;s{" "}
        <a href="https://docs.getdbt.com/docs/build/about-static-analysis">
          static analysis guide
        </a>{" "}
        compares the modes.
      </p>
      <p>
        Other fast checks run alongside it. They check the PR title, hardcoded
        table names, layer boundaries, model descriptions, declared test
        coverage and model ownership. When GitHub later builds a merge-queue
        candidate, the compile gate runs again with <code>ci-prod</code>, so the
        final change is analysed against production metadata before it reaches{" "}
        <code>main</code>.
      </p>
      <p>
        Compiling can&apos;t tell you how the query behaves when Snowflake runs
        it on real data. It doesn&apos;t build the table, count its rows or run
        its data tests. The merge-queue validation does that.
      </p>

      <h2>Snowflake validation runs in the merge queue</h2>
      <p>
        Validation builds your changed models in Snowflake and runs their
        tests, on the version of <code>main</code> your merge would produce.
        On an ordinary PR push, the validation workflow only reports that its
        work is waiting for the merge queue. Once a reviewer approves and you
        select <strong>Merge when ready</strong>, GitHub adds the PR to its
        merge queue. It then builds a temporary candidate: the latest{" "}
        <code>main</code>, plus any PRs ahead of yours in the queue, plus your
        change. That candidate is exactly what <code>main</code> would look like
        after the merge, and validation runs against it. If the candidate fails,
        GitHub takes your PR out of the queue and nothing merges.
      </p>
      <p>
        To choose what to build, validation compares the candidate with the last
        deployment. Every deploy saves a manifest, a file that records each
        model, test and setting in the project as it was deployed. The workflow
        fetches that manifest and builds <code>state:modified</code> nodes with
        the development target. Those are nodes that are new, or whose SQL,
        configuration or macros differ from the manifest. It also builds any
        unchanged model that sits between two changed ones, so a changed model
        never reads a stale copy of something another change affects. A change
        to the UEC diagnosis or procedure models also rebuilds their encounter
        parent, so the relationship tests compare fresh codes with fresh
        encounters. Tests tagged <code>reconciliation</code> are left out here
        and in state-based deploys, because they compare two sides that a
        partial build only half refreshes. Scheduled builds run them. If no
        manifest exists, it builds only the dbt files the candidate changed. It
        never falls back to building the whole project.
      </p>
      <p>
        Notice what&apos;s missing. Validation doesn&apos;t build the
        descendants of your change. Change <code>int_wl_current</code> and the
        merge queue builds and tests that model alone. The waiting-list facts
        and products that read it are rebuilt only at deployment, so a break in
        one of them shows up there first.
      </p>
      <p>
        A model built alone needs its parents. When a manifest is
        available, validation adds <code>--defer --favor-state</code>. Any
        parent model or snapshot that isn&apos;t selected then resolves to the
        production table recorded in the manifest. Sources read from where they
        always sit, and ephemeral models are inlined into the SQL. So if{" "}
        <code>int_wl_current</code> reads a staging model you didn&apos;t touch,
        the build reads production&apos;s copy of it and doesn&apos;t depend on
        the DEV mirror being full or up to date. Your changed nodes still write
        only to the <code>DEV__</code> databases. See dbt&apos;s{" "}
        <a href="https://docs.getdbt.com/reference/node-selection/defer">
          defer reference
        </a>{" "}
        for how <code>--favor-state</code> changes where a <code>ref()</code>{" "}
        points.
      </p>
      <p>
        You don&apos;t have to wait for the queue to see a DEV build. Add the{" "}
        <code>❄️snowflake-ci</code> label to the PR and the workflow merges the
        current <code>main</code> into your branch, builds it the same way, and
        removes the label. The result shows as a separate{" "}
        <code>DEV build (snowflake-ci)</code> check that doesn&apos;t block
        merging. Later commits aren&apos;t rebuilt, so add the label again to
        repeat it.
      </p>
      <p>
        A green validation means the selected nodes built and their tests passed
        on the inputs that run used. Whether the definition, grain and change are
        the right ones is for review to decide. The{" "}
        <Link href="/learn/git-and-prs">Git and pull requests</Link> chapter
        covers how those kinds of evidence fit together before merge.
      </p>

      <h2>A deploy rebuilds changed models and their descendants</h2>
      <p>
        <code>dbt-deploy.yml</code> builds the changed models, and everything
        downstream of them, in production. A push to <code>main</code> that
        touches models, macros, seeds, snapshots, packages or project
        configuration starts it. The workflow fetches the manifest the last
        deploy saved and, in effect, runs:
      </p>
      <p>
        <code>
          dbt build --target prod --select state:modified+
          tag:indicator_definitions+ --state state
        </code>
      </p>
      <p>
        <code>state:modified</code> works as it does in validation. The trailing{" "}
        <code>+</code> adds every descendant. A change to{" "}
        <code>int_wl_current</code> deploys that model plus the waiting-list
        facts, provider summaries and published products that depend on it. The{" "}
        <code>tag:indicator_definitions+</code> part is there because a few
        indicator definition models are built from model metadata and call no{" "}
        <code>ref()</code>, so state comparison can&apos;t see when their YAML
        changes. A manual run, or a deploy with no saved manifest, builds the
        whole project. A <code>[skip deploy]</code> marker in the commit message
        or PR title skips the deploy.
      </p>
      <p>
        Saving the manifest has a side effect. Once compile
        succeeds, the deploy saves its manifest as the new baseline, even if
        some models then fail to build. That keeps the next PR&apos;s deploy
        focused on its own change. It also means the next deploy sees your
        failed model as unchanged and won&apos;t retry it. A failed model gets
        rebuilt by a fix PR, a manual run, or the next scheduled build that
        selects it. Someone has to investigate it either way. The{" "}
        <Link href="/reference/operations">production reference</Link> covers
        how the baseline is saved and what happens when there isn&apos;t one.
      </p>
      <p>
        Incremental models add rows to an existing table instead of rebuilding
        it, so a logic change normally only affects new rows. If the whole
        history needs rebuilding, add the <code>🔄full-refresh</code> label to
        the PR. The merge-queue build and the deploy then add{" "}
        <code>--full-refresh</code> to their selection. The{" "}
        <Link href="/advanced/materialisations">materialisations guide</Link>{" "}
        explains when you need it.
      </p>
      <p>
        One quirk comes from Fusion. The workflows install the latest version of
        the engine, so an engine upgrade can change how the manifest is written.
        When that happens, <code>state:modified</code> may select extra nodes
        once. It won&apos;t miss any, and the next saved manifest resets the
        baseline.
      </p>

      <h2>Scheduled builds refresh production tables with new data</h2>
      <p>
        A scheduled build reruns the deployed SQL on the source data available
        at that time. A deploy only runs when a code change reaches{" "}
        <code>main</code>, and a table never refreshes just because its source
        changed. After deployment, the waiting-list SQL might not change for
        weeks while providers keep sending newer records. Scheduled builds run
        the models again so their stored tables reflect the new inputs.
      </p>
      <p>
        Snowflake tasks start each scheduled run at a fixed time, London time.
        The daily build runs at 06:00 every day except Monday, after the
        upstream OLIDS project finishes its own 04:00 build. It selects models
        tagged <code>daily</code>, everything downstream of the OLIDS source,
        and snapshots alongside their consumers, plus everything upstream of the
        tagged models and the indicator definition models with their
        descendants. Monday&apos;s 06:00 run is the weekly build, which covers
        everything from staging down except models tagged{" "}
        <code>monthly-full</code>. It skips a Monday that falls on the 1st,
        because that day a monthly full refresh rebuilds the same selection from
        scratch, those tagged models included. An SDL intraday run at 09:00 and
        13:00 rebuilds the models that read SDL. The{" "}
        <Link href="/reference/operations#scheduled-selections">
          schedule reference
        </Link>{" "}
        has the exact selectors.
      </p>
      <p>
        So check two things for your model. Is it in a selection, and does that
        cadence meet the consumer&apos;s need? A daily model that built at 06:00
        can still describe yesterday&apos;s data if today&apos;s delivery was
        late. Build time, the period the source covers, and how fresh the user
        needs the data to be are three separate things to check.
      </p>

      <h2>Deploy and scheduled failures open GitHub issues</h2>
      <p>
        The deploy and scheduled workflows pass their run results to{" "}
        <code>report_dbt_failures.py</code>, which opens or updates a GitHub
        issue naming each failed node and its error. If something the failure
        depends on changed recently, the issue mentions the author of the PR
        most likely responsible. GitHub&apos;s Teams app posts issues with these
        labels to the team channel.
      </p>
      <p>
        The two workflows close their issues differently. A scheduled failure
        opens one issue per run type, such as &quot;Scheduled dbt run failing:
        daily&quot;, labelled <code>dbt-scheduled-run-failure</code>. Repeat
        failures add comments, and the next successful run of that type closes
        it. That works because each run of a type selects the same models.
        Deploy failures go to one &quot;dbt deploy failing&quot; issue, labelled{" "}
        <code>dbt-run-failure</code>. A later green deploy doesn&apos;t close
        it, because that deploy probably never touched the broken models. It
        closes only when one successful deploy builds every node it still names,
        ignoring nodes that have left the project. Successes don&apos;t add up
        across deploys. If one deploy fixes half the nodes and the next fixes
        the rest, the issue stays open. SDL intraday runs don&apos;t open
        issues.
      </p>
      <p>
        When a model or test fails, dbt skips everything downstream of it, so
        those tables usually keep their previous contents. The failed table
        itself needs checking. A model can finish building and then fail a data
        test, which leaves its new version in place while its descendants are
        skipped. A test set to <code>warn</code> severity doesn&apos;t skip
        anything. A red run contains the failure. It doesn&apos;t roll the graph
        back.
      </p>
      <p>
        The issue links to the failed run. The{" "}
        <Link href="/learn/observing-production">next chapter</Link> follows the
        investigation, including how to tell a failed model from its skipped
        descendants and how to confirm it&apos;s recovered.
      </p>

      <h2>What a model author is responsible for</h2>
      <p>
        The workflows handle deployment and scheduling, but the repository has to
        hold enough information to run a model correctly. Before merge, make
        sure the model:
      </p>
      <ul>
        <li>
          uses <code>ref()</code> for every model it depends on, with{" "}
          <code>source()</code> kept in the generated raw models;
        </li>
        <li>has tests that protect its grain and key business rules;</li>
        <li>has the tags for the cadence its consumers need;</li>
        <li>builds in development and has passed merge-queue validation;</li>
        <li>documents any unusual operational dependency or recovery step.</li>
      </ul>
      <p>
        After merge, check the deployment result and confirm the change had the
        analytical effect you expected. High-impact changes get whatever extra
        comparisons and consumer messages you agreed in review. If the model
        later appears in a failure issue, its SQL, description, tests, lineage
        and run results should give whoever responds enough to act on, without
        reconstructing your original work.
      </p>
      <p>
        Deployment tells you whether the change built. Keeping it healthy
        afterwards is a separate job.{" "}
        <Link href="/learn/observing-production">Observing production</Link>{" "}
        shows how the Elementary-backed app ties later runs, failures,
        performance and downstream impact together.
      </p>

      <Quiz
        title="Check the workflows"
        questions={[
          {
            prompt:
              "Why release an age-boundary correction separately from an unrelated practice-join change?",
            options: [
              "A small change never needs review",
              "The team can check one expected effect and investigate differences more easily",
              "Git cannot merge changes to several files",
              "Each release must contain exactly one commit",
            ],
            answer: 1,
            explain:
              "Focused changes make cause and effect easier to check. Still include the tests, documentation and any consumer changes the release needs.",
          },
          {
            prompt:
              "A PR has merged. What completes the author's release check?",
            options: [
              "Seeing the branch disappear",
              "Waiting for an unrelated later PR to pass",
              "Checking the deployment result and confirming the intended analytical effect",
              "Assuming the scheduled refresh has already run",
            ],
            answer: 2,
            explain:
              "Merge records the accepted code. Deployment, and checks on the data it produced, show whether the change reached consumers.",
          },
          {
            prompt:
              "Which dbt check runs automatically on every pull-request update?",
            options: [
              "A full production build",
              "The compile gate against DEV metadata",
              "The monthly full refresh",
              "The Snowflake validation build",
            ],
            answer: 1,
            explain:
              "dbt-compile.yml runs on every PR commit. The Snowflake validation build runs on the merge-queue candidate, or once when you add the snowflake-ci label.",
          },
          {
            prompt:
              "A change to int_wl_current merges. Why are its downstream facts selected for deployment?",
            options: [
              "Their names begin with fct_",
              "The deploy always rebuilds the entire project",
              "The state:modified+ selector includes changed nodes and their descendants in the DAG",
              "A developer lists them manually in the workflow",
            ],
            answer: 2,
            explain:
              "The trailing plus follows ref() dependencies downstream, so consumers of the changed definition rebuild without anyone maintaining a deployment list.",
          },
          {
            prompt:
              "A model builds but its data test fails during a scheduled run. What happens?",
            options: [
              "The entire warehouse is rolled back",
              "The model's new relation may exist; dbt skips its descendants and the failure is reported",
              "Every downstream model builds anyway",
              "The failed model is deleted",
            ],
            answer: 1,
            explain:
              "Tests can fail after the table is built. dbt contains the failure by skipping descendants. Anyone querying the failed model directly still sees its new rows, so it needs investigating.",
          },
        ]}
      />
    </LessonShell>
  );
}
