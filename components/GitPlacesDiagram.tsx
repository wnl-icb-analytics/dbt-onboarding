/** Four places work lives in Git, and the commands that move it between them. */
export function GitPlacesDiagram() {
  const boxY = 100;
  const boxH = 96;
  const boxW = 132;
  const places = [
    {
      x: 10,
      title: "working folder",
      lines: ["your files on disk", "saved, not recorded"],
      see: "git diff",
    },
    {
      x: 200,
      title: "staging area",
      lines: ["changes picked for", "the next commit"],
      see: "git diff --staged",
    },
    {
      x: 390,
      title: "local history",
      lines: ["your commits, plus", "origin/main bookmark"],
      see: "git log",
    },
    {
      x: 610,
      title: "GitHub · origin",
      lines: ["the shared copy", "the team can see"],
      see: "the branch or PR",
      shared: true,
    },
  ];
  const hops = [
    { from: 0, to: 1, label: "git add" },
    { from: 1, to: 2, label: "git commit" },
    { from: 2, to: 3, label: "git push" },
  ];
  const right = (i: number) => places[i].x + boxW;
  const left = (i: number) => places[i].x;
  const mid = (i: number) => places[i].x + boxW / 2;

  return (
    <figure className="my-5 overflow-hidden rounded-2xl border border-line bg-paper-warm/50">
      <svg
        viewBox="0 0 760 296"
        className="w-full"
        role="img"
        aria-label="Four places your work can be. Editing and saving changes the working folder. git add copies changes to the staging area. git commit records them in your local history. git push sends commits to GitHub, called origin. git fetch and git pull bring other people's commits back into your local history."
      >
        <defs>
          <marker
            id="places-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--flame)" />
          </marker>
          <marker
            id="places-arrow-back"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-soft)" />
          </marker>
        </defs>

        {/* your machine */}
        <rect
          x={2}
          y={30}
          width={530}
          height={202}
          rx={16}
          fill="none"
          stroke="var(--ink-faint)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <text
          x={267}
          y={222}
          textAnchor="middle"
          fontFamily="var(--font-mono-jb), monospace"
          fontSize="10.5"
          fill="var(--ink-faint)"
        >
          on your machine · only you can see these
        </text>

        {/* edit + save into the working folder */}
        <line
          x1={mid(0)}
          y1={56}
          x2={mid(0)}
          y2={boxY - 4}
          stroke="var(--flame)"
          strokeWidth="2"
          markerEnd="url(#places-arrow)"
        />
        <text
          x={mid(0)}
          y={48}
          textAnchor="middle"
          fontFamily="var(--font-mono-jb), monospace"
          fontSize="11"
          fontWeight="700"
          fill="var(--flame-deep)"
        >
          edit + save
        </text>

        {/* forward hops above the boxes */}
        {hops.map((h) => {
          const x1 = right(h.from) - 24;
          const x2 = left(h.to) + 24;
          const apex = (x1 + x2) / 2;
          return (
            <g key={h.label}>
              <path
                d={`M ${x1} ${boxY - 2} C ${x1 + 10} ${boxY - 46}, ${x2 - 10} ${boxY - 46}, ${x2} ${boxY - 4}`}
                fill="none"
                stroke="var(--flame)"
                strokeWidth="2"
                markerEnd="url(#places-arrow)"
              />
              <text
                x={apex}
                y={boxY - 44}
                textAnchor="middle"
                fontFamily="var(--font-mono-jb), monospace"
                fontSize="11"
                fontWeight="700"
                fill="var(--flame-deep)"
              >
                {h.label}
              </text>
            </g>
          );
        })}

        {/* fetch / pull back from GitHub */}
        <path
          d={`M ${mid(3)} ${boxY + boxH + 2} C ${mid(3)} ${boxY + boxH + 62}, ${mid(2)} ${boxY + boxH + 62}, ${mid(2)} ${boxY + boxH + 6}`}
          fill="none"
          stroke="var(--ink-soft)"
          strokeWidth="2"
          strokeDasharray="6 4"
          markerEnd="url(#places-arrow-back)"
        />
        <text
          x={(mid(2) + mid(3)) / 2}
          y={boxY + boxH + 66}
          textAnchor="middle"
          fontFamily="var(--font-mono-jb), monospace"
          fontSize="11"
          fontWeight="700"
          fill="var(--ink-soft)"
        >
          git fetch · git pull
        </text>

        {/* the four places */}
        {places.map((p) => (
          <g key={p.title}>
            <rect
              x={p.x}
              y={boxY}
              width={boxW}
              height={boxH}
              rx={12}
              fill={p.shared ? "var(--paper)" : "var(--flame-soft)"}
              stroke={p.shared ? "var(--ink)" : "var(--flame)"}
              strokeWidth={p.shared ? 2.5 : 2}
            />
            <text
              x={p.x + boxW / 2}
              y={boxY + 22}
              textAnchor="middle"
              fontFamily="var(--font-display), sans-serif"
              fontSize="12.5"
              fontWeight="800"
              fill={p.shared ? "var(--ink)" : "var(--flame-deep)"}
            >
              {p.title}
            </text>
            {p.lines.map((line, i) => (
              <text
                key={line}
                x={p.x + boxW / 2}
                y={boxY + 41 + i * 14}
                textAnchor="middle"
                fontFamily="var(--font-mono-jb), monospace"
                fontSize="9.5"
                fill="var(--ink-soft)"
              >
                {line}
              </text>
            ))}
            <text
              x={p.x + boxW / 2}
              y={boxY + 84}
              textAnchor="middle"
              fontFamily="var(--font-mono-jb), monospace"
              fontSize="9.5"
              fontWeight="700"
              fill="var(--ink)"
            >
              {p.see}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="border-t border-line px-4 py-2 text-center font-mono text-[11px] text-ink-faint">
        save changes the folder · add stages · commit records locally · push
        shares · fetch and pull bring the team&apos;s commits back
      </figcaption>
    </figure>
  );
}
