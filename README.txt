# Images

## Payment QR code (for the "One Last Thing" post-credits joke section)
Drop your real UPI/payment QR code image here as:

    payment-qr.png

The site already looks for this exact filename. Until you add it, a
friendly placeholder ("Drop your QR here") shows in its place — nothing
breaks.

## Memory & Journey photos
The Memories gallery and Journey Through Life timeline currently use big
emoji as photo placeholders (🚲 🎓 💍 etc.) so you can launch the site
right away and swap in real photos whenever you're ready.

To swap a placeholder for a real photo:
1. Add your photo file here, e.g. `memory-bike.jpg`
2. Open `script.js`, find the `MEMORIES_DATA` or `JOURNEY_DATA` array
3. Change that item's `icon: "🚲"` line to an image tag instead, e.g.:
   `icon: '<img src="assets/images/memory-bike.jpg" alt="">'`

The layout (circular frames, card sizing, hover effects) already
supports real photos — no CSS changes needed.
