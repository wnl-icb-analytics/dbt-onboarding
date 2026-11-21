import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Checklist } from "@/components/Checklist";

export const metadata: Metadata = { title: "Change an existing model" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="change-a-model"
      kicker="Walkthrough · 8"
      title="Change an existing model"
      lede="Start with the existing model you need to change. You'll find the models that read it, make your edit and check what it does to their results before you open a PR."
      minutes={8}
    >
      <h2>Look downstream before you edit</h2>
      <p>
        Run <code>dbt ls -s my_model+</code>{" "}before you edit. It lists the
        model and the models that depend on it, so you can see whose results
        might change.
      </p>
      <CodeBlock lang="bash" code={`dbt ls -s my_model+`} />
      <p>
        Your first PR added a model nothing depended on. Most work after that
        edits a model that others read. A new model can only be wrong in
        itself. An existing model can be right in itself and still break, or
        change the numbers in, the models that read it.
      </p>
      <p>
        The <code>+</code>{" "}after the name selects the model and everything
        downstream of it. <code>dbt ls</code>{" "}just lists them and builds
        nothing. A short list means you can read each consumer and check the
        whole set yourself. A long one changes the plan. Read the direct
        children, rely on the tests of the rest, and say in the PR how far you
        looked.
      </p>
      <p>
        While you&apos;re there, open the YAML of the models you&apos;d affect and
        note their owners, under <code>config.meta.owner</code>. If your change
        alters what someone else&apos;s model produces, message them before the
        PR. It&apos;s cheaper than a surprise in review, and they often know a
        constraint you don&apos;t.
      </p>

      <h2>Match your checks to the kind of change</h2>
      <p>
        How much checking you need depends on what kind of change you&apos;re
        making. <strong>Adding a column</strong>{" "}is the gentle case. Downstream models
        list their columns, so a new one changes nothing for them until someone
        chooses to use it. Document it. If the column makes a real claim, test
        that claim. It might be a flag that&apos;s never null, a code that has
        to resolve to a maintained list, or a date that can&apos;t come before
        referral. A free-text note claims nothing, so it needs no test.
      </p>
      <p>
        <strong>Renaming or removing a column</strong>{" "}breaks every model
        that selects it, straight away and visibly. The build fails. Your job is
        to find the usages and update them in the same PR. Search file contents
        for the column name with <code>Ctrl+Shift+F</code>, then let{" "}
        <code>dbt build -s my_model+</code>{" "}catch any usage the search missed,
        such as one hiding in a macro or an alias. The{" "}
        <Link href="/advanced/dbt-extension">dbt extension</Link>{" "}can rename a
        column across the project by following lineage, but only for models in
        Fusion&apos;s strict static analysis mode. No model in this project
        uses strict mode, so don&apos;t count on it here.
      </p>
      <p>
        <strong>Changing logic</strong>, like a filter, a join or a derivation,
        deserves the most respect, because often nothing fails. The columns
        keep their names, the builds stay green, and the numbers downstream
        change. Your PR has to show that the change is correct. Say what moves
        and why, and show a before-and-after for one example a reviewer can
        check.
      </p>
      <p>
        The before-and-after is easier than it sounds. While you develop, both
        versions exist. Production still holds the output of{" "}
        <code>main</code>&apos;s logic. Once you&apos;ve built your version with{" "}
        <code>dbt build -s my_model</code>, your dev copy holds yours, in the
        same place with <code>DEV__</code>{" "}in front of the database name. One
        worksheet query puts them side by side.
      </p>
      <CodeBlock
        lang="sql"
        title="a comparison query, run in a Snowflake worksheet"
        code={`
select 'prod' as version, count(*) as row_count, count(distinct person_id) as people
from REPORTING.OLIDS_DISEASE_REGISTERS.FCT_PERSON_DIABETES_REGISTER
union all
select 'dev', count(*), count(distinct person_id)
from DEV__REPORTING.OLIDS_DISEASE_REGISTERS.FCT_PERSON_DIABETES_REGISTER
`}
      />
      <p>
        If you&apos;re not sure where a model lives, search for its name in
        Snowsight. The model&apos;s folder sets the schema. Dev is shared, so
        someone else may have built over your copy since. Rebuild just before
        you compare.
      </p>
      <p>
        Differences you expected become the evidence in your PR. Differences you
        didn&apos;t expect are the review finding, and dev is the cheapest place
        to find them.
      </p>
      <p>
        If the change fixes a bug, ask whether the cause could come back. A
        feed that sent a practice twice once can do it again. If it could, add
        the test that would have caught it, in the same PR. While the problem
        shows in the data, the test fails against the old logic and passes
        against yours. That pair is good evidence for the reviewer, and the
        test keeps the bug from returning unnoticed.
      </p>
      <p>
        <strong>Changing the grain</strong>, what one row means, is a bigger
        kind of change. Every consumer was written against the old grain, and
        their joins and counts assume it. Talk to the owners of the downstream
        models first. The model already has a grain test, because the project
        requires one. Change it to the new key in the same PR, so it checks the
        grain you&apos;re moving to rather than the old one. Treat the
        whole thing as a planned piece of work with those owners, not a quick
        edit.
      </p>

      <h2>Build and test the models that read yours</h2>
      <p>
        Build your model and everything downstream of it before you open the
        PR.
      </p>
      <CodeBlock lang="bash" code={`dbt build -s my_model+`} />
      <p>
        The same <code>+</code>{" "}that listed the consumers now rebuilds and
        tests them. A passing build of your model alone tells you it built and
        its own tests passed. It can&apos;t tell you what happened to the models
        that read it. Their tests can catch a join your change fanned out or a
        key it left empty. Tests won&apos;t catch every shift in the numbers, so
        compare the results you expect your edit to change, as above. If the
        selection is too big to build in full, build at least the direct
        children and say in the PR where you stopped.
      </p>
      <Callout kind="warn" title="If anything in the chain is incremental">
        <p>
          An incremental build only rewrites the rows its filter and strategy
          pick. <code>person_month_analysis_base</code>, for example, uses{" "}
          <code>delete+insert</code>{" "}to replace the latest month on each run.
          Your new logic reaches that month straight away. Every older month
          keeps the old behaviour until someone runs a{" "}
          <code>--full-refresh</code>. Read the model&apos;s config and{" "}
          <code>is_incremental()</code>{" "}filter to see which rows a normal run
          touches. If your change affects history outside that window, plan the
          production refresh in advance. Add the <code>🔄full-refresh</code>{" "}
          label to the PR and say why in the description. With the label on, the
          merge-queue build and the production deploy rebuild those models from
          scratch, so the merge and the refresh happen together. The{" "}
          <Link href="/advanced/materialisations">materialisations page</Link>{" "}
          explains why.
        </p>
      </Callout>

      <h2>Write the PR for the people downstream</h2>
      <p>
        Give the reviewer three things in the PR description. Which models are
        affected, and how. How far you built and tested. And for a logic
        change, one real example of a number that moves, with the reason it
        should. Whoever reviews a change to a shared model is standing in for
        everyone who reads it.
      </p>

      <Checklist
        id="change-a-model"
        items={[
          { key: "ls", label: <><code>dbt ls -s my_model+</code>{" "}read before editing</> },
          { key: "owners", label: <>Owners contacted where the change alters their models</> },
          { key: "built", label: <>Downstream built and tested, or the limit stated in the PR</> },
          { key: "semantic", label: <>Logic changes explained with a checkable example</> },
          { key: "regression", label: <>A fix for a bug that could recur comes with the test that would have caught it</> },
        ]}
      />
    </LessonShell>
  );
}
