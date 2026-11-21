import type { Metadata } from "next";
import Link from "next/link";
import { ReferenceShell } from "@/components/ReferenceShell";
export const metadata: Metadata = { title: "Dataset and model directory" };
export default function Page() {
  return (
    <ReferenceShell
      title="Dataset and model directory"
      lede="Source families, folders and representative outputs. Use this directory to find candidates, then read each model's description, SQL and tests."
    >
      <p>
        The <Link href="/learn/the-data">data lesson</Link> explains the source
        families and identifiers.{" "}
        <Link href="/learn/finding-models"> Finding models</Link> explains how
        to judge whether a candidate fits your question. Names below are
        examples, not a complete or automatically updated catalogue.
      </p>
      <h2>Common outputs</h2>
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
              Current and historical OLIDS demographics, registration,
              geography, and the bridge used where cross-dataset linkage is
              available
            </td>
          </tr>
          <tr>
            <td>Clinical populations</td>
            <td>
              <code>fct_person_*_register</code>
            </td>
            <td>
              Reusable definitions of diabetes, asthma, COPD, CKD and other
              clinical registers, with the evidence behind membership
            </td>
          </tr>
          <tr>
            <td>Condition histories</td>
            <td>
              <code>fct_person_condition_episodes</code>
            </td>
            <td>
              Diagnosis-based episodes with start and end dates, including
              repeated cycles where a condition can resolve and recur
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
              Recent urgent care, admitted care, outpatient and GP activity at a
              documented person grain
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
              The current open-pathway population and supported counts by
              person, provider and treatment function
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
              Person-month population-health history and other related reporting
              facts composed at convenient analytical grains
            </td>
          </tr>
          <tr>
            <td>Data-quality outputs</td>
            <td>
              <code>dq_*</code>
            </td>
            <td>
              Records that fail a documented quality expectation and need
              investigation rather than ordinary analysis
            </td>
          </tr>
          <tr>
            <td>Products for named uses</td>
            <td>
              <code>models/published/</code>
            </td>
            <td>
              Tables and views composed for specific dashboards, reports,
              extracts and operational processes
            </td>
          </tr>
        </tbody>
      </table>
      <h2>OLIDS model folders</h2>
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
              Clinical measurements as <code>_all</code>/<code>_latest</code>{" "}
              pairs
            </td>
            <td>
              <code>int_hba1c_latest</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/olids/medications</code>
            </td>
            <td>Drug-class order histories and polypharmacy </td>
            <td>
              <code>int_statin_medications_all</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/olids/diagnoses</code>
            </td>
            <td>Diagnosis and resolution evidence per condition </td>
            <td>
              <code>int_diabetes_diagnoses_all</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/olids/person_attributes</code>
            </td>
            <td>Ethnicity, smoking, housebound, registrations</td>
            <td>
              <code>int_ethnicity_all</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/olids/risk_stratification</code>
            </td>
            <td>Frailty and case-management scores</td>
            <td>
              <code>int_efi2_scores</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/olids/programme/*</code>
            </td>
            <td>
              Programme logic composing the shared blocks (including
              immunisations, screening, LTC case-finding, SMI…)
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
              QOF registers, each with a <code>pit_</code> point-in-time twin,
              further registers, condition episodes
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
              <code>reporting/olids/data_quality</code>
            </td>
            <td>Records failing a documented quality expectation</td>
            <td>
              <code>dq_hba1c_issues</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/olids/person_analytics</code>
            </td>
            <td>The person-month analysis mart</td>
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
            <td>Records failing a quality expectation</td>
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
            <td>Referral-to-treatment waiting-list snapshots</td>
            <td>
              <code>int_wl_current</code>,{" "}
              <code>fct_provider_wl_current_count_total</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>epd</code>
            </td>
            <td>Primary-care prescribing in the English Prescribing Dataset</td>
            <td>Practice- and organisation-level prescribing analysis</td>
          </tr>
          <tr>
            <td>
              <code>csds</code>
            </td>
            <td>Community services referrals, contacts and activity</td>
            <td>Community-service pathway and activity models</td>
          </tr>
          <tr>
            <td>
              <code>mhsds</code>
            </td>
            <td>Mental-health referrals, contacts, spells and ward stays</td>
            <td>Mental-health pathway and activity models</td>
          </tr>
          <tr>
            <td>
              <code>slam</code>
            </td>
            <td>
              Provider contract-monitoring activity and actual costs from
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
            <td>Referral models linked through UBRN and person keys</td>
          </tr>
          <tr>
            <td>
              <code>asc_cld</code>
            </td>
            <td>Adult social care client-level records</td>
            <td>Adult social care analysis</td>
          </tr>
        </tbody>
      </table>
      <h2>Commissioning model folders</h2>
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
              <code>modelling/commissioning/encounters</code>
            </td>
            <td>
              SUS, CSDS and MHSDS activity standardised into encounters and
              spells — including merging and imputing admitted-patient spells
            </td>
            <td>
              <code>int_sus_apc_merged_spells</code>
              <br />
              <code>int_csds_encounters</code>
              <br />
              <code>int_mhsds_spell_encounters</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/commissioning/demographics</code>
            </td>
            <td>
              A person view assembled from PDS and other national datasets
            </td>
            <td>
              <code>int_person_pmi_combined</code>
              <br />
              <code>int_person_pds_demographics</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/commissioning/activities</code>
            </td>
            <td>Named activity groupings defined once</td>
            <td>
              <code>int_comm_ambulatory_sensitive_nel</code>
              <br />
              <code>int_comm_cancer</code>
              <br />
              <code>int_comm_maternity</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>modelling/commissioning/cost_index</code>
            </td>
            <td>
              Monthly costed activity per person across the activity feeds
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
              <code>reporting/commissioning/person_level</code>
            </td>
            <td>
              Person-grain recent-activity facts and current waiting-list counts
            </td>
            <td>
              <code>fct_person_sus_apc_recent</code>
              <br />
              <code>fct_person_gp_recent</code>
              <br />
              <code>fct_person_wl_current_count_total</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/commissioning/events</code>
            </td>
            <td>
              Event-grain wide tables for admitted, outpatient and emergency
              care
            </td>
            <td>
              <code>obt_encounter_apc</code>
              <br />
              <code>obt_encounter_uec</code>
              <br />
              <code>obt_appointment_op</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/commissioning/person_history</code>
            </td>
            <td>Monthly person-level activity history</td>
            <td>
              <code>fct_person_activity_by_month</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>reporting/commissioning/resource_index</code>
            </td>
            <td>
              Actual versus expected resource use, with area, deprivation and
              borough breakdowns
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
