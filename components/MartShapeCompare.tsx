function ModelCard({
  name,
  detail,
  tone = "plain",
}: {
  name: string;
  detail: string;
  tone?: "plain" | "fact" | "mart";
}) {
  const styles = {
    plain: "border-layer-modelling/45 bg-paper",
    fact: "border-flame bg-graphite-deep text-white",
    mart: "border-layer-staging bg-graphite-deep text-white",
  } as const;

  return (
    <div className={`rounded-xl border-2 p-3 ${styles[tone]}`}>
      <p
        className={`!my-0 [overflow-wrap:anywhere] font-mono text-[11px] font-bold ${
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

function FlowArrow() {
  return (
    <div aria-hidden className="py-1 text-center font-display text-lg font-black text-flame">
      ↓
    </div>
  );
}

export function MartShapeCompare() {
  return (
    <figure className="my-7 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
      <header className="border-b-2 border-ink bg-paper-warm px-5 py-3">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-layer-modelling">
          Same definitions · different delivery shape
        </p>
        <p className="!mb-0 !mt-1 text-[14px] font-medium !text-ink">
          Both designs can be correct. The difference is who has to assemble the useful row.
        </p>
      </header>

      <div className="grid md:grid-cols-2">
        <section className="border-b-2 border-ink p-4 md:border-b-0 md:border-r-2">
          <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.14em] !text-flame-deep">
            Kimball-style star
          </p>
          <p className="!mb-3 !mt-1 text-[12px] leading-snug !text-ink-soft">
            Keep facts and conformed dimensions physically separate.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <ModelCard name="dim_person" detail="age · ethnicity" />
            <ModelCard name="dim_date" detail="month · year" />
            <ModelCard name="dim_practice" detail="name · place" />
          </div>
          <FlowArrow />
          <ModelCard
            name="fct_appointment"
            detail="one row per appointment · the analyst or BI tool performs the joins"
            tone="fact"
          />
        </section>

        <section className="p-4">
          <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.14em] !text-layer-staging">
            Denormalised analytical mart
          </p>
          <p className="!mb-3 !mt-1 text-[12px] leading-snug !text-ink-soft">
            Keep definitions reusable, but perform routine joins in dbt.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <ModelCard name="person" detail="defined once" />
            <ModelCard name="date" detail="defined once" />
            <ModelCard name="practice" detail="defined once" />
          </div>
          <FlowArrow />
          <ModelCard
            name="appointments"
            detail="appointment grain · age · ethnicity · month · practice · commonly used measures"
            tone="mart"
          />
        </section>
      </div>

      <figcaption className="border-t-2 border-ink bg-paper px-5 py-3 text-sm text-ink-soft">
        Denormalisation repeats useful values in the delivered mart. It should not create a
        second definition of person, ethnicity, practice or time.
      </figcaption>
    </figure>
  );
}
