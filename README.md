# dbt onboarding

Courses, handbook, model docs and changelog for SQL analysts working in the
[dbt-analytics](https://github.com/wnl-icb-analytics/dbt-analytics) project.

Courses and the handbook teach the ideas (layers, refs, tests, macros, git) and
walk through a first merged pull request. Progress is stored locally in the
browser — no accounts, no backend.

> dbt™ is a trademark of dbt Labs, Inc. This is a community resource, not an
> official dbt product.

## Develop

```bash
npm install
npm run dev
```

Built with Next.js and Tailwind CSS. Lesson order and metadata live in
`lib/curriculum.ts`; layer definitions in `lib/layers.ts`. Theme colours are
CSS variables in `app/globals.css`; `[data-theme="dark"]` overrides them, so
use the token utilities (`bg-paper`, `text-ink`, `border-line`) rather than
fixed colours.

## Model docs

`/models` frames the dbt docs v2 site. The `dbt-docs` workflow in dbt-analytics
builds it from main on every merge and publishes it to GitHub Pages;
`next.config.ts` rewrites `/dbt-docs/*` to that site so it is served
same-origin and follows the site theme. Link to a model with
`/models?model=<name>`, or search with `/models?q=<text>`.

To develop against local docs, generate them in dbt-analytics and serve the
folder:

```bash
dbt docs generate --output-dir ../dbt-docs-site
npx http-server ../dbt-docs-site -p 8765
$env:DBT_DOCS_ORIGIN = "http://localhost:8765"
npm run dev
```

## Changelog

`/changelog` reads merged pull requests from dbt-analytics through GitHub's
GraphQL API and caches the result for a day. A merge can refresh the cache by
calling `POST /api/revalidate`.

Set these in the Vercel project (Production and Preview):

- `GITHUB_CHANGELOG_TOKEN`: a read-only token that can query public repositories
- `CHANGELOG_REVALIDATE_SECRET`: a shared secret. The same value belongs in
  dbt-analytics as `CHANGELOG_REVALIDATE_SECRET`

For local development:

```bash
$env:GITHUB_CHANGELOG_TOKEN = gh auth token
npm run dev
```
