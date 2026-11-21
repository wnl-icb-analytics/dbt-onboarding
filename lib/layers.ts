export type Layer = {
  id: string;
  name: string;
  prefix: string;
  job: string;
  detail: string;
  example: string;
  /** the layer's default from dbt_project.yml */
  materialized: string;
  /** set when the example overrides the layer default */
  exampleMaterialized?: string;
  /** where the example builds in production */
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
      "A 1:1 account of what the source supplied, projected through readable snake_case names. Auto-generated, with no interpretation or row loss.",
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
      "One model per source table. Apply names, types, cleaning and fixes for that source that every downstream use of the feed should inherit.",
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
      "Prepare reusable evidence and transformations for downstream models. Reporting marts can finish the definitions they offer for analysis.",
    example: "int_wl_current",
    materialized: "table",
    exampleMaterialized: "view",
    database: "MODELLING.WAITING_LISTS",
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
    database: "REPORTING.OLIDS_PERSON_DEMOGRAPHICS",
    color: "var(--layer-reporting)",
  },
  {
    id: "published",
    name: "Published",
    prefix: "(domain name)",
    job: "Serve named data products",
    detail:
      "Tables and views built for named reports, dashboards, extracts and applications. Each states its owner, who can access it and the rules for its use.",
    example: "population_health_needs_base",
    materialized: "table",
    exampleMaterialized: "view",
    database: "PUBLISHED_REPORTING__DIRECT_CARE.OLIDS_POP_HEALTH_NEEDS",
    color: "var(--layer-published)",
  },
];

/** descriptions used by the layer-sorter quiz */
export const SORTER_ITEMS: { text: string; layer: string; reason: string }[] = [
  {
    text: "Defines when a pathway is open and its state at each weekly snapshot",
    layer: "modelling",
    reason:
      "Open-pathway state is shared domain meaning, so later counts and products should all inherit one definition.",
  },
  {
    text: "Exposes \"UNIQUE SUBMISSION ID\" as unique_submission_id without changing a row",
    layer: "raw",
    reason:
      "A raw model keeps what the source supplied, row for row, and only makes its physical column names readable.",
  },
  {
    text: "Provides one documented row per person with current demographics",
    layer: "reporting",
    reason:
      "One row per person makes it a person-grain mart. It turns a business-defined concept into one table that's easy for analysts to query.",
  },
  {
    text: "Interprets the feed's text date as a date and gives its person identifier the project name",
    layer: "staging",
    reason:
      "Parsing a date and renaming an identifier are universal preparations that any use of this source should inherit. They don't decide what a waiting pathway means.",
  },
  {
    text: "Provides the exact table queried by the monthly waiting-times dashboard",
    layer: "published",
    reason:
      "A dashboard queries it directly, so it's the stable interface for a named product. Its ownership, access and any rules for that product belong with it.",
  },
];
