import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rgbToHsl,
  findNearestColorName,
  computeHarmony,
  generateCritique,
  extractDominantColor,
  detectHumanSubject,
  checkIsShirtless,
  parsePredictions,
  FASHION_PALETTE
} from '../public/vision-engine.js';

test('rgbToHsl converts RGB to HSL correctly', () => {
  const red = rgbToHsl(255, 0, 0);
  assert.equal(red.h, 0);
  assert.equal(red.s, 100);
  assert.equal(red.l, 50);

  const black = rgbToHsl(0, 0, 0);
  assert.equal(black.l, 0);

  const white = rgbToHsl(255, 255, 255);
  assert.equal(white.l, 100);
});

test('findNearestColorName maps RGB to fashion pigment names accurately', () => {
  assert.equal(findNearestColorName(15, 15, 18), 'Pitch Black');
  assert.equal(findNearestColorName(242, 240, 234), 'Off-White');
  assert.equal(findNearestColorName(65, 78, 52), 'Olive Green');
  assert.equal(findNearestColorName(20, 32, 60), 'Dark Navy');
  assert.equal(findNearestColorName(102, 24, 42), 'Burgundy');
  assert.equal(findNearestColorName(185, 138, 88), 'Camel');
  assert.equal(findNearestColorName(62, 255, 82), 'Neon Green');
  assert.equal(findNearestColorName(255, 42, 140), 'Hot Pink');
});

test('extractDominantColor uses histogram binning over naive averaging', () => {
  // Synthetic 10x10 pixel grid: 70% Crimson Red, 30% Off-White background
  const width = 10;
  const height = 10;
  const data = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < 100; i++) {
    const idx = i * 4;
    if (i < 70) {
      // Crimson Red clothing
      data[idx] = 186;
      data[idx + 1] = 28;
      data[idx + 2] = 38;
      data[idx + 3] = 255;
    } else {
      // Off-White background
      data[idx] = 242;
      data[idx + 1] = 240;
      data[idx + 2] = 234;
      data[idx + 3] = 255;
    }
  }

  const dominant = extractDominantColor(data, width, 0, height, 0, width);
  assert.equal(dominant.name, 'Crimson Red');
});

test('computeHarmony accurately differentiates aesthetic genres', () => {
  const getCol = (name) => FASHION_PALETTE.find(c => c.name === name);

  // All Black
  const blackFit = computeHarmony([getCol('Pitch Black'), getCol('Charcoal Black'), getCol('Pitch Black')]);
  assert.equal(blackFit.type, 'all-black');

  // All White
  const whiteFit = computeHarmony([getCol('Crisp White'), getCol('Off-White'), getCol('Cream')]);
  assert.equal(whiteFit.type, 'all-white');

  // High Contrast
  const contrastFit = computeHarmony([getCol('Crisp White'), getCol('Pitch Black'), getCol('Crisp White')]);
  assert.equal(contrastFit.type, 'high-contrast');

  // Earth Tones
  const earthFit = computeHarmony([getCol('Olive Green'), getCol('Camel'), getCol('Chocolate Brown')]);
  assert.equal(earthFit.type, 'earth-tone');

  // Neon Clash
  const clashFit = computeHarmony([getCol('Neon Green'), getCol('Hot Pink'), getCol('Pitch Black')]);
  assert.equal(clashFit.type, 'clash');
  assert.ok(clashFit.scoreBonus < 0);
});

test('generateCritique yields different scores, auras, and roasts per outfit', () => {
  const getCol = (name) => FASHION_PALETTE.find(c => c.name === name);

  const blackAnalysis = {
    top: getCol('Pitch Black'),
    mid: getCol('Charcoal Black'),
    bottom: getCol('Pitch Black'),
    harmony: computeHarmony([getCol('Pitch Black'), getCol('Charcoal Black'), getCol('Pitch Black')]),
    patternDensity: 'clean',
    pixelSignature: '12345'
  };

  const earthAnalysis = {
    top: getCol('Olive Green'),
    mid: getCol('Camel'),
    bottom: getCol('Chocolate Brown'),
    harmony: computeHarmony([getCol('Olive Green'), getCol('Camel'), getCol('Chocolate Brown')]),
    patternDensity: 'clean',
    pixelSignature: '67890'
  };

  const clashAnalysis = {
    top: getCol('Neon Green'),
    mid: getCol('Hot Pink'),
    bottom: getCol('Electric Orange'),
    harmony: computeHarmony([getCol('Neon Green'), getCol('Hot Pink'), getCol('Electric Orange')]),
    patternDensity: 'busy',
    pixelSignature: '99999'
  };

  const blackCritique = generateCritique(blackAnalysis);
  const earthCritique = generateCritique(earthAnalysis);
  const clashCritique = generateCritique(clashAnalysis);

  // Scores must be meaningfully different
  assert.ok(clashCritique.score < 6.0, `Clash score was too high: ${clashCritique.score}`);
  assert.ok(earthCritique.score >= 8.0, `Earth score was too low: ${earthCritique.score}`);
  assert.ok(blackCritique.score >= 8.0, `Black score was too low: ${blackCritique.score}`);

  // Auras, roasts, and verdicts must be completely different
  assert.notEqual(blackCritique.aura, earthCritique.aura);
  assert.notEqual(earthCritique.aura, clashCritique.aura);
  assert.notEqual(blackCritique.roast, earthCritique.roast);
  assert.notEqual(earthCritique.roast, clashCritique.roast);
  assert.notEqual(blackCritique.verdict, clashCritique.verdict);
});

test('detectHumanSubject and checkIsShirtless accurately identify shirtless photo', () => {
  const width = 20;
  const height = 40;
  const data = new Uint8ClampedArray(width * height * 4);

  // Background: rows 0-15 (sky/umbrella)
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = 200; data[idx + 1] = 220; data[idx + 2] = 240; data[idx + 3] = 255; // Sky blue
    }
  }

  // Face/Head: rows 16-20 (skin)
  for (let y = 16; y <= 20; y++) {
    for (let x = 6; x < 14; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = 190; data[idx + 1] = 135; data[idx + 2] = 95; data[idx + 3] = 255; // Tan skin
    }
  }

  // Chest/Torso: rows 21-32 (bare skin)
  for (let y = 21; y < 32; y++) {
    for (let x = 5; x < 15; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = 195; data[idx + 1] = 140; data[idx + 2] = 100; data[idx + 3] = 255; // Tan skin
    }
  }

  const subject = detectHumanSubject(data, width, height);
  assert.equal(subject.hasHuman, true);
  assert.equal(subject.headY, 16);

  const isShirtless = checkIsShirtless(data, width, height, subject);
  assert.equal(isShirtless, true);
});

test('generateCritique delivers shirtless roast and score', () => {
  const shirtlessAnalysis = {
    top: { name: 'Bare Skin (No Shirt)', category: 'skin' },
    mid: { name: 'Dark Navy' },
    bottom: { name: 'Pitch Black' },
    harmony: { type: 'shirtless', label: 'Shirtless / No Shirt', scoreBonus: -4.2 },
    patternDensity: 'clean',
    pixelSignature: '77777',
    isShirtless: true
  };

  const critique = generateCritique(shirtlessAnalysis);
  assert.ok(critique.score <= 4.5, `Shirtless score should be penalized, got ${critique.score}`);
  assert.ok(
    critique.aura.includes('TARZAN') || 
    critique.aura.includes('BARE CHEST') || 
    critique.aura.includes('SOLAR') || 
    critique.aura.includes('BEACH') || 
    critique.aura.includes('GYM')
  );
  assert.ok(critique.roast.toLowerCase().includes('shirt') || critique.roast.toLowerCase().includes('clothing'));
  assert.ok(critique.upgrade.toLowerCase().includes('shirt'));
});
test('parsePredictions correctly categorizes jersey and prevents shirtless classification', () => {
  const jerseyPredictions = [
    { className: 'jersey, T-shirt', probability: 0.85 },
    { className: 'sweatshirt', probability: 0.12 }
  ];

  const parsed = parsePredictions(jerseyPredictions);
  assert.equal(parsed.hasTopGarment, true);
  assert.equal(parsed.topGarmentType, 'jersey');
  assert.equal(parsed.isSportswear, true);

  const beachPredictions = [
    { className: 'seashore, coast', probability: 0.72 },
    { className: 'swimming trunks', probability: 0.45 }
  ];

  const parsedBeach = parsePredictions(beachPredictions);
  assert.equal(parsedBeach.isSwimwearOrBeach, true);
  assert.equal(parsedBeach.hasTopGarment, false);
});

test('findNearestColor maps low-chroma neutral shades to black and gray rather than olive', () => {
  // Dark fabric shadow (53, 53, 60) should be Charcoal Black
  assert.equal(findNearestColorName(53, 53, 60), 'Charcoal Black');
  // Cool charcoal (35, 36, 40) should be Charcoal Black
  assert.equal(findNearestColorName(35, 36, 40), 'Charcoal Black');
  // Slate gray (90, 94, 100) should be Slate Gray
  assert.equal(findNearestColorName(90, 94, 100), 'Slate Gray');
});

test('checkIsShirtless returns false when torso has dark fabric, even with warm background', () => {
  const width = 20;
  const height = 40;
  const data = new Uint8ClampedArray(width * height * 4);

  // Background: rows 0-15 (storefront glass/wall)
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = 45; data[idx + 1] = 42; data[idx + 2] = 38; data[idx + 3] = 255;
    }
  }

  // Face: rows 16-20 (human face)
  for (let y = 16; y <= 20; y++) {
    for (let x = 7; x < 13; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = 190; data[idx + 1] = 135; data[idx + 2] = 95; data[idx + 3] = 255;
    }
  }

  // Torso: rows 21-35 (Black football jersey)
  for (let y = 21; y < 35; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (x >= 6 && x <= 14) {
        // Black jersey
        data[idx] = 25; data[idx + 1] = 25; data[idx + 2] = 30; data[idx + 3] = 255;
      } else {
        // Storefront wood on sides
        data[idx] = 85; data[idx + 1] = 70; data[idx + 2] = 55; data[idx + 3] = 255;
      }
    }
  }

  const subject = detectHumanSubject(data, width, height);
  assert.equal(subject.hasHuman, true);
  assert.equal(subject.headY, 16);

  const isShirtless = checkIsShirtless(data, width, height, subject);
  assert.equal(isShirtless, false, 'Black jersey torso must not be marked shirtless');
});
