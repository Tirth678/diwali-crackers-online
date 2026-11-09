# 🪔 Diwali Crackers Online — Hand Gesture Celebration

**Select crackers with your hands, burst them in AR — powered by camera + AI hand tracking.**

> Single-tap (pinch) to **select/place** crackers • Double-tap (double pinch) to **fire & burst** with festive particles, sound, and shockwaves.

Built with **Next.js + MediaPipe Hands**, works with both **left & right hands tracked simultaneously** and falls back gracefully to mouse/touch.

![Diwali](https://img.shields.io/badge/Festival-Diwali-ff9a00?style=for-the-badge) ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge) ![Hands](https://img.shields.io/badge/Hands-AI%20Tracking-00e676?style=for-the-badge)

---

## ✨ Features

### 🎆 8 Diwali Crackers
Each with unique physics, colors & sound:
- **Anar** 🌋 — golden fountain cone
- **Rocket** 🚀 — launch trail → sky burst
- **Chakri** 🌀 — spinning ground wheel
- **Sutli Bomb** 💣 — thunder boom + flash
- **Fuljhadi** ✨ — sparkler that follows your hand while pinching
- **Laxmi Bomb** 🧨 — mega blast (double shockwave)
- **Pop Pop** 🎉 — cute crackle snaps
- **Sky Shot** 🎆 — 4-stage multi-color burst

### ✋ Hand Gesture Controls (Both Hands)
- **Both hands tracked** via MediaPipe Tasks Vision (GPU)
- **Index fingertip = cursor** (color-coded: left 🟢, right 🔵)
- **Skeleton overlay** shows all 21 landmarks per hand
- **Single Pinch** (thumb + index together <0.05) → **Select / Place**
  - Over shelf card → selects cracker type
  - Over camera stage → places cracker at pinch point
- **Double Pinch** (two quick pinches <550ms) → **Fire / Burst**
  - Bursts at cursor, removes nearest placed cracker in 80px radius
  - Fuljhadi emits continuous sparks while pinching
- **Hover feedback** — shelf cards glow gold when hand hovers
- **Mouse/Touch fallback** — identical single-click/double-click semantics

### 📸 Camera Stage (AR)
- Mirrored video (`translate(-1,1)`) so movement feels natural
- **1280×720 canvas** with 2D particle engine (fountain, rocket trails, shockwaves, sparkles)
- FPS counter + hand count, active cracker chip
- **Night Mode** — dims stage, diyas glow brighter
- Particles: gravity, drag, sparkle stars, flash, shockwave rings
- Screen shake on burst

### 🔊 Synthesized Sound (Web Audio)
No external assets — all sounds generated with oscillators:
`fountain`, `bomb`, `megabomb`, `rocket`, `sparkler`, `pop`, `skyshot`, `chakri`, `firework`

### 🎛️ UI / Stats
- **Left panel**: Cracker shelf (8 cards) + How to Play + left/right badges
- **Center**: Camera stage + controls (Place Random, Burst All, Night Mode)
- **Right**: Arsenal stats (Placed / Bursts / Streak) + per-type counts + Tips
- **Header**: Camera toggle, Sound toggle, Clear Stage, Auto Celebrate
- **Auto Celebrate**: fires random crackers every 650ms for 12s
- **Toasts**: selection & burst feedback
- **Keyboard**: `1-8` select cracker, `Space` burst center, `C` clear
- **Diyas & rangoli** decor, Diwali lights string

---

## 🚀 Quick Start

### With Next.js (recommended)
```bash
npm install
npm run dev        # http://localhost:3000 (host 0.0.0.0)
npm run build      # production build
npm start          # production server
```

### With Vite fallback (still available)
```bash
npm run dev:vite   # vite on 0.0.0.0:3000
```

### Requirements
- Modern browser with `getUserMedia`
- Good lighting for hand detection
- HTTPS for camera on production (localhost works on http)
- Allow camera permission when prompted

---

## 🎮 How to Play

1. **Allow camera** → `📷 Enable Camera` or header `Camera ON`
2. **Show both hands** — keep palms open, fingers visible, about 40-80cm away
3. **Move index finger** — colored cursor follows you
4. **Single pinch** over a cracker card → selects it (gold border + SELECTED badge)
5. **Single pinch** over the dark stage → places that cracker (with wick sparkle)
6. **Double pinch** over stage or on a placed cracker → 💥 bursts with particles & sound!
7. **Try two hands** — burst two crackers at once!
8. **No camera?** Use **mouse**: click to select/place, double-click to burst (touch works too)

**Pro tips:**
- Rocket: place near bottom, double-tap → it launches up then bursts
- Fuljhadi: keep pinching — it streams sparks from your fingertip
- Chakri: best on lower half of stage (ground spinner)
- Sky Shot: multi-burst sequence — watch all 4 colors

---

## 🧠 Tech Stack

- **Next.js 15** (App Router, client components)
- **MediaPipe Tasks Vision** `0.10.14` via CDN (`vision_bundle.mjs` + wasm)
  - `HandLandmarker` — 2 hands, `float16` model, GPU delegate
  - Dynamic import via `Function('u','return import(u)')` to avoid webpack bundling CDN URL
- **Canvas 2D** particle system (no external lib)
- **Web Audio API** for procedural sound
- **Vite 5** kept for `dev:vite` alternative
- No backend — fully client-side, video never leaves device

**Mirroring logic:**
Video drawn mirrored (`ctx.translate(width,0); scale(-1,1)`) and hand landmarks mapped via `(1 - x) * width` so the preview feels like a mirror.

**Pinch detection:**
```ts
distance(thumbTip(4), indexTip(8)) < 0.05  // normalized
tapDuration < 400ms → single/double logic (550ms window)
```

---

## 📁 Project Structure

```
app/
  layout.tsx            # Root layout + fonts + metadata
  page.tsx              # Main UI (client) — shelf + stage + arsenal
  crackers-client.ts    # Hand tracking + particles + audio (export init())
  globals.css           # Diwali theme (purples, golds, lights)
src/
  main.js               # Vanilla Vite version (kept for vite fallback)
index.html              # Vite entry (still usable)
vite.config.js          # Vite config
next.config.mjs         # Next config (COOP/COEP headers for wasm)
```

---

## 🔧 Troubleshooting

- **Camera black / permission denied** → Check browser site permissions, try mouse fallback, ensure https on prod.
- **Hand tracking not loading** → CDN may be slow; check console, model loads from `storage.googleapis.com/media.../hand_landmarker.task` + wasm from `cdn.jsdelivr.net`. Mouse still works.
- **Pinch not detected** → Hold hand steadier, improve lighting, keep thumb-index close (<1.5cm apparent).
- **Build error `getContext` on HTMLElement** → File is `@ts-nocheck` — intentional canvas casting for Next build.
- **Port 3000 in use** → `pkill -f next` or `pkill -f vite`, then `npm run dev`.

---

## 🪔 Diwali Wishes

> *May your Diwali be as bright as an Anar, as high as a Rocket, and as joyful as a burst of Fuljhadi!*

**Happy Diwali! 🪔✨🎆**

---

## 📜 License

MIT — feel free to remix for your celebrations.
