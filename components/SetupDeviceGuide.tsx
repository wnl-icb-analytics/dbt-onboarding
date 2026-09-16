"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { useInteractionDone } from "@/lib/interaction";

const DEVICES = {
  windows: {
    label: "Managed Windows laptop",
    short: "WNL and other corporate Windows devices",
    accent: "var(--flame)",
  },
  mac: {
    label: "macOS",
    short: "A locally managed Mac",
    accent: "var(--layer-staging)",
  },
  codespaces: {
    label: "GitHub Codespaces",
    short: "A cloud workspace in the browser",
    accent: "var(--layer-modelling)",
  },
} as const;

type Device = keyof typeof DEVICES;

function WorkspaceExplanation() {
  return (
    <div className="mt-4 rounded-xl border border-line bg-paper-warm px-4 py-3 text-sm leading-relaxed text-ink-soft">
      <p className="!my-0">
        <strong className="text-ink">A workspace file is a saved editor setup.</strong>{" "}
        VS Code and compatible editors such as Cursor can open this one. It loads the
        repository&apos;s recommended extensions and its special dbt terminal. If your
        editor asks whether to open the workspace, choose <strong>Open Workspace</strong>.
        Accept the recommended-extension prompt too.
      </p>
      <p className="!mb-0 !mt-2">
        The command above uses VS Code&apos;s <code>code</code>{" "}command. With Cursor,
        use <code>cursor dbt-ncl-analytics.code-workspace</code>, or choose{" "}
        <em>File → Open Workspace from File…</em>. Other IDEs are welcome, but they may
        not apply this workspace configuration; run the relevant <code>start_dbt</code>{" "}
        script manually from the repository root.
      </p>
    </div>
  );
}

function WindowsSetup() {
  return (
    <>
      <p>
        On a corporate Windows laptop, install <strong>Git</strong>, your preferred editor
        and <strong>uv</strong>{" "}from <strong>Company Portal</strong>. VS Code is the
        documented editor, but Cursor and other IDEs are welcome. Git 2.34 or later is
        required for SSH commit signing; check with <code>git --version</code>.
      </p>
      <p>
        Allow the project&apos;s PowerShell bootstrap script to run for your Windows
        account:
      </p>
      <CodeBlock
        lang="bash"
        title="PowerShell"
        code={`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`}
      />
      <p>
        If your organisation&apos;s policy rejects that command, stop and ask your team or
        IT support rather than changing a wider machine policy.
      </p>
      <p>
        On managed Windows laptops, keep the repository inside your Windows user
        directory. Corporate controls can prevent Python and <code>uv</code>{" "}from
        creating the project&apos;s helper environment in other locations.
      </p>
      <CodeBlock
        lang="bash"
        title="PowerShell"
        code={`
New-Item -ItemType Directory -Force "$env:USERPROFILE\\Projects" | Out-Null
cd "$env:USERPROFILE\\Projects"
git clone https://github.com/wnl-icb-analytics/dbt-analytics.git
cd dbt-analytics
code dbt-ncl-analytics.code-workspace
`}
      />
      <p>
        <code>$env:USERPROFILE</code>{" "}means your own folder, normally{" "}
        <code>C:\Users\your-name</code>. The folder names are not special; the important
        part is that the project remains beneath your user directory. <code>cd</code>{" "}
        means <em>change directory</em>: it moves the terminal into the folder named
        after it, so the next command runs there.
      </p>
      <WorkspaceExplanation />
      <p>
        In the workspace, choose <em>Terminal → New Terminal</em>. Its Windows terminal
        profile automatically runs <code>start_dbt.ps1</code>. The script installs the
        pinned dbt Fusion engine under your user profile, configures Git hooks, prepares
        the optional Python helpers, installs dbt packages and guides you through creating
        the ignored <code>.env</code>{" "}file. Use browser SSO unless your team supplied
        another authentication method.
      </p>
    </>
  );
}

function MacSetup() {
  return (
    <>
      <p>
        Install <strong>Git</strong>{" "}and your preferred editor first. VS Code is the
        documented route, while Cursor and other IDEs are welcome. Git may already be
        available through the Xcode command-line tools; check with{" "}
        <code>git --version</code>.
      </p>
      <p>
        On macOS, use a normal folder that you own. <code>~/Projects</code>{" "}is a
        conventional choice; <code>~</code>{" "}means your home directory.
      </p>
      <CodeBlock
        lang="bash"
        title="Terminal"
        code={`
mkdir -p ~/Projects
cd ~/Projects
git clone https://github.com/wnl-icb-analytics/dbt-analytics.git
cd dbt-analytics
code dbt-ncl-analytics.code-workspace
`}
      />
      <p>
        <code>mkdir -p</code>{" "}creates the folder if it does not exist. <code>cd</code>{" "}
        means <em>change directory</em>: it moves the terminal into that folder before
        cloning, and then into the new repository.
      </p>
      <WorkspaceExplanation />
      <p>
        In the workspace, choose <em>Terminal → New Terminal</em>. Its macOS terminal
        profile automatically runs <code>start_dbt.sh</code>. The script installs the
        pinned dbt Fusion engine under your home directory, configures Git hooks,
        prepares the optional Python helpers, installs dbt packages and guides you
        through creating the ignored <code>.env</code>{" "}file. Browser SSO works from
        this local environment.
      </p>
    </>
  );
}

function CodespacesSetup() {
  return (
    <>
      <p>
        Codespaces runs the project in a prepared cloud container. There is no local
        clone, no project folder to choose and no <code>.env</code>{" "}file. The
        repository&apos;s devcontainer installs dbt Fusion, the optional Python helpers,
        dbt packages and the recommended VS Code extensions when the codespace is created.
      </p>
      <div className="my-4 rounded-xl border-2 border-layer-modelling/30 bg-layer-modelling/5 p-4">
        <p className="!my-0 font-display text-sm font-bold !text-ink">
          Add your Codespaces secrets first
        </p>
        <p className="!mb-2 !mt-1 text-sm">
          Codespaces cannot complete Snowflake browser SSO, so create a Snowflake
          Programmatic Access Token and add these under{" "}
          <em>GitHub Settings → Codespaces → Secrets</em>. Scope each secret to{" "}
          <code>wnl-icb-analytics/dbt-analytics</code>.
        </p>
        <CodeBlock
          lang="text"
          code={`
SNOWFLAKE_ACCOUNT
SNOWFLAKE_USER
SNOWFLAKE_ROLE
SNOWFLAKE_WAREHOUSE
SNOWFLAKE_PAT
`}
        />
      </div>
      <ol>
        <li>
          In <em>GitHub Settings → Codespaces</em>, enable GPG verification for this
          repository so GitHub signs commits made in the codespace.
        </li>
        <li>
          Open the repository on GitHub and choose <em>Code → Codespaces</em>.
        </li>
        <li>Create a codespace and wait for its setup to finish.</li>
        <li>Open a terminal in the browser editor and verify the connection:</li>
      </ol>
      <CodeBlock lang="bash" code={`dbt debug`} />
      <p>
        The injected secrets are read directly by the dbt profile. They remain attached
        to your GitHub account and are not written into the repository or its history.
      </p>
    </>
  );
}

export function SetupDeviceGuide() {
  const [device, setDevice] = useState<Device | null>(null);
  const interactionDone = useInteractionDone();

  return (
    <section className="my-6 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_5px_0_0_var(--color-layer-staging)]">
      <header className="border-b-2 border-ink bg-paper-warm p-4 sm:p-5">
        <p className="!my-0 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] !text-flame">
          Choose your development environment
        </p>
        <h3 className="!mb-0 !mt-1 font-display text-xl font-extrabold !text-ink">
          What device are you using?
        </h3>
      </header>

      <div className="grid gap-2 border-b border-line p-4 sm:grid-cols-3">
        {(Object.keys(DEVICES) as Device[]).map((key) => {
          const option = DEVICES[key];
          const active = device === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setDevice(key);
                interactionDone();
              }}
              className={`rounded-xl border-2 p-3 text-left transition ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink hover:border-flame hover:bg-flame-soft/30"
              }`}
            >
              <span
                aria-hidden
                className="mb-2 block h-1.5 w-10 rounded-full"
                style={{ background: option.accent }}
              />
              <span className="block font-display text-sm font-extrabold">
                {option.label}
              </span>
              <span className={`mt-1 block text-xs ${active ? "text-paper/60" : "text-ink-faint"}`}>
                {option.short}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5">
        {!device && (
          <p className="!my-3 text-center text-sm text-ink-faint">
            Choose a device to see the correct setup path.
          </p>
        )}
        {device === "windows" && <WindowsSetup />}
        {device === "mac" && <MacSetup />}
        {device === "codespaces" && <CodespacesSetup />}
      </div>
    </section>
  );
}
