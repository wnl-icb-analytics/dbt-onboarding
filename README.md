# WNL handbook

Handbook for SQL analysts on the
[dbt-analytics](https://github.com/wnl-icb-analytics/dbt-analytics) warehouse:
pages, courses, command reference and a changelog of merged pull requests.

Progress on courses is stored in the browser. No accounts.

dbt is a trademark of dbt Labs, Inc. This is not dbt Labs documentation.

## Develop

```bash
npm install
npm run dev
```

Lesson order lives in `lib/curriculum.ts`. Layer definitions live in
`lib/layers.ts`.

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
