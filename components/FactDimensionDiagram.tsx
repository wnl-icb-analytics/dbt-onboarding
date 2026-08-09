type Variant = "traditional" | "population";

const BADGE_STYLES = {
  fact: "border-flame/40 bg-flame/15 text-[#ffb3a3]",
  dimension: "border-layer-modelling/30 bg-layer-modelling/10 text-layer-modelling",
  evidence: "border-line bg-paper-warm text-ink-faint",
} as const;

function Badge({
  children,
  tone,
}: {
  children: string;
  tone: keyof typeof BADGE_STYLES;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 font-display text-[9px] font-extrabold uppercase tracking-[0.14em] ${BADGE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}

function FactCard({
  name,
  grain,
  details,
}: {
  name: string;
  grain: string;
  details: string[];
}) {
  return (
    <div className="rounded-2xl border-2 border-flame bg-graphite-deep p-4 text-paper shadow-[4px_4px_0_0_var(--color-flame)]">
      <Badge tone="fact">Fact · subject</Badge>
      <p className="!mb-0 !mt-2 [overflow-wrap:anywhere] font-mono text-[13px] font-bold !text-white">
        {name}
      </p>
      <p className="!mb-0 !mt-1 text-[12px] leading-snug !text-white/65">{grain}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {details.map((detail) => (
          <span
            key={detail}
            className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-white/75"
          >
            {detail}
          </span>
        ))}
      </div>
    </div>
  );
}

function DimensionCard({
  name,
  description,
  details,
}: {
  name: string;
  description: string;
  details: string;
}) {
  return (
    <div className="rounded-xl border-2 border-layer-modelling/55 bg-paper p-3.5 shadow-[3px_3px_0_0_var(--color-layer-modelling)]">
      <Badge tone="dimension">Dimension · context</Badge>
      <p className="!mb-0 !mt-2 [overflow-wrap:anywhere] font-mono text-[12px] font-bold !text-ink">
        {name}
      </p>
      <p className="!mb-0 !mt-1 text-[11px] leading-snug !text-ink-soft">{description}</p>
      <p className="!mb-0 !mt-2 font-mono text-[9.5px] leading-snug !text-ink-faint">
        {details}
      </p>
    </div>
  );
}

function EvidenceCard() {
  return (
    <div className="rounded-xl border-2 border-dashed border-ink-faint/50 bg-paper p-3.5">
      <Badge tone="evidence">Clinical evidence</Badge>
      <p className="!mb-0 !mt-2 text-[11px] leading-relaxed !text-ink-soft">
        diagnosis codes · resolution codes · age at evaluation
      </p>
    </div>
  );
}

function DownArrow({ children }: { children: string }) {
  return (
    <div className="my-3 flex flex-col items-center gap-0.5 text-center" aria-hidden="true">
      <span className="font-display text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">
        {children}
      </span>
      <span className="text-xl leading-none text-flame">↓</span>
    </div>
  );
}

function TraditionalDiagram() {
  return (
    <div className="p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <DimensionCard name="dim_person" description="Who attended" details="age · ethnicity" />
        <DimensionCard name="dim_date" description="When it happened" details="month · weekday" />
        <DimensionCard
          name="dim_practice"
          description="Where it happened"
          details="name · neighbourhood"
        />
      </div>

      <DownArrow>provide context for</DownArrow>

      <div className="mx-auto max-w-md">
        <FactCard
          name="fct_appointment"
          grain="One row per appointment"
          details={["wait time", "duration", "attendance status"]}
        />
      </div>
    </div>
  );
}

function PopulationDiagram() {
  return (
    <div className="p-4 sm:p-5">
      <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,0.8fr)_auto_minmax(0,1.3fr)]">
        <EvidenceCard />
        <div className="flex flex-col items-center text-center" aria-hidden="true">
          <span className="font-display text-[9px] font-bold uppercase tracking-[0.12em] text-flame-deep">
            defines
          </span>
          <span className="text-xl leading-none text-flame sm:hidden">↓</span>
          <span className="hidden text-xl leading-none text-flame sm:block">→</span>
        </div>
        <FactCard
          name="fct_person_diabetes_register"
          grain="One row per included person at build time"
          details={["membership", "diabetes type", "evidence dates"]}
        />
      </div>

      <div className="my-3 flex flex-col items-center gap-0.5 text-center" aria-hidden="true">
        <span className="text-xl leading-none text-layer-modelling">↑</span>
        <span className="font-display text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint">
          described with context from
        </span>
      </div>

      <div className="grid gap-3 sm:ml-auto sm:w-[68%]">
        <DimensionCard
          name="dim_person_ethnicity"
          description="Describes the person"
          details="ethnic group"
        />
        <DimensionCard
          name="dim_person_current_practice"
          description="Describes the person's organisation"
          details="practice · neighbourhood"
        />
      </div>
    </div>
  );
}

export function FactDimensionDiagram({ variant }: { variant: Variant }) {
  const traditional = variant === "traditional";

  return (
    <figure
      className="my-7 max-w-[72ch] overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-modelling)]"
      aria-label={
        traditional
          ? "Person, date and practice dimensions providing context for an appointment fact"
          : "Diagnosis and resolution evidence plus age defining a diabetes register fact, with ethnicity and practice dimensions adding context"
      }
    >
      <header className="border-b-2 border-ink bg-paper-warm px-5 py-3">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-layer-modelling">
          {traditional ? "Traditional analytical pattern" : "Population-health analytical pattern"}
        </p>
        <p className="!mb-0 !mt-1 text-[14px] font-medium !text-ink">
          {traditional
            ? "Dimensions describe the context; the fact is the subject being counted or measured."
            : "Clinical evidence and age define current register membership; dimensions add context about the people in it."}
        </p>
      </header>

      {traditional ? <TraditionalDiagram /> : <PopulationDiagram />}

      <figcaption className="border-t-2 border-ink bg-paper px-5 py-3 text-sm text-ink-soft">
        {traditional
          ? "Count and measure appointments; use the dimensions to ask who, when and where."
          : "Register membership is the fact being counted. Ethnicity and practice provide reusable context for analysing it."}
      </figcaption>
    </figure>
  );
}
