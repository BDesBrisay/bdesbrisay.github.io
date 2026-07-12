# Manual Mobile QA Script

## Device Matrix

- iOS Safari (latest)
- Android Chrome (latest)

## Local Network Dev

1. Run `npm run dev` in `learnscroll/app`.
2. Confirm host mode is active (`vite --host`).
3. On phone, open `http://<computer-lan-ip>:5173`.

## Session Flow

1. Start feed and complete 10 cards.
2. Validate freeform pre-reveal shows only `Reveal`.
3. Reveal freeform card and confirm grading controls appear inside reveal panel.
4. Grade freeform card and confirm immediate auto-advance when enabled.
5. Answer concept-check and confirm option rationale block appears.
6. Confirm concept-check auto-advances after configured delay.
7. Confirm recap metrics and weak topics show.

## Auto-Advance Settings

1. Open Settings.
2. Disable `Auto-advance after grading`.
3. Return to Feed and confirm grading no longer advances automatically.
4. Use manual `Next` (or swipe up) and confirm progression still works.
5. Re-enable auto-advance and change delay slider.
6. Confirm new delay applies to concept-check timing immediately.

## Offline Validation

1. Load app online once.
2. Disable phone internet.
3. Re-open app from browser/PWA icon.
4. Complete session offline and verify option rationale still renders.
5. Force close app and reopen.
6. Verify progress and streak data persist.

## PWA Install Validation

1. Install from browser menu.
2. Launch from home screen in standalone mode.
3. Validate safe area spacing and bottom nav visibility.

## Pack Update Validation

1. Reconnect internet.
2. Open Packs page and run Check for updates.
3. Install update and verify status messages.
4. Confirm app still works fully offline afterward.
