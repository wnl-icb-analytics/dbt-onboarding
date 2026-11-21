"use client";

import { useMemo, useState } from "react";

type Node = {
  id: string;
  label: string;
  /** second line, used for a source's table identifier */
  sub?: string;
  x: number;
  y: number;
  w: number;
  color: string;
  kind: "source" | "model";
};

/** a slice of dbt-analytics: every node and edge matches a source() or ref() on main */
const NODES: Node[] = [
  { id: "src_wl", label: "DATA_LAKE.WL", sub: '"WL_OpenPathways_Data"', x: 16, y: 64, w: 146, color: "var(--ink-faint)", kind: "source" },
  { id: "src_dict", label: '"Dictionary"."dbo"', sub: '"Specialties"', x: 16, y: 144, w: 146, color: "var(--ink-faint)", kind: "source" },
  { id: "src_csds", label: "DATA_LAKE.CSDS", sub: '"Bridging"', x: 16, y: 224, w: 146, color: "var(--ink-faint)", kind: "source" },
  { id: "raw_wl", label: "raw_wl_wl_openpathways_data", x: 186, y: 64, w: 210, color: "var(--layer-raw)", kind: "model" },
  { id: "raw_dict", label: "raw_dictionary_dbo_specialties", x: 186, y: 144, w: 210, color: "var(--layer-raw)", kind: "model" },
  { id: "raw_csds", label: "raw_csds_bridging", x: 186, y: 224, w: 210, color: "var(--layer-raw)", kind: "model" },
  { id: "stg_wl", label: "stg_wl_openpathways_data", x: 420, y: 64, w: 210, color: "var(--layer-staging)", kind: "model" },
  { id: "stg_dict", label: "stg_dictionary_dbo_specialties", x: 420, y: 144, w: 210, color: "var(--layer-staging)", kind: "model" },
  { id: "stg_csds", label: "stg_csds_bridging", x: 420, y: 224, w: 210, color: "var(--layer-staging)", kind: "model" },
  { id: "int_wl", label: "int_wl_current", x: 654, y: 104, w: 108, color: "var(--layer-modelling)", kind: "model" },
  { id: "reporting", label: "reporting →", x: 786, y: 224, w: 96, color: "var(--layer-reporting)", kind: "model" },
];

const EDGES: [string, string][] = [
  ["src_wl", "raw_wl"],
  ["src_dict", "raw_dict"],
  ["src_csds", "raw_csds"],
  ["raw_wl", "stg_wl"],
  ["raw_dict", "stg_dict"],
  ["raw_csds", "stg_csds"],
  ["stg_wl", "int_wl"],
  ["stg_dict", "int_wl"],
  ["stg_csds", "reporting"],
  ["int_wl", "reporting"],
];

const H = 40;

function edgePath(a: Node, b: Node): string {
  const x1 = a.x + a.w;
  const y1 = a.y + H / 2;
  const x2 = b.x;
  const y2 = b.y + H / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function reachable(start: string, dir: "up" | "down"): Set<string> {
  const out = new Set<string>([start]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [from, to] of EDGES) {
      if (dir === "down" && out.has(from) && !out.has(to)) {
        out.add(to);
        grew = true;
      }
      if (dir === "up" && out.has(to) && !out.has(from)) {
        out.add(from);
        grew = true;
      }
    }
  }
  return out;
}

export function Dag() {
  const [hover, setHover] = useState<string | null>(null);

  const lit = useMemo(() => {
    if (!hover) return null;
    return new Set([...reachable(hover, "up"), ...reachable(hover, "down")]);
  }, [hover]);

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-line bg-paper-warm/50">
      <svg viewBox="0 0 898 312" className="w-full" role="img" aria-label="Lineage graph from sources through raw, staging and modelling layers to reporting">
        {EDGES.map(([f, t], i) => {
          const a = NODES.find((n) => n.id === f)!;
          const b = NODES.find((n) => n.id === t)!;
          const on = !lit || (lit.has(f) && lit.has(t));
          const d = edgePath(a, b);
          return (
            <g key={`${f}-${t}`} opacity={on ? 1 : 0.12} style={{ transition: "opacity .2s" }}>
              <path
                d={d}
                fill="none"
                stroke="var(--ink-faint)"
                strokeWidth="1.5"
                strokeDasharray="400"
                strokeDashoffset="400"
                style={{ animation: `dash 1.1s ${0.15 + i * 0.08}s cubic-bezier(.4,0,.2,1) forwards` }}
              />
              <circle
                r="3"
                fill="var(--flame)"
                style={{
                  offsetPath: `path("${d}")`,
                  animation: `flowdot 3.2s ${1.4 + i * 0.35}s linear infinite`,
                }}
              />
            </g>
          );
        })}
        {NODES.map((n) => {
          const on = !lit || lit.has(n.id);
          return (
            <g
              key={n.id}
              opacity={on ? 1 : 0.18}
              style={{ transition: "opacity .2s", cursor: "default" }}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
            >
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={H}
                rx={n.kind === "source" ? 20 : 9}
                fill={n.kind === "source" ? "var(--paper)" : "var(--paper)"}
                stroke={n.color}
                strokeWidth={hover === n.id ? 2.5 : 1.8}
                strokeDasharray={n.kind === "source" ? "4 3" : undefined}
              />
              <text
                x={n.x + n.w / 2}
                y={n.sub ? n.y + 16 : n.y + H / 2 + 4}
                textAnchor="middle"
                fontSize={n.sub ? "10" : "11"}
                fontFamily="var(--font-mono-jb), monospace"
                fill={n.kind === "source" ? "var(--ink-faint)" : "var(--ink)"}
              >
                {n.label}
                {n.sub && (
                  <tspan x={n.x + n.w / 2} dy="13">
                    {n.sub}
                  </tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="border-t border-line px-4 py-2 text-center font-mono text-[11px] text-ink-faint">
        hover a node to trace its lineage · dotted = source, solid = dbt model · reporting → groups the reporting models that read these
      </figcaption>
    </figure>
  );
}
