import {
  type ChangelogItem,
  authorName,
  capitaliseSummary,
  dayKey,
  dayLabel,
  entryTypeLabel,
} from "@/lib/changelog-parse";

export type ChangelogSummary = { text: string; html: string; count: number };

/** Groups the given entries by day, newest first, as plain text and HTML for pasting. */
export function summariseChangelog(items: ChangelogItem[], heading: string): ChangelogSummary {
  const days = new Map<string, ChangelogItem[]>();
  for (const item of items) {
    const key = dayKey(item.mergedAt);
    days.set(key, [...(days.get(key) ?? []), item]);
  }
  const groups = [...days.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  const count = items.length;
  const title = `${heading} (${count} ${count === 1 ? "change" : "changes"})`;

  const text = [
    title,
    ...groups.flatMap(([key, dayItems]) => [
      "",
      dayLabel(key),
      ...dayItems.map((item) => `- ${lineText(item)}`),
    ]),
  ].join("\n");

  const html = [
    `<p><strong>${escapeHtml(title)}</strong></p>`,
    ...groups.map(
      ([key, dayItems]) =>
        `<p><strong>${escapeHtml(dayLabel(key))}</strong></p><ul>${dayItems
          .map((item) => `<li>${lineHtml(item)}</li>`)
          .join("")}</ul>`,
    ),
  ].join("");

  return { text, html, count };
}

/** Writes rich HTML where the browser allows it, with plain text as the fallback. */
export async function copySummary(summary: ChangelogSummary): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([summary.text], { type: "text/plain" }),
          "text/html": new Blob([summary.html], { type: "text/html" }),
        }),
      ]);
      return true;
    }
    await navigator.clipboard.writeText(summary.text);
    return true;
  } catch {
    return false;
  }
}

function details(item: ChangelogItem): string[] {
  return [authorName(item), item.domainLabels[0]].filter((part): part is string => Boolean(part));
}

function lineText(item: ChangelogItem): string {
  const ref = item.number ? ` (#${item.number})` : "";
  const extra = details(item).map((part) => ` · ${part}`).join("");
  return `${entryTypeLabel(item)}: ${capitaliseSummary(item.summary)}${ref}${extra}\n  ${item.url}`;
}

function lineHtml(item: ChangelogItem): string {
  const summary = escapeHtml(capitaliseSummary(item.summary));
  const url = escapeHtml(item.url);
  const ref = item.number ? ` (<a href="${url}">#${item.number}</a>)` : ` (<a href="${url}">commit</a>)`;
  const extra = details(item).map((part) => ` · ${escapeHtml(part)}`).join("");
  return `<strong>${escapeHtml(entryTypeLabel(item))}</strong>: ${summary}${ref}${extra}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
