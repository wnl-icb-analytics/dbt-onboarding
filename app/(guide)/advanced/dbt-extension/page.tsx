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
      kicker="Going further 02"
      title="The dbt extension"
      lede="The dbt extension checks your models as you edit them in VS Code. It runs on Fusion, the engine that builds this project, so it can flag broken SQL, Jinja and refs before you build, update ref() calls when you rename a model, and show which models feed yours and which read it."
      minutes={8}
    >
      <h2>An editor that understands the project</h2>
      <p>
        The <strong>dbt VS Code extension</strong>{" "}is the official extension from
        dbt Labs. It runs a language server on your machine, backed by the dbt{" "}
        <strong>Fusion engine</strong>. That&apos;s the same engine the project uses
        for setup, <code>dbt compile</code>{" "}and <code>dbt build</code>. Fusion
        parses your SQL rather than treating it as text, so the editor knows your
        models and their dependencies and can act on that while you work.
      </p>
      <p>
        Compare that with a Snowflake worksheet. A worksheet tells you about a
        mistake when the query fails. The extension tells you while you type, and its
        edits can reach any file in the project.
      </p>
      <p>
        You may see different names in dbt Labs&apos; docs. They now call Fusion
        &quot;dbt v2&quot; and dbt Core &quot;dbt v1&quot;. The extension works with
        both, but its SQL understanding comes from Fusion, which is what we run.
      </p>

      <h2>The static_analysis setting controls what the editor checks</h2>
      <p>
        The project&apos;s <code>static_analysis</code>{" "}setting decides how
        deeply Fusion checks SQL before it runs, and so what the extension can do
        for you. Most models here use <code>baseline</code>, which catches broken
        syntax and references. Checking column names and types needs{" "}
        <code>strict</code>.
      </p>
      <p>
        There are three levels, <code>off</code>, <code>baseline</code>{" "}and{" "}
        <code>strict</code>. The project doesn&apos;t set one, so models get
        Fusion&apos;s default, <code>baseline</code>. Semantic views and analyses
        are set to <code>off</code>, along with a handful of individual models.
        Semantic-view definitions aren&apos;t ordinary SELECT statements, and
        analyses refer to tables by names Fusion can&apos;t resolve. Here&apos;s
        what each level gives you:
      </p>
      <table>
        <thead>
          <tr>
            <th>At baseline (this project)</th>
            <th>Only at strict (not in this project)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Syntax errors in SQL, Jinja and YAML</td>
            <td>Unknown columns, type errors and bad function arguments</td>
          </tr>
          <tr>
            <td>
              Go to definition for <code>ref()</code>, <code>source()</code>{" "}and
              macros
            </td>
            <td>Go to definition for columns</td>
          </tr>
          <tr>
            <td>Renaming a model across the project</td>
            <td>Renaming a column across the project</td>
          </tr>
          <tr>
            <td>Table-level lineage</td>
            <td>Column-level lineage</td>
          </tr>
          <tr>
            <td>Compiled SQL, previews and CTE previews</td>
            <td>
              Hover to see column types and what <code>*</code>{" "}expands to
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Strict mode is a project setting, not an editor preference. A model also
        can&apos;t be stricter than the models it reads from. So the right-hand
        column isn&apos;t something you can switch on for yourself. The rest of
        this page starts with what works at baseline. Strict-only features are
        marked, so you know not to expect them here. dbt&apos;s{" "}
        <a href="https://docs.getdbt.com/docs/build/about-static-analysis">
          static analysis guide
        </a>{" "}
        compares the levels.
      </p>
      <p>
        The extension is free, and you don&apos;t need an account for its editor
        features. Signing in to a dbt platform account adds a little more, such as the{" "}
        <strong>Catalog</strong>{" "}tab and platform metadata in the model docs. You
        don&apos;t need it for anything on this page.
      </p>

      <h2>The editor flags errors as you type</h2>
      <p>
        As you type, the extension underlines problems in red and lists them in the{" "}
        <strong>Problems</strong>{" "}panel. Nothing runs against Snowflake. Hover a red
        squiggle to read the message. At baseline it catches structural mistakes,
        like broken SQL syntax, unclosed Jinja, bad YAML, and a <code>ref()</code>{" "}
        or <code>source()</code>{" "}that points at nothing.
      </p>
      <figure className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-graphite-deep shadow-[5px_5px_0_0_var(--color-flame)]">
        <div className="border-b border-white/10 px-5 py-2.5">
          <span className="break-all font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">
            stg_reference_lookup_ncl_fin_week_number_2019_2031.sql
          </span>
        </div>
        <div className="p-5 font-mono text-[12.5px] leading-7 text-white/85">
          <div>select</div>
          <div className="pl-4">full_date::date as calendar_date,</div>
          <div className="pl-4">new_fin_week_num as fin_week_number</div>
          <div className="break-all">
            from {"{{ ref('"}
            <span className="text-[#ff8c6b] underline decoration-wavy decoration-[#ff5a36] underline-offset-4">
              raw_reference_lookup_ncl_fin_week_number_2019_2013
            </span>
            {"') }}"}
          </div>
        </div>
        <figcaption className="border-t border-white/10 px-5 py-2.5 font-mono text-[11px] text-[#ff8c6b]">
          ✶ ref() points at a model that doesn&apos;t exist
        </figcaption>
      </figure>
      <p>
        The swapped digits are underlined the moment you type them, before
        you&apos;ve built anything. A worksheet would only tell you once the query
        failed.
      </p>
      <p>
        Strict mode would also check the SQL&apos;s meaning. It catches an unknown
        column, a column that&apos;s neither grouped nor aggregated, the wrong
        arguments to a function, and type errors. This project doesn&apos;t run
        strict, so the editor won&apos;t flag those. Misspell a column and you find
        out when the model builds and Snowflake rejects it.
      </p>

      <h2>Renaming a model file updates its ref() calls</h2>
      <p>
        Right-click the model file in the VS Code explorer and choose{" "}
        <strong>Rename</strong>. The extension finds every <code>ref()</code>{" "}
        that points at the model and rewrites it to the new name. This works at
        baseline.
      </p>
      <p>
        The extension edits those files but doesn&apos;t save them. Look over the
        changes, then choose <strong>File</strong>{" "}→ <strong>Save All</strong>.
        Until you do, expect compiler errors, because the saved files still use
        the old name.
      </p>
      <p>
        In a project with more than 3,000 models, this beats a find and replace
        across the repo. Fusion knows which <code>ref()</code>{" "}calls point at the
        model, so it doesn&apos;t miss one or change text that only looks like the
        name.
      </p>
      <figure className="my-6 rounded-2xl border-2 border-ink bg-paper p-5 shadow-[5px_5px_0_0_var(--color-layer-modelling)]">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="rounded-xl border-2 border-flame bg-flame-soft p-3 sm:w-2/5">
            <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-wider !text-flame-deep">
              You rename, once
            </p>
            <p className="!mb-0 !mt-1.5 break-all font-mono text-[12px] !text-ink">
              stg_dictionary_dbo_specialties.sql
            </p>
            <p className="!mb-0 !mt-1 break-all font-mono text-[12px] !text-ink-soft">
              → <span className="font-bold !text-flame-deep">stg_dictionary_specialties.sql</span>
            </p>
          </div>
          <span className="self-center font-mono text-ink-faint" aria-hidden>
            →
          </span>
          <div className="rounded-xl border-2 border-layer-modelling bg-layer-modelling/5 p-3 sm:flex-1">
            <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-wider !text-layer-modelling">
              Every ref() to it is rewritten, in files such as
            </p>
            <ul className="!mb-0 !mt-1.5 space-y-1 !pl-0">
              {["int_wl_current.sql", "int_sus_op_appointment.sql", "fct_person_wl_current_count_tfc.sql"].map(
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
      <Callout kind="warn" title="What rename doesn't cover yet">
        <p>
          Renames don&apos;t yet reach snapshots, or anything defined in a{" "}
          <code>.yml</code>{" "}file. After any rename, run <code>dbt compile</code>.
          It checks that the project still renders.
        </p>
      </Callout>
      <p>
        Renaming a column is different. In strict mode,{" "}
        <strong>Rename Symbol</strong>{" "}(<code>F2</code>) follows a column through
        the lineage and updates the references downstream. That needs strict, so it
        isn&apos;t available here. Rename a column by hand, then run{" "}
        <code>dbt ls -s your_model+</code>{" "}to list the models that might use it.
      </p>

      <h2>Follow lineage and definitions in the editor</h2>
      <p>
        Lineage shows which models feed the one you&apos;re editing and which
        models read it. At baseline you can follow both directions, model by model,
        without leaving VS Code. That answers two everyday questions, &quot;where
        does this come from?&quot; and &quot;what breaks if I change it?&quot;.
      </p>
      <ul>
        <li>
          <strong>Go to definition.</strong> <code>Cmd</code>/<code>Ctrl</code>-click
          a <code>ref()</code>, <code>source()</code>{" "}or macro call to jump to the
          file that defines it.
        </li>
        <li>
          <strong>The Lineage tab.</strong>{" "}It shows a DAG of models centred on the
          file you&apos;re in. Double-click a node to open that model.
        </li>
      </ul>
      <p>
        Strict mode adds go to definition for columns and CTEs, and column-level
        lineage that traces one column up and down the graph. Neither is available
        in this project.
      </p>

      <h2>Compiled SQL, previews and other editor tools</h2>
      <p>
        The extension can also show you the SQL it will send to Snowflake, and
        preview a model&apos;s rows before you build it.
      </p>
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
              The code icon opens a side-by-side view of the SQL Fusion will send to
              Snowflake. It updates when you save.
            </td>
          </tr>
          <tr>
            <td>Live preview</td>
            <td>
              The table icon, or <code>Cmd</code>/<code>Ctrl+Enter</code>, runs the
              model&apos;s SELECT and shows the rows in a results tab. A{" "}
              <strong>Preview CTE</strong>{" "}link above each CTE shows just that
              step&apos;s output.
            </td>
          </tr>
          <tr>
            <td>IntelliSense</td>
            <td>
              Autocomplete for <code>ref()</code>{" "}and <code>source()</code>{" "}names,
              and for Snowflake SQL functions.
            </td>
          </tr>
          <tr>
            <td>Hover insights</td>
            <td>
              Strict only, so not in this project. Hover <code>*</code>{" "}to see the
              columns it expands to, or hover a column to see its data type.
            </td>
          </tr>
          <tr>
            <td>Build with selectors</td>
            <td>
              <code>Cmd</code>/<code>Ctrl+Shift+Enter</code>{" "}opens a picker for
              building a selection of models.
            </td>
          </tr>
        </tbody>
      </table>

      <Quiz
        questions={[
          {
            prompt:
              "This project runs static analysis at baseline. You select `patient_age` from a model whose column is called `age`. When do you find out?",
            options: [
              "The extension underlines it as you type",
              "When the model builds and Snowflake rejects the column",
              "Never, because Fusion ignores column names",
              "When the docs site next rebuilds",
            ],
            answer: 1,
            explain:
              "Checking column names against upstream models is a strict-mode feature. At baseline the editor and the compile gate check syntax, Jinja, YAML and ref() and source() calls, so a misspelt column usually reaches Snowflake at build time.",
          },
          {
            prompt:
              "You rename a model file through the extension. How does it update the rest of the project?",
            options: [
              "It runs a query against Snowflake to find every dependant table",
              "Fusion knows every ref() in the project, so it rewrites the ones that point at that model",
              "It does a text find-and-replace for the old name across the repo",
              "It only renames inside the file you have open",
            ],
            answer: 1,
            explain:
              "Fusion parses the whole project, so it knows which ref() calls point at the model and rewrites only those. That works at baseline. Following a renamed column through lineage needs strict mode.",
          },
        ]}
      />
    </LessonShell>
  );
}
