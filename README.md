# The Paladin's Trial — Project Guide

A conceptual walkthrough for building **The Paladin's Seal**, a memory-based puzzle game. This guide covers logic, structure, and architecture — not raw code — so you can build the implementation yourself.

---

## Project Overview

The Paladin's Seal is a browser-based Simon-style memory game with a medieval/divine theme. Players must repeat an increasingly long sequence of virtue tiles to "complete the oath." The game is built across three files:

| File | Purpose |
|---|---|
| `index.html` | Game structure and layout |
| `style.css` | Visual design and animations |
| `script.js` | Game logic and interactivity |

---

## Stage 1 — The Sacred Architecture (HTML)

The HTML file acts as the physical board. Every visual element you see is defined here, and JavaScript will read and manipulate these elements at runtime.

### 1.1 — Document Head

Your `<head>` needs three things:

- **Font Awesome CDN** (v6 Free) — provides the icon classes (`fa-gavel`, `fa-shield`, etc.)
- **Stylesheet link** — connects your `style.css`
- **Viewport meta tag** — enables mobile responsiveness

### 1.2 — Game Header / Status Display

Create a dedicated element (e.g. a `<p>` or `<h2>`) with a unique ID like `status-text`. Your JavaScript will write messages here such as:

- `"Repeat the Oath"`
- `"You have strayed from the path."`
- `"High Lord Ascended"`

### 1.3 — The Shield Grid (Core Interface)

This is the main game board. You need a **wrapper container** that holds four **Rune Tiles**, one per virtue.

**Container:** A `<div>` that acts as the shield frame. CSS Grid will control its layout.

**Four Rune Tiles:** Each tile is a `<div>` representing one of the four Paladin virtues:

1. Justice
2. Valor
3. Compassion
4. Truth

**Icons:** Inside each tile, place an `<i>` tag with the matching Font Awesome classes (e.g. `fa-solid fa-gavel`).

**Data Attributes (important):** Add a `data-virtue` attribute to each tile with a value of `0`, `1`, `2`, or `3`. This lets JavaScript identify tiles without relying on class names.

```html
<!-- Example tile structure -->
<div class="rune-tile" data-virtue="0">
  <i class="fa-solid fa-gavel"></i>
</div>
```

### 1.4 — The Central Activation Gem

Inside the shield frame (separate from the four quadrant tiles), create a `<button>` or circular `<div>`.

- This is the **Start Button**
- Label it something like `"ACTIVATE"` or `"BEGIN"`
- CSS will position it at the center crosshair of the four tiles

### 1.5 — Scoreboard / Footer

At the bottom, create a score display.

- A `<span>` or `<div>` with an ID like `score`, defaulting to `0`
- JavaScript increments this each time the player completes a successful oath

### 1.6 — Script Tag

Place your `<script src="script.js">` at the **very bottom of `<body>`**, just before the closing tag. This ensures all HTML elements exist in the DOM before JavaScript tries to access them.

---

## Stage 2 — The Divine Aesthetic (CSS)

Transform the HTML skeleton into a legendary artifact. The key tools are **CSS Grid** for the shield shape and **keyframe animations** for game feedback.

### 2.1 — CSS Variables (Design Tokens)

Define your color palette in `:root` so you can change the entire look from one place:

```css
:root {
  --color-crimson: #8b2b3a;
  --color-cobalt: #2a3f78;
  --color-holy-gold: #ffd700;
}
```

### 2.2 — The Shield Grid Layout

**Container:** Set `display: grid` with two equal columns (e.g. `180px 180px`).

**Quadrant Shaping:** Use `border-radius` on each tile to create the shield quadrant illusion — each tile has only one rounded corner pointing outward:

| Tile | `border-radius` value |
|---|---|
| Top-Left | `100% 0 0 0` |
| Top-Right | `0 100% 0 0` |
| Bottom-Left | `0 0 0 100%` |
| Bottom-Right | `0 0 100% 0` |

**Center Gem:** Absolute-position the start button over the grid center:

```css
.start-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 2.3 — The Active State (Tile Flash)

Create an `.active` class that JavaScript will add/remove to indicate a lit tile:

- Increase `opacity` from a resting value (e.g. `0.6`) to `1`
- Add a heavy `box-shadow` to simulate light emission

### 2.4 — Keyframe Animations

Two animations provide player feedback:

**Holy Surge — Success Pulse**

When a round is completed, the shield pulses with a golden-green glow:

```css
@keyframes holy-surge {
  0%   { box-shadow: 0 0 10px gold; }
  50%  { box-shadow: 0 0 50px limegreen; }
  100% { box-shadow: 0 0 10px gold; }
}
```

Apply to the shield container when the player wins a round.

**Abyssal Flicker — Failure Shake**

If the player clicks the wrong tile, the shield shakes red:

```css
@keyframes abyssal-flicker {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-5px); border-color: red; }
  75%       { transform: translateX(5px); }
}
```

### 2.5 — Icon Styling

- Use `display: flex` on tiles to center the Font Awesome icons
- Add `filter: drop-shadow()` to icons so they pop against dark backgrounds

---

## Stage 3 — The Divine Logic (JavaScript)

The JavaScript file is the game's brain. It manages state, generates the sequence, plays it back visually, and judges the player's input.

### 3.1 — Initialization (Global Variables)

At the top of your script, grab DOM elements and set up state:

**DOM Selectors:**
- `querySelectorAll` for the four rune tiles
- `getElementById` for the start button, status text, and score display

**Game Arrays:**
- `sequence` — the computer-generated order
- `playerSequence` — what the player actually clicks

**State Variables:**
- `level` — current round number
- `isPlaying` — boolean flag to block input while the computer plays
- `WIN_CONDITION` — set to `6` (constant)

### 3.2 — The Channeling Phase (Computer's Turn)

Write a `playRound()` function that handles the computer showing the sequence:

1. Increment `level`, reset `playerSequence` to empty
2. Generate a random number `0–3` using `Math.floor(Math.random() * 4)` and push to `sequence`
3. Loop through `sequence` and flash each tile in order

> **Important:** Tiles must flash one at a time, not all at once. Use `async/await` with a `sleep` helper (a `Promise` that resolves after a `setTimeout`) to create delays between each flash.

### 3.3 — The Flash Function

Create a reusable `flashTile(tile)` function:

1. Add `.active` class to the tile
2. Wait ~400–600ms
3. Remove `.active` class

This provides the "holy light" visual feedback during both computer playback and player interaction.

### 3.4 — Player Input (Click Listener)

Attach a `click` event listener to every rune tile:

1. **Gate check:** If `isPlaying === true`, return immediately — the computer is still showing the sequence
2. **Record:** Push the tile's `data-virtue` value into `playerSequence`
3. **Validate:** Immediately call your judgment function

### 3.5 — Judgment Logic (Validation Function)

This function compares the player's last click against the expected value in `sequence`:

```
currentIndex = playerSequence.length - 1
expected     = sequence[currentIndex]
actual       = playerSequence[currentIndex]
```

**If wrong:**
- Trigger the `abyssal-flicker` animation
- Reset `level` and clear `sequence`
- Update `status-text` with a failure message

**If correct:**
- Check if `playerSequence.length === sequence.length`
  - **Not done yet:** Call `playRound()` to continue to the next level
  - **Hit `WIN_CONDITION`:** Call your victory function

### 3.6 — Victory Ceremony

When `level` reaches `WIN_CONDITION` (6):

1. Set `isPlaying = false` and disable `pointer-events` on the tiles
2. Update `status-text` with a victory message (e.g. `"High Lord Ascended"`)
3. Apply a permanent glow or color change to the center gem (white/gold) to signal the trial is complete
4. Increment the `score` display

---

## Build Checklist

Use this as a final reference before testing:

### HTML
- [ ] Font Awesome CDN linked in `<head>`
- [ ] `status-text` element present
- [ ] Four tiles with `data-virtue="0"` through `data-virtue="3"`
- [ ] Each tile has the correct Font Awesome icon
- [ ] Center activation gem / start button present
- [ ] `score` display element present
- [ ] `script.js` linked at bottom of `<body>`

### CSS
- [ ] CSS variables defined in `:root`
- [ ] Shield grid using `display: grid` with two columns
- [ ] Each tile has correct `border-radius` for quadrant shape
- [ ] Center gem positioned with `position: absolute` + `transform`
- [ ] `.active` class defined with high opacity and `box-shadow`
- [ ] `holy-surge` keyframe defined
- [ ] `abyssal-flicker` keyframe defined

### JavaScript
- [ ] All DOM elements selected at top of file
- [ ] `sequence` and `playerSequence` arrays initialized
- [ ] `isPlaying`, `level`, `WIN_CONDITION` variables set
- [ ] `playRound()` generates random number and pushes to `sequence`
- [ ] `flashTile()` adds/removes `.active` with a delay
- [ ] Sequence playback uses `async/await` with delays between flashes
- [ ] Click listeners on all tiles with gate check
- [ ] Judgment function correctly handles wrong click, partial match, and victory
- [ ] Victory function locks input, shows message, and updates score

---

*By following these three stages, you can build a functional, visually polished, and challenging browser-based Paladin memory game.*
