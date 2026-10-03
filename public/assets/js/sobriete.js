/* F57 — sobriété numérique : chiffres du serveur (/api/sobriete) + mesures du navigateur (Performance API). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: {},
    en: {
      'sob.titre': 'Digital sobriety', 'sob.sous': 'A website uses energy every time it is visited. Here is what Terra Nova weighs, what that means in CO2, and what we did to make it lighter without removing the essentials.',
      'sob.chiffres': 'The home page in 4 numbers', 'sob.chiffresD': 'For a first visit, with nothing stored in your browser.',
      'sob.cPoids': 'of data transferred', 'sob.cRequetes': 'files requested (requests)', 'sob.cCo2': 'of CO2 estimated per visit', 'sob.cNote': 'grade from A (very light) to G (very heavy)',
      'sob.erreur': 'The assessment could not be loaded. Please try again in a moment.',
      'sob.methode': 'How it is calculated',
      'sob.m1': 'Weight and number of files: the server reads the files actually sent (text compressed with Brotli, images as they are).',
      'sob.m2': 'Fonts and icons hosted elsewhere: a fixed estimate, because they cannot be weighed from the server.',
      'sob.m3': 'CO2: the “Sustainable Web Design” model, which counts 0.81 kWh of electricity per GB transferred and 442 g of CO2 per kWh (world average), about 0.36 g of CO2 per MB. It is an order of magnitude, not an exact measure.',
      'sob.m4': 'Grade: our own calculation inspired by EcoIndex, based on weight and number of requests. It is not the official EcoIndex grade.',
      'sob.pages': 'The main pages', 'sob.pagesCap': 'Estimated weight, number of requests and grade of each main page, on first load',
      'sob.tPage': 'Page', 'sob.tPoids': 'Weight (KB)', 'sob.tReq': 'Requests', 'sob.tNote': 'Grade', 'sob.chargement': 'Loading…',
      'sob.resume': 'Average over {n} pages: {poids} KB, {req} requests, about {co2} g of CO2 per visit, grade {note}.',
      'sob.note.bon': 'light', 'sob.note.moyen': 'average', 'sob.note.mauvais': 'heavy', 'sob.noteDe': 'Grade {n}, {mot}',
      'sob.visite': 'Measured on this visit', 'sob.visiteD': 'These figures come from your browser, for the page you are reading now.',
      'sob.vPoids': 'Data transferred', 'sob.vReq': 'Files loaded', 'sob.vDom': 'Page readable after', 'sob.vLoad': 'Fully loaded after',
      'sob.cache': 'A page you have already visited is lighter: your browser keeps the files that do not change and does not download them again. Reload this page to compare.',
      'sob.depuisCache': 'from memory', 'sob.nonDispo': 'not available',
      'sob.faits': 'What we did to make the platform lighter',
      'sob.f1': 'Home image re-encoded in WebP in 3 sizes (480, 800 and 1280 px) with srcset: the browser picks the right one, from 416 KB down to just 18 to 149 KB.',
      'sob.f2': 'Logo emblem: from 126 KB to 3 KB.', 'sob.f3': '6 unused images and scripts removed.',
      'sob.f4': 'Text files compressed (Brotli or gzip) and kept in memory by the browser.',
      'sob.f5': 'Fonts loaded without blocking display, and not loaded at all in light mode.',
      'sob.f6': '“Slow connection mode”: no decorative images or animations, system fonts, live updates every 2 minutes instead of 30 seconds. It is offered automatically when the browser reports a slow connection or data saver.',
      'sob.f7': 'Live updates paused when the tab is hidden.', 'sob.f8': 'Server responses (page data) compressed, and unchanged files never sent again: the browser reuses its copy.',
      'sob.gestes': 'What you can do',
      'sob.g1': 'Prefer Wi-Fi to 4G or 5G when you can: for the same data, it uses less energy.',
      'sob.g2': 'Bookmark the pages you use often rather than searching for them each time.', 'sob.g3': 'Close the tabs you are no longer reading.',
      'sob.p.index.html': 'Home', 'sob.p.services.html': 'Services', 'sob.p.carte.html': 'Map', 'sob.p.annonces.html': 'Announcements', 'sob.p.demande.html': 'Make a request', 'sob.p.connexion.html': 'Log in', 'sob.p.espace.html': 'My space', 'sob.p.agent.html': 'Agent space', 'sob.p.transports.html': 'Transport',
      'sob.reglage': 'To turn on “Slow connection mode” at any time, open the ♿ (accessibility) panel in the header of any page.'
    },
    es: {}, ar: {}
  });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = (sel, r) => (r || document).querySelector(sel);
  const LIEUX = { 'index.html': 'Accueil', 'services.html': 'Services', 'carte.html': 'Carte', 'annonces.html': 'Annonces', 'demande.html': 'Faire une demande',
    'connexion.html': 'Connexion', 'espace.html': 'Mon espace', 'agent.html': 'Espace agent', 'transports.html': 'Transports' };
  const nf = n => new Intl.NumberFormat(NT.i18n.langue).format(n);
  const nf2 = n => new Intl.NumberFormat(NT.i18n.langue, { maximumFractionDigits: 2 }).format(n);
  const ko = octets => nf(Math.round(octets / 1024)) + ' ' + L('sob.unKo', 'Ko');
  const ms = v => v >= 1000 ? nf2(v / 1000) + ' s' : nf(Math.round(v)) + ' ms';
  const classeNote = n => 'ABC'.includes(n) ? 'bon' : 'DE'.includes(n) ? 'moyen' : 'mauvais';
  const motNote = n => ({ bon: L('sob.note.bon', 'sobre'), moyen: L('sob.note.moyen', 'moyen'), mauvais: L('sob.note.mauvais', 'lourd') })[classeNote(n)];
  const fixer = (zone, cle, txt) => { const el = $('[data-k="' + cle + '"]', zone); if (el) el.textContent = txt; };

  NT.i18n.ajouter({ fr: {}, en: { 'sob.unKo': 'KB' }, es: {}, ar: {} });
  NT.i18n.ajouter({ fr: { 'sob.note.bon': 'sobre', 'sob.note.moyen': 'moyen', 'sob.note.mauvais': 'lourd', 'sob.noteDe': 'Note {n}, {mot}',
    'sob.resume': 'Moyenne sur {n} pages : {poids} Ko, {req} requêtes, environ {co2} g de CO2 par visite, note {note}.',
    'sob.depuisCache': 'depuis la mémoire', 'sob.nonDispo': 'non disponible', 'sob.unKo': 'Ko' } });

  const noteHtml = n => `<span class="note note-${classeNote(n)}"><b aria-hidden="true">${E(n)}</b><span>${E(L('sob.noteDe', 'Note {n}, {mot}', { n, mot: motNote(n) }))}</span></span>`;

  /* ---------- Chiffres du serveur ---------- */
  function afficherServeur(d) {
    const zone = $('#chiffres');
    const a = d.accueil;
    fixer(zone, 'poids', ko(a.poidsKo * 1024));
    fixer(zone, 'requetes', nf(a.requetes));
    fixer(zone, 'co2', nf2(a.co2G) + ' g');
    fixer(zone, 'note', a.note);
    const maxKo = Math.max.apply(null, d.pages.map(p => p.poidsTotalKo));
    $('#corps-pages').innerHTML = d.pages.map(p => `<tr>
      <th scope="row">${E(L('sob.p.' + p.page, LIEUX[p.page] || p.page))}</th>
      <td class="num">${E(nf(p.poidsTotalKo))}<span class="barre" aria-hidden="true"><i style="width:${Math.max(4, Math.round(p.poidsTotalKo / maxKo * 100))}%"></i></span></td>
      <td class="num">${E(nf(p.requetes))}</td>
      <td>${noteHtml(p.note)}</td></tr>`).join('');
    const r = d.resume;
    $('#resume-pages').textContent = L('sob.resume', 'Moyenne sur {n} pages : {poids} Ko, {req} requêtes, environ {co2} g de CO2 par visite, note {note}.',
      { n: r.pages, poids: nf(r.poidsMoyenKo), req: nf(r.requetesMoyennes), co2: nf2(r.co2MoyenG), note: r.note });
  }

  /* ---------- Mesures du navigateur (Performance API) ---------- */
  function mesurerVisite() {
    const zone = $('#mesures');
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const absent = L('sob.nonDispo', 'non disponible');
    let octets = (nav && nav.transferSize) || 0;
    let nbCache = nav && nav.transferSize === 0 ? 1 : 0;
    res.forEach(r => { octets += r.transferSize || 0; if (r.transferSize === 0) nbCache++; });
    // Les ressources d'autres sites sans en-tête Timing-Allow-Origin déclarent 0 : on le dit plutôt que de le cacher.
    const total = res.length + (nav ? 1 : 0);
    fixer(zone, 'poids', nav ? ko(octets) : absent);
    fixer(zone, 'req', nav ? nf(total) + (nbCache ? ' (' + nf(nbCache) + ' ' + L('sob.depuisCache', 'depuis la mémoire') + ')' : '') : absent);
    fixer(zone, 'dom', nav && nav.domContentLoadedEventEnd ? ms(nav.domContentLoadedEventEnd) : absent);
    fixer(zone, 'load', nav && nav.loadEventEnd ? ms(nav.loadEventEnd) : absent);
  }

  NT.pret(() => {
    // Les mesures utilisent loadEventEnd : on attend la fin du chargement.
    const lancer = () => setTimeout(mesurerVisite, 0);
    if (document.readyState === 'complete') lancer(); else window.addEventListener('load', lancer);
    fetch('/api/sobriete').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(afficherServeur)
      .catch(() => {
        $('#erreur-sob').hidden = false;
        $('#corps-pages').innerHTML = '';
        $('#chiffres').querySelectorAll('[data-k]').forEach(el => { el.textContent = '—'; });
      });
  });
})();
