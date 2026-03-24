# Phase 6 Cutover Runbook

## Scope

This runbook covers the production cutover for Phase 6 only.

Primary assets:
- `/`
- `/nyheter`
- `/nyheter/:slug` using a known published slug, first choice: `/nyheter/kandidatportal-lansert`
- `/talentportalen`
- `/admin`
- Supabase read/write validation on `public.content_snapshots`

## Roles

- Cutover owner: executes the checklist and calls go/no-go.
- QA verifier: performs route checks and records results.
- DB verifier: confirms Supabase read/write behavior.

## Timing

- T-48h: dry-run in staging or preview.
- T-24h: content freeze and final backup/export.
- T-60m: production preflight.
- T0: deploy and switch traffic.
- T+15m: post-deploy verification.
- T+60m: final sign-off if all checks hold.

## Dry-Run

1. Deploy the Phase 6 build to staging/preview.
2. Verify the same route set listed below.
3. Confirm Supabase auth and content access work with test credentials.
4. Capture screenshots or curl output for:
   - `/`
   - `/nyheter`
   - `/nyheter/kandidatportal-lansert`
   - `/talentportalen`
   - `/admin`
5. Confirm rollback path still points to the prior production version.

Go/no-go gate for dry-run:
- All route checks pass.
- Supabase read/write passes.
- No unexplained 4xx/5xx responses.

## Go-Live

### Preflight at T-60m

1. Freeze content edits.
2. Confirm the previous production deployment is still available for rollback.
3. Confirm monitoring, logs, and alert channels are active.
4. Confirm the cutover owner and verifier are online.
5. Re-run the route and Supabase checks below against production.

### Production checks

For each route, verify:
- HTTP 200 unless noted otherwise.
- Correct canonical URL.
- No unexpected redirect chains.
- Page renders the expected content and not an empty shell.

Checks:

1. `/`
   - Returns 200.
   - Loads the homepage hero and primary navigation.
   - No admin-only content appears.

2. `/nyheter`
   - Returns 200.
   - Shows the news listing, not a 404 or blank state.
   - Contains at least one article card or valid empty-state copy.

3. `/nyheter/:slug`
   - Use `/nyheter/kandidatportal-lansert` for the production check unless a different migrated slug is assigned.
   - Returns 200.
   - Renders the article title and body content.
   - Canonical matches the slugged URL.
   - No redirect back to `/nyheter`.

4. `/talentportalen`
   - Returns 200.
   - Loads the correct page content and CTA(s).
   - No missing asset or console-error symptoms from the page shell.

5. `/admin`
   - Returns 200 only to authorized users.
   - Shows login or admin UI as expected.
   - Response includes `X-Robots-Tag: noindex, nofollow`.
   - No public-page content is exposed.

### Supabase validation

Use `public.content_snapshots`.

Read check:
1. Query the `published` row for the target locale.
2. Confirm the row is readable by the intended role.
3. Confirm the returned JSON matches the expected content snapshot.

Write check:
1. Insert or update a `draft` row with a known test locale or approved test payload.
2. Confirm the write succeeds for an authenticated editor.
3. Read the row back immediately.
4. Confirm `updated_at` changes and the payload persists.
5. Remove the test row or revert it to the prior state.

Go-live gate:
- All five route checks pass.
- Supabase read/write passes.
- No auth regression on `/admin`.
- No unexpected indexing or routing behavior.

## Post-Go-Live

### T+15m

1. Re-check `/`, `/nyheter`, `/nyheter/kandidatportal-lansert`, `/talentportalen`, and `/admin`.
2. Confirm no spike in 5xx, 404, or login failures.
3. Confirm Supabase read/write still works for an editor.
4. Confirm analytics and uptime monitoring are recording traffic.

### T+60m

1. Confirm the new deployment is stable.
2. Confirm the previous deployment is still retained until sign-off.
3. Clear the content freeze only after the owner approves.

## Rollback Trigger Thresholds

Rollback immediately if any of these occur:
- Any production route returns 5xx twice in a row.
- `/` or `/nyheter` returns anything other than 200.
- `/nyheter/:slug` cannot render the assigned published article.
- `/talentportalen` renders a blank shell or loses critical CTAs.
- `/admin` loses `X-Robots-Tag: noindex, nofollow`.
- `/admin` is accessible without the expected auth state.
- Supabase read or write fails after one retry.
- Content is missing, duplicated, or clearly stale on a public route.

If rollback is triggered, stop publishing new content until [phase-6-rollback.md](./phase-6-rollback.md) is complete.
