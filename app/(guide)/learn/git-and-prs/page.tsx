import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { CloneDiagram } from "@/components/CloneDiagram";
import { BranchDiagram } from "@/components/BranchDiagram";
import { GitPlacesDiagram } from "@/components/GitPlacesDiagram";
import { WorkingLoop } from "@/components/WorkingLoop";
import { LessonQuote } from "@/components/LessonQuote";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Git & pull requests" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="git-and-prs"
      kicker="Learn 03"
      title="Git & pull requests"
      lede="Git is how the team collaborates on one shared codebase. Everyone works on the same project, each change goes in as a pull request colleagues can read and question before it reaches production, and the history records who changed what, and why."
      minutes={14}
    >
      <p>
        Git is version control. It records each change to the project&apos;s
        files, with who made it and why. You make your change on a branch of
        your own, propose it as a pull request, and once it&apos;s reviewed it
        merges into <code>main</code>, the branch production runs from. This
        chapter comes early because each change you make to the project takes
        that route. You don&apos;t need to know any Git yet. If you&apos;d like
        to practise before touching your own machine, the{" "}
        <Link href="/courses/git-essentials">Git essentials course</Link> lets
        you try each step in the browser.
      </p>

      <h2>Git is what lets a team share one codebase</h2>
      <p>
        The team&apos;s dbt project, <code>dbt-analytics</code>, is one shared
        codebase. It holds the SQL behind the registers, measures and datasets
        that colleagues across the ICB use. Several analysts change it in the
        same week, and sometimes in the same file. Git lets them do that
        without getting in each other&apos;s way.
      </p>
      <p>
        Say two analysts change the asthma register on the same day. One fixes
        the lower age boundary. The other adds a newly agreed exclusion code. On
        a shared drive, whoever saves last replaces the other&apos;s file. With
        Git, each analyst works on their own branch. When both changes reach{" "}
        <code>main</code>, Git combines them, because they touched different
        lines. If they&apos;d changed the same line, Git would stop and ask a
        person which version to keep. It never picks one for you.
      </p>
      <LessonQuote
        attribution="Scott Chacon and Ben Straub"
        work="Pro Git"
        href="https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows"
      >
        Git won’t let users overwrite each other.
      </LessonQuote>
      <p>
        Each change is visible before it reaches production. You open a pull
        request, and colleagues read the lines you changed before they merge.
        Say an analyst adds a join to practice registrations so the register
        only counts registered patients. A reviewer notices the join also keeps
        people who have since deregistered. The author fixes it on the same
        branch, and the corrected version is the one that merges.
      </p>
      <p>
        History answers questions that would otherwise rely on someone&apos;s
        memory. A programme lead asks why the diabetes register&apos;s age
        threshold changed last spring. You open the model&apos;s file on
        GitHub, choose <em>Blame</em>, and find the commit that last changed
        that line. Its message ends with the number of the pull request that
        merged it, and the PR holds the reason, the checks the author ran and
        the review discussion. On your own machine, the same trail is two
        commands away.
      </p>
      <CodeBlock
        lang="bash"
        code={[
          "git log --oneline -- models/reporting/olids/disease_registers/qof/fct_person_diabetes_register.sql",
          "git blame models/reporting/olids/disease_registers/qof/fct_person_diabetes_register.sql",
        ].join("\n")}
      />
      <p>
        A bad change can be undone cleanly. A revert adds a new commit that
        reverses the old one, and it goes through review like any other change.
        The original and its reversal both stay in the history.
      </p>
      <p>
        <code>main</code> is the branch production deploys from, and GitHub
        protects it. Nobody can push to it directly, so each change arrives
        through a pull request that has passed its checks. The SQL production
        uses lives there, not in email attachments, personal worksheets or a
        file called <code>asthma_register_v2_final.sql</code>.
      </p>
      <p>
        Git won&apos;t tell you whether a definition is right, and it
        won&apos;t stop two people disagreeing about one. It makes the
        disagreement visible, gives the team a place to settle it, and keeps
        the outcome. The cost is a handful of new commands and a slower first
        few changes.
      </p>

      <h2>A repository is the project plus its history</h2>
      <p>
        A project folder that Git manages is a <strong>repository</strong>, or
        repo. Git records snapshots of its tracked files over time, so each
        file comes with a record of how it got that way. GitHub is the
        service where the team shares repositories, discusses changes and runs
        automated checks. The shared copy of the project, the remote, lives
        there. Your clone is the copy on your machine, with the working files
        and the full history. Git never syncs the two behind your back.
      </p>
      <CloneDiagram />

      <h2>Your work moves through four places</h2>
      <p>
        Most confusion with Git comes from not knowing where your work is. It
        can be in four places, and each everyday command moves it one step.
      </p>
      <GitPlacesDiagram />
      <p>
        Saving a file changes the <strong>working folder</strong>, the files
        you see in VS Code, and nothing else. <code>git add</code> copies a
        file&apos;s current content into the <strong>staging area</strong>,
        the changes you&apos;ve picked for the next commit. A new file stays
        untracked until you add it. <code>git commit</code> turns what&apos;s
        staged into a commit in your <strong>local history</strong>, where
        nobody else can see it. <code>git push</code> sends your branch&apos;s
        new commits to <strong>GitHub</strong>, which Git calls{" "}
        <code>origin</code>. Going the other way, <code>git fetch</code>{" "}
        downloads commits other people have pushed, and <code>git pull</code>{" "}
        also merges them into the branch you&apos;re on.
      </p>
      <p>
        Run <code>git status</code> whenever you&apos;re unsure. It names the
        branch you&apos;re on and sorts changed files by where they are. It
        lists names, not content. <code>git diff</code> shows the edits you
        haven&apos;t staged, and <code>git diff --staged</code> shows what the
        next commit will record. Once you stage a file, plain{" "}
        <code>git diff</code> shows nothing for it.{" "}
        <Link href="/advanced/git-in-depth">Git in more depth</Link> explains
        what a commit and a branch are underneath, and why{" "}
        <code>git status</code> can say you&apos;re up to date when you
        aren&apos;t.
      </p>

      <h2>Branches keep unfinished work off main</h2>
      <p>
        GitHub enforces three rules on <code>main</code>. You can&apos;t push
        to it directly, you can&apos;t force-push to rewrite its history, and
        each commit must be signed, so GitHub can check it came from you. Your
        work starts on a branch instead, a separate line of commits that begins
        at a point on <code>main</code>. Nothing you do on a branch changes{" "}
        <code>main</code>, so you can compile, test, rethink or throw an
        approach away.
      </p>
      <p>
        Switching branches changes the files you see in the same project
        folder, and uncommitted edits follow you when you switch. The{" "}
        <a href="#the-working-loop">working loop</a> below has the commands.
      </p>
      <BranchDiagram />
      <p>
        In the diagram, the branch starts after commit C and records D, E and F,
        while <code>main</code> carries on without them. Once the change is
        reviewed, we squash-merge it, so G is one new commit on{" "}
        <code>main</code> that combines D, E and F.
      </p>
      <p>
        A branch separates code, nothing more. It doesn&apos;t give you a
        private copy of the data. The models you build later in the guide go
        into development databases the team shares.
      </p>
      <p>
        Git combines changes to different files, and usually to different parts
        of the same file. A merge conflict happens only when two branches change
        the same lines, and a person has to decide which meaning stays. The{" "}
        <Link href="/practice/undoing-changes">undoing changes</Link>{" "}
        walkthrough shows how to resolve one. Short-lived branches make
        conflicts rarer.
      </p>

      <h2>The staging area lets each commit tell one story</h2>
      <p>
        Your working folder might hold a SQL change, a note to yourself and a
        generated file. Staging lets the SQL and its YAML become one commit and
        leaves the rest out.
      </p>
      <CodeBlock
        lang="bash"
        code={[
          "git status",
          "git add models/reporting/olids/disease_registers/qof/fct_person_asthma_register.sql",
          "git add models/reporting/olids/disease_registers/qof/fct_person_asthma_register.yml",
          "git diff --staged",
          'git commit -m "fix: include the lower age boundary in the asthma register"',
        ].join("\n")}
      />
      <p>
        If you edit the SQL again after staging it, the new edit isn&apos;t in
        the commit until you run <code>git add</code> again, so read the staged
        diff before you commit. In VS Code&apos;s source-control panel, the plus
        icon is <code>git add</code> and the tick is <code>git commit</code>.
        Git&apos;s staging area has nothing to do with the staging layer of dbt
        models you&apos;ll meet later.
      </p>
      <p>
        A good commit has one purpose and leaves the project working. Messages
        follow Conventional Commits, a type and then a short description in the
        imperative, like{" "}
        <code>fix: preserve unknown ethnicity in person demographics</code>.
        The PR title matters most, because the squash merge turns it into the
        commit message on <code>main</code>, and a CI check flags a title that
        doesn&apos;t follow the format. The types are <code>feat</code>,{" "}
        <code>fix</code>, <code>docs</code>, <code>refactor</code>,{" "}
        <code>test</code>, <code>chore</code>, <code>perf</code> and{" "}
        <code>ci</code>. You can add the area of the project in brackets, like{" "}
        <code>fix(olids):</code>.
      </p>

      <h2>A pull request is a proposal, not a file transfer</h2>
      <p>
        Pushing a branch makes its commits visible on GitHub. It doesn&apos;t
        put them on <code>main</code>. Your first push creates the branch on
        GitHub and links it to your local branch.
      </p>
      <CodeBlock lang="bash" code="git push -u origin fix/age-band-boundary" />
      <p>
        After that, plain <code>git push</code> is enough. A pull request
        proposes merging the branch into <code>main</code> and shows its full
        difference from <code>main</code>. The description, the check results
        and the review threads stay attached to the change after the branch is
        deleted. The <Link href="/practice/open-a-pr">open a pull request</Link>{" "}
        walkthrough has the clicks.
      </p>
      <p>
        The project&apos;s PR template has three headings. Under Why, give the
        need behind the change and what each changed model is now responsible
        for, and point to the decision that needs a reviewer&apos;s closest
        attention. Under Checks, list the builds, tests and comparisons you ran
        and what they couldn&apos;t show, using aggregates or synthetic data
        only. An optional Changelog sentence replaces the title in the
        onboarding changelog.
      </p>

      <h2 id="the-working-loop">The working loop takes each change from main back to main</h2>
      <p>
        The team uses one loop for each change, from a reworded description to
        a new register. It has five stages, and the walkthroughs later in the
        guide assume it.
      </p>
      <WorkingLoop />

      <h3>Start each task from a fresh main</h3>
      <p>
        Switch to <code>main</code>, pull, and create a branch named for the
        task. The name starts with the same type as a commit message, then a
        slash and a few words, like <code>fix/age-band-boundary</code>. Pulling
        first means the branch starts from what colleagues have merged. If
        you&apos;ve already started editing on <code>main</code>, don&apos;t
        pull over the edits. Create the branch straight away, and the edits come
        with you.
      </p>

      <h3>While you work, commit each step and push daily</h3>
      <p>
        Stage the files that belong together, read them with{" "}
        <code>git diff --staged</code>, and commit. Push at
        least once a day, even when the work isn&apos;t finished. Until you
        push, your commits exist only on your laptop. Once they&apos;re on
        GitHub, they survive a lost laptop and colleagues can see where the work
        is heading.
      </p>

      <h3>Open the PR as a draft, then mark it ready</h3>
      <p>
        Open a draft PR soon after the first push. A draft can&apos;t be
        merged. It shares your direction, starts the fast checks and CodeRabbit,
        the automated reviewer, and gives colleagues somewhere to discuss the
        approach while changing it is cheap. When it&apos;s done and checked,
        select <em>Ready for review</em> and ask a colleague to review it.
      </p>

      <h3>During review, add commits and push again</h3>
      <p>
        A PR follows its branch. If review asks for a correction, edit the same
        branch, commit and push. The PR updates and the checks run again. Reply
        in the thread to say what changed, or why you&apos;re keeping the
        current approach. Don&apos;t force-push a branch under review. It
        replaces the branch on GitHub with your copy, so reviewers lose their
        place and any commit added on GitHub since your last pull is gone. The
        squash merge tidies the history anyway.
      </p>
      <p>
        You don&apos;t need to keep your branch up to date with{" "}
        <code>main</code>. The merge queue tests your change against the latest{" "}
        <code>main</code> before it merges. If you do need a colleague&apos;s
        newer change, select <em>Update branch</em> on the PR page, then run{" "}
        <code>git pull</code> on your branch before you edit again. If GitHub
        reports a conflict, the{" "}
        <Link href="/practice/undoing-changes#your-pr-says-the-branch-has-conflicts">
          undoing changes walkthrough
        </Link>{" "}
        shows how to resolve it, and the first time it&apos;s worth asking a
        colleague to sit with you.
      </p>

      <h3>After merge, return to main and delete the branch</h3>
      <p>
        Once a reviewer approves, select <strong>Merge when ready</strong>.
        GitHub&apos;s merge queue builds and tests the change, then
        squash-merges it into one commit on <code>main</code>. On your machine,
        switch to <code>main</code>, pull, and delete your local branch with{" "}
        <code>git branch -d</code>. After a squash merge it sometimes refuses
        with &quot;not fully merged&quot;, because <code>main</code> holds one
        new commit instead of your branch&apos;s commits. The{" "}
        <Link href="/practice/review-and-merge">review and merge</Link>{" "}
        walkthrough shows how to check before you force the delete.
      </p>

      <h3>Four habits prevent most trouble</h3>
      <ul>
        <li>
          Use one branch per task. If you spot an unrelated problem halfway
          through, note it and fix it on its own branch later.
        </li>
        <li>
          Check which branch you&apos;re on before you edit. It&apos;s the first
          line of <code>git status</code> and the name in VS Code&apos;s status
          bar.
        </li>
        <li>
          Never commit on <code>main</code>. GitHub rejects the push, and the{" "}
          <Link href="/practice/undoing-changes">undoing changes</Link>{" "}
          walkthrough shows how to move the commit onto a branch.
        </li>
        <li>
          Keep each PR small and focused on one outcome, so a reviewer can
          reason about one change at a time.
        </li>
      </ul>

      <h2>Keep data out of the public repository</h2>
      <p>
        The dbt project is public on purpose. Anyone can inspect, challenge or
        adapt its analytical definitions, and users can trace a result through
        documented SQL and lineage. The repository holds instructions for
        transforming data. The person-level data stays in Snowflake, behind its
        own access controls.
      </p>
      <p>
        Code, YAML, tests and documentation belong in Git. Patient data,
        row-level query results, credentials and private personal details
        don&apos;t. That covers comments, screenshots, test fixtures, PR
        descriptions and pasted error output, as well as the obvious CSV
        extract.
      </p>
      <p>
        <code>.gitignore</code> keeps predictable files out of{" "}
        <code>git status</code>. In this project that includes{" "}
        <code>target/</code>, <code>logs/</code>, <code>.env</code> files, and
        any <code>.csv</code> outside <code>seeds/</code>. It isn&apos;t a
        security scanner, though. It never reads file contents, and it
        can&apos;t stop Git tracking a file that was already added.
      </p>
      <p>
        Seeds are the deliberate exception. They hold small, non-sensitive
        reference data that the team reviews and versions with the code. They
        aren&apos;t somewhere to park an extract. If sensitive data or a
        credential does get committed, deleting it in a later commit
        doesn&apos;t undo the disclosure, because the old commit is in the
        history for good. Report it straight away so the incident can be
        handled and any secret rotated.
      </p>
      <p>
        High-level counts, rates, distributions and validation totals
        aren&apos;t person-level data just because they came from patient data.
        They&apos;re fine as PR evidence when their breakdowns and cell sizes
        can&apos;t identify anyone.
      </p>

      <h2>Reviewers judge meaning, and automated checks test structure</h2>
      <p>
        A reviewer reads the change for what it means. Does the model hold the
        intended clinical population? Does each row mean what the documentation
        says? Could the change reuse a model that already exists? A useful
        comment names what the reviewer noticed, says why it matters, and asks
        a question or suggests a direction. Review is there to get the change
        right and spread understanding, not to make it look like the
        reviewer&apos;s own code.
      </p>
      <p>
        Automated checks cover what a machine can test. Each push runs fast
        checks on compilation, references, descriptions, declared test
        coverage, ownership and the PR title. CodeRabbit comments against the
        project&apos;s written conventions. Weigh its comments as evidence, but
        resolve any data-safety finding before merge. After approval, the merge
        queue builds the changed models and runs their tests in Snowflake
        development. A green tick says those checks passed, not that the
        population is the one the programme asked for.
      </p>
      <p>
        <Link href="/learn/merge-to-production">From merge to production</Link>{" "}
        follows the change through the merge queue and deployment.{" "}
        <Link href="/advanced/git-in-depth">Git in more depth</Link> covers
        sizing a change, failed checks, how review can change the solution, and
        where to record each decision. The{" "}
        <Link href="/courses/git-essentials">Git essentials course</Link> lets
        you practise the commands. Next,{" "}
        <Link href="/learn/the-data">The data we model</Link> introduces the
        sources the project transforms.
      </p>

      <Quiz
        title="From private edit to shared change"
        questions={[
          {
            prompt:
              "You saved and committed a model locally. Where is that change now?",
            options: [
              "In your local Git history, not shared until you push",
              "Already merged into main",
              "Already deployed to production",
              "Only in the editor, with no recorded snapshot",
            ],
            answer: 0,
            explain:
              "Saving changes a file, committing records a local snapshot, and pushing shares commits. Review, merge and deployment come later.",
          },
          {
            prompt:
              "You edited three files but staged only the SQL and YAML for one model. What does the next commit contain?",
            options: [
              "Every modified file in the working folder",
              "Only the staged SQL and YAML",
              "Only files already tracked by Git",
              "Nothing until all modified files are staged",
            ],
            answer: 1,
            explain:
              "A commit records what's staged. The other edits stay in your working folder and keep showing up in git status.",
          },
          {
            prompt:
              "A reviewer asks for a correction to your open PR. What do you do?",
            options: [
              "Open a new PR from a fresh branch",
              "Commit the fix on the same branch and push",
              "Rewrite the branch and force-push so the history looks clean",
              "Merge first and fix it on main afterwards",
            ],
            answer: 1,
            explain:
              "The PR follows its branch, so new commits update it and keep the review history. The squash merge tidies the history, so force-pushing gains nothing and loses reviewers' place.",
          },
          {
            prompt:
              "You want to show a reviewer that your register change worked. What can go in the PR?",
            options: [
              "A screenshot of the new rows for a few patients",
              "The row-level output of a failing test",
              "Before and after counts, with breakdowns that can't identify anyone",
              "A CSV extract committed outside seeds/",
            ],
            answer: 2,
            explain:
              "The repository is public. Aggregates and validation totals are fine when they can't identify anyone. Person-level rows, in any form, stay in Snowflake.",
          },
        ]}
      />
    </LessonShell>
  );
}
