# Interactive run demo

The homepage’s `#demo` replaces the embedded video with an HTML simulation. Pi’s HTML terminal demo is the
interaction reference; RunWield’s TUI, Plan Review, and Code Review screenshots supply the product appearance.
This is an illustrative orders-export change with no live agent or backend calls. The player has no label row and a one-line top margin.

## Direction contract

**THESIS:** Show one change from prompt to confirmed publication. The product screens carry the explanation.

**OWN-WORLD:** Extend the site’s navy, mint, Outfit, and IBM Plex Mono system. Inside the player, use the TUI’s
charcoal surface and lavender agent labels, plus the review UI’s document, annotation pane, and green approval action.

**STORY:** Describe a change, clarify scope, review and annotate the Plan, approve execution, watch CI and AI review
repair findings, review the diff, and finish with a Work Record.

**FIRST VIEWPORT:** A persistent chapter menu sits beside a readable terminal. The screen caption, timeline, and
playback controls sit underneath. The opening is paused. Small screens use a horizontal chapter rail and stacked review panes.

**FORM:** Local extension with the user’s explicit HTML TUI reference; no concept roll or new visual identity.
One timeline owns all typed text and scene changes. Pausing freezes the scene; seeking reconstructs it.

**FINISH:** Verify desktop and mobile captures, keyboard controls, reduced motion, all chapters, and reverse seeking;
complete the finish review and document the implementation. Preserve the incumbent design system.

## Maintenance

- `src/data/demo.ts` owns chapter labels, timing, terminal output, and captions.
- `RunDemo.astro`, `DemoPlanReview.astro`, and `DemoCodeReview.astro` render the screens.
- `src/styles/global.css` remains the source for the site’s fonts, mint accent, navy surfaces, borders, and panel radius.
  `src/styles/demo.css` reuses those tokens for the player shell and scopes the product-screen colors to `.run-demo`.
- `demo-player.ts` owns one seekable clock. `data-cue` / `data-until` show or hide content; `data-type-at` /
  `data-type-for` reveal text from `data-text`. Times are seconds relative to each chapter.
- The demo never autoplays. Reduced motion reveals whole messages instead of typing individual characters.
- Leaving the viewport or hiding the tab pauses playback. Returning does not automatically resume.
- Space toggles playback while the screen is focused. Left/right seek five seconds; Home/End jump to the ends.
  Native controls retain their standard keyboard behavior. Chapter clicks preserve play/pause state.
- Approval and annotation controls inside the screen are scripted depictions, not live form controls. Playback
  controls and chapter buttons outside the scene are interactive.
- At widths up to 760px, review panes stack inside one scrolling workspace. Playback follows new messages and
  reverse seeking reconstructs the scroll position. The chapter rail scrolls to the active step without moving the page.

Sources checked during implementation: [Astro client scripts](https://docs.astro.build/en/guides/client-side-scripts/),
[Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), and [Pi](https://pi.dev/).
