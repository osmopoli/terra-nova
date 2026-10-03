import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breadcrumbTrail, isActivePath } from './breadcrumbs.js';

const labels = (trail) => trail.map((crumb) => crumb.label);

test("pas de fil d'Ariane sur l'accueil", () => {
  assert.deepEqual(breadcrumbTrail('/'), []);
});

test('rubrique puis détail', () => {
  assert.deepEqual(labels(breadcrumbTrail('/services')), ['Accueil', 'Services']);
  const trail = breadcrumbTrail('/services/etat-civil');
  assert.deepEqual(labels(trail), ['Accueil', 'Services', 'Détail']);
  assert.deepEqual(
    trail.map((crumb) => crumb.to),
    ['/', '/services', '/services/etat-civil'],
  );
});

test('les niveaux sans page sont ignorés', () => {
  assert.deepEqual(labels(breadcrumbTrail('/admin/alertes')), ['Accueil', 'Alertes']);
});

test('chemin inconnu', () => {
  assert.deepEqual(labels(breadcrumbTrail('/nimporte-quoi')), ['Accueil', 'Page introuvable']);
});

test('entrée de menu active sur la page et ses sous-pages', () => {
  assert.equal(isActivePath('/', '/'), true);
  assert.equal(isActivePath('/services', '/'), false);
  assert.equal(isActivePath('/services/etat-civil', '/services'), true);
  assert.equal(isActivePath('/servicesx', '/services'), false);
});
