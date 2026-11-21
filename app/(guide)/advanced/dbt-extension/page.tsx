import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { Callout } from "@/components/Callout";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "The dbt extension" };

export default function Page() {
  return (
    <LessonShell
      section="advanced"
      slug="dbt-extension"
      kicker="Going further 01"
      title="The dbt extension"
      lede="The same Fusion engine the project pins also powers a VS Code extension that understands your SQL as you type — catching errors before a build, renaming a column across the whole project, and tracing lineage without leaving the file."
      minutes={7}
    >
      <h2>What it is</h2>
      <p>
        The <strong>dbt VS Code extension</strong>{" "}is the official extension from dbt
        Labs. It runs a language server on your machine, backed by the dbt{" "}
        <strong>Fusion engine</strong> — the same engine this project already pins for
        setup, <code>dbt compile</code>{" "}and <code>dbt build</code>. Because Fusion
        actually parses and type-checks your SQL rather than treating it as text, the
        editor knows your models, your columns and their types, and can act on that
        knowledge while you work.
      </p>
      <p>
        The headline difference from a Snowflake worksheet: feedback arrives{" "}
        <em>as you type</em>, and edits understand the whole project, not just the open
        file. That is what makes the features below worth turning on.
      </p>

      <Callout kind="info" title="Fusion only — not dbt Core">
        <p>
          The extension is only compatible with the dbt Fusion engine, which is exactly
          what the project uses, so you are already set up for it. It does not work with
          classic dbt Core.
        </p>
      </Callout>

      <Callout kind="tip" title="Sign in with a free dbt Cloud account">
        <p>
          Install the extension and it works straight away. The most powerful features —
          column-level rename and lineage, type-aware error detection, hover types — are
          locked behind a dbt Cloud sign-in, and a <strong>free</strong>{" "}account
          unlocks them. Worth creating one on day one.
        </p>
      </Callout>

      <h2>Live error detection</h2>
      <p>
        As you type, the extension underlines problems in red and lists them in the{" "}
        <strong>Problems</strong>{" "}panel — without running anything against Snowflake.
        Hover a red squiggle to read the message. It catches the obvious typos (missing
        commas, misspelled keywords, broken Jinja) and, with Fusion&apos;s SQL
        comprehension, the deeper ones too: an unknown column name, a missing{" "}
        <code>group by</code>, an unaggregated column, the wrong arguments to a function,
        type and schema errors.
      </p>
      <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-graphite-deep shadow-[5px_5px_0_0_var(--color-flame)]">
        <div className="border-b border-white/10 px-5 py-2.5">
          <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">
            stg_reference_opening_hours.sql
          </span>
        </div>
        <div className="p-5 font-mono text-[12.5px] leading-7 text-white/85">
          <p className="!my-0">select</p>
          <p className="!my-0 pl-4">site_code,</p>
          <p className="!my-0 pl-4">
            <span className="text-[#ff8c6b] underline decoration-wavy decoration-[#ff5a36] underline-offset-4">
              day_of_wek
            </span>
          </p>
          <p className="!my-0">from {"{{ ref('raw_reference_opening_hours') }}"}</p>
        </div>
        <figcaption className="border-t border-white/10 px-5 py-2.5 font-mono text-[11px] text-[#ff8c6b]">
          ✶ Unknown column &quot;day_of_wek&quot; — did you mean &quot;day_of_week&quot;?
        </figcaption>
      </figure>
      <p>
        The point is the timing. A worksheet finds that typo when the query fails; here
        it is underlined the moment you write it, before you have built anything.
      </p>

      <h2>Rename a symbol everywhere</h2>
      <p>
        This is the feature that changes how it feels to work in a project with 1,500+
        models. Instead of find-and-replace across the repo and hoping you caught every
        reference, you rename once and the extension updates every dependant.
      </p>
      <ul>
        <li>
          <strong>Rename a model</strong> — right-click the file in the tree and choose{" "}
          <strong>Rename</strong>. Every <code>ref()</code>{" "}to it across the project is
          rewritten. You can preview the changes before applying them.
        </li>
        <li>
          <strong>Rename a column</strong> — put the cursor on a column alias and press{" "}
          <strong>Rename Symbol</strong>{" "}(<code>F2</code>). Downstream references to
          that column are updated project-wide, because Fusion tracks the column through
          the lineage — not by matching text.
        </li>
      </ul>
      <figure className="my-6 rounded-2xl border-2 border-ink bg-paper p-5 shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="rounded-xl border-2 border-flame bg-flame-soft p-3 sm:w-2/5">
            <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-wider !text-flame-deep">
              You rename, once
            </p>
            <p className="!mb-0 !mt-1.5 font-mono text-[12px] !text-ink">
              stg_…opening_hours.sql
            </p>
            <p className="!mb-0 !mt-1 font-mono text-[12px] !text-ink-soft">
              site_code → <span className="font-bold !text-flame-deep">location_code</span>
            </p>
          </div>
          <span className="self-center font-mono text-ink-faint" aria-hidden>
            →
          </span>
          <div className="rounded-xl border-2 border-layer-modelling bg-layer-modelling/5 p-3 sm:flex-1">
            <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-wider !text-layer-modelling">
              Every dependant updates automatically
            </p>
            <ul className="!mb-0 !mt-1.5 space-y-1 !pl-0">
              {["int_site_capacity.sql", "fct_access_hours.sql", "obt_site_summary.sql"].map(
                (f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 font-mono text-[12px] !text-ink-soft"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-layer-modelling" aria-hidden />
                    {f}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </figure>
      <Callout kind="warn" title="What rename does not cover yet">
        <p>
          Column rename relies on strict static analysis, so it is not yet supported for
          snapshots or for columns declared in <code>.yml</code>{" "}files. After a rename,
          a quick <code>dbt compile</code>{" "}is still the honest confirmation that the
          project renders cleanly.
        </p>
      </Callout>

      <h2>Lineage and navigation in context</h2>
      <p>
        Two everyday questions — &quot;where does this come from?&quot; and &quot;what
        breaks if I change it?&quot; — get answered without leaving the editor.
      </p>
      <ul>
        <li>
          <strong>Go to definition</strong> — <code>Cmd</code>/<code>Ctrl</code>-click a{" "}
          <code>ref()</code>, <code>source()</code>{" "}or macro to jump straight to the
          file that defines it; the same works for column and CTE definitions.
        </li>
        <li>
          <strong>Lineage tab</strong> — opens a DAG focused on the file you are in;
          double-click a node to open that model. Switch it to{" "}
          <strong>column-level lineage</strong>{" "}to trace a single column up and down
          the graph.
        </li>
      </ul>

      <h2>Rounding out the toolkit</h2>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>How it works</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>View compiled code</td>
            <td>
              The code icon toggles a side-by-side view of the SQL Fusion will actually
              send to Snowflake; it updates as you save.
            </td>
          </tr>
          <tr>
            <td>Live preview</td>
            <td>
              The table icon (or <code>Cmd</code>/<code>Ctrl+Enter</code>) runs the
              model&apos;s SELECT and shows rows in a Query Results tab; a codelens above
              each CTE previews just that step&apos;s output.
            </td>
          </tr>
          <tr>
            <td>IntelliSense</td>
            <td>
              Autocomplete for <code>ref()</code>{" "}and <code>source()</code>{" "}names and
              dialect-aware SQL functions.
            </td>
          </tr>
          <tr>
            <td>Hover insights</td>
            <td>
              Hover <code>*</code>{" "}to see the columns it expands to; hover a column to
              see its data type.
            </td>
          </tr>
          <tr>
            <td>Build with selectors</td>
            <td>
              <code>Cmd</code>/<code>Ctrl+Shift+Enter</code>{" "}opens a quickpick to build
              a selection from the command palette.
            </td>
          </tr>
        </tbody>
      </table>

      <Quiz
        questions={[
          {
            prompt:
              "Live error detection underlines an unknown column the moment you type it. How?",
            options: [
              "It runs the query against Snowflake in the background on every keystroke",
              "Fusion parses and type-checks your SQL against the project's schemas locally, no warehouse needed",
              "It compares your file against the last successful nightly build",
              "It only checks once you save and run dbt compile",
            ],
            answer: 1,
            explain:
              "The whole point is that nothing hits the warehouse. Fusion understands the project's models and column types, so it can flag an unknown column or a bad function call as you type — far earlier than a build would.",
          },
          {
            prompt:
              "You use Rename Symbol on a column. How does the extension update downstream models so reliably?",
            options: [
              "It runs a query against Snowflake to find every dependant table",
              "Fusion statically analyses the project's SQL and follows the column through lineage",
              "It does a text find-and-replace for the old column name across the repo",
              "It only renames inside the file you have open",
            ],
            answer: 1,
            explain:
              "A text replace would hit false matches (a different table's column of the same name) and miss aliased ones. Because Fusion parses and type-checks the SQL, it knows which references are actually the same column and updates only those.",
          },
        ]}
      />
    </LessonShell>
  );
}
