"use client";

/** Branch-and-merge visual: commits on main, a feature branch, and the merge back. */
export function BranchDiagram() {
  const mainY = 56;
  const branchY = 128;
  const mainCommits = [
    { id: "A", x: 70 },
    { id: "B", x: 160 },
    { id: "C", x: 250 },
  ];
  const branchCommits = [
    { id: "D", x: 340 },
    { id: "E", x: 430 },
    { id: "F", x: 520 },
  ];
  const merge = { id: "G", x: 610 };
  const r = 15;

  return (
    <figure className="my-5 overflow-hidden rounded-2xl border border-line bg-paper-warm/50">
      <svg
        viewBox="0 0 700 186"
        className="w-full"
        role="img"
        aria-label="A feature branch leaving main after commit C, gaining commits D, E and F, and merging back into main at commit G"
      >
        {/* main line */}
        <line
          x1={mainCommits[0].x}
          y1={mainY}
          x2={660}
          y2={mainY}
          stroke="var(--ink)"
          strokeWidth="2.5"
        />
        {/* branch out: C -> D */}
        <path
          d={`M ${mainCommits[2].x + r} ${mainY + 8} C ${mainCommits[2].x + 55} ${branchY}, ${branchCommits[0].x - 55} ${branchY}, ${branchCommits[0].x - r} ${branchY}`}
          fill="none"
          stroke="var(--flame)"
          strokeWidth="2.5"
        />
        {/* branch line D -> F */}
        <line
          x1={branchCommits[0].x}
          y1={branchY}
          x2={branchCommits[2].x}
          y2={branchY}
          stroke="var(--flame)"
          strokeWidth="2.5"
        />
        {/* merge back: F -> G */}
        <path
          d={`M ${branchCommits[2].x + r} ${branchY} C ${branchCommits[2].x + 55} ${branchY}, ${merge.x - 55} ${mainY + 10}, ${merge.x - 6} ${mainY + 6}`}
          fill="none"
          stroke="var(--flame)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />

        {/* labels */}
        <text
          x={mainCommits[0].x - 12}
          y={mainY - 26}
          fontFamily="var(--font-display), sans-serif"
          fontSize="13"
          fontWeight="800"
          fill="var(--ink)"
        >
          main
        </text>
        <text
          x={mainCommits[0].x + 80}
          y={mainY - 26}
          fontFamily="var(--font-mono-jb), monospace"
          fontSize="11"
          fill="var(--ink-faint)"
        >
          production — always correct
        </text>
        <text
          x={branchCommits[0].x - 12}
          y={branchY + 38}
          fontFamily="var(--font-display), sans-serif"
          fontSize="13"
          fontWeight="800"
          fill="var(--flame-deep)"
        >
          your branch
        </text>
        <text
          x={branchCommits[0].x + 105}
          y={branchY + 38}
          fontFamily="var(--font-mono-jb), monospace"
          fontSize="11"
          fill="var(--ink-faint)"
        >
          your proposed changes
        </text>

        {/* main commits */}
        {mainCommits.map((c) => (
          <g key={c.id}>
            <circle
              cx={c.x}
              cy={mainY}
              r={r}
              fill="var(--paper)"
              stroke="var(--ink)"
              strokeWidth="2.5"
            />
            <text
              x={c.x}
              y={mainY + 4.5}
              textAnchor="middle"
              fontFamily="var(--font-mono-jb), monospace"
              fontSize="12.5"
              fontWeight="700"
              fill="var(--ink)"
            >
              {c.id}
            </text>
          </g>
        ))}

        {/* branch commits */}
        {branchCommits.map((c) => (
          <g key={c.id}>
            <circle
              cx={c.x}
              cy={branchY}
              r={r}
              fill="var(--flame-soft)"
              stroke="var(--flame)"
              strokeWidth="2.5"
            />
            <text
              x={c.x}
              y={branchY + 4.5}
              textAnchor="middle"
              fontFamily="var(--font-mono-jb), monospace"
              fontSize="12.5"
              fontWeight="700"
              fill="var(--flame-deep)"
            >
              {c.id}
            </text>
          </g>
        ))}

        {/* merge commit */}
        <g>
          <circle
            cx={merge.x}
            cy={mainY}
            r={r}
            fill="var(--flame)"
            stroke="var(--ink)"
            strokeWidth="2.5"
          />
          <text
            x={merge.x}
            y={mainY + 4.5}
            textAnchor="middle"
            fontFamily="var(--font-mono-jb), monospace"
            fontSize="12.5"
            fontWeight="700"
            fill="#fff"
          >
            {merge.id}
          </text>
          <text
            x={merge.x}
            y={mainY - 26}
            textAnchor="middle"
            fontFamily="var(--font-mono-jb), monospace"
            fontSize="11"
            fill="var(--flame-deep)"
          >
            merge
          </text>
        </g>
      </svg>
      <figcaption className="border-t border-line px-4 py-2 text-center font-mono text-[11px] text-ink-faint">
        branch off after C · record commits D, E, F · merge lands it all as G
      </figcaption>
    </figure>
  );
}
