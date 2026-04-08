# Norwegian DB cleanup runbook

## Goal

Clean the Supabase data for this project by fixing:

- mojibake / encoding corruption
- obvious Norwegian spelling damage in content fields
- stray bad punctuation that came from encoding issues

This runbook is designed to be safe: dry-run first, backup second, apply third, rollback always available.

## What we found

- Live Supabase MCP access was unavailable in this session because the MCP handshake failed during OAuth refresh.
- The repo already contains corrupted Norwegian seed text in the CMS migration, so the problem is not hypothetical.
- The app also uses a `content_snapshots` table in the phase-6 docs, so the cleanup scripts cover both schema families:
  - `public.content_snapshots`
  - `public.content_templates`
  - `public.content_pages`
  - `public.news_posts`
  - `public.content_editors` when it has a `display_name` column

## Files

- `scripts/db-clean/norwegian_text_dry_run.sql`
- `scripts/db-clean/norwegian_text_apply_template.sql`
- `scripts/db-clean/norwegian_text_rollback_template.sql`

## Recommended execution order

### 1) Dry-run

Use one of these:

#### psql

```powershell
$env:DATABASE_URL = "<your-supabase-postgres-connection-string>"
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/db-clean/norwegian_text_dry_run.sql
```

#### Supabase SQL Editor

Paste the contents of `scripts/db-clean/norwegian_text_dry_run.sql` into the SQL editor and run it.

What the dry-run returns:

- table presence preflight
- inventory of text/jsonb columns in `public`
- affected-row counts
- before/after samples for review

### 2) Review the dry-run output

Pay special attention to:

- rows that contain plain Norwegian words like `sprak`, `niva`, `gjor`, `faar`, `bor`, `loses`
- rows that contain mojibake like `Ã`, `Â`, or replacement-character noise
- any sample that looks like a name, slug, email, URL, or identifier

If a sample is ambiguous, stop and review it manually.

### 3) Apply

Only after the dry-run looks correct.

#### psql

```powershell
$env:DATABASE_URL = "<your-supabase-postgres-connection-string>"
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/db-clean/norwegian_text_apply_template.sql
```

#### Supabase SQL Editor

Paste the contents of `scripts/db-clean/norwegian_text_apply_template.sql` and run it in one transaction.

What the apply script does:

1. Creates logical backup tables for affected rows
2. Normalizes the text fields
3. Normalizes JSONB string values recursively
4. Prints backup counts, update counts, and any remaining suspect rows

### 4) Verify after apply

Verify that:

- the backup tables were populated
- the update counts are non-zero only for the expected tables
- the verification section returns no remaining suspect rows
- the visible UI content renders correctly

### 5) Keep backups until sign-off

Do not drop the backup tables until:

- the app is checked visually
- the affected rows are verified
- the rollback path is no longer needed

## Rollback

Use the rollback script if the cleaned data looks wrong.

#### psql

```powershell
$env:DATABASE_URL = "<your-supabase-postgres-connection-string>"
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/db-clean/norwegian_text_rollback_template.sql
```

#### Supabase SQL Editor

Paste the contents of `scripts/db-clean/norwegian_text_rollback_template.sql` and run it.

Rollback behavior:

- restores only the columns changed by the cleanup
- uses the logical backup tables created by the apply step

## What is still missing for end-to-end execution

- a live Supabase connection string or SQL Editor access
- confirmation of which schema family is present in the target database
- human approval for any borderline linguistic correction
- a staging run or production maintenance window

## Final validation checklist

- [ ] Dry-run executed successfully
- [ ] Preflight shows the expected tables
- [ ] Samples reviewed by a human
- [ ] Logical backup tables created
- [ ] Apply finished without SQL errors
- [ ] Verification shows no remaining suspect rows
- [ ] Public pages still render correctly
- [ ] Rollback script tested or at least validated on a non-production copy
- [ ] Backups retained until sign-off

## Notes

- The scripts intentionally avoid changing emails, slugs, and URLs unless they are explicitly part of the content cleanup scope.
- This is a cleanup pass, not a re-seeding pass. If the seed SQL remains corrupted, a future re-seed can reintroduce the problem.
