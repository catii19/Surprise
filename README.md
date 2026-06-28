# Mama's Birthday Website 🎉

A one-page interactive birthday gift website. Open `index.html` in any
browser to view it — no build step, no server required.

## File structure

    index.html   — page structure / content sections only
    style.css    — all styling, layout, animations
    script.js    — all interactivity (nav, confetti, gift box, journey
                   timeline, letter typing, the fake-payment joke, etc.)
    assets/
      images/    — drop in real photos + your payment QR here
      music/     — drop in a background music track here
      icons/     — optional custom icons (not required — site uses emoji)
      fonts/     — optional self-hosted fonts (not required — uses Google Fonts)

Each assets/ subfolder has its own README.txt with exact filenames to use.

## Easiest things to customize first

1. **Journey Through Life photos** — already filled in with the 13 real
   photos provided (in `assets/images/journey-01-beginning.jpg` through
   `journey-13-today.jpg`). The Memories section still uses emoji
   placeholders — see `assets/images/README.txt` for how to swap those.

2. **Text** — open `script.js` and look at the top of the file for
   `MESSAGES_DATA`, `MEMORIES_DATA`, `REASONS_DATA`, `JOURNEY_DATA`,
   and `LETTER_TEXT`. Everything you'd want to personalize is right
   there in one place, in plain English. The `JOURNEY_DATA` captions
   and stories are still placeholder text waiting for the real
   milestones, dates, and names — the photos are real, the words
   aren't yet.

3. **Signature names** — currently "Aditi" (intro + final letter) and
   "PILLu" (closing credit). Search for those exact strings in
   `index.html` and `script.js` to change them.

4. **Payment QR** — drop your real UPI QR code as
   `assets/images/payment-qr.jpeg` — see `assets/images/README.txt`.

5. **Music** — drop a track as `assets/music/birthday-theme.mp3` — see
   `assets/music/README.txt`.

## Notes

- Fully responsive: nav collapses to icons-only, the Journey timeline
  switches from a vertical alternating layout to a horizontal swipe on
  screens under ~860px.
- Respects `prefers-reduced-motion` — anyone with that OS setting on
  gets a calmer version with no auto-playing motion.
- No required external JS framework — only canvas-confetti loads from
  a CDN for the confetti bursts; if it's ever offline, every other
  animation (CSS-based) keeps working fine.
