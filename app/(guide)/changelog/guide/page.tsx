import type { Metadata } from "next";
import { GuideChangelogPage } from "@/components/ChangelogPage";

export const maxDuration = 60;

export const metadata: Metadata = { title: "Guide changelog" };

export default function Page() {
  return <GuideChangelogPage />;
}
