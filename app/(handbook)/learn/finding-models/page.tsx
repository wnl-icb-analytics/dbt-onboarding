import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Finding and reusing models" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="finding-models"
      kicker="Learn 07"
      title="Finding and reusing models"
      lede="In a mature dbt project, most analytical work should begin with concepts the project already understands—not with the source tables from which those concepts were first built."
      minutes={12}
    >
      <h2>A mature project changes where analysis begins</h2>
      <p>
        A new request can feel like an instruction to write a new query. In a
        worksheet, that often means finding source tables, cleaning identifiers,
        removing duplicates, interpreting coded fields and rebuilding the joins
        needed for the result. The analysis becomes responsible for the entire
        path from source mechanics to presentation.
      </p>
      <p>
        That is not the normal starting point in a mature dbt project. The project
        has already invested in source preparation, shared domain definitions and
        business-ready marts. A question about people with asthma should begin
        with the project&apos;s asthma, prescribing, person and practice models. The
        original observation and medication-order tables matter to the models
        that define those concepts; they should not matter to every analyst who
        uses them.
      </p>
      <p>
        This is the compounding return from modelling the domain. Each completed
        piece of work leaves tested concepts that make later questions easier.
        Eventually, a large proportion of requests can be answered by composing
        existing models and adding only the definition or delivery shape that is
        genuinely new.
      </p>
      <p>
        Finding those models is therefore part of analytical design. Creating a
        duplicate definition because an existing one was not discovered is not
        just wasted SQL: it introduces a second meaning that can drift from the
        first.
      </p>

      <h2>Search for the contract you need</h2>
      <p>
        Searching starts before the model name. Translate the request into the
        contract the data must satisfy: its subject, population, time and grain.
        The output format matters too, but it should not be confused with the
        underlying domain concept.
      </p>
      <p>
        Consider a request for “the latest blood pressure for people on the
        diabetes register, grouped by current practice”. It contains several
        independently searchable ideas:
      </p>
      <table>
        <thead>
          <tr>
            <th>Part of the request</th>
            <th>Contract to find</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>people on the diabetes register</td>
            <td>A clinical population, one current row per included person</td>
          </tr>
          <tr>
            <td>latest blood pressure</td>
            <td>One selected qualifying observation per person</td>
          </tr>
          <tr>
            <td>current practice</td>
            <td>One current organisational relationship per person</td>
          </tr>
          <tr>
            <td>grouped by practice</td>
            <td>A new aggregation or delivery shape</td>
          </tr>
        </tbody>
      </table>
      <p>
        The search is not for a table whose name happens to resemble the whole
        sentence. It is for models whose contracts settle each durable part of
        the question. If the exact grouped output does not exist, that may be the
        only new work required.
      </p>

      <h3>Use the project&apos;s grammar as an index</h3>
      <p>
        The naming conventions from the previous lesson turn the repository into
        an index. Prefixes narrow the analytical role, subjects identify the
        domain and suffixes expose important shapes. Searching a family is often
        more useful than searching one imagined full name.
      </p>
      <CodeBlock
        lang="bash"
        title="search names first; inspect lineage next"
        code={[
          "rg --files models | rg 'diabetes|blood_pressure|current_practice'",
          "rg --files models | rg 'dim_person_'",
          "rg --files models | rg '_latest\\\\.(sql|yml)$'",
          "",
          "dbt ls -s fct_person_diabetes_register --output path",
          "dbt ls -s +fct_person_diabetes_register+ --output name",
        ].join("\n")}
      />
      <p>
        The first searches reveal related model families. The first{" "}
        <code>dbt ls</code>{" "}confirms which project resource matches the name.
        The second shows the connected slice of the DAG: ancestors that define
        it and descendants that already consume it.
      </p>
      <p>
        Search terms should include the organisation&apos;s established vocabulary,
        not just the words in the ticket. “GP”, “practice” and “organisation” may
        describe related ideas but lead to different models. Reading two or three
        neighbouring names shows which word the project uses and what distinctions
        it preserves.
      </p>

      <h2>Begin with the most settled useful layer</h2>
      <p>
        Layer knowledge gives the search a direction. For general analytical work,
        reporting marts are normally the first place to look: they contain
        business-ready facts, dimensions and wide analytical tables at documented
        grains. Published models are the first choice when the request is for the
        named product they serve.
      </p>
      <p>
        Modelling-layer models become relevant when the question needs reusable
        evidence or a transformation that has not yet been expressed as a
        business-ready mart. Staging and raw models are implementation foundations.
        Reaching them from an ordinary business question should be exceptional,
        because it means the downstream project has not yet settled the required
        concept.
      </p>
      <table>
        <thead>
          <tr>
            <th>What you need</th>
            <th>Where to look first</th>
            <th>What to expect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A named dashboard, extract or audience view</td>
            <td>Published</td>
            <td>Product composition, policy and delivery names</td>
          </tr>
          <tr>
            <td>A clinical fact, person dimension or analytical mart</td>
            <td>Reporting</td>
            <td>Business-ready meaning at a supported grain</td>
          </tr>
          <tr>
            <td>Reusable evidence or an unsettled transformation</td>
            <td>Modelling</td>
            <td>Purposeful components that support marts</td>
          </tr>
          <tr>
            <td>A genuinely missing source capability</td>
            <td>Staging and raw</td>
            <td>Prepared source entities and preserved source evidence</td>
          </tr>
        </tbody>
      </table>
      <p>
        This is a starting order, not a rule that higher layers are always more
        correct. A published model may contain policy for another audience. A
        reporting fact may use the wrong reference time for the question. The
        layer tells you what kind of promise to expect; the model&apos;s contract
        decides whether that promise fits.
      </p>

      <h2>Read the contract before the implementation</h2>
      <p>
        Once a candidate model appears, start with its name and YAML rather than
        reading every CTE. A useful description should identify the subject,
        population, time and grain. Tests should protect the key or key
        combination that makes the grain true. Column descriptions should explain
        units, coding, selection rules and null meaning where those are not
        obvious.
      </p>
      <CodeBlock
        lang="yaml"
        title="the questions a model description should settle"
        code={[
          "models:",
          "  - name: int_blood_pressure_latest",
          "    description: >",
          "      Latest qualifying blood-pressure observation for each person,",
          "      selected at the current build date. One row per person with a",
          "      qualifying result; ties use the documented recorded-date rule.",
          "    columns:",
          "      - name: person_id",
          "        data_tests: [unique, not_null]",
          "      - name: systolic_value",
          "        description: Selected systolic pressure in mmHg; null only when...",
          "      - name: clinical_effective_date",
          "        description: Date used to determine observation recency",
        ].join("\n")}
      />
      <p>
        This example is illustrative, but the questions are real. Does “latest”
        mean clinical-effective date or recorded date? Are people without a
        qualifying result absent or present with nulls? How are ties resolved?
        Does the model describe the current build or a supplied reference date?
        The name points to the model; the contract determines whether it is safe
        to use.
      </p>
      <p>
        Previewing rows can confirm that values look plausible, but it cannot
        establish the contract. A sample may contain one row per person by chance.
        It may not include a tie, an unresolved code or a person whose current
        practice changed. Documentation and tests state the intended behaviour;
        SQL and data inspection provide evidence that the implementation matches
        it.
      </p>

      <h3>Lineage supplies context that one file cannot</h3>
      <p>
        Upstream lineage explains where a model&apos;s meaning comes from. It shows
        whether a current result was selected from a full history, whether a fact
        reused a shared register and where source-specific preparation was
        absorbed. Downstream lineage shows which products already rely on the
        contract and therefore what a change could affect.
      </p>
      <p>
        Existing consumers are useful evidence, but they are not proof that a
        model is appropriate for every use. A dashboard may apply a programme
        filter downstream, or may itself be due for correction. Read lineage to
        understand scope and consequences, then return to the candidate model&apos;s
        own documented promise.
      </p>

      <h2>Trust comes from several kinds of evidence</h2>
      <p>
        The existence of a model is not itself a recommendation. Mature projects
        contain experiments, narrowly scoped programme models, older conventions
        and definitions that are being replaced. Discovery needs to establish not
        only that a relation exists, but that it is an appropriate supported
        interface for the proposed use.
      </p>
      <p>
        Confidence comes from agreement between several signals. The name places
        the model in a recognisable family. Its folder and schema identify scope.
        The description states a usable contract. Grain and semantic tests protect
        important claims. SQL implements the documented decisions. Lineage shows
        established inputs and consumers. Recent build results show whether those
        assertions currently hold.
      </p>
      <p>
        That last signal is the decisive difference from an inherited script. A
        script was checked once, by its author, on the day it was written. A
        tested model has its contract re-verified against current data on every
        build — so trusting it is a judgement about the project&apos;s checks,
        not about how careful one colleague was some months ago.
      </p>
      <p>
        No single signal is enough. A polished description can be stale. A passing
        uniqueness test cannot establish the intended population. Several
        downstream consumers can all depend on the same historical mistake. When
        the signals disagree, that disagreement is part of the work: clarify the
        contract, speak to the owner and correct the shared model before building
        another product on top.
      </p>
      <p>
        Source freshness and coverage matter too, but they should be interpreted
        at the boundary that owns them. An analyst using a current reporting mart
        needs to know whether it built successfully and the period it represents.
        They should not need to relearn every feed-delivery column used to
        establish that answer.
      </p>

      <h2>Reuse, compose, extend or create</h2>
      <p>
        Discovery ends with a design decision. “A related model exists” does not
        automatically mean it should be reused unchanged, and “the exact output
        does not exist” does not automatically justify a new shared definition.
      </p>
      <p>
        <strong>Reuse</strong>{" "}when an existing model already expresses the
        required concept at the required time and grain.{" "}
        <strong>Compose</strong>{" "}when several settled concepts need to be
        brought together for a new question or product.{" "}
        <strong>Extend</strong>{" "}when a broadly useful attribute belongs to an
        existing model&apos;s subject and preserves its contract.{" "}
        <strong>Create</strong>{" "}when the project genuinely lacks a durable
        concept, temporal contract or analytical subject.
      </p>
      <p>
        Product-specific composition normally belongs in published. A new
        organisation-wide clinical fact belongs in reporting. Reusable evidence
        that makes that fact readable may belong in modelling. The decision is
        not about minimising the number of files; it is about leaving each new
        piece of knowledge at the scope where future users can find and trust it.
      </p>
      <p>
        Reuse also respects scope. A model in a respiratory programme folder may
        be well designed and heavily used while still encoding thresholds that
        are authoritative only for that programme. Another programme can reuse
        its shared asthma inputs without adopting its policy. Similarly, a
        secondary-use published model may apply exclusions that are inappropriate
        for direct care.
      </p>
      <p>
        Extending an existing model is safest when the new field belongs to the
        same subject, preserves population, time and grain, and is useful to the
        model&apos;s intended consumers. If an addition gives the model a second
        subject or makes it change for a product-specific reason, composition in a
        new model is clearer.
      </p>

      <h3>Discovery should leave a trace</h3>
      <p>
        When a search concludes that no suitable model exists, record what was
        checked in the issue or pull request: the concepts searched, nearby models
        considered and the contract mismatch that makes new work necessary. This
        gives reviewers a way to challenge the conclusion and prevents the next
        developer from repeating the same search without context.
      </p>
      <p>
        When the right model does exist, use its name with <code>ref()</code>{" "}
        rather than copying its SQL or hardcoding its warehouse relation. That
        makes the reuse visible in lineage and ensures future corrections to the
        shared definition flow into the new composition.
      </p>

      <h2>Worked example: an asthma dashboard</h2>
      <p>
        Suppose the request is for an asthma dashboard containing register
        membership, recent SABA prescribing, management measures, demographics
        and current practice. Searching “asthma” reveals several kinds of model
        rather than one ready-made dashboard table. (The{" "}
        <Link href="/learn/model-design">Designing models</Link>{" "}lesson
        revisits this same scenario from the builder&apos;s side — how these
        models came to be designed this way.)
      </p>
      <p>
        <code>fct_person_asthma_register</code>{" "}is the reporting fact for
        register membership. <code>int_asthma_diagnoses_all</code>{" "}and{" "}
        <code>int_asthma_medications_all</code>{" "}are supporting evidence models
        at observation and medication-order grain.{" "}
        <code>int_asthma_management</code>{" "}contains management logic already
        used by programme models. Person demographics and current-practice
        dimensions supply descriptive context.
      </p>
      <p>
        The absence of <code>asthma_dashboard_base</code>{" "}does not mean the
        analysis should return to clinical-record sources. It means the product
        composition is missing. If SABA or management measures do not yet have
        suitable business-ready reporting models, those are genuine domain gaps
        to fill first. A published dashboard model can then compose the register,
        those reporting facts and the relevant dimensions at the product&apos;s
        required grain.
      </p>
      <p>
        Another asthma question can reuse the same register and measures in a
        different composition. A legitimately different threshold or time window
        can branch from the appropriate evidence model and receive its own clear
        definition. In neither case does the next developer have to rediscover how
        source records encode asthma diagnoses or medication orders.
      </p>

      <h2>Discovery is how the project compounds</h2>
      <p>
        A mature project becomes faster only if people use what it has already
        learned. Consistent naming makes concepts searchable. Documentation and
        tests make them assessable. Lineage makes their origins and consumers
        visible. Layering tells a developer where a missing piece belongs.
      </p>
      <p>
        Together, those practices change the economics of the next request. The
        team spends less time repeating source cleaning and reconstructing
        definitions, and more time understanding what is actually new. When new
        work leaves another reusable model behind, that advantage grows again.
      </p>
      <p>
        The next lesson,{" "}
        <Link href="/learn/model-design">Designing models</Link>, begins at the
        point where discovery has established a genuine gap.
      </p>

      <h2>A discovery checklist</h2>
      <ol>
        <li>State the required subject, population, time and grain.</li>
        <li>
          Search important nouns, related vocabulary and established naming
          families.
        </li>
        <li>
          Start with published or reporting models and move upstream only when
          the required meaning is missing.
        </li>
        <li>
          Read the candidate&apos;s description, grain tests and important column
          documentation.
        </li>
        <li>
          Inspect ancestors for foundations and descendants for existing use and
          change impact.
        </li>
        <li>
          Decide explicitly whether the request calls for reuse, composition,
          extension or a new domain concept.
        </li>
        <li>
          If new work is required, leave reusable meaning outside the
          product-specific output.
        </li>
      </ol>

      <Quiz
        title="Finding the right starting point"
        questions={[
          {
            prompt:
              "A request needs register membership, current practice and a new provider summary. Where should discovery begin?",
            options: [
              "The reporting register and current-practice models",
              "The raw clinical-record and organisation tables",
              "A new staging model named after the dashboard",
              "The most recent worksheet that produced a similar chart",
            ],
            answer: 0,
            explain:
              "The register and practice relationship are already settled domain concepts. The provider summary may be new composition, but it should build from those contracts rather than reconstruct them from sources.",
          },
          {
            prompt:
              "You find a model with the right subject but a current-state contract; the request is for last March. What follows?",
            options: [
              "Reuse it because the subject matches",
              "Add last March as a label to its current rows",
              "Find or design a point-in-time model with the required reference date",
              "Copy its SQL into the published model and change CURRENT_DATE",
            ],
            answer: 2,
            explain:
              "Subject alone is not enough. The temporal contract must fit, and point-in-time correctness requires every time-dependent input to use the same reference date.",
          },
          {
            prompt:
              "No asthma dashboard model exists, but the register and other reporting facts do. What is the likely gap?",
            options: [
              "A new raw asthma source",
              "A published product composition",
              "A replacement register containing every dashboard measure",
              "A worksheet that joins the source tables directly",
            ],
            answer: 1,
            explain:
              "The domain facts already exist. The missing work is a published model that composes them for the dashboard's grain, audience and delivery contract.",
          },
        ]}
      />
    </LessonShell>
  );
}
