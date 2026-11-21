import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Quiz } from "@/components/Quiz";
import { Callout } from "@/components/Callout";
import { LessonQuote } from "@/components/LessonQuote";
import { MartShapeCompare } from "@/components/MartShapeCompare";

export const metadata: Metadata = { title: "Designing models" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="model-design"
      kicker="Learn 10"
      title="Designing models"
      lede="Designing a model means deciding what its rows represent and which model owns each rule behind them. Done well, each definition lives in one place you can change, and analysts get tables they can use without rebuilding the joins themselves."
      minutes={30}
    >
      <h2>Design decides which model owns each definition</h2>
      <p>
        Model design is deciding which model owns each definition, and what
        anyone using that model can rely on. When it&apos;s done well, three
        things are true. A reader can say what one row means. A developer can
        change one definition without reading unrelated SQL. An analyst gets
        data in a shape they can use straight away.
      </p>
      <p>
        Design comes after two other steps. You know what the request needs, and
        discovery has shown what the project already has. What&apos;s left is
        the gap. Here&apos;s a test worth running before you write anything. Can
        someone describe one person who should be in the population and one who
        shouldn&apos;t? If not, the population isn&apos;t ready to become SQL,
        and no amount of modelling will fix a definition nobody has agreed.
      </p>
      <p>
        Boundaries are a balancing act. Put everything in one model and the
        output is convenient, but one file now hides several jobs. Split out
        every expression and you get a deep DAG of fragments nobody wants to
        touch. Aim for a boundary around one coherent concept, one grain or one
        reason to change. Then let the mart pull those settled pieces together
        generously.
      </p>
      <p>
        If several models depend on a business definition, it needs one owner.
        Don&apos;t copy a maintained provider list, code set, threshold or date
        rule into each model&apos;s SQL. Shared data goes in a shared model that
        others join to. Reused SQL logic goes in a macro. A project variable is
        only for a value supplied per run or per environment. And if a value
        defines one model&apos;s concept, keep it in that model, even if it
        might change one day. Moving a local literal into its own DAG node adds
        a hop and buys you nothing.
      </p>

      <h3>Start from what the project is still missing</h3>
      <p>
        Before you add any files, write down the decision the existing models
        don&apos;t yet make. That might be a new time window, a clinical measure
        nobody has built yet, or the way a product combines models that already
        exist.
      </p>
      <p>
        Say a waiting-list dashboard needs a new provider summary, and the
        project already has good pathway records. Leave the pathway definition
        alone so other work can keep using it, and give the summary its own
        stated grain. You don&apos;t have to predict every future report. You do
        have to stop the first report&apos;s filters leaking into a model that
        everyone else treats as the shared definition.
      </p>

      <h2>A reusable model documents what you can rely on</h2>
      <p>
        A model&apos;s contract is what its documentation promises about its
        rows. It says which records can appear, when each claim holds, and what
        happens when you join the model to something else. Someone using a
        model shouldn&apos;t need to read every line of its SQL to understand
        it, and a recognisable name won&apos;t get them there.
      </p>
      <LessonQuote
        attribution="Fred Brooks"
        work="The Mythical Man-Month"
        href="https://en.wikipedia.org/wiki/The_Mythical_Man-Month"
      >
        Show me your flowcharts and conceal your tables, and I shall continue to
        be mystified. Show me your tables, and I won&apos;t usually need your
        flowcharts; they&apos;ll be obvious.
      </LessonQuote>
      <p>
        Brooks was writing about programs in 1975, and it holds for a dbt
        project. Swap &quot;flowcharts&quot; for &quot;SQL&quot;. If a
        model&apos;s contract is clear, most people never need to open the SQL.
      </p>

      <h3 id="population-time-and-grain-define-one-row">
        Say what one row is, who qualifies and as of when
      </h3>
      <p>
        Before you write a new model, answer three questions. One row per what?
        Which records qualify? As of when? Those answers are its grain,
        population and time basis. The{" "}
        <Link href="/learn/analytical-tables">foundations chapter</Link> covers
        grain and join multiplicity, and this is where you put them to work.
      </p>
      <p>
        Take an asthma measure. &quot;One row per person&quot; is only the
        start. Is that every registered person, or only people on the register?
        Is prescribing assessed over the last year, or over a fixed reporting
        period? Can someone with missing evidence appear? Each answer gives you
        a different population, and every version would pass a uniqueness test
        on the person key.
      </p>

      <h3>Say which point in time the rows describe</h3>
      <p>
        A model&apos;s rows describe the present, a history, or a reference
        date you give it, and grain doesn&apos;t tell you which. Two models can
        both hold one row per person and still answer different questions, because they say different
        things about time. A current-state model describes what&apos;s true when
        the project runs. A historical model records how something changed. A
        point-in-time model rebuilds what was true, or known, on a reference
        date you give it.
      </p>
      <table>
        <thead>
          <tr>
            <th>Time basis</th>
            <th>What one row means</th>
            <th>Typical use</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Current</td>
            <td>The latest valid state for an entity at build time</td>
            <td>Operational lists and current population views</td>
          </tr>
          <tr>
            <td>Historical</td>
            <td>A state, event or relationship during a recorded interval</td>
            <td>Change over time and audit</td>
          </tr>
          <tr>
            <td>Point in time</td>
            <td>The result for an entity at a declared reference date</td>
            <td>Cohort comparison and reproducible reporting periods</td>
          </tr>
        </tbody>
      </table>
      <p>
        Population health trips over this all the time. Someone&apos;s current
        practice may not be the practice responsible for them at the end of the
        reporting period. Their age today isn&apos;t their age when a criterion
        was assessed. If a result is meant to reproduce what was known last
        March, a diagnosis first recorded next month has no business being in
        it. A retrospective clinical view might deliberately use later-recorded
        evidence about earlier events, and that&apos;s fine. Just say which one
        your model is.
      </p>
      <p>
        <code>dim_person_current_practice</code> makes a deliberately current
        claim. Use it when today&apos;s practice relationship is what you need.
        The <code>pit_*_register</code> family promises something else: register
        membership evaluated at a point in time you supply. The prefix is a
        warning as much as a name. It tells you that dates, eligibility and
        evidence all have to be read against the same reference date.
      </p>
      <p>
        A date column doesn&apos;t make a model point-in-time correct. Every
        time-dependent input has to be evaluated at the reference date. Stamp a{" "}
        <code>snapshot_date</code> on today&apos;s register and you&apos;ve
        labelled the rows. You haven&apos;t recreated the historical population.
      </p>

      <h3>Document how many rows a join can match</h3>
      <p>
        Cardinality is how many rows on one side of a join can match a row on
        the other. Grain describes one table. Cardinality describes what
        happens when that table meets another, so it belongs in the contract
        too. One
        person can have many observations, medication orders and registrations.
        One practice has many people. Some relationships only become one-to-one
        after a rule picks the current, latest or preferred record.
      </p>
      <p>
        You can safely join a selected ethnicity into a person-grain mart,
        because its model guarantees one result per person. You can&apos;t do
        that with raw observations. They need selecting or summarising first. A
        registration history needs a choice about time as well as a key, since
        several practices can be correct for the same person at different dates.
        Many-to-many relationships, like people who belong to several clinically
        defined populations, are often clearest left at their natural
        relationship grain.
      </p>
      <p>
        Sometimes the relationship is the domain concept. Register membership
        links a person to a clinically defined population. A registration
        history links a person to an organisation over an effective interval.
        Flatten either into a person model too early and you lose dates, force
        arbitrary choices, or make several relationships that are valid at once
        look like a single attribute.
      </p>
      <p>
        That&apos;s why a join that looks simple deserves a second look. If the
        right-hand model isn&apos;t unique on the join key, the join changes the
        left-hand grain. Sometimes that&apos;s what you want, because the result
        is meant to sit at relationship grain. If the model still claims one row
        per person, it&apos;s a bug.
      </p>
      <p>
        Document important relationships next to the inputs, and test the
        uniqueness that makes them safe. The model&apos;s row contract depends
        on those assumptions holding when something upstream changes.
      </p>

      <h2>Define each concept once, then combine concepts in marts</h2>
      <p>
        Put each definition in one model, then join the results into the marts
        analysts use. A well-described component can still be a pain to use. If
        every analyst has to rediscover the right models and rebuild the same
        joins, the project hasn&apos;t removed any complexity. It has handed it
        to them.
      </p>

      <h3>Definition and delivery are different responsibilities</h3>
      <p>
        A model can be wide and convenient without becoming the place where
        every concept in it is defined. Two jobs are in play:
      </p>
      <ul>
        <li>
          <strong>Definition.</strong> The rule that decides what a concept
          means, and the tests that protect it.
        </li>
        <li>
          <strong>Delivery.</strong> Putting established concepts together into
          a shape analysts can use.
        </li>
      </ul>

      <p>
        The rule underneath this whole chapter is to{" "}
        <strong>
          define concepts independently and compose them generously
        </strong>
        . A wide model can deliver lots of concepts while reusing their
        definitions from upstream.
      </p>

      <p>
        <code>obt_person_activity</code> works this way. It gives one row per{" "}
        <code>sk_patient_id</code> covering recent A&amp;E, admitted patient,
        outpatient and GP activity. Each dataset is summarised first, in a model
        that owns that dataset&apos;s rules:
      </p>
      <CodeBlock
        lang="sql"
        title="obt_person_activity, simplified"
        code={`select
    person.sk_patient_id,
    ae.ae_tot_12mo,
    apc.apc_12mo,
    op.op_att_tot_12mo,
    gp.gp_app_tot_12mo
from {{ ref('dim_person_demographics_basic') }} as person
left join {{ ref('fct_person_sus_uec_recent') }} as ae
    using (sk_patient_id)
left join {{ ref('fct_person_sus_apc_recent') }} as apc
    using (sk_patient_id)
left join {{ ref('fct_person_sus_op_recent') }} as op
    using (sk_patient_id)
left join {{ ref('fct_person_gp_recent') }} as gp
    using (sk_patient_id)`}
      />
      <p>
        The wide model owns the composition and its person grain, and nothing
        else. It doesn&apos;t redefine an A&amp;E attendance, an admission or a
        GP appointment. Each of those definitions can change, and be tested, on
        its own.
      </p>

      <h3>Build each mart around one core concept</h3>
      <p>
        Reporting models are marts. Each one is a business-defined entity or
        concept at a documented grain, and it should carry the context analysts
        usually need about that concept.
      </p>
      <p>
        <code>dim_person_demographics</code> is one current row per person. It
        includes age, gender, ethnicity, language, practice, geography and
        deprivation, because people analyse those together all the time. Doing
        those joins once, in the project, beats asking every analyst to rebuild
        them and hoping they all do it the same way.
      </p>
      <p>
        The width works here for two reasons. The extra columns keep the core
        grain intact, and people use them together. The derivations live where
        they&apos;re owned. The mart presents ethnicity and practice, but the
        rules that produce them stay in their own reusable models.
      </p>
      <p>
        Coded categories follow the same idea. Keep the code when it helps with
        traceability, filtering or joins, but don&apos;t make analysts look up
        what it means. An analyst-facing mart should carry the authoritative
        label too, from the source or from a shared reference model. A narrow
        modelling block can keep only the code if a downstream mart adds the
        label. If no authoritative description exists, don&apos;t invent one,
        and don&apos;t bury a maintained mapping in a local <code>case</code>{" "}
        expression.
      </p>

      <h2>Facts, dimensions and the reporting taxonomy</h2>
      <p>
        The <code>fct_</code> and <code>dim_</code> prefixes separate models
        that establish what you&apos;re analysing from models that describe it.
        The terms come from Kimball&apos;s dimensional modelling. Population
        health stretches them past the classic transaction fact, but the roles
        still hold.
      </p>

      <h3>Who int_, fct_ and dim_ models are for</h3>
      <p>
        An <code>int_</code> model prepares data for other dbt models to use. A{" "}
        <code>fct_</code> or <code>dim_</code> model is a reporting mart that
        analysts can query directly, with a documented population, time and
        grain. None of the three prefixes describes a physical shape.
      </p>

      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>
              <code>int_</code>
            </th>
            <th>
              <code>fct_</code> / <code>dim_</code>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Primary purpose</td>
            <td>Prepare or reshape data, or isolate a coherent concern</td>
            <td>Offer a supported, business-ready subject for analysis</td>
          </tr>
          <tr>
            <td>Typical consumers</td>
            <td>Other dbt models</td>
            <td>Analysts and downstream reporting models</td>
          </tr>
          <tr>
            <td>Expected shape</td>
            <td>Whatever grain the modelling step requires</td>
            <td>A documented core entity or concept at a useful grain</td>
          </tr>
          <tr>
            <td>Expected context</td>
            <td>Enough to do its modelling job</td>
            <td>Enough to use the subject without rebuilding routine joins</td>
          </tr>
        </tbody>
      </table>

      <p>
        <code>int_hba1c_latest</code> holds one selected HbA1c result per
        person, which sounds a lot like a mart. It stays <code>int_</code>{" "}
        because its job is to feed registers and care-process models.{" "}
        <code>fct_person_diabetes_register</code> is different. It publishes
        register membership as the thing analysts count, validate and break
        down.
      </p>

      <Callout kind="tip" title="Two decisions, in order">
        <p>
          First decide whether it&apos;s a modelling block or a business-ready
          mart. If it&apos;s a mart, ask one more question. Does it establish
          the subject being measured? That&apos;s <code>fct_</code>. Does it
          describe some other entity? That&apos;s <code>dim_</code>.
        </p>
      </Callout>

      <h3>Choose fct_ or dim_ by the model&apos;s main job</h3>
      <p>
        A model that records the subject of analysis is a fact. A model that
        describes it is a dimension. The{" "}
        <Link href="/learn/analytical-tables#facts-record-the-subject-dimensions-provide-context">
          facts and dimensions example
        </Link>{" "}
        starts with appointments and moves on to clinical states. The same split
        applies here. The asthma register records membership, which is the
        subject of analysis. Ethnicity and practice describe the people in it.
        Name a model for its main job, even if some other analysis uses it
        differently.
      </p>

      <h3>Wide marts still use facts and dimensions</h3>
      <p>
        Kimball&apos;s roles apply to wide marts too. Each fact has a declared
        grain, shared dimensions give consistent context, and the relationships
        are documented and tested. What changes is the physical layout. dbt does
        the routine joins once, so consumers don&apos;t have to repeat them.
      </p>
      <LessonQuote
        attribution="Ralph Kimball"
        work="A Dimensional Modeling Manifesto"
        href="https://www.kimballgroup.com/1997/08/02/a-dimensional-modeling-manifesto/"
      >
        The dimensional model is the only viable technique for achieving both
        user understandability and high query performance in the face of
        ever-changing user questions.
      </LessonQuote>
      <p>
        &quot;Only viable technique&quot; is a strong claim, and Kimball was
        arguing against entity-relationship modelling in 1997. The two goals he
        names are still the right ones, though. Wide marts chase the same pair
        on a modern warehouse.
      </p>

      <MartShapeCompare />

      <p>
        Columnar storage makes repeated descriptive values fairly cheap.
        Repeated joins cost compute and can multiply rows. Doing the common
        joins in dbt keeps those decisions in reviewed code. Wide marts do
        repeat values and take more work to build, so each derivation needs one
        reusable home.
      </p>
      <p>
        <code>dim_person_ethnicity</code> can stay the one model that selects a
        person&apos;s ethnicity, while several marts carry its{" "}
        <code>ethnic_group</code> column. The value repeats. The rule that picks
        it doesn&apos;t.
      </p>
      <p>
        A semantic layer would move this responsibility. It can define joins and
        metrics centrally over more modular models. We don&apos;t use one at the
        moment, so our reporting marts carry routine context themselves. dbt
        covers both patterns in its{" "}
        <a href="https://docs.getdbt.com/best-practices/how-we-structure/4-marts">
          marts guidance
        </a>
        .
      </p>

      <h2>Draw model boundaries around one job</h2>
      <p>
        A boundary is where one model ends and the next begins. You can only
        reuse a definition with confidence if it has a recognisable
        home and can change without disturbing anything unrelated. So boundaries
        matter. That doesn&apos;t mean every calculation deserves its own node
        in the DAG.
      </p>

      <h3>Split logic that changes for different reasons</h3>
      <p>
        &quot;One model, one job&quot; doesn&apos;t mean one CTE or one
        calculation per model. A model can do several transformations if they
        all serve one coherent responsibility. The best test we know comes from
        software design:
      </p>
      <LessonQuote
        attribution="Robert C. Martin"
        work="The Single Responsibility Principle"
        href="https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html"
      >
        Gather together the things that change for the same reasons. Separate
        those things that change for different reasons.
      </LessonQuote>
      <p>
        The activity datasets in <code>obt_person_activity</code> change for
        different reasons. A&amp;E attendance shifts when valid-attendance rules
        or ECDS handling change. Emergency admissions depend on admission
        methods and spell construction. Outpatient activity has its own
        attendance and DNA handling. GP appointments come from another dataset
        with its own status vocabulary.
      </p>
      <p>
        Because those definitions sit in separate models, a change to spell
        construction doesn&apos;t mean rechecking A&amp;E or GP selection. The
        final activity model stays wide, because wide is what consumers want.
      </p>

      <h3>When to give a definition its own model</h3>
      <p>
        Pull a definition into its own model when it&apos;s reused, has its own
        grain, needs its own tests or changes independently. Keep calculations
        together when they implement one rule. Line count doesn&apos;t decide
        it. A long model doing one job is fine. A short one doing three
        isn&apos;t.
      </p>

      <h3>Keep maintained definitions shared</h3>
      <p>
        A code set is part of a clinical definition. Reference the
        project&apos;s managed code sets instead of copying codes into several
        models. A maintained provider mapping is the same. Then a change to that
        shared input gets reviewed once, and the DAG shows everything that
        depends on it.
      </p>
      <p>
        A local calculation is different. Converting a duration from days to
        weeks inside one model doesn&apos;t need a model of its own. Selecting
        the latest qualifying observation, used in several places, might,
        because it has its own grain and clinical rules.
      </p>

      <h2>Worked example: the models behind an asthma dashboard</h2>
      <p>
        This example designs the models behind an asthma dashboard so that its
        parts stay reusable after the dashboard ships. The dashboard will show people on the
        asthma register, recent asthma management, prescribing measures,
        demographic breakdowns and practice context. The{" "}
        <Link href="/learn/finding-models">Finding models</Link> lesson walks
        through this same scenario as a consumer looking for these models. Here
        we&apos;re looking at why they&apos;re built the way they are.
      </p>
      <p>
        You could write one query that reaches into clinical records, medication
        orders and registration data and returns exactly those columns. It might
        close the ticket. It would also make the dashboard responsible for every
        concept it happens to touch, and the next person who needs the asthma
        register would have to dig it out of a dashboard query.
      </p>
      <p>
        A better design starts by noticing that the dashboard makes several
        claims, each with its own reason to change. Register membership is a
        clinical fact. Medication activity is another clinical subject, with its
        own time windows and measures. Ethnicity and current practice describe
        the people in those facts. The dashboard is a product that puts those
        subjects together for one audience.
      </p>

      <h3>Intermediate models prepare the diagnosis and medication evidence</h3>
      <p>
        In the project, <code>int_asthma_diagnoses_all</code> finds asthma
        diagnosis and resolution evidence at observation grain.{" "}
        <code>int_asthma_medications_all</code> collects the asthma medication
        orders at order grain. You can count rows in both, but that doesn&apos;t
        make them facts in the reporting sense. Their job is to prepare reusable
        evidence inside the modelling layer, and their names and grains say so.
      </p>
      <p>
        This split also keeps the register SQL readable. The register
        doesn&apos;t have to contain all the mechanics of finding coded
        observations and medication orders. It can focus on the rule that
        defines membership: the age threshold, an active diagnosis and recent
        medication evidence. A reviewer can read the definition without first
        untangling the extraction logic.
      </p>

      <h3>The reporting fact defines register membership</h3>
      <p>
        <code>fct_person_asthma_register</code> finishes the register definition
        at one row per included person. It combines the prepared evidence,
        applies the inclusion criteria, and keeps the dates, codes and criterion
        flags that explain each result. That&apos;s reporting-layer work, and
        that&apos;s fine. The modelling layer isn&apos;t the only place meaning
        gets established. It handles the complex or reusable steps so the fact
        can state its central definition clearly.
      </p>
      <p>
        The <code>fct_</code> prefix describes the role of the result, not how
        early its rows became countable. Register membership is the subject
        being measured. A person&apos;s ethnicity or current practice gives
        context about people already on the register, so those models play a
        dimensional role.
      </p>

      <h3>The published model assembles the dashboard data</h3>
      <p>
        The published model brings together everything the dashboard needs, so
        the register doesn&apos;t have to. The dashboard may want SABA prescribing, other management measures, demographics and
        organisational fields. Bolt all of that onto the register and a reusable
        clinical fact now changes every time one product does.
      </p>
      <p>
        Instead, give any extra clinical subject its own business-ready
        reporting model at a declared grain first. A published model like{" "}
        <code>asthma_dashboard_base</code> then composes the register, the
        prescribing and management facts, and whichever dimensions the dashboard
        uses, in exactly the shape it needs. It owns the product&apos;s filters,
        audience policy, column names and final grain. The register stays
        reusable for other work, and the published model is free to change with
        the dashboard.
      </p>
      <p>
        What you end up with is a set of clearly defined building blocks.
        Another asthma question can combine the same register, prescribing
        measures, management facts and person dimensions differently, without
        first digging their logic out of a dashboard query. The work spent
        defining those concepts keeps paying off after the first product ships.
      </p>
      <p>
        A genuinely different question might need another time window, threshold
        or population rule. It can build that new concept from the underlying
        evidence model and leave the established register and measures alone.
        The difference is then out in the open and easy to review. The DAG shows
        the shared foundations and the exact point where the new definition
        branches off.
      </p>

      <h2>Stable shared models let products vary</h2>
      <p>
        The asthma example leaves two kinds of model behind. One kind is stable
        domain models that support many questions. The other is a published
        composition built for one product. Treat them as different interfaces,
        and shared meaning can improve deliberately while each product keeps
        responding to its own users and obligations.
      </p>

      <h3>Analysts rely on what a mart&apos;s rows and columns mean</h3>
      <p>
        Analysts and downstream models write queries that rely on a
        mart&apos;s name, population, time, grain and column meanings. Before
        you change a mart, check whether those queries would count or join rows
        differently afterwards. A mart is the interface those queries depend
        on. Treat it like one and changes get safer.
      </p>
      <p>
        Adding a descriptive column that keeps the existing grain is usually
        harmless. Changing one row per person to one row per person per month is
        not. Every count and join can behave differently, even though the old
        columns are all still there. Changing the definition of register
        membership is just as serious, because the rows now make a different
        clinical claim.
      </p>
      <p>
        If you need a new subject or time basis, a new model is usually
        clearer than quietly changing the old one. If the concept is unchanged
        and you&apos;re only delivering a new attribute, extending the existing
        mart is often simpler. Let the contract decide, not a general urge to
        create files or avoid them.
      </p>
      <p>
        Published models give you another useful boundary. They can change with
        a dashboard or extract while stable reporting facts keep serving other
        products. It works the other way too. Fix a shared clinical definition
        in its reporting fact, and let the fix flow to every product that
        depends on it. Good design shows you the blast radius before you touch
        the SQL.
      </p>

      <h3>Put each rule at the level that agreed it</h3>
      <p>
        Where a rule lives depends on who agreed it. That might be the whole
        organisation, one programme or one product. An organisation may agree one way
        to report a measure, assign a current practice or interpret a clinical
        definition across all its work. When a rule is authoritative for the
        whole project, it can belong in a shared model, even though it&apos;s an
        organisational decision and not a fact about the source data.
      </p>
      <p>
        Programme logic and terminology have narrower authority. A respiratory
        programme might define its own labels, classifications, priority groups,
        thresholds and reporting periods. All of that belongs in dbt. It should
        live in the programme&apos;s own folders or schemas and build on the
        shared asthma, prescribing and person models. What the programme
        shouldn&apos;t do is change those shared models as if its terminology
        were the only valid reading of the domain.
      </p>
      <p>
        Audience and product rules are narrower still. Shared person
        demographics can support both direct-care and secondary-use products.
        The secondary-use published view applies opt-out filtering. That filter
        doesn&apos;t belong in the shared person model, because other lawful
        uses still need those people.
      </p>
      <p>
        These scopes overlap. Products use programme definitions, and programmes
        use shared domain concepts. The boundary is about authority. A narrower
        consumer can compose, filter or extend a shared definition. It
        shouldn&apos;t quietly make its own requirement part of the shared
        meaning for everyone else.
      </p>

      <h2>Keep clinical distinctions visible</h2>
      <p>
        A model can have a clear grain, a stable interface and the right owner,
        and still hide a clinical distinction that matters. Reusable models need
        to keep uncertainty visible, along with enough evidence for the next
        consumer to understand what the results mean.
      </p>

      <h3>Unknown is not the same as false</h3>
      <p>
        Clinical data often has to tell &quot;doesn&apos;t meet the
        definition&quot; apart from &quot;we don&apos;t have enough information
        to decide&quot;. A missing observation, an explicit negative result, a
        rule that doesn&apos;t apply and an exclusion are four different states.
        Don&apos;t assume they collapse into one.
      </p>
      <p>
        Work out which states you need before you squash them into a boolean. A
        model might keep a result like <code>met</code>, <code>not_met</code>,{" "}
        <code>insufficient_data</code> or <code>not_applicable</code>, alongside
        a simpler flag for consumers who only want yes or no. That stops a
        missing record from turning into a clinical conclusion.
      </p>
      <p>
        The population rule should say how nulls, missing evidence, exclusions
        and unresolved cases affect inclusion. Those decisions need tests, just
        like the grain does.
      </p>

      <h3>Keep the evidence that explains a result</h3>
      <p>
        A model should usually keep the columns you&apos;d need to understand
        and check its result. A bare flag with no dates, criteria or
        contributing values sends anyone checking it back into the SQL.
      </p>
      <p>
        <code>fct_person_diabetes_register</code> keeps diagnosis dates,
        criteria flags and contributing codes next to{" "}
        <code>is_on_register</code>, so a clinician can see why someone was
        included. <code>fct_person_resource_index</code> does the same, keeping
        actual and expected costs, registration exposure and imputation details
        next to the final index.
      </p>
      <p>
        Aim for a result that can answer &quot;why did this row get this
        result?&quot; without anyone opening the SQL. That doesn&apos;t mean
        exposing all the source columns. It means not reducing an explainable
        decision to an opaque verdict.
      </p>

      <h2 id="naming-the-model">
        Give the result a name readers can interpret
      </h2>
      <p>
        Once you&apos;ve settled purpose, population, time and grain, apply the
        project&apos;s <Link href="/learn/model-naming">naming grammar</Link>.
        The shared clinical fact is named for its subject. The published
        dashboard model is named for its product. Read the name and description
        together. Neither should suggest the model covers more than it does.
      </p>

      <h2>Checklist for designing a model</h2>
      <ol>
        <li>
          <strong>Name the domain concept.</strong> Pick out the entity, event,
          state or relationship that stays useful after the first output ships.
        </li>
        <li>
          <strong>State population, time and grain.</strong> Finish the sentence
          &quot;one row per…, included when…, as of…&quot;, and name the
          uniqueness test that protects it.
        </li>
        <li>
          <strong>Search for existing definitions.</strong> Follow the
          project&apos;s{" "}
          <Link href="/learn/finding-models">discovery method</Link>, and reuse
          or extend what&apos;s there instead of creating a parallel meaning.
        </li>
        <li>
          <strong>Choose the boundary.</strong> Separate logic that has its own
          grain, tests, owner, reuse or reason to change.
        </li>
        <li>
          <strong>Design for consumers.</strong> Include the context people
          usually need, without breaking the core grain. A wide, denormalised
          mart is the better choice when it saves consumers routine joins.
        </li>
        <li>
          <strong>Keep scoped rules at the scope that owns them.</strong> Shared
          models can hold agreed organisation-wide definitions. Programme,
          audience and product rules go in their own folders or schemas, and
          build on shared domain models instead of redefining them for everyone.
        </li>
        <li>
          <strong>Handle uncertainty explicitly.</strong> Don&apos;t let missing
          evidence or not-applicable cases become false.
        </li>
        <li>
          <strong>Keep useful evidence.</strong> Retain enough to explain and
          check important results.
        </li>
        <li>
          <strong>Test what&apos;s most likely to break.</strong> Grain comes
          first, then join uniqueness, population boundaries and maintained
          lists. The{" "}
          <Link href="/learn/tests-and-docs">tests and documentation</Link>{" "}
          lesson sets out the order.
        </li>
      </ol>
      <p>
        With the boundaries chosen, the{" "}
        <Link href="/learn/tests-and-docs">tests and documentation</Link> lesson
        shows how to turn each contract into something consumers and the
        pipeline can check.
      </p>

      <Quiz
        title="Model-design decisions"
        questions={[
          {
            prompt:
              "A dashboard needs current waiting counts by provider. What should be defined independently of that chart?",
            options: [
              "Its colours and sort order",
              "Open pathway, current snapshot and responsible provider",
              "The dashboard refresh button",
              "Only the final provider total",
            ],
            answer: 1,
            explain:
              "Those are durable domain concepts. The chart is one way of grouping and presenting them.",
          },
          {
            prompt:
              "A person-grain model needs the latest HbA1c. Why reference int_hba1c_latest rather than all observations?",
            options: [
              "Latest models always build faster",
              "It preserves one row per person and reuses the shared selection rule",
              "Reporting models cannot reference observation data",
              "The all model contains undocumented columns",
            ],
            answer: 1,
            explain:
              "The latest model has already picked one qualifying result per person. That protects the target grain and keeps the selection rule in one place.",
          },
          {
            prompt:
              "When is adding columns to an existing mart usually better than creating another narrow model?",
            options: [
              "Whenever the SQL is shorter than 100 lines",
              "When the columns preserve its grain and consumers commonly need them together",
              "Whenever the columns come from staging",
              "When no uniqueness test exists",
            ],
            answer: 1,
            explain:
              "Useful width saves consumers repeating the same joins. The model should still keep one clear core grain and reuse upstream definitions.",
          },
          {
            prompt:
              "You need the register as it stood on 31 March, so you add a snapshot_date of 31 March to today's register result. Is the model now point-in-time correct?",
            options: [
              "Yes, the reference date is now recorded on every row",
              "No, every time-dependent input must be evaluated as of the reference date, not just labelled with it",
              "Yes, provided the model was built during March",
              "No, point-in-time models require a snapshot table",
            ],
            answer: 1,
            explain:
              "A label doesn't recreate the historical population. Ages, diagnoses, resolutions and registrations all have to be evaluated at the reference date. That's the promise the pit_ family makes.",
          },
          {
            prompt:
              "A ticket asks for an asthma dashboard combining register membership, SABA prescribing and other measures. What should you create?",
            options: [
              "A published asthma_dashboard_base composed from reporting marts",
              "More columns in fct_person_asthma_register until it serves the dashboard",
              "An int_asthma_dashboard_data model queried directly by the dashboard",
              "A replacement fct_asthma_dashboard fact containing every measure",
            ],
            answer: 0,
            explain:
              "The register stays a reusable reporting fact. The dashboard gets a published model that composes the register, prescribing and other reporting marts at the grain the product needs. The *_dashboard_base family already follows this pattern in the project.",
          },
          {
            prompt:
              "A respiratory programme needs its own priority groups built on the asthma register. Where does that logic belong?",
            options: [
              "In fct_person_asthma_register, so every consumer benefits",
              "In the programme's own models, composing the shared register without altering it",
              "In staging, so it is applied as early as possible",
              "In each dashboard that mentions asthma",
            ],
            answer: 1,
            explain:
              "Programme rules and terminology carry programme-level authority. They should build on shared domain models, not make one programme's reading of the domain the shared meaning for everyone.",
          },
        ]}
      />
    </LessonShell>
  );
}
