# 👕 DripCheck

![Static Badge](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Static Badge](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)
![Static Badge](https://img.shields.io/badge/API%20Keys-0-success)
![Static Badge](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)

**Upload an outfit photo. Get a score, a roast, and a styling upgrade — all in your browser, no AI API involved.**

🔗 **Live:** [drip-check-iota.vercel.app](https://drip-check-iota.vercel.app/)

---

## 🧵 What it does

Most "AI outfit rater" tools just pipe your photo to GPT-4 Vision or Gemini and print whatever comes back. DripCheck doesn't. It runs its own computer vision and color theory engine straight on an HTML5 `<canvas>` — so there's no API key to set up, no rate limit to hit, and no photo ever leaves the browser.

- 🔒 **Private by default** — images are processed locally, never uploaded
- 🚫 **Zero API keys** — no Gemini, no OpenAI, nothing to configure
- ♾️ **No rate limits** — no 429s, no daily quota
- 🆓 **Free to host anywhere** — GitHub Pages, Vercel, Netlify, Cloudflare Pages, all work

## ⚙️ How the engine works

1. **📐 Body segmentation** — splits the outfit into three zones: top, mid, and footwear
2. **🎨 Palette quantization** — matches pixels against named fashion colors (Charcoal, Slate, Off-White, Olive, Navy, Burgundy, Camel, etc.) using weighted color distance
3. **🌈 Harmony check** — reads the color wheel relationships (Monochrome, Complementary, Analogous, High-Contrast Neutrals, Clash) plus pattern density
4. **🧠 Critique matrix** — turns all of that into a score, an aura label, three wins, one roast, and a concrete upgrade that names the actual colors it detected

## 🚀 Run it locally

**Just open it:**
```bash
npx serve public
```

**Or with Node:**
```bash
npm install
npm start
```
Then hit `http://localhost:3000`.

## 🧪 Tests

```bash
npm test
```
Runs the unit tests for the vision engine.

---

<p align="center">Built to prove a full styling engine doesn't need an API key — just math and a canvas.</p>
