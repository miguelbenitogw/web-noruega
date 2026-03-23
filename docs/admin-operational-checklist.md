# Admin Operational Checklist

Use this checklist before and after working in `/admin`.

## Before login

- Confirm you are on the production domain you expect.
- Verify the page is served over HTTPS.
- Confirm the browser session is private or a trusted device.
- Make sure no one else is actively editing content at the same time.

## Access control

- Use the shared admin password only through approved channels.
- Keep the session short-lived and log out when finished.
- If the password has been rotated, update the source of truth immediately.
- Do not reuse admin credentials outside this site.

## Content edits

- Make one change at a time.
- Review the preview before saving.
- Check copy for broken links, missing accents, and accidental HTML.
- Confirm the content appears correctly on the public page after save.
- If you update news content, verify the article slug and canonical URL.

## SEO and indexing checks

- Confirm `/admin` returns `X-Robots-Tag: noindex, nofollow` in production.
- Confirm the admin view also sets a `robots` meta tag when rendered client-side.
- Verify public pages do not inherit the admin noindex state.
- Check that non-home section pages use their own canonical URL.
- Confirm `/api/*` requests are not rewritten to the SPA shell.

## Security checks

- Watch for repeated failed login attempts.
- Rotate the password if there is any sign of exposure.
- Keep rate limiting enabled and do not weaken it for convenience.
- Avoid entering secrets into content fields.
- Do not use admin on untrusted networks without additional protection.

## After changes

- Save and refresh the public page to confirm the edit is live.
- Verify the layout still works on desktop and mobile.
- Check that analytics and navigation still behave as expected.
- Record any unusual behavior in the team log.
- Sign out of the admin panel when done.

## Release sanity check

- `/` loads normally.
- `/admin` is not indexed.
- `/api/*` responses are still reachable.
- Canonical tags point to the correct route.
- The 404 state shows clean copy.
