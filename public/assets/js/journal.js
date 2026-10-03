/* Terra Nova — Journal des actions (F47 Autorité de Contrôle, F48 Service Qualité).
   Page : agent-journal.html. Lit NT.audit.tous() (écrit par store.js et par les écrans de gestion).
   Script chargé en fin de body avec `defer` : rien ne lit NT.ui avant NT.pret(). */
(function () {
  'use strict';
  const NT = window.NT;
  const A = NT.agent;
  const T = (cle, fr, vars) => NT.t(cle, vars, fr);

  /* ---------- Traductions (FR = repli dans le code) ---------- */
  NT.i18n.ajouter({ en: {
    'jr.titre': 'Action log', 'jr.intro': 'Every sensitive action is recorded: who, what, when, before / after, and why. The city can therefore justify what was done on the platform.',
    'jr.lectureSeule': 'This log is read-only: no entry can be edited or deleted from the interface.', 'jr.resume': 'Summary of the day',
    'jr.filtrer': 'Filter the log', 'jr.categorie': 'Category', 'jr.intervenant': 'Person', 'jr.periode': 'Period', 'jr.recherchePh': 'Item, action, reason, person…',
    'jr.exporter': 'Export (CSV)', 'jr.caption': 'Action log, most recent first', 'jr.cDate': 'Date and time', 'jr.cQui': 'Who', 'jr.cAction': 'Action', 'jr.cObjet': 'Item', 'jr.cAvantApres': 'Before / after', 'jr.cMotif': 'Reason or note',
    'jr.plus': 'Show more actions', 'jr.toutes': 'All categories', 'jr.tous': 'Everyone', 'jr.pAujourdhui': 'Today', 'jr.p7': 'Last 7 days', 'jr.pTout': 'All time',
    'jr.c.demande': 'Request', 'jr.c.annonce': 'Announcement', 'jr.c.service': 'Service', 'jr.c.compte': 'Account', 'jr.c.rdv': 'Appointment',
    'jr.kAujourdhui': 'Actions today', 'jr.kParCat': 'Today by category', 'jr.kDernier': 'Latest person to act', 'jr.aucuneAujourdhui': 'No action recorded today.', 'jr.aucuneEntree': 'No action recorded yet.',
    'jr.compte': '{n} action(s) shown out of {total}', 'jr.aucune': 'No action matches these filters.',
    'jr.histoTitre': 'History of this item:', 'jr.histoNb': '{n} change(s), from the oldest to the most recent.', 'jr.histoVide': 'No change recorded for this item.',
    'jr.fermerHisto': 'Back to the full log', 'jr.voirHisto': 'History', 'jr.voirHistoDe': 'See the full history of {nom}', 'jr.ouvrir': 'Open the item', 'jr.filtrerPar': 'Show only actions by {nom}',
    'jr.par': 'by', 'jr.devient': 'becomes', 'jr.nouvelleValeur': 'Set to', 'jr.systeme': 'System', 'role.systeme': 'System',
    'jr.exporte': '{n} line(s) exported.', 'jr.exportVide': 'There is nothing to export with these filters.', 'jr.histoAnnonce': 'History of {nom} displayed.', 'jr.histoRetour': 'Full log displayed.',
    'jr.csv.date': 'Date and time', 'jr.csv.qui': 'Person', 'jr.csv.role': 'Role', 'jr.csv.cat': 'Category', 'jr.csv.action': 'Action', 'jr.csv.id': 'Identifier', 'jr.csv.objet': 'Item', 'jr.csv.avant': 'Before', 'jr.csv.apres': 'After', 'jr.csv.motif': 'Reason',
    'jr.a.statut': 'Status change', 'jr.a.diffAlerte': 'Alert broadcast', 'jr.a.pubAnnonce': 'Announcement published', 'jr.a.etatService': 'Service status change', 'jr.a.role': 'Role change',
    'jr.a.desactivation': 'Account deactivated', 'jr.a.reactivation': 'Account reactivated', 'jr.a.deblocage': 'Account unlocked', 'jr.a.suppression': 'Account deleted by its owner', 'jr.a.profil': 'Profile edited',
    'jr.a.levee': 'Alert lifted', 'jr.a.retrait': 'Announcement withdrawn',
    'jr.v.active': 'Active', 'jr.v.levee': 'Lifted', 'jr.v.actif': 'Active', 'jr.v.desactive': 'Deactivated', 'jr.v.verrouille': 'Locked', 'jr.v.supprime': 'Deleted',
    'ag.derniers': 'Latest actions', 'ag.voirJournal': 'Open the action log', 'ag.aucuneAction': 'No action recorded yet.'
  } });

  const CATS = { demande: ['ph-tray', 'Demande'], annonce: ['ph-megaphone', 'Annonce'], service: ['ph-buildings', 'Service'], compte: ['ph-users', 'Compte'], rdv: ['ph-calendar-check', 'Rendez-vous'] };
  const ACTIONS = {
    'Changement de statut': ['jr.a.statut'], 'Diffusion d’une alerte': ['jr.a.diffAlerte'], 'Publication d’une annonce': ['jr.a.pubAnnonce'], 'Changement d’état du service': ['jr.a.etatService'],
    'Changement de rôle': ['jr.a.role'], 'Désactivation du compte': ['jr.a.desactivation'], 'Réactivation du compte': ['jr.a.reactivation'], 'Déblocage du compte': ['jr.a.deblocage'],
    'Suppression du compte par son titulaire': ['jr.a.suppression'], 'Modification du profil': ['jr.a.profil'], 'Levée d’une alerte': ['jr.a.levee'], 'Retrait d’une annonce': ['jr.a.retrait']
  };
  const VALEURS = { 'Active': 'jr.v.active', 'Levée': 'jr.v.levee', 'Actif': 'jr.v.actif', 'Désactivé': 'jr.v.desactive', 'Verrouillé': 'jr.v.verrouille', 'Supprimé': 'jr.v.supprime' };
  const ROLES_FR = { citoyen: 'Citoyen', agent: 'Agent municipal', admin: 'Administrateur', systeme: 'Système' };

  const catLabel = c => T('jr.c.' + c, (CATS[c] || [])[1] || c);
  const catIcone = c => (CATS[c] || [])[0] || 'ph-circle';
  const actionLabel = a => (ACTIONS[a] ? T(ACTIONS[a][0], a) : a);
  const roleLabel = r => T('role.' + r, ROLES_FR[r] || NT.ROLES[r] || r);
  const sansAccent = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const locale = () => ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[NT.i18n.langue] || 'fr-FR');
  const absolu = iso => new Date(iso).toLocaleString(locale(), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const nomActeur = e => e.acteurNom || T('jr.systeme', 'Système');

  /* Valeur « avant » / « après » lisible : statuts de demande et états de service traduits */
  function valeur(e, v) {
    if (v == null || v === '') return '';
    v = String(v);
    if (e.categorie === 'demande') {
      const code = Object.keys(NT.STATUTS).find(k => NT.STATUTS[k] === v);
      if (code) return T('statut.' + code, v);
    }
    if (e.categorie === 'service' && (v === 'ok' || v === 'maintenance' || v === 'incident')) return A.etatLabel(v);
    if (VALEURS[v]) return T(VALEURS[v], v);
    return v;
  }

  function lienObjet(e) {
    const id = e.objetId; if (!id) return '';
    switch (e.categorie) {
      case 'demande': return 'suivi.html?id=' + encodeURIComponent(id);
      case 'annonce': return 'annonces.html#' + encodeURIComponent(id);
      case 'service': return 'services.html#' + encodeURIComponent(id);
      case 'compte': return 'admin-comptes.html';
      case 'rdv': return 'rendez-vous.html';
      default: return '';
    }
  }

  const toutes = () => (NT.audit.tous() || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));

  /* Exposé pour agent.html (bloc « Dernières actions ») */
  NT.journalVue = { catIcone, catLabel, actionLabel, nomActeur, toutes };

  /* =====================================================================
     Page agent-journal.html
     ===================================================================== */
  NT.pret(() => {
    const el = id => document.getElementById(id);
    if (!el('lignes')) return;               // chargé depuis une autre page : rien à construire
    const E = NT.ui.echap;
    NT.i18n.appliquer(document.getElementById('contenu'));   // le dictionnaire EN de ce fichier est arrivé après ui.js

    const PAS = 50;
    const S = { cat: '', acteur: '', periode: 'tout', q: '', objet: '', n: PAS };

    /* ---------- Paramètres d'URL (?objet=, ?acteur=, ?categorie=) ---------- */
    const pObjet = NT.ui.param('objet'), pActeur = NT.ui.param('acteur'), pCat = NT.ui.param('categorie');
    if (pObjet) S.objet = pObjet;
    if (pCat && CATS[pCat]) S.cat = pCat;
    if (pActeur) {
      const m = toutes().find(e => e.acteurId && e.acteurId === pActeur);
      S.acteur = m ? m.acteurNom : pActeur;
    }

    /* ---------- Listes déroulantes ---------- */
    function remplirFiltres() {
      el('f-cat').innerHTML = `<option value="">${E(T('jr.toutes', 'Toutes les catégories'))}</option>` +
        Object.keys(CATS).map(c => `<option value="${c}">${E(catLabel(c))}</option>`).join('');
      const noms = [...new Set(toutes().map(nomActeur))].sort((a, b) => a.localeCompare(b));
      if (S.acteur && !noms.includes(S.acteur)) noms.push(S.acteur);
      el('f-acteur').innerHTML = `<option value="">${E(T('jr.tous', 'Tous les intervenants'))}</option>` + noms.map(n => `<option value="${E(n)}">${E(n)}</option>`).join('');
      el('f-periode').innerHTML = [['jour', T('jr.pAujourdhui', 'Aujourd’hui')], ['7j', T('jr.p7', '7 derniers jours')], ['tout', T('jr.pTout', 'Tout')]]
        .map(([v, l]) => `<option value="${v}">${E(l)}</option>`).join('');
    }
    function synchroniserChamps() {
      el('f-cat').value = S.cat; el('f-acteur').value = S.acteur; el('f-periode').value = S.periode; el('f-q').value = S.q;
    }

    /* ---------- Filtrage ---------- */
    function limitePeriode() {
      if (S.periode === 'jour') { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
      if (S.periode === '7j') return Date.now() - 7 * 86400000;
      return 0;
    }
    function filtrees() {
      const lim = limitePeriode(), q = sansAccent(S.q.trim());
      return toutes().filter(e => {
        if (S.objet && e.objetId !== S.objet) return false;
        if (S.cat && e.categorie !== S.cat) return false;
        if (S.acteur && nomActeur(e) !== S.acteur) return false;
        if (lim && new Date(e.date).getTime() < lim) return false;
        if (q && !sansAccent([e.objetLibelle, e.objetId, e.action, actionLabel(e.action), valeur(e, e.avant), valeur(e, e.apres), e.motif, nomActeur(e), catLabel(e.categorie)].join(' ')).includes(q)) return false;
        return true;
      });
    }

    /* ---------- Résumé du jour ---------- */
    function resume() {
      const tout = toutes();
      const debut = new Date(); debut.setHours(0, 0, 0, 0);
      const jour = tout.filter(e => new Date(e.date).getTime() >= debut.getTime());
      const par = Object.keys(CATS).map(c => [c, jour.filter(e => e.categorie === c).length]).filter(x => x[1] > 0);
      const dernier = tout[0];
      el('resume').innerHTML = `
        <div class="kpi fort"><div class="valeur">${jour.length}</div><div class="libelle">${E(T('jr.kAujourdhui', 'Actions aujourd’hui'))}</div></div>
        <div class="kpi"><p class="intitule">${E(T('jr.kParCat', 'Aujourd’hui, par catégorie'))}</p>
          ${par.length ? `<ul class="jr-par-cat">${par.map(([c, n]) => `<li><i class="ph-duotone ${catIcone(c)}" aria-hidden="true"></i>${E(catLabel(c))} <strong>${n}</strong></li>`).join('')}</ul>`
            : `<p class="doux" style="margin:0">${E(T('jr.aucuneAujourdhui', 'Aucune action enregistrée aujourd’hui.'))}</p>`}</div>
        <div class="kpi"><p class="intitule">${E(T('jr.kDernier', 'Dernier intervenant'))}</p>
          ${dernier ? `<div class="jr-dernier"><span>${E(nomActeur(dernier))}</span><span class="badge-role">${E(roleLabel(dernier.acteurRole))}</span></div>
            <p class="doux">${E(actionLabel(dernier.action))} · <time datetime="${E(dernier.date)}">${E(NT.ui.depuis(dernier.date))}</time></p>`
            : `<p class="doux" style="margin:0">${E(T('jr.aucuneEntree', 'Aucune action enregistrée pour le moment.'))}</p>`}</div>`;
    }

    /* ---------- Historique d'un élément (frise) ---------- */
    function histo() {
      const box = el('histo');
      if (!S.objet) { box.hidden = true; box.innerHTML = ''; return; }
      const l = toutes().filter(e => e.objetId === S.objet).reverse();      // ordre chronologique
      const dernier = l[l.length - 1];
      const libelle = dernier ? (dernier.objetLibelle || S.objet) : S.objet;
      const lien = dernier ? lienObjet(dernier) : '';
      box.hidden = false;
      box.innerHTML = `
        <div class="ligne entre">
          <h2 id="t-histo" tabindex="-1"><i class="ph-duotone ph-clock-counter-clockwise" aria-hidden="true"></i> ${E(T('jr.histoTitre', 'Historique de l’élément :'))} ${E(libelle)} <span class="jr-id">${E(S.objet)}</span></h2>
          <button type="button" class="btn" data-fin-objet><i class="ph ph-x" aria-hidden="true"></i><span>${E(T('jr.fermerHisto', 'Revenir au journal complet'))}</span></button>
        </div>
        <p class="doux" style="margin:.5rem 0 0">${l.length ? E(T('jr.histoNb', '{n} modification(s), de la plus ancienne à la plus récente.', { n: l.length })) : E(T('jr.histoVide', 'Aucune modification enregistrée pour cet élément.'))}
          ${lien ? ` <a href="${E(lien)}">${E(T('jr.ouvrir', 'Ouvrir l’élément'))}</a>` : ''}</p>
        ${l.length ? `<ol class="etapes">${l.map(e => `<li class="faite">
          <strong>${E(actionLabel(e.action))}</strong>
          <span class="doux"> · <time datetime="${E(e.date)}">${E(absolu(e.date))}</time> · ${E(T('jr.par', 'par'))} ${E(nomActeur(e))} (${E(roleLabel(e.acteurRole))})</span>
          <div>${avantApres(e)}</div>
          ${e.motif ? `<div class="doux">${E(e.motif)}</div>` : ''}</li>`).join('')}</ol>` : ''}`;
    }

    function avantApres(e) {
      const av = valeur(e, e.avant), ap = valeur(e, e.apres);
      if (!av && !ap) return `<span class="jr-vide">–</span>`;
      if (!av) return `<span class="doux">${E(T('jr.nouvelleValeur', 'Défini sur'))}</span> <span class="jr-ap">${E(ap)}</span>`;
      if (!ap) return `<span class="jr-av">${E(av)}</span>`;
      return `<span class="jr-av-ap"><span class="jr-av">${E(av)}</span><i class="ph ph-arrow-right" aria-hidden="true"></i><span class="sr-only">${E(T('jr.devient', 'devient'))}</span><span class="jr-ap">${E(ap)}</span></span>`;
    }

    /* ---------- Tableau ---------- */
    function rendre() {
      const l = filtrees(), visibles = l.slice(0, S.n);
      el('compte').textContent = T('jr.compte', '{n} action(s) affichée(s) sur {total}', { n: visibles.length, total: l.length });
      el('lignes').innerHTML = visibles.length ? visibles.map(e => {
        const lien = lienObjet(e), lib = e.objetLibelle || e.objetId || '–';
        return `<tr>
          <th scope="row" class="jr-quand"><time datetime="${E(e.date)}"><strong>${E(NT.ui.depuis(e.date))}</strong><span class="doux">${E(absolu(e.date))}</span></time></th>
          <td><div class="jr-qui"><button type="button" class="jr-lien" data-acteur="${E(nomActeur(e))}" title="${E(T('jr.filtrerPar', 'Voir uniquement les actions de {nom}', { nom: nomActeur(e) }))}">${E(nomActeur(e))}</button>
            <span class="badge-role">${E(roleLabel(e.acteurRole))}</span></div></td>
          <td><span class="jr-cat"><i class="ph-duotone ${catIcone(e.categorie)}" aria-hidden="true"></i>${E(catLabel(e.categorie))}</span><span class="jr-action">${E(actionLabel(e.action))}</span></td>
          <td>${lien ? `<a href="${E(lien)}">${E(lib)}</a>` : E(lib)}
            ${e.objetId ? `<span class="jr-id-cell">${E(e.objetId)}</span>
              <button type="button" class="jr-lien" data-objet="${E(e.objetId)}" aria-label="${E(T('jr.voirHistoDe', 'Voir tout l’historique de {nom}', { nom: lib }))}">${E(T('jr.voirHisto', 'Historique'))}</button>` : ''}</td>
          <td>${avantApres(e)}</td>
          <td class="jr-note">${e.motif ? E(e.motif) : '<span class="jr-vide">–</span>'}</td></tr>`;
      }).join('') : `<tr><td colspan="6" class="doux">${E(T('jr.aucune', 'Aucune action ne correspond à ces filtres.'))}</td></tr>`;
      el('plus').hidden = l.length <= S.n;
    }

    function tout() { histo(); rendre(); }

    /* ---------- Événements ---------- */
    el('f-cat').addEventListener('change', ev => { S.cat = ev.target.value; S.n = PAS; tout(); });
    el('f-acteur').addEventListener('change', ev => { S.acteur = ev.target.value; S.n = PAS; tout(); });
    el('f-periode').addEventListener('change', ev => { S.periode = ev.target.value; S.n = PAS; tout(); });
    el('f-q').addEventListener('input', ev => { S.q = ev.target.value; S.n = PAS; tout(); });
    el('plus').addEventListener('click', () => { S.n += PAS; rendre(); });

    function majUrl() {
      try {
        const u = new URL(location.href); u.searchParams.delete('acteur'); u.searchParams.delete('categorie');
        if (S.objet) u.searchParams.set('objet', S.objet); else u.searchParams.delete('objet');
        history.replaceState(null, '', u.pathname + u.search + u.hash);
      } catch (x) { /* ignoré */ }
    }
    function ouvrirHisto(id) {
      S.objet = id; S.cat = ''; S.acteur = ''; S.periode = 'tout'; S.q = ''; S.n = PAS;
      synchroniserChamps(); majUrl(); tout();
      const h = el('t-histo'); if (h) h.focus();
      const dernier = toutes().find(e => e.objetId === id);
      NT.ui.annoncer(T('jr.histoAnnonce', 'Historique de {nom} affiché.', { nom: dernier ? dernier.objetLibelle || id : id }));
    }
    function fermerHisto() {
      S.objet = ''; S.n = PAS; majUrl(); tout();
      el('f-cat').focus();
      NT.ui.annoncer(T('jr.histoRetour', 'Journal complet affiché.'));
    }
    el('lignes').addEventListener('click', ev => {
      const o = ev.target.closest('[data-objet]'); if (o) { ouvrirHisto(o.dataset.objet); return; }
      const a = ev.target.closest('[data-acteur]');
      if (a) { S.acteur = a.dataset.acteur; S.n = PAS; synchroniserChamps(); tout(); el('f-acteur').focus(); }
    });
    el('histo').addEventListener('click', ev => { if (ev.target.closest('[data-fin-objet]')) fermerHisto(); });

    /* ---------- Export CSV (justification auprès de l'autorité de contrôle) ---------- */
    const cellule = v => {
      let s = String(v == null ? '' : v).replace(/\r?\n/g, ' ');
      if (/^[=+\-@\t]/.test(s)) s = '\'' + s;            // neutralise l'injection de formule dans un tableur
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const p2 = n => String(n).padStart(2, '0');
    const dateCsv = iso => { const d = new Date(iso); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()); };
    el('exporter').addEventListener('click', () => {
      const l = filtrees();
      if (!l.length) { NT.ui.toast(T('jr.exportVide', 'Il n’y a rien à exporter avec ces filtres.'), 'warning'); return; }
      const entetes = [T('jr.csv.date', 'Date et heure'), T('jr.csv.qui', 'Intervenant'), T('jr.csv.role', 'Rôle'), T('jr.csv.cat', 'Catégorie'), T('jr.csv.action', 'Action'),
        T('jr.csv.id', 'Identifiant'), T('jr.csv.objet', 'Élément'), T('jr.csv.avant', 'Avant'), T('jr.csv.apres', 'Après'), T('jr.csv.motif', 'Motif')];
      const lignes = [entetes.map(cellule).join(';')].concat(l.map(e => [dateCsv(e.date), nomActeur(e), roleLabel(e.acteurRole), catLabel(e.categorie), actionLabel(e.action),
        e.objetId, e.objetLibelle, valeur(e, e.avant), valeur(e, e.apres), e.motif].map(cellule).join(';')));
      const blob = new Blob(['﻿' + lignes.join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const d = new Date();
      a.href = url; a.download = 'journal-actions-' + d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + '.csv';
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      NT.ui.toast(T('jr.exporte', '{n} ligne(s) exportée(s).', { n: l.length }), 'success');
    });

    /* ---------- Démarrage ---------- */
    remplirFiltres(); synchroniserChamps(); resume(); tout();
  });
})();
