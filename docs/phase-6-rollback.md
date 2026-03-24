# Phase 6 Rollback

## Purpose

Use this only for Phase 6 cutover failures in production.

## Rollback Criteria

Rollback is mandatory if:
- Any critical route is down or serving the wrong app shell.
- `/admin` auth or noindex behavior regresses.
- Supabase read/write validation fails.
- Content published during cutover is missing or corrupted.

## Rollback Steps

1. Announce rollback start in the ops channel.
2. Stop any further content edits or publishes.
3. Revert traffic to the last known-good production deployment.
4. If a DNS or platform alias changed, point it back to the prior target.
5. Restore the previous environment variables only if they changed during cutover.
6. Re-run the verification set:
   - `/`
   - `/nyheter`
   - `/nyheter/:slug` using `/nyheter/kandidatportal-lansert`
   - `/talentportalen`
   - `/admin`
   - Supabase read/write on `public.content_snapshots`
7. Confirm `/admin` still returns `X-Robots-Tag: noindex, nofollow`.
8. Confirm public routes are serving the prior stable content.
9. Record the failure cause, exact timestamp, and the restore point used.

## Success Criteria

Rollback is complete when:
- All critical routes return the expected responses.
- Admin access and noindex behavior are restored.
- Supabase read/write is functional again.
- The prior production deployment is serving traffic.

## After Rollback

1. Keep the content freeze in place.
2. Do not retry cutover until the failure is understood and the owner approves a new window.
3. Escalate any data inconsistency to the product and platform owners immediately.
