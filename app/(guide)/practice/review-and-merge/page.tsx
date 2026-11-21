import type { Metadata } from "next";
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
      kicker="Field guide · 7"
      title="Review & merge"
      lede="Respond in the existing PR, merge when review and checks agree, then bring your local checkout up to date."
      minutes={4}
    >
      <GuidedCourseLink href="/courses/first-pr/merge-and-after" />

      <h2>What a good review is deciding</h2>
      <p>
        Automated checks run first and catch many implementation problems. Human review
        is where the team decides whether the design is the right one.
      </p>
      <ul>
        <li>
          <strong>Architecture:</strong>{" "}does each model have one coherent
          responsibility, and is useful logic placed where other models in the
          repo can reuse it? One responsibility may include several transformations.
        </li>
        <li>
          <strong>Clinical correctness:</strong>{" "}are definitions, populations,
          exclusions and code lists sound?
        </li>
        <li>
          <strong>Maintenance:</strong>{" "}can someone understand the code and see what
          a future source or definition change would require?
        </li>
      </ul>
      <p>
        The standard worth holding each other to is the one Google wrote down for
        its own reviews: approve once the change definitely improves the codebase,
        even though it is not perfect — there is no perfect model, only a better
        one. A change that makes things better should not wait days for polish;
        mark optional suggestions as such (a “nit:” prefix works) so the author can
        tell what blocks the merge from what is merely worth considering.
      </p>
      <Callout kind="info" title="Make the reasoning useful">
        <p>
          A strong review comment names the concern and why it matters, then asks a
          question or suggests a direction. For example: this model both defines
          eligibility and shapes the final output; would separating the reusable
          eligibility logic make future changes easier to isolate?
        </p>
      </Callout>

      <h2>Respond to review</h2>
      <CodeBlock
        lang="bash"
        code={`
# make the requested change, then
git add -u
git commit -m "fix: address review feedback"
git push
`}
      />
      <p>
        Reply in the review thread with what changed. If you disagree, explain the data
        or design reason there; a review comment is a discussion, not an instruction
        that must be accepted silently.
      </p>
      <Callout kind="tip" title="Close the loop in the thread">
        <p>
          A short reply such as “done in abc1234” tells the reviewer where to look and
          preserves the reasoning for the next person reading the PR.
        </p>
      </Callout>

      <h2>Merge and sync</h2>
      <p>
        Merge once approvals are present and every required check is green. The project
        uses squash merge, so the branch lands on <code>main</code>{" "}as one tidy commit.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git switch main
git pull
git branch -d feat/short-description
`}
      />

      <h2>After the merge</h2>
      <p>
        Merge is the moment responsibility transfers from you to the pipeline.
        The deploy workflow builds your changed models into production; from
        that night on, the scheduled build rebuilds them and runs their tests
        without you; and your YAML descriptions go live on the docs site and
        as Snowflake comments. Nothing further is owed unless something fails
        — which is why the deployment result is worth one look before you move
        on.
      </p>
      <p>
        If production fails, keep the PR link and failing job together when asking for
        help. The useful question is not only “what failed?” but “did this also fail in
        the PR environment, or is production different?”
      </p>

      <Callout kind="info" title="Production can also be run manually">
        <p>
          Analysts can deliberately trigger a production run of reviewed code from
          <code>main</code>. This is useful after late upstream data arrives, or when an
          incremental model needs a controlled <code>--full-refresh</code>. It is
          discouraged as the normal route: confirm the production target, select the
          smallest affected part of the DAG, avoid clashing with scheduled work, and
          tell the team when the run has a significant impact.
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
