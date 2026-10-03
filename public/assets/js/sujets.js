/* Terra Nova — trier et filtrer des demandes ou signalements par sujet (vague 15 : F79).
   Composant réutilisé par le suivi de mes demandes, l'historique de mon espace et la liste « Soutenir » :
   - puces de sujet (le service concerné) avec le nombre de demandes pour chacun, plusieurs sujets possibles ;
   - tri : plus récentes, plus anciennes, par état (celles qui avancent d'abord), plus soutenues ;
   - recherche dans le texte (sans tenir compte des accents) ;
   - état gardé dans l'adresse (?sujet=voirie,eau-energie&tri=statut&q=lampadaire) : lien partageable, retour arrière ;
   - accessible : étiquettes, puces au clavier (aria-pressed), nombre de résultats annoncé (région live).
   Usage : NT.sujets.monter({ conteneur, prefixe, elements: () => [...], sujetDe, texteDe, dateDe, statutDe, soutiensDe?,
           statuts?, champRecherche?, extraFiltre?, compte?, libelleCompte?, onChange(liste) }) */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'sj.sujet': 'Sujet', 'sj.tous': 'Tous les sujets', 'sj.rech': 'Rechercher', 'sj.rechPh': 'Mot de l’objet, lieu, numéro…', 'sj.tri': 'Trier par', 'sj.statut': 'État', 'sj.tousStatuts': 'Tous les états',
      't.recentes': 'Plus récentes d’abord', 't.anciennes': 'Plus anciennes d’abord', 't.statut': 'État (en cours d’abord)', 't.soutenus': 'Les plus soutenus',
      'sj.compte': '{n} sur {total} affichée(s)', 'sj.compteSujets': '{n} sur {total} affichée(s) · sujets : {s}', 'sj.autre': 'Autre sujet', 'sj.effacer': 'Effacer les filtres', 'sj.aucun': 'Aucun résultat pour ces filtres.' },
    en: { 'sj.sujet': 'Subject', 'sj.tous': 'All subjects', 'sj.rech': 'Search', 'sj.rechPh': 'Word from the subject, place, number…', 'sj.tri': 'Sort by', 'sj.statut': 'Status', 'sj.tousStatuts': 'All statuses',
      't.recentes': 'Most recent first', 't.anciennes': 'Oldest first', 't.statut': 'Status (in progress first)', 't.soutenus': 'Most supported',
      'sj.compte': '{n} of {total} shown', 'sj.compteSujets': '{n} of {total} shown · subjects: {s}', 'sj.autre': 'Other subject', 'sj.effacer': 'Clear filters', 'sj.aucun': 'No result for these filters.' },
    es: { 'sj.sujet': 'Tema', 'sj.tous': 'Todos los temas', 'sj.rech': 'Buscar', 'sj.rechPh': 'Palabra del asunto, lugar, número…', 'sj.tri': 'Ordenar por', 'sj.statut': 'Estado', 'sj.tousStatuts': 'Todos los estados',
      't.recentes': 'Más recientes primero', 't.anciennes': 'Más antiguas primero', 't.statut': 'Estado (en curso primero)', 't.soutenus': 'Las más apoyadas',
      'sj.compte': '{n} de {total} mostradas', 'sj.compteSujets': '{n} de {total} mostradas · temas: {s}', 'sj.autre': 'Otro tema', 'sj.effacer': 'Borrar los filtros', 'sj.aucun': 'Ningún resultado para estos filtros.' },
    ar: { 'sj.sujet': 'الموضوع', 'sj.tous': 'كل المواضيع', 'sj.rech': 'بحث', 'sj.rechPh': 'كلمة من الموضوع، مكان، رقم…', 'sj.tri': 'ترتيب حسب', 'sj.statut': 'الحالة', 'sj.tousStatuts': 'كل الحالات',
      't.recentes': 'الأحدث أولاً', 't.anciennes': 'الأقدم أولاً', 't.statut': 'الحالة (قيد المعالجة أولاً)', 't.soutenus': 'الأكثر دعماً',
      'sj.compte': 'عرض {n} من {total}', 'sj.compteSujets': 'عرض {n} من {total} · المواضيع: {s}', 'sj.autre': 'موضوع آخر', 'sj.effacer': 'مسح عوامل التصفية', 'sj.aucun': 'لا توجد نتيجة لعوامل التصفية هذه.' }
  });
  const t = (k, v) => NT.t(k, v);
  const e = s => NT.ui.echap(s);
  const sansAccent = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const ORDRE_STATUT = { en_cours: 0, recue: 1, traitee: 2, cloturee: 3 };
  const STATUTS = ['recue', 'en_cours', 'traitee', 'cloturee'];

  // Libellé d'un sujet : le nom du service dans la langue choisie
  const libelleService = id => { const s = id && NT.services.get(id); return s ? NT.i18n.choisir(s.nom) : t('sj.autre'); };

  function monter(o) {
    const p = o.prefixe || '';
    const P = k => p + k;
    const url = new URLSearchParams(location.search);
    const tris = ['recentes', 'anciennes', 'statut'].concat(o.soutiensDe ? ['soutenus'] : []);
    const etat = {
      sujets: new Set((url.get(P('sujet')) || '').split(',').filter(Boolean)),
      tri: tris.includes(url.get(P('tri'))) ? url.get(P('tri')) : (o.triDefaut || 'recentes'),
      q: url.get(P('q')) || '',
      statut: STATUTS.includes(url.get(P('statut'))) ? url.get(P('statut')) : ''
    };
    const libelle = o.libelleSujet || libelleService;
    const id = 'sj-' + (p || 'x');
    const zone = document.createElement('div');
    zone.className = 'sujets-outils';
    zone.innerHTML = `<div class="sujets-champs">
        ${o.champRecherche ? '' : `<div class="champ"><label for="${id}-q">${e(t('sj.rech'))}</label><input id="${id}-q" type="search" autocomplete="off" placeholder="${e(t('sj.rechPh'))}"></div>`}
        ${o.statuts ? `<div class="champ"><label for="${id}-statut">${e(t('sj.statut'))}</label><select id="${id}-statut"><option value="">${e(t('sj.tousStatuts'))}</option>${STATUTS.map(s => `<option value="${s}">${e(NT.t('statut.' + s, null, NT.STATUTS[s]))}</option>`).join('')}</select></div>` : ''}
        <div class="champ"><label for="${id}-tri">${e(t('sj.tri'))}</label><select id="${id}-tri">${tris.map(x => `<option value="${x}">${e(t('t.' + x))}</option>`).join('')}</select></div>
      </div>
      <div class="sujets-puces" role="group" aria-labelledby="${id}-lbl"><span class="sujets-lbl" id="${id}-lbl">${e(t('sj.sujet'))} :</span><span class="sujets-liste"></span></div>`;
    o.conteneur.append(zone);
    const champQ = o.champRecherche || zone.querySelector(`#${id}-q`);
    const selTri = zone.querySelector(`#${id}-tri`), selStatut = zone.querySelector(`#${id}-statut`);
    const puces = zone.querySelector('.sujets-liste');
    let compte = o.compte;
    if (!compte) { compte = document.createElement('p'); compte.className = 'doux sujets-compte'; compte.setAttribute('aria-live', 'polite'); zone.append(compte); }
    champQ.value = etat.q; selTri.value = etat.tri; if (selStatut) selStatut.value = etat.statut;

    const correspond = (x, sansSujet) => {
      if (o.extraFiltre && !o.extraFiltre(x)) return false;
      if (etat.statut && o.statutDe(x) !== etat.statut) return false;
      if (etat.q && !sansAccent(o.texteDe(x)).includes(sansAccent(etat.q.trim()))) return false;
      if (!sansSujet && etat.sujets.size && !etat.sujets.has(o.sujetDe(x) || '')) return false;
      return true;
    };
    const comparer = (a, b) => {
      if (etat.tri === 'anciennes') return String(o.dateDe(a)).localeCompare(String(o.dateDe(b)));
      if (etat.tri === 'statut') return (ORDRE_STATUT[o.statutDe(a)] ?? 9) - (ORDRE_STATUT[o.statutDe(b)] ?? 9) || String(o.dateDe(b)).localeCompare(String(o.dateDe(a)));
      if (etat.tri === 'soutenus') return (o.soutiensDe(b) || 0) - (o.soutiensDe(a) || 0) || String(o.dateDe(b)).localeCompare(String(o.dateDe(a)));
      return String(o.dateDe(b)).localeCompare(String(o.dateDe(a)));
    };
    function memoriser() {
      const u = new URLSearchParams(location.search);
      const fixe = (k, v) => (v ? u.set(P(k), v) : u.delete(P(k)));
      fixe('sujet', [...etat.sujets].join(',')); fixe('tri', etat.tri === (o.triDefaut || 'recentes') ? '' : etat.tri); fixe('q', etat.q.trim()); fixe('statut', etat.statut);
      const s = u.toString();
      history.replaceState(history.state, '', location.pathname + (s ? '?' + s : '') + location.hash);
    }
    function appliquer(focusSujet) {
      const tous = o.elements();
      const base = tous.filter(x => correspond(x, true));
      const parSujet = new Map();
      tous.forEach(x => { const k = o.sujetDe(x) || ''; if (!parSujet.has(k)) parSujet.set(k, 0); });
      base.forEach(x => { const k = o.sujetDe(x) || ''; parSujet.set(k, parSujet.get(k) + 1); });
      const cles = [...parSujet.keys()].sort((a, b) => libelle(a).localeCompare(libelle(b), NT.i18n.langue));
      puces.innerHTML = `<button type="button" class="chip-sujet" data-sujet="" aria-pressed="${!etat.sujets.size}">${e(t('sj.tous'))} <span class="n">${base.length}</span></button>`
        + cles.map(k => `<button type="button" class="chip-sujet" data-sujet="${e(k)}" aria-pressed="${etat.sujets.has(k)}">${e(libelle(k))} <span class="n" aria-label="(${parSujet.get(k)})">${parSujet.get(k)}</span></button>`).join('');
      const liste = base.filter(x => !etat.sujets.size || etat.sujets.has(o.sujetDe(x) || '')).sort(comparer);
      const sujetsTxt = [...etat.sujets].map(libelle).join(', ');
      compte.textContent = o.libelleCompte ? o.libelleCompte(liste.length, tous.length) : (sujetsTxt ? t('sj.compteSujets', { n: liste.length, total: tous.length, s: sujetsTxt }) : t('sj.compte', { n: liste.length, total: tous.length }));
      memoriser();
      o.onChange(liste);
      if (focusSujet !== undefined) { const b = puces.querySelector(`[data-sujet="${CSS.escape(focusSujet)}"]`); if (b) b.focus(); }
    }
    puces.addEventListener('click', ev => {
      const b = ev.target.closest('[data-sujet]'); if (!b) return;
      const k = b.dataset.sujet;
      if (!k) etat.sujets.clear(); else if (etat.sujets.has(k)) etat.sujets.delete(k); else etat.sujets.add(k);
      appliquer(k);
    });
    champQ.addEventListener('input', () => { etat.q = champQ.value; appliquer(); });
    selTri.addEventListener('change', () => { etat.tri = selTri.value; appliquer(); });
    if (selStatut) selStatut.addEventListener('change', () => { etat.statut = selStatut.value; appliquer(); });
    appliquer();
    return { appliquer: () => appliquer(), etat };
  }
  NT.sujets = { monter, libelleService };
})();
