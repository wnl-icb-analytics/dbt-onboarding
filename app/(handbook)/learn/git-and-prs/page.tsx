import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { BranchDiagram } from "@/components/BranchDiagram";
import { Quiz } from "@/components/Quiz";
import { LessonQuote } from "@/components/LessonQuote";

export const metadata: Metadata = { title: "Git & pull requests" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="git-and-prs"
      kicker="Learn 10"
      title="Git & pull requests"
      lede="Git gives analytical code a shared history. Pull requests turn a proposed change into a reviewable decision with evidence before it becomes part of production."
      minutes={17}
    >
      <h2>Git records decisions, not copies of files</h2>
      <LessonQuote
        source="Martin Fowler, Version Control Tools"
        href="https://martinfowler.com/bliki/VersionControlTools.html"
      >
        Version tools are not just important for maintaining a history of a
        project, they are also the foundation for a team to collaborate.
      </LessonQuote>
      <p>
        Without version control, analytical work tends to accumulate copies:
        <code> analysis_v2.sql</code>, <code>analysis_final.sql</code> and{" "}
        <code>analysis_final_comments.sql</code>. Each file preserves a state, but
        the relationship between them is implicit. It is difficult to tell which
        change introduced a rule, why it changed or which version other people
        should use.
      </p>
      <p>
        Git keeps one set of project files and records snapshots of them over
        time. Each snapshot—a commit—has an identifier, an author, a time and a
        message. Git can show the exact difference between any two snapshots, so
        the history records both the state of the project and the sequence of
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
        The repository exists in two places. GitHub holds the shared remote
        repository. A clone on a developer&apos;s machine contains the working files
        and the project history. Git does not synchronise them silently: commits
        record work in the clone, <code>push</code>{" "}shares commits with GitHub
        and <code>pull</code>{" "}brings shared commits back.
      </p>

      <h3>History makes analytical definitions explainable</h3>
      <p>
        The current SQL answers “how is this calculated now?” History can answer
        “when did this rule change, what else changed with it and why did the team
        accept it?” That context is particularly valuable when a reasonable
        present-day implementation replaced another reasonable implementation
        because policy, source coverage or clinical guidance changed.
      </p>
      <p>
        A commit message provides the concise label. The associated pull request
        carries the fuller rationale, evidence and discussion. Neither should try
        to preserve patient-level results: the permanent record contains the
        decision and reproducible checks, while governed data remains in the
        warehouse.
      </p>
      <p>
        History becomes less useful when commits mix unrelated work or messages
        say only “updates”. Good Git practice is therefore part of documentation.
        It gives future maintainers a path from the line they are reading to the
        decision that introduced it.
      </p>

      <h2>Branches separate unfinished work from trusted production code</h2>
      <p>
        The project&apos;s default branch is <code>main</code>. It represents the
        reviewed code from which production is deployed, so it needs to remain in
        a deployable state. Direct pushes are protected. Work begins on a branch:
        a separate line of commits starting from a known point on{" "}
        <code>main</code>.
      </p>
      <p>
        A branch is a movable name for a line of history, not a copied project
        folder. Creating one is cheap, and changes made there do not alter
        <code> main</code>. This gives developers room to compile, test, revise
        and even abandon an approach without making unfinished work part of the
        production definition.
      </p>
      <BranchDiagram />
      <p>
        In this diagram, the branch begins after commit C and records D, E and F
        while <code>main</code>{" "}continues to represent the trusted line. The
        histories meet only when the proposed branch is reviewed and merged.
      </p>
      <p>
        Branches work best when they are small and short-lived. One branch should
        deliver one coherent outcome: a new register, a corrected age boundary or
        a documentation improvement. Smaller changes are easier to test and
        review, and they spend less time diverging from other work on{" "}
        <code>main</code>.
      </p>
      <p>
        A merge conflict does not mean two people touched the repository at once.
        Git can combine changes to different files and usually different parts of
        the same file. It stops when two histories change overlapping lines and
        no mechanical choice can preserve both intentions. Short-lived branches
        reduce the opportunity for that overlap; when it occurs, a person decides
        which meaning should remain.
      </p>

      <h2>The staging area lets each commit tell one story</h2>
      <p>
        Git distinguishes the files being edited, the changes selected for the
        next snapshot and the commits already recorded. The middle state is the
        staging area. <code>git add</code>{" "}copies the current content of a file
        into that proposed snapshot; <code>git commit</code>{" "}records exactly
        what has been staged.
      </p>
      <p>
        This extra step is deliberate. A working directory can contain an SQL
        change, an unrelated note and a generated file. Staging allows the SQL
        and its YAML to become one commit while leaving unrelated work outside
        it. If a staged file is edited again, the later edit is not included until
        the file is staged again.
      </p>
      <CodeBlock
        lang="bash"
        title="the daily Git loop"
        code={[
          "git switch main                    # return to the trusted branch",
          "git pull                           # update it from origin/main",
          "git switch -c feat/asthma-measure  # branch from fresh main",
          "",
          "# edit, compile, build and inspect...",
          "git status                         # see working and staged changes",
          "git diff                           # inspect unstaged changes",
          "git add models/reporting/olids/fct_person_asthma_measure.sql",
          "git add models/reporting/olids/fct_person_asthma_measure.yml",
          "git diff --staged                  # inspect the proposed commit",
          "git commit -m \"feat: add asthma prescribing measure\"",
          "git push                           # share the branch on GitHub",
        ].join("\n")}
      />
      <p>
        <code>git status</code>{" "}is the safest orientation command: it reports
        the current branch, modified files, staged files and untracked files
        without changing anything. <code>git diff</code>{" "}shows edits that have
        not been staged. <code>git diff --staged</code>{" "}shows the exact patch
        the next commit will record.
      </p>
      <p>
        That last review is important whether the commands were typed by a person,
        clicked in VS Code or run by an assistant. Tools can perform the mechanics;
        the author remains accountable for the files and information included in
        the snapshot.
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
        The project uses Conventional Commit messages: a recognised type followed
        by a short imperative description. The message can finish the sentence
        “this commit will…”:
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
        Signed commits establish which configured identity produced the snapshot.
        The signing and message hooks are guardrails around provenance and
        readable history; they do not replace reviewing the diff.
      </p>

      <h3>The diff is the reviewable unit</h3>
      <p>
        Reviewers do not assess an abstract final file; they assess the difference
        between the proposed branch and <code>main</code>. A diff makes additions,
        removals and replacements visible together. It can show that a threshold
        changed while its description did not, or that a new join was added
        without a corresponding grain test.
      </p>
      <p>
        Authors should read the diff before asking anyone else to. This catches
        debugging comments, generated artefacts, accidental formatting changes
        and unrelated files while they are cheapest to remove. It also tests
        whether the intended story is visible: can another person see the public
        contract changing alongside its implementation?
      </p>

      <h2>A pull request is a proposal, not a file-transfer step</h2>
      <p>
        Pushing a branch makes its commits visible on GitHub. It does not put them
        on <code>main</code>. A pull request proposes that the branch should become
        part of the trusted history and shows the complete difference from the
        target branch.
      </p>
      <p>
        The PR is where an individual implementation becomes a team decision. The
        diff gives reviewers the evidence, the description explains the intent,
        automated checks report what they can establish and review threads record
        questions and resolutions. That discussion remains attached to the
        change after the branch is gone.
      </p>
      <p>
        A useful description lets a reviewer understand the proposal before
        opening the first file:
      </p>
      <ul>
        <li>
          <strong>Why:</strong>{" "}the user need, defect or domain gap that
          justifies the change.
        </li>
        <li>
          <strong>What:</strong>{" "}the responsibility of each changed model and
          how the pieces fit together.
        </li>
        <li>
          <strong>Checked:</strong>{" "}the builds, tests, comparisons and
          limitations that form the author&apos;s evidence.
        </li>
        <li>
          <strong>Review:</strong>{" "}the design or domain decisions where human
          attention is most valuable.
        </li>
      </ul>
      <p>
        A draft PR is useful before the change is ready to merge. It shares the
        direction, runs fast automation and gives collaborators a place to discuss
        an approach while revision is still cheap. “Draft” describes readiness,
        not quality.
      </p>
      <p>
        Small pull requests improve velocity because they shorten the feedback
        loop. Reviewers can hold the change in their heads, comments arrive while
        the author still remembers the decisions and the branch merges before it
        drifts far from <code>main</code>. Splitting one coherent contract across
        several dependent PRs can make review harder, however. The unit should be
        small enough to reason about and complete enough to evaluate.
      </p>

      <h3>A small diff can still have a large blast radius</h3>
      <p>
        Review effort should follow semantic impact, not line count. Rewording a
        description may be low risk. Changing one operator in a shared register
        can alter thousands of rows and every downstream product. The PR should
        use lineage to identify affected consumers and explain whether the change
        is additive, corrective or contract-breaking.
      </p>
      <p>
        Evidence should be proportional to that impact. A new description may
        need only compilation and review. A grain change needs downstream builds,
        comparison of old and new populations and coordination with consumers. A
        programme-specific published change should demonstrate that shared marts
        remain unaffected.
      </p>
      <p>
        This is why the PR is more than a mechanism for moving code. It is the
        place where scope, risk and evidence are made legible enough for the team
        to decide whether the change is ready.
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
            <td>Compilation, refs, project structure and enforceable conventions</td>
            <td>Whether the analytical concept is the right one</td>
          </tr>
          <tr>
            <td>Snowflake DEV validation</td>
            <td>Building changed models and running tests against development data</td>
            <td>Unstated requirements or edge cases absent from the data</td>
          </tr>
          <tr>
            <td>Automated code review</td>
            <td>Repeatable patterns, likely bugs, fan-out risks and missing metadata</td>
            <td>Programme authority, clinical intent and organisational context</td>
          </tr>
          <tr>
            <td>Human review</td>
            <td>Architecture, domain correctness, scope and maintainability</td>
            <td>Exhaustive mechanical checking on every change</td>
          </tr>
        </tbody>
      </table>
      <p>
        On this project, fast gates run when a PR opens or changes. CodeRabbit
        reviews a ready PR against the repository&apos;s rules and common coding
        risks. Snowflake DEV validation runs when its trigger is met and supplies
        evidence from real development data. Required checks protect{" "}
        <code>main</code>{" "}by preventing merge while their conditions fail.
      </p>
      <p>
        An automated review comment is evidence, not an instruction. It may reveal
        a genuine staging-boundary violation or fan-out risk; it may also lack the
        context that makes a line correct. The author should fix valid findings
        and explain why an inapplicable one is being resolved. Silently accepting
        every suggestion gives the tool more authority than its evidence supports.
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
        suggest a direction or ask a question. “This join can return several
        practices per person, so the model no longer appears to meet its
        person-grain contract. Which effective-date rule should select the
        practice?” gives the author a claim they can verify and a decision they
        can resolve.
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
        correct or propose a third option. A brief reply describing the resolution
        is more useful than silently pushing a change and marking the thread
        complete.
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
        Red CI does not require a new branch or PR. Open the failed check, identify
        the first relevant error, reproduce it where possible, fix the branch,
        commit and push. The existing PR updates and the relevant checks run
        again.
      </p>
      <p>
        Re-running an unexplained failure may be appropriate for a known transient
        infrastructure problem, but it should not be the default response.
        Preserving the same PR retains the diff, discussion and review history
        while the proposal improves.
      </p>

      <h2>Protected main makes continuous delivery trustworthy</h2>
      <p>
        Branch protection is a constraint that enables speed. Because every
        change reaches <code>main</code>{" "}through a PR with the required review
        and checks, deployment automation can treat <code>main</code>{" "}as the
        project&apos;s approved state. Production workflows do not need a separate
        manual process to determine which files are trustworthy.
      </p>
      <p>
        When a PR is approved and green, it is squash-merged: the branch&apos;s work
        becomes one tidy commit on <code>main</code>, the feature branch can be
        deleted and deployment takes over. The PR still preserves the detailed
        discussion and original commits for context.
      </p>
      <p>
        Version control also makes recovery deliberate. If a merged change must be
        undone, a revert records a new commit that reverses the earlier diff
        without erasing history. That is different from silently editing
        production back to an earlier state: the correction receives its own
        review, evidence and explanation.
      </p>
      <p>
        The loop then begins again from fresh shared history:
      </p>
      <CodeBlock
        lang="bash"
        code={[
          "git switch main",
          "git pull",
          "git switch -c feat/the-next-change",
        ].join("\n")}
      />
      <p>
        Pulling before the next branch ensures that it begins with the changes
        colleagues have already merged. Git supports parallel work because the
        team repeatedly rejoins the same trusted line.
      </p>

      <h2>Open definitions require a strict data boundary</h2>
      <p>
        The dbt project is public deliberately. Open analytical definitions can
        be inspected, challenged and adapted by others. Users can trace a result
        through documented SQL and lineage. The repository contains instructions
        for transforming data; the underlying person-level data remains in
        Snowflake under separate access controls.
      </p>
      <p>
        Code, YAML, tests and documentation belong in Git. Patient data, row-level
        query results, credentials and private personal information do not. That
        applies to comments, screenshots, test fixtures, PR descriptions and
        copied error output as well as obvious CSV extracts.
      </p>
      <p>
        <code>.gitignore</code>{" "}keeps predictable untracked files such as
        <code> target/</code>, logs, local environments and credentials out of
        normal Git status. It is not a security scanner. It does not inspect file
        contents and does not stop Git tracking a file that was already added.
      </p>
      <p>
        Seeds are a deliberate exception for small, non-sensitive reference data
        that is reviewed and versioned as part of the project. They are not a
        convenient place for an extract. If sensitive data or a credential is
        committed, deleting the line in a later commit does not undo the
        disclosure; notify the appropriate team immediately so the incident or
        secret rotation can be handled.
      </p>

      <h2>Worked example: changing a shared clinical definition</h2>
      <p>
        Suppose a request proposes changing an asthma measure&apos;s prescribing
        window. Discovery shows that the measure is shared by several programmes,
        so the work is not merely a dashboard edit. The branch should contain the
        shared definition change, its updated documentation and tests, plus any
        intentional downstream adjustments needed to preserve product contracts.
      </p>
      <p>
        The commits might first update and test the shared measure, then adapt a
        published product that deliberately needs the old programme-specific
        window. Each commit records an understandable step; together, the branch
        delivers one reviewable outcome.
      </p>
      <p>
        The PR description explains why the definition is changing, distinguishes
        the organisation-wide rule from the programme exception and records the
        models built and comparisons performed. Lineage identifies affected
        consumers. CI establishes that the project compiles and tested data
        contracts still hold. Human review decides whether the authority and
        clinical interpretation are correct.
      </p>
      <p>
        After merge, future readers can find the decision in one place: the SQL
        that implements it, the YAML that states it, the tests that protect it,
        the commit that records it and the PR discussion that explains why the
        project chose it.
      </p>

      <h2>Tools may type the commands; the change remains yours</h2>
      <p>
        VS Code exposes branches, changed files, staging, commits and synchronising
        as buttons. Coding assistants can run the entire loop. These tools remove
        command recall from the job, which is useful. They do not change the
        underlying states or transfer accountability.
      </p>
      <p>
        Before a commit, inspect the staged diff. Before a push, know which commits
        and files will be shared. Before a merge, read the PR as the permanent
        record it will become. Understanding the Git model is what lets a
        developer use higher-level tools confidently rather than treating their
        actions as magic.
      </p>

      <h2>A change-delivery checklist</h2>
      <ol>
        <li>Update <code>main</code>{" "}and create a focused branch.</li>
        <li>
          Keep SQL, documentation and tests for one contract change together.
        </li>
        <li>
          Use <code>status</code>{" "}and both forms of <code>diff</code>{" "}to
          inspect working and staged changes.
        </li>
        <li>Commit coherent steps with messages that explain their purpose.</li>
        <li>
          Open a draft PR early when feedback on the direction would reduce
          rework.
        </li>
        <li>
          Describe why, what, checks performed and the decisions needing review.
        </li>
        <li>
          Treat CI, automated review and human review as complementary evidence.
        </li>
        <li>
          Keep data, credentials and private information out of every committed
          file and PR artefact.
        </li>
        <li>
          Merge only when required evidence and review agree, then begin the next
          change from fresh <code>main</code>.
        </li>
      </ol>
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
            prompt:
              "What is the best reason to keep a pull request focused?",
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
