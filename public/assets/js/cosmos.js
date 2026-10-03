/* Terra Nova — ciel étoilé (étoiles scintillantes + étoile filante) et planète Nova qui tourne.
   Canvas 2D léger, 30 i/s, en pause quand l'onglet est caché ; image fixe si « réduire les animations ». */
(function () {
  'use strict';
  const calme = () => document.documentElement.classList.contains('calme') || matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ciel ---------- */
  function ciel(canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, etoiles = [], filante = null, prochaine = performance.now() + 2500;
    function taille() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      etoiles = Array.from({ length: Math.round(w * h / 5200) }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + .2,
        p: Math.random() * Math.PI * 2, v: .6 + Math.random() * 1.6, teinte: Math.random() < .15 ? '200,180,255' : Math.random() < .3 ? '170,235,255' : '255,255,255'
      }));
    }
    function dessiner(t) {
      ctx.clearRect(0, 0, w, h);
      for (const e of etoiles) {
        const a = calme() ? .7 : .35 + .65 * (.5 + .5 * Math.sin(e.p + t / 1000 * e.v));
        ctx.fillStyle = `rgba(${e.teinte},${a})`;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
      }
      if (calme()) return;
      if (!filante && t > prochaine) {
        filante = { x: Math.random() * w * .7 + w * .2, y: Math.random() * h * .35, vx: -6 - Math.random() * 3, vy: 2.2 + Math.random() * 1.5, vie: 0 };
      }
      if (filante) {
        const f = filante; f.vie++;
        const g = ctx.createLinearGradient(f.x, f.y, f.x - f.vx * 14, f.y - f.vy * 14);
        g.addColorStop(0, 'rgba(232,251,255,.95)'); g.addColorStop(1, 'rgba(121,230,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x - f.vx * 14, f.y - f.vy * 14); ctx.stroke();
        f.x += f.vx; f.y += f.vy;
        if (f.vie > 70 || f.x < -50 || f.y > h) { filante = null; prochaine = t + 5000 + Math.random() * 7000; }
      }
    }
    taille(); addEventListener('resize', taille);
    return dessiner;
  }

  /* ---------- Planète ---------- */
  function planete(canvas) {
    const ctx = canvas.getContext('2d');
    // Texture procédurale (bruit fractal) : océans indigo, plateaux bleus, glaces cyan, calottes
    const TW = 512, TH = 256, tex = document.createElement('canvas');
    tex.width = TW * 2; tex.height = TH;
    (function texture() {
      const c = tex.getContext('2d'), img = c.createImageData(TW, TH);
      // graine fixe : la même planète à chaque visite
      const alea = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + 1442695041; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
      const lisse = t => t * t * (3 - 2 * t);
      function bruit(x, y, per) {
        const x0 = Math.floor(x), y0 = Math.floor(y), fx = lisse(x - x0), fy = lisse(y - y0);
        const g = (a, b) => alea(((a % per) + per) % per, b);
        const h0 = g(x0, y0) + (g(x0 + 1, y0) - g(x0, y0)) * fx, h1 = g(x0, y0 + 1) + (g(x0 + 1, y0 + 1) - g(x0, y0 + 1)) * fx;
        return h0 + (h1 - h0) * fy;
      }
      const pal = [[0, [9, 13, 64]], [.42, [20, 32, 118]], [.52, [44, 78, 190]], [.6, [64, 140, 222]], [.7, [121, 230, 255]], [.82, [150, 130, 255]], [1, [232, 251, 255]]];
      const couleur = v => { for (let i = 1; i < pal.length; i++) if (v <= pal[i][0]) { const [a, ca] = pal[i - 1], [b, cb] = pal[i], k = (v - a) / (b - a); return ca.map((x, j) => x + (cb[j] - x) * k); } return pal[pal.length - 1][1]; };
      for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
        let v = 0, amp = .55, fr = 1 / 64, per = TW / 64;
        for (let o = 0; o < 5; o++) { v += bruit(x * fr, y * fr, per) * amp; amp *= .5; fr *= 2; per *= 2; }
        const lat = Math.abs(y / TH - .5) * 2;               // calottes polaires
        v = Math.min(1, v + Math.pow(lat, 8) * .3);
        const [r, g, b] = couleur(v), i = (y * TW + x) * 4;
        img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
      }
      c.putImageData(img, 0, 0); c.putImageData(img, TW, 0);   // deux fois : défilement sans couture
    })();

    let taillePx = 0;
    function taille() {
      const echelle = Math.min(devicePixelRatio || 1, 1.5) * .6;   // rendu adouci = moins coûteux
      taillePx = canvas.clientWidth;
      canvas.width = canvas.height = Math.max(200, Math.round(taillePx * echelle));
    }
    function dessiner(t) {
      const S = canvas.width, cx = S / 2, cy = S / 2, R = S * .44;
      ctx.clearRect(0, 0, S, S);
      // atmosphère extérieure
      const atmo = ctx.createRadialGradient(cx, cy, R * .96, cx, cy, R * 1.12);
      atmo.addColorStop(0, 'rgba(121,230,255,.55)'); atmo.addColorStop(.35, 'rgba(121,230,255,.18)'); atmo.addColorStop(1, 'rgba(157,123,255,0)');
      ctx.fillStyle = atmo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2); ctx.fill();
      // surface qui tourne
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      const hT = R * 2, wT = hT * 2, dec = calme() ? 0 : ((t / 1000) * (wT / 240)) % wT;   // un tour en 4 min
      ctx.drawImage(tex, 0, 0, TW, TH, cx - R - dec, cy - R, wT, hT);
      ctx.drawImage(tex, 0, 0, TW, TH, cx - R - dec + wT, cy - R, wT, hT);
      // relief sphérique : limbe sombre + lumière venant du haut-gauche
      // seule la calotte est visible : lumière venant du haut, assombrissement vers le bas
      const limbe = ctx.createRadialGradient(cx, cy - R * .2, R * .5, cx, cy, R);
      limbe.addColorStop(0, 'rgba(7,10,31,.05)'); limbe.addColorStop(.85, 'rgba(7,10,31,.25)'); limbe.addColorStop(1, 'rgba(7,10,31,.6)');
      ctx.fillStyle = limbe; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      const jour = ctx.createLinearGradient(0, cy - R, 0, cy - R * .55);
      jour.addColorStop(0, 'rgba(190,245,255,.14)'); jour.addColorStop(1, 'rgba(190,245,255,0)');
      ctx.fillStyle = jour; ctx.fillRect(cx - R, cy - R, R * 2, R * .45);
      ctx.restore();
      // liseré lumineux
      ctx.strokeStyle = 'rgba(190,245,255,.55)'; ctx.lineWidth = Math.max(1, S / 700);
      ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    }
    taille(); addEventListener('resize', taille);
    return dessiner;
  }

  /* ---------- Boucle commune ---------- */
  const scenes = [];
  document.querySelectorAll('canvas[data-cosmos="ciel"]').forEach(c => scenes.push(ciel(c)));
  document.querySelectorAll('canvas[data-cosmos="planete"]').forEach(c => scenes.push(planete(c)));
  if (!scenes.length) return;
  let dernier = 0;
  function boucle(t) {
    if (!document.hidden && t - dernier > 33) { dernier = t; scenes.forEach(d => d(t)); }
    if (!calme()) requestAnimationFrame(boucle);
  }
  scenes.forEach(d => d(0));
  requestAnimationFrame(boucle);
  window.NT = window.NT || {};
  NT.relancerCosmos = () => requestAnimationFrame(boucle);
})();
