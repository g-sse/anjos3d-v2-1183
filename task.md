# Anjos3D — approved scroll-print implementation

## Interjection — logo color palette for public homepage (2026-10-27)
- [x] User approved CMS checkpoint 1; before media/pages/SEO, asked for a color-only version of the homepage matching the logo.
- [x] Scoped override `public-palette-logo.css`, default on; `?paleta=original` compares. Lint/build pass; qa-redesign all pass; desktop/mobile screenshots in /home/user/anjos3d-palette/.
- [ ] Await palette review, then resume CMS phase 2 (media, pages, SEO) — nothing of phase 2 implemented yet.

## Current task — CMS/SEO extension (plan approved)

- [x] User approved `/home/user/anjos3d-cms-plan.md`; Google integration defaults to GA4 ID/Search Console verification, not embedded API reports.
- [x] Read current app, auth/API/web references and public text inventory.
- [x] First checkpoint: additive content versions, administrator editor, sections/contact, saved draft preview, publish/restore and public binding.
- [x] User-requested optional light/dark admin theme, persisted in browser and scoped away from public site.
- [x] Test isolation/conflicts/permissions, data preservation and hero/catalog/mobile; lint/build.
- [x] Deliver first functional CMS checkpoint — approved by user.
- [ ] After review: media library, new pages, SEO controls and server-delivery technical checkpoint, integrations, final validation.

Existing administrator email/password remains; preview/editor/publication are admin-only. Catalog and partner account operations keep direct saves. No real product/account edits. Do not edit template-managed `__*` files. Server-side SEO compatibility remains a pending technical checkpoint, not an implemented claim.

Checkpoint QA: `/home/user/qa-cms.py` → `/home/user/anjos3d-cms-qa/results.json`, all checks passed: 116 content fields, correct original text/WhatsApp seeding, separate unsaved/saved/public versions, UI save/preview/publish, anonymous and partner CMS denials, stale-write/publish conflicts, unsafe link/unknown fields rejection, hide/reorder reflected in layout/menu, restore as draft then publish, dark/light login/dashboard persistence, mobile 390/360 no overflow, existing catalog/gallery and all 3 price inputs retained, zero page errors. `/home/user/cleanup-cms-qa.ts` removed the synthetic account and its sessions/credentials plus all 3 test versions, restoring original CMS state/timestamps/revisions. `data-preservation.json` confirms both real products and original partners unchanged.

Hero regression `/home/user/qa-redesign.py` rerun: exact frames and reverse, wheel/touch, stable idle, no WebGL/Three.js requests, reduced-motion always-on, image fallback/retry, original prose/CTA and mobile checks passed. Async CMS loading initially reset reload position; fixed using validated session cache of only published public content, never draft/private prices. Middle reload now retains progress 0.3241. Lint 0 warnings/errors and build successful; existing >500kB main bundle warning remains. Final UI screenshots inspected for desktop themes, draft preview and mobile editor.

## Current revision — mixed light/dark redesign (approved)

- [x] Read approved redesign plan and current files.
- [x] Produce 65 original pre-rendered print frames; remove browser WebGL dependency.
- [x] Recompose entire public layout with smaller DM Sans text, warm-white sections and dark hero; preserve message inventory.
- [x] Verify real wheel/touch scrolling, reverse, no WebGL, reduced-motion opt-in, mobile and existing catalog.
- [x] Deliver initial visual checkpoint and collect review.
- [x] Apply requested follow-up: relocate slogans into prose, remove upper section rules, one hero CTA, integrate subtitle, always-on scroll printing without activation gate.
- [x] Deliver revised visual checkpoint and obtain visual approval before partner features (user: “Sim, pode seguir”).
- [x] After visual review: implement protected resale/consignment and admin-created partner accounts; migration additive, preserve existing products.
- [x] Verify permissions/login/logout with temporary account/product; cleanup and original-data comparison passed.
- [x] Final UI/regression validation and build/lint passed; complete app ready for delivery.

Partner implementation: nullable product resale/consignment fields, settings negotiation quantity default 5, partners table linked to Better Auth user. Signup permanently disabled; session-create hook checks owner or active partner. Admin-only create/block/reset, credential hashes use Better Auth's password hashing in its existing account table. Block/reset revoke all sessions. Explicit public product projection and separate protected published-product price query. `/entrar` returns to catalog; partner `/admin` redirects with no dashboard fetch. Admin adds partner management and three-price editor. Inline condition expansion plus separate photo viewer/navigation. Anonymous condition lines negotiate without protected values; authenticated volume links include product/modality/quantity. Cache keys partition access by identity; logout cancels/clears queries.

QA `/home/user/qa-partners.py` -> `/home/user/anjos3d-partners-qa/results.json`: admin creation through UI, duplicate and owner email rejected, signup disabled, public allowlist, anon protected/admin denied, partner prices, all 9 admin APIs denied to partner, admin page redirect, logout DOM/cache/API cleared, block login/session denial, reset invalidates sessions and old password while new password works, inline/gallery navigation, WhatsApp mode/quantity, mobile no overflow, zero page errors. Temporary product deleted; temporary partner and its sessions/credential rows removed. All original product columns byte-equivalent to `/home/user/anjos3d-products-before-partners.json`; both original protected prices remain null. No email sent, no real product writes.

## Historical visual checkpoints (superseded by approved partner implementation)

The following notes record earlier checks, not the current backend scope or approval status.

User video shows static path (reduced motion or WebGL failure); exact trigger unknown. Do not claim Opera GX verified from Chrome tests. New visual phase must work without WebGL. Backend/admin/data unchanged at checkpoint.

User subsequently confirmed sequence works in Opera GX after manual activation. Per explicit request, removed the reduced-motion gate from hero only; other reveals still respect reduced motion. Current rerun `/home/user/anjos3d-redesign-qa/results.json`: animation starts at frame 0 and scrolls even with emulated reduced-motion preference, activation button absent, one hero CTA, five slogans present once in sentence-case prose and no section-topline upper rules. All wheel/touch/reverse/fallback/retry/catalog checks pass, zero page errors, API hashes unchanged. Lint clean and build successful (existing main chunk warning only). Await revised visual approval, not claiming partner functionality complete.

Current checkpoint QA: `/home/user/anjos3d-redesign-qa/results.json`, runner `/home/user/qa-redesign.py`. Exact frames 0/16/32/48/64 and reverse passed, actual wheel and emulated touchscreen gestures passed, no idle autoplay after target frame loaded, middle reload preserved progress. WebGL blocked: zero WebGL requests, zero Three.js imports. Canvas disabled: changing image fallback passed. Reduced-motion static and explicit opt-in passed. Asset failure notice and retry passed. Mobile 390×844 and 360×640 have no horizontal overflow. Existing two products, category filters, details/Escape and WhatsApp passed. Admin login renders outside public CSS scope; all API file hashes identical to baseline. Static page text inventory has no missing phrases. No page errors. Sequence total 1.26 MiB; decoded image cache limited to 16 frames. Lint clean; build passes with pre-existing main-bundle size warning, no public Three.js chunk. Published site/physical Opera GX remain unverified: user reviews this preview before partner functionality starts.

## Prior revision (superseded)

- [x] Revised plan approved by user.
- [x] Read app skill, existing public UI and design.
- [x] Install Three.js and document new visual direction.
- [x] Build deterministic layered print scene, lazy canvas and scroll hero.
- [x] Refine post-hero scale and in-view motion; preserve admin/API/data.
- [x] Render static scene poster and verify milestones/reverse/mobile/fallbacks.
- [x] Run lint/build and browser regression checks.
- [ ] Deliver existing website.

Decisions: original illustrative sculptural vessel; Motion progress -> deposited path, no autoplay. One demand-rendered WebGL2 canvas; poster/reduced-motion fallback. No backend/admin edits or product writes.

QA: /home/user/anjos3d-qa/results.json and milestone screenshots. Desktop layers 0/38/76/114/144; mobile 0/29/59/89/112. Identical reverse state, no idle render loop, mid-scroll reload, orientation and no horizontal overflow. Reduced motion skips canvas/module. WebGL/context/import failure -> short static hero and 69KB poster. CPU 4x + 180KB/s Chromium test passed; no physical-device FPS guarantee. Current catalog has 2 user products; filters, modal, Escape and WhatsApp passed. Admin login/dashboard read-only passed; no product writes. No page errors. Final lint: zero warnings/errors. Build succeeded; existing main and lazy Three.js chunks emit >500KB size warnings (gzip 234KB/134KB), no compile errors.