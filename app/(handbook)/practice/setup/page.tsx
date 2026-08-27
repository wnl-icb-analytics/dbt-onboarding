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
      kicker="Field guide · 1"
      title="Set up your development environment"
      lede="Choose Windows, macOS or Codespaces and follow the setup path for that environment."
      minutes={10}
    >
      <GuidedCourseLink href="/courses/first-pr/set-up-your-machine" />

      <h2>Before you start</h2>
      <Checklist
        id="setup-tools"
        items={[
          { key: "github", label: <>GitHub account added to the organisation</> },
          { key: "snowflake", label: <>Snowflake access and your account, username, role and warehouse</> },
        ]}
      />

      <h2>Choose your setup path</h2>
      <p>
        The project supports managed Windows laptops, macOS and GitHub Codespaces.
        Choose the environment you will use to see its folder, clone, workspace and
        credential instructions.
      </p>
      <SetupDeviceGuide />
      <Callout kind="warn" title="Keep credentials out of Git">
        <p>
          The repository is public. Local setup keeps credentials in <code>.env</code>;
          Codespaces keeps them in its encrypted secret store. Never put account details,
          tokens or passwords in SQL, YAML, screenshots or a pull request.
        </p>
      </Callout>

      <h2>Configure commit signing</h2>
      <p>
        Every commit must be signed. The setup differs between local devices and
        Codespaces, so choose the environment you are using.
      </p>
      <CommitSigningGuide />

      <h2>Prove it works</h2>
      <CodeBlock
        lang="bash"
        code={`
dbt debug
dbt show -s stg_csds_bridging
`}
      />
      <p>
        <code>dbt debug</code>{" "}should end with <strong>All checks passed!</strong>. The
        second command is a useful final check that you can compile a project model and
        query the development environment.
      </p>
      <Callout kind="warn" title="Know where query output goes">
        <p>
          <code>dbt show</code>{" "}executes the query and prints rows. When a coding
          agent runs the command, its provider can receive that output. Use it there
          only for a query designed to return a high-level, non-identifying aggregate.
          Do not use a coding agent to preview model rows. Inspect those in an approved
          human-controlled tool.
        </p>
      </Callout>

      <h2>If setup fails</h2>
      <ul>
        <li>
          <strong>Connection or role error:</strong>{" "}check <code>.env</code>{" "}for a
          local setup, or your repository-scoped Codespaces secrets for the cloud route.
        </li>
        <li>
          <strong>Authentication does not start:</strong>{" "}local setup normally uses
          browser SSO. Codespaces cannot use that redirect and requires a Snowflake PAT.
        </li>
        <li>
          <strong>Tooling is missing:</strong>{" "}locally, reopen the named workspace and
          create a fresh terminal. In Codespaces, rebuild the container from the command
          palette so the post-create setup runs again.
        </li>
        <li>
          <strong>PowerShell blocks the setup script:</strong>{" "}run the CurrentUser
          execution-policy command shown in the Windows route. If corporate policy still
          blocks it, ask your team or IT support.
        </li>
        <li>
          <strong>Access denied:</strong>{" "}this is usually an access request, not a local
          code fix. Send the exact account, role and error to your team lead.
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
