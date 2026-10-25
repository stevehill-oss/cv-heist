# Visual QA, 25/10/2026

Screenshots: `docs/screenshots/` (59 files). Pages at 320, 360, 375, 390, 430, 768, 1024,
1440 and 1920px, game stages at 390 and 1440px, vault opening mid and end frames at 390px.

## Problems found by reviewing the screenshots, and fixed
1. Phone heist intro: vault filled the first screen, Start button sat at the fold.
   Vault shrunk on phones and further on short screens.
2. Landing "Hacker" card: vault graphic overlapped the "02 / Game" label. Moved and layered.
3. Between stages the page scrolled the heading to the top, hiding the progress bar and
   evidence tray under the header. Now returns to the top of the page.
4. Desktop keypad panel stretched to the height of the left column, leaving a dead area.
5. Reveal stat line read "471 ·0 hints" (lost space). Fixed.
6. Heist intro at 768 and 1024px: vault glow caused 18 to 20px sideways scroll, and the two
   columns were cramped. Tablets now use the stacked layout; glow is clipped.

## Known visual weaknesses still open
- With no candidate details, the profile is mostly "awaiting confirmation" blocks. It is
  honest and tidy but will look far better with real content.
- Desktop landing has empty space to the right of the headline.
- Cipher letters change with a short flip; a richer dial could come in Build 3.
