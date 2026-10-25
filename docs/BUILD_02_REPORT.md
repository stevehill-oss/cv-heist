# Build 2 report, 25/10/2026

## Completed
- Pure game logic in `src/lib/game.ts`: reducer state machine (intro, logs, cipher, vault,
  open). The code 471 is derived from the puzzle data, not typed in.
- Stage 1: four log cards as a real radio group (tap, or Tab plus arrow keys), flag button,
  specific feedback for each wrong log.
- Stage 2: Caesar dial with back and forward buttons (no dragging), live per-letter mapping
  (T→S), real shift with wraparound, lock-in with feedback.
- Stage 3: fragment slots, the question, a collapsible copy of the Stage 1 logs, 3-digit
  keypad (touch, mouse, physical keys: digits, Backspace, Enter). The keypad blocks scroll
  gestures. Wrong codes shake and give a targeted clue.
- Two progressive hints per stage. Progress bar and evidence tray. Quit and "Skip to
  profile" always visible.
- Vault reveal: handle turns, bolts retract, door swings on its hinge, dossier glows inside.
  Preview-mode copy as specified, plus score line, LinkedIn, profile, CV, replay and share.
- Progress saved in session storage, so refresh or Back resumes; Quit clears it.
- Screen readers: focus moves to each stage heading, feedback in a polite live region,
  cipher reading announced, keypad entry described.
- Works offline once loaded (no network calls in the game).

## Tests
All game unit tests and e2e tests listed in TEST_REPORT.md pass, including keyboard-only play.

## Next tasks
1. Candidate details, then free deployment and final QR codes (BUILD_PLAN.md).
2. Build 3 polish if time allows: richer cipher dial, landing hero balance on desktop.
3. Build 4: printable double-sided card layout.
