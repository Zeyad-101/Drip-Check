# Client-Side Vision Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the external Gemini API in DripCheck with an accurate, client-side Canvas computer vision and fashion critique engine that runs 100% in the browser.

**Architecture:** HTML5 Canvas segments outfit images into 3 zones (top, mid, bottom), extracts dominant colors, computes harmony/contrast metrics, and feeds a rule-based fashion critic matrix that embeds actual detected colors into the verdict.

**Tech Stack:** Vanilla JavaScript (ES Modules / Browser scripts), Canvas 2D API, Node.js `--test` runner for unit testing.

**Spec:** `docs/specs/2026-09-17-client-side-vision-engine-design.md`

## Global Constraints
- Pure vanilla JavaScript with zero runtime npm dependencies on the client.
- JSON response must match existing schema: `{ score, aura, vibe, wins, roast, upgrade, verdict }`.
- Execution must run in <150ms and work 100% offline.

---

### Task 1: Color Quantization & Harmony Engine

**Files:**
- Create: `public/vision-engine.js`
- Test: `test/vision-engine.test.js`

**Interfaces:**
- Produces: `rgbToHsl(r, g, b)`, `findNearestColorName(r, g, b)`, `computeHarmony(colors)`, `analyzeImageData(canvasContext, width, height)`

- [ ] **Step 1: Write the failing unit tests for color naming and harmony**
- [ ] **Step 2: Run test using `node --test test/vision-engine.test.js` to verify failure**
- [ ] **Step 3: Implement color distance, color palette naming, and harmony algorithms in `public/vision-engine.js`**
- [ ] **Step 4: Run test to verify all tests pass**

---

### Task 2: Fashion Critic & Critique Generator

**Files:**
- Modify: `public/vision-engine.js`
- Test: `test/vision-engine.test.js`

**Interfaces:**
- Consumes: `analyzeImageData`
- Produces: `generateCritique(analysis)`, `window.judgeOutfit(imageDataUrl)`

- [ ] **Step 1: Add unit tests for critique generation schema and dynamic color embedding**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement dynamic critique matrix (scores, auras, wins, roasts, upgrades) based on harmony and real detected garment colors**
- [ ] **Step 4: Run test to verify it passes**

---

### Task 3: UI Integration & Server Cleanup

**Files:**
- Modify: `public/index.html`
- Modify: `server.js`
- Modify: `package.json`
- Modify: `README.md`

- [ ] **Step 1: Link `vision-engine.js` into `public/index.html`**
- [ ] **Step 2: Update click handler in `public/index.html` to call `window.judgeOutfit(imageData)`**
- [ ] **Step 3: Update `server.js` to serve static files cleanly without requiring `.env` or `GEMINI_API_KEY`**
- [ ] **Step 4: Add `"test": "node --test"` in `package.json`**
- [ ] **Step 5: Update `README.md` with static deployment instructions (GitHub Pages / Vercel)**
- [ ] **Step 6: Verify full end-to-end flow with browser and test runner**
