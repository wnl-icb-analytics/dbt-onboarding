import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { LessonQuote } from "@/components/LessonQuote";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Git in more depth" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="git-in-depth"
      kicker="Going further 01"
      title="Git in more depth"
      lede="This page explains what Git does under the everyday commands. It covers what a commit and a branch are, why your view of GitHub can be out of date, how big a change to propose, what automated checks and reviewers each look for, and where to record a decision."
      minutes={12}
    >
      <h2>A commit is a snapshot with a parent</h2>
      <p>
        A commit records the whole tracked project as it stood when you
        committed, not only the files you changed. Git stores unchanged files as
        links to copies it already has, so this costs almost nothing. Each
        commit also points at the commit before it, its parent. Follow the
        parents back and you have the history.
      </p>
      <p>
        A commit has an id, a long hash usually shortened to its first seven
        characters, like <code>3f2a1c9</code>. It records the author, the time
        and a message saying what changed. Commits don&apos;t change once they
        exist. Undoing something in Git means adding a new commit or moving a
        branch, which is why most mistakes can be recovered.
      </p>

      <h2>A branch is a name that points at a commit</h2>
      <p>
        A branch isn&apos;t a copy of the project folder. It&apos;s a name, such
        as <code>main</code> or <code>fix/age-band-boundary</code>, that points
        at one commit. When you commit on a branch, the new commit&apos;s parent
        is the one the name pointed at, and the name moves forward to the new
        commit. Creating a branch only writes a new name, so it&apos;s instant,
        and one branch per task costs you nothing.
      </p>
      <p>
        Git tracks which branch you&apos;re on, and calls it <code>HEAD</code>.{" "}
        <code>git status</code> prints it on its first line, and VS Code shows
        it in the status bar at the bottom of the window.
      </p>

      <h2>origin/main is your last-known copy of GitHub</h2>
      <p>
        Your clone also keeps names for GitHub&apos;s branches, such as{" "}
        <code>origin/main</code>. Git calls these remote-tracking branches.
        They record where GitHub&apos;s branches were the last time your clone
        talked to GitHub.
      </p>
      <LessonQuote
        attribution="Scott Chacon and Ben Straub"
        work="Pro Git"
        href="https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches"
      >
        Think of them as bookmarks, to remind you where the branches in your
        remote repositories were the last time you connected to them.
      </LessonQuote>
      <p>
        So <code>origin/main</code> isn&apos;t a live view. It moves only when
        you fetch, pull or push. <code>git status</code> compares your branch
        with that bookmark, not with GitHub itself. If colleagues merged three
        changes this morning and you haven&apos;t fetched,{" "}
        <code>git status</code> on <code>main</code> says you&apos;re up to
        date, because you&apos;re level with an old bookmark. Run{" "}
        <code>git fetch</code> and the same command says you&apos;re behind by
        3 commits.
      </p>

      <h2>The model explains three common surprises</h2>
      <p>
        &quot;I committed, so why can&apos;t anyone see it?&quot; A commit goes
        into your local history and nowhere else. It reaches GitHub when you
        push. If the branch has never been pushed, GitHub has no copy of it at
        all.
      </p>
      <p>
        &quot;Why does it say up to date?&quot; Because it&apos;s comparing your
        branch with <code>origin/main</code> as of your last fetch.{" "}
        <code>git fetch</code> moves the bookmark to where GitHub is now.{" "}
        <code>git pull</code> does that and brings the new commits into your
        branch.
      </p>
      <p>
        &quot;I saved, but Git says nothing changed.&quot; If{" "}
        <code>git status</code> lists the file under &quot;Changes to be
        committed&quot;, you&apos;ve staged it already, and plain{" "}
        <code>git diff</code> only shows unstaged edits. Use{" "}
        <code>git diff --staged</code>. If <code>git status</code> lists nothing
        at all, Git isn&apos;t looking at the file you edited. Your terminal
        may be open in another folder, you may have edited a copy outside the
        project, or the file may be one that <code>.gitignore</code> tells Git
        to skip, like the compiled SQL dbt writes under <code>target/</code>.
      </p>

      <h2>Small commits and small PRs solve different problems</h2>
      <p>
        Small commits make the branch&apos;s history easy to follow. Until the
        branch merges, they&apos;re all part of one proposed change. A small PR
        is about what the reviewer has to reason about at once.
      </p>
      <p>
        Take the fix to the asthma register&apos;s lower age boundary. Imagine
        the same PR also renames thirty models, changes a practice join and
        reformats each SQL file. If the population count moves, the reviewer
        now has to work out which change caused it. A passing test won&apos;t
        explain the difference, and checking the age boundary means
        understanding everything else first.
      </p>
      <p>
        With only the boundary fix in the PR, you can say what to expect before
        you run anything. People at the boundary change group. Everyone else
        keeps theirs. Compare the old and new logic on the same input records
        and the same reference date. A mismatch is then easy to chase, the
        reviewer has a clear claim to check, and you can tell the effect of your
        edit apart from data that arrived overnight.
      </p>
      <p>
        A small PR includes the SQL, tests and documentation for one whole
        change. Split those into separate releases and the rule spends time
        undocumented or unprotected. Keep unrelated clean-up out. But if a
        model that uses yours would break without an adjustment, that
        adjustment belongs in the PR. Counting files won&apos;t tell you what
        can be reviewed and released together.
      </p>
      <p>
        Ask for review early, while the change is small. A reviewer can answer
        sooner when there&apos;s less to piece together, and you can act on
        their feedback before you build more work on an assumption they
        dispute.{" "}
        <Link href="/learn/merge-to-production#release-small-useful-changes-often">
          From merge to production
        </Link>{" "}
        carries this habit through deployment and feedback from users.
      </p>

      <h3>A one-line change can affect many models</h3>
      <p>
        Review effort follows what a change means, not how many lines it
        touches. Rewording a description is usually low risk. Changing one
        operator in a shared register can move thousands of rows and the
        products built on it. In the PR, name the models and products that use
        the one you changed, and say whether the change adds something,
        corrects something, or breaks what users relied on. Later chapters show
        how to find those users from the project&apos;s lineage.
      </p>
      <p>
        Scale the evidence to that impact. A new description may need only
        compilation and review. A change to what one row means needs builds of
        the models that use it, a comparison of old and new populations, and a
        word with the people who rely on it. A change to one programme&apos;s
        published model needs evidence that the shared models haven&apos;t
        moved.
      </p>

      <h2>Automation and review answer different questions</h2>
      <p>
        Several kinds of evidence stand between a PR and a merge. They overlap,
        but none can stand in for the others.
      </p>
      <table>
        <thead>
          <tr>
            <th>Evidence</th>
            <th>What it&apos;s good at</th>
            <th>What it can&apos;t establish alone</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fast CI checks</td>
            <td>
              Whether the project compiles and follows its structural rules,
              whether models have descriptions and tests, and the PR title
            </td>
            <td>Whether the analytical concept is the right one</td>
          </tr>
          <tr>
            <td>Snowflake DEV build</td>
            <td>
              Building changed models and running their tests against real
              development data
            </td>
            <td>
              Unstated requirements, or edge cases the data doesn&apos;t contain
            </td>
          </tr>
          <tr>
            <td>CodeRabbit review</td>
            <td>
              Repeatable patterns, likely bugs, joins that multiply rows and
              missing documentation
            </td>
            <td>
              Programme authority, clinical intent and organisational context
            </td>
          </tr>
          <tr>
            <td>Human review</td>
            <td>Design, domain correctness, scope and maintainability</td>
            <td>Mechanically checking each line of each change</td>
          </tr>
        </tbody>
      </table>
      <p>
        These run at different moments. Each push to the PR runs the fast
        checks. The Snowflake build waits for the merge queue, after approval.{" "}
        <Link href="/learn/merge-to-production">From merge to production</Link>{" "}
        explains that hand-off. A green tick is evidence about the checks it
        ran. Agreeing on the result you meant to produce is up to you and your
        reviewer.
      </p>
      <p>
        CodeRabbit comments on each PR against the project&apos;s written
        conventions. It might catch a real breach of the project&apos;s
        structure or a join that multiplies rows. It might also lack the
        context that makes a line correct. Fix the findings that hold up, and
        reply to explain why you&apos;re resolving one that doesn&apos;t. If
        you accept each suggestion without thinking, you give the tool more
        authority than its evidence earns. Data-safety findings are the
        exception. They have to be resolved before merge, even though
        CodeRabbit never formally blocks the PR.
      </p>

      <h3>A useful comment gives the author a claim to check</h3>
      <p>
        Here&apos;s a review comment that does its job. &quot;This join can
        return several practices per person, so a person can now appear more
        than once in a model that promises one row each. Which date rule picks
        the practice?&quot; It names what the reviewer noticed and why it
        matters, then asks a question. The author gets a claim they can test
        and a decision they can make. &quot;This looks wrong&quot; gives them
        neither.
      </p>

      <h3>Review is a design conversation that doesn&apos;t need a meeting</h3>
      <p>
        A review thread keeps the reasoning that settled a concern. The author
        might change the code, explain why the current approach is right, or
        suggest a third option. A short reply describing the outcome helps the
        next reader more than silently pushing a fix and resolving the thread.
      </p>
      <p>
        New commits on the same branch update the PR and keep the conversation.
        Reviewers can look at just the new diff and check it matches what was
        agreed. People can work at different times without losing the chain of
        reasoning that would otherwise live in a meeting or a direct message.
      </p>

      <h3>A failed check is part of the loop</h3>
      <p>
        A red check doesn&apos;t need a new branch or a new PR. Open the failed
        check and find the first error that relates to your change. Reproduce it
        locally if you can, fix it on the branch, commit and push. The PR
        updates and the checks run again.
      </p>
      <p>
        Re-running a failure you can&apos;t explain is fine for a known,
        temporary infrastructure problem. Don&apos;t make it your first move.
        Keeping the same PR keeps the diff, the discussion and the review
        history together while the proposal improves.
      </p>

      <h3>Review can change the proposed solution</h3>
      <p>
        Suppose an author changes the prescribing window in a shared asthma
        measure because a programme asked for it. A reviewer notices that other
        products use the existing window. The question has changed. Has the
        organisation-wide definition changed, or does the programme need its
        own measure?
      </p>
      <p>
        If the requirement belongs to the programme, the author can leave the
        shared measure alone and build the programme&apos;s version from the
        same evidence. They update the same branch, document the scope and add
        validation for the new result. The reasoning behind that design stays
        in the PR.
      </p>
      <p>
        That&apos;s why review needs the request as well as the diff. Both
        versions might compile and pass their declared tests. Only the
        conversation decides which definition changes, and who inherits the
        change.
      </p>

      <h2>Protected main makes continuous delivery trustworthy</h2>
      <p>
        Branch protection is a rule that lets the team move faster. GitHub
        enforces that each change reaches <code>main</code> through a PR that
        passed its required checks. Approval isn&apos;t enforced. The ruleset
        needs zero approving reviews, so a colleague&apos;s approval is team
        practice that you keep to. Together they let the deployment workflow
        deploy whatever reaches <code>main</code>, without anyone deciding by
        hand which files are safe.
      </p>
      <p>
        The squash merge leaves one commit on <code>main</code> per PR. The PR
        keeps the discussion and the original commits for anyone who needs the
        context later.
      </p>
      <p>
        Version control also makes undoing a change a deliberate act. A revert
        is a new commit, so it has to deploy like any other change, and the
        affected data may need rebuilding, because reverting Git doesn&apos;t
        restore an old copy of the warehouse. That beats editing production
        back to an earlier state by hand, because the correction gets its own
        review, evidence and explanation.
      </p>

      <h2>Record each decision where the next person will look</h2>
      <p>
        Git records the file changes for you when you commit. It can&apos;t work
        out why a rule exists, which reading was agreed, or what you checked.
        Write those down as you go, before you forget the details.
      </p>
      <table>
        <thead>
          <tr>
            <th>Information</th>
            <th>Where it belongs</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              What the model means now, such as what one row is, who&apos;s
              included, the time period and what each column holds
            </td>
            <td>The model&apos;s YAML description and column documentation</td>
          </tr>
          <tr>
            <td>A rule to check again on future data</td>
            <td>A test beside the model</td>
          </tr>
          <tr>
            <td>Why an unusual SQL step is there</td>
            <td>A short comment beside that step</td>
          </tr>
          <tr>
            <td>What this recorded step changes</td>
            <td>The commit message</td>
          </tr>
          <tr>
            <td>
              Why the change is needed, alternatives considered, affected users
              and validation evidence
            </td>
            <td>
              The PR description and review discussion, linked to an issue if
              there is one
            </td>
          </tr>
          <tr>
            <td>How to operate or recover the model</td>
            <td>
              Maintained project documentation, linked from the model or PR
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Say review of the asthma register fix settles that the lower age
        boundary is inclusive, so a child who has just turned five is counted.
        Put that meaning in the model documentation and protect it with a test.
        Keep the explanation of why it changed in the PR. An analyst using the
        model shouldn&apos;t have to dig through an old review thread to learn
        today&apos;s definition. Someone investigating the change can still find
        the reasoning.
      </p>
      <p>
        You can trace any line back through its commit to the PR that merged it.
        GitHub&apos;s file history shows changes over time, and its blame view
        shows the commit that last changed each line. Despite the name, blame is
        for finding your way, not for deciding who caused a problem. The last
        edit to a line is often just formatting, so keep following the history
        back when you need the original decision.
      </p>
      <p>
        The <Link href="/courses/git-essentials">Git essentials course</Link>{" "}
        teaches the commands hands-on. The{" "}
        <a href="https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository">
          official Git book
        </a>{" "}
        explains snapshots and the staging area, and{" "}
        <a href="https://docs.github.com/en/pull-requests">
          GitHub&apos;s pull request documentation
        </a>{" "}
        covers how collaboration works there.
      </p>

      <Quiz
        questions={[
          {
            prompt:
              "Colleagues merged changes this morning, but git status on your main says it's up to date. Why?",
            options: [
              "Their changes haven't really merged yet",
              "git status compares with origin/main as of your last fetch, and you haven't fetched since",
              "git status only checks files you've edited",
              "Your clone syncs with GitHub overnight",
            ],
            answer: 1,
            explain:
              "origin/main is a bookmark of where GitHub's main was when your clone last talked to it. git fetch moves the bookmark, and git pull fetches and brings the commits into your branch.",
          },
          {
            prompt:
              "Why can't a passing CI run prove that a register change is clinically correct?",
            options: [
              "CI does not run SQL",
              "CI can check the assertions someone wrote down, but clinical intent needs review by people with context",
              "Clinical models cannot have automated tests",
              "Only production data can reveal clinical errors",
            ],
            answer: 1,
            explain:
              "Compilation and data tests are real evidence. They can't tell you whether the team stated the right population, or whether a programme rule has the authority to change a shared definition.",
          },
          {
            prompt:
              "Review agrees a new population rule. Where should an analyst find its current meaning later?",
            options: [
              "Only in the review conversation",
              "Only in the commit title",
              "In the model documentation, with the reason for the change kept in the PR",
              "In an uncommitted personal note",
            ],
            answer: 2,
            explain:
              "The model documentation describes today's definition. The PR keeps how and why the team agreed the change, and tests protect the rules that can be checked.",
          },
        ]}
      />
    </LessonShell>
  );
}
