import type { Metadata } from "next";
import Link from "next/link";
import { LessonShell } from "@/components/LessonShell";
import { Callout } from "@/components/Callout";
import { ModelFinder } from "@/components/ModelFinder";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Reading model names" };

export default function Page() {
  return (
    <LessonShell
      section="learn"
      slug="model-naming"
      kicker="Learn 08"
      title="Reading model names"
      lede="A model's name tells you what job it does, what it's about and often which rows it keeps. Read names to choose which models to open, then check their descriptions before you rely on one."
      minutes={7}
    >
      <h2>A model name has a prefix, a subject and a suffix</h2>
      <p>
        Most names in this project have three parts. The prefix says what role
        the model plays. The subject says what it&apos;s about. The suffix, when
        there is one, tells apart models about the same subject, often by which
        rows they keep. You&apos;ll usually meet a name before you see any SQL,
        so reading it well tells you which file to open next.
      </p>

      <div className="my-6 flex flex-col gap-3">
        {[
          {
            parts: ["int_", "hba1c", "_latest"],
            meaning:
              "modelling block · HbA1c results · the most recent result per person",
          },
          {
            parts: ["fct_", "person_diabetes", "_register"],
            meaning:
              "reporting fact · a person's diabetes state · a disease register",
          },
          {
            parts: ["stg_", "olids_observation", ""],
            meaning:
              "staging model · the OLIDS observation table · cleaned once for every user",
          },
          {
            parts: ["fct_", "person_sus_uec", "_recent"],
            meaning:
              "reporting fact · a person's urgent and emergency care activity from SUS · a recent time window",
          },
        ].map(({ parts, meaning }) => (
          <div
            key={meaning}
            className="rounded-xl border border-line bg-paper-warm/60 px-4 py-3"
          >
            <p className="!my-0 font-mono text-[14px]">
              <span className="font-bold text-flame-deep">{parts[0]}</span>
              <span className="text-ink">{parts[1]}</span>
              <span className="font-bold text-layer-modelling">{parts[2]}</span>
            </p>
            <p className="!mb-0 !mt-1 text-sm !text-ink-soft">{meaning}</p>
          </div>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th>Part</th>
            <th>Question it answers</th>
            <th>Examples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Prefix</td>
            <td>What role does this model play?</td>
            <td>
              <code>stg_</code>, <code>int_</code>, <code>fct_</code>
            </td>
          </tr>
          <tr>
            <td>Subject</td>
            <td>Which domain concept is it about?</td>
            <td>
              <code>person_diabetes</code>, <code>blood_pressure</code>
            </td>
          </tr>
          <tr>
            <td>Suffix</td>
            <td>Which variant is it, such as which rows it keeps?</td>
            <td>
              <code>_all</code>, <code>_latest</code>, <code>_register</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        A name doesn&apos;t need all three. A staging model mirrors its source,
        so <code>stg_olids_observation</code> already says everything it needs
        to. <code>dim_person</code> is the one canonical person dimension, so
        it has no variant to tell apart and no suffix.
      </p>
      <p>
        The grammar isn&apos;t limited to OLIDS primary-care records. SUS
        hospital activity follows it (<code>fct_person_sus_apc_recent</code>),
        and so do GP appointments (<code>fct_person_gp_recent</code>),
        waiting-list pathways (<code>int_wl_current</code>) and resource use (
        <code>fct_person_resource_index</code>). Learn it once and you can read
        models from any source.
      </p>

      <h2>The prefix says what role the model plays</h2>
      <p>
        The prefix is the first part of the name. It tells you what job the
        model does in the project, from a copy of a source table to a reporting
        fact.
      </p>
      <table>
        <thead>
          <tr>
            <th>Prefix</th>
            <th>What to expect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>raw_</code>
            </td>
            <td>A generated one-to-one copy of a landed source table</td>
          </tr>
          <tr>
            <td>
              <code>stg_</code>
            </td>
            <td>
              The project&apos;s single cleaned interface to one source table
            </td>
          </tr>
          <tr>
            <td>
              <code>int_</code>
            </td>
            <td>A transformation with one clear job, usually feeding marts</td>
          </tr>
          <tr>
            <td>
              <code>dim_</code>
            </td>
            <td>Descriptive context used to understand and group facts</td>
          </tr>
          <tr>
            <td>
              <code>fct_</code>
            </td>
            <td>An event or measurable state at a declared grain</td>
          </tr>
          <tr>
            <td>
              <code>pit_</code>
            </td>
            <td>A point-in-time view for retrospective reporting</td>
          </tr>
          <tr>
            <td>
              <code>obt_</code>
            </td>
            <td>A wide analytical table built from established concepts</td>
          </tr>
          <tr>
            <td>
              <code>dq_</code>
            </td>
            <td>A data-quality output listing records that need attention</td>
          </tr>
        </tbody>
      </table>
      <p>
        The prefix follows what the model is responsible for. It says nothing
        about size or grain. A <code>dim_</code> model can have more rows than a{" "}
        <code>fct_</code> model, and two <code>fct_</code> models can count
        entirely different things. The{" "}
        <Link href="/learn/analytical-tables">analytical tables chapter</Link>{" "}
        covers facts and dimensions with examples. Here, treat the prefix as a
        clue to the intended role. It won&apos;t prove the grain, and it
        won&apos;t tell you whether the model covers your population.
      </p>
      <Callout kind="info" title="These are this project's conventions">
        <p>
          dbt doesn&apos;t require any of these prefixes or suffixes. dbt
          Labs&apos;{" "}
          <a href="https://docs.getdbt.com/best-practices/how-we-structure/2-staging">
            structure guide
          </a>{" "}
          names staging models <code>stg_[source]__[entity]s</code>, with a
          double underscore, and gives marts plain names like{" "}
          <code>customers</code>. This project uses a single underscore and puts{" "}
          <code>fct_</code> or <code>dim_</code> on its marts. Neither is wrong.
          The value comes from using one grammar everywhere, so when generic dbt
          advice differs, follow the project&apos;s documented convention.
        </p>
      </Callout>

      <h2>The suffix tells apart models about the same subject</h2>
      <p>
        The suffix is the last part of the name. It tells you which variant of
        a subject you&apos;re looking at, usually by saying which rows the model
        keeps. <code>_all</code> keeps every qualifying event and{" "}
        <code>_latest</code> keeps the most recent one at the model&apos;s
        grain. A suffix earns its place when it separates two models like this,
        or warns you that one row means something different.
      </p>
      <table>
        <thead>
          <tr>
            <th>Suffix</th>
            <th>What it tells the reader</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>_all</code>
            </td>
            <td>Every qualifying event, so one person can have several rows</td>
            <td>
              <code>int_hba1c_all</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>_latest</code>
            </td>
            <td>
              The most recent qualifying event at the model&apos;s documented
              grain
            </td>
            <td>
              <code>int_hba1c_latest</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>_current</code>
            </td>
            <td>The state that holds now</td>
            <td>
              <code>dim_person_current_practice</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>_historical</code>
            </td>
            <td>The history of a changing state</td>
            <td>
              <code>dim_person_demographics_historical</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>_register</code>
            </td>
            <td>A defined disease-register population</td>
            <td>
              <code>fct_person_diabetes_register</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>_summary</code>
            </td>
            <td>A roll-up to the grain named just before it</td>
            <td>
              <code>fct_ltc_lcs_practice_summary</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Here&apos;s why the <code>_all</code>/<code>_latest</code> pair matters.
        Join <code>int_hba1c_all</code> to a one-row-per-person model and each
        person now appears once for every HbA1c result they have. Join{" "}
        <code>int_hba1c_latest</code> instead and each person keeps one row. The
        suffix warns you before you write the join.
      </p>
      <Callout kind="info" title="The description gives the selection rule">
        <p>
          &quot;Latest&quot; doesn&apos;t say which date decides it or how ties
          are broken. Those details belong in the model description, the SQL and
          the tests. <code>int_hba1c_latest</code>, for example, picks the
          latest clinical effective date and breaks same-day ties on the
          observation ID.
        </p>
      </Callout>

      <h2>Compare related models side by side</h2>
      <p>
        Models that share most of their name form a family, and the part that
        changes tells you how they differ. Put a history model next to its
        latest-result model, then read both descriptions to see which date,
        population and selection rule each one uses.
      </p>
      <p>
        The project has around 30 person dimensions, about 90{" "}
        <code>_latest</code> models and about 50 person-level register facts.
        Looking across one family is often the quickest way to learn it. The
        repeated parts stay fixed, so the parts that change stand out.
      </p>
      <table>
        <thead>
          <tr>
            <th>Search</th>
            <th>Models you&apos;ll meet</th>
            <th>What the family teaches</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>dim_person_</code>
            </td>
            <td>
              <code>dim_person_age</code>, <code>dim_person_ethnicity</code>,{" "}
              <code>dim_person_current_practice</code>,{" "}
              <code>dim_person_demographics</code>
            </td>
            <td>
              The person is the thing being described. The remaining words name
              the attribute, the relationship, or a combined person view.
            </td>
          </tr>
          <tr>
            <td>
              <code>_latest</code>
            </td>
            <td>
              <code>int_hba1c_latest</code>,{" "}
              <code>int_blood_pressure_latest</code>,{" "}
              <code>int_bmi_latest</code>,{" "}
              <code>int_smoking_status_latest</code>
            </td>
            <td>
              Each one picks a single record from a fuller history. Compare it
              with the matching <code>_all</code> model to see the grain change,
              the date it uses and how it breaks ties.
            </td>
          </tr>
          <tr>
            <td>
              <code>fct_person_</code> + <code>_register</code>
            </td>
            <td>
              <code>fct_person_asthma_register</code>,{" "}
              <code>fct_person_ckd_register</code>,{" "}
              <code>fct_person_diabetes_register</code>
            </td>
            <td>
              Related clinical facts, one row per person. Don&apos;t assume
              they&apos;re all built the same way. Compare their population,
              reference date, evidence and resolution rules.
            </td>
          </tr>
          <tr>
            <td>
              <code>fct_person_sus_</code>
            </td>
            <td>
              <code>fct_person_sus_uec_recent</code>,{" "}
              <code>fct_person_sus_apc_recent</code>,{" "}
              <code>fct_person_sus_op_recent</code>
            </td>
            <td>
              One person-level activity summary for each SUS dataset: urgent
              and emergency care, admitted patient care and outpatients. They
              share a shape, which makes the differences easier to read. Each
              dataset has its own rules for attendances, admissions and status.
            </td>
          </tr>
        </tbody>
      </table>
      <Callout kind="tip" title="Open the neighbours before writing SQL">
        <p>
          Search the prefix, subject and suffix separately. Then open two or
          three neighbouring SQL and YAML files. A family shows you the expected
          name, grain, tests and documentation better than any one example can.
        </p>
      </Callout>

      <h2>Practise picking a model by its name</h2>
      <p>
        Each task below describes what an analysis needs. Pick the model name
        that fits. A plausible name is only the first step.
        The next chapter shows how to check a model&apos;s description, tests
        and lineage before you decide to use it.
      </p>
      <ModelFinder />

      <h2>Name a new model after its job</h2>
      <p>
        Decide what the model does first, then name it. Borrow the subject words
        its neighbours already use. Add a suffix when it separates a time, grain
        or selection rule. Words like <code>_final</code>, <code>_new</code>,{" "}
        <code>_v2</code> or <code>enriched</code> tell the next reader nothing
        about the rows. They also stop being true the moment someone makes
        another version.
      </p>
      <p>
        Shared models are named for their concept, so a shared pathway model
        should describe pathways. Published models are the exception. They exist
        to serve one product, so naming the product is fair, as in{" "}
        <code>ltc_lcs_cf_dashboard_base</code>. The{" "}
        <Link href="/reference">naming reference</Link> keeps these patterns in
        one place for lookup.{" "}
        <Link href="/learn/finding-models">Finding models</Link> puts the names
        to work in a full search.
      </p>

      <Quiz
        title="Read the taxonomy"
        questions={[
          {
            prompt:
              "What is the important difference between int_hba1c_all and int_hba1c_latest?",
            options: [
              "They are maintained by different teams",
              "They have different grains: one row per result versus the latest result per person",
              "Only the latest model belongs in the DAG",
              "The all model is raw while the latest model is staged",
            ],
            answer: 1,
            explain:
              "The suffix shows a change of grain. _all keeps every qualifying result. _latest keeps one per person.",
          },
          {
            prompt:
              "You think a new person-level housebound model is needed. What should happen first?",
            options: [
              "Search for housebound and inspect the dim_person_* family",
              "Choose the shortest available filename",
              "Add _v2 so it cannot clash with older work",
              "Start from the dashboard query and name it when the SQL is finished",
            ],
            answer: 0,
            explain:
              "A search turns up dim_person_housebound_status, which already exists. If a model really is new, its neighbours show you the convention to follow.",
          },
        ]}
      />
    </LessonShell>
  );
}
