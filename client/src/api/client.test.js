import assert from 'node:assert/strict';
import { test } from 'node:test';

globalThis.localStorage = { getItem: () => null };
const { api } = await import('./client.js');

const respond = (status, text) => () => Promise.resolve(new Response(text, { status }));

async function errorOf(fetchImpl) {
  globalThis.fetch = fetchImpl;
  return api('/x').then(
    () => assert.fail('une erreur était attendue'),
    (error) => error,
  );
}

test('serveur injoignable : message français, pas « Failed to fetch »', async () => {
  const error = await errorOf(() => Promise.reject(new TypeError('Failed to fetch')));
  assert.equal(error.status, 0);
  assert.match(error.message, /Connexion au serveur impossible/);
});

test('erreur 500 : message générique, jamais le détail technique', async () => {
  const error = await errorOf(respond(500, '{"message":"ER_NO_SUCH_TABLE"}'));
  assert.match(error.message, /momentanément indisponible/);
});

test('page HTML au lieu de JSON : erreur lisible', async () => {
  const error = await errorOf(respond(200, '<html>proxy</html>'));
  assert.match(error.message, /momentanément indisponible/);
});

test('401 : session expirée', async () => {
  const error = await errorOf(respond(401, '{"errors":[{"message":"Unauthorized access"}]}'));
  assert.match(error.message, /session a expiré/);
});

test('erreur métier 409 : message de l’API conservé', async () => {
  const error = await errorOf(respond(409, '{"error":"Ce créneau est déjà pris."}'));
  assert.equal(error.message, 'Ce créneau est déjà pris.');
});

test('204 : null', async () => {
  globalThis.fetch = () => Promise.resolve(new Response(null, { status: 204 }));
  assert.equal(await api('/x'), null);
});
