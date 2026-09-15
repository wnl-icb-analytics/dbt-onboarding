import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Archivo, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import { Header } from "@/components/Header";
import { THEME_SCRIPT } from "@/components/ThemeToggle";

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "dbt onboarding · WNL Analytics",
    template: "%s · dbt onboarding",
  },
  description:
    "Courses, handbook, model docs and changelog for analysts working in the WNL dbt-analytics project. Not an official dbt Labs product.",
};

const FOOTER = [
  {
    heading: "Learn",
    links: [
      ["/", "Courses"],
      ["/learn", "Handbook"],
      ["/practice", "Field guides"],
    ],
  },
  {
    heading: "Look up",
    links: [
      ["/models", "Model docs"],
      ["/changelog", "Changelog"],
      ["/reference", "Command reference"],
    ],
  },
  {
    heading: "Project",
    links: [
      ["https://github.com/wnl-icb-analytics/dbt-analytics", "dbt-analytics"],
      ["https://github.com/wnl-icb-analytics/dbt-onboarding", "This site"],
      ["/changelog/rss.xml", "Changelog RSS"],
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="grain flex min-h-full flex-col">
        <ProgressProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-line bg-paper-warm/40">
            <div className="mx-auto grid max-w-[88rem] gap-8 px-4 py-10 sm:grid-cols-[1.4fr_repeat(3,1fr)] sm:px-6">
              <div>
                <Image
                  src="/logos/logo-wnl-ics.svg"
                  alt="West and North London Integrated Care System"
                  width={145}
                  height={106}
                  className="mb-4 h-14 w-auto dark:hidden"
                />
                <Image
                  src="/logos/logo-wnl-ics-white.svg"
                  alt="West and North London Integrated Care System"
                  width={145}
                  height={106}
                  className="mb-4 hidden h-14 w-auto dark:block"
                />
                <p className="font-display text-sm font-extrabold tracking-tight text-ink">
                  dbt onboarding
                </p>
                <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-ink-faint">
                  Built by the WNL Analytics team for analysts working in dbt-analytics.
                </p>
              </div>
              {FOOTER.map((column) => (
                <div key={column.heading}>
                  <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                    {column.heading}
                  </p>
                  <ul className="mt-2.5 space-y-1.5 text-sm">
                    {column.links.map(([href, label]) => (
                      <li key={href}>
                        {href.startsWith("http") ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ink-soft transition hover:text-flame-deep"
                          >
                            {label} ↗
                          </a>
                        ) : (
                          <Link href={href} className="text-ink-soft transition hover:text-flame-deep">
                            {label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="border-t border-line px-4 py-4 text-center font-mono text-[11px] text-ink-faint">
              dbt™ is a trademark of dbt Labs, Inc. This is a community resource, not an
              official dbt product.
            </p>
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
