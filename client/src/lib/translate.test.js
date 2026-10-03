import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translate, translateError } from './translate.js';

const fr = { hello: 'Bonjour {name}', only: 'Seulement en français' };
const en = {
  hello: 'Hello {name}',
  errors: { 'Au moins {n} caractères.': 'At least {n} characters.', 'Ce champ est obligatoire.': 'This field is required.' },
};

test('traduit une clé avec variables', () => {
  assert.equal(translate(en, fr, 'hello', { name: 'Amina' }), 'Hello Amina');
});

test('retombe sur le français puis sur la clé', () => {
  assert.equal(translate(en, fr, 'only'), 'Seulement en français');
  assert.equal(translate(en, fr, 'absent'), 'absent');
});

test('traduit un message d’erreur, nombres compris', () => {
  assert.equal(translateError(en, 'Ce champ est obligatoire.'), 'This field is required.');
  assert.equal(translateError(en, 'Au moins 8 caractères.'), 'At least 8 characters.');
});

test('laisse intact un message inconnu ou une langue sans table', () => {
  assert.equal(translateError(en, 'Message inattendu.'), 'Message inattendu.');
  assert.equal(translateError(fr, 'Au moins 8 caractères.'), 'Au moins 8 caractères.');
  assert.equal(translateError(en, undefined), undefined);
});
