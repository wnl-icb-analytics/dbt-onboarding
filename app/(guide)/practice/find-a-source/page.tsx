import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Checklist } from "@/components/Checklist";
import { GuidedCourseLink } from "@/components/GuidedCourseLink";
import { SourceSetupFlow } from "@/components/SourceSetupFlow";

export const metadata: Metadata = { title: "Find your source" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="find-a-source"
      kicker="Walkthrough · 2"
      title="Find your source"
      lede="Your staging model reads from a raw model, a generated view of one source table. Start with the table's full Snowflake name. You'll check that nobody has staged it yet, then find the raw model to build on, or generate one if it's missing."
      minutes={12}
    >
      <GuidedCourseLink href="/courses/first-pr/find-or-add-the-source" />

      <h2>Check what already exists</h2>
      <p>
        Search the project for the table before you write anything. Start from
        its full <code>DATABASE.SCHEMA.TABLE</code>{" "}address. You need the
        schema as well as the table name, because the schema decides which
        route you take if there&apos;s no raw model. The walkthroughs follow one real
        table, a lookup of NHS financial weeks with one row per calendar date.
        It holds no patient data, and nothing stages it yet.
      </p>
      <CodeBlock
        lang="text"
        code={`MODELLING.LOOKUP_NCL.FIN_WEEK_NUMBER_2019_2031`}
      />
      <p>
        Press <code>Ctrl+P</code>{" "}(<code>Cmd+P</code>{" "}on a Mac) to search
        file names, and try these in order.
      </p>
      <ol>
        <li>
          The likely staging name,{" "}
          <code>stg_reference_lookup_ncl_fin_week_number_2019_2031</code>. If it
          exists, someone has already done this work. Reuse it. For this table
          you&apos;ll find nothing, which is why it makes a good first model.
        </li>
        <li>
          The likely raw name,{" "}
          <code>raw_reference_lookup_ncl_fin_week_number_2019_2031</code>. This is
          the model you&apos;ll <code>ref()</code>. It&apos;s in{" "}
          <code>models/raw/shared/</code>.
        </li>
        <li>
          The bare table name, <code>FIN_WEEK_NUMBER_2019_2031</code>. Search
          file contents for it with <code>Ctrl+Shift+F</code>. This catches a
          source prefix you didn&apos;t guess. Here it also finds the source
          declaration in <code>models/sources/auto_modelling_lookup_ncl.yml</code>.
        </li>
      </ol>
      <p>
        The prefix comes from the source registry,{" "}
        <code>scripts/sources/source_mappings.yml</code>. Its{" "}
        <code>LOOKUP_NCL</code>{" "}entry
        sets <code>raw_prefix: raw_reference_lookup_ncl</code>, so that&apos;s
        what we guessed here. When the raw model exists, preview it.
      </p>
      <CodeBlock
        lang="bash"
        code={`dbt show -s raw_reference_lookup_ncl_fin_week_number_2019_2031 --limit 5`}
      />
      <p>
        You should see five rows with lower-case column names, from{" "}
        <code>full_date</code>{" "}to <code>new_fin_week_num</code>. A raw model
        reads its source directly, so this works without building anything
        first. For the walkthrough table, that&apos;s you done with this page.
        The rest explains how raw models are made, for when your own table has
        no raw model yet.
      </p>

      <h2>How raw models are made</h2>
      <p>
        <strong>Nobody writes raw models by hand.</strong>{" "}A script generates
        them from Snowflake&apos;s metadata, one per source table. The source
        data is already in Snowflake before this project reads it. Most of it
        sits in the data lake databases, <code>DATA_LAKE</code>{" "}and{" "}
        <code>DATA_LAKE__NCL</code>, and some in others such as{" "}
        <code>MODELLING</code>{" "}and <code>REFERENCE</code>. Platform pipelines
        load most feeds. OLIDS tables arrive already mapped by the team&apos;s
        upstream dbt-olids project. Either way, this project first touches the
        data in the raw layer.
      </p>
      <p>
        There are around nine hundred raw models, one per source table. Each is
        a near-identical view that quotes the source&apos;s columns and renames
        them to snake_case. Writing that many by hand would invite typos and
        drift.
      </p>
      <p>
        The script works from the source registry,{" "}
        <code>scripts/sources/source_mappings.yml</code>, which lists most of the
        databases and schemas the project reads. The generation script asks
        Snowflake&apos;s own metadata what those schemas contain. It then writes
        the source declarations, which are the YAML that <code>source()</code>{" "}
        calls point at, and one raw model per table. Run it again next month and
        it regenerates everything to match what Snowflake holds by then.
      </p>
      <p>
        That&apos;s why the rule about generated files has no exceptions. If you
        edit anything under <code>models/raw/</code>{" "}or an{" "}
        <code>auto_*.yml</code>{" "}file, the next run overwrites it. When a raw
        model is wrong, fix the thing the pipeline reads from. That&apos;s the
        registry, the manual YAML or the generator itself.
      </p>
      <SourceSetupFlow />
      <p>
        Two details in the registry decide how much work the steps below take.
        Most schemas are <em>automatic</em>, which means every table in them gets
        a raw model with no decisions needed. A few are marked{" "}
        <code>manual: true</code>. In those, you opt tables in one at a time. The
        team uses this for busy schemas, like <code>ANALYST_MANAGED</code>, where
        most tables have nothing to do with the project and hundreds of unused
        raw models would only add noise.
      </p>
      <p>
        An automatic entry can also carry a filter. A <code>tables:</code>{" "}list
        means only the tables named there come in. An{" "}
        <code>exclude_tables:</code>{" "}list names tables to leave out, usually
        with a comment saying why. Read the whole entry, not just its first line.
      </p>

      <h2>If there is no raw model</h2>
      <p>
        Check how the project handles the table&apos;s schema. That tells you
        whether the next generation run will pick the table up, or whether
        someone needs to change the source settings first. Open{" "}
        <code>scripts/sources/source_mappings.yml</code>{" "}and search for the
        schema name. Then search <code>models/sources/</code>{" "}
        for it too, because a few manual sources are declared only there.
      </p>
      <table>
        <thead>
          <tr>
            <th>What you find</th>
            <th>What that means</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Schema in the registry, no <code>manual: true</code></td>
            <td>
              Automatic, unless a filter blocks your table. Check for a{" "}
              <code>tables:</code>{" "}list that leaves it out, or an{" "}
              <code>exclude_tables:</code>{" "}list that names it. With no filter
              in the way, the table appears on the next generation run with no
              YAML edits at all. If a filter is in the way, ask the team before
              changing it. Someone put it there on purpose.
            </td>
          </tr>
          <tr>
            <td>Schema in the registry, marked <code>manual: true</code></td>
            <td>
              Opt-in. Add one table block to that source&apos;s{" "}
              <code>manual_*.yml</code>, then run the pipeline.
            </td>
          </tr>
          <tr>
            <td>Schema only in a <code>manual_*.yml</code></td>
            <td>
              A manual source outside the registry.{" "}
              <code>DATA_LAKE__NCL.COMMON</code>, declared in{" "}
              <code>manual_common.yml</code>, is one. Its YAML sets the raw prefix
              and folder itself. Add your table there the same way.
            </td>
          </tr>
          <tr>
            <td>Schema in neither</td>
            <td>
              The project has never read this schema. Adding one is a governance
              decision as well as a technical one, so pair with the team rather
              than adding a mapping alone.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        For the manual case, the block you add is small. Open the matching file
        in <code>models/sources/</code>. For <code>ANALYST_MANAGED</code>{" "}
        that&apos;s <code>manual_analyst_managed.yml</code>. Add your table to
        the <code>tables:</code>{" "}list. Copy a neighbouring block so the
        indentation matches, then change the names. Here&apos;s an existing one,
        without its description.
      </p>
      <CodeBlock
        lang="yaml"
        title="models/sources/manual_analyst_managed.yml"
        code={`- name: CSDS_LOOKUP
  identifier: '"CSDS_LOOKUP"'
  columns:
  - name: CSDS_FIELDNAME
    data_type: TEXT
  - name: SIMPLETABLE_FIELDNAME
    data_type: TEXT
  - name: CODE
    data_type: TEXT
  - name: DESCRIPTION
    data_type: TEXT`}
      />
      <p>
        Copy the table and column names exactly as Snowflake shows them, case
        included. Most are upper case. A name someone created in quotes with
        lower-case letters has to stay that way, or the quoted identifier
        won&apos;t match. Don&apos;t worry about getting every{" "}
        <code>data_type</code>{" "}right. The pipeline syncs types from live
        metadata on each run.
      </p>

      <h2>Generate the raw models and check the changes</h2>
      <p>
        Run the script from the repository root. It reads Snowflake&apos;s
        metadata and rewrites the source YAML and raw models, so its output can
        include changes beyond your table.
      </p>
      <CodeBlock
        lang="bash"
        code={`uv run python scripts/sources/run_all_source_generation.py`}
      />
      <p>
        <code>uv run</code>{" "}uses the project&apos;s Python environment, which
        the setup script prepared. Plain <code>python</code>{" "}may find a
        different Python without the packages the script needs, and in
        Codespaces it usually does.
      </p>
      <p>
        The script runs four steps. It builds a metadata query from the
        registry, runs that query in Snowflake, writes the source YAML and then
        writes the raw models. For the Snowflake step it uses{" "}
        <code>SNOWFLAKE_PAT</code>{" "}if you&apos;ve set one, in{" "}
        <code>.env</code>{" "}or as a Codespaces secret. Without one, a browser
        window opens for SSO, so sign in when it asks. At the end it prints a
        warning if any raw models were renamed, removed or moved. Read it before
        you go further.
      </p>
      <p>
        Because the script regenerates from live metadata, someone else&apos;s
        feed may have gained a column since the last run, for example. So treat
        the check afterwards as a real review.
      </p>
      <CodeBlock
        lang="bash"
        code={`git status --short
git diff -- models/sources models/raw
dbt parse
dbt show -s raw_your_new_model --limit 5`}
      />
      <p>You&apos;re checking four things.</p>
      <ol>
        <li>The source YAML you expected has changed.</li>
        <li>
          Your raw model appears as a new file under <code>models/raw/</code>.
          The walkthrough table&apos;s raw model was made this way, as{" "}
          <code>models/raw/shared/raw_reference_lookup_ncl_fin_week_number_2019_2031.sql</code>.
        </li>
        <li><code>dbt parse</code>{" "}finishes without errors.</li>
        <li>
          The preview shows the snake_case columns you&apos;ll build on.
        </li>
      </ol>
      <p>
        If the diff touches sources you never changed, ask the team before you
        put them in your PR. They&apos;re probably real drift and fine to commit,
        but somebody should decide that on purpose.
      </p>

      <h2>When the input is a seed</h2>
      <p>
        Small reference data that the team owns can skip all of this and live as
        a CSV under <code>seeds/</code>. Think of a mapping of status codes or a
        list of thresholds. <code>dbt seed</code>{" "}loads it into Snowflake, and
        models <code>ref()</code>{" "}it like any other model.
      </p>
      <p>
        Here&apos;s where the line sits. A seed holds reference data that belongs
        to the project&apos;s logic, and it changes through review just like
        code. An extract, a feed or anything at patient level is not a seed,
        however handy the folder looks.
      </p>

      <h2>Before writing the model</h2>
      <Checklist
        id="find-source"
        items={[
          { key: "found", label: <>Located or generated the raw model</> },
          { key: "columns", label: <>Reviewed its cleaned columns and sample rows</> },
          { key: "grain", label: <>Can state the source grain in one sentence</> },
          { key: "nodupe", label: <>Confirmed no staging model already exists</> },
        ]}
      />
    </LessonShell>
  );
}
