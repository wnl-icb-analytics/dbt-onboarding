import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChangelogPage, ChangelogPageSkeleton } from "@/components/ChangelogPage";
import { monthLabel } from "@/lib/changelog-parse";

export const maxDuration = 60;

type Params = { month: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { month } = await params;
  return {
    title: `Changelog · ${monthLabel(month)}`,
    alternates: {
      types: {
        "application/rss+xml": "/changelog/rss.xml",
      },
    },
  };
}

// the month is only known at request time, so it is read inside Suspense
export default function Page({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<ChangelogPageSkeleton />}>
      <MonthChangelog params={params} />
    </Suspense>
  );
}

async function MonthChangelog({ params }: { params: Promise<Params> }) {
  const { month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month)) notFound();
  return <ChangelogPage month={month} />;
}
