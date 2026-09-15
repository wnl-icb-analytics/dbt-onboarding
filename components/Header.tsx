import Image from "next/image";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import { SearchDialog } from "@/components/SearchDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="relative z-40 border-b border-line bg-paper md:sticky md:top-0 md:bg-paper/85 md:backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[88rem] items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src="/logos/dbt.svg" alt="" width={24} height={24} priority />
          <span className="hidden whitespace-nowrap font-display text-[16px] font-extrabold tracking-tight min-[420px]:inline">
            dbt onboarding
          </span>
          <span className="hidden rounded-full border border-line bg-paper-warm px-2 py-0.5 font-mono text-[10px] text-ink-faint xl:inline">
            WNL Analytics
          </span>
        </Link>
        <NavLinks className="ml-3 hidden md:flex" />
        <div className="ml-auto flex items-center gap-1.5">
          <SearchDialog />
          <ThemeToggle />
          <a
            href="https://github.com/wnl-icb-analytics/dbt-analytics"
            target="_blank"
            rel="noopener noreferrer"
            title="dbt-analytics on GitHub"
            aria-label="dbt-analytics on GitHub"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-paper-warm hover:text-ink"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
            </svg>
          </a>
        </div>
      </div>
      <div className="overflow-x-auto border-t border-line px-1 py-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        <NavLinks className="justify-between" />
      </div>
    </header>
  );
}
