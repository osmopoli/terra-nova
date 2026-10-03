import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AGENT_NAV, CITIZEN_NAV, canUseAgentSpace, navFor } from './navigation.js';
import { SECTION_LABELS, breadcrumbTrail } from './breadcrumbs.js';

const paths = (items) => items.map((item) => item.to);
const citoyen = { role: 'citoyen' };
const agent = { role: 'agent' };
const admin = { role: 'admin' };

test('menu citoyen selon le rôle', () => {
  assert.deepEqual(paths(navFor(CITIZEN_NAV, null)), ['/', '/services', '/contact']);
  assert.deepEqual(paths(navFor(CITIZEN_NAV, citoyen)), ['/', '/services', '/contact']);
  assert.ok(paths(navFor(CITIZEN_NAV, agent)).includes('/agent'));
  assert.ok(paths(navFor(CITIZEN_NAV, admin)).includes('/agent'));
});

test("accès à l'espace agent", () => {
  assert.equal(canUseAgentSpace(null), false);
  assert.equal(canUseAgentSpace(citoyen), false);
  assert.equal(canUseAgentSpace(agent), true);
  assert.equal(canUseAgentSpace(admin), true);
});

test("chaque entrée de menu a le même libellé de rubrique dans le fil d'Ariane", () => {
  for (const item of [...CITIZEN_NAV, ...AGENT_NAV]) {
    if (item.to === '/') continue;
    assert.ok(SECTION_LABELS[item.to], `libellé manquant pour ${item.to}`);
    const trail = breadcrumbTrail(item.to);
    assert.equal(trail.at(-1).to, item.to);
  }
});

test('pas de doublon dans un même menu', () => {
  for (const items of [CITIZEN_NAV, AGENT_NAV]) {
    assert.equal(new Set(paths(items)).size, items.length);
  }
});
