import type { Metadata } from "next";
import { LessonShell } from "@/components/LessonShell";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout } from "@/components/Callout";
import { Checklist } from "@/components/Checklist";
import { GuidedCourseLink } from "@/components/GuidedCourseLink";
import { SetupDeviceGuide } from "@/components/SetupDeviceGuide";
import { CommitSigningGuide } from "@/components/CommitSigningGuide";

export const metadata: Metadata = { title: "Set up your development environment" };

export default function Page() {
  return (
    <LessonShell
      section="practice"
      slug="setup"
      kicker="Walkthrough · 1"
      title="Set up your development environment"
      lede="Pick Windows, macOS or Codespaces, then follow the steps for that choice. By the end, dbt can talk to Snowflake and your commits are signed."
      minutes={10}
    >
      <GuidedCourseLink href="/courses/first-pr/set-up-your-machine" />

      <h2>Before you start</h2>
      <p>
        Check that you&apos;ve been added to the team&apos;s GitHub organisation
        and can sign in to Snowflake. Other people grant both, so ask early.
      </p>
      <Checklist
        id="setup-tools"
        items={[
          { key: "github", label: <>GitHub account added to the organisation</> },
          { key: "snowflake", label: <>Snowflake access and your account, username, role and warehouse</> },
        ]}
      />
      <p>
        To find your Snowflake details, log in to Snowflake, select your name in
        the bottom-left corner, then choose <em>Connect a tool to Snowflake</em>.
        If you don&apos;t have access yet, ask your team lead.
      </p>

      <h2>Choose your setup path</h2>
      <p>
        Pick where you&apos;ll work. The project runs on managed Windows
        laptops, on macOS and in GitHub Codespaces. Each path shows you where to put
        the project, how to clone it, how to open the workspace and where your
        credentials go.
      </p>
      <SetupDeviceGuide />
      <Callout kind="warn" title="Keep credentials out of Git">
        <p>
          The repository is public. A local setup keeps your credentials in{" "}
          <code>.env</code>, which Git ignores. Codespaces keeps them in its
          encrypted secret store. Never put account details, tokens or passwords
          in SQL, YAML, screenshots or a pull request.
        </p>
      </Callout>

      <h2>Configure commit signing</h2>
      <p>
        The project rejects unsigned commits, so set this up now. Local devices
        and Codespaces do it differently. Pick the environment you chose above.
      </p>
      <CommitSigningGuide />

      <h2>Check that dbt can query Snowflake</h2>
      <p>
        Open a new terminal in the workspace and run these two commands. If the
        second prints five rows of dates, your setup is ready for the
        walkthroughs.
      </p>
      <CodeBlock
        lang="bash"
        code={`
dbt debug
dbt show -s raw_reference_lookup_ncl_fin_week_number_2019_2031 --limit 5
`}
      />
      <p>
        <code>dbt debug</code>{" "}checks your profile and connection. With browser
        SSO, a browser window opens so you can sign in to Snowflake. The output
        should end with <strong>All checks passed!</strong>
      </p>
      <p>
        <code>dbt show</code>{" "}compiles a real project model, runs it in
        Snowflake and prints five rows. The model is a lookup of NHS financial
        weeks with no patient data, and you&apos;ll build on it in the next
        walkthroughs. Rows back mean you can compile models and query
        Snowflake, which is all the later walkthroughs need.
      </p>
      <Callout kind="warn" title="Know where query output goes">
        <p>
          <code>dbt show</code>{" "}runs the query and prints rows. If a coding
          agent runs it, the agent&apos;s provider can receive that output. Only
          let an agent run it for a query built to return a high-level,
          non-identifying aggregate. Never use a coding agent to preview model
          rows. Look at those yourself in an approved tool that you control.
        </p>
      </Callout>

      <h2>If setup fails</h2>
      <p>Match the error you see to one of these.</p>
      <ul>
        <li>
          <strong>A connection or role error.</strong>{" "}Check the values in{" "}
          <code>.env</code>{" "}for a local setup. In Codespaces, check your
          Codespaces secrets and make sure each one is scoped to this repository.
        </li>
        <li>
          <strong>Sign-in never starts.</strong>{" "}A local setup normally uses
          browser SSO. Codespaces can&apos;t finish that redirect, so it needs a
          Snowflake programmatic access token (PAT) instead.
        </li>
        <li>
          <strong>dbt or another tool is missing.</strong>{" "}Locally, reopen the
          workspace file and open a fresh terminal. In Codespaces, open the
          command palette and run <em>Codespaces: Rebuild Container</em>, which
          runs the setup again.
        </li>
        <li>
          <strong>PowerShell blocks the setup script.</strong>{" "}Run the{" "}
          <code>Set-ExecutionPolicy -Scope CurrentUser</code>{" "}command from the
          Windows path. If corporate policy still blocks it, ask your team or IT
          support.
        </li>
        <li>
          <strong>Access denied.</strong>{" "}This usually means you need an access
          request, and no local change will fix it. Send your team lead the exact
          account, role and error message.
        </li>
      </ul>

      <Checklist
        id="setup-verify"
        items={[
          { key: "ready", label: <>The local setup script or Codespaces container setup finishes</> },
          { key: "signing", label: <>Commit signing is configured for the chosen environment</> },
          { key: "debug", label: <><code>dbt debug</code>{" "}passes</> },
          { key: "show", label: <><code>dbt show</code>{" "}returns rows</> },
        ]}
      />
    </LessonShell>
  );
}
