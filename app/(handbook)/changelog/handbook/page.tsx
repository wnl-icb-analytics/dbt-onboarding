import type { Metadata } from "next";
import { HandbookChangelogPage } from "@/components/ChangelogPage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = { title: "Handbook changelog" };

export default function Page() {
  return <HandbookChangelogPage />;
}
