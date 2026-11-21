import { redirect } from "next/navigation";
import { PRACTICE } from "@/lib/curriculum";

export default function PracticeIndex() {
  redirect(`/practice/${PRACTICE[0].slug}`);
}
