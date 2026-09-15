import type { Metadata } from "next";
import { ChangelogPage } from "@/components/ChangelogPage";

export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Changelog",
  alternates: {
    types: {
      "application/rss+xml": "/changelog/rss.xml",
    },
  },
};

export default function Page() {
  return <ChangelogPage />;
}
