"use client";

import { useEffect, useRef } from "react";
import { DBT_DOCS_ENTRY } from "@/lib/dbt-docs";

const DOCS_THEME_KEY = "dbt-docs-v2:theme";

// dbt platform upsell cards; irrelevant for a self-hosted project
const FRAME_CSS = `[data-testid^="upgrade"]{display:none!important}`;

function siteTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function syncTheme(frame: HTMLIFrameElement | null) {
  const theme = siteTheme();
  try {
    localStorage.setItem(DOCS_THEME_KEY, theme);
    const root = frame?.contentDocument?.documentElement;
    root?.classList.toggle("dark", theme === "dark");
    root?.classList.toggle("light", theme === "light");
  } catch {}
}

function navigateFrame(frame: HTMLIFrameElement | null, route: string) {
  const win = frame?.contentWindow;
  if (!win || !win.location.href.includes(DBT_DOCS_ENTRY)) return;
  if (win.location.hash !== `#${route}`) win.location.hash = route;
}

/** Types into the docs search box; the app keeps search state out of its URL. */
// The input renders before the index loads and early keystrokes are dropped,
// so retry every 250ms for up to 10s until the search route shows the query.
function runSearch(frame: HTMLIFrameElement | null, query: string) {
  let tries = 0;
  const attempt = () => {
    const win = frame?.contentWindow;
    const input = frame?.contentDocument?.querySelector<HTMLInputElement>(
      'input[placeholder^="Search models"]',
    );
    if (input && win?.location.hash.startsWith("#/search/") && input.value === query) return;
    if (input) {
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setValue?.call(input, query);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    }
    if (++tries < 40) window.setTimeout(attempt, 250);
  };
  attempt();
}

/** Frames the same-origin dbt docs app and keeps its route and theme in step with the site. */
export function DocsFrame({ route, query }: { route: string; query?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (query && loaded.current) runSearch(ref.current, query);
  }, [query]);

  // first load: seed the docs theme before the app reads it
  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    syncTheme(null);
    frame.src = `${DBT_DOCS_ENTRY}#${route}`;
    // route changes after mount are handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    navigateFrame(ref.current, route);
  }, [route]);

  useEffect(() => {
    const onTheme = () => syncTheme(ref.current);
    window.addEventListener("themechange", onTheme);
    return () => window.removeEventListener("themechange", onTheme);
  }, []);

  function onLoad() {
    const frame = ref.current;
    const doc = frame?.contentDocument;
    const win = frame?.contentWindow;
    if (!doc || !win) return;
    loaded.current = true;
    syncTheme(frame);
    if (query) runSearch(frame, query);

    const style = doc.createElement("style");
    style.textContent = FRAME_CSS;
    doc.head.appendChild(style);

    // mirror docs navigation into the address bar so links can be shared
    const mirror = () => {
      const path = win.location.hash.replace(/^#/, "") || "/";
      const next = path === "/" ? "/models" : `/models?path=${encodeURIComponent(path)}`;
      if (`${window.location.pathname}${window.location.search}` !== next) {
        window.history.replaceState(null, "", next);
      }
    };
    win.addEventListener("hashchange", mirror);
  }

  return (
    <iframe
      ref={ref}
      title="dbt model documentation"
      onLoad={onLoad}
      className="block h-full w-full border-0 bg-paper"
    />
  );
}
