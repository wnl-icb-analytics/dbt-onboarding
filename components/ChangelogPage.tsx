import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ChangelogFeed } from "@/components/ChangelogFeed";
import {
  changelogMonths,
  getChangelogMonth,
  getHandbookItems,
  hasChangelogToken,
} from "@/lib/changelog";
import { monthLabel } from "@/lib/changelog-parse";

/** Renders the shell at once; each month's data streams in as its fetch resolves. */
export function ChangelogPage({ month }: { month?: string }) {
  if (!hasChangelogToken()) {
    return (
      <ChangelogShell>
        <ChangelogNotice>
          The changelog needs GITHUB_CHANGELOG_TOKEN in the Vercel project environment.
        </ChangelogNotice>
      </ChangelogShell>
    );
  }

  const months = changelogMonths();
  if (month && !months.includes(month)) {
    return (
      <ChangelogShell>
        <ChangelogNotice>
          There is no changelog for {monthLabel(month)}. See the{" "}
          <Link
            href={`/changelog/${months[0]}`}
            className="text-flame-deep underline decoration-flame/40 underline-offset-[3px] hover:decoration-flame"
          >
            latest month
          </Link>
          .
        </ChangelogNotice>
      </ChangelogShell>
    );
  }

  // start every fetch now; cached months resolve immediately
  const monthData = Object.fromEntries(months.map((key) => [key, getChangelogMonth(key)]));

  return (
    <ChangelogShell>
      <Suspense fallback={<ChangelogFeedSkeleton />}>
        <ChangelogFeed
          month={month ?? months[0]}
          months={months}
          explicitMonth={Boolean(month)}
          monthData={monthData}
          handbook={getHandbookItems()}
        />
      </Suspense>
    </ChangelogShell>
  );
}

export function ChangelogPageSkeleton() {
  return (
    <ChangelogShell>
      <ChangelogFeedSkeleton />
    </ChangelogShell>
  );
}

function ChangelogShell({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto min-w-0 max-w-3xl px-4 py-10 sm:px-6 lg:max-w-5xl">
      <header className="rise mb-8 border-b border-line pb-5">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="min-w-0 font-display text-4xl font-extrabold tracking-tight text-ink">
            Changelog
          </h1>
          <p className="shrink-0 font-mono text-xs">
            <Link
              href="/changelog/rss.xml"
              className="text-flame-deep underline decoration-flame/40 underline-offset-[3px] hover:decoration-flame"
            >
              RSS
            </Link>
          </p>
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Warehouse changes from merged dbt-analytics pull requests, grouped by
          day.
        </p>
      </header>
      <div className="rise rise-2">{children}</div>
    </article>
  );
}

function ChangelogNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-paper-warm px-4 py-3 text-sm leading-relaxed text-ink-soft">
      {children}
    </div>
  );
}

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-paper-warm ${className}`} />;
}

function ChangelogFeedSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_11.5rem] lg:gap-8">
      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Pulse className="h-10 flex-1" />
          <Pulse className="h-10 w-full sm:w-44 lg:hidden" />
        </div>
        <Pulse className="mb-6 h-5 w-64 max-w-full" />
        <div className="space-y-8">
          {[0, 1, 2].map((day) => (
            <div
              key={day}
              className="grid gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
            >
              <div className="space-y-1.5">
                <Pulse className="h-3 w-10" />
                <Pulse className="h-4 w-20" />
              </div>
              <div className="space-y-3">
                <Pulse className="h-5 w-full" />
                <Pulse className="h-5 w-5/6" />
                <Pulse className="h-5 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden lg:block">
        <div className="space-y-2">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-5/6" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
