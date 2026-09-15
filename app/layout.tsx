import type { Metadata } from "next";
import { Archivo, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import { Header } from "@/components/Header";

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
    default: "WNL handbook",
    template: "%s · WNL handbook",
  },
  description:
    "Handbook for analysts on the WNL dbt-analytics warehouse: models, working practice, courses and the changelog.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="grain min-h-full">
        <ProgressProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
          >
            Skip to content
          </a>
          <Header />
          {children}
          <footer className="border-t border-line px-4 py-6 text-center font-mono text-[11px] text-ink-faint">
            Maintained by WNL Analytics. dbt is a trademark of dbt Labs, Inc.
            This is not dbt Labs documentation.
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
