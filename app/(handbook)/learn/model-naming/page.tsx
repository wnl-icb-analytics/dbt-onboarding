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
      kicker="Learn 06"
      title="Reading model names"
      lede="Most readers encounter a model name before they encounter its SQL. Reading the name helps you choose what to inspect next."
      minutes={7}
    >
      <h2>A model name is a small sentence</h2>
      <p>
        Names in this project normally contain three parts: a layer prefix, the
        domain subject, and a suffix where the model&apos;s shape needs to be
        made explicit.
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
              "staging model · the OLIDS observation table · universally cleaned",
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
            <td>Which shape or variant does it contain?</td>
            <td>
              <code>_all</code>, <code>_latest</code>, <code>_register</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Not every name needs all three parts. A staging model mirrors its
        source, so <code>stg_olids_observation</code> is complete. A canonical
        dimension such as <code>dim_person</code> needs no suffix.
      </p>
      <p>
        The grammar spans every dataset the project models, not just OLIDS
        primary-care records. The same three parts name SUS hospital activity (
        <code>fct_person_sus_apc_recent</code>), GP appointments (
        <code>fct_person_gp_recent</code>), waiting-list pathways (
        <code>int_wl_current</code>) and resource use (
        <code>fct_person_resource_index</code>). Learning to read it once makes
        every source&apos;s models legible.
      </p>

      <h2>Prefix: the model&apos;s role</h2>
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
            <td>A generated one-to-one interface to a landed source table</td>
          </tr>
          <tr>
            <td>
              <code>stg_</code>
            </td>
            <td>One source made legible and ready for downstream use</td>
          </tr>
          <tr>
            <td>
              <code>int_</code>
            </td>
            <td>A purposeful transformation that prepares data for marts</td>
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
            <td>A wide analytical table composed from established concepts</td>
          </tr>
          <tr>
            <td>
              <code>dq_</code>
            </td>
            <td>
              A data-quality output containing records that need attention
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        The prefix follows the model&apos;s responsibility, not its size or its
        grain.
      </p>

      <p>
        The{" "}
        <Link href="/learn/analytical-tables">analytical tables chapter</Link>{" "}
        explains facts and dimensions through examples. Here, read the prefix as
        a clue to the intended role. It does not prove the grain or tell you
        whether the model fits your population.
      </p>
      <Callout kind="info" title="These are this project's conventions">
        <p>
          dbt does not require <code>fct_</code>, <code>dim_</code> or this set
          of suffixes. The value comes from using one project naming grammar
          consistently. When generic dbt guidance differs, follow the documented
          project convention and make the difference explicit.
        </p>
      </Callout>

      <h2>Suffix: the model&apos;s shape</h2>
      <p>
        A suffix is useful when it distinguishes models about the same subject
        or warns that one row means something different.
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
            <td>
              Every qualifying event; several rows per person are possible
            </td>
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
            <td>The state effective now</td>
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
            <td>A roll-up at the grain named elsewhere in the model</td>
            <td>
              <code>fct_ltc_lcs_practice_summary</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Joining <code>int_hba1c_all</code> to a person-grain model can multiply
        its rows. The <code>_all</code>/<code>_latest</code> pair makes that
        grain difference visible before the join is written.
      </p>
      <Callout kind="info" title="The name is not the full contract">
        <p>
          &quot;Latest&quot; does not explain which date is used or how ties are
          resolved. Put those details in the model description, SQL and tests.
        </p>
      </Callout>

      <h2>Compare related names</h2>
      <p>
        Related names make differences easier to spot. Compare a history model
        with its latest-result model, then check their descriptions to see which
        date, population and selection rule each uses.
      </p>
      <p>
        The repository already contains dozens of person dimensions,
        latest-event models and person-register facts. Looking across one family
        is often the fastest way to understand its taxonomy because the repeated
        parts stay fixed while the meaningful differences become visible.
      </p>
      <table>
        <thead>
          <tr>
            <th>Search</th>
            <th>Models you will meet</th>
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
              The person is the described entity; the remaining words identify
              the attribute, relationship or composed person view.
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
              Each model selects one qualifying record from a richer history.
              Compare it with the matching <code>_all</code> model to see the
              grain change, selected date and tie-breaking rule.
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
              These are related person-grain clinical facts. Compare their
              population, reference time, evidence and resolution rules rather
              than assuming every register is constructed identically.
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
              One person-grain activity summary per SUS dataset: urgent and
              emergency care, admitted patient care, outpatients. The shared
              shape makes the differences worth reading: each dataset has its
              own attendance, admission and status rules.
            </td>
          </tr>
        </tbody>
      </table>
      <Callout kind="tip" title="Open neighbours before writing SQL">
        <p>
          Search the prefix, subject and suffix separately. Read two or three
          neighbouring SQL and YAML files. The family shows the expected name,
          grain, tests and documentation more reliably than an isolated example.
        </p>
      </Callout>

      <h2>Try reading the names</h2>
      <p>
        Use this exercise to practise the grammar. Finding a plausible name is
        the first step; the next chapter shows how to inspect descriptions,
        tests and lineage before deciding to use it.
      </p>
      <ModelFinder />
      <h2>Naming a model of your own</h2>
      <p>
        Choose the name after deciding what the model does. Use the same subject
        vocabulary as neighbouring models. Add a suffix when it distinguishes a
        time, grain or selection rule; words such as <code>_final</code> and{" "}
        <code> _new</code> tell the next reader very little.
      </p>
      <p>
        A shared pathway model should describe pathways. A published model can
        appropriately name its consumer, such as{" "}
        <code>asthma_dashboard_base</code>, because serving that product is its
        purpose. The <Link href="/reference"> naming reference</Link> keeps the
        patterns together for lookup.{" "}
        <Link href="/learn/finding-models">Finding models</Link> now puts the
        names to work in a complete search.
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
              "The suffix exposes a shape and grain change. _all retains every qualifying event; _latest selects one per person.",
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
              "Searching reveals that dim_person_housebound_status already exists. When a model is new, neighbouring names show the convention to follow.",
          },
        ]}
      />
    </LessonShell>
  );
}
