import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Checklist } from "@/components/Checklist";
import { GuidedCourseLink } from "@/components/GuidedCourseLink";

export const metadata: Metadata = { title: "Review & merge" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="review-and-merge"
      kicker="Walkthrough · 7"
      title="Review & merge"
      lede="Start with an open pull request and its branch checked out. You'll answer review on that branch, merge once the reviewer and the checks agree, then bring your local copy up to date."
      minutes={4}
    >
      <GuidedCourseLink href="/courses/first-pr/merge-and-after" />

      <p>
        Any fixes you push to that branch appear in the same review. These are
        the last two stages of the{" "}
        <Link href="/learn/git-and-prs#the-working-loop">working loop</Link>.
      </p>

      <h2>What reviewers check</h2>
      <p>
        A reviewer checks whether the model does the right job in a way others
        can maintain. Automated checks catch a lot of implementation problems
        first, so human review is where the team decides whether the design is
        right. A reviewer is weighing three questions.
      </p>
      <ul>
        <li>
          <strong>Architecture.</strong>{" "}Does each model have one coherent
          job? Is useful logic somewhere other models can reuse it? One job can
          still involve several transformations.
        </li>
        <li>
          <strong>Clinical correctness.</strong>{" "}Are the definitions,
          populations, exclusions and code lists sound?
        </li>
        <li>
          <strong>Maintenance.</strong>{" "}Can someone else follow the code? Can
          they see what a future change to the source or the definition would
          involve?
        </li>
      </ul>
      <p>
        The standard to hold each other to is the one Google wrote down for its
        own reviews. Approve once the change definitely makes the codebase
        better, even if it isn&apos;t perfect. There&apos;s no perfect model,
        only a better one. A change that improves things shouldn&apos;t wait days
        for polish.
      </p>
      <p>
        When a suggestion is optional, say so. Starting the comment with
        &quot;nit:&quot; works. Then the author can tell what blocks the merge
        and what&apos;s only worth considering.
      </p>
      <Callout kind="info" title="Make the reasoning useful">
        <p>
          A strong review comment names the concern and says why it matters.
          Then it asks a question or suggests a direction. For example:
          &quot;This model both defines eligibility and shapes the final output.
          Would pulling out the reusable eligibility logic make future changes
          easier to isolate?&quot;
        </p>
      </Callout>

      <h2>Respond to review</h2>
      <p>
        Make the requested change on the same branch, then commit and push it.
        The PR updates by itself and the checks run again.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git add -u
git commit -m "fix: address review feedback"
git push
`}
      />
      <p>
        <code>git add -u</code>{" "}stages changes to files Git already tracks. If
        you added a new file, name it with <code>git add path/to/file</code>.
      </p>
      <p>
        Coming back to the branch on another day, or after someone used{" "}
        <em>Update branch</em>{" "}on the PR? Run <code>git switch</code>{" "}with
        the branch name, then <code>git pull</code>, before you edit. Don&apos;t
        force-push a branch under review. It replaces the history reviewers
        have already read. If <code>main</code>{" "}has moved on, you only need
        to bring it in for a conflict or a change you depend on. The{" "}
        <Link href="/learn/git-and-prs#the-working-loop">working loop</Link>{" "}
        explains both routes.
      </p>
      <p>
        Then reply in the review thread with what changed. If you disagree,
        explain the data or design reason there. A review comment opens a
        discussion. You don&apos;t have to accept it in silence.
      </p>
      <Callout kind="tip" title="Close the loop in the thread">
        <p>
          A short reply like &quot;done in abc1234&quot; tells the reviewer where
          to look. It also keeps the reasoning for the next person who reads
          the PR. You&apos;ll find the short commit ID in the PR&apos;s commit
          list.
        </p>
      </Callout>

      <h2>Merge and update your local copy</h2>
      <p>
        Once the PR is approved and the required checks are green, select{" "}
        <em>Merge when ready</em>. The PR joins the merge queue. The queue builds
        your changed models in the shared dev environment and runs their tests.
        If they pass, GitHub squash-merges the PR, so your branch lands on{" "}
        <code>main</code>{" "}as one tidy commit. If they fail, the PR leaves the
        queue and you fix it the same way as any red check.
      </p>
      <p>
        Wait until the PR page says <strong>Merged</strong>. If GitHub offers a{" "}
        <em>Delete branch</em>{" "}button, use it. Then update your local copy.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git switch main
git pull
git branch -d feat/short-description
`}
      />
      <p>
        <code>git branch -d</code>{" "}may refuse and say the branch is{" "}
        <em>not fully merged</em>. That&apos;s expected after a squash merge.
        The commit on <code>main</code>{" "}is new, so Git can&apos;t tell your
        branch&apos;s commits went into it. Before you force the delete, check
        that the PR holds everything on your branch. A commit you made after the
        last push, or never pushed, isn&apos;t in the PR.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git log --oneline -1 feat/short-description
`}
      />
      <p>
        Compare that commit ID with the last commit in the PR&apos;s{" "}
        <em>Commits</em>{" "}tab. If they match, the PR has all of it, and{" "}
        <code>git branch -D feat/short-description</code>{" "}is safe. If they
        don&apos;t, run{" "}
        <code>git log --oneline &lt;last-pr-commit&gt;..feat/short-description</code>{" "}
        to list the extra commits. Keep them by pushing the branch under a new
        name, or ask the team, before you delete anything.
      </p>

      <h2>Check the production deploy</h2>
      <p>
        After the merge, the deploy workflow builds your changed models and the
        models downstream of them in production. Check its result before you
        move on. You&apos;ll find it in the repository&apos;s{" "}
        <em>Actions</em>{" "}tab, under <em>dbt Deploy to Production</em>.
      </p>
      <p>
        Later scheduled runs rebuild and test the models they select. Your YAML
        descriptions appear on the docs site and as Snowflake comments.
      </p>
      <p>
        If production fails, keep the PR link and the failing job together when
        you ask for help. &quot;What failed?&quot; is only half the question. Ask
        too whether it also failed in the merge-queue build, or whether
        production is different.
      </p>

      <Callout kind="info" title="Production can also be run manually">
        <p>
          The <em>dbt Deploy to Production</em>{" "}workflow has a{" "}
          <em>Run workflow</em>{" "}button in the Actions tab. A manual run
          builds the whole project in production from <code>main</code>. It
          takes no selection and doesn&apos;t full-refresh anything. That makes
          it a heavy tool, so don&apos;t make it your normal route. Ask the team
          before you start one, and avoid clashing with scheduled work.
        </p>
        <p>
          When an incremental model needs a full refresh, use the PR instead.
          Add the <code>🔄full-refresh</code>{" "}label before it merges. The
          deploy then rebuilds your changed models and everything downstream of
          them from scratch.
        </p>
      </Callout>

      <Checklist
        id="merge"
        items={[
          { key: "review", label: <>Review threads answered and required checks green</> },
          { key: "merged", label: <>PR squash-merged and remote branch deleted</> },
          { key: "local", label: <>Local <code>main</code>{" "}pulled and feature branch removed</> },
          { key: "prod", label: <>Production result checked after deployment</> },
        ]}
      />
    </LessonShell>
  );
}
