import { type ChangelogItem, TYPE_LABELS, capitaliseSummary } from "@/lib/changelog-parse";

// Section order in a copied summary; internal types only appear when shown.
const SECTIONS: { title: string; match: (item: ChangelogItem) => boolean }[] = [
  { title: "Breaking changes", match: (item) => item.breaking },
  { title: TYPE_LABELS.feat, match: (item) => !item.breaking && item.type === "feat" },
  { title: TYPE_LABELS.fix, match: (item) => !item.breaking && item.type === "fix" },
  { title: TYPE_LABELS.perf, match: (item) => !item.breaking && item.type === "perf" },
  { title: TYPE_LABELS.other, match: (item) => !item.breaking && item.type === "other" },
  {
    title: "Internal",
    match: (item) => !item.breaking && item.hidden && item.source === "warehouse",
  },
  { title: "Handbook", match: (item) => item.source === "handbook" },
];

export type ChangelogSummary = { text: string; html: string; count: number };

/** Groups the given entries by type into a plain-text and an HTML list for pasting. */
export function summariseChangelog(items: ChangelogItem[], heading: string): ChangelogSummary {
  const groups = SECTIONS.map((section) => ({
    title: section.title,
    items: items.filter(section.match),
  })).filter((group) => group.items.length > 0);
  const count = groups.reduce((total, group) => total + group.items.length, 0);

  const text = [
    `${heading} (${count} ${count === 1 ? "change" : "changes"})`,
    ...groups.flatMap((group) => [
      "",
      group.title,
      ...group.items.map((item) => `- ${lineText(item)}`),
    ]),
  ].join("\n");

  const html = [
    `<p><strong>${escapeHtml(heading)}</strong> (${count} ${count === 1 ? "change" : "changes"})</p>`,
    ...groups.map(
      (group) =>
        `<p><strong>${escapeHtml(group.title)}</strong></p><ul>${group.items
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

function lineText(item: ChangelogItem): string {
  const ref = item.number ? ` (#${item.number})` : "";
  const domain = item.domainLabels[0] ? ` · ${item.domainLabels[0]}` : "";
  return `${capitaliseSummary(item.summary)}${ref}${domain}\n  ${item.url}`;
}

function lineHtml(item: ChangelogItem): string {
  const summary = escapeHtml(capitaliseSummary(item.summary));
  const ref = item.number
    ? ` (<a href="${escapeHtml(item.url)}">#${item.number}</a>)`
    : ` (<a href="${escapeHtml(item.url)}">commit</a>)`;
  const domain = item.domainLabels[0] ? ` · ${escapeHtml(item.domainLabels[0])}` : "";
  return `${summary}${ref}${domain}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
