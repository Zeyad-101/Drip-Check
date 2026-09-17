# DripCheck

Upload an outfit photo, get an AI-style score, roast, and styling upgrade — **100% client-side, zero API keys required, and free to host for everyone.**

## Why it has zero API dependency
DripCheck runs an **in-browser computer vision & color harmony engine** directly on an HTML5 `<canvas>`.
- **Zero API keys**: No Gemini or OpenAI API keys needed.
- **Zero rate limits**: No 429 quota errors or daily request caps.
- **100% Private**: Photos are analyzed locally in the user's browser and never uploaded to any server.
- **Host anywhere for free**: Can be hosted as a pure static site on GitHub Pages, Cloudflare Pages, Vercel, or Netlify.

## How the Engine Works
1. **Vertical Body Segmentation**: The engine scans the outfit across 3 zones: upper body (tops/jackets), mid section (trousers/skirts), and lower zone (footwear).
2. **Fashion Palette Quantization**: Samples pixel data using weighted color distance into recognized fashion pigments (e.g., Charcoal, Slate, Off-White, Olive Green, Dark Navy, Burgundy, Camel).
3. **Harmony & Contrast Evaluation**: Calculates color wheel relationships (Monochrome, Complementary, Analogous, High-Contrast Neutrals, or Clashes) and garment pattern density.
4. **Dynamic Critique Matrix**: Generates a tailored score, aura label, 3 wins, a playful roast, and a concrete styling upgrade embedding the exact detected colors.

## Running Locally

### Option 1: Double-click or static server
You can simply open `public/index.html` in any modern web browser or serve it with any static server:
```bash
npx serve public
```

### Option 2: Using Node.js
```bash
npm install
npm start
```
Open `http://localhost:3000`

## Automated Tests
Run unit tests for the vision engine:
```bash
npm test
```

## Deploying for Everyone

### GitHub Pages (100% Free)
1. Push this repository to GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment > Branch**, choose your branch and select the `/public` folder (or copy `public/*` to the repository root).
4. Click **Save**. Your site is now live with zero server maintenance.

### Vercel / Netlify / Cloudflare Pages
Point the publish directory to `public/`. No build command or environment variables required.
