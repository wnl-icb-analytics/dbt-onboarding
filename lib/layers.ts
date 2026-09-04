export type Layer = {
  id: string;
  name: string;
  prefix: string;
  job: string;
  detail: string;
  example: string;
  materialized: string;
  database: string;
  color: string; // css var
};

export const LAYERS: Layer[] = [
  {
    id: "raw",
    name: "Raw",
    prefix: "raw_",
    job: "Preserve the source evidence",
    detail:
      "A 1:1 account of what the source supplied, projected through readable snake_case names. Auto-generated — no interpretation or row loss.",
    example: "raw_csds_bridging",
    materialized: "view",
    database: "STAGING.DBT_RAW",
    color: "var(--layer-raw)",
  },
  {
    id: "staging",
    name: "Staging",
    prefix: "stg_",
    job: "Prepare one source for every use",
    detail:
      "One model per source table. Apply names, types, cleaning and source-specific fixes that every downstream use of that feed should inherit.",
    example: "stg_csds_bridging",
    materialized: "view",
    database: "STAGING.CSDS",
    color: "var(--layer-staging)",
  },
  {
    id: "modelling",
    name: "Modelling",
    prefix: "int_",
    job: "Prepare components for marts",
    detail:
      "Prepare reusable evidence and transformations for downstream models. Reporting marts can complete the definitions they offer for analysis.",
    example: "int_wl_current",
    materialized: "table",
    database: "MODELLING.COMMISSIONING_MODELLING",
    color: "var(--layer-modelling)",
  },
  {
    id: "reporting",
    name: "Reporting",
    prefix: "dim_ / fct_",
    job: "Build business-ready marts",
    detail:
      "The project's marts layer: business-defined entities and concepts at explicit grains, made wide, documented and convenient for analysts to query.",
    example: "dim_person_demographics",
    materialized: "table",
    database: "REPORTING.COMMISSIONING_REPORTING",
    color: "var(--layer-reporting)",
  },
  {
    id: "published",
    name: "Published",
    prefix: "(domain name)",
    job: "Serve named data products",
    detail:
      "Tables and views built for named reports, dashboards, extracts and applications, with their ownership, access and use-specific policies made explicit.",
    example: "population_health_needs_base",
    materialized: "table",
    database: "PUBLISHED_REPORTING__*",
    color: "var(--layer-published)",
  },
];

/** descriptions used by the layer-sorter quiz */
export const SORTER_ITEMS: { text: string; layer: string; reason: string }[] = [
  {
    text: "Defines when a pathway is open and its state at each weekly snapshot",
    layer: "modelling",
    reason:
      "Open-pathway state is shared domain meaning: every later count and product should inherit the same definition.",
  },
  {
    text: "Exposes \"UNIQUE SUBMISSION ID\" as unique_submission_id without changing a row",
    layer: "raw",
    reason:
      "This preserves exactly what the source supplied while making its physical columns readable.",
  },
  {
    text: "Provides one documented row per person with current demographics",
    layer: "reporting",
    reason:
      "This is a person-grain mart: a business-defined concept made complete and convenient for analysts to query.",
  },
  {
    text: "Interprets the feed's text date as a date and gives its person identifier the project name",
    layer: "staging",
    reason:
      "These are universal preparations that every downstream use of this source should inherit; they do not decide what a waiting pathway means.",
  },
  {
    text: "Provides the exact table queried by the monthly waiting-times dashboard",
    layer: "published",
    reason:
      "This model exists as the stable data contract for a named product; its ownership, access and any product-specific rules belong with it.",
  },
];
