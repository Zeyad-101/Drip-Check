import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rgbToHsl,
  findNearestColorName,
  computeHarmony,
  generateCritique
} from '../public/vision-engine.js';

test('rgbToHsl converts RGB to HSL correctly', () => {
  // Pure red
  const red = rgbToHsl(255, 0, 0);
  assert.equal(red.h, 0);
  assert.equal(red.s, 100);
  assert.equal(red.l, 50);

  // Pure black
  const black = rgbToHsl(0, 0, 0);
  assert.equal(black.l, 0);

  // Pure white
  const white = rgbToHsl(255, 255, 255);
  assert.equal(white.l, 100);
});

test('findNearestColorName maps RGB to fashion pigment names', () => {
  assert.equal(findNearestColorName(18, 18, 18), 'Charcoal Black');
  assert.equal(findNearestColorName(248, 245, 240), 'Off-White');
  assert.equal(findNearestColorName(55, 70, 48), 'Olive Green');
  assert.equal(findNearestColorName(24, 38, 75), 'Dark Navy');
  assert.equal(findNearestColorName(115, 30, 45), 'Burgundy');
  assert.equal(findNearestColorName(190, 155, 110), 'Camel');
});

test('computeHarmony detects monochrome palette', () => {
  const allBlackPalette = [
    { name: 'Charcoal Black', r: 25, g: 25, b: 25, h: 0, s: 0, l: 10, isNeutral: true },
    { name: 'Charcoal Black', r: 35, g: 35, b: 35, h: 0, s: 0, l: 14, isNeutral: true },
    { name: 'Slate Gray', r: 70, g: 75, b: 80, h: 210, s: 7, l: 29, isNeutral: true }
  ];
  const harmony = computeHarmony(allBlackPalette);
  assert.equal(harmony.type, 'monochrome');
  assert.ok(harmony.scoreBonus >= 0.5);
});

test('computeHarmony detects high contrast neutrals', () => {
  const contrastPalette = [
    { name: 'Off-White', r: 245, g: 245, b: 245, h: 0, s: 0, l: 96, isNeutral: true },
    { name: 'Charcoal Black', r: 20, g: 20, b: 20, h: 0, s: 0, l: 8, isNeutral: true },
    { name: 'Charcoal Black', r: 25, g: 25, b: 25, h: 0, s: 0, l: 10, isNeutral: true }
  ];
  const harmony = computeHarmony(contrastPalette);
  assert.equal(harmony.type, 'high-contrast');
});

test('computeHarmony detects complementary and clashing palettes', () => {
  // Cobalt Blue (h ~220) + Mustard Yellow (h ~45) -> complementary (~175 deg diff)
  const complementaryPalette = [
    { name: 'Cobalt Blue', r: 25, g: 75, b: 185, h: 221, s: 76, l: 41, isNeutral: false },
    { name: 'Mustard Yellow', r: 210, g: 160, b: 45, h: 42, s: 65, l: 50, isNeutral: false },
    { name: 'Pitch Black', r: 10, g: 10, b: 12, h: 240, s: 9, l: 4, isNeutral: true }
  ];
  const compHarmony = computeHarmony(complementaryPalette);
  assert.equal(compHarmony.type, 'complementary');

  // Hot Pink (s ~100) + Neon Green (s ~100) -> clash
  const clashPalette = [
    { name: 'Hot Pink', r: 255, g: 45, b: 145, h: 331, s: 100, l: 59, isNeutral: false },
    { name: 'Neon Green', r: 65, g: 255, b: 85, h: 126, s: 100, l: 63, isNeutral: false },
    { name: 'Pitch Black', r: 10, g: 10, b: 12, h: 240, s: 9, l: 4, isNeutral: true }
  ];
  const clashHarmony = computeHarmony(clashPalette);
  assert.equal(clashHarmony.type, 'clash');
  assert.ok(clashHarmony.scoreBonus < 0);
});

test('generateCritique returns correct schema and embeds detected colors', () => {
  const mockAnalysis = {
    top: { name: 'Olive Green', r: 55, g: 70, b: 48, h: 101, s: 19, l: 23, isNeutral: false },
    mid: { name: 'Off-White', r: 245, g: 240, b: 235, h: 30, s: 25, l: 94, isNeutral: true },
    bottom: { name: 'Charcoal Black', r: 25, g: 25, b: 25, h: 0, s: 0, l: 10, isNeutral: true },
    harmony: { type: 'earthy-contrast', description: 'Earthy tone paired with neutral base', scoreBonus: 0.8 },
    contrastRatio: 4.1,
    patternDensity: 'clean'
  };

  const critique = generateCritique(mockAnalysis);

  assert.equal(typeof critique.score, 'number');
  assert.ok(critique.score >= 0 && critique.score <= 10);
  assert.equal(typeof critique.aura, 'string');
  assert.equal(typeof critique.vibe, 'string');
  assert.ok(Array.isArray(critique.wins));
  assert.equal(critique.wins.length, 3);
  assert.equal(typeof critique.roast, 'string');
  assert.equal(typeof critique.upgrade, 'string');
  assert.equal(typeof critique.verdict, 'string');

  // Verify that the critique references detected colors
  const textBlob = `${critique.vibe} ${critique.wins.join(' ')} ${critique.roast} ${critique.upgrade}`.toLowerCase();
  assert.ok(textBlob.includes('olive') || textBlob.includes('off-white') || textBlob.includes('earth'));
});
