function ModelCard({
  name,
  detail,
  tone = "plain",
}: {
  name: string;
  detail: string;
  tone?: "plain" | "wide";
}) {
  const styles = {
    plain: "border-layer-modelling/45 bg-paper",
    wide: "border-layer-staging bg-graphite-deep text-white",
  } as const;

  return (
    <div className={`rounded-xl border-2 px-3 py-2 ${styles[tone]}`}>
      <p
        className={`!my-0 whitespace-nowrap font-mono text-[11px] font-bold ${
          tone === "plain" ? "!text-ink" : "!text-white"
        }`}
      >
        {name}
      </p>
      <p
        className={`!mb-0 !mt-1 text-[10px] leading-snug ${
          tone === "plain" ? "!text-ink-soft" : "!text-white/65"
        }`}
      >
        {detail}
      </p>
    </div>
  );
}

function JoinArrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <span aria-hidden className="font-display text-lg font-black text-flame">
        ↓
      </span>
      <span className="text-[11px] font-medium leading-snug text-ink-soft">
        {label}
      </span>
    </div>
  );
}

function SharedModels() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <ModelCard name="dim_person" detail="age · ethnicity" />
        <ModelCard name="dim_date" detail="month · year" />
        <ModelCard name="dim_practice" detail="name · place" />
      </div>
      <div className="mt-2">
        <ModelCard
          name="fct_appointment"
          detail="one row per appointment · keys and measures"
        />
      </div>
    </>
  );
}

export function MartShapeCompare() {
  return (
    <figure className="my-7 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
      <header className="border-b-2 border-ink bg-paper-warm px-5 py-3">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-layer-modelling">
          Same star · different join time
        </p>
        <p className="!mb-0 !mt-1 text-[14px] font-medium !text-ink">
          Both sides use the same facts and dimensions. The difference is where
          the routine joins run.
        </p>
      </header>

      <div className="grid md:grid-cols-2">
        <section className="border-b-2 border-ink p-4 md:border-b-0 md:border-r-2">
          <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.14em] !text-flame-deep">
            Joins at query time
          </p>
          <p className="!mb-3 !mt-1 text-[12px] leading-snug !text-ink-soft">
            The classic physical star: consumers assemble the row themselves.
          </p>
          <SharedModels />
          <JoinArrow label="every analyst query or BI tool repeats the joins" />
          <ModelCard
            name="select … join … join …"
            detail="the useful row is reassembled in each query · each join is a fresh chance to multiply rows"
            tone="wide"
          />
        </section>

        <section className="p-4">
          <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.14em] !text-layer-staging">
            Joins performed in dbt
          </p>
          <p className="!mb-3 !mt-1 text-[12px] leading-snug !text-ink-soft">
            This project: the same star, with routine joins done once.
          </p>
          <SharedModels />
          <JoinArrow label="dbt performs the routine joins once, reviewed and tested" />
          <ModelCard
            name="fct_appointment (wide)"
            detail="appointment grain · age · ethnicity · practice already attached · analysts select from one row"
            tone="wide"
          />
        </section>
      </div>

      <figcaption className="border-t-2 border-ink bg-paper px-5 py-3 text-sm text-ink-soft">
        The <code>fct_</code>/<code>dim_</code> discipline is identical on both
        sides. Widening the delivered mart repeats useful values; it does not
        create a second definition of person, practice or time.
      </figcaption>
    </figure>
  );
}
