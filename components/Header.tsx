import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="relative z-40 border-b border-line bg-paper md:sticky md:top-0 md:bg-paper/85 md:backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src="/logos/dbt.svg" alt="" width={26} height={26} priority />
          <span className="hidden whitespace-nowrap font-display text-[17px] font-extrabold tracking-tight min-[480px]:inline">
            dbt onboarding
          </span>
          <span className="hidden rounded-full border border-line bg-paper-warm px-2 py-0.5 font-mono text-[10px] text-ink-faint sm:inline">
            WNL Analytics
          </span>
        </Link>
        <nav className="ml-4 flex items-center gap-3 sm:ml-6 sm:gap-4">
          <Link
            href="/"
            className="font-display text-xs font-bold uppercase tracking-wider text-ink-soft transition hover:text-flame-deep"
          >
            Courses
          </Link>
          <Link
            href="/learn"
            className="font-display text-xs font-bold uppercase tracking-wider text-ink-soft transition hover:text-flame-deep"
          >
            Handbook
          </Link>
          <Link
            href="/reference"
            className="font-display text-xs font-bold uppercase tracking-wider text-ink-soft transition hover:text-flame-deep"
          >
            Reference
          </Link>
        </nav>
        <span
          className="ml-auto hidden rounded-full border border-flame/30 bg-flame-soft px-2.5 py-0.5 font-mono text-[10px] text-flame-deep md:inline"
          title="A community onboarding guide. dbt is a trademark of dbt Labs, Inc."
        >
          not an official dbt Labs product
        </span>
        <a
          href="https://github.com/wnl-icb-analytics/dbt-analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-ink-soft transition hover:border-ink hover:text-ink sm:block"
        >
          dbt-analytics ↗
        </a>
      </div>
    </header>
  );
}
