import type { Metadata } from "next";
import Link from "next/link";
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
      kicker="Walkthrough · 6"
      title="Open your pull request"
      lede="A pull request asks a teammate to review your branch before it joins main. You'll start from an up-to-date main, commit your checked changes, push the branch to GitHub and open the request."
      minutes={7}
    >
      <GuidedCourseLink href="/courses/first-pr/open-the-pr" />

      <p>
        These steps are the first three stages of the{" "}
        <Link href="/learn/git-and-prs#the-working-loop">working loop</Link>.{" "}
        <Link href="/practice/review-and-merge">Review &amp; merge</Link> picks
        up from there.
      </p>

      <h2>Branch, commit and push</h2>
      <p>You&apos;ll run this sequence for every change.</p>
      <CodeBlock
        lang="bash"
        code={`
git switch main
git pull
git switch -c feat/short-description
# ...make and check your changes...
git status
git add path/to/model.sql path/to/model.yml
git diff --staged
git commit -m "feat: add short description"
git push -u origin feat/short-description
`}
      />
      <p>Here&apos;s what each step is for.</p>
      <ol>
        <li>
          Update <code>main</code>{" "}before you branch, so your work starts from
          the latest <code>origin/main</code>. If you&apos;ve already edited files
          on <code>main</code>, don&apos;t pull over them. Create the branch
          straight away. Uncommitted changes come with you.
        </li>
        <li>
          Name the branch with a type and a short description, like{" "}
          <code>feat/</code>, <code>fix/</code>{" "}or <code>docs/</code>.
        </li>
        <li>
          <code>git status</code>{" "}lists what changed. Stage only the files you
          meant to change, by name.
        </li>
        <li>
          <code>git diff --staged</code>{" "}shows what will go into the
          commit. Read it.
        </li>
        <li>
          Write the commit message as a{" "}
          <a href="https://www.conventionalcommits.org/">conventional commit</a>,
          starting with a type like <code>feat:</code>{" "}or <code>fix:</code>. If
          you stage <code>.env</code>{" "}by mistake, the project&apos;s
          pre-commit hook stops the commit.
        </li>
        <li>
          The first push needs <code>-u origin</code>{" "}and the branch name.
          That creates the branch on GitHub and links it to yours. After that,
          plain <code>git push</code>{" "}is enough. Push at least once a day
          while the work goes on, so it&apos;s safe on GitHub.
        </li>
      </ol>

      <h2>Sign in to GitHub on your first push</h2>
      <p>
        Pushing needs your GitHub account, even though cloning didn&apos;t.
        You cloned over HTTPS, which needs no sign-in for a public repository.
        What you see the first time you push depends on where you work.
      </p>
      <ul>
        <li>
          On Windows, Git for Windows comes with Git Credential Manager. A
          window opens asking you to sign in to GitHub, usually through your
          browser. Sign in with the account the organisation added. Git stores
          the result, so later pushes don&apos;t ask.
        </li>
        <li>
          In Codespaces, you&apos;re already signed in. The push just works.
        </li>
        <li>
          On macOS, Git may ask for a username and password in the terminal.
          GitHub doesn&apos;t accept your account password there. Install{" "}
          <a href="https://github.com/git-ecosystem/git-credential-manager">
            Git Credential Manager
          </a>{" "}
          to get the browser sign-in, or ask the team which route they use.
        </li>
      </ul>
      <p>
        If the push fails with <code>403</code>{" "}or{" "}
        <em>permission denied</em>, your GitHub account probably isn&apos;t in
        the organisation yet. Ask your team lead.
      </p>

      <h2>Open the PR on GitHub</h2>
      <p>
        After the push, Git prints a link to create a pull request. Open it. If
        you missed it, go to the repository on GitHub and select{" "}
        <em>Pull requests</em>, then <em>New pull request</em>. Set{" "}
        <em>base</em>{" "}to <code>main</code>{" "}and <em>compare</em>{" "}to your
        branch. Either way, the form opens with the project&apos;s description
        template filled in.
      </p>
      <p>
        If you&apos;ve installed the GitHub CLI and signed in with{" "}
        <code>gh auth login</code>, <code>gh pr create --web</code>{" "}opens the
        same form from the terminal. Setup doesn&apos;t install it, so it&apos;s
        optional.
      </p>
      <p>
        Give the PR a title in the same conventional form, for example{" "}
        <code>feat: add financial week staging model</code>. CI checks the title,
        because it becomes the commit message on <code>main</code>.
      </p>
      <p>
        If the work isn&apos;t finished, open the PR as a draft. Use the arrow
        on the <em>Create pull request</em>{" "}button and choose{" "}
        <em>Create draft pull request</em>. The fast checks and CodeRabbit run
        on a draft, but it can&apos;t merge. Select <em>Ready for review</em>{" "}
        when you&apos;re done.
      </p>

      <Callout kind="warn" title="The repository and PR are public">
        <p>
          Check the staged diff for credentials, identifiers, row-level output
          and screenshots of real data. Describe your checks with aggregate counts
          or in words. Never attach patient-level or person-level results.
          High-level counts, rates and validation totals are fine, as long as
          they can&apos;t identify anyone.
        </p>
      </Callout>

      <h2>What happens after you open the PR</h2>
      <p>
        GitHub starts checking your branch as soon as you open the PR. Each
        stage below catches something the one before it can&apos;t.
      </p>
      <ol>
        <li>
          Fast checks run within minutes. They compile the project, check the
          title, and look for hardcoded table names, missing descriptions,
          missing tests and missing owners.
        </li>
        <li>
          CodeRabbit, an automated reviewer, comments on the diff against the
          project&apos;s written conventions. It reviews draft PRs too, so you
          get feedback while the work is still in progress.
        </li>
        <li>
          When the change is ready, request a human reviewer from the{" "}
          <em>Reviewers</em>{" "}box on the PR page. They judge what no automation
          can, such as whether the model should exist in this shape at all.
        </li>
        <li>
          After approval, you select <em>Merge when ready</em>. The merge queue
          then builds the exact change that would land, in the shared dev
          environment, and runs its tests.
        </li>
      </ol>
      <p>
        If a check fails, open it and read the log from the bottom. A failed
        check doesn&apos;t block you for good. The
        real error is almost always the last thing that happened. Fix it
        locally, commit, and push to the same branch. The checks run again and
        the review history stays in one place. A PR that went red and then green
        tells a better story than one that was closed and reopened.
      </p>

      <h2>Write a description that helps the reviewer</h2>
      <p>
        Your reviewer reads the description before the diff, and it shapes
        everything they do next. The project&apos;s template has two main
        sections. <strong>Why</strong>{" "}says what the change does and what
        problem it solves. <strong>Checks</strong>{" "}says how you confirmed the
        result.
      </p>
      <p>
        Put the most care into Checks. It turns your local evidence into the
        reviewer&apos;s confidence, and that&apos;s what makes reviews fast. If
        there&apos;s a question you want the reviewer to weigh in on, add it at
        the end.
      </p>
      <CodeBlock
        lang="text"
        title="PR description"
        code={`
## Why

Adds stg_reference_lookup_ncl_fin_week_number_2019_2031, one row per
calendar date. Weekly activity reports need NHS financial weeks and nothing
stages this table today.

## Checks

- dbt build -s stg_reference_lookup_ncl_fin_week_number_2019_2031 green locally
- Grain test passes: calendar_date is unique and never null
- Review question: I dropped the NEW_ prefix from the source columns. Is there
  an older week definition the names should tell apart?

## Changelog

Changelog: NHS financial weeks are now available as a staging model.
`}
      />
      <p>
        The <code>Changelog:</code>{" "}line is optional. The onboarding changelog
        uses it instead of the PR title, so write it for analysts. Leave it out
        and the title is used. Add the <code>skip-changelog</code>{" "}label for
        internal changes that shouldn&apos;t appear at all.
      </p>

      <Checklist
        id="pr"
        items={[
          { key: "branch", label: <>Work is on a named branch, not <code>main</code></> },
          { key: "diff", label: <>Staged diff contains only intended, non-sensitive changes</> },
          { key: "build", label: <>Local build of the changed models is green</> },
          { key: "pr", label: <>PR title is a conventional commit, and the description says why and what you checked</> },
        ]}
      />
    </LessonShell>
  );
}
