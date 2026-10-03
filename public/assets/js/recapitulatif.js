/* F56 — Récapitulatif de mes demandes : chiffres clés, tableau, dernière réponse ; export CSV (Excel français) et impression. */
(function () {
  'use strict';
  const NT = window.NT;
  const EN = {
    'rec.titre': 'Summary of my requests', 'rec.sous': 'The essentials of your requests on one page: where they stand, how long they take, and the latest answer received.',
    'rec.imprimer': 'Download (PDF / print)', 'rec.csv': 'Download the table (CSV)', 'rec.retour': 'Back to tracking',
    'rec.aide': 'The CSV file opens directly in Excel or LibreOffice. For a PDF, choose “Save as PDF” in the print window.',
    'rec.chiffres': 'In figures', 'rec.liste': 'My requests in detail',
    'rec.total': 'Requests in total', 'rec.st.recue': 'Received, not yet handled', 'rec.st.en_cours': 'Being handled', 'rec.st.traitee': 'Resolved', 'rec.st.cloturee': 'Closed',
    'rec.delai': 'Average processing time: {d}.', 'rec.delaiAucun': 'No request has been resolved yet, so no average time can be given.',
    'rec.h': '{n} h', 'rec.j': '{n} day(s)', 'rec.hj': 'about {n} day(s) ({h} hours)',
    'rec.c.ref': 'Number', 'rec.c.objet': 'Subject', 'rec.c.cat': 'Category', 'rec.c.date': 'Sent on', 'rec.c.statut': 'Status', 'rec.c.maj': 'Last update', 'rec.c.rep': 'Latest response',
    'rec.cat.contact': 'Contact', 'rec.cat.signalement': 'Problem report', 'rec.cat.demarche': 'Procedure',
    'rec.aucuneRep': 'No response yet.', 'rec.vide': 'You have not sent any request yet.', 'rec.nouvelle': 'Make a request', 'rec.cap': 'Summary of all your requests, most recent first',
    'rec.par': 'by {p}', 'rec.genere': 'Summary generated on {d} for {n}.', 'rec.erreur': 'The summary could not be loaded. Please try again.', 'rec.ok': 'File downloaded.'
  };
  NT.i18n.ajouter({ fr: {}, en: EN, es: EN, ar: EN });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = (sel, r) => (r || document).querySelector(sel);
  const STATUTS = { recue: 'Reçue, pas encore prise en charge', en_cours: 'En cours de traitement', traitee: 'Traitée', cloturee: 'Clôturée' };
  const COURT = { recue: 'Reçues', en_cours: 'En cours', traitee: 'Traitées', cloturee: 'Clôturées' };
  const CATS = { contact: 'Contact', signalement: 'Signalement', demarche: 'Démarche' };
  const ICONES = { recue: 'ph-envelope-simple-open', en_cours: 'ph-gear-six', traitee: 'ph-check-circle', cloturee: 'ph-lock-simple' };
  const lib = s => L('rec.st.' + s, STATUTS[s] || s);
  const badge = s => `<span class="statut statut-${E(s)}"><i class="ph-duotone ${ICONES[s] || 'ph-circle'}" aria-hidden="true"></i>${E(lib(s))}</span>`;
  const cat = t => L('rec.cat.' + t, CATS[t] || t);
  const nomService = sid => { const s = NT.services.get(sid); return s ? NT.i18n.choisir(s.nom) : sid; };
  const dateCourte = iso => NT.ui.date(iso, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dateHeure = iso => NT.ui.date(iso) + ' ' + new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const pad = n => String(n).padStart(2, '0');

  // Durée lisible : moins d'un jour en heures, sinon en jours
  function duree(h) {
    if (h < 24) return L('rec.h', '{n} h', { n: h });
    return L('rec.hj', 'environ {n} jour(s) ({h} heures)', { n: Math.round(h / 24), h });
  }
  // CSV pour Excel français : séparateur « ; », guillemets doublés, BOM UTF-8, protection contre les formules
  function celluleCsv(v) {
    let s = String(v == null ? '' : v).replace(/\r?\n/g, ' ');
    if (/^[=+\-@\t]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }

  NT.pret(() => {
    const r = NT.api('GET', '/api/mon-recapitulatif');
    if (r.statut !== 200 || !r.donnees) {
      $('#zone-table').innerHTML = `<p class="info-vide" role="alert">${E(L('rec.erreur', 'Le récapitulatif n’a pas pu être chargé. Réessayez.'))}</p>`;
      return;
    }
    const d = r.donnees;
    const nomComplet = `${d.habitant.prenom} ${d.habitant.nom}`;

    /* ----- Chiffres clés : le texte porte le sens, jamais la couleur seule ----- */
    const chiffres = [['total', L('rec.total', 'Demandes au total'), d.total]]
      .concat(['recue', 'en_cours', 'traitee', 'cloturee'].map(s => [s, lib(s), d.parStatut[s] || 0]));
    $('#chiffres').innerHTML = chiffres.map(c => `<li><span class="val">${c[2]}</span><span class="lib">${E(c[1])}</span></li>`).join('');
    $('#phrase-delai').textContent = d.delaiMoyenHeures === null ? L('rec.delaiAucun', 'Aucune demande n’est encore traitée : pas de délai moyen à indiquer.')
      : L('rec.delai', 'Délai moyen de traitement : {d}.', { d: duree(d.delaiMoyenHeures) });

    /* ----- Tableau ----- */
    $('#zone-table').innerHTML = d.demandes.length
      ? `<table class="table-info"><caption class="sr-only">${E(L('rec.cap', 'Récapitulatif de toutes vos demandes, de la plus récente à la plus ancienne'))}</caption>
        <thead><tr><th scope="col">${E(L('rec.c.ref', 'Numéro'))}</th><th scope="col">${E(L('rec.c.objet', 'Objet'))}</th><th scope="col">${E(L('rec.c.cat', 'Catégorie'))}</th>
        <th scope="col">${E(L('rec.c.date', 'Envoyée le'))}</th><th scope="col">${E(L('rec.c.statut', 'État'))}</th><th scope="col">${E(L('rec.c.maj', 'Dernière mise à jour'))}</th></tr></thead>
        <tbody>${d.demandes.map(x => `<tr><th scope="row" class="num"><a href="suivi.html?id=${encodeURIComponent(x.id)}">${E(x.id)}</a></th>
          <td>${E(x.objet)}<span class="rep">${x.reponse ? E(L('rec.c.rep', 'Dernière réponse')) + ' : ' + E(x.reponse.note) + ' (' + E(L('rec.par', 'par {p}', { p: x.reponse.par })) + ', ' + E(dateCourte(x.reponse.date)) + ')' : E(L('rec.aucuneRep', 'Pas encore de réponse.'))}</span></td>
          <td>${E(cat(x.type))}<span class="rep">${E(nomService(x.serviceId))}</span></td><td>${E(dateCourte(x.cree))}</td><td>${badge(x.statut)}</td><td>${E(dateCourte(x.maj))}</td></tr>`).join('')}</tbody></table>`
      : `<p class="info-vide">${E(L('rec.vide', 'Vous n’avez pas encore fait de demande.'))} <a href="demande.html">${E(L('rec.nouvelle', 'Faire une demande'))}</a></p>`;

    $('#entete-impression').textContent = L('rec.genere', 'Récapitulatif généré le {d} pour {n}.', { d: dateHeure(d.genere), n: nomComplet });

    /* ----- Actions ----- */
    $('#btn-imprimer').addEventListener('click', () => window.print());
    $('#btn-csv').addEventListener('click', () => {
      const entetes = ['Numéro', 'Objet', 'Catégorie', 'Service', 'Date de la demande', 'État', 'Dernière mise à jour', 'Dernière réponse', 'Auteur de la réponse', 'Date de la réponse']
        .map((fr, i) => L('rec.csv.' + i, fr));
      const lignes = d.demandes.map(x => [x.id, x.objet, cat(x.type), nomService(x.serviceId), dateCourte(x.cree), lib(x.statut), dateCourte(x.maj),
        x.reponse ? x.reponse.note : '', x.reponse ? x.reponse.par : '', x.reponse ? dateCourte(x.reponse.date) : '']);
      const csv = '﻿' + [entetes].concat(lignes).map(l => l.map(celluleCsv).join(';')).join('\r\n') + '\r\n';
      const dj = new Date();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = `recapitulatif-demandes-${dj.getFullYear()}-${pad(dj.getMonth() + 1)}-${pad(dj.getDate())}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      NT.ui.annoncer(L('rec.ok', 'Fichier téléchargé.'));
    });
  });
})();
