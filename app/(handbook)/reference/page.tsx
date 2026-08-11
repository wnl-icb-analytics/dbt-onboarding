import type { Metadata } from "next";
import Link from "next/link";
import { CommandReference } from "@/components/CommandReference";

export const metadata: Metadata = { title: "Command reference" };

export default function Page() {
  return (
    <article className="lesson mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="rise mb-8 border-b-2 border-ink pb-6">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-flame">
          Keep handy
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Command reference
        </h1>
        <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-ink-soft">
          The commands and naming rules you will actually use, searchable and
          copy-paste ready.
        </p>
      </header>
      <div className="rise rise-2">
        <CommandReference />

        <h2>Naming cheat sheet</h2>
        <p>
          Need the reasoning rather than the lookup? The{" "}
          <Link href="/learn/model-naming">model taxonomy lesson</Link>{" "}covers
          reading names, model families and search-before-build.
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
              <td>Auto-generated 1:1 source view — never edit</td>
            </tr>
            <tr>
              <td><code>stg_</code></td>
              <td>Staging</td>
              <td>Cleaned single-source model, no joins</td>
            </tr>
            <tr>
              <td><code>int_</code></td>
              <td>Modelling</td>
              <td>Intermediate building block</td>
            </tr>
            <tr>
              <td><code>dim_</code> / <code>fct_</code></td>
              <td>Reporting</td>
              <td>Dimension / fact, analyst-facing</td>
            </tr>
            <tr>
              <td><code>pit_</code> / <code>obt_</code> / <code>dq_</code></td>
              <td>Reporting</td>
              <td>Point-in-time / one-big-table / data-quality</td>
            </tr>
            <tr>
              <td><code>sem_</code></td>
              <td>Semantic</td>
              <td>Snowflake semantic view (semantic layer)</td>
            </tr>
          </tbody>
        </table>
        <p>
          Programmes may add their own reporting prefixes (<code>cltcs_</code>,{" "}
          <code>def_</code>) — the layer rules above still apply.
        </p>

        <h2>Suffixes: what one row means</h2>
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
              <td>Event — every record ever, many per person</td>
              <td><code>int_hba1c_all</code></td>
            </tr>
            <tr>
              <td><code>_latest</code></td>
              <td>Person — most recent record only</td>
              <td><code>int_hba1c_latest</code></td>
            </tr>
            <tr>
              <td><code>_current</code> / <code>_historical</code></td>
              <td>Active now / full history</td>
              <td><code>dim_person_current_practice</code></td>
            </tr>
            <tr>
              <td><code>_summary</code></td>
              <td>Group — an aggregated rollup</td>
              <td><code>dim_person_status_summary</code></td>
            </tr>
          </tbody>
        </table>

        <h2>Name families worth searching</h2>
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
              <td>Every person-level attribute block: age, ethnicity, care home, language…</td>
            </tr>
            <tr>
              <td><code>fct_person_&#123;condition&#125;_register</code></td>
              <td>Every disease register — 40+ conditions</td>
            </tr>
            <tr>
              <td><code>int_&#123;drug class&#125;_medications_all</code></td>
              <td>Medication order events per BNF-style class</td>
            </tr>
            <tr>
              <td><code>stg_&#123;source&#125;_&#123;table&#125;</code></td>
              <td>The cleaned version of any source table; mirrors <code>raw_&#123;source&#125;_&#123;table&#125;</code></td>
            </tr>
          </tbody>
        </table>

        <h2>Branch & commit conventions</h2>
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
              <td><code>feat/opening-hours-staging</code></td>
            </tr>
            <tr>
              <td>Commit</td>
              <td><code>type: imperative description</code></td>
              <td><code>feat: add opening hours staging model</code></td>
            </tr>
            <tr>
              <td>Types</td>
              <td colSpan={2}>
                <code>feat</code> <code>fix</code> <code>docs</code>{" "}
                <code>refactor</code> <code>test</code> <code>chore</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
