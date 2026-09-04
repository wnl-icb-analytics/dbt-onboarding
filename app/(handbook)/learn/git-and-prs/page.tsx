import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { CloneDiagram } from "@/components/CloneDiagram";
import { BranchDiagram } from "@/components/BranchDiagram";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Git & pull requests" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="git-and-prs"
      kicker="Learn 12"
      title="Git & pull requests"
      lede="Git gives analytical code a shared history. Pull requests turn a proposed change into a reviewable decision with evidence before it becomes part of production."
      minutes={22}
    >
      <p>
        SQL knowledge gives you a starting point with dbt. Git introduces a
        different set of ideas: recording work, sharing it and agreeing which
        version the team should use. You do not need to know these already. This
        chapter follows an edit through those states. The{" "}
        <Link href="/courses/git-essentials">Git essentials course</Link> lets
        you practise them interactively before using your own machine.
      </p>
      <h2>A repository keeps files and their history</h2>
      <p>
        Without version control, analytical work tends to accumulate copies:{" "}
        <code> analysis_v2.sql</code>, <code>analysis_final.sql</code> and{" "}
        <code>analysis_final_comments.sql</code>. Each file preserves a state,
        but the relationship between them is implicit. It is difficult to tell
        which change introduced a rule, why it changed or which version other
        people should use.
      </p>
      <p>
        A project folder managed by Git is a <strong>repository</strong>, often
        shortened to repo. Git records snapshots of its tracked files over time.
        Each snapshot, called a commit, has an identifier, an author, a time and
        a message. Git can show the exact difference between any two snapshots,
        so the history records both the state of the project and the sequence of
        decisions that produced it.
      </p>
      <p>
        This matters more for dbt than simple backup. A change to one line can
        alter a clinical population, the grain of a mart or the products that
        depend on it. The repository places SQL, YAML, tests, macros and
        documentation in one reviewable history. A future developer can see that
        the implementation, public contract and protecting assertions changed
        together.
      </p>
      <p>
        Git is the version-control tool. GitHub is the service where the team
        shares repositories, discusses changes and runs automated checks. GitHub
        holds our shared remote repository. A clone on a developer&apos;s
        machine contains the working files and the project history. Git does not
        synchronise them silently: commits record work in the clone,{" "}
        <code>push</code> shares commits with GitHub and <code>pull</code>{" "}
        brings shared commits back.
      </p>

      <CloneDiagram />
      <p>
        Saving in your editor changes a working file. It does not create a Git
        commit. Committing records a snapshot locally; pushing shares that
        committed history. You can make several local commits before pushing. A
        new file is untracked until you choose to add it, so merely putting a
        SQL file in the project folder does not put it in the history.
      </p>
      <p>
        A commit message identifies the change. Its pull request records the
        fuller reason and validation evidence. Together they help someone trace
        a changed definition back to the decision that introduced it.
      </p>

      <h2>Branches separate unfinished work from trusted production code</h2>
      <p>
        The project&apos;s default branch is <code>main</code>. It represents
        the reviewed code from which production is deployed, so it needs to
        remain in a deployable state. Direct pushes are protected. Work begins
        on a branch: a separate line of commits starting from a known point on{" "}
        <code>main</code>.
      </p>
      <p>
        A branch is a movable name for a line of history, not a copied project
        folder. Creating one is cheap, and changes made there do not alter{" "}
        <code> main</code>. This gives developers room to compile, test, revise
        and even abandon an approach without making unfinished work part of the
        production definition.
      </p>
      <p>
        Suppose you need to correct an age boundary. Start from an updated local{" "}
        <code>main</code> and create <code>fix/age-band-boundary</code>. In a
        normal clone, switching branches changes the files shown in the same
        project folder. You do not open a second copied folder. Check the
        current branch in VS Code or with <code>git status</code> before
        editing. Uncommitted edits can follow you between branches when Git can
        preserve them, so switching branches is not a way to save or discard
        work.
      </p>
      <BranchDiagram />
      <p>
        In this diagram, the branch begins after commit C and records D, E and F
        while <code>main</code> continues to represent the trusted line. The
        proposed changes reach main when the branch is reviewed and merged. A
        merge incorporates the accepted change into the target branch. Here we
        squash-merge: G records the combined change from D, E and F as one new
        commit on main. The branch can contain several commits and still
        represent one piece of work.
      </p>
      <p>
        A branch separates code history. It does not create a private database
        or change your Snowflake permissions. Use the development target when
        building the branch; the shared DEV databases described in the previous
        chapter still need coordination.
      </p>
      <p>
        A merge conflict does not mean two people touched the repository at
        once. Git can combine changes to different files and usually different
        parts of the same file. It stops when two histories change overlapping
        lines and no mechanical choice can preserve both intentions. Short-lived
        branches reduce the opportunity for that overlap; when it occurs, a
        person decides which meaning should remain.
      </p>

      <h2>The staging area lets each commit tell one story</h2>
      <p>
        Git distinguishes the files being edited, the changes selected for the
        next snapshot and the commits already recorded. The middle state is the
        staging area. <code>git add</code> copies the current content of a file
        into that proposed snapshot; <code>git commit</code> records exactly
        what has been staged.
      </p>
      <p>
        This extra step is deliberate. A working directory can contain an SQL
        change, an unrelated note and a generated file. Staging allows the SQL
        and its YAML to become one commit while leaving unrelated work outside
        it. If a staged file is edited again, the later edit is not included
        until the file is staged again.
      </p>
      <p>
        Git&apos;s staging area is unrelated to the staging data layer. One
        selects file contents for a commit; the other prepares source data.
        Consider an edit to a model and its YAML:
      </p>
      <table>
        <thead>
          <tr>
            <th>State</th>
            <th>What it means</th>
            <th>Useful check</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Edited</td>
            <td>Your working files differ from the last commit.</td>
            <td>
              <code>git diff</code> shows unstaged edits.
            </td>
          </tr>
          <tr>
            <td>Staged</td>
            <td>You have selected file contents for the next commit.</td>
            <td>
              <code>git diff --staged</code> shows that proposed snapshot.
            </td>
          </tr>
          <tr>
            <td>Committed</td>
            <td>The snapshot exists in your local history.</td>
            <td>
              <code>git status</code> shows the branch and remaining edits.
            </td>
          </tr>
          <tr>
            <td>Pushed</td>
            <td>Your branch commits have been shared with GitHub.</td>
            <td>The PR shows the proposed difference from main.</td>
          </tr>
          <tr>
            <td>Merged</td>
            <td>The accepted change is now part of main.</td>
            <td>
              Check the separate deployment result to see whether the warehouse
              updated.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        If you stage the SQL and YAML but leave an unrelated note unstaged, the
        commit contains the two staged files. If you edit the SQL again
        afterwards, that later edit remains outside the commit until you stage
        it too. This is why inspecting the staged diff matters even after
        reading the working files.
      </p>
      <p>
        The <Link href="/courses/git-essentials">Git essentials course</Link>{" "}
        lets you practise these states. Understanding them also makes VS
        Code&apos;s source-control buttons easier to interpret.
      </p>

      <h3>Commits should preserve understandable steps</h3>
      <p>
        A useful commit has one purpose and leaves the project in a coherent
        state. SQL and the YAML that documents and tests the same model usually
        belong together. An unrelated refactor does not. The goal is not the
        smallest possible diff; it is a unit of history that another person can
        understand, review or reverse.
      </p>
      <p>
        The project uses Conventional Commit messages: a recognised type
        followed by a short imperative description. The message can finish the
        sentence &quot;this commit will…&quot;:
      </p>
      <CodeBlock
        lang="text"
        code={[
          "feat: add asthma prescribing measure",
          "fix: preserve unknown ethnicity in person demographics",
          "docs: describe diabetes register reference time",
        ].join("\n")}
      />
      <p>
        Commit signing lets GitHub verify a signature against the configured
        signing identity. The signing and message hooks are guardrails around
        provenance and readable history; they do not replace reviewing the diff.
      </p>

      <h2>A pull request is a proposal, not a file-transfer step</h2>
      <p>
        Pushing a branch makes its commits visible on GitHub. It does not put
        them on <code>main</code>. A pull request proposes that the branch
        should become part of the trusted history and shows the complete
        difference from the target branch.
      </p>
      <p>
        The PR is where an individual implementation becomes a team decision.
        The diff gives reviewers the evidence, the description explains the
        intent, automated checks report what they can establish and review
        threads record questions and resolutions. That discussion remains
        attached to the change after the branch is gone.
      </p>
      <p>
        A useful description lets a reviewer understand the proposal before
        opening the first file:
      </p>
      <ul>
        <li>
          <strong>Why:</strong> the user need, defect or domain gap that
          justifies the change.
        </li>
        <li>
          <strong>What:</strong> the responsibility of each changed model and
          how the pieces fit together.
        </li>
        <li>
          <strong>Checked:</strong> the builds, tests, comparisons and
          limitations that form the author&apos;s evidence.
        </li>
        <li>
          <strong>Review:</strong> the design or domain decisions where human
          attention is most valuable.
        </li>
      </ul>
      <p>
        A draft PR is useful before the change is ready to merge. It shares the
        direction, runs fast automation and gives collaborators a place to
        discuss an approach while revision is still cheap. &quot;Draft&quot;
        describes readiness, not quality.
      </p>
      <p>
        A PR stays attached to its branch. If review leads to a correction, edit
        the same branch, commit and push again. The proposal updates; you do not
        need a replacement PR or a new branch for each review comment.
      </p>

      <h2>Small commits and small PRs solve different problems</h2>
      <p>
        Commit when you have an understandable step worth recording. For the
        age-boundary correction, one commit might change the rule and its test;
        another might clarify the description after review. Frequent commits
        give you points to compare and explain. They do not release the work:
        those commits still belong to one proposed correction on a branch.
      </p>
      <p>
        Keep the PR focused on that correction. Imagine it also renames thirty
        models, changes a practice join and reformats every SQL file. If the
        population count changes, the reviewer must work out which alteration
        caused it. A passing test does not explain the difference, and checking
        the age boundary now requires understanding unrelated changes too.
      </p>
      <p>
        With only the boundary correction, the author can state the expected
        difference before running it: records at that boundary should change;
        records outside it should retain their classification. Compare the old
        and new logic against the same input records and reference date. That
        makes a mismatch easier to investigate and gives the reviewer a specific
        claim to check. It also separates the effect of the edit from newly
        arrived data.
      </p>
      <p>
        A useful small PR includes the SQL, tests and documentation needed for
        one complete change. Splitting those into separate releases would leave
        the rule temporarily undocumented or unprotected. Keep unrelated
        clean-up separate, but include a necessary downstream adjustment when
        the change would otherwise break its consumer. File count is a poor
        substitute for deciding what can be reviewed and released together.
      </p>
      <p>
        Ask for review while that outcome is still small. A reviewer can respond
        sooner when they have less context to reconstruct, and you can act on
        feedback before building more work on a disputed assumption. The{" "}
        <Link href="/learn/merge-to-production#release-small-useful-changes-often">
          next chapter
        </Link>{" "}
        carries this habit through deployment and feedback from users.
      </p>

      <h3>A one-line change can affect many models</h3>
      <p>
        Review effort should follow semantic impact, not line count. Rewording a
        description may be low risk. Changing one operator in a shared register
        can alter thousands of rows and every downstream product. The PR should
        use lineage to identify affected consumers and explain whether the
        change is additive, corrective or contract-breaking.
      </p>
      <p>
        Evidence should be proportional to that impact. A new description may
        need only compilation and review. A grain change needs downstream
        builds, comparison of old and new populations and coordination with
        consumers. A programme-specific published change should demonstrate that
        shared marts remain unaffected.
      </p>
      <h2>Automation and review answer different questions</h2>
      <p>
        The path from PR to merge uses several forms of evidence. They overlap,
        but none is a substitute for the others.
      </p>
      <table>
        <thead>
          <tr>
            <th>Evidence</th>
            <th>What it is good at</th>
            <th>What it cannot establish alone</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fast CI gates</td>
            <td>
              Compilation, refs, project structure and enforceable conventions
            </td>
            <td>Whether the analytical concept is the right one</td>
          </tr>
          <tr>
            <td>Snowflake DEV validation</td>
            <td>
              Building changed models and running tests against development data
            </td>
            <td>Unstated requirements or edge cases absent from the data</td>
          </tr>
          <tr>
            <td>Automated code review</td>
            <td>
              Repeatable patterns, likely bugs, fan-out risks and missing
              metadata
            </td>
            <td>
              Programme authority, clinical intent and organisational context
            </td>
          </tr>
          <tr>
            <td>Human review</td>
            <td>Architecture, domain correctness, scope and maintainability</td>
            <td>Exhaustive mechanical checking on every change</td>
          </tr>
        </tbody>
      </table>
      <p>
        These checks run at different points in the workflow. A PR update runs
        fast checks; the merge queue adds runtime validation. The{" "}
        <Link href="/learn/merge-to-production"> production chapter</Link>{" "}
        explains the exact hand-off. A green check is evidence about the checks
        it ran, not a substitute for the author and reviewer agreeing the
        intended result.
      </p>
      <p>
        An automated review comment is evidence, not an instruction. It may
        reveal a genuine staging-boundary violation or fan-out risk; it may also
        lack the context that makes a line correct. The author should fix valid
        findings and explain why an inapplicable one is being resolved. Silently
        accepting every suggestion gives the tool more authority than its
        evidence supports.
      </p>

      <h3>Human review protects meaning</h3>
      <p>
        A human reviewer should spend most attention where context changes the
        answer. Does the model represent the intended clinical population? Is a
        programme rule being allowed to redefine a shared domain concept? Does
        the grain match the advertised contract? Could the change reuse an
        established model? Will the next developer know where to alter the
        definition?
      </p>
      <p>
        Useful comments identify an observation, explain its consequence and
        suggest a direction or ask a question. &quot;This join can return
        several practices per person, so the model no longer appears to meet its
        person-grain contract. Which effective-date rule should select the
        practice?&quot; gives the author a claim they can verify and a decision
        they can resolve.
      </p>
      <p>
        Review is not an attempt to make the change resemble the reviewer&apos;s
        preferred style. Its purpose is to improve correctness, shared
        understanding and the project&apos;s ability to change safely later.
      </p>

      <h3>Review is an asynchronous design conversation</h3>
      <p>
        A review thread should preserve the reasoning that resolves a concern.
        The author may change the code, explain why the existing approach is
        correct or propose a third option. A brief reply describing the
        resolution is more useful than silently pushing a change and marking the
        thread complete.
      </p>
      <p>
        New commits on the same branch update the PR while retaining that
        conversation. Reviewers can focus on the new diff and confirm that the
        resolution matches the discussion. This allows work to happen
        asynchronously without losing the chain of reasoning that a meeting or
        direct message would otherwise hold.
      </p>

      <h3>A failed check is part of the loop</h3>
      <p>
        Red CI does not require a new branch or PR. Open the failed check,
        identify the first relevant error, reproduce it where possible, fix the
        branch, commit and push. The existing PR updates and the relevant checks
        run again.
      </p>
      <p>
        Re-running an unexplained failure may be appropriate for a known
        transient infrastructure problem, but it should not be the default
        response. Preserving the same PR retains the diff, discussion and review
        history while the proposal improves.
      </p>

      <h2>Protected main makes continuous delivery trustworthy</h2>
      <p>
        Branch protection is a constraint that enables speed. Because every
        change reaches <code>main</code> through a PR with the required review
        and checks, deployment automation can treat <code>main</code> as the
        project&apos;s approved state. Production workflows do not need a
        separate manual process to determine which files are trustworthy.
      </p>
      <p>
        Once review and the required merge-queue checks pass, the branch can be
        squash-merged: its work becomes one commit on{" "}
        <code>main</code>, the feature branch can be deleted and deployment
        takes over. The PR still preserves the detailed discussion and original
        commits for context.
      </p>
      <p>
        Version control also makes recovery deliberate. If a merged change must
        be undone, a revert records a new commit that reverses the earlier diff
        without erasing history. A code revert still needs deployment and the
        affected data may need rebuilding; reverting Git does not restore a
        warehouse snapshot. That is different from silently editing production
        back to an earlier state: the correction receives its own review,
        evidence and explanation.
      </p>
      <p>The loop then begins again from fresh shared history:</p>
      <CodeBlock
        lang="bash"
        code={[
          "git switch main",
          "git pull",
          "git switch -c feat/the-next-change",
        ].join("\n")}
      />
      <p>
        Pulling before the next branch brings in the changes colleagues have
        already merged. Git supports parallel work because the team repeatedly
        rejoins the same trusted line.
      </p>

      <h2>Keep data out of the public repository</h2>
      <p>
        The dbt project is public deliberately. Open analytical definitions can
        be inspected, challenged and adapted by others. Users can trace a result
        through documented SQL and lineage. The repository contains instructions
        for transforming data; the underlying person-level data remains in
        Snowflake under separate access controls.
      </p>
      <p>
        Code, YAML, tests and documentation belong in Git. Patient data,
        row-level query results, credentials and private personal information do
        not. That applies to comments, screenshots, test fixtures, PR
        descriptions and copied error output as well as obvious CSV extracts.
      </p>
      <p>
        <code>.gitignore</code> keeps predictable untracked files such as{" "}
        <code> target/</code>, logs, local environments and credentials out of
        normal Git status. It is not a security scanner. It does not inspect
        file contents and does not stop Git tracking a file that was already
        added.
      </p>
      <p>
        Seeds are a deliberate exception for small, non-sensitive reference data
        that is reviewed and versioned as part of the project. They are not a
        convenient place for an extract. If sensitive data or a credential is
        committed, deleting the line in a later commit does not undo the
        disclosure; notify the appropriate team immediately so the incident or
        secret rotation can be handled.
      </p>
      <p>
        High-level counts, rates, distributions and validation totals are not
        person-level data merely because they were calculated from patient data.
        They are suitable evidence when their dimensions and cell sizes cannot
        identify anyone.
      </p>

      <h2>Review can change the proposed solution</h2>
      <p>
        Suppose an author changes the prescribing window in a shared asthma
        measure to meet a programme request. A reviewer notices that other
        products use the existing window. The question is now whether the
        organisation-wide definition changed or the programme needs a distinct
        measure.
      </p>
      <p>
        If the requirement is programme-specific, the author can keep the shared
        measure and compose the programme&apos;s alternative from suitable
        evidence. The author updates the same branch, documents the scope and
        adds validation for the new result. The PR retains the reasoning that
        led to this design.
      </p>
      <p>
        This is why review needs the request as well as the diff. Both versions
        might compile and pass their declared tests. The conversation
        establishes which definition should change and who should inherit it.
      </p>

      <h2>Record each decision where the next person will look</h2>
      <p>
        Git records the file changes automatically when you commit. It cannot
        infer why a rule exists, which interpretation was agreed or what you
        checked. Write those parts as you work, before the details are lost.
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
              What the model currently means: grain, population, time and column
              definitions
            </td>
            <td>The model&apos;s YAML description and column documentation</td>
          </tr>
          <tr>
            <td>A rule that should be checked again on future data</td>
            <td>A data or unit test beside the model</td>
          </tr>
          <tr>
            <td>Why an unusual SQL step is necessary</td>
            <td>A short comment beside that step</td>
          </tr>
          <tr>
            <td>What this recorded step changes</td>
            <td>The commit message</td>
          </tr>
          <tr>
            <td>
              Why the change is needed, alternatives considered, affected
              consumers and validation evidence
            </td>
            <td>
              The PR description and review discussion, linked to an issue where
              one exists
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
        If review establishes that the age boundary is inclusive, put that
        meaning in the model documentation and protect it with a test. Keep the
        explanation of why it changed in the PR. An analyst using the model
        should not have to read an old review thread to discover today&apos;s
        definition; someone investigating the change should still be able to
        find the reasoning.
      </p>
      <p>
        You can trace a line through its commit to the linked PR. GitHub&apos;s
        file history shows changes over time; its blame view shows the commit
        that last changed each line. Despite the name, blame is a navigation
        tool, not a judgement about who caused a problem. Formatting can be the
        most recent edit, so follow earlier history when you need the original
        decision.
      </p>
      <p>
        The full{" "}
        <Link href="/courses/git-essentials">Git essentials course</Link>{" "}
        teaches the commands interactively. The{" "}
        <Link href="https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository">
          official Git book
        </Link>{" "}
        explains snapshots and the staging area, while{" "}
        <Link href="https://docs.github.com/en/pull-requests/reference/pull-requests">
          GitHub&apos;s pull-request documentation
        </Link>{" "}
        covers the collaboration model.
      </p>

      <Quiz
        title="From private edit to shared decision"
        questions={[
          {
            prompt:
              "You saved and committed a model locally. Where is that change now?",
            options: [
              "In local Git history; it has not been shared until you push",
              "Already merged into main",
              "Already deployed to production",
              "Only in the editor, with no recorded snapshot",
            ],
            answer: 0,
            explain:
              "Saving changes a file, committing records a local snapshot, and pushing shares commits. Review, merge and deployment are later steps.",
          },
          {
            prompt:
              "Review agrees a new population rule. Where should an analyst find its current meaning later?",
            options: [
              "Only in the review conversation",
              "Only in the commit title",
              "In the model documentation, with the reason for changing it retained in the PR",
              "In an uncommitted personal note",
            ],
            answer: 2,
            explain:
              "The model documentation describes the current definition. The PR preserves how and why the team agreed the change, and tests protect the rules that can be checked.",
          },
          {
            prompt:
              "You edited three files but staged only the SQL and YAML for one model. What does the next commit contain?",
            options: [
              "Every modified file in the working directory",
              "Only the staged SQL and YAML",
              "Only files already tracked by Git",
              "Nothing until all modified files are staged",
            ],
            answer: 1,
            explain:
              "A commit records the staged snapshot. Other edits remain in the working directory and continue to appear in git status.",
          },
          {
            prompt:
              "Why can a passing CI run not establish that a register change is clinically correct?",
            options: [
              "CI does not run SQL",
              "CI can verify stated and mechanised assertions, but clinical intent requires contextual review",
              "Clinical models cannot have automated tests",
              "Only production data can reveal clinical errors",
            ],
            answer: 1,
            explain:
              "Compilation and data tests provide important evidence. They cannot determine whether the team stated the right population or whether a programme rule has appropriate authority.",
          },
          {
            prompt:
              "A required check fails on a PR. What normally happens next?",
            options: [
              "Open a replacement PR",
              "Ask an administrator to bypass the branch protection",
              "Fix the same branch, commit and push so the PR and checks update",
              "Merge the branch and repair main afterwards",
            ],
            answer: 2,
            explain:
              "The PR is an evolving proposal. Pushing a fix to the same branch preserves its discussion and causes the relevant checks to run again.",
          },
          {
            prompt: "What is the best reason to keep a pull request focused?",
            options: [
              "GitHub rejects PRs above a fixed line count",
              "Focused changes shorten feedback and let reviewers reason about one coherent outcome",
              "A branch can contain only one model",
              "Squash merge cannot combine several commits",
            ],
            answer: 1,
            explain:
              "The useful unit is a coherent, reviewable outcome. Small PRs improve feedback and reduce divergence, but should still contain enough of the contract change to evaluate safely.",
          },
        ]}
      />
    </LessonShell>
  );
}
