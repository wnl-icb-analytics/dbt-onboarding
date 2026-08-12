"use client";

import { useState } from "react";
import { LAYERS } from "@/lib/layers";

/** Interactive strata diagram — click a layer to inspect it. */
export function LayerCake() {
  const [active, setActive] = useState("modelling");
  const layer = LAYERS.find((l) => l.id === active)!;
  // render top-down: published at the top, raw at the bottom
  const stack = [...LAYERS].reverse();

  return (
    <div className="my-8 grid gap-4 md:grid-cols-[300px_1fr]">
      <div className="flex flex-col gap-1.5" role="tablist" aria-label="dbt layers">
        <p className="mb-1 text-center font-mono text-[11px] tracking-wide text-ink-faint">
          click a layer to inspect it
        </p>
        {stack.map((l, i) => {
          const isActive = l.id === active;
          return (
            <button
              key={l.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(l.id)}
              style={{
                backgroundColor: isActive ? l.color : "color-mix(in srgb, " + l.color + " 12%, white)",
                borderColor: l.color,
                marginLeft: `${i * 10}px`,
                marginRight: `${(stack.length - 1 - i) * 10}px`,
              }}
              className={`group cursor-pointer rounded-lg border-2 px-4 py-2.5 text-left transition-all hover:translate-x-1 hover:shadow-md ${
                isActive ? "text-white shadow-lg" : "text-ink"
              }`}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-display text-sm font-extrabold uppercase tracking-wide">
                  {l.name}
                </span>
                <code
                  className={`font-mono text-[11px] ${isActive ? "text-white/80" : "text-ink-faint"}`}
                >
                  {l.prefix}
                </code>
              </span>
            </button>
          );
        })}
        <p className="mt-1 text-center font-mono text-[11px] tracking-wide text-ink-faint">
          ▲ data flows upward ▲
        </p>
      </div>

      <div
        key={layer.id}
        className="rise rounded-2xl border-2 p-5"
        style={{ borderColor: layer.color }}
        role="tabpanel"
      >
        <p
          className="font-display text-xs font-extrabold uppercase tracking-widest"
          style={{ color: layer.color }}
        >
          {layer.name} · {layer.job}
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{layer.detail}</p>
        <dl className="mt-4 flex flex-col gap-1.5 font-mono text-xs">
          {(
            [
              ["example", layer.example],
              ["materialized", layer.materialized],
              ["lands in", layer.database],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-lg bg-paper-warm px-3 py-2"
            >
              <dt className="shrink-0 text-ink-faint">{label}</dt>
              <dd className="!my-0 min-w-0 break-words text-right text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
