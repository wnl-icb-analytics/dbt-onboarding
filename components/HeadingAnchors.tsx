"use client";

import { useEffect } from "react";

const LINK_ICON =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const CHECK_ICON =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/** Gives every h2/h3 in the lesson a stable id and a hover copy-link button. */
export function HeadingAnchors() {
  useEffect(() => {
    const article = document.querySelector("article.lesson");
    if (!article) return;

    const seen = new Map<string, number>();
    article.querySelectorAll<HTMLHeadingElement>("h2, h3").forEach((h) => {
      if (h.dataset.anchored) return;
      h.dataset.anchored = "true";

      const base = slugify(h.textContent ?? "");
      if (!base) return;
      const count = (seen.get(base) ?? 0) + 1;
      seen.set(base, count);
      if (!h.id) h.id = count === 1 ? base : `${base}-${count}`;

      h.classList.add("group", "scroll-mt-24");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.title = "Copy link to this section";
      btn.setAttribute("aria-label", "Copy link to this section");
      btn.className =
        "ml-2.5 inline-flex h-7 w-7 -translate-y-[2px] items-center justify-center rounded-lg align-middle text-ink-faint transition hover:bg-flame/10 hover:text-flame opacity-40 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100";
      btn.innerHTML = LINK_ICON;
      btn.addEventListener("click", async () => {
        const url = `${window.location.origin}${window.location.pathname}#${h.id}`;
        const ok = await copyText(url);
        history.replaceState(null, "", `#${h.id}`);
        if (ok) {
          btn.innerHTML = CHECK_ICON;
          setTimeout(() => {
            btn.innerHTML = LINK_ICON;
          }, 1500);
        }
      });
      h.appendChild(btn);
    });

    // ids are assigned after load, so the browser's native hash jump misses
    const hash = window.location.hash.slice(1);
    if (hash) {
      document.getElementById(decodeURIComponent(hash))?.scrollIntoView();
    }
  }, []);

  return null;
}
