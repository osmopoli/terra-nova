/* F55 — Mes informations : tout ce que la ville conserve sur moi, par thème, avec la raison et la durée. */
(function () {
  'use strict';
  const NT = window.NT;
  const EN = {
    'inf.titre': 'My personal information', 'inf.sous': 'Everything the city keeps about you, sorted by theme. For each theme you know why and for how long.',
    'inf.imprimer': 'Download (PDF / print)', 'inf.json': 'Download the file (JSON)',
    'inf.aidePdf': 'For a PDF, choose “Save as PDF” in the print window. The JSON file is meant for software; it contains the same information.',
    'inf.sommaire': 'On this page', 'inf.pourquoi': 'Why we keep it:', 'inf.duree': 'How long:',
    'inf.generePar': 'Document generated on {d} for {n}. Only your own information appears here.',
    'inf.s.profil': 'Who you are', 'inf.s.compte': 'Your account and its security', 'inf.s.demandes': 'Your requests', 'inf.s.rdv': 'Your appointments',
    'inf.s.soutiens': 'Reports you support', 'inf.s.contrib': 'Your questions about your data', 'inf.s.notifs': 'Your notifications', 'inf.s.prefs': 'Your preferences',
    'inf.p.profil': 'To recognise you and write to you about your requests.', 'inf.d.profil': 'As long as your account exists.',
    'inf.p.compte': 'To let you log in and to detect hacking attempts. Your password is never shown and cannot be read, even by the city: only a scrambled version is stored.', 'inf.d.compte': 'As long as your account exists.',
    'inf.p.demandes': 'To process your requests and show you where they stand.', 'inf.d.demandes': 'As long as your account exists, then deleted with it.',
    'inf.p.rdv': 'To book a slot and send you a reminder.', 'inf.d.rdv': 'As long as your account exists.',
    'inf.p.soutiens': 'To count how many residents support a problem, so the most shared ones are handled first.', 'inf.d.soutiens': 'Until you withdraw your support or delete your account.',
    'inf.p.contrib': 'To answer you within 15 days.', 'inf.d.contrib': 'As long as your account exists.',
    'inf.p.notifs': 'To keep you informed of the progress of your requests.', 'inf.d.notifs': 'As long as your account exists.',
    'inf.p.prefs': 'To adapt alerts and reminders to you.', 'inf.d.prefs': 'As long as your account exists.',
    'inf.f.nom': 'Name', 'inf.f.email': 'E-mail', 'inf.f.tel': 'Phone', 'inf.f.quartier': 'Neighbourhood', 'inf.f.profil': 'Account type', 'inf.role.citoyen': 'Resident',
    'inf.f.cree': 'Account created on', 'inf.f.derniere': 'Last login', 'inf.f.nbCo': 'Logins recorded', 'inf.f.etat': 'Account status', 'inf.actif': 'Active', 'inf.inactif': 'Disabled',
    'inf.f.mdp': 'Password', 'inf.mdp': 'Protected: stored in scrambled form, never displayed', 'inf.inconnue': 'Not known', 'inf.nonRenseigne': 'Not provided',
    'inf.c.ref': 'Number', 'inf.c.objet': 'Subject', 'inf.c.date': 'Sent on', 'inf.c.statut': 'Status', 'inf.c.maj': 'Last update', 'inf.c.service': 'Service', 'inf.c.heure': 'Date and time', 'inf.c.motif': 'Reason', 'inf.c.rappel': 'Reminder',
    'inf.c.sujet': 'Subject', 'inf.c.reponse': 'Answer', 'inf.c.commentaire': 'Your comment',
    'inf.st.recue': 'Received, not yet handled', 'inf.st.en_cours': 'Being handled', 'inf.st.traitee': 'Resolved', 'inf.st.cloturee': 'Closed',
    'inf.rdv.confirme': 'Confirmed', 'inf.rdv.annule': 'Cancelled', 'inf.oui': 'Yes', 'inf.non': 'No',
    'inf.vide.demandes': 'You have not sent any request.', 'inf.vide.rdv': 'No appointment.', 'inf.vide.soutiens': 'You do not support any report.', 'inf.vide.contrib': 'You have not sent any question.',
    'inf.nbDemandes': '{n} request(s) in total.', 'inf.nbRdv': '{n} appointment(s) in total.',
    'inf.dernier': 'Last answer', 'inf.aucuneRep': 'No answer from the city yet.',
    'inf.notifs': '{t} notification(s) kept, of which {n} unread.',
    'inf.f.langue': 'Language', 'inf.f.alertes': 'Alerts for my neighbourhood', 'inf.f.vuln': 'Reinforced follow-up (vulnerable person)', 'inf.f.rappels': 'Appointment reminders', 'inf.langueAuto': 'Chosen automatically',
    'inf.erreur': 'Your information could not be loaded. Please try again.', 'inf.modif': 'To correct something, go to', 'inf.monCompte': 'my account',
    'inf.recap': 'See the summary of my requests', 'inf.json.ok': 'File downloaded.'
  };
  NT.i18n.ajouter({ fr: {}, en: EN, es: EN, ar: EN });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = (sel, r) => (r || document).querySelector(sel);
  const LANGUES = { fr: 'Français', en: 'English', es: 'Español', ar: 'العربية' };
  const STATUTS = { recue: 'Reçue, pas encore prise en charge', en_cours: 'En cours de traitement', traitee: 'Traitée', cloturee: 'Clôturée' };
  const ICONES = { recue: 'ph-envelope-simple-open', en_cours: 'ph-gear-six', traitee: 'ph-check-circle', cloturee: 'ph-lock-simple' };
  const badge = s => `<span class="statut statut-${E(s)}"><i class="ph-duotone ${ICONES[s] || 'ph-circle'}" aria-hidden="true"></i>${E(L('inf.st.' + s, STATUTS[s] || s))}</span>`;
  const nomService = sid => { const s = NT.services.get(sid); return s ? NT.i18n.choisir(s.nom) : sid; };
  const dateLongue = iso => (iso ? NT.ui.date(iso) : L('inf.inconnue', 'Inconnue'));
  const dateHeure = iso => (iso ? NT.ui.date(iso) + ' ' + new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : L('inf.inconnue', 'Inconnue'));
  const SUJETS = { donnees: 'Utilisation de mes données', agents: 'Accès des agents à mes données', suppression: 'Suppression de mes données', securite: 'Sécurité de mon compte', autre: 'Autre' };

  NT.pret(() => {
    const u = NT.auth.utilisateur();
    const r = NT.api('GET', '/api/mes-informations');
    const zone = $('#sections');
    if (!u || r.statut !== 200 || !r.donnees) {
      zone.innerHTML = `<p class="info-vide" role="alert">${E(L('inf.erreur', 'Vos informations n’ont pas pu être chargées. Réessayez.'))}</p>`;
      return;
    }
    const d = r.donnees;
    const fiche = lignes => `<dl class="info-fiche">${lignes.map(([k, v]) => `<dt>${E(k)}</dt><dd>${E(v)}</dd>`).join('')}</dl>`;
    const tableau = (legende, colonnes, lignes) => `<div class="table-defile"><table class="table-info"><caption class="sr-only">${E(legende)}</caption>` +
      `<thead><tr>${colonnes.map(c => `<th scope="col">${E(c)}</th>`).join('')}</tr></thead><tbody>${lignes.join('')}</tbody></table></div>`;
    const VIDES = { demandes: 'Vous n’avez envoyé aucune demande.', rdv: 'Aucun rendez-vous.', soutiens: 'Vous ne soutenez aucun signalement.', contrib: 'Vous n’avez envoyé aucune question.' };
    const vide = cle => `<p class="info-vide">${E(L('inf.vide.' + cle, VIDES[cle]))}</p>`;
    const nonRens = L('inf.nonRenseigne', 'Non renseigné');

    const demandes = d.demandes.slice().sort((a, b) => b.cree.localeCompare(a.cree));
    const sections = [
      ['profil', 'ph-identification-card', 'Qui vous êtes', fiche([
        [L('inf.f.nom', 'Nom'), `${d.profil.prenom} ${d.profil.nom}`], [L('inf.f.email', 'E-mail'), d.profil.email],
        [L('inf.f.tel', 'Téléphone'), d.profil.telephone || nonRens], [L('inf.f.quartier', 'Quartier'), d.profil.quartier || nonRens],
        [L('inf.f.profil', 'Type de compte'), L('inf.role.' + d.profil.role, 'Habitant')]]) +
        `<p class="mention-doc sans-impression">${E(L('inf.modif', 'Pour corriger une information, rendez-vous dans'))} <a href="compte.html">${E(L('inf.monCompte', 'mon compte'))}</a>.</p>`],
      ['compte', 'ph-shield-check', 'Votre compte et sa sécurité', fiche([
        [L('inf.f.cree', 'Compte créé le'), dateLongue(d.compte.cree)], [L('inf.f.derniere', 'Dernière connexion'), dateHeure(d.compte.derniereConnexion)],
        [L('inf.f.nbCo', 'Connexions enregistrées'), String(d.compte.nbConnexions)], [L('inf.f.etat', 'État du compte'), d.compte.actif ? L('inf.actif', 'Actif') : L('inf.inactif', 'Désactivé')],
        [L('inf.f.mdp', 'Mot de passe'), L('inf.mdp', 'Protégé : conservé sous forme brouillée, jamais affiché')]])],
      ['demandes', 'ph-file-text', 'Vos demandes', demandes.length
        ? `<p>${E(L('inf.nbDemandes', '{n} demande(s) au total.', { n: demandes.length }))}</p>` + tableau(L('inf.s.demandes', 'Vos demandes'),
          [L('inf.c.ref', 'Numéro'), L('inf.c.objet', 'Objet'), L('inf.c.service', 'Service'), L('inf.c.date', 'Envoyée le'), L('inf.c.statut', 'État'), L('inf.c.maj', 'Dernière mise à jour')],
          demandes.map(x => `<tr><th scope="row" class="num">${E(x.id)}</th><td>${E(x.objet)}${x.reponse ? `<span class="rep">${E(L('inf.dernier', 'Dernière réponse'))} : ${E(x.reponse.note)}</span>` : `<span class="rep">${E(L('inf.aucuneRep', 'Pas encore de réponse de la ville.'))}</span>`}</td>` +
            `<td>${E(nomService(x.serviceId))}</td><td>${E(dateLongue(x.cree))}</td><td>${badge(x.statut)}</td><td>${E(dateLongue(x.maj))}</td></tr>`)) +
          `<p class="mention-doc sans-impression"><a href="recapitulatif.html">${E(L('inf.recap', 'Voir le récapitulatif de mes demandes'))}</a></p>` : vide('demandes')],
      ['rdv', 'ph-calendar-check', 'Vos rendez-vous', d.rendezVous.length
        ? tableau(L('inf.s.rdv', 'Vos rendez-vous'), [L('inf.c.service', 'Service'), L('inf.c.heure', 'Date et heure'), L('inf.c.motif', 'Motif'), L('inf.c.statut', 'État'), L('inf.c.rappel', 'Rappel')],
          d.rendezVous.slice().sort((a, b) => b.debut.localeCompare(a.debut)).map(x => `<tr><th scope="row">${E(nomService(x.serviceId))}</th><td>${E(dateHeure(x.debut))}</td><td>${E(x.motif || '—')}</td>` +
            `<td>${E(L('inf.rdv.' + x.statut, x.statut === 'annule' ? 'Annulé' : 'Confirmé'))}</td><td>${E(x.rappel ? L('inf.oui', 'Oui') : L('inf.non', 'Non'))}</td></tr>`)) : vide('rdv')],
      ['soutiens', 'ph-hand-heart', 'Signalements que vous soutenez', d.soutiens.length
        ? `<ul class="liste-resume">${d.soutiens.map(s => `<li><strong>${E(s.demandeId)} · ${E(s.objet)}</strong><span class="meta">${E(dateLongue(s.date))}${s.commentaire ? ' · ' + E(L('inf.c.commentaire', 'Votre commentaire')) + ' : ' + E(s.commentaire) : ''}</span></li>`).join('')}</ul>` : vide('soutiens')],
      ['contrib', 'ph-chat-circle-text', 'Vos questions sur vos données', d.contributions.length
        ? `<ul class="liste-resume">${d.contributions.map(c => `<li><strong>${E(c.id)} · ${E(L('don.sujet.' + c.sujet, SUJETS[c.sujet] || c.sujet))}</strong><span class="meta">${E(dateLongue(c.cree))}</span>` +
          `<p>${E(c.message)}</p>${c.reponse ? `<p><strong>${E(L('inf.c.reponse', 'Réponse'))} :</strong> ${E(c.reponse)}</p>` : ''}</li>`).join('')}</ul>` : vide('contrib')],
      ['notifs', 'ph-bell', 'Vos notifications', `<p>${E(L('inf.notifs', '{t} notification(s) conservée(s), dont {n} non lue(s).', { t: d.notifications.total, n: d.notifications.nonLues }))}</p>`],
      ['prefs', 'ph-sliders-horizontal', 'Vos préférences', fiche([
        [L('inf.f.langue', 'Langue'), d.preferences.langue ? (LANGUES[d.preferences.langue] || d.preferences.langue) : L('inf.langueAuto', 'Choisie automatiquement')],
        [L('inf.f.alertes', 'Alertes de mon quartier'), d.preferences.alertesQuartier ? L('inf.oui', 'Oui') : L('inf.non', 'Non')],
        [L('inf.f.vuln', 'Suivi renforcé (personne vulnérable)'), d.preferences.vulnerable ? L('inf.oui', 'Oui') : L('inf.non', 'Non')],
        [L('inf.f.rappels', 'Rappels de rendez-vous'), d.preferences.rappelsRdv ? L('inf.oui', 'Oui') : L('inf.non', 'Non')]])]
    ];
    const PQ = { profil: 'Vous reconnaître et vous écrire au sujet de vos démarches.', compte: 'Vous laisser vous connecter et détecter les tentatives de piratage. Votre mot de passe n’est jamais affiché et la ville ne peut pas le lire : seule une version brouillée est conservée.',
      demandes: 'Traiter vos demandes et vous montrer où elles en sont.', rdv: 'Réserver un créneau et vous envoyer un rappel.', soutiens: 'Compter combien d’habitants soutiennent un problème pour traiter en premier les plus partagés.',
      contrib: 'Vous répondre sous 15 jours.', notifs: 'Vous tenir au courant de l’avancement de vos demandes.', prefs: 'Adapter les alertes et les rappels à vos besoins.' };
    const DUREE = { profil: 'Tant que votre compte existe.', compte: 'Tant que votre compte existe.', demandes: 'Tant que votre compte existe, puis effacées avec lui.', rdv: 'Tant que votre compte existe.',
      soutiens: 'Jusqu’à ce que vous retiriez votre soutien ou supprimiez votre compte.', contrib: 'Tant que votre compte existe.', notifs: 'Tant que votre compte existe.', prefs: 'Tant que votre compte existe.' };
    const TITRES = {};
    sections.forEach(s => { TITRES[s[0]] = s[2]; });

    $('#sommaire').innerHTML = sections.map(s => `<li><a href="#s-${s[0]}">${E(L('inf.s.' + s[0], s[2]))}</a></li>`).join('');
    zone.innerHTML = sections.map(([cle, ico, titre, corps]) => `<section class="info-bloc" id="s-${cle}" aria-labelledby="t-${cle}">
      <h2 id="t-${cle}"><i class="ph-duotone ${ico}" aria-hidden="true"></i><span>${E(L('inf.s.' + cle, titre))}</span></h2>
      <p class="info-pourquoi"><strong>${E(L('inf.pourquoi', 'Pourquoi nous les gardons :'))}</strong> ${E(L('inf.p.' + cle, PQ[cle]))} <strong>${E(L('inf.duree', 'Combien de temps :'))}</strong> ${E(L('inf.d.' + cle, DUREE[cle]))}</p>
      ${corps}</section>`).join('');

    $('#entete-impression').textContent = L('inf.generePar', 'Document généré le {d} pour {n}. Seules vos propres informations y figurent.', { d: dateHeure(d.exporte), n: `${d.profil.prenom} ${d.profil.nom}` });

    $('#btn-imprimer').addEventListener('click', () => window.print());
    $('#btn-json').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'mes-informations-terra-nova.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      NT.ui.annoncer(L('inf.json.ok', 'Fichier téléchargé.'));
    });
  });
})();
