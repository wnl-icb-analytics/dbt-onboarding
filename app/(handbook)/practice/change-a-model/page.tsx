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
      kicker="Field guide · 8"
      title="Change an existing model"
      lede="Your first PR added a model nothing depended on. Most work after that is different: editing a model that other models already read. The edit itself is the same — what changes is that you now need to know who is downstream before you start."
      minutes={8}
    >
      <h2>Look downstream before you edit</h2>
      <p>
        A new model can only be wrong in itself. An existing model can be right
        in itself and still break the things that read it — and those breaks
        happen at build time, in CI, or worst of all silently in the numbers.
        One command shows you what you are dealing with before any of that:
      </p>
      <CodeBlock lang="bash" code={`dbt ls -s my_model+`} />
      <p>
        The <code>+</code>{" "}after the name lists the model and everything
        downstream of it. A short list means you can read each consumer and
        verify the whole set yourself. A long one changes the plan: read the
        direct children, rely on the others&apos; tests, and say in the PR how
        far you looked.
      </p>
      <p>
        While you are there, open the YAML of the models you would affect and
        note their owners. If your change will alter what someone else&apos;s
        model produces, a message to them before the PR is cheaper than a
        surprise during review — they usually know a constraint you do not.
      </p>

      <h2>Not all changes carry the same risk</h2>
      <p>
        <strong>Adding a column</strong>{" "}is the gentle case. Downstream models
        select their columns explicitly, so a new column changes nothing for
        them until someone chooses to use it. Document it, test it if it has
        rules worth asserting, and move on.
      </p>
      <p>
        <strong>Renaming or removing a column</strong>{" "}breaks every model
        that selects it, immediately and visibly — the build fails. The work
        is finding the usages and updating them in the same PR. The{" "}
        <Link href="/advanced/dbt-extension">dbt extension</Link>{" "}can rename a
        column across the whole project by following lineage rather than
        matching text, which is the reliable way to catch a usage hiding in a
        macro or an alias.
      </p>
      <p>
        <strong>Changing logic — a filter, a join, a derivation</strong>{" "}is
        the case that deserves the most respect, because nothing fails. The
        columns keep their names, every build stays green, and the numbers
        downstream quietly change. Whether that change is correct is exactly
        what your PR has to establish: say what moves and why, and show a
        before-and-after for one example a reviewer can check.
      </p>
      <p>
        The before-and-after is easier to produce than it sounds, because
        while you develop, both versions exist: production still holds the
        output of main&apos;s logic, and your dev build holds yours. One
        worksheet query puts them side by side:
      </p>
      <CodeBlock
        lang="sql"
        title="a comparison query, run in a Snowflake worksheet"
        code={`
select 'prod' as version, count(*) as rows, count(distinct person_id) as people
from REPORTING.OLIDS.FCT_PERSON_DIABETES_REGISTER
union all
select 'dev', count(*), count(distinct person_id)
from DEV__REPORTING.OLIDS.FCT_PERSON_DIABETES_REGISTER
`}
      />
      <p>
        Differences you expected become the evidence in your PR. Differences
        you did not expect are the review finding itself — caught by you, in
        dev, instead of by a dashboard user in a month.
      </p>
      <p>
        <strong>Changing the grain</strong>{" "}— what one row means — is a
        different order of change. Every consumer was written against the old
        grain, and their joins and counts assume it. Talk to the owners of the
        downstream models first, update the grain test to assert the new
        contract, and treat the whole thing as a coordinated piece of work
        rather than an edit.
      </p>

      <h2>Prove it in downstream models, not only in the model you changed</h2>
      <CodeBlock lang="bash" code={`dbt build -s my_model+`} />
      <p>
        The same <code>+</code>{" "}that listed the consumers now rebuilds and
        tests them. This is the step that makes the difference: a green build
        of your model alone proves the SQL runs, and nothing more. The grain
        tests of the models downstream are what tell you whether your change
        fanned out someone&apos;s join or emptied someone&apos;s filter. If the
        selection is too wide to build in full, build the direct children at
        least, and say in the PR where you stopped.
      </p>
      <Callout kind="warn" title="If anything in the chain is incremental">
        <p>
          An incremental model applies new logic only to new rows — history
          keeps the old behaviour until someone runs a{" "}
          <code>--full-refresh</code>. If your change flows into one, the
          production refresh needs to be planned, not discovered: flag it in
          the PR so the merge and the refresh happen together. The{" "}
          <Link href="/advanced/materialisations">materialisations page</Link>{" "}
          covers why.
        </p>
      </Callout>

      <h2>Write the PR for the people downstream</h2>
      <p>
        The reviewer of a change to a shared model is standing in for everyone
        who reads it. Give them what they need: which models are affected and
        how, how far you built and tested, and — for a logic change — one
        concrete example of a number that moves, with the reason it should.
      </p>

      <Checklist
        id="change-a-model"
        items={[
          { key: "ls", label: <><code>dbt ls -s my_model+</code>{" "}read before editing</> },
          { key: "owners", label: <>Owners contacted where the change alters their models</> },
          { key: "built", label: <>Downstream built and tested, or the limit stated in the PR</> },
          { key: "semantic", label: <>Logic changes explained with a checkable example</> },
        ]}
      />
    </LessonShell>
  );
}
