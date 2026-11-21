"use client";

import { useState } from "react";

const JOBS = [
  {
    id: "staging",
    label: "Clean one source table (renames, casts, no joins)",
    prefix: "stg_",
  },
  {
    id: "modelling",
    label: "Join or derive a reusable building block",
    prefix: "int_",
  },
  {
    id: "reporting",
    label: "Assemble an analyst-facing dataset",
    prefix: "dim_ or fct_",
  },
  {
    id: "published",
    label: "Feed a dashboard or external consumer",
    prefix: "(product name)",
  },
] as const;

type JobId = (typeof JOBS)[number]["id"];

/** a folder and the schema generate_schema_name gives it; DEV__ is added to the database in dev */
type Placement = { path: string; schema: string; note?: string; prefix?: string } | { none: string };

const NO_STAGING = {
  none: "Staging is one model per source table, so it lives under that source's folder. Pick the feed you're cleaning instead.",
};
const PUBLISHED_OUTSIDE_OLIDS = {
  none: "Outside OLIDS, published folders don't set a schema automatically. Ask a maintainer where the product should land.",
};

/** paths and schemas checked against dbt-analytics main */
const DOMAINS: {
  id: string;
  label: string;
  detail: string;
  places: Record<JobId, Placement>;
}[] = [
  {
    id: "acute",
    label: "Hospital activity (SUS)",
    detail: "Admissions, outpatients, A&E",
    places: {
      staging: { path: "models/staging/commissioning/sus/", schema: "STAGING.SUS" },
      modelling: { path: "models/modelling/acute/", schema: "MODELLING.ACUTE" },
      reporting: { path: "models/reporting/acute/", schema: "REPORTING.ACUTE" },
      published: PUBLISHED_OUTSIDE_OLIDS,
    },
  },
  {
    id: "community",
    label: "Community services (CSDS)",
    detail: "Community contacts, referrals and activity",
    places: {
      staging: { path: "models/staging/commissioning/csds/", schema: "STAGING.CSDS" },
      modelling: { path: "models/modelling/community/", schema: "MODELLING.COMMUNITY" },
      reporting: { path: "models/reporting/community/", schema: "REPORTING.COMMUNITY" },
      published: PUBLISHED_OUTSIDE_OLIDS,
    },
  },
  {
    id: "mental_health",
    label: "Mental health (MHSDS)",
    detail: "Mental health referrals, contacts and inpatient stays",
    places: {
      staging: { path: "models/staging/commissioning/mhsds/", schema: "STAGING.MHSDS" },
      modelling: { path: "models/modelling/mental_health/", schema: "MODELLING.MENTAL_HEALTH" },
      reporting: { path: "models/reporting/mental_health/", schema: "REPORTING.MENTAL_HEALTH" },
      published: PUBLISHED_OUTSIDE_OLIDS,
    },
  },
  {
    id: "waiting_lists",
    label: "Waiting lists (WLMDS)",
    detail: "Open pathways and waiting-list snapshots",
    places: {
      staging: { path: "models/staging/commissioning/wl/", schema: "STAGING.WL" },
      modelling: { path: "models/modelling/waiting_lists/", schema: "MODELLING.WAITING_LISTS" },
      reporting: { path: "models/reporting/waiting_lists/", schema: "REPORTING.WAITING_LISTS" },
      published: PUBLISHED_OUTSIDE_OLIDS,
    },
  },
  {
    id: "population",
    label: "Population",
    detail: "Person demographics and population flags, mostly from PDS",
    places: {
      staging: NO_STAGING,
      modelling: { path: "models/modelling/population/", schema: "MODELLING.POPULATION" },
      reporting: { path: "models/reporting/population/", schema: "REPORTING.POPULATION" },
      published: PUBLISHED_OUTSIDE_OLIDS,
    },
  },
  {
    id: "cross_system",
    label: "Cross-system",
    detail: "Person-level activity, cost and resource indices that combine feeds",
    places: {
      staging: NO_STAGING,
      modelling: { path: "models/modelling/cross_system/", schema: "MODELLING.CROSS_SYSTEM" },
      reporting: { path: "models/reporting/cross_system/", schema: "REPORTING.CROSS_SYSTEM" },
      published: PUBLISHED_OUTSIDE_OLIDS,
    },
  },
  {
    id: "olids",
    label: "Primary care (OLIDS)",
    detail: "GP records: observations, diagnoses, appointments, registers",
    places: {
      staging: { path: "models/staging/olids/", schema: "STAGING.OLIDS" },
      modelling: {
        path: "models/modelling/olids/{topic}/",
        schema: "MODELLING.OLIDS_{TOPIC}",
        note: "OLIDS adds a topic subfolder (diagnoses, observations, programme…). The topic becomes part of the schema name.",
      },
      reporting: {
        path: "models/reporting/olids/{topic}/",
        schema: "REPORTING.OLIDS_{TOPIC}",
        note: "OLIDS adds a topic subfolder (disease_registers, person_demographics…). The topic becomes part of the schema name.",
      },
      published: {
        path: "models/published/{direct_care | secondary_use}/olids/{product}/",
        schema: "PUBLISHED_REPORTING__{DIRECT_CARE | SECONDARY_USE}.OLIDS_{PRODUCT}",
        note: "secondary_use is for products with opt-outs filtered out. The product folder becomes part of the schema name.",
      },
    },
  },
  {
    id: "reference",
    label: "Shared reference",
    detail: "Lookups used across domains: geography, deprivation, organisations",
    places: {
      staging: { path: "models/staging/shared/reference/", schema: "STAGING.REFERENCE" },
      modelling: {
        path: "models/reference/{subject}/",
        schema: "REFERENCE.{SUBJECT}",
        prefix: "(subject name, e.g. organisation_)",
        note: "Derived reference datasets have their own reference layer. The subject folder becomes the schema.",
      },
      reporting: {
        none: "Reference lookups aren't marts. Build them in models/reference/ and join them into a domain's reporting models.",
      },
      published: PUBLISHED_OUTSIDE_OLIDS,
    },
  },
];

export function FolderPicker() {
  const [job, setJob] = useState<(typeof JOBS)[number] | null>(null);
  const [domain, setDomain] = useState<(typeof DOMAINS)[number] | null>(null);

  const place = job && domain ? domain.places[job.id] : null;

  return (
    <div className="my-6 rounded-2xl border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_0_var(--color-layer-modelling)]">
      <p className="!my-0 font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-layer-modelling">
        Where does my model go?
      </p>

      <p className="!mb-1.5 !mt-3 text-sm font-medium !text-ink">
        1 · What job is the model doing?
      </p>
      <div className="flex flex-col gap-1.5">
        {JOBS.map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => setJob(j)}
            className={`rounded-lg border px-3.5 py-2 text-left text-sm transition ${
              job?.id === j.id
                ? "border-flame bg-flame-soft text-ink"
                : "border-line text-ink-soft hover:border-flame"
            }`}
          >
            {j.label}
          </button>
        ))}
      </div>

      <p className="!mb-1.5 !mt-4 text-sm font-medium !text-ink">
        2 · What data is it about?
      </p>
      <div className="flex flex-col gap-1.5">
        {DOMAINS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDomain(d)}
            className={`rounded-lg border px-3.5 py-2 text-left text-sm transition ${
              domain?.id === d.id
                ? "border-flame bg-flame-soft text-ink"
                : "border-line text-ink-soft hover:border-flame"
            }`}
          >
            <span className="block font-medium">{d.label}</span>
            <span className="text-xs text-ink-faint">{d.detail}</span>
          </button>
        ))}
      </div>

      {place && "none" in place && (
        <div className="rise mt-4 rounded-xl border border-line bg-paper-warm px-4 py-3">
          <p className="!my-0 text-sm !text-ink-soft">{place.none}</p>
        </div>
      )}
      {place && "path" in place && (
        <div className="rise mt-4 rounded-xl bg-graphite-deep px-4 py-3">
          <p className="!my-0 font-mono text-[11px] !text-white/75">
            your model lives in
          </p>
          <p className="!my-0 break-all font-mono text-sm !text-[#a7f3d0]">{place.path}</p>
          <p className="!mb-0 !mt-1.5 break-all font-mono text-xs !text-white/85">
            builds into <span className="!text-[#a7f3d0]">{place.schema}</span>
          </p>
          <p className="!mb-0 !mt-1.5 font-mono text-xs !text-white/85">
            file name starts with{" "}
            <span className="!text-[#ffb4a3]">{place.prefix ?? job!.prefix}</span>
          </p>
          {place.note && (
            <p className="!mb-0 !mt-1.5 text-xs !text-white/75">{place.note}</p>
          )}
        </div>
      )}
    </div>
  );
}
