import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Checklist } from "@/components/Checklist";
import { GuidedCourseLink } from "@/components/GuidedCourseLink";

export const metadata: Metadata = { title: "Open your pull request" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="open-a-pr"
      kicker="Field guide · 6"
      title="Open your pull request"
      lede="The repeatable branch-to-PR sequence, plus the checks worth making before code leaves your machine."
      minutes={7}
    >
      <GuidedCourseLink href="/courses/first-pr/open-the-pr" />

      <h2>The command sequence</h2>
      <CodeBlock
        lang="bash"
        code={`
git switch main
git pull
git switch -c feat/short-description
git status
git add path/to/model.sql path/to/model.yml
git diff --staged
git commit -m "feat: add short description"
git push
gh pr create --fill
`}
      />
      <p>
        Normally, update <code>main</code>{" "}before creating the branch so your work
        starts from the latest <code>origin/main</code>. If you already edited files
        on <code>main</code>, do not pull over them: create the branch immediately;
        your uncommitted changes move with you. On the first push, run the upstream
        command Git prints if needed.
      </p>

      <Callout kind="warn" title="The repository and PR are public">
        <p>
          Check the staged diff for credentials, identifiers, row-level outputs and
          screenshots of real data. Describe validation with aggregate counts or words;
          never attach patient or person-level results. High-level counts, rates and
          validation totals are not person-level data when they cannot identify anyone.
        </p>
      </Callout>

      <h2>What opening the PR sets in motion</h2>
      <p>
        A pull request is not a form to fill in; it starts machinery. The fast
        checks run immediately — the project compiles, conventions are linted,
        ownership is verified. CodeRabbit also reads draft PRs and comments
        against the project&apos;s written conventions while the work is still in
        progress. A human reviewer is assigned when the change is ready. Once
        you select Merge when ready, merge-queue validation builds the exact
        candidate in a shared dev environment and runs its tests. Each layer
        exists because it catches what the
        previous one cannot: compilers catch what linters miss, an automated
        reviewer catches pattern violations tirelessly, and the human judges
        the things no automation can — whether the model should exist in this
        shape at all.
      </p>
      <p>
        A red check is information, not a verdict, and it blocks nothing
        permanently: open the failed check, read the log from the bottom (the
        real error is almost always the last thing that happened), fix it
        locally, and push to the same branch. The checks rerun and the review
        history stays intact — a PR that went red and then green tells a
        better story than one abandoned and reopened.
      </p>

      <h2>Use a useful description</h2>
      <p>
        The reviewer reads your description before your diff, and it sets up
        everything they do next. Its job is to answer, in advance, the four
        questions any reviewer must otherwise reconstruct: why does this
        change exist, what does each model do, what has already been verified,
        and where is judgement actually needed. The third one deserves the
        most care — the “Checked” section converts your local evidence into
        their confidence, which is what makes reviews fast.
      </p>
      <CodeBlock
        lang="text"
        title="PR description"
        code={`
## Why
Needed for the access dashboard; no staging model exists today.

## What
- stg_reference_opening_hours standardises the source's site, weekday and opening-time fields.
- Its YAML documents the output and tests the expected key.

## Checked
- dbt build -s stg_reference_opening_hours green locally
- Null closes_at retained where is_open_24h is true

## Review focus
- Does the representation of 24-hour opening make the downstream use clear?
`}
      />

      <Checklist
        id="pr"
        items={[
          { key: "branch", label: <>Work is on a named branch, not <code>main</code></> },
          { key: "diff", label: <>Staged diff contains only intended, non-sensitive changes</> },
          { key: "build", label: <>Relevant local build is green</> },
          { key: "pr", label: <>PR explains why, each model&apos;s job, checks run and review focus</> },
        ]}
      />
    </LessonShell>
  );
}
