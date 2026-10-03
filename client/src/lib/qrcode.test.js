import assert from 'node:assert/strict';
import { test } from 'node:test';
import { qrMatrix } from './qrcode.js';

// Lit les 15 bits de format (première copie) et retire le masque fixe 0x5412.
function formatBits(m) {
  const read = [];
  for (let i = 0; i <= 5; i++) read.push(m[i][8]);
  read.push(m[7][8], m[8][8], m[8][7]);
  for (let i = 9; i < 15; i++) read.push(m[8][14 - i]);
  return read.reduce((acc, dark, i) => acc | (Number(dark) << i), 0) ^ 0x5412;
}

test('taille de version adaptée au texte', () => {
  assert.equal(qrMatrix('HELLO').length, 21);
  const otpauth =
    'otpauth://totp/Terra%20Nova%3Aamina%40exemple.fr?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=Terra%20Nova&algorithm=SHA1&digits=6&period=30';
  const size = qrMatrix(otpauth).length;
  assert.ok(size >= 41 && size <= 57, `taille inattendue ${size}`);
});

test('motifs de repérage aux trois coins', () => {
  const m = qrMatrix('Terra Nova');
  const n = m.length;
  for (const [x0, y0] of [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ]) {
    assert.equal(m[y0][x0], true);
    assert.equal(m[y0 + 1][x0 + 1], false);
    assert.equal(m[y0 + 3][x0 + 3], true);
  }
  assert.equal(m[n - 8][8], true, 'module sombre obligatoire');
});

test('informations de format : niveau M, BCH valide, copies identiques', () => {
  const m = qrMatrix('otpauth://totp/x?secret=ABC');
  const bits = formatBits(m);
  assert.equal(bits >>> 13, 0, 'niveau de correction M');
  let rem = bits >>> 10;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  assert.equal(rem & 0x3ff, bits & 0x3ff);
  const n = m.length;
  for (let i = 0; i < 8; i++) assert.equal(m[8][n - 1 - i], m[i <= 5 ? i : i === 6 ? 7 : 8][8]);
});
