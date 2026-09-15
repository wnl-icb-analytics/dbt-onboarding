import type { Metadata } from "next";
import { DocsFrame } from "@/components/DocsFrame";
import { DBT_DOCS_ENTRY, getDocsBuild, modelDocsRoute } from "@/lib/dbt-docs";

export const metadata: Metadata = {
  title: "Model docs",
  description: "Every model, source, column and test in dbt-analytics, with lineage. Rebuilt from main on every merge.",
};

type Params = { path?: string; model?: string; q?: string };

function routeFrom(params: Params): string {
  if (params.path?.startsWith("/")) return params.path;
  if (params.model) return modelDocsRoute(params.model);
  return "/";
}

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const [params, build] = await Promise.all([searchParams, getDocsBuild()]);

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] flex-col md:h-[calc(100dvh-3.5rem)]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-2 sm:px-6">
        <h1 className="font-display text-sm font-extrabold tracking-tight text-ink">Model docs</h1>
        <p className="font-mono text-[11px] text-ink-faint">
          {build.generatedAt ? (
            <>
              Built from <span className="text-ink-soft">main</span>{" "}
              <time dateTime={build.generatedAt}>{formatBuilt(build.generatedAt)}</time>
              {build.dbtVersion ? ` · dbt ${build.dbtVersion}` : null}
            </>
          ) : (
            "Rebuilt from main on every merge"
          )}
        </p>
        <div className="ml-auto flex items-center gap-3 font-mono text-[11px]">
          <a
            href="https://github.com/wnl-icb-analytics/dbt-analytics/actions/workflows/dbt-docs.yml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-faint transition hover:text-flame-deep"
          >
            Build history ↗
          </a>
          <a
            href={DBT_DOCS_ENTRY}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-faint transition hover:text-flame-deep"
          >
            Full screen ↗
          </a>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        {build.available ? (
          <DocsFrame route={routeFrom(params)} query={params.q} />
        ) : (
          <Unavailable />
        )}
      </div>
    </div>
  );
}

function Unavailable() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-flame">
        Not published yet
      </p>
      <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink">
        The model docs are not reachable
      </h2>
      <p className="mt-3 leading-relaxed text-ink-soft">
        The <code className="font-mono text-[0.9em]">dbt-docs</code> workflow in dbt-analytics
        builds these docs from main and publishes them to GitHub Pages. Until its first run
        finishes, generate them locally with{" "}
        <code className="font-mono text-[0.9em]">dbt docs generate</code> and{" "}
        <code className="font-mono text-[0.9em]">dbt docs serve</code>.
      </p>
    </div>
  );
}

function formatBuilt(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(iso));
}
