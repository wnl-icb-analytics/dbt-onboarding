import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const secret = process.env.CHANGELOG_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ error: "not configured" }, { status: 503 });
  }

  const header = request.headers.get("authorization");
  const provided = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!provided || !secretsMatch(provided, secret)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // webhook callers need the data expired now, not served stale once more
  revalidateTag("changelog", { expire: 0 });
  // every page under /changelog: the index, each month, the handbook tab and RSS
  revalidatePath("/changelog", "layout");
  return Response.json({ revalidated: true, now: Date.now() });
}

function secretsMatch(provided: string, secret: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}
