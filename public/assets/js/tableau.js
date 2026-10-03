/* Terra Nova — F50 : tableau de bord simplifié des agents.
   Données : GET /api/indicateurs (agrégats serveur) + demandes du store (attente par quartier) + GET /api/contributions.
   Graphiques en SVG fait main, valeurs écrites, motifs + couleurs, tableaux de données équivalents. */
(function () {
  'use strict';
  const NT = window.NT;

  NT.i18n.ajouter({
    en: {
      'tb.titre': 'Dashboard', 'tb.intro': 'Platform activity at a glance: what needs action, what is moving and what deserves your attention.',
      'tb.actualiser': 'Refresh', 'tb.chargement': 'Loading indicators…', 'tb.essentiel': 'The essentials today', 'tb.surveiller': 'To watch',
      'tb.graphes': 'Activity and breakdown', 'tb.voirDonnees': 'View the data', 'tb.retour': 'Back to the staff area',
      'tb.k.attente': 'Requests waiting to be handled', 'tb.k.attenteCta': 'Handle them now',
      'tb.k.urgentes': 'Urgent requests not yet resolved', 'tb.k.urgentesCta': 'See the requests',
      'tb.k.delai': 'Average handling time', 'tb.k.delaiCta': 'See resolved requests', 'tb.k.delaiAucun': 'No request resolved yet',
      'tb.k.traitees': 'Requests resolved', 'tb.k.traiteesCta': 'See resolved requests',
      'tb.k.rdv': 'Upcoming appointments', 'tb.k.rdvCta': 'Open appointments', 'tb.k.alertes': 'Active alerts', 'tb.k.alertesCta': 'Manage alerts',
      'tb.h': 'h', 'tb.j': 'days',
      'tb.maj': 'Last update: {h}', 'tb.majEchec': 'Last successful update: {h}', 'tb.majJamais': 'Not updated yet',
      'tb.live': 'Dashboard updated at {h}.', 'tb.erreur': 'The indicators could not be loaded. Next attempt in 60 seconds.',
      'tb.erreurAnciennes': 'The figures shown date from {h}.', 'tb.erreurDroits': 'Your session no longer allows access to the indicators. Please sign in again.',
      'tb.w.niveauAlerte': 'Priority', 'tb.w.niveauAttention': 'Attention', 'tb.w.niveauInfo': 'For information',
      'tb.w.urgentes1': '{n} urgent request is not resolved yet.', 'tb.w.urgentesN': '{n} urgent requests are not resolved yet.', 'tb.w.urgentesLien': 'Handle urgent requests',
      'tb.w.quartier1': 'District {q}: {n} request waiting, the most of any district.', 'tb.w.quartierN': 'District {q}: {n} requests waiting, the most of any district.', 'tb.w.quartierLien': 'See waiting requests',
      'tb.w.service': 'Most requested service: {s} ({n} requests, {p}% of the total).', 'tb.w.serviceLien': 'See all requests',
      'tb.w.contrib1': '{n} data contribution is waiting for an answer.', 'tb.w.contribN': '{n} data contributions are waiting for an answer.', 'tb.w.contribLien': 'Open the contributions',
      'tb.w.anciennes1': '{n} request has been waiting for more than 2 days.', 'tb.w.anciennesN': '{n} requests have been waiting for more than 2 days.', 'tb.w.anciennesLien': 'Handle the oldest requests',
      'tb.w.delai': 'Average handling time is {d}: above 48 hours.', 'tb.w.delaiLien': 'See resolved requests',
      'tb.w.rien': 'Nothing unusual to report. Waiting requests are under control.',
      'tb.gJour': 'Activity over the last 14 days', 'tb.gJourAide': 'Requests created and requests resolved, day by day.',
      'tb.creees': 'Created', 'tb.traitees': 'Resolved', 'tb.jour': 'Day', 'tb.gJourDesc': 'Bar chart: requests created and resolved per day over the last 14 days.',
      'tb.gQuartier': 'Requests by district', 'tb.gQuartierAide': 'All requests, with the share still waiting.',
      'tb.total': 'Total', 'tb.enAttente': 'Waiting', 'tb.quartier': 'District', 'tb.dont': '{n} waiting',
      'tb.gService': 'Most requested services', 'tb.gServiceAide': 'The 6 services receiving the most requests.', 'tb.service': 'Service', 'tb.demandes': 'Requests',
      'tb.gStatut': 'Breakdown by status', 'tb.gStatutAide': 'Where all the requests stand.', 'tb.statut': 'Status',
      'tb.aucune': 'No data yet.', 'tb.nonPrecise': 'Not specified', 'tb.part': 'Share'
    },
    es: { 'tb.titre': 'Panel de control', 'tb.actualiser': 'Actualizar', 'tb.essentiel': 'Lo esencial hoy', 'tb.surveiller': 'A vigilar' }
  });

  const A = NT.agent, T = A.T, e = NT.ui.echap;
  const el = id => document.getElementById(id);
  const P = (cle, n, fr1, frn, vars) => T(cle + (n > 1 ? 'N' : '1'), n > 1 ? frn : fr1, Object.assign({ n }, vars || {}));

  const STATUTS = [
    ['recue', 'm-points-soleil', 'var(--soleil)'],
    ['en_cours', 'm-hach-iono', 'var(--iono)'],
    ['traitee', 'm-plein-calme', 'var(--calme)'],
    ['cloturee', 'm-hach-calme', 'var(--calme)']
  ];

  let ind = null, dernierJson = '', majLe = null, enCours = false, echec = false;
  const nf = n => Number(n || 0).toLocaleString(NT.i18n.langue === 'fr' ? 'fr-FR' : undefined);
  const lib = (k) => (k === 'non précisé' ? T('tb.nonPrecise', 'Non précisé') : k);
  const nomService = id => { const s = id && id !== 'non précisé' ? NT.services.get(id) : null; return s ? NT.i18n.choisir(s.nom) : lib(id); };
  const trier = obj => Object.entries(obj || {}).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));

  function duree(h) {
    if (h === null || h === undefined) return null;
    if (h < 48) return { n: nf(h), u: T('tb.h', 'h') };
    return { n: (h / 24).toLocaleString(NT.i18n.langue === 'fr' ? 'fr-FR' : undefined, { maximumFractionDigits: 1 }), u: T('tb.j', 'jours') };
  }

  /* ---------- Éléments de graphique ---------- */
  const legende = (cible, items) => {
    el(cible).innerHTML = items.map(([motif, texte]) =>
      `<li><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><rect width="12" height="12" fill="url(#${motif})"/></svg><span>${e(texte)}</span></li>`).join('');
  };
  const tableau = (cible, caption, entetes, lignes) => {
    el(cible).innerHTML = `<table><caption class="sr-only">${e(caption)}</caption><thead><tr>${entetes.map(h => `<th scope="col">${e(h)}</th>`).join('')}</tr></thead>
      <tbody>${lignes.map(l => `<tr><th scope="row">${e(l[0])}</th>${l.slice(1).map(c => `<td class="num">${e(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  };
  /* Barres horizontales : [{nom, valeur, texteValeur, motif, sur (valeur secondaire en motif2)}] */
  function barresH(cible, lignes, max) {
    if (!lignes.length) { el(cible).innerHTML = `<p class="doux">${e(T('tb.aucune', 'Pas encore de données.'))}</p>`; return; }
    el(cible).innerHTML = '<ul class="tb-barres">' + lignes.map(l => {
      const w = Math.max(l.valeur > 0 ? 1.5 : 0, (l.valeur / max) * 100), w2 = l.sur ? (l.sur.valeur / max) * 100 : 0;
      return `<li><div class="tb-ligne"><span class="nom">${e(l.nom)}</span><span class="val">${e(l.valeurTexte)}${l.complement ? ` <small>${e(l.complement)}</small>` : ''}</span></div>
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <rect x="0" y="0" width="${w.toFixed(2)}" height="10" fill="url(#${l.motif})"/>
          ${w2 ? `<rect x="0" y="2" width="${w2.toFixed(2)}" height="6" fill="url(#${l.sur.motif})" stroke="var(--givre)" stroke-width=".6" vector-effect="non-scaling-stroke"/>` : ''}
        </svg></li>`;
    }).join('') + '</ul>';
  }

  /* ---------- Graphique 1 : 14 jours (barres verticales) ---------- */
  function graphJour() {
    const jours = Object.keys(ind.parJour).sort();
    const max = Math.max(4, ...jours.map(j => Math.max(ind.parJour[j].creees, ind.parJour[j].traitees)));
    const haut = max % 2 ? max + 1 : max;
    const L = 34, R = 696, H = 190, Y0 = 22, larg = (R - L) / jours.length, bw = 16;
    const y = v => Y0 + H - (v / haut) * H;
    const fmtJ = j => new Date(j + 'T12:00:00').toLocaleDateString(NT.i18n.langue === 'fr' ? 'fr-FR' : undefined, { day: '2-digit', month: '2-digit' });
    const fmtS = j => new Date(j + 'T12:00:00').toLocaleDateString(NT.i18n.langue === 'fr' ? 'fr-FR' : undefined, { weekday: 'short' });
    let s = `<svg viewBox="0 0 700 250" role="img" aria-label="${e(T('tb.gJourDesc', 'Histogramme : demandes créées et traitées par jour sur les 14 derniers jours.'))}" focusable="false">`;
    [0, haut / 2, haut].forEach(v => { s += `<line class="${v === 0 ? 'tb-axe' : 'tb-grille'}" x1="${L}" x2="${R}" y1="${y(v)}" y2="${y(v)}"/><text class="tb-t-lab" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; });
    jours.forEach((j, i) => {
      const d = ind.parJour[j], x0 = L + i * larg + (larg - 2 * bw - 3) / 2;
      [[d.creees, 'm-plein-iono'], [d.traitees, 'm-hach-calme']].forEach(([v, motif], k) => {
        const x = x0 + k * (bw + 3);
        if (v > 0) s += `<rect x="${x}" y="${y(v)}" width="${bw}" height="${Y0 + H - y(v)}" fill="url(#${motif})" stroke="${k ? 'var(--calme)' : 'var(--iono)'}" stroke-width="1"/>`;
        s += `<text class="tb-t-val" x="${x + bw / 2}" y="${y(v) - 4}" text-anchor="middle">${v}</text>`;
      });
      s += `<text class="tb-t-lab" x="${L + i * larg + larg / 2}" y="${Y0 + H + 16}" text-anchor="middle">${e(fmtS(j))}</text><text class="tb-t-lab" x="${L + i * larg + larg / 2}" y="${Y0 + H + 30}" text-anchor="middle">${e(fmtJ(j))}</text>`;
    });
    el('g-jour').innerHTML = s + '</svg>';
    legende('g-jour-leg', [['m-plein-iono', T('tb.creees', 'Créées')], ['m-hach-calme', T('tb.traitees', 'Traitées')]]);
    tableau('g-jour-tab', T('tb.gJour', 'Activité des 14 derniers jours'), [T('tb.jour', 'Jour'), T('tb.creees', 'Créées'), T('tb.traitees', 'Traitées')],
      jours.map(j => [fmtS(j) + ' ' + fmtJ(j), ind.parJour[j].creees, ind.parJour[j].traitees]));
  }

  /* ---------- Quartiers (total + part en attente) ---------- */
  function attenteParQuartier() {
    const o = {};
    NT.demandes.toutes().filter(d => d.statut === 'recue').forEach(d => { const k = d.quartier || 'non précisé'; o[k] = (o[k] || 0) + 1; });
    return o;
  }
  function graphQuartier() {
    const att = attenteParQuartier(), l = trier(ind.parQuartier), max = Math.max(1, ...l.map(x => x[1]));
    barresH('g-quartier', l.map(([k, n]) => ({ nom: lib(k), valeur: n, valeurTexte: nf(n), motif: 'm-hach-iono', sur: att[k] ? { valeur: att[k], motif: 'm-points-soleil' } : null,
      complement: att[k] ? '· ' + T('tb.dont', '{n} en attente', { n: att[k] }) : '' })), max);
    legende('g-quartier-leg', [['m-hach-iono', T('tb.total', 'Total')], ['m-points-soleil', T('tb.enAttente', 'En attente')]]);
    tableau('g-quartier-tab', T('tb.gQuartier', 'Demandes par quartier'), [T('tb.quartier', 'Quartier'), T('tb.total', 'Total'), T('tb.enAttente', 'En attente')],
      l.map(([k, n]) => [lib(k), n, att[k] || 0]));
  }

  /* ---------- Services (top 6) ---------- */
  function graphService() {
    const l = trier(ind.parService).slice(0, 6), max = Math.max(1, ...l.map(x => x[1])), tot = ind.totaux.demandes || 1;
    barresH('g-service', l.map(([k, n]) => ({ nom: nomService(k), valeur: n, valeurTexte: nf(n), motif: 'm-plein-iono', complement: '· ' + Math.round(n / tot * 100) + ' %' })), max);
    legende('g-service-leg', [['m-plein-iono', T('tb.demandes', 'Demandes')]]);
    tableau('g-service-tab', T('tb.gService', 'Services les plus sollicités'), [T('tb.service', 'Service'), T('tb.demandes', 'Demandes'), T('tb.part', 'Part')],
      l.map(([k, n]) => [nomService(k), n, Math.round(n / tot * 100) + ' %']));
  }

  /* ---------- Statuts ---------- */
  function graphStatut() {
    const max = Math.max(1, ...STATUTS.map(([c]) => ind.parStatut[c] || 0)), tot = ind.totaux.demandes || 1;
    const nom = c => T('statut.' + c, NT.STATUTS[c] || c);
    barresH('g-statut', STATUTS.map(([c, motif]) => ({ nom: nom(c), valeur: ind.parStatut[c] || 0, valeurTexte: nf(ind.parStatut[c] || 0), motif, complement: '· ' + Math.round((ind.parStatut[c] || 0) / tot * 100) + ' %' })), max);
    legende('g-statut-leg', STATUTS.map(([c, motif]) => [motif, nom(c)]));
    tableau('g-statut-tab', T('tb.gStatut', 'Répartition par statut'), [T('tb.statut', 'Statut'), T('tb.demandes', 'Demandes'), T('tb.part', 'Part')],
      STATUTS.map(([c]) => [nom(c), ind.parStatut[c] || 0, Math.round((ind.parStatut[c] || 0) / tot * 100) + ' %']));
  }

  /* ---------- Indicateurs principaux ---------- */
  function kpis() {
    const t = ind.totaux, d = duree(ind.delaiMoyenHeures);
    const items = [
      { fort: true, href: 'agent-demandes.html?statut=recue', icone: 'ph-tray', v: nf(t.enAttente), lib: T('tb.k.attente', 'Demandes en attente de prise en charge'), cta: T('tb.k.attenteCta', 'Les prendre en charge') },
      { urgent: t.urgentes > 0, href: 'agent-demandes.html', icone: 'ph-warning-octagon', v: nf(t.urgentes), lib: T('tb.k.urgentes', 'Demandes urgentes non traitées'), cta: T('tb.k.urgentesCta', 'Voir les demandes') },
      { href: 'agent-demandes.html?statut=traitee', icone: 'ph-timer', v: d ? d.n : '–', u: d ? d.u : '', lib: T('tb.k.delai', 'Délai moyen de traitement'), cta: d ? T('tb.k.delaiCta', 'Voir les demandes traitées') : T('tb.k.delaiAucun', 'Aucune demande traitée pour le moment') },
      { href: 'agent-demandes.html?statut=traitee', icone: 'ph-check-circle', v: nf(t.traitees), lib: T('tb.k.traitees', 'Demandes traitées'), cta: T('tb.k.traiteesCta', 'Voir les demandes traitées') },
      { href: 'rendez-vous.html', icone: 'ph-calendar-check', v: nf(t.rdvAVenir), lib: T('tb.k.rdv', 'Rendez-vous à venir'), cta: T('tb.k.rdvCta', 'Ouvrir les rendez-vous') },
      { href: 'agent-alertes.html', icone: 'ph-megaphone', v: nf(t.alertesActives), lib: T('tb.k.alertes', 'Alertes actives'), cta: T('tb.k.alertesCta', 'Gérer les alertes') }
    ];
    el('tb-kpis').innerHTML = items.map(k => `<li class="${k.fort ? 'ag-kpi-fort' : ''}"><a class="kpi ${k.fort ? 'fort' : ''} ${k.urgent ? 'tb-urgent' : ''}" href="${e(k.href)}">
      <i class="ph-duotone ${k.icone} tb-ico" aria-hidden="true"></i><span class="valeur">${e(k.v)}${k.u ? `<small>${e(k.u)}</small>` : ''}</span>
      <span class="libelle">${e(k.lib)}</span><span class="kpi-cta"><i class="ph ph-arrow-square-out" aria-hidden="true"></i>${e(k.cta)}</span></a></li>`).join('');
  }

  /* ---------- À surveiller ---------- */
  function surveiller(nbContrib) {
    const pts = [], t = ind.totaux;
    if (t.urgentes > 0) pts.push(['alerte', 'ph-warning-octagon', P('tb.w.urgentes', t.urgentes, '{n} demande urgente n’est pas encore traitée.', '{n} demandes urgentes ne sont pas encore traitées.'), 'agent-demandes.html', T('tb.w.urgentesLien', 'Traiter les demandes urgentes')]);
    const att = trier(attenteParQuartier())[0];
    if (att) pts.push(['attention', 'ph-map-pin', P('tb.w.quartier', att[1], 'Quartier {q} : {n} demande en attente, le plus de tous les quartiers.', 'Quartier {q} : {n} demandes en attente, le plus de tous les quartiers.', { q: lib(att[0]) }), 'agent-demandes.html?statut=recue', T('tb.w.quartierLien', 'Voir les demandes en attente')]);
    const anciennes = NT.demandes.toutes().filter(d => d.statut === 'recue' && A.ageMs(d.cree) > 2 * 86400000).length;
    if (anciennes) pts.push(['attention', 'ph-hourglass-medium', P('tb.w.anciennes', anciennes, '{n} demande attend depuis plus de 2 jours.', '{n} demandes attendent depuis plus de 2 jours.'), 'agent-demandes.html?statut=recue', T('tb.w.anciennesLien', 'Traiter les plus anciennes')]);
    const svc = trier(ind.parService).filter(x => x[0] !== 'non précisé')[0];
    if (svc) pts.push(['info', 'ph-buildings', T('tb.w.service', 'Service le plus sollicité : {s} ({n} demandes, {p} % du total).', { s: nomService(svc[0]), n: svc[1], p: Math.round(svc[1] / (t.demandes || 1) * 100) }), 'agent-demandes.html', T('tb.w.serviceLien', 'Voir toutes les demandes')]);
    if (nbContrib > 0) pts.push(['attention', 'ph-shield-check', P('tb.w.contrib', nbContrib, '{n} contribution sur les données attend une réponse.', '{n} contributions sur les données attendent une réponse.'), 'donnees.html', T('tb.w.contribLien', 'Ouvrir les contributions')]);
    const d = duree(ind.delaiMoyenHeures);
    if (ind.delaiMoyenHeures !== null && ind.delaiMoyenHeures > 48) pts.push(['attention', 'ph-timer', T('tb.w.delai', 'Le délai moyen de traitement est de {d} : au-delà de 48 heures.', { d: d.n + ' ' + d.u }), 'agent-demandes.html?statut=traitee', T('tb.w.delaiLien', 'Voir les demandes traitées')]);
    const niv = { alerte: T('tb.w.niveauAlerte', 'Prioritaire'), attention: T('tb.w.niveauAttention', 'Attention'), info: T('tb.w.niveauInfo', 'Pour information') };
    el('tb-points').innerHTML = pts.length ? pts.map(([n, ic, txt, href, lien]) => `<li class="tb-${n}"><i class="ph-duotone ${ic}" aria-hidden="true"></i>
      <div><span class="tb-niv">${e(niv[n])}</span><p>${e(txt)} <a href="${e(href)}">${e(lien)}</a></p></div></li>`).join('')
      : `<li><i class="ph-duotone ph-seal-check" aria-hidden="true"></i><p>${e(T('tb.w.rien', 'Rien d’inhabituel à signaler : les demandes en attente sont sous contrôle.'))}</p></li>`;
  }

  function heure() {
    el('tb-maj').textContent = majLe ? T(echec ? 'tb.majEchec' : 'tb.maj', echec ? 'Dernière mise à jour réussie : {h}' : 'Dernière mise à jour : {h}', { h: A.heure(majLe, true) }) : T('tb.majJamais', 'Pas encore actualisé');
  }

  function charger(manuel) {
    if (enCours) return;
    enCours = true;
    const btn = el('tb-actualiser'); btn.disabled = true; btn.setAttribute('aria-busy', 'true');
    setTimeout(() => {
      try {
        const r = NT.api('GET', '/api/indicateurs');
        if (r.statut !== 200 || !r.donnees || !r.donnees.totaux) throw new Error(String(r.statut));
        const c = NT.api('GET', '/api/contributions');
        const nbContrib = c.statut === 200 && Array.isArray(c.donnees) ? c.donnees.filter(x => x.statut === 'recue').length : 0;
        const json = JSON.stringify([r.donnees, nbContrib, NT.demandes.toutes().length]);
        majLe = new Date(); echec = false;
        el('tb-erreur').hidden = true;
        if (json !== dernierJson || !ind) {
          dernierJson = json; ind = r.donnees;
          kpis(); surveiller(nbContrib); graphJour(); graphQuartier(); graphService(); graphStatut();
        }
        heure();
        if (manuel) el('tb-live').textContent = T('tb.live', 'Tableau de bord actualisé à {h}.', { h: A.heure(majLe, true) });
      } catch (err) {
        echec = true;
        let txt = /^40[13]$/.test(err.message) ? T('tb.erreurDroits', 'Votre session ne permet plus d’accéder aux indicateurs. Reconnectez-vous.') : T('tb.erreur', 'Les indicateurs n’ont pas pu être chargés. Nouvel essai dans 60 secondes.');
        if (ind && majLe) txt += ' ' + T('tb.erreurAnciennes', 'Les chiffres affichés datent de {h}.', { h: A.heure(majLe, true) });
        el('tb-erreur-texte').textContent = txt; el('tb-erreur').hidden = false;
        if (!ind) el('tb-kpis').innerHTML = '';
        heure();
      } finally {
        enCours = false; btn.disabled = false; btn.removeAttribute('aria-busy');
      }
    }, 0);
  }

  NT.pret(() => {
    heure();
    el('tb-actualiser').addEventListener('click', () => charger(true));
    charger(false);
    setInterval(() => { if (!document.hidden) charger(false); }, 60000);
  });
})();
