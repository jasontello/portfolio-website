# Combined portfolio design QA

## Editorial Void direction

## Reference and implementation

- Source visual: `/Users/jasontello/.codex/visualizations/2026/08/23/01a02fca-96db-7e80-b4fb-f818ecbc2896/void-refined-03-editorial-composition.png`
- Implementation screenshot: `/Users/jasontello/.codex/visualizations/2026/08/23/01a02fca-96db-7e80-b4fb-f818ecbc2896/variant-c-polished-desktop-register.png`
- Combined comparison: `/Users/jasontello/.codex/visualizations/2026/08/23/01a02fca-96db-7e80-b4fb-f818ecbc2896/compare-c-editorial-polished.png`
- Desktop viewport: 1440 x 900 CSS pixels at DPR 1.
- Source raster: 1497 x 819 pixels. Implementation raster: 1440 x 900 pixels.
- Comparison normalization: both images fitted and centered in 1200 x 700 pixel frames, then placed side by side.
- State: REGISTER state. Additional checks covered QUIET, whole-page INVERSE, and a 390 x 844 mobile viewport.

## Visual comparison

The implementation most closely preserves the reference board's balance: a dominant organic numeric formation, oversized editorial typography, restrained hairline interface fragments, muted off-white texture, a small acid accent, and a purposeful black counter-state. The primary differences are intentional interaction layers rather than stylistic drift.

The full-view comparison established hierarchy and balance. Focused checks used the REGISTER and INVERSE screenshots plus the mobile screenshot because the small reading window, black-state contrast, and compressed composition were the highest-risk regions.

## QA history

### Pass 1

- No P0, P1, or P2 visual issues found.
- P3: the oversized `UNFOLD` ghost word is a stronger authored gesture than any single typographic fragment in the source board.

### Final pass

- No clipping or horizontal overflow at 1440 x 900 or 390 x 844.
- Pointer and touch displacement, click/tap state cycle, keyboard activation, idle evolution, and Escape return work.
- Reduced-motion, DPR limiting, cleanup, and page-visibility behavior were inspected in code.
- No browser console errors were observed during the checked states.

### Selected-direction polish

- Added device-specific interaction copy so desktop says `MOVE / PRESS` while mobile says `DRAG / TAP`.
- Added safe-area-aware header, footer, and reading-window spacing for notched mobile devices.
- Limited canvas drawing to 30 frames per second, capped DPR at 1.75, and added a 1.5-second pointer recovery so the field returns to its idle posture after interaction.
- Added a reduced-motion-aware formation fade between states and state-specific accessible labels.
- Rechecked QUIET, REGISTER, INVERSE, keyboard activation, Escape return, and 390 x 844 mobile composition.
- Final mobile layout measured 390 x 844 with a 390 x 844 document, confirming no horizontal or vertical overflow.
- The final combined source/implementation comparison preserved the selected balance of organic data form, editorial typography, compact system windows, and negative space.

## Final result

Passed with no open P0, P1, or P2 findings. The P3 ghost typography is retained because it anchors the editorial half of the hybrid concept.
---

## Portfolio AI companion

## Evidence

- Source visual truth: `/Users/jasontello/.codex/generated_images/01a03139-b1a9-7b52-849e-bdc03b3b1b9c/exec-8b692426-7d57-4c8f-8f71-9cadf7cdb858.png`
- Browser-rendered desktop implementation: `/Users/jasontello/VScode/Personal_Website-portfolio-ai/qa/portfolio-assistant/desktop-answer.png`
- Browser-rendered mobile implementation: `/Users/jasontello/VScode/Personal_Website-portfolio-ai/qa/portfolio-assistant/mobile-answer.png`
- Full-view side-by-side comparison: `/Users/jasontello/VScode/Personal_Website-portfolio-ai/qa/portfolio-assistant/desktop-comparison.png`
- Focused panel comparison: `/Users/jasontello/VScode/Personal_Website-portfolio-ai/qa/portfolio-assistant/panel-comparison.png`

Desktop source pixels were `1487 x 1058`. The source was proportionally resized and center-cropped to `1440 x 1024` for comparison. The implementation capture was `1440 x 1024` at a `1440 x 1024` CSS viewport and density 1. The mobile capture was `390 x 844` at a `390 x 844` CSS viewport and density 1.

Compared state: assistant open with the suggested question `Which project shows UX thinking?`, a grounded answer, two sources, a matched Funfetti project, and the question form visible.

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: The implementation uses the site's Space Grotesk and DM Mono pairing. Panel hierarchy, compact metadata, question copy, answer copy, and source rows match the selected visual language without introducing a parallel type system.
- Spacing and layout rhythm: The fixed `386px` desktop panel preserves the source proportions, full-height edge alignment, hairline divisions, bottom question form, and ample negative space. The `390 x 844` mobile panel becomes a full-width sheet with an independently scrollable answer area and a persistent form.
- Colors and visual tokens: The panel reuses the portfolio's paper texture, black ink, muted text, and `--line-soft` divider token. There are no gradients, glows, glass effects, or unrelated accent colors.
- Image quality and asset fidelity: The companion uses generated transparent PNG assets rather than CSS or inline SVG art. The matched project uses the real Funfetti portfolio thumbnail. Transparent edges and small-size legibility are clean in the desktop and mobile captures.
- Copy and content: The answer is grounded in the approved case studies and resume. It avoids first-person impersonation, exposes source links, and uses an explicit insufficient-information response for unsupported questions.
- Interaction and accessibility: Open, close, suggested question, typed question, source links, matched project link, Escape close, `/` open, focus return, 500-character input cap, disabled error state, `aria-live`, `aria-busy`, and `prefers-reduced-motion` behavior are implemented. Fresh browser load produced no site console warnings or errors.
- Page awareness: Browser checks passed for Selected Work, Funfetti, Open Source San Jose, BizzNEST, Music, Style Guide, and Experiments contexts.

## Comparison history

### Pass 1

- [P2] The matched Funfetti row and a second black `View Funfetti` button duplicated the same action.
- Fix: Removed the duplicate black project button. The matched-project row is now the single project action, while the bottom form remains the single question action.

### Pass 2

- Post-fix evidence: `qa/portfolio-assistant/panel-comparison.png` and `qa/portfolio-assistant/desktop-comparison.png`.
- Result: The answer, source rows, matched project, companion attachment point, panel proportions, and persistent input now read as one coherent utility. No P0, P1, or P2 findings remain.

## Follow-up polish

- [P3] A future asset pass could add a dedicated presenting pose. The current implementation uses the approved idle image with a small state transform after an answer.
- [P3] The source mock uses a narrow mechanical `INDEX` tab. The implementation intentionally replaces that control with the selected pet launcher, which is the user's requested product change.

### Mascot hover-pose pass

- Added three identity-matched transparent PNG poses: curious lean, small wave, and eager ready.
- Normal pointer hover and keyboard focus play one restrained pose sequence, then settle on the wave instead of looping indefinitely.
- Reduced-motion mode changes directly to the static wave pose.
- All three assets use the same `380 x 420` transparent canvas and bottom alignment, avoiding frame-size and baseline popping.
- Desktop and `390 x 844` mobile checks showed no horizontal overflow or broken pose assets. A fresh browser load produced no console errors.

### Expanded wave pass

- Replaced the three-image hover swap with a `14`-frame, one-shot sprite sequence lasting `1.35s`.
- Generated four additional transparent in-betweens: early lift, mid lift, inward wrist swing, and outward wrist swing. One detached-hand draft was rejected and regenerated before integration.
- Repeated anticipation, center, and final frames inside the sprite strip to create ease-in, two readable wrist swings, and a settled ending without continuous looping.
- The browser loads one `524 KB` transparent sprite strip rather than fourteen separate animation requests.
- Desktop checks confirmed the sprite advances through all background positions and holds its final frame. At `390 x 844`, the sprite fits its `94 x 104` slot, the page has no horizontal overflow, and opening the assistant removes the hover sprite cleanly.
- A fresh browser load produced no console errors.

## Verification checklist

- `node --check script.js`: passed
- Knowledge JSON parse: passed
- `git diff --check`: passed
- Desktop closed, open, answer, and unsupported-answer states: passed
- Mobile open and answer states: passed
- Keyboard Escape and `/` shortcut: passed
- Seven page-context mappings: passed
- Fresh browser console: passed

final result: passed
