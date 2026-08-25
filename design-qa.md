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
- Copy and content: The answer is grounded in the approved case studies and resume. It uses the user-approved first-person Jason voice, exposes source links, and uses an explicit, uncertainty-aware response for unsupported questions.
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

---

## Orbit Ink thinking state

## Evidence

- Source visual truth: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/portfolio-assistant/orbit-ink-source.png`
- Browser-rendered desktop implementation: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/portfolio-assistant/orbit-ink-thinking-implementation-v3.png`
- Browser-rendered `1280 x 720` answer state: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/portfolio-assistant/orbit-ink-answer-1280.png`
- Browser-rendered `390 x 844` thinking state: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/portfolio-assistant/orbit-ink-thinking-mobile-390.png`
- Full-view side-by-side comparison: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/portfolio-assistant/orbit-ink-thinking-comparison-v3.png`
- Focused sidebar comparison: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/portfolio-assistant/orbit-ink-sidebar-comparison-v3.png`

The source and desktop implementation are both `1672 x 941` pixels at a `1672 x 941` CSS viewport and density 1. The responsive checks used `1280 x 720` and `390 x 844` CSS viewports. The selected comparison state is the open white sidebar after asking `What tools does Jason use?`, while the assistant is thinking and before the grounded answer appears.

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: The implementation retains the portfolio's Space Grotesk and DM Mono system. The quiet uppercase thinking caption matches the reference's software-instrument tone without adding a competing status checklist.
- Spacing and layout rhythm: The `386px` desktop panel, context header, large centered orbit, mascot, caption, and fixed composer follow the selected composition. At `1280 x 720`, the compact-height rules preserve the full thinking scene; at `390 x 844`, the orbit scales down and the panel stays edge-aligned.
- Colors and visual tokens: The portfolio canvas keeps `walltexture.jpg`; the sidebar remains literal white. The active thought uses solid black with a white grid glyph, while inactive thoughts use black ink and low-opacity gray orbit marks. No blue or cyan assistant-state accent remains.
- Image quality and asset fidelity: The inactive orbit and active thought are real transparent PNG assets at `1254 x 1254`. They preserve the hand-drawn line character, clean alpha edges, consistent stroke weight, and the selected source geometry. The existing transparent thinking mascot remains unmodified.
- Copy and content: The animation uses the visitor's real question, a concise `THINKING THROUGH THE PORTFOLIO...` caption, and Jason-voice grounded answers. It does not expose hidden chain-of-thought or fake processing metrics.
- States and interactions: Asking a question replaces the former checklist with four semantic live-region updates while the orbit, active thought, and mascot animate. The sequence resolves into the existing grounded answer and source links, supports repeated questions, and cancels stale sequences.
- Accessibility and responsiveness: The input remains labeled, the result uses `aria-live` and `aria-busy`, keyboard controls remain intact, and `prefers-reduced-motion` disables all three visual animations while advancing directly to the answer. The assistant body hides horizontal overflow and keeps the composer usable on mobile.

## Comparison history

### Pass 1

- [P2] The first implementation rendered the orbit too small and too high compared with the chosen solid-black concept.
- Fix: Increased the desktop orbit to `376px`, enlarged the active thought and mascot, and lowered the scene while preserving compact-height and mobile overrides.

### Pass 2

- [P2] The enlarged scene could add an unnecessary sidebar scrollbar at the full `1672 x 941` comparison viewport.
- Fix: Applied border-box sizing to the thinking scene and verified the assistant body at `752px` client and scroll height.

### Pass 3

- [P2] A `100vw` mobile panel could shift left by the browser scrollbar width on long portfolio pages.
- Fix: Use `100%` of the fixed assistant root at the mobile breakpoint, keeping the panel within the layout viewport.
- Post-fix evidence: `qa/portfolio-assistant/orbit-ink-thinking-comparison-v3.png` and `qa/portfolio-assistant/orbit-ink-sidebar-comparison-v3.png`.
- The selected sidebar composition now matches in scale, placement, surface, and monochrome state contrast. The final answer flow remains functional and a clean browser tab produced no application console errors.

## Follow-up polish

- [P3] The orbit raster is intentionally larger than its rendered slot for clean high-density edges. A future asset pass could reduce its file weight after the interaction direction is locked.

final result: passed

---

## Diagnostic Spine question flow

## Evidence

- Source visual truth: `/Users/jasontello/.codex/generated_images/01a03139-b1a9-7b52-849e-bdc03b3b1b9c/exec-03784b32-28fb-493a-bebe-468b085e8636.png`
- Browser-rendered desktop implementation: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/diagnostic-spine-desktop-final.png`
- Browser-rendered mobile implementation: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/diagnostic-spine-mobile-final.png`
- Full-view side-by-side comparison: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/diagnostic-spine-comparison-full.png`
- Focused panel comparison: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/diagnostic-spine-comparison-panel.png`

The source raster is `1672 x 941` pixels and was normalized to `1440 x 810` for comparison. The desktop implementation is `1440 x 810` pixels at a `1440 x 810` CSS viewport and density 1. The mobile implementation is `390 x 844` pixels at a `390 x 844` CSS viewport and density 1.

Compared state: the sidebar is open after asking `Which project shows UX thinking?`; `PARSE QUERY`, `SCAN INDEX`, and `RANK MATCH` are complete; `GROUND ANSWER` is active; the operator mascot, resolving-answer preview, source-preparation rows, and persistent composer are visible.

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: The implementation retains the portfolio's Space Grotesk and DM Mono system. Compact diagnostic labels, timings, status text, and body hierarchy closely match the reference without copying ImageGen text artifacts.
- Spacing and layout rhythm: The existing `386px` white sidebar remains full-height and edge-aligned. The four-stage rail, resolving preview, source rows, and bottom composer fit at `1440 x 810`; the `390 x 844` layout uses the same sequence without horizontal overflow or cropped controls.
- Colors and visual tokens: The main canvas still renders `walltexture.jpg` at `0.5` opacity. The sidebar reports `rgb(255, 255, 255)` and uses one restrained `#00b8d4` signal for the active packet and rail segment. No gradients, glow, or textured sidebar surface were introduced.
- Image quality and asset fidelity: The live operator uses the existing transparent `index-thinking.png` mascot asset, preserving the approved character identity and clean edges. The launcher mascot is hidden during processing so the source's single-operator composition is retained.
- Copy and content: Stage names and timings follow the selected concept. The composer keeps the visitor's real question visible, and the final answer returns the existing grounded answer and source links instead of a decorative mock response.
- Interaction and accessibility: The real sequence advances through four states, cancels stale sequences on a new question, updates an assistive live region, respects reduced-motion preferences, resolves into the grounded result, supports repeated questions, and preserves open/close behavior. Fresh desktop and mobile browser runs produced no console errors.

## Comparison history

### Pass 1

- [P1] The first processing build left the welcome copy and suggested questions above the diagnostic rail, pushing the scan below the intended focal area.
- Fix: Hide the welcome state and question card while processing so `PACKET ROUTE` begins directly below context, matching the source hierarchy.
- [P2] The fixed launcher mascot remained visible while the diagnostic operator was active, producing two mascots.
- Fix: Hide the launcher during the thinking state and keep the in-rail operator as the only character.
- [P2] The hidden matched-project element still displayed because its class-level `display` rule overrode the browser's hidden rule.
- Fix: Added explicit hidden-state selectors for result, welcome, diagnostic, answer, source, and match regions.

### Pass 2

- [P2] The operator mascot was clipped against the left edge at `390 x 844`.
- Fix: Moved the mobile operator inside the safe content edge and reduced its width to `74px`.

### Final pass

- Post-fix evidence: `qa/diagnostic-spine-comparison-full.png`, `qa/diagnostic-spine-comparison-panel.png`, and `qa/diagnostic-spine-mobile-final.png`.
- All four scan stages render and advance correctly, the white sidebar/main-texture boundary remains intact, the final answer returns two grounded sources, every suggested question maps to an approved knowledge entry, and no P0, P1, or P2 findings remain.

## Follow-up polish

- [P3] A future mascot asset pass could add the reference's dedicated inspection tool. The existing thinking pose already reads as focused at the live panel size and avoids identity drift.
- [P3] The reference uses pictographic completion checks; the implementation uses the explicit word `DONE` to stay legible and avoid introducing an unmatched icon asset.

final result: passed

---

## Sidebar solid-surface refinement

## Evidence

- Source visual truth: `/Users/jasontello/.codex/generated_images/01a03139-b1a9-7b52-849e-bdc03b3b1b9c/exec-f9116248-0480-4aec-a2a0-a0c6bb1e3580.png`
- Browser-rendered desktop implementation: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/sidebar-solid-implementation-experiments.png`
- Browser-rendered mobile implementation: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/sidebar-solid-mobile.png`
- Full-view comparison: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/sidebar-solid-comparison-full.png`
- Focused sidebar comparison: `/Users/jasontello/VScode/Personal_Website-ai-void-integration/qa/sidebar-solid-comparison-focused.png`

The source raster is `1577 x 997` pixels. It was proportionally fitted and centered on a `1440 x 1024` canvas for the full-view comparison. The implementation raster is `1440 x 1024` pixels from a `1440 x 1024` CSS viewport at density 1. The focused comparison normalizes the source sidebar crop from `370 x 996` to the implementation panel's `386 x 1024` dimensions. The responsive check used a `390 x 844` viewport override; the in-app browser's content capture was `375 x 812` pixels after browser chrome and scrollbar allocation.

Compared state: the portfolio assistant is open while the Experiments tab is selected, with the Experiments context, three suggested questions, mascot, and persistent question form visible.

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: The implementation deliberately retains the live portfolio's Space Grotesk and DM Mono hierarchy. It matches the selected mock's editorial contrast without adopting ImageGen text-shape artifacts.
- Spacing and layout rhythm: Existing panel dimensions, padding, divider rhythm, content structure, and mascot attachment point remain unchanged. This isolates the selected change to the sidebar surfaces.
- Colors and visual tokens: The portfolio canvas still renders `walltexture.jpg` through `body::before` at `0.5` opacity. The sidebar, header, and composer all report `rgb(255, 255, 255)` with `background-image: none`, while the restrained `rgba(0, 0, 0, 0.24)` left rail preserves the boundary.
- Image quality and asset fidelity: All existing portfolio imagery and generated mascot assets remain untouched. No visible asset was recreated or substituted.
- Copy and content: All live assistant copy, project content, suggested questions, and controls remain unchanged.
- Interaction and accessibility: Desktop and responsive checks passed for opening, closing, and reopening the assistant. The full-width responsive panel retained the solid treatment and persistent composer. No browser console warnings or errors were observed.

## Comparison history

### Pass 1

- The full-view and focused comparisons confirmed the requested material boundary: textured portfolio canvas on the left, flat white assistant surface on the right.
- No P0, P1, or P2 issues were found, so no visual correction loop was required.
- The live implementation intentionally preserves the current site's exact panel width and content scale rather than copying small proportional drift from the generated concept image.

### User correction

- Replaced the rejected warm ivory surfaces with literal `#fff` across the entire sidebar.
- Advanced every portfolio-assistant stylesheet reference to `portfolio-agent-2`, preventing Chrome from reusing the earlier textured CSS.
- Browser evidence confirmed the main page texture remains active at `0.5` opacity while the sidebar has no background image. Desktop and mobile console checks remained clear.

## Follow-up polish

- No P3 follow-up is required for this surface change.

final result: passed
