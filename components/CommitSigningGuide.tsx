"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";

const ROUTES = {
  windows: "Managed Windows laptop",
  mac: "macOS",
  codespaces: "GitHub Codespaces",
} as const;

type Route = keyof typeof ROUTES;

function powerShellLiteral(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function shellLiteral(value: string) {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

/** what the local scripts change, shown under both local routes */
function SigningNotes({ bootstrap }: { bootstrap: string }) {
  return (
    <p>
      The script adds your key to <code>~/.ssh/allowed_signers</code>{" "}without
      removing lines already there. It sets the Git options globally, so they
      apply to every repository on this machine. That matches{" "}
      <code>CONTRIBUTING.md</code>, and <code>{bootstrap}</code>{" "}only checks
      that they&apos;re set. Last, it makes a signed test commit in a throwaway
      folder and prints its signature. Git may ask for your passphrase here.
      Look for <code>Good &quot;git&quot; signature</code>.
    </p>
  );
}

function AfterScript() {
  return (
    <p>
      Your public key is now on the clipboard. Add it under{" "}
      <em>GitHub Settings → SSH and GPG keys → New SSH key</em>, and change the
      key type from <em>Authentication Key</em> to <strong>Signing Key</strong>.
      Skip this if that key is already on GitHub as a signing key. Open a fresh
      workspace terminal. The bootstrap should report{" "}
      <code>[OK] Commit signing configured</code>. Your first pushed commit
      should then show a <strong>Verified</strong>{" "}badge on GitHub.
    </p>
  );
}

export function CommitSigningGuide() {
  const [route, setRoute] = useState<Route>("windows");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const detailsReady = name.trim().length > 0 && email.trim().length > 0;

  // Global scope matches CONTRIBUTING.md. start_dbt only checks the effective
  // config, and this script may run before the repository is cloned.
  const windowsScript = `
$Name = ${powerShellLiteral(name.trim())}
$Email = ${powerShellLiteral(email.trim())}
$sshDir = Join-Path $HOME '.ssh'
$allowedSigners = Join-Path $sshDir 'allowed_signers'
New-Item -ItemType Directory -Force -Path $sshDir | Out-Null

# 1. Reuse the signing key Git already uses, or a dedicated one (never id_ed25519)
$pubPath = git config --global --type=path user.signingkey
if (-not ($pubPath -and $pubPath.EndsWith('.pub') -and (Test-Path $pubPath))) {
    $keyPath = Join-Path $sshDir 'id_ed25519_signing'
    $pubPath = "$keyPath.pub"
    if (-not (Test-Path $pubPath)) { ssh-keygen -t ed25519 -C $Email -f $keyPath }
}
$pubPath = $pubPath.Replace('\\', '/')
$signersPath = $allowedSigners.Replace('\\', '/')
Write-Host "Signing key: $pubPath"
$publicKey = (Get-Content $pubPath -Raw).Trim()

# 2. Add the key to allowed_signers, keeping any lines already there
$keyBody = ($publicKey -split ' ')[0..1] -join ' '
$current = if (Test-Path $allowedSigners) { [System.IO.File]::ReadAllText($allowedSigners) } else { '' }
if (-not $current.Contains($keyBody)) {
    $gap = if ($current -and -not $current.EndsWith("\`n")) { "\`n" } else { '' }
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::AppendAllText($allowedSigners, "$gap$Email $publicKey\`n", $utf8)
}

# 3. Tell Git who you are and to sign every commit
git config --global user.name $Name
git config --global user.email $Email
git config --global gpg.format ssh
git config --global user.signingkey $pubPath
git config --global gpg.ssh.allowedSignersFile $signersPath
git config --global commit.gpgsign true

# 4. Make a signed test commit in a throwaway folder and check it
$testRepo = Join-Path ([System.IO.Path]::GetTempPath()) "signing-test-$(Get-Random)"
git init -q $testRepo
git -C $testRepo commit --allow-empty -q -m "test: signing"
git -C $testRepo log --show-signature -1
Remove-Item -Recurse -Force $testRepo

# 5. Copy the public key for GitHub
Set-Clipboard -Value $publicKey
`.trim();

  const macScript = `
NAME=${shellLiteral(name.trim())}
EMAIL=${shellLiteral(email.trim())}
SIGNERS="$HOME/.ssh/allowed_signers"
mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"

# 1. Reuse the signing key Git already uses, or a dedicated one (never id_ed25519)
PUB="$(git config --global --type=path user.signingkey)"
case "$PUB" in
  *.pub) [ -f "$PUB" ] || PUB="" ;;
  *) PUB="" ;;
esac
if [ -z "$PUB" ]; then
  PUB="$HOME/.ssh/id_ed25519_signing.pub"
  [ -f "$PUB" ] || ssh-keygen -t ed25519 -C "$EMAIL" -f "$HOME/.ssh/id_ed25519_signing"
fi
echo "Signing key: $PUB"

# 2. Add the key to allowed_signers, keeping any lines already there
touch "$SIGNERS"
KEY_BODY="$(cut -d' ' -f1,2 "$PUB")"
if ! grep -qF "$KEY_BODY" "$SIGNERS"; then
  [ -s "$SIGNERS" ] && [ -n "$(tail -c1 "$SIGNERS")" ] && echo >> "$SIGNERS"
  printf '%s %s\\n' "$EMAIL" "$(cat "$PUB")" >> "$SIGNERS"
fi

# 3. Tell Git who you are and to sign every commit
git config --global user.name "$NAME"
git config --global user.email "$EMAIL"
git config --global gpg.format ssh
git config --global user.signingkey "$PUB"
git config --global gpg.ssh.allowedSignersFile "$SIGNERS"
git config --global commit.gpgsign true

# 4. Make a signed test commit in a throwaway folder and check it
TEST_REPO="$(mktemp -d)"
git init -q "$TEST_REPO"
git -C "$TEST_REPO" commit --allow-empty -q -m "test: signing"
git -C "$TEST_REPO" log --show-signature -1
rm -rf "$TEST_REPO"

# 5. Copy the public key for GitHub
pbcopy < "$PUB"
`.trim();

  return (
    <section className="my-5 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[4px_4px_0_0_var(--color-layer-modelling)]">
      <div className="grid gap-2 border-b-2 border-ink bg-paper-warm p-3 sm:grid-cols-3">
        {(Object.keys(ROUTES) as Route[]).map((key) => (
          <button
            key={key}
            type="button"
            data-signing-route={key}
            aria-pressed={route === key}
            onClick={() => setRoute(key)}
            className={`rounded-lg border-2 px-3 py-2 text-left font-display text-xs font-extrabold transition ${
              route === key
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper text-ink hover:border-flame"
            }`}
          >
            {ROUTES[key]}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        {route !== "codespaces" && (
          <div className="mb-5 rounded-xl border-2 border-layer-modelling/25 bg-layer-modelling/5 p-4">
            <p className="!my-0 font-display text-sm font-bold !text-ink">
              Generate your commands
            </p>
            <p className="!mb-3 !mt-1 text-sm">
              Enter the name and email attached to your GitHub account. These values
              stay on this page and are only used to build the script below.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-display text-xs font-bold text-ink-soft">
                  Your name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  className="w-full rounded-lg border-2 border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-faint/60 focus:border-layer-modelling"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-display text-xs font-bold text-ink-soft">
                  GitHub email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="alex.morgan@example.org"
                  autoComplete="email"
                  className="w-full rounded-lg border-2 border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-faint/60 focus:border-layer-modelling"
                />
              </label>
            </div>
          </div>
        )}

        {route === "windows" && (
          <>
            <p>
              Copy the script and paste it into PowerShell. If Git already has a
              signing key, or an earlier run made one, the script reuses it.
              Otherwise <code>ssh-keygen</code>{" "}creates{" "}
              <code>~/.ssh/id_ed25519_signing</code>{" "}and asks for a passphrase.
              Choose one and type it twice. Any existing <code>id_ed25519</code>{" "}
              key is left alone.
            </p>
            <SigningNotes bootstrap="start_dbt.ps1" />
            {detailsReady ? (
              <CodeBlock
                lang="bash"
                title="PowerShell · copy and run together"
                code={windowsScript}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-ink-faint bg-paper-warm px-4 py-5 text-center text-sm text-ink-faint">
                Enter your name and GitHub email to generate the PowerShell script.
              </p>
            )}
            <AfterScript />
          </>
        )}

        {route === "mac" && (
          <>
            <p>
              Copy the script and paste it into Terminal. If Git already has a
              signing key, or an earlier run made one, the script reuses it.
              Otherwise <code>ssh-keygen</code>{" "}creates{" "}
              <code>~/.ssh/id_ed25519_signing</code>{" "}and asks for a passphrase.
              Choose one and type it twice. Any existing <code>id_ed25519</code>{" "}
              key is left alone.
            </p>
            <SigningNotes bootstrap="start_dbt.sh" />
            {detailsReady ? (
              <CodeBlock
                lang="bash"
                title="Terminal · copy and run together"
                code={macScript}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-ink-faint bg-paper-warm px-4 py-5 text-center text-sm text-ink-faint">
                Enter your name and GitHub email to generate the Terminal script.
              </p>
            )}
            <AfterScript />
          </>
        )}

        {route === "codespaces" && (
          <>
            <p>
              Codespaces can ask GitHub to sign commits for you, so don&apos;t create
              or upload a local SSH signing key inside the container.
            </p>
            <ol>
              <li>Open <em>GitHub Settings → Codespaces</em>.</li>
              <li>Enable <strong>GPG verification</strong>.</li>
              <li>Allow it for <code>wnl-icb-analytics/dbt-analytics</code>.</li>
              <li>Restart an existing codespace, or create a new one.</li>
            </ol>
            <p>
              GitHub then signs commits made in that codespace and shows them as{" "}
              <strong>Verified</strong>. Check the badge on your first pushed commit.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
