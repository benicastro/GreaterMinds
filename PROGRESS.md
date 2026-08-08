# GREATER MINDS — Progress Log

## Status: MVP playable end-to-end

A full game (host + multiple players, 20 prompts, scoring, reveal, leaderboard) can be
played in the browser today via `npm run dev`. See `Greater Minds Game Design.pdf` for the
original design doc and `C:\Users\CanPhi2\.claude\plans\bubbly-stargazing-plum.md` for the
build plan this was implemented against.

## Architecture

npm workspaces monorepo, TypeScript throughout:

- **`shared/`** (`@greater-minds/shared`) — single source of truth for all 20 prompt
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

- **All 20 prompts** (`shared/src/prompts/*.ts`) — the original 15 from the design doc plus 5
  backup prompts added later (Region of the Philippines, Harry Potter House, Infinity Stone,
  Playing Card Suit, Friends Character), each with canonical answers, alias/abbreviation maps,
  and explicit rejections where called for (Pluto; Pateros/Metro Manila/NCR; the Canadian
  territories; ambiguous pre-split names like "Maguindanao," "Region 4," and "Geller" are
  deliberately left unaliased rather than arbitrarily resolved). The number-1-10 prompt has the
  one bit of custom logic in the whole bank (word-form parsing, integer/range check) — every
  other prompt, including the ones that look tricky, is pure data on top of the generic
  validation engine.
- **Every prompt's `hostAnswer` is a deliberate, confirmed pick** (not a placeholder) — went
  through all 20 one at a time and set real values.
- **Philippine Province has the real official list** — all 82 provinces (post-2022 Maguindanao
  del Norte/del Sur split), replacing an earlier 10-province stub, plus aliases for commonly
  used renamed/legacy names (Compostela Valley, Western Samar, North Cotabato).
- **Validation engine** (`shared/src/validation/`) — normalize → compile → classify, with a
  54-case Vitest suite covering aliases, rejections, case/diacritic handling, and every
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
- **Host passcode gate** (`server/.env`'s `HOST_PASSCODE`) — "Host a Game" now requires a
  passcode only the host knows before a room can be created; wrong/missing passcode is rejected
  server-side. Unset entirely, hosting stays open (useful for local dev).
- **Host-controlled "starting" screen** — after clicking Start Game, both the host screen and
  every player's phone go full-page with a title-art slide, then (host clicks "Next") an
  infographic slide explaining the rules, in sync for everyone — the host controls pacing with
  a "Next" / "Start Round 1" button; round 1's timer only starts once the host actually begins
  it, so nobody loses answer time to the intro.
- **Timeout reveal messages are confirmed**, not placeholders — the design doc never specified
  copy for "no answer submitted," so a matching-tone set was written and the user signed off on
  keeping it as-is.
- **Company branding footer** — "Powered by the Bayanihan spirit" + the Bayanihan Partners logo
  (`client/public/bp-logo.png`) on the Landing page and the Final Results screen only, kept off
  the busier gameplay screens. The company name itself is intentionally not shown as text (only
  in the logo's alt text for screen readers) per a later request to keep it purely evocative.
- **Hard elimination** — a player's score dropping below 0 eliminates them for the rest of the
  game: they stop being prompted for answers (server rejects submissions from them defensively
  too), they're excluded from the "how many have answered" count and from scoring/collisions in
  every subsequent round, and they're marked "ELIMINATED" wherever they appear (roster, reveal
  grid, their own header, the final leaderboard). They still see the round they got eliminated
  on (with a distinct elimination banner on their reveal card) before flipping into a spectator
  view for everything after. Because elimination is defined as score < 0, a still-active
  player's score can never be lower than an eliminated one's — so eliminated players can never
  outrank survivors on the leaderboard by construction, no extra exclusion logic needed. If
  every remaining active player gets eliminated in the same round, the game ends immediately on
  the next advance instead of trying to start a round with nobody left to answer. Verified live
  against the real server: gradual elimination via repeated timeouts, post-elimination
  spectating (rejected submissions, excluded from the round's reveal/histogram), the final
  leaderboard ranking, and the simultaneous-elimination early-game-over edge case.
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

## Known gaps (flagged intentionally, not oversights)

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
the same LAN using your machine's IP instead of `localhost`). Copy `server/.env.example` to
`server/.env` and set `HOST_PASSCODE` to restrict who can create a room — without it, hosting
is open to anyone.

## Suggested next steps

1. Keep playtesting in the browser and report anything that looks or feels off — hard
   elimination in particular is worth a real multi-player playtest to see how it feels.
2. Give `--host-match` its own distinct color, separate from `--invalid`.
3. Optional next round of polish: transitions between round states, a QR code for joining,
   sound cues on reveal, an accessibility pass (focus outlines, contrast, aria-labels).
