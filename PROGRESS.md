# GREATER MINDS — Progress Log

## Status: MVP playable end-to-end

A full game (host + multiple players, all 15 prompts, scoring, reveal, leaderboard) can be
played in the browser today via `npm run dev`. See `Greater Minds Game Design.pdf` for the
original design doc and `C:\Users\CanPhi2\.claude\plans\bubbly-stargazing-plum.md` for the
build plan this was implemented against.

## Architecture

npm workspaces monorepo, TypeScript throughout:

- **`shared/`** (`@greater-minds/shared`) — single source of truth for the 15 prompt
  definitions, the answer-validation engine, Socket.IO event name constants, shared types,
  reveal messages, and branding strings. Imported by both `server` and `client` so prompt
  data and event contracts can't drift between them.
- **`server/`** (`@greater-minds/server`) — Node + Socket.IO. Authoritative room/round state
  machine and scoring. No database — everything lives in server memory for the life of a room.
- **`client/`** — Vite + React + TypeScript. One app, two route trees: `/host/*` (the shared
  screen a host casts/displays) and `/play/:roomCode` (each player's own phone/browser).

Game flow: `lobby → configuring → in_round → reveal → (loop) → game_over`, driven entirely by
the server; clients just render whatever snapshot they're sent.

## What's implemented

- **All 15 prompts** from the design doc (`shared/src/prompts/*.ts`), each with canonical
  answers, alias/abbreviation maps, and explicit rejections where the doc calls for them
  (Pluto; Pateros/Metro Manila/NCR; the Canadian territories). The number-1-10 prompt has the
  one bit of custom logic in the whole bank (word-form parsing, integer/range check) — every
  other prompt, including the ones that look tricky, is pure data on top of the generic
  validation engine.
- **Validation engine** (`shared/src/validation/`) — normalize → compile → classify, with a
  32-case Vitest suite covering aliases, rejections, case/diacritic handling, and every
  prompt's `hostAnswer` round-tripping correctly.
- **Scoring** (`server/src/game/scoring.ts`) — implements the doc's exact priority rule:
  timeout/invalid = −2, host-match = −2 (checked before player-match), player-match = −1,
  unique = 0, penalties never stack.
- **Room state machine** (`server/src/rooms/Room.ts`, `RoomManager.ts`) — room codes, prompt
  selection + timer config, round timer with a race guard (last-submit vs. timer-expiry can't
  double-close a round), reveal grid, multi-round loop to a final leaderboard.
- **Leaderboard ranking** (`shared/src/leaderboard.ts`) — standard competition ranking ("1224"):
  tied scores share a rank and the next rank skips ahead accordingly, covered by its own
  Vitest suite (distinct scores, a tie for first, an all-tied field).
- **Reconnect handling** — session tokens stored in the room + mirrored to the browser tab's
  `sessionStorage`; refreshing a host or player tab mid-game re-attaches to the existing
  player/room instead of losing them. Disconnect grace periods (60s players / 5min host) and
  a periodic stale-room sweep bound memory growth.
- **Client UI** — landing page; host flow (create room → pick prompts/order/timer → run
  rounds → reveal grid → final leaderboard); player flow (join with nickname → answer →
  personal reveal card → final leaderboard). Branded with the game's tagline/core philosophy,
  dark theme, outcome-colored feedback. Host screen is sized up (bigger type, room code, timer)
  for across-the-room TV reading; the player view stays compact for one-handed phone use.
- **Answer histogram** (`client/src/components/AnswerHistogram.tsx`) — on both the host screen
  and every player's own reveal, a poll-style grouped view of who picked what: bars sized by
  share of the room, colored by the same outcome status used everywhere else (green/amber/red),
  the host's answer called out both as a caption and a badge on any bar that matches it, and
  invalid/no-answer submissions rolled into their own buckets rather than one bar per typo.
  Built following the dataviz skill's procedure (status-color reuse instead of a new palette,
  direct labels instead of hover-only since the host screen has no mouse for its audience).
- **Game-over celebration** — confetti, a winner announcement banner (personalized to "You win!"
  on the winning player's own screen, and correctly crediting *every* tied player when there's a
  tie), and a gold-highlighted leaderboard row for whoever's in first.
- **Round polish** — a color-shifting countdown bar (green → amber → red, with a pulse near zero)
  instead of a plain number; reveal rows/cards get an icon + tinted background per outcome; the
  host's prompt picker is one combined reorderable list instead of two duplicate lists.
- **Reveal card redesign** (`client/src/components/RevealCard.tsx`) — cut the redundancy that had
  built up across several features (host's answer and running score were each already shown
  elsewhere on the same screen); "counted as" now only appears when it actually differs from what
  you typed; the score delta is now a bold color-coded pill next to the icon and message instead
  of a plain text line.
- **Prompt reference on the reveal screen** — the round's category and full prompt text are now
  shown again at the top of the results view (host and player both), so nobody has to remember
  what was actually asked while looking at the histogram/reveal.
- **Verification**: automated end-to-end smoke tests (simulated multi-player games driven via
  `socket.io-client`, not just unit tests) confirmed the full room→round→scoring→reveal→
  game-over loop, ties, the reconnect-after-refresh handshake, and the player-side reveal payload
  all work correctly before each was opened in a real browser.

## Bugs found and fixed during manual browser testing

- **"Host a Game" hung on "Connecting…" forever.** Root cause: `HostNew`'s `useEffect` called
  `createRoom()` with no de-dupe guard. React's `StrictMode` (on by default in the Vite
  template) double-invokes effects in dev, so two rooms were created; the browser navigated to
  one room code while storage ended up holding the other, so the reconnect handshake
  on `/host/:roomCode` silently matched nothing and the UI never got a state update.
  - Fixed with a `useRef` guard so the room-creation request only fires once
    (`client/src/routes/host/HostNew.tsx`).
  - Also hardened the underlying issue class: reconnect failures (mismatched session, corrupt
    storage, server says no) now set a visible error and offer a "Start a new game"
    link instead of hanging silently forever (`HostContext.tsx`, `PlayerContext.tsx`,
    `HostRoom.tsx`).
- **A second player joining the same room got logged in as the first player.** Root cause:
  session persistence used `localStorage`, which is shared across *every tab* of the same
  browser (not per-tab). Testing multiple players by opening several tabs to the same room
  meant the second tab's join effect found the first player's session already stored under
  that room code and silently reconnected as them instead of showing the nickname form.
  - Fixed by switching to `sessionStorage` (`HostContext.tsx`, `PlayerContext.tsx`), which is
    isolated per browser tab/window but still survives a refresh of that same tab — the actual
    behavior wanted, versus identity being shared across unrelated tabs.

## Open design questions (paused, awaiting a decision)

- **Should players with a negative score be eliminated?** Raised as an idea to add stakes.
  Concern flagged before building anything: going negative can happen from bad luck (matching
  the host's predetermined answer isn't predictable) as much as bad play, and true elimination
  mid-game means that player sits out the rest of a short session — usually a net loss for a
  party game. Three options on the table, not yet chosen:
  1. **Soft elimination (recommended)** — flag as "eliminated" (badge, excluded from winning)
     but they keep answering and appearing in the histogram every round.
  2. **Hard elimination** — fully removed from future rounds' scoring once negative; higher
     stakes, but they stop participating.
  3. **No elimination, just clamp score at 0** — simplest change, nobody is singled out.
  Current behavior (do nothing, scores can go negative freely) also remains an option.

## Known gaps (flagged intentionally, not oversights)

- **`shared/src/data/ph-provinces.ts` is a stub** (10 sample provinces, not the real ~82).
  Needs sourcing/verification before the Philippine Province prompt is play-ready — not
  invented, per the build plan.
- **Timeout reveal messages are placeholders.** The design doc only specifies flavor text for
  unique/player-match/host-match/invalid outcomes, not for "no answer submitted." A placeholder
  set is in `shared/src/messages/revealMessages.ts`, marked with a TODO.
- **`hostAnswer` values are arbitrary placeholders** (e.g. "Red" for rainbow colors, "7" for
  the number prompt) since the doc says each prompt's host answer should be predetermined but
  doesn't say what it is. Worth a deliberate pass if specific answers are wanted.
- **`--host-match` and `--invalid` share the exact same red** in the color palette (predates
  this round of polish). Differentiated today by icon/badge/label, not color alone, but a
  distinct hue for host-match would read faster, especially on the histogram bars.
- **No transitions between round states** — prompts, reveals, and rounds still snap in rather
  than fading/sliding, and there's no QR code for joining or sound cues on reveal (all discussed
  as nice-to-haves, not started).
- **No automated browser/UI tests** — coverage today is the validation-engine, leaderboard, and
  scoring-adjacent unit tests plus scripted socket-level end-to-end tests; manual browser
  playtesting is how UI regressions get caught for now.

## How to run it

```
npm run dev
```

Starts the server (`:4000`) and Vite client (prints its own port, typically `:5173`)
concurrently. Open the client URL, host a game in one tab, join from others (or real phones on
the same LAN using your machine's IP instead of `localhost`).

## Suggested next steps

1. Decide on the negative-score/elimination question above (soft elimination, hard elimination,
   clamp at 0, or leave as-is) — implementation is on hold until then.
2. Keep playtesting in the browser and report anything that looks or feels off.
3. Decide on real `hostAnswer` values per prompt if the placeholders aren't acceptable.
4. Source the authoritative Philippine provinces list + spelling-variant aliases.
5. Sign off on (or replace) the placeholder timeout reveal messages.
6. Give `--host-match` its own distinct color, separate from `--invalid`.
7. Optional next round of polish: transitions between round states, a QR code for joining,
   sound cues on reveal, an accessibility pass (focus outlines, contrast, aria-labels).
