import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rgbToHsl,
  findNearestColorName,
  computeHarmony,
  generateCritique,
  extractDominantColor,
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
