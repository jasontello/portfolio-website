# Design QA - Portfolio Layout Corrections

- Issue reference: `/Users/jasontello/Documents/screenshots/Screenshot 2026-07-27 at 6.58.31 PM.png`
- Final implementation: `/Users/jasontello/VScode/Personal_Website/tmp/home-uniform-project-grid-final.png`
- Verified direct-page viewport: 1280 x 720
- State: Work tab active, light paper texture, no modal open

## User-requested correction

The issue reference shows Funfetti using a full-row editorial treatment with a large image and its metadata beside it. Jason asked for Funfetti to stop being highlighted and to match the remaining projects.

The final implementation removes the featured-project state entirely. Funfetti, Open Source San José, BizzNEST, and John Tello Engineering Portfolio now use the same grid track, preview aspect ratio, metadata placement, title size, caption size, spacing, and hover behavior.

## Visual verification

- The Work grid is two equal `567px` columns at the verified 1280px viewport.
- Every visible Work card measures `567px` wide.
- Every visible preview measures `569 x 385px`, including Funfetti.
- Funfetti now occupies the first standard grid cell, with its metadata below the preview.
- No card has the `is-current-featured` class.
- No horizontal overflow is present.

## Responsive behavior

- The existing two-column grid remains active through tablet widths.
- At 700px and below, the grid becomes one centered column with a 620px maximum card width.
- The uniform card treatment uses the same responsive rules for every project; there is no Funfetti-specific breakpoint behavior.

## Interaction verification

- Work and Experiments filtering remains functional.
- Hidden cards retain synchronized `aria-hidden` state.
- BizzNEST video playback behavior remains tied to filter visibility and reduced-motion preference.
- Existing project destinations and card copy remain unchanged.

## Code verification

- `node --check script.js` passes.
- `git diff --check` passes.
- `http://127.0.0.1:8081/index.html` returns HTTP 200.

## Locked Sandbox layout

- Issue reference: `/Users/jasontello/Documents/screenshots/Screenshot 2026-07-27 at 7.06.36 PM.png`
- Final implementation: `/Users/jasontello/VScode/Personal_Website/tmp/sandbox-locked-fullscreen-final.png`
- Verified direct-page viewport: 1280 x 720
- `sandbox.html` loads with the full-width classes on both `html` and `body`.
- The fullscreen toggle and legacy `.main-navigation` sidebar are absent from the page.
- The old biography and sidebar navigation cannot be restored from Sandbox.
- The centered content navigation remains visible and functional.
- At 900px and below, Sandbox keeps that navigation visible in a wrapped mobile layout instead of falling back to the removed sidebar.
- The Sandbox hub measures 1183px within the 1280px viewport.
- The page reports zero horizontal overflow.
- `http://127.0.0.1:8081/sandbox.html` returns HTTP 200.

final result: passed
