"use client";

/** Branch-and-squash visual: G's only parent is C; it carries D, E and F's changes as one commit. */
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
        aria-label="A feature branch leaves main after commit C and gains commits D, E and F. A squash merge adds commit G to main. G's only parent is C, and it carries the changes from D, E and F as one commit."
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
        {/* squash: D, E and F's changes, grouped, become G. Not a parent link. */}
        <defs>
          <marker
            id="squash-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--flame)" />
          </marker>
        </defs>
        <rect
          x={branchCommits[0].x - 26}
          y={branchY - 24}
          width={branchCommits[2].x - branchCommits[0].x + 52}
          height={48}
          rx={14}
          fill="none"
          stroke="var(--flame)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d={`M ${branchCommits[2].x + 26} ${branchY} C ${merge.x - 20} ${branchY}, ${merge.x} ${branchY - 20}, ${merge.x} ${mainY + r + 6}`}
          fill="none"
          stroke="var(--flame)"
          strokeWidth="2"
          strokeDasharray="6 4"
          markerEnd="url(#squash-arrow)"
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
          the branch production deploys from
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
            squash merge
          </text>
        </g>
      </svg>
      <figcaption className="border-t border-line px-4 py-2 text-center font-mono text-[11px] text-ink-faint">
        branch off after C · commit D, E, F · a squash merge adds G, whose only parent is C
      </figcaption>
    </figure>
  );
}
