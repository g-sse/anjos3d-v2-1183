# Anjos3D — Design

Understated 3D-printing studio: warm-white public page and a restrained dark hero. Preserve every existing message, product, copyright and brand asset. This direction replaces the oversized dark editorial layout.

## Brand & colors

Use the supplied Anjos3D sculptural A mark. Background #080b0d, panel #111719, foreground #f0eee9, muted #9ca6a8, thin dividers #333c3e. Primary CTA ember orange #f37942; technical metadata steel blue #62a5c2. Both accent colors echo the logo. WhatsApp green only where it denotes the service.

## Typography & space

Public typography: DM Sans throughout, moderate weight and natural spacing. Hero 44–56px desktop / 34–40px mobile; section headings 28–36px; reading copy 15–17px. Keep the words, reduce emphasis. 1120px content container, warm white #f7f6f2, graphite #262d2d, muted #697371, soft dividers #dce0da, restrained ember and steel-blue accents. Hero #151b1d with its own image area; no oversized letter overlap or decorative grid. Admin keeps its current typography/styles.

## Pages and flow

- `/`: moderate scroll section with a fixed-camera print sequence, compact process/story, applications, live catalog and contact. Text never sits on the object.
- `/admin`: email/password login and protected management dashboard; create, edit, publish and remove products; image upload and WhatsApp configuration.
- Visitors browse published products and open a prefilled WhatsApp conversation; no checkout.
- `/entrar`: warm-white partner login with a compact form, email/password only and no registration. Successful login returns to the catalog. Catalog expands conditions inline, one product at a time; image gallery remains separate. Partner prices are fetched separately with server authorization. Admin gains a scoped partner-management section and nullable resale/consignment inputs without changing existing retail values or imagery.

## Motion and accessibility

Use Three.js only to produce original WebP frames before delivery. Public hero uses Canvas 2D (or a changing img if Canvas 2D is blocked), never WebGL. Scroll position maps deterministically to the exact frame; no autoplay. Prioritize milestone frames, progressively decode, show nearest available frame until exact is ready, and do not hold every decoded bitmap at full resolution indefinitely. Initial poster is the beginning, not a finished object. Explain real asset failures. User explicitly requests scroll printing always enabled, including with OS reduced-motion preference: remove the opt-in gate, keep other optional reveals respecting reduced motion. Validate without WebGL and at real wheel/touch scroll, reverse, reload and iframe.

Visual feedback: no small uppercase slogan labels or upper dividers. Relocate the five slogans as natural sentence-case editorial copy in process, possibilities, catalog and contact, not eyebrow tags. Hero keeps the extraordinary/layer-by-layer subtitle integrated with its primary copy, and only one CTA: Explorar catálogo. No process link or manual animation toggle in the hero.

Compact two-column story blocks and three quiet process steps. Photograph labels stay readable. No large infinity/plus, glowing backgrounds, sprawling footers or dramatic copy crossfades. Short optional in-view reveals only. New styles are scoped to .public-site so the admin is unaffected at the visual checkpoint. After visual approval, add partner access and resale/consignment fields according to the approved plan; never expose protected values in public responses.

## Data

New independent catalog stored in the managed database, not synchronized with the supplied Django source. Better Auth email/password for the configured administrator; typed oRPC API for product CRUD and settings. Tigris object storage for uploaded product photography.

## CMS extension — approved 2026-10-26

Keep the approved public layout and scroll-driven print sequence. Expand `/admin` with a clear editorial workspace: warm-white panels, graphite text, restrained orange primary actions, DM Sans, readable labels, compact tab navigation and a persistent draft/publication toolbar. Distinguish local unsaved edits, saved draft and published content. Never suggest saving changes the live site. Preview uses the actual public components and requires the existing administrator email/password session; partners remain catalog-only. Section ordering uses accessible up/down buttons, not drag-only interactions. Existing product/account saves remain immediate and clearly labeled. No arbitrary HTML/script editor. First checkpoint covers content editing, sections, contact, protected preview and versioned publishing; later checkpoints add media, pages and technical SEO/integrations.

User addition: optional light mode for all administrative screens, including login, CMS, product editor and partners. Keep dark as the default and offer a labeled sun/moon toggle; remember preference in localStorage for this browser. Scope theme tokens to `.admin-surface`, never apply a global public theme. Dark background #0b0e10/panel #151c1e; light background #f7f6f2/panel #fffefa; clear contrast for fields, muted labels, statuses and disabled actions. Changing theme must not discard edits.

## Public palette proposal — logo colors (2026-10-27, awaiting user review)
- Active by default on homepage, draft preview and partner login via `data-palette="logo"` (`src/web/public-palette-logo.css`). `?paleta=original` shows the previous sage palette for comparison. Layout, type, spacing and animation unchanged — color only.
- Tokens: paper #f7f8fb, ink #15233b, muted #5c6880, line #dde2ec, navy #12284a (hero/buttons), blue #2e6ea3, sky #5aa0d0, plum #8e2a5e (highlight words/prices), rose #c8486f, coral #f2928f (hero accents). Gradient blue→coral on step rules and hero progress.
- Hero is solid #132848; baked-background frames use `mix-blend-mode: lighten` + `hue-rotate(-24deg)` so frame background disappears and orange print accents read as coral. Section tints: ice #eef2f8/#edf1f8, contact blush #f8eef1.
