import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ChangelogFeed } from "@/components/ChangelogFeed";
import {
  getChangelog,
  latestMonth,
  monthsFrom,
} from "@/lib/changelog";
import { monthLabel } from "@/lib/changelog-parse";

export async function ChangelogPage({ month }: { month?: string }) {
  const data = await getChangelog();
  if (data.error) {
    return (
      <ChangelogShell>
        <p>
          {data.error === "missing_token"
            ? "The changelog needs GITHUB_CHANGELOG_TOKEN in the Vercel project environment."
            : "GitHub did not return the pull request history. Try again shortly."}
        </p>
      </ChangelogShell>
    );
  }

  const months = monthsFrom(data.items);
  const selected = month ?? latestMonth(data.items);
  if (month && months.length && !months.includes(month)) {
    return (
      <ChangelogShell>
        <p>
          There is no changelog for {monthLabel(month)}. See the{" "}
          <Link href={`/changelog/${latestMonth(data.items)}`}>latest month</Link>.
        </p>
      </ChangelogShell>
    );
  }

  return (
    <ChangelogShell>
      <Suspense fallback={<p>Loading the changelog…</p>}>
        <ChangelogFeed
          month={selected}
          months={months.length ? months : [selected]}
          items={data.items.filter((item) => item.source === "warehouse")}
          handbook={data.items.filter((item) => item.source === "handbook")}
        />
      </Suspense>
    </ChangelogShell>
  );
}

function ChangelogShell({ children }: { children: ReactNode }) {
  return (
    <article className="lesson mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="rise mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-4">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
          Changelog
        </h1>
        <p className="!m-0 font-mono text-xs">
          <Link href="/changelog/rss.xml">RSS</Link>
        </p>
      </header>
      <div className="rise rise-2">{children}</div>
    </article>
  );
}
