import type { Metadata } from "next";
import Link from "next/link";
import { CommandReference } from "@/components/CommandReference";

export const metadata: Metadata = { title: "Command reference" };

export default function Page() {
  return (
    <article className="lesson mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="rise mb-8 border-b border-line pb-6">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-flame">
          Keep handy
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Command reference
        </h1>
        <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-ink-soft">
          The commands and naming rules you&apos;ll use most, ready to search
          and copy. For the reasoning behind them, read{" "}
          <Link href="/learn">the guide</Link>.
        </p>
      </header>
      <div className="rise rise-2">
        <p>Four other pages help you look things up.</p>
        <ul>
          <li>
            The <Link href="/reference/datasets">dataset and model directory</Link>{" "}
            maps source families and folders to the main models in each.
          </li>
          <li>
            The <Link href="/reference/operations">production reference</Link>{" "}
            lists the workflows, schedules and run records.
          </li>
          <li>
            <Link href="/models">Model docs</Link> has every model, column and
            test on <code>main</code>, with lineage.
          </li>
          <li>
            The <Link href="/changelog">changelog</Link> shows what changed in
            the warehouse, from merged pull requests.
          </li>
        </ul>
        <CommandReference />

        <h2>Naming cheat sheet</h2>
        <p>
          Start with the prefix. It tells you the model&apos;s layer, so{" "}
          <code>stg_</code>{" "}means the cleaned interface to a source table.
          Look a prefix up below, or read{" "}
          <Link href="/learn/model-naming">Reading model names</Link>{" "}for
          worked examples and why you search before you build.
        </p>
        <table>
          <thead>
            <tr>
              <th>Prefix</th>
              <th>Layer</th>
              <th>Means</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>raw_</code></td>
              <td>Raw</td>
              <td>Generated 1:1 view of a source table. Never edit by hand.</td>
            </tr>
            <tr>
              <td><code>stg_</code></td>
              <td>Staging</td>
              <td>The one cleaned interface to a source object. Joins only for cleaning every consumer needs.</td>
            </tr>
            <tr>
              <td><code>int_</code></td>
              <td>Modelling</td>
              <td>A named, tested transformation or shared rule</td>
            </tr>
            <tr>
              <td><code>dim_</code> / <code>fct_</code></td>
              <td>Reporting</td>
              <td>Dimension or fact for direct analysis</td>
            </tr>
            <tr>
              <td><code>pit_</code> / <code>obt_</code> / <code>dq_</code></td>
              <td>Reporting</td>
              <td>Point-in-time, one big table, data quality</td>
            </tr>
            <tr>
              <td><code>ptr_</code></td>
              <td>Partner</td>
              <td>Partner-facing mart</td>
            </tr>
            <tr>
              <td><code>sem_</code></td>
              <td>Semantic</td>
              <td>Snowflake semantic view</td>
            </tr>
          </tbody>
        </table>
        <p>
          Reporting also uses <code>def_</code>{" "}for shared indicator
          definitions. A programme may own an established prefix such as{" "}
          <code>cltcs_</code>, and the layer rules above still apply to it.
          Reference and published models have no fixed prefix. Follow the
          names already used in the same folder or product family.
        </p>

        <h2>Suffixes tell you what one row means</h2>
        <table>
          <thead>
            <tr>
              <th>Suffix</th>
              <th>One row per</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>_all</code></td>
              <td>Event. Every record, so many rows per person.</td>
              <td><code>int_hba1c_all</code></td>
            </tr>
            <tr>
              <td><code>_latest</code></td>
              <td>Person, holding the most recent record</td>
              <td><code>int_hba1c_latest</code></td>
            </tr>
            <tr>
              <td><code>_current</code> / <code>_historical</code></td>
              <td>What holds now, or the full history</td>
              <td><code>int_wl_current</code>, <code>dim_person_demographics_historical</code></td>
            </tr>
            <tr>
              <td><code>_summary</code></td>
              <td>A roll-up to the grain named just before it</td>
              <td><code>fct_ltc_lcs_practice_summary</code></td>
            </tr>
          </tbody>
        </table>

        <h2>Name families to search</h2>
        <table>
          <thead>
            <tr>
              <th>Pattern</th>
              <th>Finds</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>dim_person_</code></td>
              <td>Person attributes such as age, ethnicity, care home and main language</td>
            </tr>
            <tr>
              <td><code>fct_person_&#123;condition&#125;_register</code></td>
              <td>Every disease register, more than 40 conditions</td>
            </tr>
            <tr>
              <td><code>int_&#123;drug class&#125;_medications_all</code></td>
              <td>Medication orders for one BNF-based drug class</td>
            </tr>
            <tr>
              <td><code>stg_&#123;source&#125;_&#123;table&#125;</code></td>
              <td>The cleaned version of a source table. It mirrors <code>raw_&#123;source&#125;_&#123;table&#125;</code>.</td>
            </tr>
          </tbody>
        </table>

        <h2>Branch and commit conventions</h2>
        <table>
          <thead>
            <tr>
              <th>Thing</th>
              <th>Format</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Branch</td>
              <td><code>type/short-description</code></td>
              <td><code>feat/fin-week-staging</code></td>
            </tr>
            <tr>
              <td>Commit</td>
              <td><code>type: imperative description</code></td>
              <td><code>feat: add financial week staging model</code></td>
            </tr>
            <tr>
              <td>Types</td>
              <td colSpan={2}>
                <code>feat</code> <code>fix</code> <code>docs</code>{" "}
                <code>refactor</code> <code>test</code> <code>chore</code>{" "}
                <code>perf</code> <code>ci</code>
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          A check on every pull request rejects a title that doesn&apos;t
          start with one of these types.
        </p>
      </div>
    </article>
  );
}
