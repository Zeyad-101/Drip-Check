# Client-Side Vision Engine Specification

**Date:** 2026-09-17  
**Status:** Approved  
**Project:** DripCheck  
**Goal:** Replace external Gemini API with an accurate, 100% client-side computer vision & fashion critique engine so anyone can use DripCheck anywhere for free with zero API keys or rate limits.

---

## 1. Problem & Context

Currently, DripCheck relies on a Node.js Express backend (`server.js`) that calls Google's Gemini Vision API (`gemini-2.5-flash`). This creates several blockers for public deployment:
1. **API Key Requirement**: Requires a `GEMINI_API_KEY` in `.env`.
2. **Rate Limits & Quota**: Gemini free tier caps daily and per-minute requests (429 errors).
3. **Hosting Complexity**: Cannot be hosted as a simple static site (GitHub Pages, Netlify, Vercel) without maintaining a Node server.

## 2. Proposed Architecture

Replace the server API call with an in-browser vision engine (`public/vision-engine.js`) that analyzes uploaded outfits via HTML5 `<canvas>` and generates structured critique matching the existing JSON schema:

```json
{
  "score": 8.5,
  "aura": "MINIMALIST MONK",
  "vibe": "Clean monochrome with balanced proportions.",
  "wins": ["Crisp neutral palette", "Strong vertical silhouette", "Well-measured contrast"],
  "roast": "You dressed entirely in darkness hoping no one would perceive you.",
  "upgrade": "Add a silver chain or white undershirt hem to break the monochrome block.",
  "verdict": "MINIMALIST MASTERCLASS."
}
```

---

## 3. Accuracy & Vision Pipeline

To ensure the critique is accurate to the user's actual photo:

### 3.1 Region-Aware Color Segmentation
- Downsample image to 128x128 pixels on an offscreen canvas.
- Crop central 70% width to minimize room/background interference.
- Segment vertically into 3 zones:
  - **Upper Zone (top 15%-45%)**: Top wear (jacket, shirt, sweater).
  - **Mid Zone (45%-75%)**: Bottom wear (pants, shorts, skirts).
  - **Lower Zone (75%-100%)**: Footwear & hemline.

### 3.2 Color Quantization & Naming
- Convert pixels from RGB to HSL and CIE-Lab color space.
- Classify dominant colors into recognized fashion pigments:
  - *Neutrals*: Black, Charcoal, Slate, Off-White, Cream, Beige, Tan, Brown.
  - *Earth Tones*: Olive, Forest Green, Camel, Rust, Mustard, Terracotta.
  - *Cool Accents*: Navy, Cobalt, Ice Blue, Sage, Lavender, Emerald.
  - *Warm/Vibrant*: Crimson, Burgundy, Coral, Sunshine Yellow, Electric Orange.
  - *Neons*: Neon Green, Hot Pink, Cyber Cyan.

### 3.3 Harmony & Metric Calculations
1. **Palette Harmony Type**:
   - *Monochromatic*: All dominant colors share similar hue (<30° apart) with varying lightness.
   - *Complementary*: Dominant upper and lower colors lie 150°-210° apart on the color wheel.
   - *Analogous*: Adjacent hues (30°-60° apart), harmonious natural blend.
   - *High-Contrast Neutral*: Sharp contrast (e.g., black + white or dark navy + cream).
   - *Discordant / Clash*: Multiple high-saturation (>60%) conflicting hues with poor contrast.
2. **Luminance Contrast Ratio**: Ratio between brightest and darkest garment.
3. **Pattern / Busy-ness Factor**: Laplacian / edge gradient analysis to detect solid vs patterned/textured garments.

### 3.4 Dynamic Critique Matrix
- Instead of canned static responses, the critique dynamically embeds the **actual detected colors and garments**:
  - Example: "The **olive** jacket creates a clean earthy anchor over the **cream** trousers."
  - Specific roasts targeted to the exact combination (e.g. all-black vs highlighter neon vs muted beige).

---

## 4. File Changes

- **Create** `public/vision-engine.js`: Pure client-side computer vision and fashion critic logic.
- **Modify** `public/index.html`: Replace backend `fetch('/api/judge')` with in-browser `judgeOutfit(imageData)`.
- **Modify** `server.js`: Keep lightweight static file server or optional dev server; no Gemini API calls required.
- **Modify** `README.md`: Update instructions indicating zero API key required, deployable statically.

---

## 5. Non-Functional Requirements & Performance

- **Execution time**: < 150ms on mobile and desktop.
- **Bundle size**: 0 KB external libraries; pure vanilla JavaScript using standard browser Canvas 2D API.
- **Privacy & Offline**: Images never leave the user's browser. Works 100% offline with zero network latency.
