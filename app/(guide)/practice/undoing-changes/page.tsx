import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";

export const metadata: Metadata = { title: "Undoing things in git" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="undoing-changes"
      kicker="Walkthrough · 9"
      title="Undoing things in git"
      lede="Start with git status. How you undo a change depends on whether it exists only in your files, is staged, has been committed or has reached GitHub. This page takes the common cases one at a time, with what has happened, how to get back and why the fix is safe."
      minutes={14}
    >
      <h2>Why most mistakes in Git can be undone</h2>
      <p>
        A commit keeps a snapshot of your work, and moving a branch leaves that
        snapshot intact. Uncommitted edits are different. Overwrite them and Git
        can&apos;t bring them back. That&apos;s why most of the fixes on this
        page are safe, and the rest come with a warning.
      </p>
      <p>
        Every commit is a full snapshot of the project, and git never changes a
        snapshot once it exists. No command edits an old commit. When you undo
        something in git, you aren&apos;t winding back time or deleting history.
        You&apos;re either adding a new snapshot or moving a branch.
      </p>
      <p>
        That second idea needs a moment. A branch feels like a container that
        holds your work. It&apos;s closer to a bookmark. It&apos;s a small label
        pointing at one commit, and it slides forward each time you commit. When
        a fix below &quot;moves main back&quot;, no work gets torn up. The label
        slides from one snapshot to another, and every snapshot stays
        where it was, still holding everything it held.
      </p>
      <p>
        The one real exception is work you haven&apos;t committed yet. Edits in
        your working files exist only on your disk. Git has no copy of them. Two
        commands on this page overwrite those edits, <code>git restore</code>{" "}
        and <code>git reset --hard</code>. They&apos;re the only ones here that
        truly delete work, and both come with the same advice. Look at what
        you&apos;re throwing away before you throw it away.
      </p>
      <p>
        Everything else here can be reversed. So the first move in every case is
        the same. Run <code>git status</code>, read what it says, and take a
        moment before you type anything else.
      </p>
      <p>
        Most of these situations start with a step skipped in the{" "}
        <Link href="/learn/git-and-prs#the-working-loop">working loop</Link>,
        such as editing before checking the branch, or pushing without pulling
        first. The loop is the quickest way to avoid them next time.
      </p>

      <h2>You&apos;ve been working on main</h2>
      <p>
        If <code>git status</code>{" "}shows you on main and you haven&apos;t
        committed your edits, create a branch now. Your edits come with you.
        The status looks like this.
      </p>
      <CodeBlock
        lang="text"
        code={`
On branch main
Changes not staged for commit:
        modified:   models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.sql
`}
      />
      <p>
        Less has gone wrong than it looks. Edits you haven&apos;t committed
        don&apos;t belong to any branch yet. They&apos;re changes sitting on your
        disk. The branch name only matters once you commit, and you haven&apos;t.
        Nothing has been added to main.
      </p>
      <p>So the fix is to create the branch you meant to be on.</p>
      <CodeBlock lang="bash" code={`git switch -c feat/my-change`} />
      <p>
        Git creates the branch where you stand and moves you onto it, edits and
        all. Switching branches leaves your working files alone. Run{" "}
        <code>git status</code>{" "}again. The first line now shows the new
        branch, with the same files listed under it. From here, carry on as if
        you&apos;d branched before you started.
      </p>

      <h2>You committed to main by mistake</h2>
      <p>
        Move the commit onto a new branch, then put main back to match GitHub.
        You&apos;ll notice the mistake one of two ways. Either you spot{" "}
        <code>main</code>{" "}in the output of the commit itself, or you try to
        push and GitHub refuses.
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
        never left your machine. The shared project is untouched and nobody else
        can see anything. What you have is a good snapshot with the wrong label
        on it.
      </p>
      <p>
        First check for work you haven&apos;t committed. The last step of the
        fix throws that away.
      </p>
      <CodeBlock lang="bash" code={`git status --short`} />
      <p>
        No output means everything is committed. If files are listed, commit
        them too in a moment, once you&apos;re on the new branch. Then run the
        fix. The order matters.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git switch -c feat/my-change      # 1. create a branch here, where the commit is
# if git status listed files, commit them now, on this branch
git switch main                   # 2. go back to main
git fetch origin                  # 3. get GitHub's latest main
git reset --hard origin/main      # 4. move main back to match GitHub
`}
      />
      <p>
        The first command creates a branch where you stand, so its
        bookmark points at your commit. That&apos;s what keeps the work safe. The
        second takes you back to main. The third updates your copy of what
        GitHub holds, so the reset aims at today&apos;s main rather than an old
        one. The fourth slides main&apos;s bookmark back to where GitHub says it
        should be. That move doesn&apos;t delete your commit. The commit has
        changed labels, from main to a branch you can push and turn into a
        normal pull request.
      </p>
      <p>
        It may seem odd that <code>reset --hard</code>{" "}is safe here, when this
        page calls it destructive. What it destroys is uncommitted edits, and
        you&apos;ve just made sure there are none. Your work is in commits, and
        moving a bookmark off a commit can&apos;t delete it. That&apos;s also why
        step 1 has to come first. Without a branch pointing at the commit, step 4 would
        leave the snapshot with no label at all. You could still recover it, but
        there&apos;s no reason to make it that hard.
      </p>
      <p>Check the result with these commands.</p>
      <CodeBlock
        lang="bash"
        code={`
git log --oneline -3                  # on main, your commit is gone
git log --oneline -3 feat/my-change   # your commit is at the top
git switch feat/my-change             # carry on from here
`}
      />

      <h2>You staged a file you didn&apos;t mean to</h2>
      <p>
        Take the file off the staging list with{" "}
        <code>git restore --staged</code>. Your edits to it stay. You&apos;ll
        see the problem when <code>git status</code>{" "}shows a file under
        &quot;Changes to be committed&quot; that has no business being there. It might be a scratch
        query, an unrelated edit, or something you don&apos;t recognise.
      </p>
      <CodeBlock lang="bash" code={`git restore --staged path/to/file`} />
      <p>
        Staging is only a list of what the next commit will include, so this is
        the mildest problem on the page. The command takes the file off that
        list and does nothing else. Your edits to it stay as they are, and it
        moves back to the &quot;not staged&quot; section of{" "}
        <code>git status</code>. Commit as you meant to, without it.
      </p>
      <Callout kind="warn" title="If you don't recognise the file at all">
        <p>
          Look at it before you move on. If a data extract or a credential has
          turned up in the project folder, taking it out of the commit
          isn&apos;t enough. The repository is public, and the file shouldn&apos;t
          be in the project folder at all. Move it somewhere outside the project
          first.
        </p>
      </Callout>

      <h2>You want to throw away your edits to a file</h2>
      <p>
        Read <code>git diff</code>{" "}first to see the edits you&apos;re about to
        lose. Plain <code>git restore</code>{" "}then replaces them with the
        staged version of the file. If you haven&apos;t staged any edits to it,
        that&apos;s the version in the last commit. Use it when an experiment
        didn&apos;t work out.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git diff path/to/file       # first, read what you're about to lose
git restore path/to/file    # then throw those edits away
`}
      />
      <p>
        Edits you&apos;ve staged with <code>git add</code>{" "}stay, because
        plain <code>git restore</code>{" "}only touches your working copy.
      </p>
      <p>
        To go all the way back to the last commit, staged edits included, read
        both diffs and then restore from <code>HEAD</code>.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git diff path/to/file             # unstaged edits
git diff --staged path/to/file    # staged edits
git restore --source=HEAD --staged --worktree -- path/to/file
`}
      />
      <p>
        <code>git restore</code>{" "}is one of the two commands that really
        delete work, used on purpose. Those edits were never committed, git has
        no copy of them, and once they&apos;re overwritten you can&apos;t get
        them back. That&apos;s why <code>git diff</code>{" "}comes first. It shows
        everything you&apos;re about to lose while you can still change your
        mind.
      </p>
      <p>
        If part of the work is worth keeping, commit it before you tidy up. A
        commit costs nothing and stays on your machine until you push. It also
        moves the work out of the one place git can&apos;t recover from and into
        the place it always can.
      </p>

      <h2>You committed too soon</h2>
      <p>
        If you haven&apos;t pushed, <code>git reset --soft HEAD~1</code>{" "}undoes
        the last commit and keeps its changes staged. Use it when the commit
        went in half-finished, with the wrong files or a change you weren&apos;t
        done with.
      </p>
      <CodeBlock lang="bash" code={`git reset --soft HEAD~1`} />
      <p>
        <code>HEAD~1</code>{" "}is git&apos;s way of saying &quot;one commit before
        where I am now&quot;. The command slides your branch&apos;s bookmark back
        to that earlier commit and stops there. Your files don&apos;t change, and
        everything you&apos;d staged is still staged. It&apos;s as if you were
        back at the moment before you typed <code>git commit</code>, ready to
        finish the work and commit it again.
      </p>
      <p>
        If you&apos;ve already pushed, leave the commit alone and fix forward.
        Make the correction as a new commit and push that. The PR is
        squash-merged into a single commit anyway, so an untidy branch history
        costs nothing. Rewriting history that others may have pulled causes the
        kind of problem this page can&apos;t fix.
      </p>

      <h2>You pushed something wrong</h2>
      <p>If the code turned out to be wrong, revert it.</p>
      <CodeBlock lang="bash" code={`git revert <commit-sha>`} />
      <p>
        <code>revert</code>{" "}doesn&apos;t remove the bad commit. It adds a new
        commit with the exact opposite change, which cancels it out. That sounds
        roundabout, but it&apos;s the point. The history other people have
        already seen stays intact and truthful, with the mistake and its fix
        both on the record.
      </p>
      <p>
        Copy the commit ID from <code>git log --oneline</code>{" "}or the PR&apos;s
        commit list. If the bad commit has already merged to <code>main</code>,
        you can&apos;t push the revert there directly. Create a branch from an
        up-to-date <code>main</code>, revert the squash commit on it, and open a
        PR as usual.
      </p>
      <p>
        A pushed credential or a file containing data is a different problem,
        and git can&apos;t fix it. Deleting the file in a new commit removes
        nothing. The old commit is still there, anyone can read it, and someone
        may already have cloned or cached it. Tell the team straight away. The
        credential has to be rotated however the history gets cleaned up, and
        cleaning history is a job the team does together. Reporting it quickly
        is the right response. A quiet fix attempt first only loses time.
      </p>

      <h2>Your push was rejected because GitHub has newer commits</h2>
      <p>
        The branch on GitHub has a commit your local branch doesn&apos;t have.
        Git rejects the push so you can bring that commit into your branch
        first.
      </p>
      <CodeBlock
        lang="text"
        code={`
 ! [rejected]        feat/my-change -> feat/my-change (fetch first)
error: failed to push some refs to 'https://github.com/wnl-icb-analytics/dbt-analytics.git'
`}
      />
      <p>
        Usually someone selected <em>Update branch</em>{" "}on the PR, or you
        pushed from another machine. Because Git refused, nothing on GitHub was
        replaced. Pull the commit in, then push again.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git pull
git push
`}
      />
      <p>
        If you&apos;ve also made new commits, <code>git pull</code>{" "}may stop
        with <em>Need to specify how to reconcile divergent branches</em>. By
        default it only moves your branch forward, and here both sides have
        moved. <code>git pull --no-rebase</code>{" "}merges the two, the same way
        the conflict fix below does. Then push. Don&apos;t reach for{" "}
        <code>--force</code>. It would delete the commit on GitHub.
      </p>

      <h2>Your PR says the branch has conflicts</h2>
      <p>
        A merge conflict means Git can&apos;t combine your branch with main
        without a decision from you. If the PR only says your branch is out of
        date, you can leave it, because the merge queue tests your change
        against the latest main. Conflicts get likelier the longer a branch
        lives, as teammates merge their work into main. If you want
        main&apos;s changes anyway and there&apos;s no conflict, the{" "}
        <em>Update branch</em>{" "}button on the PR does it for you. Choose the
        merge option, then <code>git pull</code>{" "}locally. A conflict needs the
        commands below. Bringing main&apos;s changes into your branch is
        routine. Commit your work first, so{" "}
        <code>git status --short</code>{" "}shows nothing. A merge started over
        uncommitted edits is harder to back out of.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git status --short          # should print nothing
git fetch origin            # update your copy of what's on GitHub
git merge origin/main       # bring main's new commits into your branch
`}
      />
      <p>
        Most of the time this finishes by itself and you just push. But when
        main and your branch have both changed the same lines, git stops partway
        with a message that reads like an error.
      </p>
      <CodeBlock
        lang="text"
        code={`
Auto-merging models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.sql
CONFLICT (content): Merge conflict in models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.sql
Automatic merge failed; fix conflicts and then commit the result.
`}
      />
      <p>
        It&apos;s really a question. While you were changing a line, someone
        else&apos;s change to the same line reached main. Git now has two
        versions of that line and no way to know which one to keep. That depends
        on what each change was for, and only a person knows that. So git pauses
        the merge, keeps both versions, and marks the disputed lines in the
        file.
      </p>
      <CodeBlock
        lang="text"
        code={`
select
<<<<<<< HEAD
    full_date::date as full_date,
=======
    full_date as calendar_date,
>>>>>>> origin/main
    new_start_of_fin_week::date as fin_week_start_date,
`}
      />
      <p>
        The lines between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code>{" "}and{" "}
        <code>=======</code>{" "}are your branch&apos;s version. The lines
        between <code>=======</code>{" "}and{" "}
        <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; origin/main</code>{" "}are what main
        says now. Everything outside the markers merged cleanly and needs
        nothing from you.
      </p>
      <p>
        Your job is to decide what the disputed lines should say, edit them to
        say it, and delete the three marker lines. Keeping your version is a
        fair answer. So is keeping main&apos;s, or combining them. To decide,
        ask what each side was trying to do. In the example above, main renamed
        the column to <code>calendar_date</code>{" "}and your branch added a cast.
        Neither version alone is right. The correct resolution applies your
        cast to the renamed column.
      </p>
      <CodeBlock
        lang="text"
        code={`
select
    full_date::date as calendar_date,
    new_start_of_fin_week::date as fin_week_start_date,
`}
      />
      <p>
        VS Code helps with the mechanics. Conflicted files appear under
        &quot;Merge Changes&quot; in the Source Control panel, and each disputed
        region is highlighted. Small links above it offer Accept Current Change
        (yours), Accept Incoming Change (main&apos;s) or Accept Both. For anything
        beyond a simple choice, editing the lines by hand is clearer.
      </p>
      <p>
        When you think a file is done, search it for{" "}
        <code>&lt;&lt;&lt;&lt;</code>{" "}to make sure no marker is left. Then
        stage it, finish the merge and push.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git add models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.sql
git commit --no-edit        # keeps git's suggested "Merge..." message
git push
`}
      />
      <p>
        Two follow-ups are easy to forget. If the disputed lines were model
        logic, rebuild the model with <code>dbt build -s the_model</code>.
        Resolving the text doesn&apos;t prove the SQL still does what you meant.
        And if you&apos;re halfway through a conflict you&apos;d rather not be
        in, run <code>git merge --abort</code>. If your tree was clean when the
        merge started, that puts the branch back exactly as it was. The paused
        merge hasn&apos;t committed anything, so there&apos;s nothing to unpick.
        With uncommitted edits in the mix, git can&apos;t always rebuild them,
        which is why you committed first.
      </p>
      <Callout kind="info" title="Conflicts are routine">
        <p>
          A conflict means two people changed the same code. That&apos;s normal
          in a shared project, and it doesn&apos;t mean anyone did something
          wrong. Small branches that merge quickly keep conflicts rare and easy.
          If one is large, or sits in logic you don&apos;t own, resolve it with
          the other author instead of guessing.
        </p>
      </Callout>

      <h2>If you&apos;re not sure, stop and ask</h2>
      <p>
        Stop and ask someone when a situation goes beyond this page. A reset
        went further than you meant, a branch seems to have vanished, or you can no longer tell what
        state you&apos;re in. Even then, the snapshots almost certainly still
        exist. Git keeps a private journal of everywhere each branch has
        pointed, called the reflog (<code>git reflog</code>). A commit that has
        fallen off every branch can usually be found there. That rescue is best
        done with someone who has used it before.
      </p>
      <p>
        That leads to one last rule. Say you&apos;re about to run a
        command you found in a search, especially one with <code>--hard</code>{" "}
        or <code>--force</code>{" "}in it. If you couldn&apos;t explain to a
        colleague what it will do, ask them instead. Nothing on your machine
        gets worse while you wait. Once someone can see the real state, most
        recoveries take minutes.
      </p>
    </LessonShell>
  );
}
