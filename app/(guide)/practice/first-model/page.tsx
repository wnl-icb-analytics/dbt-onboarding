import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Checklist } from "@/components/Checklist";
import { GuidedCourseLink } from "@/components/GuidedCourseLink";

export const metadata: Metadata = { title: "Write a staging model" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="first-model"
      kicker="Walkthrough · 3"
      title="Write a staging model"
      lede="Start with the raw model for the NHS financial weeks lookup. You'll write a staging model that gives its columns clear names and types, ready for any analyst to reuse."
      minutes={7}
    >
      <GuidedCourseLink href="/courses/first-pr/write-the-model" />

      <p>
        A staging model has one job. It turns one raw table into its clean,
        standard form, once, for everyone. Each rule on this page protects that
        job.
      </p>

      <h2>Place and name it</h2>
      <p>
        Put the file in <code>models/staging/&#123;domain&#125;/&#123;source&#125;/</code>{" "}
        and name it <code>stg_&#123;source&#125;_&#123;table&#125;.sql</code>, to
        mirror the raw model it reads. The folder matters for more than
        tidiness. In this project the folder <em>is</em>{" "}configuration. The
        source folder sets the Snowflake schema the model builds into, and the
        staging folder makes it a view.
      </p>
      <p>
        So before you create anything, find a sibling. Other{" "}
        <code>stg_reference_lookup_ncl_*</code>{" "}models already live in{" "}
        <code>models/staging/shared/reference/</code>. Put yours next to them and
        its configuration is already right.
      </p>
      <CodeBlock
        lang="text"
        code={`models/staging/shared/reference/stg_reference_lookup_ncl_fin_week_number_2019_2031.sql`}
      />

      <h2>Write the SQL</h2>
      <p>
        Here&apos;s the whole model. It reads one raw model with{" "}
        <code>ref()</code>, names each column it exposes and casts the source
        timestamps to dates. Each of those choices follows a staging rule,
        explained below.
      </p>
      <CodeBlock
        lang="sql"
        title="stg_reference_lookup_ncl_fin_week_number_2019_2031.sql"
        code={`
select
    full_date::date as calendar_date,
    new_start_of_fin_week::date as fin_week_start_date,
    new_fin_year as fin_year,
    new_fin_week_num as fin_week_number
from {{ ref('raw_reference_lookup_ncl_fin_week_number_2019_2031') }}
`}
      />
      <p>
        <strong>Read one raw model, through <code>ref()</code>.</strong>{" "}The raw
        model is the project&apos;s one stable interface to that feed. If you go
        around it, you lose that. A <code>source()</code>{" "}call skips the
        cleaned column names. A hardcoded table name points at the same table in
        dev and prod, and dbt can&apos;t see it in the lineage. CI fails a PR
        whose changed files hardcode a table name.
      </p>
      <p>
        <strong>List the columns. Never <code>select *</code>.</strong>{" "}The
        column list is the promise that downstream models build on. With{" "}
        <code>*</code>, a column added to the feed turns up downstream without
        warning. A removed one breaks other people&apos;s models and you never
        hear about it. When you name the columns, every change to the interface
        is one you made on purpose, where a reviewer can see it.
      </p>
      <p>
        <strong>Clean and cast here, once.</strong>{" "}The source stores each
        date as a timestamp at midnight. The <code>::date</code>{" "}casts are the
        point of this layer. Every downstream model inherits them, so nobody has
        to cast those columns or trip over a stray time part again. This is also
        where names move to the project&apos;s conventions. Booleans start with{" "}
        <code>is_</code>{" "}or <code>has_</code>. Dates, timestamps and IDs end in{" "}
        <code>_date</code>, <code>_at</code>{" "}and <code>_id</code>. Then the
        whole warehouse uses one vocabulary.
      </p>
      <p>
        So <code>full_date</code>{" "}becomes <code>calendar_date</code>, and the
        week start gains its <code>_date</code>{" "}ending. The <code>new_</code>{" "}
        prefix goes, because a reader can&apos;t tell what it&apos;s new compared
        with. When you don&apos;t know what a source prefix means, ask in the PR
        rather than guess.
      </p>
      <p>
        <strong>Keep every row.</strong>{" "}A staging model is a faithful copy,
        cleaned. Dropping rows is a business decision, like &quot;only active
        registrations&quot; or &quot;exclude test patients&quot;. Those belong in
        the modelling layer, where they get a name and other models can reuse
        them.
      </p>
      <p>
        There are two exceptions. Staging can resolve technical resubmissions,
        where a feed sends the same record twice. It can also enforce a
        documented rule about the source. Both are fine when every consumer
        should get that preparation. Real source records stay, and choosing a
        population waits until later.
      </p>
      <p>
        <strong>Usually no joins.</strong>{" "}A join in staging is only justified
        for cleaning, standardising or enriching that every user of the source
        should get. Business populations, and enrichment only some users need,
        belong in an <code>int_</code>{" "}model.
      </p>

      <Callout kind="smell" title="The one-sentence check">
        <p>
          You should be able to describe a staging model as &quot;this source
          table, cleaned&quot;. If a filter picks an analytical population, or a
          join adds something only some users need, move it to modelling.
          Resolving resubmissions and enforcing documented source rules can stay,
          as long as every user should inherit them.
        </p>
      </Callout>

      <h2>Preview the rows and check the compiled SQL</h2>
      <p>
        Build the raw view in dev, then preview your model and look at the SQL
        dbt sends to Snowflake.
      </p>
      <CodeBlock
        lang="bash"
        code={`
dbt build -s raw_reference_lookup_ncl_fin_week_number_2019_2031
dbt show -s stg_reference_lookup_ncl_fin_week_number_2019_2031 --limit 5
dbt compile -s stg_reference_lookup_ncl_fin_week_number_2019_2031
`}
      />
      <p>
        The first command builds the raw view in your dev database. Your{" "}
        <code>ref()</code>{" "}points at that dev copy, and{" "}
        <code>dbt show</code>{" "}won&apos;t create it for you. It&apos;s a view,
        so it takes seconds. Then <code>dbt show</code>{" "}runs your SQL and
        prints five rows. <code>dbt compile</code>{" "}renders the SQL dbt will
        send to Snowflake, with <code>ref()</code>{" "}replaced by the real table
        name, and builds nothing. You&apos;ll find the result under{" "}
        <code>target/compiled/</code>.
      </p>
      <p>
        Rows coming back tell you the SQL works. They can&apos;t tell you
        whether the rows are right. Read the sample against what you know of the source.
        Is it one row per date, as you expected? Are the nulls where you
        expected? Did the casts behave? A cast that can&apos;t convert fails
        loudly at build. A rename that loses meaning doesn&apos;t fail at all.
        Thirty seconds spent on the rows here can save a review round later.
      </p>

      <Checklist
        id="first-model"
        items={[
          { key: "file", label: <>Correct folder and <code>stg_</code>{" "}name</> },
          { key: "ref", label: <>One raw <code>ref()</code>{" "}and explicit columns</> },
          { key: "scope", label: <>No business filters, and no joins only some consumers need</> },
          { key: "show", label: <><code>dbt show</code>{" "}returns sensible rows</> },
        ]}
      />
    </LessonShell>
  );
}
