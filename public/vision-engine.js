/**
 * DripCheck Client-Side Vision & Fashion Critique Engine
 * 100% In-Browser Computer Vision & Color Theory Analysis
 */

// Curated fashion color palette with RGB values and fashion-accurate names
const FASHION_PALETTE = [
  // Neutrals & Grayscale
  { name: 'Charcoal Black', r: 24, g: 24, b: 26, isNeutral: true },
  { name: 'Pitch Black', r: 10, g: 10, b: 12, isNeutral: true },
  { name: 'Slate Gray', r: 85, g: 95, b: 105, isNeutral: true },
  { name: 'Cool Gray', r: 155, g: 160, b: 168, isNeutral: true },
  { name: 'Off-White', r: 245, g: 243, b: 238, isNeutral: true },
  { name: 'Crisp White', r: 255, g: 255, b: 255, isNeutral: true },
  { name: 'Cream', r: 248, g: 238, b: 215, isNeutral: true },
  { name: 'Beige', r: 222, g: 208, b: 182, isNeutral: true },
  { name: 'Tan', r: 205, g: 175, b: 135, isNeutral: true },
  { name: 'Camel', r: 195, g: 150, b: 100, isNeutral: false },
  { name: 'Chocolate Brown', r: 65, g: 42, b: 32, isNeutral: true },

  // Earth Tones & Greens
  { name: 'Olive Green', r: 60, g: 72, b: 48, isNeutral: false },
  { name: 'Forest Green', r: 35, g: 60, b: 45, isNeutral: false },
  { name: 'Sage Green', r: 135, g: 155, b: 135, isNeutral: false },
  { name: 'Terracotta', r: 185, g: 85, b: 65, isNeutral: false },
  { name: 'Rust', r: 155, g: 65, b: 38, isNeutral: false },
  { name: 'Mustard Yellow', r: 210, g: 160, b: 45, isNeutral: false },

  // Blues & Cool Tones
  { name: 'Dark Navy', r: 22, g: 35, b: 65, isNeutral: true },
  { name: 'Midnight Blue', r: 15, g: 25, b: 45, isNeutral: true },
  { name: 'Cobalt Blue', r: 25, g: 75, b: 185, isNeutral: false },
  { name: 'Ice Blue', r: 180, g: 205, b: 225, isNeutral: false },
  { name: 'Faded Denim', r: 110, g: 140, b: 175, isNeutral: false },

  // Reds, Purples & Warm Accents
  { name: 'Burgundy', r: 105, g: 25, b: 40, isNeutral: false },
  { name: 'Crimson Red', r: 185, g: 30, b: 40, isNeutral: false },
  { name: 'Coral', r: 235, g: 110, b: 95, isNeutral: false },
  { name: 'Lavender', r: 190, g: 175, b: 220, isNeutral: false },
  { name: 'Dusty Rose', r: 195, g: 140, b: 150, isNeutral: false },

  // Neons & Loud Accents
  { name: 'Neon Green', r: 65, g: 255, b: 85, isNeutral: false },
  { name: 'Cyber Cyan', r: 0, g: 240, b: 255, isNeutral: false },
  { name: 'Hot Pink', r: 255, g: 45, b: 145, isNeutral: false }
];

/**
 * Convert RGB to HSL color space
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Find the closest matching fashion color name using weighted Euclidean distance
 */
export function findNearestColorName(r, g, b) {
  let closest = FASHION_PALETTE[0];
  let minDistance = Infinity;

  for (const color of FASHION_PALETTE) {
    // Redmean color distance approximation
    const rmean = (r + color.r) / 2;
    const dr = r - color.r;
    const dg = g - color.g;
    const db = b - color.b;
    const dist = Math.sqrt(
      (2 + rmean / 256) * dr * dr +
      4 * dg * dg +
      (2 + (255 - rmean) / 256) * db * db
    );

    if (dist < minDistance) {
      minDistance = dist;
      closest = color;
    }
  }

  return closest.name;
}

/**
 * Full color descriptor including name, HSL and neutrality
 */
export function getColorDescriptor(r, g, b) {
  const name = findNearestColorName(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  const paletteMatch = FASHION_PALETTE.find(c => c.name === name);
  const isNeutral = paletteMatch ? paletteMatch.isNeutral : hsl.s < 18 || hsl.l < 15 || hsl.l > 88;

  return {
    name,
    r,
    g,
    b,
    ...hsl,
    isNeutral
  };
}

/**
 * Determine harmony classification from a 3-garment palette (top, mid, bottom)
 */
export function computeHarmony(palette) {
  const [c1, c2, c3] = palette;
  const nonNeutrals = palette.filter(c => !c.isNeutral && c.s > 15);
  const lights = palette.map(c => c.l);
  const maxL = Math.max(...lights);
  const minL = Math.min(...lights);
  const contrastRatio = maxL - minL;

  // 1. All or mostly neutral monochrome (Black, Charcoal, Slate)
  if (palette.every(c => c.isNeutral || c.s < 20)) {
    if (contrastRatio > 40) {
      return {
        type: 'high-contrast',
        description: 'Clean monochrome high-contrast pairing',
        scoreBonus: 0.9
      };
    }
    return {
      type: 'monochrome',
      description: 'Unified tonal monochrome palette',
      scoreBonus: 0.8
    };
  }

  // 2. High contrast neutral + single accent
  if (nonNeutrals.length === 1) {
    return {
      type: 'earthy-contrast',
      description: `Accent ${nonNeutrals[0].name} balanced against clean neutrals`,
      scoreBonus: 1.0
    };
  }

  // 3. Two non-neutral colors: check hue relationship
  if (nonNeutrals.length >= 2) {
    // Ultra high saturation collision (e.g. Neon Green + Hot Pink)
    if (nonNeutrals[0].s >= 80 && nonNeutrals[1].s >= 80) {
      return {
        type: 'clash',
        description: 'High-intensity competing color collision',
        scoreBonus: -1.4
      };
    }

    const diff = Math.abs(nonNeutrals[0].h - nonNeutrals[1].h);
    const hueDistance = diff > 180 ? 360 - diff : diff;

    // Complementary (130° - 210°)
    if (hueDistance >= 130 && hueDistance <= 210) {
      return {
        type: 'complementary',
        description: 'Vibrant complementary color contrast',
        scoreBonus: 0.7
      };
    }

    // Analogous (within 60°)
    if (hueDistance <= 60) {
      return {
        type: 'analogous',
        description: 'Harmonious analogous tone blend',
        scoreBonus: 0.85
      };
    }

    // High saturation clash fallback
    if (nonNeutrals[0].s > 60 && nonNeutrals[1].s > 60) {
      return {
        type: 'clash',
        description: 'High-intensity competing color collision',
        scoreBonus: -1.2
      };
    }
  }

  return {
    type: 'balanced',
    description: 'Everyday casual multi-tone coordination',
    scoreBonus: 0.3
  };
}

/**
 * Generate witty, dynamic fashion critique accurately reflecting detected colors
 */
export function generateCritique(analysis) {
  const { top, mid, bottom, harmony, patternDensity } = analysis;
  const colors = [top.name, mid.name, bottom.name];
  const uniqueColors = [...new Set(colors)];

  let baseScore = 7.0 + (harmony.scoreBonus || 0);

  // Bonus for clean texture coordination
  if (patternDensity === 'clean') baseScore += 0.4;
  else if (patternDensity === 'busy') baseScore -= 0.3;

  // Clamp score cleanly between 4.2 and 9.7
  const score = Math.min(9.7, Math.max(4.2, Math.round(baseScore * 10) / 10));

  let aura = 'CASUAL MINIMALIST';
  let vibe = `Coordinated ensemble balancing ${top.name} with ${mid.name}.`;
  let wins = [
    `Deliberate palette coordination around ${top.name}`,
    `Proportional color grounding from ${mid.name} through to the shoes`,
    patternDensity === 'clean' ? 'Smooth, uncluttered fabric silhouettes' : 'Dynamic texture and visual energy'
  ];
  let roast = 'Safe enough to blend into any coffee shop unnoticed.';
  let upgrade = `Consider swapping the ${mid.name} piece for a textured layer to add depth.`;
  let verdict = 'EFFORTLESSLY WEARABLE.';

  switch (harmony.type) {
    case 'monochrome':
      if (top.l < 25 && mid.l < 25) {
        aura = 'STREETWEAR PHANTOM';
        vibe = `All-dark tonal execution anchored in deep ${top.name}.`;
        wins = [
          'Unforgiving all-black / dark-mode silhouette',
          'Zero color friction — pure form and shape focus',
          'Effortless evening or downtown street energy'
        ];
        roast = 'You dressed entirely in darkness hoping nobody would perceive you.';
        upgrade = `Add a silver chain, watch, or an off-white undershirt hem to break the ${top.name} monolith.`;
        verdict = 'VOID CHIC AT ITS FINEST.';
      } else {
        aura = 'TONAL MINIMALIST';
        vibe = `Calm, low-contrast tonal harmony dominated by ${top.name}.`;
        wins = [
          'Cohesive monochrome spectrum',
          'Soft, approachable tonal discipline',
          'Relaxed proportions that breathe'
        ];
        roast = 'You look like you belong in an architectural firm brochure.';
        upgrade = 'Introduce one leather or raw metallic accessory for tactile interest.';
        verdict = 'SUBTLE AND INTENTIONAL.';
      }
      break;

    case 'high-contrast':
      aura = 'HIGH-CONTRAST STATEMENT';
      vibe = `Sharp graphical tension pairing ${top.name} against ${mid.name}.`;
      wins = [
        `Bold value separation between ${top.name} and ${mid.name}`,
        'High-impact visual readability from across the room',
        'Timeless color-blocking foundation'
      ];
      roast = "Looking like a walking Pantone swatch, but you're making it work.";
      upgrade = `Ground the high contrast with minimalist footwear in ${bottom.name}.`;
      verdict = 'CRISP GRAPHIC PERFECTION.';
      break;

    case 'earthy-contrast':
      aura = 'QUIET LUXURY SCHOLAR';
      vibe = `Rich organic balance centering ${top.name} against ${mid.name}.`;
      wins = [
        `Tasteful deployment of ${top.name} as the hero piece`,
        `Solid neutral grounding from the ${mid.name} base`,
        'Natural, lived-in aesthetic sophistication'
      ];
      roast = "You look ready to explain the nuances of pour-over coffee to anyone who didn't ask.";
      upgrade = `Throw on a structured coat or canvas tote to elevate the ${top.name} tone.`;
      verdict = 'NATURAL SOPHISTICATION.';
      break;

    case 'complementary':
      aura = 'ELECTRIC POP';
      vibe = `Dynamic color wheel tension pitting ${top.name} against ${mid.name}.`;
      wins = [
        `Adventurous complementary clash between ${top.name} and ${mid.name}`,
        'High-energy confidence that commands attention',
        'Youthful streetwear flair'
      ];
      roast = "You look like an extra on a fashion week live stream who refused to play it safe.";
      upgrade = `Keep the shoes neutral to prevent ${bottom.name} from fighting the upper color duo.`;
      verdict = 'AUDACIOUS AND MEMORABLE.';
      break;

    case 'clash':
      aura = 'CHAOS MAXIMALIST';
      vibe = `High-saturation overload where ${top.name} and ${mid.name} fight for dominance.`;
      wins = [
        'Fearless attitude toward bright pigments',
        'Unmissable visibility in high-density crowds',
        'Unconventional experimental energy'
      ];
      roast = 'Your outfit is currently having a heated group chat argument with itself.';
      upgrade = `Swap either the ${top.name} or ${mid.name} for a muted Charcoal or Off-White to anchor the look.`;
      verdict = 'LOUD BUT NEEDS DISCIPLINE.';
      break;
  }

  return {
    score,
    aura,
    vibe,
    wins,
    roast,
    upgrade,
    verdict
  };
}

/**
 * Extract average color from a rectangular canvas sub-region
 */
function sampleRegionColor(data, width, startY, endY, startX, endX) {
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let count = 0;

  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];
      if (a > 50) { // Ignore transparent pixels
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
        count++;
      }
    }
  }

  if (count === 0) return { r: 128, g: 128, b: 128 };
  return {
    r: Math.round(rSum / count),
    g: Math.round(gSum / count),
    b: Math.round(bSum / count)
  };
}

/**
 * Measure edge density to detect busy patterns vs clean solids
 */
function computeEdgeDensity(data, width, height) {
  let edgeSum = 0;
  let samples = 0;

  for (let y = 10; y < height - 10; y += 4) {
    for (let x = 10; x < width - 10; x += 4) {
      const idx = (y * width + x) * 4;
      const rightIdx = (y * width + (x + 1)) * 4;
      const downIdx = ((y + 1) * width + x) * 4;

      const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const lumR = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
      const lumD = (data[downIdx] + data[downIdx + 1] + data[downIdx + 2]) / 3;

      edgeSum += Math.abs(lum - lumR) + Math.abs(lum - lumD);
      samples++;
    }
  }

  const avgGradient = edgeSum / Math.max(1, samples);
  return avgGradient > 18 ? 'busy' : 'clean';
}

/**
 * Analyze an HTML5 Canvas context containing the outfit photo
 */
export function analyzeImageData(ctx, width, height) {
  const imgData = ctx.getImageData(0, 0, width, height).data;

  // Center crop region (focus on garment, ignore peripheral background)
  const startX = Math.floor(width * 0.20);
  const endX = Math.floor(width * 0.80);

  // Vertical segmentation
  // Top: 15% to 45% (Upper body / jacket / shirt)
  const topRgb = sampleRegionColor(imgData, width, Math.floor(height * 0.15), Math.floor(height * 0.45), startX, endX);
  // Mid: 45% to 75% (Trousers / waist / skirt)
  const midRgb = sampleRegionColor(imgData, width, Math.floor(height * 0.45), Math.floor(height * 0.75), startX, endX);
  // Bottom: 75% to 95% (Footwear / hemline)
  const bottomRgb = sampleRegionColor(imgData, width, Math.floor(height * 0.75), Math.floor(height * 0.95), startX, endX);

  const top = getColorDescriptor(topRgb.r, topRgb.g, topRgb.b);
  const mid = getColorDescriptor(midRgb.r, midRgb.g, midRgb.b);
  const bottom = getColorDescriptor(bottomRgb.r, bottomRgb.g, bottomRgb.b);

  const harmony = computeHarmony([top, mid, bottom]);
  const patternDensity = computeEdgeDensity(imgData, width, height);

  return {
    top,
    mid,
    bottom,
    harmony,
    patternDensity
  };
}

/**
 * In-browser runner: Takes an image source (data URL / object URL) and produces critique
 */
export function judgeOutfit(imageSrc) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('judgeOutfit must run in a browser environment.'));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);

        const analysis = analyzeImageData(ctx, size, size);
        const critique = generateCritique(analysis);

        // Natural short pause for realistic feel
        setTimeout(() => resolve(critique), 600);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to process outfit image.'));
    img.src = imageSrc;
  });
}

// Browser global exposure
if (typeof window !== 'undefined') {
  window.judgeOutfit = judgeOutfit;
  window.analyzeImageData = analyzeImageData;
  window.generateCritique = generateCritique;
  window.findNearestColorName = findNearestColorName;
  window.rgbToHsl = rgbToHsl;
  window.computeHarmony = computeHarmony;
}
