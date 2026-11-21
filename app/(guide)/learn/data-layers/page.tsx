import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { LayerCake } from "@/components/LayerCake";
import { LayerSorter } from "@/components/LayerSorter";
import { LessonQuote } from "@/components/LessonQuote";

export const metadata: Metadata = { title: "Data layers" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="data-layers"
      kicker="Learn 07"
      title="Data layers"
      lede="Data layers group models by the job they do, so each kind of decision has one home. Raw keeps the source evidence. Staging prepares each source the same way for everyone. Modelling builds reusable pieces. Reporting offers business-ready marts, and published serves governed datasets to named products."
      minutes={24}
    >
      <h2>Shared models settle each source question once</h2>
      <p>
        Source data leaves a lot of questions open, and a shared model can
        answer each one once for everyone who uses it. Open a source table and you can assume almost nothing. A column that
        looks like a date might be text. Two rows might be separate events,
        duplicate submissions or two versions of the same event. A provider code
        names an organisation, but maybe not the one that owns the pathway
        today. Even &quot;person&quot; can mean one feed&apos;s own identifier
        in one source and a project-wide identity in another.
      </p>
      <p>
        An analyst can settle all of that inside one query. The trouble is that
        the next analyst has to settle it again, and may make a different choice
        that&apos;s just as plausible. A shared project settles each decision
        once, tests it, and lets everything above it use the answer. The layers
        help us decide which model should own each kind of decision.
      </p>
      <p>
        Layers describe responsibilities. They aren&apos;t an order you have to
        work in. You might start by querying a reporting model, find that a
        shared concept is missing, add it in modelling, and never create a
        published output at all. What matters is the job of the model
        you&apos;re changing and who will use it. Work at whichever layer the
        task needs.
      </p>

      <LayerCake />

      <p>
        Raw and staging models stay close to the source&apos;s files, columns
        and codes. Later models express the concepts analysts need, such as
        pathways, appointments and registers. Published models apply what one
        consumer needs.
      </p>
      <LessonQuote
        attribution="dbt Labs, the company behind dbt"
        work="How we structure our dbt projects"
        href="https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview"
      >
        One foundational principle that applies to all dbt projects though, is
        the need to establish a cohesive arc moving data from source-conformed
        to business-conformed. Source-conformed data is shaped by external
        systems out of our control, while business-conformed data is shaped by
        the needs, concepts, and definitions we create.
      </LessonQuote>

      <h2>Follow the waiting-list feed through each layer</h2>
      <p>
        The waiting-list feed shows what each layer does to one source, from
        the submitted record to a dataset for a named product. The first
        request might be &quot;how many people are currently waiting at each
        provider?&quot; The project should model the lasting domain behind that
        first output too, so the next questions are answerable. That means
        a submitted pathway record, a pathway&apos;s state at a snapshot, a
        provider, a person and the time spent waiting.
      </p>

      <h3>Raw preserves the source evidence</h3>
      <p>
        <em>
          A raw model gives you a faithful, readable record of what the source
          supplied.
        </em>
      </p>
      <p>
        The waiting-list feed arrives in tables the source owns. Raw models
        expose every row and value without deciding what any of it means. They
        rename the physical columns to readable <code>snake_case</code> names,
        and that&apos;s all. No casts, filters, deduplication or joins.
      </p>
      <CodeBlock
        lang="sql"
        title="raw_wl_wl_openpathways_data · simplified"
        code={`
select
    "Pseudo NHS_NUMBER" as pseudo_nhs_number,
    "Week_Ending_Date" as week_ending_date,
    "REFERRAL_TO_TREATMENT_PERIOD_START_DATE"
        as referral_to_treatment_period_start_date
from {{ source('wl', 'WL_OpenPathways_Data') }}
`}
      />
      <p>
        Scripts generate these models.{" "}
        <strong>You never write or edit a raw model by hand.</strong> That rule
        gives you a fixed point to compare against. If a row exists in the
        source, it exists here. If it doesn&apos;t, no project logic invented
        it. When a number further up looks suspicious, raw answers the first
        question to ask, which is what evidence we actually received.
      </p>

      <h3>Staging prepares one source for downstream use</h3>
      <p>
        <em>
          A staging model turns each source table into one consistently named,
          typed object that downstream models can build on.
        </em>
      </p>
      <p>
        Source systems rarely arrive ready to join. Identifiers have names only
        one feed uses, dates come in awkward forms, and resubmission mechanics
        hide in columns that only make sense if you know the feed. Staging
        applies the preparation every use of that source needs: project names,
        useful types, consistent nulls and fixes for known delivery quirks. It
        should normally keep the source&apos;s entity and grain.
      </p>
      <CodeBlock
        lang="sql"
        title="stg_wl_openpathways_data · simplified"
        code={`select
    -- census date: the previous Sunday, or the date itself if it is one
    case
        when dayofweekiso(week_ending_date) = 7 then week_ending_date
        else dateadd('day', -dayofweek(week_ending_date), week_ending_date)
    end as week_ending_date,
    {{ consistent_sk_patient_id_format('pseudo_nhs_number') }} as sk_patient_id,
    patient_pathway_identifier,
    organisation_identifier_code_of_provider as provider_code,
    activity_treatment_function_code as treatment_function_code,
    referral_to_treatment_period_start_date
from {{ ref('raw_wl_wl_openpathways_data') }}
where referral_to_treatment_period_end_date is null`}
      />
      <p>
        Each line settles something every user of the feed needs settled the
        same way. The <code>case</code> expression moves each supplied date to a
        Sunday census date, the previous Sunday unless it already is one. All
        readers then count the same census week. The macro gives{" "}
        <code>sk_patient_id</code> one format across all commissioning feeds.
        The renames give provider and treatment function their project names.
        The <code>where</code> clause drops pathways that have an end date.
      </p>
      <p>
        The real model also picks the latest resubmission of each record, and it
        does that before it drops closed pathways. The order matters. Filtering
        first could change which resubmission counts as the latest. All uses of
        the feed need the same answer about which resubmission replaces which,
        so staging settles it once.
      </p>
      <p>
        So staging stays close to one source object. Normally that&apos;s one
        staging model per source table, and one row per source entity at the
        source&apos;s grain. A staging change has to pass two tests. It must be{" "}
        <strong>universal</strong>, meaning every reasonable use of the source
        wants it. And it mustn&apos;t throw away a legitimate source record, or
        swap the source entity for a new business concept. Inferring a person,
        building a spell, deciding whether a pathway is open now and building a
        clinical register all belong further downstream.
      </p>
      <p>
        Staging can still enforce a rule the source has declared. The
        open-pathways feed is meant to contain only open pathways, so dropping a
        row with an end date makes the source trustworthy for its readers.
        Every downstream use should inherit that fix, so it passes the universal
        test. Reading a general pathway history and deciding which records the
        organisation counts as open is different work, and it belongs
        downstream.
      </p>
      <p>
        Staging should normally have no joins. A join is fine when its only
        purpose is cleaning, standardising or enriching data in a way every
        consumer of the source should inherit. Joining to a business population,
        or adding enrichment only one consumer wants, fails the universal test
        and belongs downstream.
      </p>

      <Callout kind="info" title="Where raw and staging build">
        <p>
          Both layers build in the <code>STAGING</code> database. All raw
          models go into a single <code>DBT_RAW</code> schema. Staging models
          go into a schema named after their source folder, such as{" "}
          <code>CSDS</code>, <code>OLIDS</code> or <code>REFERENCE</code>.
          Development uses the same layout in <code>DEV__STAGING</code>.
        </p>
      </Callout>

      <h3>Modelling prepares components for analysis</h3>
      <p>
        <em>
          An intermediate model prepares data or applies a shared rule for
          marts to build on, such as one definition of waiting time at each
          snapshot.
        </em>
      </p>
      <p>
        Staging has made the waiting-list feed readable, but it hasn&apos;t said
        what a pathway <em>is</em>. It hasn&apos;t decided whether successive
        submissions describe one continuing pathway, which snapshot counts as
        current, which provider relationship matters or how to measure waiting
        time at a snapshot. Those are claims about the domain, and they need to
        hold whether the next request is a provider count, a long-wait cohort,
        a patient-level view or a trend over time.
      </p>
      <CodeBlock
        lang="sql"
        title="illustrative intermediate model"
        code={`
with latest_received_snapshot as (
    select max(week_ending_date) as snapshot_date
    from {{ ref('stg_wl_openpathways_data') }}
)

select
    sk_patient_id,
    patient_pathway_identifier as pathway_id,
    week_ending_date as snapshot_date,
    provider_code,
    treatment_function_code,

    -- one shared definition of elapsed waiting time at this snapshot
    datediff('day',
        referral_to_treatment_period_start_date,
        week_ending_date) as days_waiting_at_snapshot
from {{ ref('stg_wl_openpathways_data') }}
inner join latest_received_snapshot
    on week_ending_date = snapshot_date
`}
      />
      <p>
        The <code>with</code> block names a temporary query result, called a
        common table expression or CTE. This one finds the latest week-ending
        date. The main query joins to that single date, which keeps only the
        rows from that snapshot. The CTE only exists inside this query. It
        isn&apos;t a separate dbt model.
      </p>
      <p>
        The latest date doesn&apos;t prove the snapshot is whole. If the agreed
        meaning of current needs every expected provider to have submitted, you
        have to check that coverage too. This example shows the selection and
        leaves the coverage check out.
      </p>
      <p>
        The rows now make claims in the organisation&apos;s own vocabulary. Each
        one belongs to the latest snapshot we received, identifies a pathway,
        and says how long that pathway had been waiting at that point. Staging has already
        guaranteed the input holds open pathways only, so modelling adds
        reusable domain meaning on top and doesn&apos;t recheck that source
        rule.
      </p>
      <p>
        A model belongs in this layer because of its role. It&apos;s a component
        built for other dbt models to use, not the supported starting point for
        analysis. The <code>int_</code> prefix just records that role. An
        intermediate model can carry heavy domain logic, change grain and
        produce rows you could count. A coherent piece of complex logic can earn
        its own model for readability and testing, even if only one mart uses it
        today. The <Link href="/learn/model-design">model-design lesson</Link>{" "}
        develops this idea.
      </p>

      <h3>Reporting provides the marts analysts work from</h3>
      <p>
        <em>
          A mart is a supported business entity or concept, at a documented
          grain, that people can analyse directly.
        </em>
      </p>
      <p>
        This is our version of what dbt calls the{" "}
        <a href="https://docs.getdbt.com/best-practices/how-we-structure/4-marts">
          marts layer
        </a>
        . dbt also calls it the <em>entity layer</em> or <em>concept layer</em>,
        because each mart represents one business-defined thing at its own
        grain. A mart might centre on a person, pathway, provider, appointment
        or clinical register. Ask &quot;what does one row represent?&quot;
        before you ask which chart needs it.
      </p>
      <p>
        One domain can support several marts.{" "}
        <code>fct_person_wl_current_count_total</code> gives a count per person.{" "}
        <code>fct_provider_wl_current_count_total</code> gives a count per
        provider. A pathway-level model keeps the detail. Each output has its
        own grain and purpose, and they all reuse the same pathway definition.
      </p>
      <table>
        <thead>
          <tr>
            <th>Illustrative pathway rows</th>
            <th>Person</th>
            <th>Provider</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pathway 1</td>
            <td>P1</td>
            <td>Provider A</td>
          </tr>
          <tr>
            <td>Pathway 2</td>
            <td>P1</td>
            <td>Provider A</td>
          </tr>
          <tr>
            <td>Pathway 3</td>
            <td>P2</td>
            <td>Provider A</td>
          </tr>
        </tbody>
      </table>
      <p>
        In these made-up rows, Provider A has three pathways and two people. A
        person summary has two rows, P1 with two pathways and P2 with one. A
        provider summary has one row. The input is the same for both. The grain
        and the measure you pick decide what each output means.
      </p>
      <p>
        Marts usually carry the context analysts need about their core concept. A person mart might include current practice, geography and
        recent activity. A provider mart might include organisation names and
        pathway measures. That deliberate width is called denormalisation. The
        project does the joins once, so nobody has to rebuild them worksheet by
        worksheet. However many concepts it borrows attributes and summaries
        from, the mart keeps one clear core grain.
      </p>
      <p>
        Reporting can also finish defining a core concept. The diabetes
        register is a business-ready clinical fact in its own right, and its
        final inclusion rule lives in the mart. Modelling isn&apos;t the only
        place meaning is allowed. Its job is to give supporting transformations
        clear responsibilities, to isolate logic that&apos;s complex or changes
        on its own, and to make reusable steps available to more than one mart.
        That keeps the mart&apos;s SQL readable without pretending the mart has
        no business rules of its own.
      </p>
      <p>
        This layer holds five model families: <code>dim_</code> for dimensions,{" "}
        <code>fct_</code> for facts, <code>pit_</code> for point-in-time models,{" "}
        <code>obt_</code> for wide analytical tables and <code>dq_</code> for
        data-quality outputs. A wide model such as{" "}
        <code>dim_person_demographics</code> can bring gender, ethnicity,
        geography and practice into one person row without redefining any of
        them. The{" "}
        <Link href="/learn/model-naming">model taxonomy lesson</Link> explains
        how those families turn the project into a map you can search.
      </p>

      <Callout
        kind="tip"
        title="A mart serves many uses. A product dataset serves one."
      >
        <p>
          A reporting mart is a supported interface for broad analysis of a
          business entity or concept. Analysts can query it directly.
          Dashboards, extracts and operational products should normally read
          from published models, which apply their final shape and controls.
          Several products can build on the same mart without redefining its
          grain or its shared meaning.
        </p>
      </Callout>

      <h3>Published serves named data products</h3>
      <p>
        <em>
          A published model is a governed dataset built for one named report,
          dashboard, extract or application.
        </em>
      </p>
      <p>
        Reporting marts are reusable. When a table or view exists to power the
        monthly waiting-times dashboard, a statutory return, an application or a
        named extract, it&apos;s a published data product. It picks the
        product&apos;s columns, labels, refresh schedule and population from the
        marts below, and leaves those marts free for other questions.
      </p>
      <p>
        A published model doesn&apos;t need a special legal filter to belong
        here. What defines it is that a named consumer depends on it. The layer
        makes that dependency visible, gives the product a stable interface, and
        gives the team one place to manage ownership, grants and Snowflake tags.
      </p>
      <p>
        Some products also carry controls tied to their purpose. The project
        keeps <code>direct_care/</code> and <code>secondary_use/</code> outputs
        apart. Where an approved product needs it,{" "}
        <code>dim_person_secondary_use_allowed</code> supplies the allowed
        population. Apply the controls agreed for the product and its sources.
        Don&apos;t infer them from a label on the source family. A filter like
        this changes the product&apos;s population without redefining the person
        or pathway for other uses.
      </p>
      <p>
        Not every population rule belongs here. &quot;Open pathway&quot; is
        shared domain meaning, so it lives further down. A reusable clinical
        cohort can be a shared fact too. Published is for whatever becomes true
        only because of the consumer: legal basis, disclosure control,
        contractual scope, product ownership or naming for one audience.
      </p>

      <Callout kind="info" title="There is a sixth layer">
        <p>
          <code>models/semantic/</code> holds Snowflake semantic views, which
          use the <code>sem_</code> prefix. They define facts, dimensions and
          metrics, so downstream query tools share one agreed definition of the
          data. They build into <code>REPORTING.SEMANTIC</code>. The{" "}
          <Link href="/advanced/semantic-views">semantic views lesson</Link>{" "}
          covers them. They follow the same <code>ref()</code> rules.
        </p>
      </Callout>

      <Callout kind="info" title="Supporting model areas">
        <p>
          <code>models/reference/</code> holds project-owned lookups and derived
          reference data that several domains share.{" "}
          <code>models/partner/</code> holds governed partner datasets and
          access mappings. <code>models/stat_models/</code> holds statistical
          and risk models, such as the <code>EFI2</code> and{" "}
          <code>qadmissions</code> folders, and builds into its own{" "}
          <code>STAT_MODELS</code> database. These areas follow the same
          raw-through-staging boundary. They&apos;re scopes of ownership, not
          extra rungs on a ladder.
        </p>
      </Callout>

      <h2>A transformation&apos;s purpose decides its layer</h2>
      <p>
        A transformation belongs in the layer that matches what it establishes
        and who should rely on the result. The SQL operation doesn&apos;t tell
        you, because the same operation can settle very different questions. Rules of
        thumb like &quot;joins go in modelling&quot; or &quot;filters go in
        published&quot; break down almost at once. One join might attach a
        source lookup, establish a shared clinical relationship, assemble a
        convenient person row or apply a secondary-use permission rule.
        That&apos;s four responsibilities with four different homes.
      </p>
      <p>These four transformations show the difference.</p>
      <table>
        <thead>
          <tr>
            <th>Transformation</th>
            <th>What it means</th>
            <th>Likely layer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Keep the latest technical resubmission</td>
            <td>Every reader of the source sees the same record</td>
            <td>Staging</td>
          </tr>
          <tr>
            <td>
              Select the latest waiting-list snapshot every provider has
              submitted
            </td>
            <td>Analyses share one definition of current state</td>
            <td>Modelling</td>
          </tr>
          <tr>
            <td>Summarise open pathways to one row per provider</td>
            <td>A provider-grain mart for broad analysis</td>
            <td>Reporting</td>
          </tr>
          <tr>
            <td>
              Shape the provider mart for the monthly waiting-times dashboard
            </td>
            <td>The named data product gets a stable dataset</td>
            <td>Published</td>
          </tr>
        </tbody>
      </table>
      <p>
        All four might use a <code>where</code>, a join or a{" "}
        <code>qualify</code>, which is Snowflake&apos;s filter on
        window-function results. They sit in different layers because they do
        different jobs for different consumers: preparing the whole source,
        reusable modelling, direct analysis or one named product.
      </p>

      <h2>Later layers reuse the definitions below them</h2>
      <p>
        A later layer can filter, summarise or add to the rows it reads, and it
        reuses the definitions it inherits instead of redefining them. Reporting
        can present an open pathway at person or provider grain, using the same
        status codes for &quot;open&quot; as the layers below. A published
        output can exclude people who opted out. How their waiting time was
        calculated stays as modelling defined it.
      </p>
      <CodeBlock
        lang="text"
        title="each boundary lets the next reader assume more"
        code={[
          "raw        source evidence, as supplied",
          "  ↓",
          "staging    source records, cleaned and standardised once for everyone",
          "  ↓",
          "modelling  shared domain events, states and relationships",
          "  ↓",
          "reporting  business-ready marts at explicit grains",
          "  ↓",
          "published  governed products for named uses",
        ].join("\n")}
      />
      <p>
        That&apos;s why lineage is useful in both directions. Reading up, ask
        what new claim this model makes. Reading down, ask which assumptions
        this model is entitled to inherit. A surprising answer either way often
        points to a definition in the wrong place.
      </p>

      <Callout kind="smell" title="A dashboard question reaches too far down">
        <p>
          A published waiting-list model reads the raw feed, picks the latest
          submission, interprets statuses, calculates waiting time and applies
          opt-out filtering, all in one file. The final number might be right.
          But source preparation, domain meaning and audience policy are now
          trapped inside one product, and the next product has to rediscover all
          three.
        </p>
      </Callout>

      <h2>Each layer has its own folder and Snowflake database</h2>
      <p>
        Each layer has a folder under <code>models/</code>, and project
        configuration uses the folder path to set where a model builds in
        Snowflake and how it materialises. The folders make the boundaries
        visible. They aren&apos;t the reason the boundaries exist.
      </p>
      <CodeBlock
        lang="text"
        title="models/ · one folder per scope of meaning"
        code={`
models/
├── raw/          source evidence preserved; generated, never hand-edited
├── staging/      universal cleaning and standardisation applied per source
├── reference/    project-owned lookups and derived shared reference data
├── modelling/    purposeful transformations that prepare data for marts
├── reporting/    supported, business-ready marts at explicit grains
├── stat_models/  statistical and risk models built on the shared layers
├── published/    named data products served and governed
├── partner/      governed partner datasets and access mappings
└── semantic/     agreed metrics exposed to downstream query tools
`}
      />
      <Callout kind="tip" title="The folder path sets the schema">
        <p>
          The folder path decides the Snowflake schema. In the OLIDS domain the
          schema joins the domain and subfolder, so{" "}
          <code>models/modelling/olids/diagnoses/</code> builds into{" "}
          <code>MODELLING.OLIDS_DIAGNOSES</code>. In most other domains the
          domain folder alone names the schema, so{" "}
          <code>models/modelling/acute/</code> builds into{" "}
          <code>MODELLING.ACUTE</code>. The project&apos;s{" "}
          <code>generate_schema_name</code> macro sets these rules, so check it
          before you add a folder.
        </p>
      </Callout>
      <p>
        Snowflake mirrors the same journey at database level. Source data lands
        in the data-lake databases, and each layer above builds into a database
        named after it:
      </p>
      <CodeBlock
        lang="text"
        title="the layers, as Snowflake databases"
        code={`
DATA_LAKE / DATA_LAKE__NCL          source data lands here (shared)
STAGING                             raw (DBT_RAW schema) and staging models
REFERENCE                           shared project-owned reference models
MODELLING                           int_ building blocks
REPORTING                           dim_ / fct_ / obt_ marts
STAT_MODELS                         statistical and risk models
PUBLISHED_REPORTING__DIRECT_CARE    published products,
PUBLISHED_REPORTING__SECONDARY_USE    split by legal basis
PUBLISHED_REPORTING__PARTNER        governed partner datasets
`}
      />
      <p>
        Development uses matching databases such as <code>DEV__STAGING</code>{" "}
        and <code>DEV__MODELLING</code>. The data lake has no development copy.
        In development you read real source data where it sits, and your models
        write to the <code>DEV__</code> databases. Seeds don&apos;t. They load
        to <code>DATA_LAKE__NCL.DBT_SEEDS</code> in every environment. The
        database in a query&apos;s FROM clause tells you the environment, but
        not always the layer. Raw and staging models share <code>STAGING</code>,
        so use the schema, the model prefix or the repository folder to tell
        them apart.
      </p>

      <h2>SLAM staging handles changing layouts and restated months</h2>
      <p>
        SLAM staging reads provider files whose layout changes and picks the
        current statement for each month. Providers send SLAM contract-monitoring files that vary by provider,
        month and revision, and each submission can restate earlier months. The
        upstream pipeline rebuilds their changing layouts in{" "}
        <code>DATA_LAKE.SDL</code>. Models under{" "}
        <code>models/staging/commissioning/slam/</code> then parse the provider
        text and record which file and period each row came from. Their
        current-statement views end in <code>_latest</code> and pick one
        statement for each provider, financial year and month.
      </p>
      <p>
        That&apos;s more work than most staging models do, but it&apos;s still
        source-conformed. Every consumer needs the same reading of the file
        layout, the supplied values and the cumulative submission history. The
        base tables keep every submission. Each file restates the year to date,
        so summing across submissions double-counts. Current reporting should
        use the <code>_latest</code> views.
      </p>

      <h2>Work through close calls about where a rule belongs</h2>
      <p>
        When a rule could sensibly live in more than one layer, work out which
        question it answers and who should inherit it. &quot;Current&quot;
        could mean the latest
        snapshot received, the latest snapshot every provider has submitted, or
        the state on a reporting date you supply. You can&apos;t tell which from
        the word or from a prefix. Work through the concept:
      </p>
      <ol>
        <li>
          <strong>Name the ambiguity.</strong> Is this about reading the feed,
          defining the domain, choosing an analytical grain or serving a use?
        </li>
        <li>
          <strong>Set the scope.</strong> Should every source reader, every
          organisational analysis or only this product inherit the decision?
        </li>
        <li>
          <strong>Pin down the grain and time.</strong> What does one row represent,
          and as of when is the claim true?
        </li>
        <li>
          <strong>Check another use.</strong> If the dashboard, geography or
          audience changed, should this definition stay the same?
        </li>
        <li>
          <strong>State what readers can rely on.</strong> What can downstream
          readers safely stop thinking about after this model?
        </li>
      </ol>
      <p>
        If the answers pull different ways, the transformation may be doing two
        jobs and deserve two models. The layers won&apos;t remove the need for
        judgement. They give that judgement a shared vocabulary and make its
        consequences visible.
      </p>

      <h2>Practise choosing a layer by what the model does</h2>
      <p>
        For each description, ignore whether it uses a cast, join, filter or
        aggregation. Ask which ambiguity it settles and who should inherit the
        answer.
      </p>
      <LayerSorter />
    </LessonShell>
  );
}
