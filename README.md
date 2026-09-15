# dbt onboarding

A hands-on onboarding course for SQL analysts joining the
[dbt-analytics](https://github.com/wnl-icb-analytics/dbt-analytics) project.

Six short lessons on the ideas (layers, refs, tests, macros, git), then a guided
walkthrough to a first merged pull request. Progress is stored locally in the
browser — no accounts, no backend.

> dbt™ is a trademark of dbt Labs, Inc. This is a community resource, not an
> official dbt product.

## Develop

```bash
npm install
npm run dev
```

Built with Next.js and Tailwind CSS. Lesson order and metadata live in
`lib/curriculum.ts`; layer definitions in `lib/layers.ts`.

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
