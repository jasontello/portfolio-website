# Design QA: Editorial Hybrid

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
