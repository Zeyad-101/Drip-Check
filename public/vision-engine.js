/**
 * DripCheck Client-Side Vision & Fashion Critique Engine
 * Advanced In-Browser Color Histogram Extraction, Harmony Analysis & Dynamic Roast Generator
 */

// Curated 32 fashion pigments with RGB values, fashion names, and category tags
export const FASHION_PALETTE = [
  // Neutrals & Grayscale
  { name: 'Pitch Black', r: 15, g: 15, b: 18, category: 'neutral', isDark: true, isLight: false },
  { name: 'Charcoal Black', r: 38, g: 38, b: 42, category: 'neutral', isDark: true, isLight: false },
  { name: 'Slate Gray', r: 88, g: 96, b: 106, category: 'neutral', isDark: false, isLight: false },
  { name: 'Cool Gray', r: 150, g: 155, b: 162, category: 'neutral', isDark: false, isLight: false },
  { name: 'Off-White', r: 242, g: 240, b: 234, category: 'neutral', isDark: false, isLight: true },
  { name: 'Crisp White', r: 255, g: 255, b: 255, category: 'neutral', isDark: false, isLight: true },
  { name: 'Cream', r: 246, g: 236, b: 215, category: 'neutral', isDark: false, isLight: true },
  { name: 'Beige', r: 218, g: 202, b: 178, category: 'neutral', isDark: false, isLight: false },
  { name: 'Tan', r: 195, g: 165, b: 125, category: 'earth', isDark: false, isLight: false },
  { name: 'Camel', r: 185, g: 138, b: 88, category: 'earth', isDark: false, isLight: false },
  { name: 'Chocolate Brown', r: 68, g: 45, b: 34, category: 'earth', isDark: true, isLight: false },

  // Earth Tones & Greens
  { name: 'Olive Green', r: 65, g: 78, b: 52, category: 'earth', isDark: false, isLight: false },
  { name: 'Forest Green', r: 32, g: 58, b: 42, category: 'earth', isDark: true, isLight: false },
  { name: 'Sage Green', r: 138, g: 158, b: 138, category: 'pastel', isDark: false, isLight: false },
  { name: 'Terracotta', r: 182, g: 86, b: 64, category: 'earth', isDark: false, isLight: false },
  { name: 'Rust', r: 150, g: 62, b: 35, category: 'earth', isDark: false, isLight: false },
  { name: 'Mustard Yellow', r: 212, g: 162, b: 42, category: 'warm', isDark: false, isLight: false },

  // Blues & Denim
  { name: 'Dark Navy', r: 20, g: 32, b: 60, category: 'denim', isDark: true, isLight: false },
  { name: 'Midnight Blue', r: 14, g: 22, b: 42, category: 'denim', isDark: true, isLight: false },
  { name: 'Faded Denim', r: 105, g: 138, b: 172, category: 'denim', isDark: false, isLight: false },
  { name: 'Cobalt Blue', r: 28, g: 82, b: 195, category: 'vibrant', isDark: false, isLight: false },
  { name: 'Ice Blue', r: 182, g: 208, b: 230, category: 'pastel', isDark: false, isLight: true },

  // Warm & Reds
  { name: 'Burgundy', r: 102, g: 24, b: 42, category: 'warm', isDark: true, isLight: false },
  { name: 'Crimson Red', r: 186, g: 28, b: 38, category: 'vibrant', isDark: false, isLight: false },
  { name: 'Coral', r: 236, g: 108, b: 92, category: 'warm', isDark: false, isLight: false },
  { name: 'Dusty Rose', r: 192, g: 136, b: 146, category: 'pastel', isDark: false, isLight: false },
  { name: 'Lavender', r: 188, g: 172, b: 218, category: 'pastel', isDark: false, isLight: true },

  // Neons & Brights
  { name: 'Neon Green', r: 62, g: 255, b: 82, category: 'neon', isDark: false, isLight: false },
  { name: 'Cyber Cyan', r: 0, g: 238, b: 255, category: 'neon', isDark: false, isLight: false },
  { name: 'Hot Pink', r: 255, g: 42, b: 140, category: 'neon', isDark: false, isLight: false },
  { name: 'Electric Orange', r: 255, g: 95, b: 15, category: 'neon', isDark: false, isLight: false },
  { name: 'Sunshine Yellow', r: 255, g: 215, b: 45, category: 'vibrant', isDark: false, isLight: true }
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
 * Weighted perceptual color distance (Redmean metric)
 */
export function colorDistance(r1, g1, b1, r2, g2, b2) {
  const rmean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(
    (2 + rmean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rmean) / 256) * db * db
  );
}

/**
 * Find closest matching color from the fashion palette
 */
export function findNearestColor(r, g, b) {
  let closest = FASHION_PALETTE[0];
  let minDistance = Infinity;

  for (const color of FASHION_PALETTE) {
    const dist = colorDistance(r, g, b, color.r, color.g, color.b);
    if (dist < minDistance) {
      minDistance = dist;
      closest = color;
    }
  }

  return closest;
}

export function findNearestColorName(r, g, b) {
  return findNearestColor(r, g, b).name;
}

/**
 * Detect if an RGB pixel is a human skin tone
 */
export function isSkinTone(r, g, b) {
  // Covers diverse human skin tones from pale to deep brown under daylight
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (
    r > 45 && g > 28 && b > 15 &&
    r >= g && g >= b &&
    (r - g) >= 6 &&
    (max - min) >= 10 &&
    r < 252
  );
}

/**
 * Locate human subject in the frame by finding skin/contrast clusters
 */
export function detectHumanSubject(data, width, height) {
  let minSkinY = height;
  let maxSkinY = 0;
  let skinCount = 0;
  const skinPerLine = new Array(height).fill(0);

  // Scan center column (20% to 80% width)
  const startX = Math.floor(width * 0.20);
  const endX = Math.floor(width * 0.80);

  for (let y = 0; y < height; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * 4;
      if (isSkinTone(data[idx], data[idx + 1], data[idx + 2])) {
        skinCount++;
        skinPerLine[y]++;
        if (y < minSkinY) minSkinY = y;
        if (y > maxSkinY) maxSkinY = y;
      }
    }
  }

  const hasHuman = skinCount > (width * height * 0.015);
  return {
    hasHuman,
    skinCount,
    minSkinY: hasHuman ? minSkinY : Math.floor(height * 0.15),
    maxSkinY: hasHuman ? maxSkinY : Math.floor(height * 0.90),
    skinPerLine
  };
}

/**
 * Check if the torso is bare skin (shirtless)
 */
export function checkIsShirtless(data, width, height, subject) {
  if (!subject.hasHuman) return false;

  // Torso is typically below the head/face: from minSkinY + 12% to minSkinY + 38% of height
  const torsoStartY = Math.min(height - 15, Math.floor(subject.minSkinY + height * 0.10));
  const torsoEndY = Math.min(height - 2, Math.floor(subject.minSkinY + height * 0.40));

  if (torsoEndY <= torsoStartY) return false;

  const startX = Math.floor(width * 0.28);
  const endX = Math.floor(width * 0.72);

  let torsoPixels = 0;
  let torsoSkinPixels = 0;

  for (let y = torsoStartY; y < torsoEndY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 50) {
        torsoPixels++;
        if (isSkinTone(data[idx], data[idx + 1], data[idx + 2])) {
          torsoSkinPixels++;
        }
      }
    }
  }

  if (torsoPixels === 0) return false;
  const torsoSkinRatio = torsoSkinPixels / torsoPixels;

  // If over 28% of the torso region is bare skin, the subject is shirtless
  return torsoSkinRatio > 0.28;
}

/**
 * Extract dominant color from a canvas region using histogram binning instead of naive average
 */
export function extractDominantColor(data, width, startY, endY, startX, endX, ignoreColorName = null) {
  const histogram = new Map();

  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 50) continue; // Transparent

      // Skip obvious skin tones in top section to focus on real apparel
      if (startY < width * 0.45 && isSkinTone(r, g, b)) continue;

      const nearest = findNearestColor(r, g, b);
      if (ignoreColorName && nearest.name === ignoreColorName) continue;

      const count = histogram.get(nearest.name) || 0;
      histogram.set(nearest.name, count + 1);
    }
  }

  if (histogram.size === 0) {
    return FASHION_PALETTE.find(c => c.name === 'Slate Gray');
  }

  let dominantName = null;
  let maxCount = -1;
  for (const [name, count] of histogram.entries()) {
    if (count > maxCount) {
      maxCount = count;
      dominantName = name;
    }
  }

  const match = FASHION_PALETTE.find(c => c.name === dominantName);
  const hsl = rgbToHsl(match.r, match.g, match.b);
  return { ...match, ...hsl };
}

/**
 * Comprehensive Harmony & Aesthetic Classification
 */
export function computeHarmony(palette) {
  const [top, mid, bottom] = palette;

  // 1. All-Black / Ultra Dark
  if (top.isDark && mid.isDark) {
    return {
      type: 'all-black',
      label: 'All-Dark Stealth',
      scoreBonus: 1.2
    };
  }

  // 2. All-White / Light Tonal
  if (top.isLight && mid.isLight) {
    return {
      type: 'all-white',
      label: 'All-White Sculptural',
      scoreBonus: 1.0
    };
  }

  // 3. High Contrast Classic (e.g. White Top + Dark Bottom or vice versa)
  if ((top.isLight && mid.isDark) || (top.isDark && mid.isLight)) {
    return {
      type: 'high-contrast',
      label: 'Monochrome High-Contrast',
      scoreBonus: 1.3
    };
  }

  // 4. Earth Tone / Warm Layering (Olive, Camel, Rust, Tan, Chocolate)
  if (top.category === 'earth' || mid.category === 'earth') {
    return {
      type: 'earth-tone',
      label: 'Organic Earth Tone',
      scoreBonus: 1.1
    };
  }

  // 5. Denim Everyday Classic
  if (mid.category === 'denim' || top.category === 'denim') {
    return {
      type: 'denim-casual',
      label: 'Indigo Streetwear Classic',
      scoreBonus: 0.9
    };
  }

  // 6. Pastel Dream
  if (top.category === 'pastel' || mid.category === 'pastel') {
    return {
      type: 'pastel',
      label: 'Muted Pastel Minimalist',
      scoreBonus: 0.9
    };
  }

  // 7. Neon & Vibrant Pop
  if (top.category === 'neon' || mid.category === 'neon') {
    if (top.category === 'neon' && mid.category === 'neon') {
      return {
        type: 'clash',
        label: 'Hyper-Saturated Neon Collision',
        scoreBonus: -1.8
      };
    }
    return {
      type: 'vibrant-accent',
      label: 'Neon Streetwear Accent',
      scoreBonus: 0.6
    };
  }

  // 8. Color wheel complementary check
  const hueDiff = Math.abs(top.h - mid.h);
  const hueDist = hueDiff > 180 ? 360 - hueDiff : hueDiff;

  if (hueDist >= 130 && hueDist <= 210) {
    return {
      type: 'complementary',
      label: 'Complementary Tension',
      scoreBonus: 0.8
    };
  }

  if (hueDist <= 45) {
    return {
      type: 'monochrome',
      label: 'Tonal Analogous Harmony',
      scoreBonus: 0.7
    };
  }

  if (top.s > 60 && mid.s > 60) {
    return {
      type: 'clash',
      label: 'Competing Saturated Collision',
      scoreBonus: -1.4
    };
  }

  return {
    type: 'balanced',
    label: 'Casual Tonal Ensemble',
    scoreBonus: 0.4
  };
}

/**
 * Deterministic pseudo-random integer from string (for consistent per-photo variety)
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Generate highly varied, realistic, witty critique
 */
export function generateCritique(analysis) {
  const { top, mid, bottom, harmony, patternDensity, pixelSignature = '' } = analysis;
  const hash = hashString(`${top.name}-${mid.name}-${bottom.name}-${pixelSignature}`);

  // Base score variance based on actual harmony and contrast
  let baseScore = 7.4 + harmony.scoreBonus;

  // Additional subtle score calibration
  if (patternDensity === 'clean') baseScore += 0.3;
  if (top.category === 'neutral' && mid.category !== 'neutral') baseScore += 0.2; // tasteful anchor

  // Introduce small realistic decimal variation based on image signature (e.g. 7.9, 8.4, 9.2)
  const decimalJitter = ((hash % 7) - 3) * 0.1;
  let finalScore;
  if (harmony.type === 'shirtless') {
    finalScore = Math.min(4.5, Math.max(2.4, Math.round((3.2 + decimalJitter) * 10) / 10));
  } else {
    finalScore = Math.min(9.8, Math.max(4.2, Math.round((baseScore + decimalJitter) * 10) / 10));
  }

  // Persona Banks
  const PERSONA_BANK = {
    'shirtless': {
      auras: ['TARZAN PROTOCOL', 'BARE CHEST BANDIT', 'SOLAR POWERED DRIP', 'BEACH BUM DRIFT', 'GYM BRO AT LARGE'],
      vibes: [
        'Zero upper-body fabric detected — you are completely shirtless.',
        'Maximum skin exposure with zero garments on the upper half.',
        'Vitamin D overload: bold beach confidence, minus the actual outfit.'
      ],
      wins: [
        ['100% maximum Vitamin D synthesis', 'Zero laundry generated for the top half', 'Unapologetic summer confidence'],
        ['Total resistance to overheating', 'Saved $50 on a designer t-shirt', 'Optimal beach energy'],
        ['Zero upper fabric friction', 'Natural tan line development', 'Direct solar charging']
      ],
      roasts: [
        "Bro took 'traveling light' so literally he completely forgot to put on a shirt.",
        "Hard to rate your drip when you're wearing 50% less clothing than a lifeguard.",
        "Can't get roasted for a terrible t-shirt if you don't wear one. Truly a galaxy brain move.",
        "Looking like you are one fresh coconut away from declaring yourself king of the island.",
        "You uploaded a shirtless photo to an outfit rating app. The audacity is inspiring."
      ],
      upgrades: [
        "Literally put on any shirt. An open linen camp-collar shirt would immediately jump your score by +4 points.",
        "Throw on a relaxed crochet shirt or a crisp white tank to turn 'forgot my clothes' into intentional beach style.",
        "Even draping a lightweight overshirt over your shoulders would give this an instant aesthetic upgrade."
      ],
      verdicts: ['PUT A SHIRT ON.', 'NO SHIRT, NO DRIP.', 'VITAMIN D OVERLOAD.', 'BEACH BUM ENERGY.']
    },
    'all-black': {
      auras: ['VOID PHANTOM', 'CYBERPUNK STEALTH', 'MIDNIGHT PROTOCOL', 'SUB-BASS MINIMALIST', 'BERLIN NIGHTCLUB ARCHITECT'],
      vibes: [
        `Strict all-dark execution centered on ${top.name} with zero visual distractions.`,
        `Shadow-mode discipline: ${top.name} flowing seamlessly into ${mid.name}.`,
        `Monolithic darkness that turns clothing into a sharp silhouette.`
      ],
      wins: [
        ['Zero color friction — pure focus on silhouette and drape', 'Instant high-authority streetwear presence', 'Foolproof evening coordination'],
        ['Unforgiving tonal confidence', 'Effortless downtown minimalist energy', 'Sharp monochrome framing that elongates the body'],
        ['Clean dark-mode dominance', 'Understated luxury in pure shadows', 'Total immunity to color-coordination mistakes']
      ],
      roasts: [
        "You dressed entirely in darkness hoping no one would perceive your insecurities.",
        "Looking like you run an underground techno label that has never turned a profit.",
        "You look like a playable unlockable character that hasn't loaded their texture pack yet.",
        "Dressed like you're about to steal the Declaration of Independence at 2 AM."
      ],
      upgrades: [
        `Break the ${top.name} monolith with a chunky silver chain or a crisp white undershirt hem.`,
        `Swap flat cotton for a heavyweight raw wool or textured leather jacket to give depth to the ${top.name}.`,
        `Introduce high-shine hardware or a textured belt to catch the light against the ${mid.name}.`
      ],
      verdicts: ['SHADOW REIGN.', 'VOID CHIC PERFECTION.', 'NOIR MASTERCLASS.', 'STEALTH MODE UNLOCKED.']
    },
    'all-white': {
      auras: ['ANGELIC DRIFT', 'MINIMALIST SCULPTOR', 'COFFEE HAZARD', 'SUMMER ART GALLERIST'],
      vibes: [
        `Pristine, high-maintenance ivory tones radiating pure deliberate cleanliness.`,
        `Architectural light spectrum pairing ${top.name} with crisp ${mid.name}.`
      ],
      wins: [
        ['Fearless high-maintenance discipline that commands immediate attention', 'Bright, airy visual weight that elevates mood', 'Sculptural, museum-grade aesthetic simplicity'],
        ['Immaculate tonal confidence', 'Clean, radiant summer presence', 'Effortless resort elegance']
      ],
      roasts: [
        "You are exactly one rogue espresso drop away from an absolute mental breakdown.",
        "Looking like an architect who refuses to build anything that isn't made of bleached concrete.",
        "Dressed like you're about to ascend to heaven or get banned from a red-sauce Italian dinner."
      ],
      upgrades: [
        `Ground the airy ${top.name} with raw tan leather sandals or chocolate suede boots.`,
        `Add subtle contrast with a bone-horn watch or tortoiseshell frames.`
      ],
      verdicts: ['PRISTINE AND DANGEROUS.', 'UNBLEMISHED EXCELLENCE.', 'HEAVEN SENT.']
    },
    'high-contrast': {
      auras: ['GRAPHIC CODE', 'CHESS GRANDMASTER', 'ZEBRA STATEMENT', 'TIMELESS SHARP', 'NEW YORK STANDARD'],
      vibes: [
        `High-impact visual drama pitting luminous ${top.name} against deep ${mid.name}.`,
        `Binary perfection: high-contrast color blocking with maximum room presence.`
      ],
      wins: [
        [`Bold value separation between ${top.name} and ${mid.name}`, 'Instant optical clarity from 50 feet away', 'Bulletproof proportions that never feel dated'],
        ['Classic graphic tension with zero clutter', 'Powerful torso-to-leg framing', 'Clean, modern urban elegance']
      ],
      roasts: [
        "You look like you're about to teach someone chess or adjudicate a tennis match.",
        "Looking like a walking editorial photo shoot that forgot to bring the rest of the colors.",
        "Half piano keys, half tuxedo penguin, but somehow you pulled it off."
      ],
      upgrades: [
        `Anchor the stark contrast with textured footwear in ${bottom.name}.`,
        `Layer an earthy overshirt over the ${top.name} to soften the graphic transition.`
      ],
      verdicts: ['TIMELESS PRECISION.', 'GRAPHIC MASTERY.', 'STARK AND STRIKING.']
    },
    'earth-tone': {
      auras: ['SPECIALTY ROASTER', 'ALPINE PROFESSOR', 'ORGANIC BRUTALIST', 'CABIN ARCHIVIST', 'AUTUMN PATROL'],
      vibes: [
        `Warm, grounded organic palette pairing ${top.name} against earthy ${mid.name}.`,
        `Subtle forestry and heritage tones that exude quiet craftsmanship.`
      ],
      wins: [
        [`Rich textured interplay between ${top.name} and ${mid.name}`, 'Natural, approachable warmth that feels intentional', 'Sophisticated palette rooted in timeless workwear'],
        ['Grounded organic balance', 'Tasteful color restraint with zero synthetic clash', 'Quiet luxury heritage aesthetic']
      ],
      roasts: [
        "You look ready to corner someone in a bar and explain the history of Japanese selvedge denim.",
        "Looking like you own three pour-over kettles and have very strong opinions on oat milk.",
        "You dressed like an artisan carpenter who spends 90% of their day adjusting their beanie."
      ],
      upgrades: [
        `Add one crisp element (like an off-white tee collar) so the ${top.name} doesn't feel overly muddy.`,
        `Elevate the workwear vibe with polished dark leather loafers instead of canvas sneakers.`
      ],
      verdicts: ['WARM INTELLECTUAL.', 'EARTHY SOPHISTICATION.', 'NATURE BOY LUXURY.']
    },
    'denim-casual': {
      auras: ['OFF-DUTY BLUEPRINT', 'INDIGO ARCHIVIST', '90s VINTAGE DIGGER', 'METROPOLITAN CASUAL'],
      vibes: [
        `Effortless everyday cool anchoring ${top.name} with reliable ${mid.name} indigo.`,
        `Relaxed urban styling with natural denim heritage.`
      ],
      wins: [
        [`The ${mid.name} grounds the entire silhouette with ease`, 'Versatile, ready-for-anything streetwear foundation', 'Timeless casual balance between top and bottom'],
        ['Zero pretense, pure utility', 'Classic street proportions', 'Dependable color balance']
      ],
      roasts: [
        "Safe enough to sneak through airport security without a single person remembering your face.",
        "You look like the 'default character' avatar in an open-world streetwear video game.",
        "Dressed like your weekend plan is browsing vintage thrift racks for four consecutive hours."
      ],
      upgrades: [
        `Elevate the ${top.name} with intentional jewelry or a structured tailored overshirt.`,
        `Swap standard sneakers for rugged lug-sole boots to give the ${mid.name} more posture.`
      ],
      verdicts: ['STREETWEAR STAPLE.', 'EASY ROTATION WINNER.', 'CLEAN BLUEPRINT.']
    },
    'pastel': {
      auras: ['SOFT BOY DRIFT', 'MATCHA LATTE AESTHETIC', 'PASTEL DREAMER', 'MELANCHOLY POET'],
      vibes: [
        `Gentle, dreamy desaturated hues centering ${top.name} over soft ${mid.name}.`,
        `Approachable softness with a relaxed, contemporary edge.`
      ],
      wins: [
        ['Gentle color harmony that radiates calm confidence', 'Modern genderless aesthetic with subtle flair', 'Muted tones that look great in daylight photos'],
        ['Thoughtful pastel coordination', 'Delicate tonal subtlety', 'Unique visual softness without being loud']
      ],
      roasts: [
        "You look like you host a podcast about feeling your feelings in a greenhouse.",
        "Dressed like you're about to hand someone a lukewarm matcha latte and a handwritten letter.",
        "Soft enough to be used as acoustic soundproofing paneling in a recording studio."
      ],
      upgrades: [
        `Ground the soft ${top.name} with structured dark trousers or a heavy leather belt.`,
        `Add a bold dark watch or sunglasses to keep the ${mid.name} from washing out completely.`
      ],
      verdicts: ['DELICATE MASTERPIECE.', 'SOFT AND INTENTIONAL.', 'PASTEL PURITY.']
    },
    'vibrant-accent': {
      auras: ['STREET HEAT', 'CHROMATIC SHOCK', 'NEON SYNDICATE', 'SEOUL RUNWAY'],
      vibes: [
        `High-energy flash: ${top.name} cuts through the visual noise like a siren.`,
        `Deliberate accent placement that refuses to be ignored.`
      ],
      wins: [
        [`High-octane bravery centering ${top.name}`, 'Magnetic street presence with undeniable attitude', 'Strong focal point that draws immediate eyes'],
        ['Audacious color confidence', 'Electric energy that cuts through gray cities', 'Playful modern pop-culture attitude']
      ],
      roasts: [
        "You look like a pedestrian crossing guard who got a stylist from Highsnobiety.",
        "One of you is wearing that bright piece, but we aren't sure if you're wearing it or it's wearing you.",
        "Visibility 10/10. Air traffic control can track you from 30,000 feet."
      ],
      upgrades: [
        `Let the ${top.name} be the only loud piece—keep every other garment dead neutral.`,
        `Balance the saturation with washed black denim instead of bright footwear.`
      ],
      verdicts: ['ELECTRIC PRESENCE.', 'UNAPOLOGETICALLY LOUD.', 'RETINA MELTER.']
    },
    'clash': {
      auras: ['CHAOS FACTORY', 'GARMENT THRIFT BLENDER', 'RADIOACTIVE CLOWN', 'ATTENTION CRISIS'],
      vibes: [
        `Auditory feedback loop in cloth form: ${top.name} and ${mid.name} in open warfare.`,
        `Maximum chromatic saturation with zero mediation.`
      ],
      wins: [
        ['Bravery is through the roof—nobody can accuse you of being boring', 'Supreme visibility in severe blizzard conditions', 'Fearless refusal to consult basic color wheels'],
        ['Pure unfiltered self-expression', 'High visual decibels', 'Memorable for all the wrong reasons']
      ],
      roasts: [
        "Your top and pants are currently filing restraining orders against each other.",
        "You look like you got dressed in a room with a blown fuse and high optimism.",
        "Looking like a toddler was given an unlimited budget in a candy store gift shop.",
        "Your outfit looks like a graphic design student's corrupted Photoshop file."
      ],
      upgrades: [
        `Swap the ${mid.name} immediately for pitch black or raw denim to save the ${top.name}.`,
        `Pick ONE hero color and throw the other one into a dark closet until next festival season.`
      ],
      verdicts: ['CRIME AGAINST RETINAS.', 'CALL THE FASHION POLICE.', 'CHAOS UNCONTAINED.']
    },
    'complementary': {
      auras: ['COLOR THEORY SAVANT', 'COMPLEMENTARY POP', 'CHROMATIC ACROBAT'],
      vibes: [
        `High color wheel tension balancing warm ${top.name} against cool ${mid.name}.`,
        `Calculated chromatic polarity that makes both pieces vibrate with energy.`
      ],
      wins: [
        [`Textbook opposite-hue tension between ${top.name} and ${mid.name}`, 'Energetic visual punch that stays balanced', 'Dynamic street style confidence'],
        ['Smart chromatic discipline', 'Vibrant yet proportional', 'Standout color-blocking execution']
      ],
      roasts: [
        "You look like an NBA franchise jersey from 1996 come to life.",
        "Looking like an art school thesis on why opposite colors shouldn't be left alone together.",
        "Bold enough to make primary school art teachers shed a tear of joy."
      ],
      upgrades: [
        `Neutralize the footwear in ${bottom.name} so it doesn't create a third competing hue.`,
        `Add a muted jacket to frame the ${top.name} and ${mid.name} color clash.`
      ],
      verdicts: ['OPTICAL CHEMISTRY.', 'VIBRANT AND BALANCED.', 'DYNAMIC POP.']
    },
    'balanced': {
      auras: ['CASUAL MINIMALIST', 'SUBTLE CURATOR', 'OFF-HOURS STYLIST', 'URBAN MODULAR'],
      vibes: [
        `Easy, balanced coordination pairing ${top.name} with ${mid.name}.`,
        `Clean everyday proportions with reliable color sensibility.`
      ],
      wins: [
        [`Smooth transition from ${top.name} down through ${mid.name}`, 'Approachable everyday balance with no forced styling', 'Unpretentious, highly wearable rhythm'],
        ['Clean silhouettes and grounded color flow', 'Effortlessly styled for casual comfort', 'Tasteful proportion play']
      ],
      roasts: [
        "Clean, but safe enough to be used as a catalog photo for a direct-to-consumer basics brand.",
        "You look like you asked your smart speaker what the weather was and dressed for the exact average.",
        "Nobody is going to roast you, but nobody is going to stop you on the street either."
      ],
      upgrades: [
        `Introduce one bold accessory—a sculptural bag, vintage cap, or statement watch—to elevate the look.`,
        `Play with oversized or cropped proportions to take the ${top.name} from safe to editorial.`
      ],
      verdicts: ['EFFORTLESSLY WEARABLE.', 'CLEAN AND COMPOSED.', 'EVERYDAY ROTATION.']
    }
  };

  const persona = PERSONA_BANK[harmony.type] || PERSONA_BANK['balanced'];

  const aura = persona.auras[hash % persona.auras.length];
  const vibe = persona.vibes[hash % persona.vibes.length];
  const wins = persona.wins[hash % persona.wins.length];
  const roast = persona.roasts[hash % persona.roasts.length];
  const upgrade = persona.upgrades[hash % persona.upgrades.length];
  const verdict = persona.verdicts[hash % persona.verdicts.length];

  return {
    score: finalScore,
    aura,
    vibe,
    wins,
    roast,
    upgrade,
    verdict,
    detectedPalette: {
      top: top.name,
      mid: mid.name,
      bottom: bottom.name
    }
  };
}

/**
 * Measure edge density across image to distinguish solid flat fabrics from busy prints/patterns
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
  return avgGradient > 19 ? 'busy' : 'clean';
}

/**
 * Analyze an HTML5 Canvas context containing the outfit photo
 */
export function analyzeImageData(ctx, width, height) {
  const imgData = ctx.getImageData(0, 0, width, height).data;

  // 1. Detect background color from outer border perimeter (corners and outer edges)
  const bg = extractDominantColor(imgData, width, 0, Math.floor(height * 0.12), 0, width);

  // 2. Locate human subject in frame and detect shirtless torso
  const subject = detectHumanSubject(imgData, width, height);
  const isShirtless = checkIsShirtless(imgData, width, height, subject);

  // 3. Center crop region (focus on garment, ignore peripheral background)
  const startX = Math.floor(width * 0.22);
  const endX = Math.floor(width * 0.78);

  // 4. Anchor vertical zones to where the human is actually located
  let topStartY, topEndY, midStartY, midEndY, bottomStartY, bottomEndY;

  if (subject.hasHuman) {
    const personTop = Math.max(0, Math.floor(subject.minSkinY + height * 0.10));
    const personBottom = Math.min(height, Math.floor(subject.maxSkinY + height * 0.25));
    const bodyHeight = Math.max(25, personBottom - personTop);

    topStartY = personTop;
    topEndY = Math.min(height - 10, Math.floor(personTop + bodyHeight * 0.45));

    midStartY = topEndY;
    midEndY = Math.min(height - 5, Math.floor(personTop + bodyHeight * 0.82));

    bottomStartY = midEndY;
    bottomEndY = Math.min(height, personBottom);
  } else {
    topStartY = Math.floor(height * 0.15);
    topEndY = Math.floor(height * 0.45);
    midStartY = Math.floor(height * 0.45);
    midEndY = Math.floor(height * 0.75);
    bottomStartY = Math.floor(height * 0.75);
    bottomEndY = Math.floor(height * 0.96);
  }

  let top, harmony;

  if (isShirtless) {
    top = {
      name: 'Bare Skin (No Shirt)',
      category: 'skin',
      isDark: false,
      isLight: false,
      s: 45,
      l: 50,
      h: 25
    };
    harmony = {
      type: 'shirtless',
      label: 'Shirtless / No Shirt',
      scoreBonus: -4.2
    };
  } else {
    top = extractDominantColor(imgData, width, topStartY, topEndY, startX, endX, bg.name);
  }

  const mid = extractDominantColor(imgData, width, midStartY, midEndY, startX, endX, bg.name);
  const bottom = extractDominantColor(imgData, width, bottomStartY, bottomEndY, startX, endX, bg.name);

  if (!isShirtless) {
    harmony = computeHarmony([top, mid, bottom]);
  }

  const patternDensity = computeEdgeDensity(imgData, width, height);

  // Compute unique pixel signature
  let pixelHash = 0;
  for (let i = 0; i < imgData.length; i += 64) {
    pixelHash = (pixelHash * 33 + imgData[i]) | 0;
  }

  return {
    top,
    mid,
    bottom,
    harmony,
    patternDensity,
    pixelSignature: String(Math.abs(pixelHash)),
    isShirtless
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
        setTimeout(() => resolve(critique), 450);
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
