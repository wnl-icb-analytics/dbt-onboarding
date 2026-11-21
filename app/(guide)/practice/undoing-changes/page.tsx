import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";

export const metadata: Metadata = { title: "Undoing things in git" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="undoing-changes"
      kicker="Field guide · 9"
      title="Undoing things in git"
      lede="Sooner or later git surprises you: a commit lands on the wrong branch, a file you needed is overwritten, a merge stops halfway. This page walks through those moments one at a time — what has actually happened, how to get back, and why the fix is safe."
      minutes={14}
    >
      <h2>Why almost everything is recoverable</h2>
      <p>
        One fact about git explains why most of the fixes on this page are
        safe, so it is worth two minutes before any of them.
      </p>
      <p>
        Every commit is a full snapshot of the project, and git never changes
        a snapshot after it is made. There is no command that edits an old
        commit. When you undo something in git, time is not wound backwards
        and history is not deleted; either a new snapshot is added, or a
        branch is moved.
      </p>
      <p>
        That second idea deserves a moment. A branch feels like a container
        that holds your work, but it is really closer to a bookmark: a small
        label pointing at one commit, which slides forward each time you
        commit. When a fix below “moves main back”, no work is torn up. The
        label slides from one snapshot to another, and every snapshot stays
        exactly where it was, still holding everything it held.
      </p>
      <p>
        The one true exception is work you have not committed yet. Edits
        sitting in your working files exist only on your disk; git holds no
        copy of them. The two commands that overwrite those edits —{" "}
        <code>git restore</code>{" "}and <code>git reset --hard</code> — are the
        only ones on this page that genuinely delete work, and both come with
        the same advice: look at what you are discarding before you discard
        it.
      </p>
      <p>
        Everything else here is reversible. Which is why the first move in
        every situation is the same, and is never urgent: run{" "}
        <code>git status</code>, read what it says, and take a moment before
        typing anything else.
      </p>

      <h2>You&apos;ve been working on main</h2>
      <p>
        You sit down, make your edits, and only notice the problem when{" "}
        <code>git status</code>{" "}opens with:
      </p>
      <CodeBlock
        lang="text"
        code={`
On branch main
Changes not staged for commit:
        modified:   models/staging/shared/stg_opening_hours.sql
`}
      />
      <p>
        Less has gone wrong than it looks. Edits you have not committed do not
        belong to any branch yet — they are simply changes sitting on your
        disk. The branch name starts to matter at the moment you commit, and
        you have not committed. Nothing has been added to main.
      </p>
      <p>So the fix is to create the branch you meant to be on:</p>
      <CodeBlock lang="bash" code={`git switch -c feat/my-change`} />
      <p>
        The branch is created where you stand and you move onto it, edits and
        all — switching branches leaves your working files alone. Run{" "}
        <code>git status</code>{" "}again and the first line shows the new
        branch, with the same files listed beneath it. From here, everything
        continues as if you had branched before you started.
      </p>

      <h2>You committed to main by mistake</h2>
      <p>
        This one announces itself in one of two ways. Either you spot{" "}
        <code>main</code>{" "}in the output of the commit itself, or you try to
        push and GitHub refuses:
      </p>
      <CodeBlock
        lang="text"
        code={`
remote: error: GH006: Protected branch update failed for refs/heads/main.
! [remote rejected] main -> main (protected branch hook declined)
`}
      />
      <p>
        The refusal is good news. Main on GitHub is protected, so your commit
        never left your machine. The shared project is untouched and nobody
        else can see anything. What you actually have is a good snapshot with
        the wrong label on it.
      </p>
      <p>The fix takes three commands, and the order matters:</p>
      <CodeBlock
        lang="bash"
        code={`
git switch -c feat/my-change      # 1. create a branch here, where the commit is
git switch main                   # 2. go back to main
git reset --hard origin/main      # 3. move main back to match GitHub
`}
      />
      <p>
        The first command creates a branch exactly where you stand, which
        means its bookmark now points at your commit — that is what keeps the
        work safe. The second returns you to main. The third slides main&apos;s
        bookmark back to where GitHub says it should be. Your commit is not
        deleted by that move; it has simply changed labels, from main to a
        branch you can push and turn into a normal pull request.
      </p>
      <p>
        If it seems odd that <code>reset --hard</code>{" "}is safe here when this
        page has called it destructive: what it destroys is uncommitted edits,
        and right now you have none — your work is in the commit, and a commit
        cannot be deleted by moving a bookmark off it. This is also why step 1
        must come first. Without a branch pointing at the commit, step 3 would
        leave the snapshot with no label at all — still recoverable, but
        needlessly so.
      </p>
      <p>
        To check the result: <code>git log --oneline -3</code>{" "}on main should
        no longer show your commit, and the same command on the new branch
        should show it at the top.
      </p>

      <h2>You staged a file you didn&apos;t mean to</h2>
      <p>
        <code>git status</code>{" "}shows a file under “Changes to be committed”
        that has no business being there — a scratch query, an unrelated edit,
        something you do not recognise.
      </p>
      <CodeBlock lang="bash" code={`git restore --staged path/to/file`} />
      <p>
        Staging is nothing more than a list of what the next commit will
        include, so this is the mildest problem on the page. The command takes
        the file off that list and does nothing else: your edits to it are
        untouched, and it simply moves back to the “not staged” section of
        status. Commit as you intended, without it.
      </p>
      <Callout kind="warn" title="If you don't recognise the file at all">
        <p>
          Look at it before you move on. If a data extract or a credential has
          appeared in the project folder, taking it out of the commit is not
          the fix — the repository is public, and the file should not be in
          the workspace at all. Move it somewhere outside the project first.
        </p>
      </Callout>

      <h2>You want the old version of a file back</h2>
      <p>
        Sometimes the mistake is the edits themselves: an experiment that
        didn&apos;t work out, and you want the file back as the last commit
        left it.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git diff path/to/file       # first: read what you are about to lose
git restore path/to/file    # then: put the committed version back
`}
      />
      <p>
        <code>git restore</code>{" "}replaces your working copy of the file with
        the last committed version. This is the deliberate use of one of the
        two genuinely destructive commands: those edits were never committed,
        git holds no copy of them, and once overwritten they cannot be brought
        back. The <code>git diff</code>{" "}comes first for exactly that reason —
        it shows everything you are about to lose, while you can still change
        your mind.
      </p>
      <p>
        If part of the work turns out to be worth keeping, commit it before
        tidying. A commit costs nothing and stays on your machine until you
        push — and it moves the work from the one place git cannot recover
        into the place it always can.
      </p>

      <h2>You committed too soon</h2>
      <p>
        The commit went in half-finished: the wrong files, or a change you
        were not done with. If you have not pushed yet, one command unwinds
        it:
      </p>
      <CodeBlock lang="bash" code={`git reset --soft HEAD~1`} />
      <p>
        <code>HEAD~1</code>{" "}is git&apos;s way of saying “one commit before
        where I am now”. The command slides your branch&apos;s bookmark back to
        that earlier commit and stops there. Your files are untouched and
        everything you had staged is still staged — it is exactly as if you
        were back at the moment before you typed <code>git commit</code>,
        ready to finish the work and commit it properly.
      </p>
      <p>
        If you have already pushed, leave the commit alone and fix forward:
        make the correction as a new commit and push that. The branch&apos;s
        history is flattened into a single commit when the PR is squash-merged
        anyway, so an untidy branch history costs nothing — and rewriting
        history that others have already pulled creates the kind of problem
        this page cannot fix.
      </p>

      <h2>You pushed something wrong</h2>
      <p>
        For code that turned out to be wrong, the answer is a revert:
      </p>
      <CodeBlock lang="bash" code={`git revert <commit-sha>`} />
      <p>
        <code>revert</code>{" "}does not remove the bad commit. It adds a new
        commit containing the exact opposite change, which cancels it out.
        That sounds indirect, but it is the point: the pushed history that
        other people have already seen stays intact and truthful, with the
        mistake and its correction both on the record.
      </p>
      <p>
        A pushed credential or a file containing data is a different kind of
        problem, and git is not the tool that fixes it. Deleting the file in a
        new commit removes nothing — the old commit is still there, publicly
        readable, and may already have been cloned or cached elsewhere. Tell
        the team immediately: the credential has to be rotated whichever way
        the history is cleaned up, and cleaning history is a coordinated team
        job. Reporting it quickly is the whole of the right response;
        attempting a quiet fix first only loses time.
      </p>

      <h2>Your PR says the branch has conflicts</h2>
      <p>
        The longer a branch lives, the further main moves underneath it as
        teammates merge their work. Eventually the PR page reports the branch
        is out of date, or cannot be merged. Bringing main&apos;s changes into
        your branch is routine:
      </p>
      <CodeBlock
        lang="bash"
        code={`
git fetch origin            # update your machine's picture of GitHub
git merge origin/main       # bring main's new commits into your branch
`}
      />
      <p>
        Most of the time this completes on its own and you push. But when
        main and your branch have both changed the same lines, git stops
        partway with a message that reads like an error:
      </p>
      <CodeBlock
        lang="text"
        code={`
Auto-merging models/staging/shared/stg_opening_hours.sql
CONFLICT (content): Merge conflict in models/staging/shared/stg_opening_hours.sql
Automatic merge failed; fix conflicts and then commit the result.
`}
      />
      <p>
        It is closer to a question than an error. While you were changing a
        line, someone else&apos;s change to the same line reached main. Git now
        has two versions of that line and no way to know which one the project
        should keep — that depends on what each change was for, which only a
        person knows. So git pauses the merge, keeps both versions, and marks
        the disputed region in the file:
      </p>
      <CodeBlock
        lang="text"
        code={`
select
    organisation_code,
<<<<<<< HEAD
    upper(trim(site_code)) as site_code,
=======
    site_code,
>>>>>>> origin/main
    day_of_week,
`}
      />
      <p>
        The lines between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code>{" "}and{" "}
        <code>=======</code>{" "}are your branch&apos;s version. The lines
        between <code>=======</code>{" "}and{" "}
        <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; origin/main</code>{" "}are what main
        now says. Everything outside the markers merged cleanly and needs
        nothing from you.
      </p>
      <p>
        Your job is to decide what the disputed lines should say, edit them to
        that, and delete the three marker lines. Keeping your version is a
        legitimate answer; so is keeping main&apos;s; so is combining them. The
        way to decide is to ask what each side was trying to do. In the
        example above, main renamed the column while your branch added
        cleaning — neither version alone is right, and the correct resolution
        applies your <code>upper(trim(...))</code>{" "}to the renamed column.
      </p>
      <p>
        VS Code makes the mechanics easy: conflicted files appear under “Merge
        Changes” in the Source Control panel, each disputed region is
        highlighted, and small links above it offer Accept Current Change
        (yours), Accept Incoming Change (main&apos;s) or Accept Both. For
        anything beyond a trivial choice, editing the lines by hand is
        clearer. When you think a file is done, search it for{" "}
        <code>&lt;&lt;&lt;&lt;</code>{" "}to be sure no marker survives, then
        stage and commit — git suggests a “Merge…” message, which is fine —
        and push.
      </p>
      <p>
        Two follow-ups are easy to forget. If the disputed lines were model
        logic, rebuild the model (<code>dbt build -s the_model</code>):
        resolving the text does not prove the SQL still does what you meant.
        And if you find yourself halfway through a conflict you would rather
        not be in, <code>git merge --abort</code>{" "}puts the branch back
        exactly as it was before the merge started — the paused merge has not
        committed anything, so there is nothing to unpick.
      </p>
      <Callout kind="info" title="Conflicts are routine">
        <p>
          A conflict means two people improved the same code — the normal
          condition of a shared project, not a sign either did something
          wrong. Small, short-lived branches keep them rare and quick. If one
          is large, or sits in logic you don&apos;t own, resolve it together
          with the other author rather than guessing.
        </p>
      </Callout>

      <h2>If you&apos;re not sure — stop there</h2>
      <p>
        A few situations sit beyond this page: a reset that went further than
        intended, a branch that seems to have vanished, anything where you can
        no longer tell what state you are in. Even then, the snapshots almost
        certainly still exist. Git keeps a private journal of everywhere each
        branch has pointed (<code>git reflog</code>), and a commit that has
        fallen off every branch can usually be found in it — a rescue best
        done alongside someone who has used it before.
      </p>
      <p>
        Which points at the rule worth ending on. If you are about to run a
        command you found in a search — especially one with{" "}
        <code>--hard</code>{" "}or <code>--force</code>{" "}in it — and you could
        not explain to a colleague what it will do, that is the moment to ask
        them instead. Nothing on your machine is getting worse while you wait,
        and from an accurate picture of the state, most recoveries take
        minutes.
      </p>
    </LessonShell>
  );
}
