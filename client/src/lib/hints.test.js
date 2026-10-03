import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isHintSeen, markHintSeen } from './hints.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
  };
}

test('une indication non fermée est affichée', () => {
  assert.equal(isHintSeen('accueil', memoryStorage()), false);
});

test('une indication fermée est mémorisée, sans toucher aux autres', () => {
  const storage = memoryStorage();
  markHintSeen('accueil', storage);
  markHintSeen('accueil', storage);
  assert.equal(isHintSeen('accueil', storage), true);
  assert.equal(isHintSeen('services', storage), false);
  assert.equal(storage.getItem('hints_seen'), '["accueil"]');
});

test('un stockage corrompu ne bloque pas l’affichage', () => {
  assert.equal(isHintSeen('accueil', memoryStorage({ hints_seen: '{oups' })), false);
});
