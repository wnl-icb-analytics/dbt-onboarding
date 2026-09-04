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
      lede="Find the models that already answer parts of your question, then check their population, time and grain before using them."
      minutes={12}
    >
      <h2>Begin with a question you can investigate</h2>
      <p>
        A request arrives for an asthma dashboard with register membership,
        management information and current practice. The absence of a table
        named after that dashboard does not tell us how much work is missing. We
        need to find the models for its individual concepts and assess what they
        provide.
      </p>

      <h2>Search for the contract you need</h2>
      <p>
        Searching starts before the model name. Translate the request into the
        contract the data must satisfy: its subject, population, time and grain.
        The output format matters too, but it should not be confused with the
        underlying domain concept.
      </p>
      <p>
        Consider a request for &quot;current asthma-register membership, asthma
        management and current practice&quot;. It contains several independently
        searchable ideas:
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
            <td>people on the asthma register</td>
            <td>A clinical population, one current row per included person</td>
          </tr>
          <tr>
            <td>asthma management</td>
            <td>
              A documented management measure at the required time and grain
            </td>
          </tr>
          <tr>
            <td>current practice</td>
            <td>One current organisational relationship per person</td>
          </tr>
          <tr>
            <td>dashboard output</td>
            <td>A product composition at the agreed output grain</td>
          </tr>
        </tbody>
      </table>
      <p>
        Look for a model that fits each part of the question. A name resembling
        the whole request is not enough to establish that fit. If the exact
        dashboard output does not exist, that may be the only new work required.
      </p>

      <h3>Search names, then inspect the candidates</h3>
      <p>
        In VS Code, open the project folder and search filenames for{" "}
        <code>asthma</code>. Use the file picker for names, and Search for text
        in SQL and YAML. In the project catalogue, search the same subject and
        open a model&apos;s description and lineage. You can read the repository
        without a working dbt connection.
      </p>
      <p>
        Expect several candidates: <code>fct_person_asthma_register</code>{" "}
        describes membership, <code>int_asthma_diagnoses_all</code> supplies
        diagnosis evidence, and <code>int_asthma_management</code> contains
        management logic. Their names suggest different jobs. They are not
        interchangeable answers.
      </p>
      <p>
        If you prefer the terminal, these commands search filenames and list the
        register&apos;s connected models. The <code>+</code> on each side
        includes both ancestors and descendants; listing them does not build
        them.
      </p>
      <CodeBlock
        lang="bash"
        title="Optional command-line search"
        code={[
          "rg --files models | rg asthma",
          "dbt ls -s +fct_person_asthma_register+ --output name",
        ].join("\n")}
      />

      <h2>Begin with the most settled useful layer</h2>
      <p>
        Layer knowledge gives the search a direction. For general analytical
        work, reporting marts are normally the first place to look: they contain
        business-ready facts, dimensions and wide analytical tables at
        documented grains. Published models are the first choice when the
        request is for the named product they serve.
      </p>
      <p>
        Modelling-layer models become relevant when the question needs reusable
        evidence or a transformation that has not yet been expressed as a
        business-ready mart. Staging and raw models are implementation
        foundations. Reaching them from an ordinary business question should be
        exceptional, because it means the downstream project has not yet settled
        the required concept.
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
            <td>A source capability the project lacks</td>
            <td>Staging and raw</td>
            <td>Prepared source entities and preserved source evidence</td>
          </tr>
        </tbody>
      </table>
      <p>
        This is a starting order, not a rule that higher layers are always more
        correct. A published model may contain policy for another audience. A
        reporting fact may use the wrong reference time for the question. The
        layer tells you what kind of promise to expect; the model&apos;s
        contract decides whether that promise fits.
      </p>

      <h2>Read the contract before the implementation</h2>
      <p>
        Once a candidate model appears, start with its name and YAML rather than
        reading every CTE. A useful description should identify the subject,
        population, time and grain. Tests should protect the key or key
        combination that makes the grain true. Column descriptions should
        explain units, coding, selection rules and null meaning where those are
        not obvious.
      </p>
      <blockquote>
        Illustrative description: one row per person meeting the current asthma
        register definition at build time. Non-members are absent. Supporting
        diagnosis and medication evidence explains inclusion.
      </blockquote>
      <p>
        That description is useful because it settles questions a name cannot.
        It also rules out using the table as the full population for a
        historical report or as a list of everyone without asthma. In a real
        candidate, read the specific criteria and dates, then check that its SQL
        and tests agree.
      </p>
      <p>
        Previewing rows can confirm that values look plausible, but it cannot
        establish the contract. A sample may contain one row per person by
        chance. It may not include a tie, an unresolved code or a person whose
        current practice changed. Documentation and tests state the intended
        behaviour; SQL and data inspection provide evidence that the
        implementation matches it.
      </p>

      <h3>Lineage supplies context that one file cannot</h3>
      <p>
        Upstream lineage explains where a model&apos;s meaning comes from. It
        shows whether a current result was selected from a full history, whether
        a fact reused a shared register and where source-specific preparation
        was absorbed. Downstream lineage shows which products already rely on
        the contract and therefore what a change could affect.
      </p>
      <p>
        Existing consumers are useful evidence, but they are not proof that a
        model is appropriate for every use. A dashboard may apply a programme
        filter downstream, or may itself be due for correction. Read lineage to
        understand scope and consequences, then return to the candidate
        model&apos;s own documented promise.
      </p>

      <h2>Trust comes from several kinds of evidence</h2>
      <p>
        The existence of a model is not itself a recommendation. Mature projects
        contain experiments, narrowly scoped programme models, older conventions
        and definitions that are being replaced. Discovery needs to establish
        not only that a relation exists, but that it is an appropriate supported
        interface for the proposed use.
      </p>
      <p>
        Confidence comes from agreement between several signals. The name places
        the model in a recognisable family. Its folder and schema identify
        scope. The description states a usable contract. Grain and semantic
        tests protect important claims. SQL implements the documented decisions.
        Lineage shows established inputs and consumers. Recent build results
        show whether those assertions currently hold.
      </p>
      <p>
        No single signal is enough. A polished description can be stale. A
        passing uniqueness test cannot establish the intended population.
        Several downstream consumers can all depend on the same historical
        mistake. When the signals disagree, that disagreement is part of the
        work: clarify the contract, speak to the owner and correct the shared
        model before building another product on top.
      </p>
      <p>
        Source freshness and coverage matter too, but they should be interpreted
        at the boundary that owns them. An analyst using a current reporting
        mart needs to know whether it built successfully and the period it
        represents. They should not need to relearn every feed-delivery column
        used to establish that answer.
      </p>

      <h2>Reuse, compose, extend or create</h2>
      <p>
        Discovery ends with a design decision. &quot;A related model
        exists&quot; does not automatically mean it should be reused unchanged,
        and &quot;the exact output does not exist&quot; does not automatically
        justify a new shared definition.
      </p>
      <p>
        <strong>Reuse</strong> when an existing model already expresses the
        required concept at the required time and grain.{" "}
        <strong>Compose</strong> when several settled concepts need to be
        brought together for a new question or product. <strong>Extend</strong>{" "}
        when a broadly useful attribute belongs to an existing model&apos;s
        subject and preserves its contract. <strong>Create</strong> when the
        project lacks a shared concept, temporal contract or analytical subject.
      </p>
      <p>
        Product-specific composition normally belongs in published. A new
        organisation-wide clinical fact belongs in reporting. Reusable evidence
        that makes that fact readable may belong in modelling. The decision is
        not about minimising the number of files; it is about leaving each new
        piece of knowledge at the scope where future users can find and trust
        it.
      </p>
      <p>
        Reuse also respects scope. A model in a respiratory programme folder may
        be well designed and heavily used while still encoding thresholds that
        are authoritative only for that programme. Another programme can reuse
        its shared asthma inputs without adopting its policy. Similarly, a
        secondary-use published model may apply exclusions that are
        inappropriate for direct care.
      </p>
      <p>
        Extending an existing model is safest when the new field belongs to the
        same subject, preserves population, time and grain, and is useful to the
        model&apos;s intended consumers. If an addition gives the model a second
        subject or makes it change for a product-specific reason, composition in
        a new model is clearer.
      </p>

      <h3>Discovery should leave a trace</h3>
      <p>
        When a search concludes that no suitable model exists, record what was
        checked in the issue or pull request: the concepts searched, nearby
        models considered and the contract mismatch that makes new work
        necessary. This gives reviewers a way to challenge the conclusion and
        prevents the next developer from repeating the same search without
        context.
      </p>
      <p>
        When the right model does exist, use its name with <code>ref()</code>{" "}
        rather than copying its SQL or hardcoding its warehouse relation. That
        makes the reuse visible in lineage and ensures future corrections to the
        shared definition flow into the new composition.
      </p>

      <h2>What the search established</h2>
      <p>
        Suppose the request is for an asthma dashboard containing register
        membership, recent SABA prescribing, management measures, demographics
        and current practice. Searching &quot;asthma&quot; reveals several kinds
        of model rather than one ready-made dashboard table. (The{" "}
        <Link href="/learn/model-design">Designing models</Link> lesson revisits
        this same scenario from the builder&apos;s side: how these models came
        to be designed this way.)
      </p>
      <p>
        <code>fct_person_asthma_register</code> is the reporting fact for
        register membership. <code>int_asthma_diagnoses_all</code> and{" "}
        <code>int_asthma_medications_all</code> are supporting evidence models
        at observation and medication-order grain.{" "}
        <code>int_asthma_management</code> contains management logic already
        used by programme models. Person demographics and current-practice
        dimensions supply descriptive context.
      </p>
      <p>
        The absence of <code>asthma_dashboard_base</code> does not mean the
        analysis should return to clinical-record sources. It means the product
        composition is missing. If SABA or management measures do not yet have
        suitable business-ready reporting models, those are genuine domain gaps
        to fill first. A published dashboard model can then compose the
        register, those reporting facts and the relevant dimensions at the
        product&apos;s required grain.
      </p>
      <p>
        Another asthma question can reuse the same register and measures in a
        different composition. A legitimately different threshold or time window
        can branch from the appropriate evidence model and receive its own clear
        definition. In neither case does the next developer have to rediscover
        how source records encode asthma diagnoses or medication orders.
      </p>

      <p>
        The result of this search is a defined piece of work: which models fit,
        which do not and what is missing.{" "}
        <Link href="/learn/model-design">Designing models</Link> continues the
        asthma example from that decision.
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
          Read the candidate&apos;s description, grain tests and important
          column documentation.
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
