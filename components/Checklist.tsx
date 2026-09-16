"use client";

import type { ReactNode } from "react";
import { useProgress } from "@/lib/progress";

export function Checklist({
  id,
  items,
}: {
  /** unique prefix, e.g. "setup" */
  id: string;
  items: { label: ReactNode; key: string }[];
}) {
  const { isChecked, toggleCheck, ready } = useProgress();

  return (
    <ul className="!my-5 flex max-w-[72ch] !list-none flex-col gap-1.5 !pl-0">
      {items.map((item) => {
        const key = `${id}/${item.key}`;
        const checked = ready && isChecked(key);
        return (
          <li key={item.key} className="!my-0 !pl-0">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                checked
                  ? "border-layer-staging/40 bg-layer-staging/5"
                  : "border-line bg-paper hover:border-ink-faint"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCheck(key)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 text-xs font-bold text-white transition ${
                  checked ? "border-layer-staging bg-layer-staging" : "border-ink-faint"
                }`}
              >
                {checked ? "✓" : ""}
              </span>
              <span
                className={`text-[15px] leading-relaxed transition ${
                  checked ? "text-ink-faint line-through decoration-ink-faint/50" : "text-ink-soft"
                } [&_code]:break-words [&_code]:whitespace-normal sm:[&_code]:whitespace-nowrap [&_code]:rounded [&_code]:border [&_code]:border-line [&_code]:bg-paper-warm [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-ink`}
              >
                {item.label}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
