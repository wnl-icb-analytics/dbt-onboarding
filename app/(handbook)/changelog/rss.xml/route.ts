import { getChangelog } from "@/lib/changelog";

export const maxDuration = 60;

const SITE = "https://dbt-onboarding.vercel.app";
const LIMIT = 50;

export async function GET() {
  const data = await getChangelog();
  const items = data.items
    .filter((item) => item.source === "warehouse" && !item.hidden)
    .slice(0, LIMIT);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>dbt-analytics changelog</title>
    <link>${SITE}/changelog</link>
    <description>Merged dbt-analytics pull requests, as shown on the onboarding changelog.</description>
    ${items
      .map((item) => {
        const title = escapeXml(item.summary);
        return `<item>
      <title>${title}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <pubDate>${new Date(item.mergedAt).toUTCString()}</pubDate>
      <category>${escapeXml(item.typeLabel)}</category>
    </item>`;
      })
      .join("\n    ")}
  </channel>
</rss>
`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
