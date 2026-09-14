# GREATER MINDS — Progress Log

## Status: MVP playable end-to-end

A full game (host + multiple players, 19 prompts, scoring, reveal, leaderboard) can be
played in the browser today via `npm run dev`. See `Greater Minds Game Design.pdf` for the
original design doc and `C:\Users\CanPhi2\.claude\plans\bubbly-stargazing-plum.md` for the
build plan this was implemented against.

## Architecture

npm workspaces monorepo, TypeScript throughout:

- **`shared/`** (`@greater-minds/shared`) — single source of truth for all 19 prompt
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

- **All 19 prompts** (`shared/src/prompts/*.ts`) — replaced the original 20-prompt bank with a
  new set: whole number 1–10, rainbow color, worst meeting day (a focal-point prompt — all seven
  days are valid, the game never judges whether it's genuinely someone's least-favorite day),
  delete a month, a letter appearing in "GREATER MINDS" (the 10 unique letters), a Solar System
  planet (Pluto rejected), a Gen I–III starter Pokémon, a zodiac sign, a playing-card rank
  (Ace/2–10/Jack/Queen/King with letter aliases A/J/Q/K, suits excluded), a tetromino (I/J/L/O/S/T/Z,
  generic letter naming rather than any third-party branded piece names), a Metro Manila city,
  a Canadian province (territories rejected), an ASEAN country (current 11-member roster,
  including Timor-Leste), a Central Luzon province, a Philippine province beginning with B, a
  Taylor Swift studio album (the four re-recorded "(Taylor's Version)" albums — Fearless, Speak
  Now, Red, 1989 — plus their "TV" shorthand are aliased down to the original studio title rather
  than accepted as separate answers, to keep the answer space clean), a chess piece ("Castle"
  aliased to Rook), a compass direction (cardinal points only — N/S/E/W — with single-letter
  aliases), and a season (Autumn is canonical, "Fall" aliased to it). The last three were added
  specifically as tight, small-answer-count prompts for the late game (see adaptive round
  selection below) — Chess Piece (6 answers), Compass Direction and Season (4 each) are now the
  smallest prompts in the bank. Each keeps the same validation-engine shape as before: canonical
  answers, alias maps where useful (month abbreviations, card-rank letters, ASEAN long-form
  names, Metro Manila city shortcuts, the Taylor's-Version re-recording aliases), and explicit
  rejections where called for. The number-1-10 prompt keeps the one bit of custom logic in the
  whole bank (word-form parsing, integer/range check) — every other prompt is pure data on top of
  the generic validation engine. The old region/pop-culture prompts (Philippine Province, Region,
  Harry Potter House, Infinity Stone, Card Suit, Friends Character, Straw Hat Pirates, PH Vice
  Presidents, Continents, Days of the Week) and the 82-province `ph-provinces.ts` data file were
  removed; Chess Piece was among them originally but was later re-added (see above).
- **Default round order narrows the answer space** — `PROMPT_REGISTRY` is sorted by number of
  valid answers, descending (Metro Manila City's 16 down to a two-way tie at 4: Compass Direction
  and Season), so spectator-friendly elimination play gets progressively harder as the game goes
  on. All prompts are also
  pre-selected by default when a room is created (`Room.ts`'s `selectedPromptIds` now defaults to
  the full registry instead of an empty array) — the host trims/reorders from a full list rather
  than building one up from scratch.
- **Host's answer is dynamically editable per room** — the prompt picker shows a dropdown next to
  each selected round ("Host's answer: ___") populated from that prompt's own canonical answers.
  Changing it calls a new `host:setHostAnswer` socket event that validates the pick through the
  same validation engine and stores it in a per-`Room` `hostAnswers` map, which scoring and the
  reveal payload read from instead of the prompt definition's static `hostAnswer`. This only
  overrides the current room — a new room resets to each prompt's default. Verified live: changed
  a round's host answer via the dropdown, played it out, and confirmed both the reveal's
  displayed "Host's Answer" and the scoring outcome used the overridden value.
- **`hostAnswer` for each new/changed prompt is a placeholder pick**, not yet confirmed with the
  user the way the previous bank's answers were — e.g. Queen for playing-card rank, T for
  tetromino, M for the GREATER MINDS letter, 1989 for Taylor Swift album. Worth a pass to sign off
  on real values (though now overridable per game anyway via the host-answer dropdown above).
- **Validation engine** (`shared/src/validation/`) — normalize → compile → classify, with a
  65-case Vitest suite covering aliases, rejections, case/diacritic handling, and every
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
- **`--host-match` given its own color** (`#fb923c`, orange) distinct from `--invalid`'s red,
  so the two −2-penalty outcomes read apart on the histogram bars/reveal grid without relying on
  icon or label. Two spots that had opportunistically reused `--host-match` as a generic "danger
  red" (the `.error` text class and the prompt-picker's remove button) were repointed to
  `--invalid` so they stayed red instead of turning orange.
- **Fade-in transitions between round states** — the get-ready slides, each round's question, each
  round's reveal, and the final results screen all fade/slide in instead of snapping (CSS
  `@keyframes`, `.state-transition` utility class in `index.css`, respects
  `prefers-reduced-motion`). Screens that repeat with new content each time (the two get-ready
  slides, each round, each reveal) are given a `key` that changes with the round/slide so React
  remounts them and the animation re-fires, instead of just updating in place silently. Verified
  by checking `element.getAnimations()` mid-flight through a full two-round game (host + player)
  that the animation is actually `running` at every one of those ten transition points, not just
  present in the stylesheet.
- **Adaptive round selection** (`Room.ts`'s `pickNextPromptId`) — rounds are no longer played in a
  fixed sequence. Each time a round ends, the next prompt is drawn from whichever of the host's
  still-unplayed selected prompts has a valid-answer count closest to however many players are
  still active (not eliminated), so the answer space narrows in step with the actual shrinking
  field rather than just a pre-set round order — a bad round of eliminations pulls in a tighter
  prompt immediately next, a clean round keeps things looser longer. Ties keep the host's original
  selection order. The picker's "Round Order" list is now framed as a pool + tie-break order
  rather than a fixed sequence (`PromptPicker.tsx` copy updated accordingly). Verified with
  scripted `socket.io-client` simulations with staggered elimination pacing across multiple player
  groups: a 12-player run showed picks tracking the active count down through 12→9→7; a fuller
  16-player run through all 19 prompts showed a clean staircase from 16 down to 4 active players,
  with Chess Piece (6 answers) landing at 6 active players and Compass Direction / Season (4 each)
  landing at 5 and 4 active players respectively — confirming the small late-game prompts added
  for this purpose actually get selected for the last rounds, not just in theory.
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
- **Question-set replacement verified**: full workspace build (`shared`/`server`/`client`) clean,
  the rewritten Vitest suite passing, and the host's prompt picker checked live in a browser
  (Playwright-driven) to confirm all rounds render in the right order with no console errors —
  re-verified after the default-order change and again after adding the Taylor Swift prompt
  (16 rounds total). The Taylor's-Version alias normalization was also checked end-to-end: a
  simulated player answered `"1989 (Taylor's Version)"`, the server normalized it to `"1989"`,
  and it scored correctly as a host-match against the host's answer.

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
- **"Host a Game" intermittently failed with "No host session found for this room" right after
  creation — reproducible on the live Render deployment, never locally.** Root cause: the server
  (`roomHandlers.ts`) sends a `RoomHostState` broadcast the moment `attachHostSocket()` runs,
  *before* it sends the `HostCreateRoom` ack response. The client's generic broadcast handler
  (`onHostState`) was also calling `setRoomCode(snapshot.roomCode)`, so on a fast network the
  broadcast could beat the ack, triggering navigation to `/host/:code` before the ack (which
  carries the session token) had written anything to `sessionStorage`. The freshly-mounted
  `HostProvider` at the new route checked storage immediately, found it empty, and permanently
  set the error (its reconnect attempt is guarded to never retry). Locally the two messages
  arrive close enough together to mask this; over Render's real network path the gap was wide
  enough to lose the race reliably.
  - Fixed by removing `setRoomCode` from the broadcast handler (`HostContext.tsx`) — `roomCode`
    is now set *only* by the two explicit ack-driven paths (create, reconnect), both of which
    already write `sessionStorage` first in the same synchronous callback, closing the race by
    construction.

## Known gaps (flagged intentionally, not oversights)

- **No sound cues** — reveal/round transitions are silent; a bigger lift than it sounds since
  browsers block autoplay-with-sound until the user has interacted with the page. Not started.
- **No QR code for joining.** Not started.
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
2. Optional next round of polish: sound cues on reveal, a QR code for joining, an accessibility
   pass (focus outlines, contrast, aria-labels).
