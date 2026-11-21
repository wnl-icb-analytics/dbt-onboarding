import { redirect } from "next/navigation";
import { ADVANCED } from "@/lib/curriculum";

export default function AdvancedIndex() {
  redirect(`/advanced/${ADVANCED[0].slug}`);
}
