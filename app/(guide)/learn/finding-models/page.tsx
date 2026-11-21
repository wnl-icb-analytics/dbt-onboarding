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
      kicker="Learn 09"
      title="Finding and reusing models"
      lede="Find the models that already answer parts of your question. Then check who they include, what period they cover and what one row represents before you use them."
      minutes={12}
    >
      <h2>Existing models may already cover most of a request</h2>
      <p>
        Before you build anything, look for models that already provide the
        data a request needs. The pieces often exist under other names, even
        when nothing is named after the finished output. Say a request comes in
        for an asthma dashboard. It needs register membership, asthma
        management and each person&apos;s current practice. You search and find
        no table named after the dashboard. That tells you very little about
        how much work is left. The job is to find the pieces and check what
        each one provides.
      </p>

      <h2>Break the request into the data it needs</h2>
      <p>
        Before you search for a model name, split the request into the pieces
        of data it needs. For each piece, write down the subject, who
        qualifies, the period it covers and what one row represents. The
        dashboard&apos;s layout matters too, but it&apos;s a separate thing
        from the clinical concepts underneath.
      </p>
      <p>
        Take the request for &quot;current asthma-register membership, asthma
        management and current practice&quot;. It breaks into four parts, and
        you can search for each one on its own:
      </p>
      <table>
        <thead>
          <tr>
            <th>Part of the request</th>
            <th>What to look for</th>
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
              A documented management measure at the time and grain you need
            </td>
          </tr>
          <tr>
            <td>current practice</td>
            <td>One current practice relationship per person</td>
          </tr>
          <tr>
            <td>dashboard output</td>
            <td>The product&apos;s own table, at the agreed output grain</td>
          </tr>
        </tbody>
      </table>
      <p>
        Look for a model that fits each part. A name that resembles the whole
        request doesn&apos;t prove anything fits. And if the only thing missing
        is the dashboard table itself, that may be all the new work there is.
      </p>

      <h3>Search names, then open the candidates</h3>
      <p>
        In VS Code, open the project folder. Press <code>Ctrl+P</code> and
        type <code>asthma</code> to search file names. Press{" "}
        <code>Ctrl+Shift+F</code> to search the text
        inside SQL and YAML files, which finds models that mention asthma in a
        description or a column. In the <Link href="/models">model docs</Link>,
        search the same word and open a model to read its description and
        lineage. None of this needs a working dbt connection.
      </p>
      <p>
        You&apos;ll find several candidates. <code>fct_person_asthma_register</code>{" "}
        describes membership. <code>int_asthma_diagnoses_all</code> holds the
        diagnosis evidence. <code>int_asthma_management</code> holds management
        logic. The names suggest different jobs. They aren&apos;t three versions
        of the same answer.
      </p>
      <p>
        If you prefer the terminal, the first command below lists files with
        asthma in their path. The second lists every model connected to the
        register. A <code>+</code> before the name adds its ancestors, the
        models it&apos;s built from. A <code>+</code> after adds its
        descendants, the models built from it. <code>dbt ls</code> only lists.
        It doesn&apos;t build anything.
      </p>
      <CodeBlock
        lang="bash"
        title="Optional command-line search"
        code={[
          'git ls-files "models/*asthma*"',
          "dbt ls -s +fct_person_asthma_register+ --resource-type model --output name",
        ].join("\n")}
      />

      <h2>Start in reporting, or in published for a named product</h2>
      <p>
        The layers tell you where to look first. For general analysis, start
        with the reporting marts. They hold business-ready facts,
        dimensions and wide tables at documented grains. If the request is for
        a named product, such as one dashboard, look in published
        first, because that&apos;s where product tables live.
      </p>
      <p>
        Go down to the modelling layer when you need reusable evidence, or a
        transformation nobody has turned into a mart yet. Staging and raw are
        the foundations. An everyday business question should rarely need to
        reach them. If it does, the project hasn&apos;t settled that concept
        yet, and that tells you something in itself.
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
            <td>Product tables, audience rules and delivery names</td>
          </tr>
          <tr>
            <td>A clinical fact, person dimension or analytical mart</td>
            <td>Reporting</td>
            <td>Business-ready meaning at a supported grain</td>
          </tr>
          <tr>
            <td>Reusable evidence or an unsettled transformation</td>
            <td>Modelling</td>
            <td>Building blocks that feed marts</td>
          </tr>
          <tr>
            <td>A source capability the project lacks</td>
            <td>Staging and raw</td>
            <td>Cleaned source tables and the generated copies beneath them</td>
          </tr>
        </tbody>
      </table>
      <p>
        That&apos;s an order to search in. It doesn&apos;t mean higher layers
        are more correct. A published model may carry rules meant for a
        different audience. A reporting fact may use the wrong reference date
        for your question. The layer tells you what kind of model to expect.
        The model&apos;s own description and tests tell you whether it fits.
      </p>

      <h2>Read the model&apos;s YAML before its SQL</h2>
      <p>
        A model&apos;s YAML file holds its description, column documentation
        and tests. Read it before any CTEs, because it tells you what the model
        is meant to return. A useful description says who is in it, over what
        period, and what one row represents. Tests should protect the key that makes the
        grain true. Column descriptions should explain units, codes, selection
        rules and what a null means, wherever those aren&apos;t obvious.
      </p>
      <p>
        Here&apos;s the start of the real description of{" "}
        <code>fct_person_asthma_register</code>:
      </p>
      <blockquote>
        Treated asthma register for ages 5 or over (NICE IND186). One row per
        register member. Registration status is not filtered. People aged 5 or
        over need an asthma diagnosis and treatment in the 12 months before the
        build date. A resolution on or after the latest diagnosis date excludes
        membership.
      </blockquote>
      <p>
        That settles things the name can&apos;t. People who aren&apos;t on the
        register have no row, so you can&apos;t use this table as a list of
        everyone without asthma. Registration status isn&apos;t filtered, so
        someone who has left their practice can still appear. If your dashboard
        needs currently registered people, you&apos;ll have to join to a
        registration model. The 12-month window counts back from the build date,
        which rules it out for a historical report. In any candidate, read the
        criteria and dates like this, then check that the SQL and tests agree
        with them.
      </p>
      <p>
        Previewing rows can show that values look plausible. It can&apos;t
        prove the model&apos;s rules hold. A sample might happen to have one row per
        person. It might not include a tie, an unresolved code, or a person
        whose practice changed. Documentation and tests state what the model
        is meant to do. SQL and data inspection give you evidence that it
        actually does it.
      </p>

      <h3>Lineage shows a model&apos;s inputs and what depends on it</h3>
      <p>
        Lineage is the chain of models a model is built from, and the models
        built from it. Upstream lineage tells you whether a current result was picked from a full history, whether a
        fact reused a shared register, and where source preparation happened.
        Downstream lineage shows which products already rely on the model, and
        so what a change to it could affect.
      </p>
      <p>
        Existing consumers are useful evidence, but they don&apos;t prove a
        model suits every use. A dashboard might apply a programme filter
        downstream. It might itself be waiting for a fix. Read lineage to
        understand scope and consequences. Then go back to the candidate&apos;s
        own description and tests.
      </p>

      <h2>Check that a model suits your use before relying on it</h2>
      <p>
        Before you rely on a model, check that the team maintains it for work
        like yours and that it covers your question. A mature project holds
        experiments, narrow programme models, older conventions and definitions
        on their way out. Finding a model is the easy part.
      </p>
      <p>
        Confidence comes from several signals agreeing. The name puts the model
        in a family you recognise. Its folder and schema show its scope. The
        description states a population, time and grain you can use. Grain tests and rule tests
        protect the important claims. The SQL does what the documentation says.
        Lineage shows established inputs and consumers. Recent build results
        tell you whether the tests pass today.
      </p>
      <p>
        No single signal is enough. A polished description can be out of date.
        A passing uniqueness test says nothing about whether the population is
        the intended one. Several dashboards can all depend on the same old
        mistake. When the signals disagree, sorting that out is part of the
        work. Clarify the definition, talk to the owner and fix the shared model
        before you build another product on top of it.
      </p>
      <p>
        Source freshness and coverage matter too, but the model that owns them
        should answer for them. An analyst using a current reporting mart needs
        to know that it built successfully and which period it covers. They
        shouldn&apos;t have to relearn the feed-delivery columns behind that
        answer.
      </p>

      <h2>Decide whether to reuse, compose, extend or create</h2>
      <p>
        Once you&apos;ve found the candidates, compare what they give you with
        what the request needs. That tells you what to build. Finding a related
        model doesn&apos;t mean you should reuse it unchanged. Not finding the
        exact output doesn&apos;t justify a new shared definition. There are
        four ways to go.
      </p>
      <ul>
        <li>
          <strong>Reuse.</strong> An existing model already expresses the
          concept at the time and grain you need.
        </li>
        <li>
          <strong>Compose.</strong> Several settled concepts need bringing
          together for a new question or product.
        </li>
        <li>
          <strong>Extend.</strong> A broadly useful column belongs to an
          existing model&apos;s subject and keeps its population, time and
          grain intact.
        </li>
        <li>
          <strong>Create.</strong> The project lacks a shared concept, time
          basis or analytical subject.
        </li>
      </ul>
      <p>
        Composition for one product normally goes in published. A new clinical
        fact for the whole organisation goes in reporting. Reusable evidence
        behind that fact may go in modelling. The aim isn&apos;t the fewest
        files. It&apos;s putting each new piece of knowledge where the next
        person can find it and trust it.
      </p>
      <p>
        Reuse has to respect scope too. A model in a respiratory programme
        folder can be well built and heavily used, yet hold thresholds that
        only that programme has agreed. Another programme can reuse its shared
        asthma inputs without taking on its policy. In the same way, a
        published model for secondary use may apply exclusions that are wrong
        for direct care.
      </p>
      <p>
        Extending a model is safest when the new column is about the same
        subject, keeps the same population, time and grain, and helps the
        model&apos;s existing users. If the addition gives the model a second
        subject, or makes it change for one product&apos;s sake, put the
        composition in a new model instead.
      </p>

      <h3>Leave a record of the search</h3>
      <p>
        If you conclude that no existing model fits, write down what you
        checked in the issue or pull request. List the concepts you searched,
        the nearby models you considered, and the mismatch that rules each one
        out. A reviewer can then challenge your conclusion, and the next
        developer doesn&apos;t have to repeat the same search from scratch.
      </p>
      <p>
        If the right model does exist, use it through <code>ref()</code>. Don&apos;t
        copy its SQL or type its warehouse table name. A <code>ref()</code> shows
        up in lineage, and any later fix to the shared definition flows straight
        into your new model.
      </p>

      <h2>What the asthma search found</h2>
      <p>
        Now say the full request is for an asthma dashboard with register
        membership, recent SABA prescribing, management measures, demographics
        and current practice. Searching &quot;asthma&quot; turns up several
        kinds of model. None of them is a ready-made dashboard table.
      </p>
      <p>
        <code>fct_person_asthma_register</code> is the reporting fact for
        register membership. <code>int_asthma_diagnoses_all</code> and{" "}
        <code>int_asthma_medications_all</code> are supporting evidence, at one
        row per observation and one row per medication order.{" "}
        <code>int_asthma_management</code> holds management logic that
        programme models already use. The person demographics and
        current-practice dimensions supply the descriptive columns.
      </p>
      <p>
        A missing <code>asthma_dashboard_base</code> doesn&apos;t send you back
        to the clinical-record sources. It means the product table is missing.
        If SABA prescribing or management measures don&apos;t yet have
        business-ready reporting models, those are real gaps, and you fill them
        first. Then a published dashboard model can bring together the register,
        those facts and the dimensions at the grain the product needs.
      </p>
      <p>
        Another asthma question can reuse the same register and measures in a
        different combination. A genuinely different threshold or time window
        can branch from the right evidence model and get its own clear
        definition. Either way, the next developer doesn&apos;t have to work out
        again how the source records encode asthma diagnoses or medication
        orders.
      </p>
      <p>
        The search has turned a vague request into a defined piece of work:
        which models fit, which don&apos;t, and what&apos;s missing.{" "}
        <Link href="/learn/model-design">Designing models</Link> picks up the
        same asthma example from the builder&apos;s side, starting from that
        decision.
      </p>

      <h2>Checklist for finding a model</h2>
      <ol>
        <li>State the subject, population, time and grain you need.</li>
        <li>
          Search the key nouns, related vocabulary and the naming families you
          know.
        </li>
        <li>
          Start with published or reporting models. Move upstream only when the
          meaning you need is missing.
        </li>
        <li>
          Read the candidate&apos;s description, grain tests and the column
          documentation that matters for your question.
        </li>
        <li>
          Check ancestors for foundations, and descendants for existing use and
          the impact of a change.
        </li>
        <li>
          Decide out loud whether the request needs reuse, composition, an
          extension or a new concept.
        </li>
        <li>
          If you need new work, keep reusable meaning out of the product&apos;s
          own table.
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
              "The register and the practice relationship are already settled concepts. The provider summary may be new, but it should build on those models rather than rebuild them from sources.",
          },
          {
            prompt:
              "You find a model with the right subject, but it describes the current state and the request is for last March. What follows?",
            options: [
              "Reuse it because the subject matches",
              "Add last March as a label to its current rows",
              "Find or design a point-in-time model with the required reference date",
              "Copy its SQL into the published model and change CURRENT_DATE",
            ],
            answer: 2,
            explain:
              "A matching subject isn't enough. The time basis has to fit too, and a point-in-time result needs every time-dependent input to use the same reference date.",
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
              "The clinical facts already exist. What's missing is a published model that brings them together at the dashboard's grain, for its audience.",
          },
        ]}
      />
    </LessonShell>
  );
}
