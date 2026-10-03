/* F51 — Vos données : explication claire, contributions des habitants, réponses du personnel. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: {},
    en: {
      'don.titre': 'Your data, explained simply', 'don.sous': 'What Terra Nova keeps about you, why, who can see it, and how to ask us a question or raise a concern.',
      'don.sommaire': 'On this page', 'don.collecte': 'What we keep', 'don.acces': 'Who can see it', 'don.droits': 'Your rights', 'don.question': 'Ask a question or raise a concern', 'don.mes': 'My contributions',
      'don.collecteCap': 'Data kept, the reason and how long it is kept', 'don.cDonnee': 'Data', 'don.cPourquoi': 'Why', 'don.cDuree': 'For how long',
      'don.d1': 'Your profile (name, e-mail, phone)', 'don.d1p': 'To recognise you and write to you about your requests.', 'don.d1d': 'As long as your account exists.',
      'don.d2': 'Your neighbourhood', 'don.d2p': 'To send you the alerts that concern your area.', 'don.d2d': 'As long as your account exists.',
      'don.d3': 'Your requests and reports', 'don.d3p': 'To process them and show you where they stand.', 'don.d3d': 'As long as your account exists, then deleted with it.',
      'don.d4': 'Your appointments', 'don.d4p': 'To book a slot and send you a reminder.', 'don.d4d': 'As long as your account exists.',
      'don.d5': 'Your notifications', 'don.d5p': 'To keep you informed of the progress of your requests.', 'don.d5d': 'As long as your account exists.',
      'don.d6': 'The login log', 'don.d6p': 'To detect hacking attempts and protect your account.', 'don.d6d': 'Kept for security, deleted with your account.',
      'don.jamais1a': 'Never sold', 'don.jamais1b': ': your data is not sold to anyone.', 'don.jamais2a': 'No advertising', 'don.jamais2b': ': no advertising profile is built.',
      'don.cookieA': 'A single cookie', 'don.cookieB': ', the one for your login. No audience measurement, no trackers.',
      'don.accesCap': 'Who has access to which data', 'don.aVous': 'You', 'don.aAgents': 'Municipal agents', 'don.aAdmins': 'Administrators',
      'don.r1': 'Profile and contact details', 'don.r2': 'Requests and appointments', 'don.r3': 'Notifications', 'don.r4': 'Login log',
      'don.oui': 'Yes', 'don.non': 'No', 'don.agentsRaison': 'Yes, to process your requests', 'don.audit': 'Every action by an agent or administrator is recorded in an audit log.',
      'don.dAccesA': 'See', 'don.dAccesB': 'what we keep: in', 'don.dAccesC': 'or with the download below.', 'don.votreCompte': 'your account',
      'don.dRectifA': 'Correct', 'don.dRectifB': 'inaccurate information: in', 'don.dSupprA': 'Delete', 'don.dSupprB': 'your account and your data: in',
      'don.dExportA': 'Take away', 'don.dExportB': 'your data in a readable file (JSON).',
      'don.questionD': 'Your message goes to the data protection officer. You get a tracking number and an answer within 15 days.',
      'don.sujet': 'Subject', 'don.s1': 'How my data is used', 'don.s2': 'Agents’ access to my data', 'don.s3': 'Deleting my data', 'don.s4': 'My account security', 'don.s5': 'Other',
      'don.message': 'Your message', 'don.messageAide': 'Describe your question or concern in a few sentences (10 characters minimum).',
      'don.contact': 'Your contact e-mail', 'don.contactAide': 'To send you the answer. It is used for nothing else.', 'don.envoyer': 'Send my contribution',
      'don.mesD': 'Each contribution keeps its history: you can see where it stands and the officer’s answer.',
      'don.recues': 'Contributions received', 'don.recuesD': 'Answer each resident: they are notified and your answer is recorded in the audit log.',
      'don.telecharger': 'Download my data', 'don.exportAide': 'Log in to download your data.', 'don.seConnecter': 'Log in',
      'don.sujet.donnees': 'How my data is used', 'don.sujet.agents': 'Agents’ access to my data', 'don.sujet.suppression': 'Deleting my data', 'don.sujet.securite': 'My account security', 'don.sujet.autre': 'Other',
      'don.st.recue': 'Received', 'don.st.en_cours': 'In progress', 'don.st.repondue': 'Answered',
      'don.errMessage': 'Describe your question or concern (10 characters minimum).', 'don.errEmail': 'Enter a valid e-mail address so we can answer you.',
      'don.resume1': 'One point to fix:', 'don.resumeN': '{n} points to fix:', 'don.errServeur': 'Your contribution could not be sent. Please try again.',
      'don.okTitre': 'Your contribution is registered', 'don.okNum': 'Tracking number', 'don.okDelai': 'You will get an answer within 15 days.',
      'don.okSuivi': 'You can follow it in “My contributions” below. A notification was added to your bell.', 'don.okVisiteur': 'Keep this number. We will answer at the e-mail address you gave.',
      'don.aucune': 'You have not sent any contribution yet.', 'don.aucuneRecue': 'No contribution received yet.',
      'don.reponse': 'Officer’s answer', 'don.historique': 'History', 'don.de': 'From {d}', 'don.par': 'by {p}',
      'don.rep.label': 'Your answer to the resident', 'don.rep.statut': 'New status', 'don.rep.repondue': 'Answered', 'don.rep.en_cours': 'In progress', 'don.rep.envoyer': 'Send the answer',
      'don.rep.vide': 'Write an answer before sending it.', 'don.rep.ok': 'Answer sent, the resident has been notified.', 'don.visiteur': 'Visitor', 'don.habitant': 'Resident'
    },
    es: {}, ar: {}
  });
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = (sel, r) => (r || document).querySelector(sel);
  const $$ = (sel, r) => Array.from((r || document).querySelectorAll(sel));
  const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const SUJETS = { donnees: 'Utilisation de mes données', agents: 'Accès des agents à mes données', suppression: 'Suppression de mes données', securite: 'Sécurité de mon compte', autre: 'Autre' };
  const STATUTS = { recue: 'Reçue', en_cours: 'En cours', repondue: 'Répondue' };
  const sujet = c => L('don.sujet.' + c, SUJETS[c] || c);
  const badge = s => `<span class="statut statut-${s === 'repondue' ? 'traitee' : s === 'en_cours' ? 'en_cours' : 'recue'}">${E(L('don.st.' + s, STATUTS[s] || s))}</span>`;

  NT.pret(() => {
    const u = NT.auth.utilisateur();
    const personnel = !!u && (u.role === 'agent' || u.role === 'admin');

    /* ---------- Export ---------- */
    $('#zone-export').innerHTML = u
      ? `<a class="btn btn-primaire" href="/api/mes-donnees" download="mes-donnees-terra-nova.json"><i class="ph-duotone ph-download-simple" aria-hidden="true"></i> ${E(L('don.telecharger', 'Télécharger mes données'))}</a>`
      : `<span class="doux">${E(L('don.exportAide', 'Connectez-vous pour télécharger vos données.'))}</span> <a class="btn" href="connexion.html?retour=donnees.html">${E(L('don.seConnecter', 'Se connecter'))}</a>`;

    /* ---------- Formulaire ---------- */
    if (!u) $('#bloc-contact').hidden = false;
    const form = $('#form-contrib');

    function poserErreurs(erreurs) {
      $$('[aria-invalid]', form).forEach(el => { el.removeAttribute('aria-invalid'); el.setAttribute('aria-describedby', el.dataset.base || ''); if (!el.dataset.base) el.removeAttribute('aria-describedby'); });
      $$('.erreur[data-erreur]', form).forEach(p => p.remove());
      const resume = $('.resume-erreurs', form);
      resume.innerHTML = '';
      if (!erreurs.length) return;
      erreurs.forEach(e => {
        const c = document.getElementById(e.id);
        if (c.dataset.base === undefined) c.dataset.base = c.getAttribute('aria-describedby') || '';
        c.setAttribute('aria-invalid', 'true');
        c.setAttribute('aria-describedby', (c.dataset.base + ' err-' + e.id).trim());
        const p = document.createElement('p');
        p.className = 'erreur'; p.id = 'err-' + e.id; p.dataset.erreur = '1'; p.textContent = e.msg;
        c.closest('.champ').append(p);
      });
      const n = erreurs.length;
      resume.innerHTML = `<p><strong>${E(n > 1 ? L('don.resumeN', '{n} points à corriger :', { n }) : L('don.resume1', 'Un point à corriger :'))}</strong></p><ul>` +
        erreurs.map(e => `<li><a href="#${E(e.id)}" data-champ="${E(e.id)}">${E(e.msg)}</a></li>`).join('') + '</ul>';
      document.getElementById(erreurs[0].id).focus();
    }
    form.addEventListener('click', e => {
      const a = e.target.closest('.resume-erreurs a[data-champ]'); if (!a) return;
      e.preventDefault(); document.getElementById(a.dataset.champ).focus();
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const message = $('#c-message').value.trim();
      const contact = $('#c-contact').value.trim();
      const erreurs = [];
      if (message.length < 10) erreurs.push({ id: 'c-message', msg: L('don.errMessage', 'Décrivez votre question ou votre inquiétude (10 caractères minimum).') });
      if (!u && !EMAIL.test(contact)) erreurs.push({ id: 'c-contact', msg: L('don.errEmail', 'Saisissez une adresse e-mail valide pour que nous puissions vous répondre.') });
      poserErreurs(erreurs);
      if (erreurs.length) return;
      const r = NT.api('POST', '/api/contributions', { sujet: $('#c-sujet').value, message, contact });
      if (r.statut !== 200 || !r.donnees || !r.donnees.id) {
        poserErreurs([{ id: 'c-message', msg: (r.donnees && r.donnees.erreur) || L('don.errServeur', 'Votre contribution n’a pas pu être envoyée. Réessayez.') }]);
        return;
      }
      const c = r.donnees;
      const zone = $('#confirmation');
      zone.innerHTML = `<div class="confirm-don"><p><i class="ph-duotone ph-check-circle" aria-hidden="true"></i> <strong>${E(L('don.okTitre', 'Votre contribution est enregistrée'))}</strong></p>
        <p>${E(L('don.okNum', 'Numéro de suivi'))} : <span class="numero">${E(c.id)}</span></p>
        <p>${E(L('don.okDelai', 'Vous recevrez une réponse sous 15 jours.'))}</p>
        <p class="doux">${E(u ? L('don.okSuivi', 'Vous la suivez dans « Mes contributions » plus bas. Une notification a été ajoutée à votre cloche.') : L('don.okVisiteur', 'Conservez ce numéro. Nous répondrons à l’adresse e-mail indiquée.'))}</p></div>`;
      zone.focus();
      form.reset();
      NT.ui.annoncer(L('don.okTitre', 'Votre contribution est enregistrée') + ' — ' + c.id);
      if (u) { rendreMes(); rendreRecues(); }
    });

    /* ---------- Mes contributions ---------- */
    function historique(c) {
      return `<h4 class="sr-only">${E(L('don.historique', 'Historique'))}</h4><ol class="histo">${(c.historique || []).map(h =>
        `<li><span>${E(NT.ui.dateHeure(h.date))}</span>${badge(h.statut)}<span>${E(h.note || '')}</span><span>${E(L('don.par', 'par {p}', { p: h.par || '' }))}</span></li>`).join('')}</ol>`;
    }
    function carte(c, avecForm) {
      return `<li><article class="contrib" id="${E(c.id)}" aria-labelledby="t-${E(c.id)}">
        <div class="contrib-tete"><h3 id="t-${E(c.id)}">${E(c.id)} · ${E(sujet(c.sujet))}</h3>${badge(c.statut)}</div>
        <p class="doux">${E(L('don.de', 'Du {d}', { d: NT.ui.date(c.cree) }))}${avecForm ? ' · ' + E(c.userId ? L('don.habitant', 'Habitant') : L('don.visiteur', 'Visiteur')) + (c.contact ? ' · ' + E(c.contact) : '') : ''}</p>
        <p class="msg">${E(c.message)}</p>
        ${c.reponse ? `<div class="reponse-del"><strong>${E(L('don.reponse', 'Réponse du délégué'))}</strong><p>${E(c.reponse)}</p></div>` : ''}
        ${historique(c)}
        ${avecForm ? `<form class="form-rep" data-id="${E(c.id)}" novalidate>
          <div class="champ"><label for="rep-${E(c.id)}">${E(L('don.rep.label', 'Votre réponse à l’habitant'))}</label>
            <textarea id="rep-${E(c.id)}" rows="3" maxlength="2000"></textarea></div>
          <div class="champ"><label for="st-${E(c.id)}">${E(L('don.rep.statut', 'Nouveau statut'))}</label>
            <select id="st-${E(c.id)}"><option value="repondue">${E(L('don.rep.repondue', 'Répondue'))}</option><option value="en_cours">${E(L('don.rep.en_cours', 'En cours'))}</option></select></div>
          <button class="btn btn-primaire" type="submit">${E(L('don.rep.envoyer', 'Envoyer la réponse'))}</button></form>` : ''}
      </article></li>`;
    }
    function charger() { const r = NT.api('GET', '/api/contributions'); return r.statut === 200 && Array.isArray(r.donnees) ? r.donnees : []; }
    function rendreMes() {
      if (!u || personnel) return;
      const l = charger();
      $('#mes-contributions').hidden = false; $('#lien-mes').hidden = false;
      $('#liste-mes').innerHTML = l.length ? l.map(c => carte(c, false)).join('') : `<li class="vide">${E(L('don.aucune', 'Vous n’avez pas encore envoyé de contribution.'))}</li>`;
    }
    function rendreRecues() {
      if (!personnel) return;
      const l = charger();
      $('#contributions-recues').hidden = false;
      $('#liste-recues').innerHTML = l.length ? l.map(c => carte(c, true)).join('') : `<li class="vide">${E(L('don.aucuneRecue', 'Aucune contribution reçue pour l’instant.'))}</li>`;
    }

    /* ---------- Réponse du personnel ---------- */
    $('#liste-recues').addEventListener('submit', e => {
      const f = e.target.closest('.form-rep'); if (!f) return;
      e.preventDefault();
      const id = f.dataset.id;
      const champ = $('#rep-' + CSS.escape(id));
      const reponse = champ.value.trim();
      const ancien = $('.erreur[data-erreur]', f); if (ancien) ancien.remove();
      champ.removeAttribute('aria-invalid');
      if (!reponse) {
        const p = document.createElement('p');
        p.className = 'erreur'; p.id = 'err-rep-' + id; p.dataset.erreur = '1'; p.setAttribute('role', 'alert');
        p.textContent = L('don.rep.vide', 'Écrivez une réponse avant de l’envoyer.');
        champ.setAttribute('aria-invalid', 'true'); champ.setAttribute('aria-describedby', p.id);
        champ.closest('.champ').append(p); champ.focus(); return;
      }
      const r = NT.api('PATCH', '/api/contributions/' + encodeURIComponent(id), { statut: $('#st-' + CSS.escape(id)).value, reponse });
      if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || L('don.errServeur', 'Action impossible. Réessayez.'), 'danger'); return; }
      rendreRecues();
      NT.ui.toast(L('don.rep.ok', 'Réponse envoyée, l’habitant est prévenu.'), 'success');
      const t = document.getElementById('t-' + id); if (t) { t.setAttribute('tabindex', '-1'); t.focus(); }
    });

    rendreMes();
    rendreRecues();
    if (location.hash) { const c = document.getElementById(location.hash.slice(1)); if (c && c.scrollIntoView) c.scrollIntoView(); }
  });
})();
