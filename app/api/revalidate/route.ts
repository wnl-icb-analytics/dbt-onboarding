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

  revalidateTag("changelog", { expire: 0 });
  revalidatePath("/changelog");
  revalidatePath("/changelog/rss.xml");
  return Response.json({ revalidated: true, now: Date.now() });
}

function secretsMatch(provided: string, secret: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}
