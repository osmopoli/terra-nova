/* Terra Nova — page Transports (F36).
   Données de lignes inventées mais cohérentes ; prochains départs calculés en direct depuis l'heure du navigateur. */
(function () {
  'use strict';
  const NT = window.NT;

  NT.i18n.ajouter({
    fr: {
      'tr.titre': 'Navettes municipales', 'tr.intro': 'Choisissez votre arrêt de départ et d’arrivée : la ligne à prendre et les prochains départs s’affichent tout de suite.',
      'tr.trafic': 'Info trafic', 'tr.monTrajet': 'Mon trajet', 'tr.depart': 'Arrêt de départ', 'tr.arrivee': 'Arrêt d’arrivée', 'tr.inverser': 'Inverser départ et arrivée', 'tr.inverserCourt': 'Inverser',
      'tr.lignes': 'Horaires par ligne', 'tr.lignesD': 'Quatre lignes, tous les jours. Les heures sont celles du départ à chaque arrêt.',
      'tr.choisir': 'Choisir un arrêt', 'tr.noteQuartier': 'Arrêt de départ proposé d’après votre quartier ({q}). Vous pouvez le changer.', 'tr.noteVisiteur': 'Connectez-vous avec un quartier pour obtenir un départ proposé automatiquement.',
      'tr.nommeQuartier': 'Quartier {q}',
      'tr.traficOk': 'Circulation normale', 'tr.traficPerturbee': 'Perturbée', 'tr.traficTitre': 'Perturbation en cours sur la ligne {l}', 'tr.traficAlt': 'Que faire ?', 'tr.voirAlerte': 'Voir l’alerte montée des eaux',
      'tr.traficResume': '1 ligne perturbée, 3 lignes normales.', 'tr.toutNormal': 'Les 4 lignes circulent normalement.',
      'tr.pertMsg': 'Montée des eaux dans le quartier Sud : l’arrêt Canal Sud n’est plus desservi. La ligne N2 démarre provisoirement de Place des Pionniers.',
      'tr.pertAlt': 'Rejoignez Place des Pionniers à pied (environ 6 minutes) : la ligne N2 y passe toutes les 15 minutes. Évitez les niveaux inférieurs près du canal.',
      'tr.prendre': 'Prenez la ligne {l}', 'tr.direction': 'direction {d}', 'tr.depuisArret': 'depuis {a}', 'tr.jusqua': 'jusqu’à {a}',
      'tr.prochains': 'Les 3 prochains départs', 'tr.dans': 'dans {n} min', 'tr.maintenant': 'maintenant', 'tr.demain': 'demain', 'tr.arriveeA': 'arrivée {h}',
      'tr.duree': 'Durée estimée', 'tr.nbArrets': 'Arrêts', 'tr.frequence': 'Fréquence', 'tr.minutes': '{n} min', 'tr.arrets': '{n} arrêts', 'tr.arret1': '1 arrêt', 'tr.freq': 'Toutes les {n} min',
      'tr.voirArrets': 'Voir les arrêts du trajet', 'tr.correspondance': 'Correspondance à {a}', 'tr.puis': 'puis ligne {l} à {h}',
      'tr.memeArret': 'Départ et arrivée sont identiques : choisissez deux arrêts différents.', 'tr.aucun': 'Aucun trajet trouvé entre ces deux arrêts. Contactez la mobilité pour être aidé.',
      'tr.perturbeIci': 'Perturbation sur ce trajet', 'tr.arretFerme': 'L’arrêt {a} n’est pas desservi : prenez la navette à {r}.', 'tr.arretFermeFin': 'L’arrêt {a} n’est pas desservi : descendez à {r}.', 'tr.marche': 'environ {n} min à pied',
      'tr.premier': 'Premier départ', 'tr.dernier': 'Dernier départ', 'tr.arret': 'Arrêt', 'tr.vers': 'vers {d}', 'tr.captionLigne': 'Horaires de la ligne {l} : premiers et derniers passages à chaque arrêt',
      'tr.serviceDe': 'Service de {a} à {b}', 'tr.tousJours': 'tous les jours', 'tr.nonDesservi': 'Non desservi',
      'tr.ligne.N1': 'Centre – Nord', 'tr.ligne.N2': 'Sud – Gare orbitale', 'tr.ligne.N3': 'Est – Ouest', 'tr.ligne.N4': 'Est – Gare orbitale'
    },
    en: {
      'tr.titre': 'City shuttles', 'tr.intro': 'Pick your departure and arrival stops: the line to take and the next departures show up right away.',
      'tr.trafic': 'Traffic information', 'tr.monTrajet': 'My trip', 'tr.depart': 'Departure stop', 'tr.arrivee': 'Arrival stop', 'tr.inverser': 'Swap departure and arrival', 'tr.inverserCourt': 'Swap',
      'tr.lignes': 'Timetables by line', 'tr.lignesD': 'Four lines, every day. Times shown are departures at each stop.',
      'tr.choisir': 'Choose a stop', 'tr.noteQuartier': 'Departure stop suggested from your district ({q}). You can change it.', 'tr.noteVisiteur': 'Sign in with a district to get a departure stop suggested automatically.',
      'tr.nommeQuartier': '{q} district',
      'tr.traficOk': 'Running normally', 'tr.traficPerturbee': 'Disrupted', 'tr.traficTitre': 'Disruption on line {l}', 'tr.traficAlt': 'What to do?', 'tr.voirAlerte': 'See the rising water alert',
      'tr.traficResume': '1 line disrupted, 3 lines normal.', 'tr.toutNormal': 'All 4 lines are running normally.',
      'tr.pertMsg': 'Rising water in the South district: the Canal Sud stop is not served. Line N2 temporarily starts from Place des Pionniers.',
      'tr.pertAlt': 'Walk to Place des Pionniers (about 6 minutes): line N2 stops there every 15 minutes. Avoid lower levels near the canal.',
      'tr.prendre': 'Take line {l}', 'tr.direction': 'towards {d}', 'tr.depuisArret': 'from {a}', 'tr.jusqua': 'to {a}',
      'tr.prochains': 'Next 3 departures', 'tr.dans': 'in {n} min', 'tr.maintenant': 'now', 'tr.demain': 'tomorrow', 'tr.arriveeA': 'arrives {h}',
      'tr.duree': 'Estimated duration', 'tr.nbArrets': 'Stops', 'tr.frequence': 'Frequency', 'tr.minutes': '{n} min', 'tr.arrets': '{n} stops', 'tr.arret1': '1 stop', 'tr.freq': 'Every {n} min',
      'tr.voirArrets': 'See the stops on this trip', 'tr.correspondance': 'Change at {a}', 'tr.puis': 'then line {l} at {h}',
      'tr.memeArret': 'Departure and arrival are the same: choose two different stops.', 'tr.aucun': 'No trip found between these two stops. Contact the mobility service for help.',
      'tr.perturbeIci': 'Disruption on this trip', 'tr.arretFerme': 'The {a} stop is not served: board at {r}.', 'tr.arretFermeFin': 'The {a} stop is not served: get off at {r}.', 'tr.marche': 'about {n} min on foot',
      'tr.premier': 'First departure', 'tr.dernier': 'Last departure', 'tr.arret': 'Stop', 'tr.vers': 'towards {d}', 'tr.captionLigne': 'Line {l} timetable: first and last departures at each stop',
      'tr.serviceDe': 'Service from {a} to {b}', 'tr.tousJours': 'every day', 'tr.nonDesservi': 'Not served',
      'tr.ligne.N1': 'Centre – North', 'tr.ligne.N2': 'South – Orbital station', 'tr.ligne.N3': 'East – West', 'tr.ligne.N4': 'East – Orbital station'
    },
    es: {
      'tr.titre': 'Lanzaderas municipales', 'tr.intro': 'Elija su parada de salida y de llegada: la línea que debe tomar y las próximas salidas aparecen al instante.',
      'tr.trafic': 'Información de tráfico', 'tr.monTrajet': 'Mi trayecto', 'tr.depart': 'Parada de salida', 'tr.arrivee': 'Parada de llegada', 'tr.inverser': 'Invertir salida y llegada', 'tr.inverserCourt': 'Invertir',
      'tr.lignes': 'Horarios por línea', 'tr.lignesD': 'Cuatro líneas, todos los días. Las horas son las de salida en cada parada.',
      'tr.choisir': 'Elegir una parada', 'tr.noteQuartier': 'Parada de salida propuesta según su barrio ({q}). Puede cambiarla.', 'tr.noteVisiteur': 'Inicie sesión con un barrio para obtener una salida propuesta.',
      'tr.nommeQuartier': 'Barrio {q}',
      'tr.traficOk': 'Circulación normal', 'tr.traficPerturbee': 'Con incidencias', 'tr.traficTitre': 'Incidencia en la línea {l}', 'tr.traficAlt': '¿Qué hacer?', 'tr.voirAlerte': 'Ver la alerta de subida del agua',
      'tr.traficResume': '1 línea con incidencias, 3 normales.', 'tr.toutNormal': 'Las 4 líneas circulan con normalidad.',
      'tr.pertMsg': 'Subida del agua en el barrio Sur: la parada Canal Sur no tiene servicio. La línea N2 sale provisionalmente de Place des Pionniers.',
      'tr.pertAlt': 'Camine hasta Place des Pionniers (unos 6 minutos): la línea N2 pasa cada 15 minutos. Evite los niveles inferiores cerca del canal.',
      'tr.prendre': 'Tome la línea {l}', 'tr.direction': 'dirección {d}', 'tr.depuisArret': 'desde {a}', 'tr.jusqua': 'hasta {a}',
      'tr.prochains': 'Las 3 próximas salidas', 'tr.dans': 'en {n} min', 'tr.maintenant': 'ahora', 'tr.demain': 'mañana', 'tr.arriveeA': 'llegada {h}',
      'tr.duree': 'Duración estimada', 'tr.nbArrets': 'Paradas', 'tr.frequence': 'Frecuencia', 'tr.minutes': '{n} min', 'tr.arrets': '{n} paradas', 'tr.arret1': '1 parada', 'tr.freq': 'Cada {n} min',
      'tr.voirArrets': 'Ver las paradas del trayecto', 'tr.correspondance': 'Transbordo en {a}', 'tr.puis': 'luego línea {l} a las {h}',
      'tr.memeArret': 'Salida y llegada son iguales: elija dos paradas distintas.', 'tr.aucun': 'No se encontró trayecto entre estas paradas.',
      'tr.premier': 'Primera salida', 'tr.dernier': 'Última salida', 'tr.arret': 'Parada', 'tr.vers': 'hacia {d}', 'tr.nonDesservi': 'Sin servicio',
      'tr.ligne.N1': 'Centro – Norte', 'tr.ligne.N2': 'Sur – Estación orbital', 'tr.ligne.N3': 'Este – Oeste', 'tr.ligne.N4': 'Este – Estación orbital'
    },
    ar: {
      'tr.titre': 'حافلات البلدية', 'tr.intro': 'اختر محطة الانطلاق والوصول: يظهر الخط المناسب والرحلات القادمة فوراً.',
      'tr.trafic': 'معلومات حركة المرور', 'tr.monTrajet': 'رحلتي', 'tr.depart': 'محطة الانطلاق', 'tr.arrivee': 'محطة الوصول', 'tr.inverser': 'عكس الانطلاق والوصول', 'tr.inverserCourt': 'عكس',
      'tr.lignes': 'المواعيد حسب الخط', 'tr.lignesD': 'أربعة خطوط كل يوم. الأوقات هي أوقات الانطلاق عند كل محطة.',
      'tr.choisir': 'اختر محطة', 'tr.traficOk': 'سير عادي', 'tr.traficPerturbee': 'مضطرب', 'tr.traficAlt': 'ماذا أفعل؟',
      'tr.prochains': 'الرحلات الثلاث القادمة', 'tr.dans': 'بعد {n} د', 'tr.maintenant': 'الآن', 'tr.demain': 'غداً', 'tr.premier': 'أول رحلة', 'tr.dernier': 'آخر رحلة', 'tr.arret': 'المحطة', 'tr.duree': 'المدة التقديرية'
    }
  });

  /* ---------- Réseau ---------- */
  const ARRETS = {
    gare: ['Gare orbitale', 'Centre'], mairie: ['Hôtel de ville', 'Centre'], dispensaire: ['Dispensaire central', 'Centre'], quai: ['Quai des Arrivées', 'Centre'],
    serres: ['Parc des Serres', 'Nord'], orion: ['Arrêt Orion', 'Nord'], observatoire: ['Observatoire', 'Nord'],
    canal: ['Canal Sud', 'Sud'], pionniers: ['Place des Pionniers', 'Sud'], social: ['Centre social', 'Sud'],
    ateliers: ['Zone des Ateliers', 'Est'], aurore: ['Résidence Aurore', 'Est'], habitat: ['Pôle habitat', 'Est'], kepler: ['Lycée Kepler', 'Est'], culturel: ['Dôme culturel', 'Est'],
    tri: ['Centre de tri', 'Ouest'], emploi: ['Maison de l’emploi', 'Ouest'], jardins: ['Jardins hydroponiques', 'Ouest']
  };
  // [arrêt, minutes depuis le terminus de départ du sens « aller »]
  const LIGNES = {
    N1: { premier: '05:10', dernier: '22:40', freq: 12, arrets: [['gare', 0], ['mairie', 4], ['dispensaire', 7], ['serres', 12], ['orion', 16], ['observatoire', 21]] },
    N2: { premier: '05:00', dernier: '23:00', freq: 15, arrets: [['canal', 0], ['pionniers', 5], ['social', 9], ['mairie', 15], ['gare', 19]] },
    N3: { premier: '05:30', dernier: '22:50', freq: 10, arrets: [['tri', 0], ['emploi', 5], ['jardins', 9], ['mairie', 14], ['culturel', 19], ['habitat', 24]] },
    N4: { premier: '05:00', dernier: '23:00', freq: 10, arrets: [['ateliers', 0], ['aurore', 3], ['habitat', 6], ['kepler', 9], ['culturel', 12], ['quai', 16], ['mairie', 19], ['gare', 22]] }
  };
  Object.keys(LIGNES).forEach(id => { const L = LIGNES[id]; L.id = id; L.total = L.arrets[L.arrets.length - 1][1]; });
  // Perturbation inventée : lien avec l'alerte « montée des eaux » du quartier Sud
  const PERT = { ligne: 'N2', fermes: ['canal'], remplace: 'pionniers', marche: 6 };

  /* ---------- Calculs ---------- */
  const { echap } = NT.ui;
  const t = NT.t;
  const nom = id => ARRETS[id][0];
  const pad = n => String(n).padStart(2, '0');
  const hhmm = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  const versMin = s => { const [h, m] = s.split(':'); return (+h) * 60 + (+m); };
  const maintenant = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const idx = (L, a) => L.arrets.findIndex(x => x[0] === a);
  const offset = (L, a, sens) => { const o = L.arrets[idx(L, a)][1]; return sens === 'aller' ? o : L.total - o; };
  const terminus = (L, sens) => nom(sens === 'aller' ? L.arrets[L.arrets.length - 1][0] : L.arrets[0][0]);
  const ligneNom = id => t('tr.ligne.' + id);
  const sensEntre = (L, a, b) => (idx(L, a) < idx(L, b) ? 'aller' : 'retour');

  // Prochains départs à un arrêt (minutes depuis minuit ; ≥ 1440 = lendemain)
  function departs(L, a, sens, depuis, n) {
    const off = offset(L, a, sens), premier = versMin(L.premier) + off, dernier = versMin(L.dernier) + off, res = [];
    for (let jour = 0; jour < 2 && res.length < n; jour++) {
      for (let m = premier; m <= dernier && res.length < n; m += L.freq) { const abs = m + jour * 1440; if (abs >= depuis) res.push(abs); }
    }
    return res;
  }
  const premierApres = (L, a, sens, depuis) => departs(L, a, sens, depuis, 1)[0];

  /* Itinéraires : directs d'abord, sinon une correspondance par un arrêt commun. Prend en compte la perturbation. */
  function effectif(L, a, b) {
    let notes = [], a2 = a, b2 = b;
    if (L.id === PERT.ligne) {
      if (PERT.fermes.includes(a)) { a2 = PERT.remplace; notes.push({ type: 'depart', ferme: a, remplace: PERT.remplace }); }
      if (PERT.fermes.includes(b)) { b2 = PERT.remplace; notes.push({ type: 'fin', ferme: b, remplace: PERT.remplace }); }
    }
    return { a: a2, b: b2, notes };
  }
  function trajets(a, b) {
    const ids = Object.keys(LIGNES), res = [];
    ids.forEach(id => {
      const L = LIGNES[id]; if (idx(L, a) < 0 || idx(L, b) < 0) return;
      const e = effectif(L, a, b); if (e.a === e.b) return;
      const sens = sensEntre(L, e.a, e.b);
      const duree = Math.abs(offset(L, e.b, sens) - offset(L, e.a, sens));
      res.push({ etapes: [{ L, de: e.a, vers: e.b, sens, duree, notes: e.notes }], duree, correspondance: null });
    });
    if (res.length) return res.sort((x, y) => x.duree - y.duree);
    // Une correspondance (5 min d'attente comptées)
    ids.forEach(i1 => ids.forEach(i2 => {
      if (i1 === i2) return;
      const L1 = LIGNES[i1], L2 = LIGNES[i2]; if (idx(L1, a) < 0 || idx(L2, b) < 0) return;
      L1.arrets.forEach(([h]) => {
        if (idx(L2, h) < 0 || h === a || h === b) return;
        const e1 = effectif(L1, a, h), e2 = effectif(L2, h, b); if (e1.a === e1.b || e2.a === e2.b) return;
        const s1 = sensEntre(L1, e1.a, e1.b), s2 = sensEntre(L2, e2.a, e2.b);
        const d1 = Math.abs(offset(L1, e1.b, s1) - offset(L1, e1.a, s1)), d2 = Math.abs(offset(L2, e2.b, s2) - offset(L2, e2.a, s2));
        res.push({ etapes: [{ L: L1, de: e1.a, vers: e1.b, sens: s1, duree: d1, notes: e1.notes }, { L: L2, de: e2.a, vers: e2.b, sens: s2, duree: d2, notes: e2.notes }], duree: d1 + d2 + 5, correspondance: h });
      });
    }));
    return res.sort((x, y) => x.duree - y.duree).slice(0, 1);
  }

  /* ---------- Rendu : info trafic ---------- */
  const etiquetteLigne = id => `<span class="tr-ligne tr-${id}">${id}</span>`;

  function rendreTrafic() {
    const el = document.getElementById('tr-trafic');
    const puces = Object.keys(LIGNES).map(id => {
      const perturbee = id === PERT.ligne;
      return `<li class="tr-puce${perturbee ? ' tr-puce-pert' : ''}">${etiquetteLigne(id)}
        <span class="tr-puce-txt"><strong>${echap(ligneNom(id))}</strong>
        <span class="statut ${perturbee ? 'statut-maintenance' : 'statut-ok'}">${echap(t(perturbee ? 'tr.traficPerturbee' : 'tr.traficOk'))}</span></span></li>`;
    }).join('');
    el.innerHTML = `
      <div class="tr-alerte" role="group" aria-labelledby="tr-alerte-t">
        <i class="ph-duotone ph-warning" aria-hidden="true"></i>
        <div>
          <h3 id="tr-alerte-t">${echap(t('tr.traficTitre', { l: PERT.ligne }))}</h3>
          <p>${echap(t('tr.pertMsg'))}</p>
          <p><strong>${echap(t('tr.traficAlt'))}</strong> ${echap(t('tr.pertAlt'))}</p>
          <a href="annonces.html#ann-crue">${echap(t('tr.voirAlerte'))}</a>
        </div>
      </div>
      <p class="sr-only">${echap(t('tr.traficResume'))}</p>
      <ul class="tr-puces">${puces}</ul>`;
  }

  /* ---------- Rendu : mon trajet ---------- */
  const selDep = document.getElementById('tr-dep'), selArr = document.getElementById('tr-arr');
  const resultat = document.getElementById('tr-resultat');
  const note = document.getElementById('tr-note');

  function remplirSelects() {
    const ordre = NT.QUARTIERS.slice();
    const options = '<option value="">' + echap(t('tr.choisir')) + '</option>' + ordre.map(q => {
      const ids = Object.keys(ARRETS).filter(id => ARRETS[id][1] === q);
      return ids.length ? `<optgroup label="${echap(t('tr.nommeQuartier', { q }))}">${ids.map(id => `<option value="${id}">${echap(nom(id))}</option>`).join('')}</optgroup>` : '';
    }).join('');
    selDep.innerHTML = options; selArr.innerHTML = options;
  }

  function dureeTxt(n) { return t('tr.minutes', { n }); }
  function departTxt(abs, ref) {
    const jour = abs >= 1440, dans = abs - ref;
    const quand = dans <= 0 ? t('tr.maintenant') : t('tr.dans', { n: dans });
    return { h: hhmm(abs), quand: jour ? t('tr.demain') + ' · ' + hhmm(abs) : quand, jour };
  }

  let dernierHtml = '';
  function rendreTrajet() {
    const a = selDep.value, b = selArr.value, ref = maintenant();
    if (!a || !b) { dernierHtml = ''; resultat.innerHTML = `<p class="vide">${echap(t('tr.choisir'))}</p>`; return; }
    if (a === b) { dernierHtml = ''; resultat.innerHTML = `<p class="tr-msg"><i class="ph-duotone ph-info" aria-hidden="true"></i>${echap(t('tr.memeArret'))}</p>`; return; }
    const opts = trajets(a, b);
    if (!opts.length) { dernierHtml = ''; resultat.innerHTML = `<p class="tr-msg"><i class="ph-duotone ph-info" aria-hidden="true"></i>${echap(t('tr.aucun'))}</p>`; return; }
    const r = opts[0], e1 = r.etapes[0];
    const nbArrets = e => Math.abs(idx(e.L, e.vers) - idx(e.L, e.de));
    const totalArrets = r.etapes.reduce((s, e) => s + nbArrets(e), 0);
    const dep = departs(e1.L, e1.de, e1.sens, ref, 3);

    // Perturbation concernant ce trajet
    const notes = r.etapes.reduce((acc, e) => acc.concat(e.notes), []);
    const alerte = notes.length ? `<div class="tr-alerte tr-alerte-trajet" role="group" aria-label="${echap(t('tr.perturbeIci'))}"><i class="ph-duotone ph-warning" aria-hidden="true"></i><div>
      <strong>${echap(t('tr.perturbeIci'))}</strong>
      ${notes.map(n => `<p>${echap(t(n.type === 'depart' ? 'tr.arretFerme' : 'tr.arretFermeFin', { a: nom(n.ferme), r: nom(n.remplace) }))}${n.type === 'depart' ? ' (' + echap(t('tr.marche', { n: PERT.marche })) + ')' : ''}</p>`).join('')}
      <p>${echap(t('tr.pertAlt'))}</p></div></div>` : '';

    const lignesDepart = dep.map(abs => {
      const d = departTxt(abs, ref);
      const arrivee1 = abs + e1.duree;
      let detail = '';
      if (r.correspondance) {
        const e2 = r.etapes[1], p = premierApres(e2.L, e2.de, e2.sens, arrivee1 + 2);
        const fin = p + e2.duree;
        detail = `${echap(t('tr.correspondance', { a: nom(r.correspondance) }))} (${hhmm(arrivee1)}), ${echap(t('tr.puis', { l: e2.L.id, h: hhmm(p) }))} · ${echap(t('tr.arriveeA', { h: hhmm(fin) }))}`;
      } else detail = echap(t('tr.arriveeA', { h: hhmm(arrivee1) }));
      return `<li><span class="tr-heure">${hhmm(abs)}</span><span class="tr-quand${d.quand === t('tr.maintenant') ? ' tr-now' : ''}">${echap(d.quand)}</span><span class="tr-detail">${detail}</span></li>`;
    }).join('');

    const arretsTraverses = r.etapes.map(e => {
      const i1 = idx(e.L, e.de), i2 = idx(e.L, e.vers), pas = i1 < i2 ? 1 : -1, liste = [];
      for (let i = i1; i !== i2 + pas; i += pas) liste.push(e.L.arrets[i][0]);
      return `<li>${etiquetteLigne(e.L.id)} <span>${liste.map(id => echap(nom(id))).join(' › ')}</span></li>`;
    }).join('');

    const ouvert = !!resultat.querySelector('details[open]');
    const html = `${alerte}
      <div class="tr-carte-ligne">
        <div class="tr-quoi">${r.etapes.map(e => etiquetteLigne(e.L.id)).join('<i class="ph ph-plus" aria-hidden="true"></i>')}
          <div><h3>${echap(r.etapes.length > 1 ? r.etapes.map(e => e.L.id).join(' + ') : t('tr.prendre', { l: e1.L.id }))}</h3>
            <p class="doux">${echap(t('tr.depuisArret', { a: nom(e1.de) }))}, ${echap(t('tr.direction', { d: terminus(e1.L, e1.sens) }))}${r.correspondance ? ' — ' + echap(t('tr.correspondance', { a: nom(r.correspondance) })) : ''}</p></div>
        </div>
        <dl class="tr-chiffres">
          <div><dt>${echap(t('tr.duree'))}</dt><dd>${echap(dureeTxt(r.duree))}</dd></div>
          <div><dt>${echap(t('tr.nbArrets'))}</dt><dd>${totalArrets}</dd></div>
          <div><dt>${echap(t('tr.frequence'))}</dt><dd>${echap(t('tr.freq', { n: e1.L.freq }))}</dd></div>
        </dl>
      </div>
      <h3 class="tr-h3">${echap(t('tr.prochains'))}</h3>
      <ol class="tr-departs">${lignesDepart}</ol>
      <details class="tr-arrets"><summary>${echap(t('tr.voirArrets'))}</summary><ul>${arretsTraverses}</ul></details>`;
    if (html === dernierHtml) return;
    dernierHtml = html;
    resultat.innerHTML = html;
    if (ouvert) resultat.querySelector('details').open = true;
  }

  function nouvelleSelection() {
    try { history.replaceState(null, '', location.pathname + (selDep.value && selArr.value ? '?de=' + selDep.value + '&vers=' + selArr.value : '')); } catch (e) { /* ignoré */ }
    rendreTrajet();
    const h = resultat.querySelector('.tr-carte-ligne h3'), d = resultat.querySelector('.tr-heure'), q = resultat.querySelector('.tr-quand');
    if (h && d) NT.ui.annoncer(h.textContent + ' — ' + d.textContent + (q ? ', ' + q.textContent : ''));
  }

  /* ---------- Rendu : horaires par ligne (onglets) ---------- */
  function rendreLignes() {
    const ids = Object.keys(LIGNES);
    document.getElementById('tr-lignes').innerHTML = `<sl-tab-group id="tr-tabs">
      ${ids.map(id => `<sl-tab slot="nav" panel="tr-p-${id}">${echap(id)} · ${echap(ligneNom(id))}</sl-tab>`).join('')}
      ${ids.map(id => {
        const L = LIGNES[id], premier = L.arrets[0][0], dernier = L.arrets[L.arrets.length - 1][0];
        return `<sl-tab-panel name="tr-p-${id}">
          <p class="tr-resume">${etiquetteLigne(id)} <strong>${echap(ligneNom(id))}</strong> · ${echap(t('tr.freq', { n: L.freq }))} · ${echap(t('tr.tousJours'))} · ${echap(t('tr.serviceDe', { a: L.premier.replace(':', 'h'), b: L.dernier.replace(':', 'h') }))}</p>
          <div class="table-defile"><table>
            <caption class="sr-only">${echap(t('tr.captionLigne', { l: id }))}</caption>
            <thead><tr><th scope="col">${echap(t('tr.arret'))}</th>
              <th scope="col">${echap(t('tr.premier'))} ${echap(t('tr.vers', { d: nom(dernier) }))}</th><th scope="col">${echap(t('tr.dernier'))} ${echap(t('tr.vers', { d: nom(dernier) }))}</th>
              <th scope="col">${echap(t('tr.premier'))} ${echap(t('tr.vers', { d: nom(premier) }))}</th><th scope="col">${echap(t('tr.dernier'))} ${echap(t('tr.vers', { d: nom(premier) }))}</th></tr></thead>
            <tbody>${L.arrets.map(([a, o]) => {
              const ferme = id === PERT.ligne && PERT.fermes.includes(a);
              const cell = (sens) => { const off = sens === 'aller' ? o : L.total - o; return [hhmm(versMin(L.premier) + off), hhmm(versMin(L.dernier) + off)]; };
              const al = cell('aller'), re = cell('retour');
              const vide = `<td colspan="4"><span class="statut statut-maintenance">${echap(t('tr.nonDesservi'))}</span></td>`;
              return `<tr><th scope="row">${echap(nom(a))}</th>${ferme ? vide : `<td>${al[0]}</td><td>${al[1]}</td><td>${re[0]}</td><td>${re[1]}</td>`}</tr>`;
            }).join('')}</tbody>
          </table></div></sl-tab-panel>`;
      }).join('')}
    </sl-tab-group>`;
  }

  /* ---------- Démarrage ---------- */
  NT.pret(() => {
    rendreTrafic();
    remplirSelects();
    rendreLignes();

    const u = NT.auth.utilisateur();
    const de = NT.ui.param('de'), vers = NT.ui.param('vers');
    let dep = '', arr = 'gare';
    if (de && ARRETS[de]) {
      dep = de; arr = vers && ARRETS[vers] ? vers : arr;
      note.textContent = '';
    } else if (u && u.quartier) {
      // Premier arrêt du quartier de l'utilisateur (le démo place Canal Sud en tête pour le quartier Sud)
      dep = Object.keys(ARRETS).find(id => ARRETS[id][1] === u.quartier) || '';
      note.textContent = dep ? t('tr.noteQuartier', { q: u.quartier }) : '';
    } else {
      dep = 'pionniers';
      note.textContent = t('tr.noteVisiteur');
    }
    if (dep === arr) arr = 'mairie';
    selDep.value = dep; selArr.value = arr;
    rendreTrajet();

    selDep.addEventListener('change', () => { note.textContent = ''; nouvelleSelection(); });
    selArr.addEventListener('change', nouvelleSelection);
    document.getElementById('tr-inverser').addEventListener('click', () => {
      const tmp = selDep.value; selDep.value = selArr.value; selArr.value = tmp; note.textContent = ''; nouvelleSelection();
    });
    // Les « dans X min » restent justes : recalcul toutes les 20 secondes
    setInterval(rendreTrajet, 20000);
  });
})();
