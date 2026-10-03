import { test } from 'node:test';
import assert from 'node:assert/strict';
import { co2Grams, formatKb, gradeTone, resourceKind, summarizeVisit } from './sobriety.js';

const perf = (navigation, resources) => ({
  getEntriesByType: (type) => (type === 'navigation' ? navigation : resources),
});

test('CO2 : environ 0,36 g par Mo transféré (Sustainable Web Design v3)', () => {
  assert.ok(Math.abs(co2Grams(1e6) - 0.358) < 0.001);
});

test('formats en Ko arrondis', () => {
  assert.equal(formatKb(150 * 1024), '150 Ko');
  assert.equal(formatKb(457), '457 octets');
  assert.equal(formatKb(0), '0 Ko');
});

test('la note est toujours accompagnée d’un mot', () => {
  assert.equal(gradeTone('A').word, 'sobre');
  assert.equal(gradeTone('E').word, 'moyen');
  assert.equal(gradeTone('G').word, 'lourd');
});

test('classe les ressources par nature', () => {
  assert.equal(resourceKind({ name: 'http://x/api/meta', entryType: 'resource' }), 'api');
  assert.equal(resourceKind({ name: 'https://fonts.gstatic.com/s/a.woff2' }), 'font');
  assert.equal(resourceKind({ name: 'http://x/assets/a-123.webp' }), 'image');
  assert.equal(resourceKind({ name: 'http://x/assets/index-1.js' }), 'script');
  assert.equal(resourceKind({ name: 'https://fonts.googleapis.com/css2?family=A' }), 'style');
});

test('résume la visite : transfert, cache et fichiers non mesurables', () => {
  const summary = summarizeVisit(
    perf(
      [{ name: 'http://x/', entryType: 'navigation', transferSize: 400, decodedBodySize: 900, domContentLoadedEventEnd: 120, loadEventEnd: 300 }],
      [
        { name: 'http://x/assets/index.js', transferSize: 80000, decodedBodySize: 290000 },
        { name: 'http://x/assets/index.css', transferSize: 0, decodedBodySize: 44000 },
        { name: 'https://ailleurs.test/a.js', transferSize: 0, decodedBodySize: 0 },
        { name: 'http://x/api/meta', transferSize: 800, decodedBodySize: 3000 },
      ],
    ),
  );
  assert.equal(summary.requests, 5);
  assert.equal(summary.transferred, 81200);
  assert.equal(summary.cached, 1);
  assert.equal(summary.unmeasured, 1);
  assert.equal(summary.byKind.api.transferred, 800);
  assert.equal(summary.domReady, 120);
});

test('sans Performance API : aucune mesure inventée', () => {
  assert.equal(summarizeVisit(undefined), null);
  assert.equal(summarizeVisit(perf([], [])), null);
});
