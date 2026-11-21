import type { Metadata } from "next";
import Link from "next/link";
import { ReferenceShell } from "@/components/ReferenceShell";
export const metadata: Metadata = { title: "Dataset and model directory" };
export default function Page() {
  return (
    <ReferenceShell
      title="Dataset and model directory"
      lede="This directory lists the project's source families, model folders and the outputs you'll meet most. Use it to find candidates, then read each model's description, SQL and tests before you rely on it."
    >
      <p>
        This directory gives example models by dataset and folder. It
        isn&apos;t a full catalogue and doesn&apos;t update itself. For every
        model on <code>main</code>, open <Link href="/models">Model docs</Link>.
      </p>
      <p>
        The <Link href="/learn/the-data">data chapter</Link> explains the source
        families and identifiers.{" "}
        <Link href="/learn/finding-models">Finding and reusing models</Link>{" "}
        shows how to judge whether a candidate fits your question.
      </p>
      <h2>Common outputs</h2>
      <p>These are the kinds of model you&apos;ll meet most.</p>
      <table>
        <thead>
          <tr>
            <th>What the project creates</th>
            <th>Models to recognise</th>
            <th>What they provide</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Person spines and descriptive dimensions</td>
            <td>
              <code>dim_person_demographics</code>,{" "}
              <code>dim_person_demographics_historical</code>,{" "}
              <code>dim_person_pseudo</code>
            </td>
            <td>
              Current and historical OLIDS demographics, registration and
              geography. <code>dim_person_pseudo</code> maps a{" "}
              <code>person_id</code> to its <code>sk_patient_id</code> and
              HxFlake pseudonym. People without an <code>sk_patient_id</code>{" "}
              aren&apos;t in it, and several <code>person_id</code>s can share
              one key and pseudonym.
            </td>
          </tr>
          <tr>
            <td>Clinical populations</td>
            <td>
              <code>fct_person_*_register</code>
            </td>
            <td>
              Shared definitions of diabetes, asthma, COPD, CKD and other
              registers, with the evidence behind each person&apos;s membership
            </td>
          </tr>
          <tr>
            <td>Condition histories</td>
            <td>
              <code>fct_person_condition_episodes</code>
            </td>
            <td>
              Episodes with start and end dates, built from diagnosis and
              resolution codes. A condition that resolves and comes back gets a
              new episode.
            </td>
          </tr>
          <tr>
            <td>Latest clinical states</td>
            <td>
              <code>int_*_latest</code>
            </td>
            <td>
              One selected HbA1c, blood pressure, eGFR, smoking status or other
              qualifying result per person
            </td>
          </tr>
          <tr>
            <td>Activity facts</td>
            <td>
              <code>fct_person_sus_*_recent</code>,{" "}
              <code>fct_person_gp_recent</code>
            </td>
            <td>
              Recent urgent care, admitted care, outpatient and GP activity, one
              row per person
            </td>
          </tr>
          <tr>
            <td>Waiting-list facts and summaries</td>
            <td>
              <code>int_wl_current</code>,{" "}
              <code>fct_person_wl_current_count_*</code>,{" "}
              <code>fct_provider_wl_current_count_total</code>
            </td>
            <td>
              Open pathways at the latest census date, with counts by person,
              provider and treatment function
            </td>
          </tr>
          <tr>
            <td>Wide analytical marts</td>
            <td>
              <code>person_month_analysis_base</code>,{" "}
              <code>obt_person_activity</code>,{" "}
              <code>fct_person_resource_index</code>
            </td>
            <td>
              Person-month population-health history, combined activity and
              resource use, already joined at a grain that suits analysis
            </td>
          </tr>
          <tr>
            <td>Data-quality outputs</td>
            <td>
              <code>dq_*</code>
            </td>
            <td>
              Records that break a documented quality expectation. Investigate
              them. Don&apos;t analyse them as ordinary data.
            </td>
          </tr>
          <tr>
            <td>Products for named uses</td>
            <td>
              <code>models/published/</code>
            </td>
            <td>
              Tables and views built for one dashboard, report, extract or
              operational process
            </td>
          </tr>
        </tbody>
      </table>
      <h2>OLIDS model folders</h2>
      <p>
        These folders hold the models built from OLIDS tables. The team&apos;s
        upstream dbt-olids project maps the clinical codes and resolves person
        identity first, then publishes the tables this project reads from{" "}
        <code>DATA_LAKE.OLIDS</code>.
      </p>
      <table>
        <thead>
          <tr>
            <th>Folder</th>
            <th>What it holds</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>modelling/olids/observations</code>
            </td>
            <td>
              Clinical measurements, usually as <code>_all</code> and{" "}
              <code>_latest</code> pairs
            </td>
            <td>
              <code>int_hba1c_latest</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/olids/medications</code>
            </td>
            <td>Order histories by drug class, and polypharmacy</td>
            <td>
              <code>int_lipid_lowering_medications_all</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/olids/diagnoses</code>
            </td>
            <td>Diagnosis and resolution evidence for each condition</td>
            <td>
              <code>int_diabetes_diagnoses_all</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/olids/person_attributes</code>
            </td>
            <td>Ethnicity, smoking, housebound status, registrations</td>
            <td>
              <code>int_ethnicity_all</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/olids/programme/*</code>
            </td>
            <td>
              Programme logic built from the shared blocks, such as
              immunisations, screening, LTC case-finding and SMI
            </td>
            <td>
              <code>programme/flu</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/olids/person_demographics</code>
            </td>
            <td>The person spine, current and historical</td>
            <td>
              <code>dim_person_demographics</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/olids/person_status</code>
            </td>
            <td>Care home, housebound, carer, opt-out and other statuses</td>
            <td>
              <code>dim_person_care_home</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/olids/disease_registers</code>
            </td>
            <td>
              QOF registers, each with a <code>pit_</code> point-in-time twin.
              Also other registers, monthly register histories and condition
              episodes.
            </td>
            <td>
              <code>fct_person_diabetes_register</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/olids/measures</code>
            </td>
            <td>Care-process and control measures</td>
            <td>
              <code>fct_person_bp_control</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/olids/risk_stratification</code>
            </td>
            <td>
              Frailty (eFI2) and Cambridge Comorbidity scores per person. The
              scoring logic lives in <code>stat_models/</code>.
            </td>
            <td>
              <code>fct_person_efi2</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/olids/data_quality</code>
            </td>
            <td>Records that break a documented quality expectation</td>
            <td>
              <code>dq_hba1c_issues</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/olids/person_analytics</code>
            </td>
            <td>The person-month analysis mart and recent GP activity</td>
            <td>
              <code>person_month_analysis_base</code>
            </td>
          </tr>
        </tbody>
      </table>
      <h2>OLIDS search patterns</h2>
      <table>
        <thead>
          <tr>
            <th>What you need</th>
            <th>Search for</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Every recorded value of a measurement</td>
            <td>
              <code>int_*_all</code>
            </td>
            <td>
              <code>int_hba1c_all</code>
            </td>
          </tr>
          <tr>
            <td>The latest qualifying value per person</td>
            <td>
              <code>int_*_latest</code>
            </td>
            <td>
              <code>int_egfr_latest</code>
            </td>
          </tr>
          <tr>
            <td>Medication orders for a drug class</td>
            <td>
              <code>int_*_medications_all</code>
            </td>
            <td>
              <code>int_sglt2_medications_all</code>
            </td>
          </tr>
          <tr>
            <td>Diagnosis evidence for a condition</td>
            <td>
              <code>int_*_diagnoses_all</code>
            </td>
            <td>
              <code>int_ckd_diagnoses_all</code>
            </td>
          </tr>
          <tr>
            <td>Current register membership</td>
            <td>
              <code>fct_person_*_register</code>
            </td>
            <td>
              <code>fct_person_diabetes_register</code>
            </td>
          </tr>
          <tr>
            <td>A register as at a reference date</td>
            <td>
              <code>pit_*_register</code>
            </td>
            <td>
              <code>pit_diabetes_register</code>
            </td>
          </tr>
          <tr>
            <td>A person attribute or status</td>
            <td>
              <code>dim_person_*</code>
            </td>
            <td>
              <code>dim_person_care_home</code>
            </td>
          </tr>
          <tr>
            <td>Records that break a quality expectation</td>
            <td>
              <code>dq_*</code>
            </td>
            <td>
              <code>dq_hba1c_issues</code>
            </td>
          </tr>
        </tbody>
      </table>
      <h2>Commissioning source folders</h2>
      <p>
        These are the staging folders under{" "}
        <code>staging/commissioning/</code>. Each holds the cleaned interface to
        one national or provider dataset.
      </p>
      <table>
        <thead>
          <tr>
            <th>Folder</th>
            <th>What we use it for</th>
            <th>Examples downstream</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>sus</code>
            </td>
            <td>Admitted care, outpatients and urgent and emergency care</td>
            <td>
              <code>fct_person_sus_apc_recent</code>,{" "}
              <code>fct_person_sus_op_recent</code>,{" "}
              <code>fct_person_sus_uec_recent</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>wl</code>
            </td>
            <td>Weekly waiting-list (WLMDS) census snapshots</td>
            <td>
              <code>int_wl_current</code>,{" "}
              <code>fct_provider_wl_current_count_total</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>epd</code>
            </td>
            <td>
              Primary-care dispensing from the English Prescribing Dataset
            </td>
            <td>Practice and organisation prescribing analysis</td>
          </tr>
          <tr>
            <td>
              <code>csds</code>
            </td>
            <td>Community services referrals, contacts and activity</td>
            <td>
              <code>int_csds_encounters</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>mhsds</code>
            </td>
            <td>Mental-health referrals, contacts, spells and ward stays</td>
            <td>
              <code>int_mhsds_spell_encounters</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>slam</code>
            </td>
            <td>
              Provider contract-monitoring activity and actual costs, from
              cumulative submissions
            </td>
            <td>
              <code>int_cost_index_slam_activity_monthly</code>,{" "}
              <code>fct_person_resource_index</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>ers</code>
            </td>
            <td>NHS e-Referral Service referrals and actions</td>
            <td>
              <code>fct_ers_referral</code>,{" "}
              <code>fct_ers_referral_action</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>asc_cld</code>
            </td>
            <td>Adult social care client-level records</td>
            <td>
              <code>fct_person_asc_service_recent</code>
            </td>
          </tr>
        </tbody>
      </table>
      <h2>Secondary care and cross-system model folders</h2>
      <p>
        Beyond staging, these models live in folders named for the care
        setting, such as <code>acute</code>, <code>community</code> and{" "}
        <code>mental_health</code>. Work that joins settings goes in{" "}
        <code>cross_system</code>.
      </p>
      <table>
        <thead>
          <tr>
            <th>Folder</th>
            <th>What it holds</th>
            <th>Examples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>modelling/acute/encounters</code>,{" "}
              <code>modelling/community/encounters</code>,{" "}
              <code>modelling/mental_health/encounters</code>
            </td>
            <td>
              SUS, CSDS and MHSDS activity shaped into encounters and spells.
              Acute also imputes and merges admitted-patient spells.
            </td>
            <td>
              <code>int_sus_apc_encounter</code>
              <br />
              <code>int_sus_apc_merged_spells</code>
              <br />
              <code>int_csds_encounters</code>
              <br />
              <code>int_mhsds_spell_encounters</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/population/demographics</code>
            </td>
            <td>
              A person view combining PDS, SUS, prescribing and other national
              datasets
            </td>
            <td>
              <code>int_person_pmi_combined</code>
              <br />
              <code>int_person_pds_demographics</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/acute/activities</code>
            </td>
            <td>Named activity groupings, each defined once</td>
            <td>
              <code>int_activity_ambulatory_sensitive_nel</code>
              <br />
              <code>int_activity_cancer</code>
              <br />
              <code>int_activity_maternity</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/*/cost_index</code>
            </td>
            <td>
              Monthly costed activity per person for each feed, combined in{" "}
              <code>cross_system</code>
            </td>
            <td>
              <code>int_person_cost_index_actual_monthly</code>
              <br />
              <code>int_cost_index_csds_activity_monthly</code>
              <br />
              <code>int_cost_index_mhsds_activity_monthly</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/waiting_lists</code>,{" "}
              <code>reporting/waiting_lists</code>
            </td>
            <td>
              The current open-pathway population and its counts by person and
              provider
            </td>
            <td>
              <code>int_wl_current</code>
              <br />
              <code>fct_person_wl_current_count_total</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/acute</code>
            </td>
            <td>
              Recent activity per person, and wide event tables for admitted,
              outpatient and emergency care
            </td>
            <td>
              <code>fct_person_sus_apc_recent</code>
              <br />
              <code>obt_encounter_apc</code>
              <br />
              <code>obt_encounter_uec</code>
              <br />
              <code>obt_appointment_op</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/cross_system/person_level</code>
            </td>
            <td>Person-level activity across settings, overall and by month</td>
            <td>
              <code>obt_person_activity</code>
              <br />
              <code>fct_person_activity_by_month</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/cross_system/resource_index</code>
            </td>
            <td>
              Actual against expected resource use, broken down by area,
              deprivation, borough and ward
            </td>
            <td>
              <code>fct_person_resource_index</code>
              <br />
              <code>fct_resource_index_by_area</code>
              <br />
              <code>fct_resource_index_by_imd_quintile</code>
            </td>
          </tr>
        </tbody>
      </table>
    </ReferenceShell>
  );
}
