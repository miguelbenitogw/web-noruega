# Admin editor QA checklist

Use this checklist after changing the admin content editor.

## Scope

- Split-pane editor layout
- Live preview on the right
- Structured field rendering for supported schemas
- JSON fallback for unsupported schemas
- Save flow and validation

## Pre-check

- [ ] Open `/admin` in desktop width.
- [ ] Confirm the selected entity loads without a blank screen.
- [ ] Confirm the console has no runtime errors before editing.

## Layout checks

- [ ] Editor stays on the left and preview stays on the right on wide screens.
- [ ] Preview stacks below the editor on narrow screens.
- [ ] The preview panel remains readable while scrolling.
- [ ] The save button remains reachable without overlapping the preview.

## Structured field checks

- [ ] `string[]` fields render as a friendly list editor.
- [ ] `object` fields with `schema.properties` render as grouped inputs.
- [ ] `array<object>` fields with explicit item properties render row-by-row.
- [ ] Required field validation appears inline for structured fields.
- [ ] Reordering items in repeatable lists preserves the payload.

## JSON fallback checks

- [ ] Unsupported objects still render as JSON fallback.
- [ ] Unsupported arrays still render as JSON fallback.
- [ ] Invalid JSON shows an error message and blocks save.
- [ ] Disabling `VITE_ADMIN_STRUCTURED_EDITOR` falls back to JSON-only editing.

## Preview checks

- [ ] Page preview reflects title, slug, excerpt, body, cover image and status.
- [ ] SEO tab shows the correct URL, title and description snapshot.
- [ ] Payload tab reflects the resolved content and save payload.
- [ ] Template issues appear in preview when the resolver reports them.

## Save flow checks

- [ ] Save works for a valid published draft.
- [ ] Save works for a new draft created from the template selector.
- [ ] Save is blocked when required fields are missing.
- [ ] Save is blocked when there are invalid JSON fields.

## Regression checks

- [ ] Existing pages still load and save correctly.
- [ ] Existing news items still load and save correctly.
- [ ] Norwegian UI text displays correctly without mojibake.
- [ ] No new console errors appear after switching entities repeatedly.

## Recommended verification order

1. Run the app locally.
2. Check `/admin`.
3. Verify one page and one news item.
4. Test a structured array field.
5. Test a JSON fallback field.
6. Toggle the feature flag off and confirm fallback behavior.

