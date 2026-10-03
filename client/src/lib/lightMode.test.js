import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectSlowConnection, resolveLightMode } from './lightMode.js';

const media = (matches) => () => ({ matches });

test('connexion lente détectée : économie de données, 2g, prefers-reduced-data', () => {
  assert.equal(detectSlowConnection({ saveData: true }, media(false)), true);
  assert.equal(detectSlowConnection({ effectiveType: '2g' }, media(false)), true);
  assert.equal(detectSlowConnection({ effectiveType: 'slow-2g' }, media(false)), true);
  assert.equal(detectSlowConnection(undefined, media(true)), true);
});

test('connexion normale ou API absente : pas de version légère', () => {
  assert.equal(detectSlowConnection({ effectiveType: '4g', saveData: false }, media(false)), false);
  assert.equal(detectSlowConnection({ effectiveType: '3g' }, undefined), false);
  assert.equal(detectSlowConnection(undefined, undefined), false);
});

test('le choix mémorisé prime sur la détection', () => {
  assert.deepEqual(resolveLightMode('off', true), { enabled: false, auto: false });
  assert.deepEqual(resolveLightMode('on', false), { enabled: true, auto: false });
});

test('sans choix, la détection décide et le signale (message unique)', () => {
  assert.deepEqual(resolveLightMode(null, true), { enabled: true, auto: true });
  assert.deepEqual(resolveLightMode(null, false), { enabled: false, auto: false });
  assert.deepEqual(resolveLightMode('n_importe_quoi', false), { enabled: false, auto: false });
});
