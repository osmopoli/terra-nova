// Tests d'intégration sur une base MySQL dédiée (DB_TEST_NAME, défaut terranova_test), vidée à chaque lancement.
process.env.DB_NAME = process.env.DB_TEST_NAME || 'terranova_test';
delete process.env.DATABASE_URL;
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'admin-test-1234';
process.env.AGENT_EMAIL = 'agent@test.local';
process.env.AGENT_PASSWORD = 'agent-test-1234';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const db = require('../src/db');
const webcup = require('../src/webcup');
const { app, prepare } = require('../server');

let server;
let base;

before(async () => {
  await db.init();
  for (const t of ['sessions', 'messages', 'news', 'api_events', 'api_requests', 'services', 'users']) await db.run(`DELETE FROM ${t}`);
  await prepare();
  await webcup.ingest(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'initial-requests.json'), 'utf8')));
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await db.close();
});

const form = (data) => new URLSearchParams(data).toString();
async function req(url, { cookie, body, json, method } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (body) headers['content-type'] = 'application/x-www-form-urlencoded';
  if (json) headers['content-type'] = 'application/json';
  return fetch(base + url, { method: method || (body || json ? 'POST' : 'GET'), headers, body: body ? form(body) : json ? JSON.stringify(json) : undefined, redirect: 'manual' });
}
async function login(email, password) {
  const res = await req('/connexion', { body: { email, password } });
  assert.equal(res.status, 302);
  return res.headers.get('set-cookie').split(';')[0];
}

test('santé : la base MySQL répond', async () => {
  const res = await req('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok', database: 'up' });
});

test('pages publiques et contenus de départ', async () => {
  for (const url of ['/', '/services', '/services/etat-civil', '/actualites', '/contact', '/connexion', '/inscription']) {
    assert.equal((await req(url)).status, 200, url);
  }
  assert.match(await (await req('/services')).text(), /État civil/);
  assert.equal((await req('/services/inconnu')).status, 404);
});

test('D01/D03/D04/F22 : inscription, contact, traitement par un agent, suivi par l’habitant', async () => {
  const bad = await req('/inscription', { body: { name: '', email: 'x', password: '123', password2: '456' } });
  assert.equal(bad.status, 400);

  const signup = await req('/inscription', { body: { name: 'Léa Citoyenne', email: 'lea@test.local', password: 'motdepasse', password2: 'motdepasse' } });
  assert.equal(signup.status, 302);
  assert.equal(signup.headers.get('location'), '/espace?bienvenue=1');
  const lea = signup.headers.get('set-cookie').split(';')[0];
  assert.equal((await req('/inscription', { body: { name: 'Doublon', email: 'LEA@test.local', password: 'motdepasse', password2: 'motdepasse' } })).status, 400);

  const sent = await req('/contact', { cookie: lea, body: { name: 'Léa Citoyenne', email: 'lea@test.local', service_slug: 'voirie', subject: 'Nid-de-poule', body: 'Un trou rue des Lilas depuis une semaine.' } });
  assert.equal(sent.status, 302);
  const ref = sent.headers.get('location').split('/').pop();
  assert.match(ref, /^TN-\d{4}-[0-9A-F]{6}$/);
  assert.match(await (await req(`/contact/confirmation/${ref}`)).text(), new RegExp(ref));

  const agent = await login('agent@test.local', 'agent-test-1234');
  assert.match(await (await req('/agent', { cookie: agent })).text(), new RegExp(ref));
  const { id } = await db.get('SELECT id FROM messages WHERE reference = ?', [ref]);
  assert.equal((await req(`/agent/demandes/${id}`, { cookie: agent, body: { status: 'traite', agent_note: 'Rebouché ce matin.' } })).status, 302);

  const espace = await (await req('/espace', { cookie: lea })).text();
  assert.match(espace, /Rebouché ce matin\./);
  assert.match(espace, /Traitée/);
});

test('D09 : contrôle d’accès par profil', async () => {
  assert.equal((await req('/agent')).status, 302);
  assert.equal((await req('/api/webcup/state')).status, 401);

  const citoyen = await login('lea@test.local', 'motdepasse');
  for (const url of ['/agent', '/admin', '/veille', '/actualites/publier']) assert.equal((await req(url, { cookie: citoyen })).status, 403, url);
  assert.equal((await req('/api/webcup/state', { cookie: citoyen })).status, 403);

  const agent = await login('agent@test.local', 'agent-test-1234');
  assert.equal((await req('/admin', { cookie: agent })).status, 403);
  assert.equal((await req('/veille', { cookie: agent })).status, 200);
});

test('D06 : publication réservée aux agents', async () => {
  const agent = await login('agent@test.local', 'agent-test-1234');
  const res = await req('/actualites', { cookie: agent, body: { title: 'Fermeture exceptionnelle', category: 'Annonce', summary: 'Mairie fermée lundi.', body: 'Pont du 1er mai.' } });
  assert.equal(res.status, 302);
  assert.match(await (await req(res.headers.get('location'))).text(), /Fermeture exceptionnelle/);
});

test('D08 : un admin change le profil d’un compte, ce qui ferme ses sessions', async () => {
  const citoyen = await login('lea@test.local', 'motdepasse');
  const admin = await login('admin@test.local', 'admin-test-1234');
  const { id } = await db.get('SELECT id FROM users WHERE email = ?', ['lea@test.local']);
  assert.equal((await req(`/admin/users/${id}/role`, { cookie: admin, body: { role: 'agent' } })).status, 302);
  assert.equal((await req('/espace', { cookie: citoyen })).status, 302); // session supprimée
  const promue = await login('lea@test.local', 'motdepasse');
  assert.equal((await req('/agent', { cookie: promue })).status, 200);
});

test('D19 : état et journal de l’API Nova Terra, sans fuite de clé', async () => {
  const agent = await login('agent@test.local', 'agent-test-1234');
  const state = await (await req('/api/webcup/state', { cookie: agent })).json();
  assert.ok(state.requests.length > 0);
  assert.ok(!JSON.stringify(state).includes('X-Webcup-Api-Key'));
  const code = state.requests[0].request_code;
  assert.equal((await req(`/api/webcup/${code}/done`, { cookie: agent, json: { done: true } })).status, 200);
  assert.equal((await req('/api/webcup/INCONNU/done', { cookie: agent, json: { done: true } })).status, 404);
  const events = await (await req('/api/webcup/events', { cookie: agent })).json();
  assert.ok(events.events.some((e) => e.kind === 'nouvelle'));
  assert.equal(events.request_count, state.requests.length);
});

test('WEBC-2 : demandes synchronisées, session et indicateur « nouvelle »', async () => {
  assert.equal((await req('/api/webcup/requests')).status, 401);
  const signup = await req('/inscription', { body: { name: 'Tom Citoyen', email: 'tom@test.local', password: 'motdepasse', password2: 'motdepasse' } });
  const citoyen = signup.headers.get('set-cookie').split(';')[0];
  assert.equal((await req('/api/webcup/requests', { cookie: citoyen })).status, 403);
  assert.equal((await req('/api/webcup/requests/seen', { cookie: citoyen, json: {} })).status, 403);

  const agent = await login('agent@test.local', 'agent-test-1234');
  assert.equal((await req('/api/webcup/requests?only_new=peut-etre', { cookie: agent })).status, 422);
  const data = await (await req('/api/webcup/requests', { cookie: agent })).json();
  assert.ok(data.requests.length > 0);
  assert.equal(new Set(data.requests.map((r) => r.request_code)).size, data.requests.length);
  assert.ok(data.poll_interval_seconds >= 15 && data.poll_interval_seconds <= 30);
  assert.ok('current_wave' in data.session && 'minutes_until_next_wave' in data.session);
  assert.ok(!JSON.stringify(data).includes('X-Webcup-Api-Key'));

  // Ré-ingérer les mêmes données ne crée aucun doublon ; une demande inconnue arrive marquée « nouvelle ».
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'initial-requests.json'), 'utf8'));
  const [code] = data.requests.map((r) => r.request_code);
  assert.equal((await req('/api/webcup/requests/seen', { cookie: agent, json: { codes: 'D01' } })).status, 422);
  assert.ok((await (await req('/api/webcup/requests/seen', { cookie: agent, json: {} })).json()).marked > 0);
  await webcup.ingest({ ...fixture, requests: [...fixture.requests, { ...fixture.requests[0], request_code: 'TEST99' }] });
  const after = await (await req('/api/webcup/requests?only_new=true', { cookie: agent })).json();
  assert.deepEqual(after.requests.map((r) => r.request_code), ['TEST99']);
  assert.equal(after.new_count, 1);
  assert.equal((await db.get('SELECT COUNT(*) n FROM api_requests')).n, data.requests.length + 1);
  assert.deepEqual(await (await req('/api/webcup/requests/seen', { cookie: agent, json: { codes: ['TEST99', code] } })).json(), { marked: 1 });
  assert.equal((await (await req('/api/webcup/requests', { cookie: agent })).json()).new_count, 0);
});
