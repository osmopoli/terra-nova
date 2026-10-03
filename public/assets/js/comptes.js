/* Terra Nova — lot « Comptes, rôles et sécurité »
   Pages : inscription.html, connexion.html, espace.html, compte.html, admin-comptes.html
   Chargé dans <head> avant ui.js ; chaque page appelle NT.comptes.<page>() dans NT.pret().
   Les textes FR sont les replis de L(clé, texte FR) ; les traductions sont dans le dictionnaire en bas de fichier. */
(function () {
  'use strict';
  const NT = window.NT;
  const C = (NT.comptes = {});
  const L = (cle, fr, vars) => NT.t(cle, vars, fr);
  const E = s => NT.ui.echap(s);
  const $ = (sel, r) => (r || document).querySelector(sel);
  const $$ = (sel, r) => Array.from((r || document).querySelectorAll(sel));
  const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const TEL = /^[0-9 +().-]{6,20}$/;
  const fmtDH = iso => (iso ? NT.ui.dateHeure(iso) : '—');
  const nomComplet = u => u.prenom + ' ' + u.nom;
  const rolePlein = r => ({ citoyen: L('c.role.citoyen', 'Citoyen'), agent: L('c.role.agent', 'Agent municipal'), admin: L('c.role.admin', 'Administrateur') }[r] || r);

  /* ---------- Erreurs de formulaire accessibles (résumé role="alert", aria-invalid, focus) ---------- */
  function poserErreurs(form, erreurs) {
    $$('[aria-invalid]', form).forEach(el => {
      el.removeAttribute('aria-invalid');
      if (el.dataset.descBase !== undefined) {
        if (el.dataset.descBase) el.setAttribute('aria-describedby', el.dataset.descBase); else el.removeAttribute('aria-describedby');
      }
    });
    $$('.erreur[data-erreur]', form).forEach(p => p.remove());
    const resume = $('.resume-erreurs', form);
    resume.innerHTML = '';
    if (!erreurs.length) return;
    erreurs.forEach(e => {
      const champ = document.getElementById(e.id);
      if (!champ) return;
      if (champ.dataset.descBase === undefined) champ.dataset.descBase = champ.getAttribute('aria-describedby') || '';
      champ.setAttribute('aria-invalid', 'true');
      champ.setAttribute('aria-describedby', (champ.dataset.descBase + ' err-' + e.id).trim());
      const p = document.createElement('p');
      p.className = 'erreur'; p.id = 'err-' + e.id; p.dataset.erreur = '1'; p.textContent = e.msg;
      (champ.closest('.champ') || champ.parentNode).append(p);
    });
    const n = erreurs.length;
    resume.innerHTML = '<p><strong>' + E(n > 1 ? L('c.resume.n', '{n} points à corriger :', { n }) : L('c.resume.1', 'Un point à corriger :')) + '</strong></p><ul>' +
      erreurs.map(e => '<li><a href="#' + E(e.id) + '" data-champ="' + E(e.id) + '">' + E(e.msg) + '</a></li>').join('') + '</ul>';
    const premier = document.getElementById(erreurs[0].id);
    if (premier) premier.focus();
  }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('.resume-erreurs a[data-champ]');
    if (!a) return;
    e.preventDefault();
    const c = document.getElementById(a.dataset.champ); if (c) c.focus();
  });

  /* ---------- Mot de passe : afficher/masquer + robustesse en direct + règles visibles ---------- */
  function evaluerMdp(m) {
    const req = [m.length >= 8, /[A-Z]/.test(m), /[0-9]/.test(m)];
    const ok = req.every(Boolean);
    const score = req.filter(Boolean).length + (/[a-z]/.test(m) ? 1 : 0) + (/[^A-Za-z0-9]/.test(m) ? 1 : 0) + (m.length >= 12 ? 1 : 0);
    const niveau = !m ? 0 : !ok ? 1 : score <= 4 ? 2 : score === 5 ? 3 : 4;
    return { req, ok, niveau };
  }
  function brancherMdp(input, avecForce) {
    const ligne = input.closest('.mdp-ligne');
    const bouton = document.createElement('button');
    bouton.type = 'button'; bouton.className = 'btn btn-voir';
    bouton.textContent = L('c.afficher', 'Afficher');
    bouton.setAttribute('aria-controls', input.id);
    bouton.addEventListener('click', () => {
      const cache = input.type === 'password';
      input.type = cache ? 'text' : 'password';
      bouton.textContent = cache ? L('c.masquer', 'Masquer') : L('c.afficher', 'Afficher');
    });
    ligne.append(bouton);
    if (!avecForce) return;
    const regles = [L('c.regle.8', '8 caractères minimum'), L('c.regle.maj', 'une majuscule'), L('c.regle.chiffre', 'un chiffre')];
    const bloc = document.createElement('div');
    bloc.className = 'force-bloc';
    bloc.innerHTML = '<div class="force"><div class="force-barre" aria-hidden="true"><span></span></div><p class="force-texte" id="force-' + input.id + '" aria-live="polite"></p></div>' +
      '<p class="aide" id="regles-titre-' + input.id + '">' + E(L('c.regle.titre', 'Votre mot de passe doit contenir :')) + '</p>' +
      '<ul class="regles" id="regles-' + input.id + '" aria-labelledby="regles-titre-' + input.id + '">' +
      regles.map(r => '<li><i class="ph ph-circle" aria-hidden="true"></i><span>' + E(r) + '</span><span class="sr-only etat"></span></li>').join('') + '</ul>' +
      '<p class="aide">' + E(L('c.regle.conseil', 'Conseil : 12 caractères ou plus, avec une minuscule et un symbole, le rendent plus robuste.')) + '</p>';
    ligne.after(bloc);
    input.setAttribute('aria-describedby', ((input.getAttribute('aria-describedby') || '') + ' regles-titre-' + input.id + ' regles-' + input.id + ' force-' + input.id).trim());
    const niveaux = ['', L('c.force.1', 'Insuffisante'), L('c.force.2', 'Correcte'), L('c.force.3', 'Bonne'), L('c.force.4', 'Très robuste')];
    const barre = $('.force-barre span', bloc), texte = $('.force-texte', bloc), items = $$('.regles li', bloc);
    let dernier = -1;
    const maj = () => {
      const r = evaluerMdp(input.value);
      items.forEach((li, i) => {
        li.classList.toggle('ok', r.req[i]);
        $('i', li).className = r.req[i] ? 'ph ph-check-circle' : 'ph ph-circle';
        $('.etat', li).textContent = ' : ' + (r.req[i] ? L('c.regle.ok', 'respecté') : L('c.regle.ko', 'à ajouter'));
      });
      barre.style.width = (r.niveau * 25) + '%';
      barre.parentNode.dataset.niveau = r.niveau;
      if (r.niveau !== dernier) {
        dernier = r.niveau;
        texte.textContent = r.niveau ? L('c.force.label', 'Robustesse : {n}', { n: niveaux[r.niveau] }) : L('c.force.vide', 'Robustesse : saisissez un mot de passe');
      }
    };
    input.addEventListener('input', maj);
    input.form.addEventListener('reset', () => setTimeout(maj, 0));
    maj();
  }

  /* ---------- Garde anti-essais répétés côté page (changement de mot de passe, suppression) ---------- */
  function garde(cle) {
    const k = 'nt:garde:' + cle;
    const lire = () => { try { return JSON.parse(sessionStorage.getItem(k)) || { n: 0, fin: 0 }; } catch (e) { return { n: 0, fin: 0 }; } };
    const ecrire = g => { try { sessionStorage.setItem(k, JSON.stringify(g)); } catch (e) { /* ignoré */ } };
    return {
      restant() { const g = lire(); return g.fin > Date.now() ? g.fin - Date.now() : 0; },
      echec(email) {
        const g = lire();
        if (g.fin && g.fin <= Date.now()) { g.n = 0; g.fin = 0; }
        g.n++;
        NT.auth.ecrireJournal('echec_mdp', email, cle);
        let restantes = 5 - g.n;
        if (g.n >= 5) { g.fin = Date.now() + 5 * 60000; g.n = 0; restantes = 0; NT.auth.ecrireJournal('verrouillage', email, cle + ' : 5 min'); }
        ecrire(g); return restantes;
      },
      ok() { try { sessionStorage.removeItem(k); } catch (e) { /* ignoré */ } }
    };
  }
  const messageTrop = ms => L('c.trop', 'Trop d’essais incorrects. Par sécurité, réessayez dans {min} minute(s).', { min: Math.max(1, Math.ceil(ms / 60000)) });

  /* ---------- Dialogue de confirmation (sl-dialog) ---------- */
  function confirmer(o) {
    return customElements.whenDefined('sl-dialog').then(() => new Promise(resolve => {
      const d = document.createElement('sl-dialog');
      d.label = o.titre;
      d.innerHTML = '<p>' + E(o.texte) + '</p>' + (o.liste ? '<ul>' + o.liste.map(x => '<li>' + E(x) + '</li>').join('') + '</ul>' : '') +
        '<sl-button slot="footer" data-r="non">' + E(L('c.annuler', 'Annuler')) + '</sl-button>' +
        '<sl-button slot="footer" variant="' + (o.danger ? 'danger' : 'primary') + '" data-r="oui">' + E(o.bouton) + '</sl-button>';
      let fait = false;
      const fin = v => { if (fait) return; fait = true; resolve(v); d.hide(); };
      d.addEventListener('sl-initial-focus', e => { e.preventDefault(); const b = d.querySelector('[data-r="non"]'); if (b) b.focus(); });
      d.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) fin(b.dataset.r === 'oui'); });
      d.addEventListener('sl-after-hide', e => { if (e.target !== d) return; fin(false); d.remove(); });
      document.body.append(d); d.show();
    }));
  }

  /* ---------- Journal : types d'événements ---------- */
  const TYPES = {
    connexion: ['ph-sign-in', 'ok', 'Connexion réussie'],
    echec_connexion: ['ph-warning', 'avert', 'Échec de connexion'],
    verrouillage: ['ph-lock-key', 'crit', 'Compte verrouillé'],
    tentative_bloquee: ['ph-prohibit', 'crit', 'Tentative pendant un verrouillage'],
    deblocage: ['ph-lock-key-open', 'info', 'Compte débloqué'],
    acces_refuse: ['ph-hand-palm', 'crit', 'Accès refusé'],
    inscription: ['ph-user-plus', 'info', 'Création de compte'],
    mdp_change: ['ph-password', 'info', 'Mot de passe changé'],
    echec_mdp: ['ph-warning', 'avert', 'Mot de passe actuel erroné'],
    desactivation: ['ph-user-minus', 'avert', 'Compte désactivé'],
    reactivation: ['ph-user-check', 'info', 'Compte réactivé'],
    changement_role: ['ph-identification-badge', 'avert', 'Rôle modifié'],
    suppression_compte: ['ph-trash', 'avert', 'Compte supprimé'],
    nouvel_appareil: ['ph-devices', 'avert', 'Connexion depuis un nouvel appareil'],
    appareil_retire: ['ph-device-mobile-slash', 'info', 'Appareil retiré'],
    deux_etapes_demandee: ['ph-shield-check', 'info', 'Code de vérification demandé'],
    deux_etapes_activee: ['ph-shield-check', 'ok', 'Vérification en deux étapes activée'],
    deux_etapes_desactivee: ['ph-shield-slash', 'avert', 'Vérification en deux étapes désactivée'],
    echec_code: ['ph-warning', 'avert', 'Code de vérification erroné'],
    cle_ajoutee: ['ph-fingerprint', 'ok', 'Clé d’accès ajoutée'],
    cle_retiree: ['ph-fingerprint', 'info', 'Clé d’accès retirée'],
    echec_cle: ['ph-warning', 'avert', 'Clé d’accès refusée'],
    cle_suspecte: ['ph-siren', 'crit', 'Clé d’accès suspecte bloquée']
  };
  const typeLabel = t => L('c.j.' + t, (TYPES[t] || [])[2] || t);
  function pastilleType(t) {
    const d = TYPES[t] || ['ph-info', 'info', t];
    return '<span class="pastille-type niveau-' + d[1] + '"><i class="ph-duotone ' + d[0] + '" aria-hidden="true"></i>' + E(typeLabel(t)) + '</span>';
  }

  /* =====================================================================
     D01 — inscription
     ===================================================================== */
  C.inscription = function () {
    const form = $('#form-inscription');
    const deja = NT.auth.utilisateur();
    if (deja) {
      form.hidden = true;
      $('#deja-connecte').hidden = false;
      $('#deja-texte').textContent = L('c.ins.dejaTexte', 'Vous êtes connecté en tant que {nom}. Déconnectez-vous pour créer un autre compte.', { nom: nomComplet(deja) });
      $('#deja-connecte a').href = deja.role === 'citoyen' ? 'espace.html' : 'agent.html';
      return;
    }
    $('#quartier').innerHTML = '<option value="">' + E(L('c.ins.choisirQuartier', 'Choisissez votre quartier')) + '</option>' + NT.QUARTIERS.map(q => '<option>' + E(q) + '</option>').join('');
    brancherMdp($('#motdepasse'), true);

    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = id => $('#' + id).value.trim();
      const err = [];
      if (!v('prenom')) err.push({ id: 'prenom', msg: L('c.e.prenom', 'Indiquez votre prénom.') });
      if (!v('nom')) err.push({ id: 'nom', msg: L('c.e.nom', 'Indiquez votre nom.') });
      if (!v('email')) err.push({ id: 'email', msg: L('c.e.email', 'Indiquez votre adresse e-mail.') });
      else if (!EMAIL.test(v('email'))) err.push({ id: 'email', msg: L('c.e.emailFormat', 'L’adresse e-mail doit ressembler à prenom@exemple.fr.') });
      else if (NT.auth.emailPris(v('email'))) err.push({ id: 'email', msg: L('c.e.emailPris', 'Un compte existe déjà avec cette adresse. Connectez-vous ou utilisez une autre adresse.') });
      const mdp = $('#motdepasse').value;
      const manques = NT.auth.validerMotDePasse(mdp);
      if (!mdp) err.push({ id: 'motdepasse', msg: L('c.e.mdp', 'Choisissez un mot de passe.') });
      else if (manques.length) err.push({ id: 'motdepasse', msg: L('c.e.mdpFaible', 'Le mot de passe est trop faible : il manque {liste}.', { liste: manques.join(', ') }) });
      if (!v('quartier')) err.push({ id: 'quartier', msg: L('c.e.quartier', 'Choisissez votre quartier dans la liste.') });
      if (v('telephone') && !TEL.test(v('telephone'))) err.push({ id: 'telephone', msg: L('c.e.tel', 'Le numéro de téléphone ne doit contenir que des chiffres, des espaces et le signe +.') });
      poserErreurs(form, err);
      if (err.length) return;
      const r = NT.auth.inscrire({ prenom: v('prenom'), nom: v('nom'), email: v('email'), motdepasse: mdp, quartier: v('quartier'), telephone: v('telephone') });
      if (!r.ok) {
        const champ = /e-mail|adresse/i.test(r.erreur) ? 'email' : /mot de passe/i.test(r.erreur) ? 'motdepasse' : 'prenom';
        poserErreurs(form, [{ id: champ, msg: r.erreur }]);
        return;
      }
      NT.store.update('utilisateurs', r.utilisateur.id, { alertesQuartier: $('#alertes').checked });
      NT.ui.toast(L('c.ins.ok', 'Compte créé. Bienvenue sur Terra Nova !'), 'success');
      location.href = 'espace.html';
    });
  };

  /* =====================================================================
     D03 + F37 — connexion
     ===================================================================== */
  C.connexion = function () {
    const DEMOS = [
      { role: 'citoyen', nom: 'Léa Martin', email: 'citoyen@nova.test', mdp: 'Citoyen2026', icone: 'ph-user' },
      { role: 'agent', nom: 'Karim Benali', email: 'agent@nova.test', mdp: 'Agent2026', icone: 'ph-identification-badge' },
      { role: 'admin', nom: 'Inès Rousseau', email: 'admin@nova.test', mdp: 'Admin2026', icone: 'ph-shield-check' },
      { role: 'agent', nom: 'Sophie Laurent · habilitée', email: 'social@nova.test', mdp: 'Agent2026', icone: 'ph-identification-badge' },   // vague 13 (F70)
      { role: 'citoyen', nom: 'Youssef Haddad · sans e-mail', email: 'TN-100001', mdp: '482915', icone: 'ph-identification-card' }   // vague 13 (F71)
    ];
    const form = $('#form-connexion');
    const champs = $('#champs-connexion');
    const verrou = $('#etat-verrou');

    /* Redirection : ?retour= seulement vers une page locale du site */
    const retourBrut = NT.ui.param('retour') || '';
    const retour = /^[A-Za-z0-9_-]+\.html(\?[^#]*)?(#.*)?$/.test(retourBrut) ? retourBrut : '';
    const destination = u => retour || (u.role === 'citoyen' ? 'espace.html' : 'agent.html');

    /* Déjà connecté */
    const deja = NT.auth.utilisateur();
    if (deja) {
      form.hidden = true; $('#demo-comptes').hidden = true;
      $('#deja-connecte').hidden = false;
      $('#deja-texte').textContent = L('c.con.dejaTexte', 'Vous êtes connecté en tant que {nom} ({role}).', { nom: nomComplet(deja), role: rolePlein(deja.role) });
      $('#deja-lien').href = destination(deja);
      $('#deja-changer').addEventListener('click', () => { NT.auth.deconnecter(); location.reload(); });
      return;
    }

    brancherMdp($('#motdepasse'), false);

    /* Comptes de démonstration */
    $('#liste-demo').innerHTML = DEMOS.map((d, i) => '<li><div><strong><i class="ph-duotone ' + d.icone + '" aria-hidden="true"></i> ' + E(rolePlein(d.role)) + '</strong>' +
      '<span class="doux">' + E(d.nom) + '</span><code>' + E(d.email) + ' / ' + E(d.mdp) + '</code></div>' +
      '<button class="btn petit" type="button" data-demo="' + i + '" aria-label="' + E(L('c.con.utiliserAria', 'Utiliser le compte {role}', { role: rolePlein(d.role) })) + '">' + E(L('c.con.utiliser', 'Utiliser')) + '</button></li>').join('');
    $('#liste-demo').addEventListener('click', e => {
      const b = e.target.closest('[data-demo]'); if (!b) return;
      const d = DEMOS[+b.dataset.demo];
      $('#email').value = d.email; $('#motdepasse').value = d.mdp;
      poserErreurs(form, []);
      NT.ui.annoncer(L('c.con.rempli', 'Formulaire rempli avec le compte {role}. Validez pour vous connecter.', { role: rolePlein(d.role) }));
      $('#btn-connexion').focus();
    });

    /* Mot de passe oublié */
    const oubli = $('#btn-oublie'), aide = $('#aide-oubli');
    oubli.addEventListener('click', () => {
      const ouvert = aide.hidden;
      aide.hidden = !ouvert; oubli.setAttribute('aria-expanded', String(ouvert));
    });

    /* Vérification humaine : petite opération générée en JS */
    let reponse = 0;
    function nouvelleQuestion() {
      const a = 2 + Math.floor(Math.random() * 8), b = 2 + Math.floor(Math.random() * 8);
      reponse = a + b;
      $('#lbl-verif').textContent = L('c.con.question', 'Combien font {a} + {b} ?', { a, b });
      $('#verif').value = '';
    }
    const verifVisible = () => !$('#bloc-verif').hidden;
    function montrerVerif() {
      if (!verifVisible()) { $('#bloc-verif').hidden = false; $('#verif').required = true; }
      nouvelleQuestion();
    }

    /* Verrouillage temporaire avec compte à rebours en direct */
    let minuteur = null;
    function basculerChamps(desactive) {
      champs.disabled = desactive;
    }
    function verrouiller(fin) {
      verrou.hidden = false;
      basculerChamps(true);
      const total = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
      $('#rebours-sr').textContent = L('c.con.reboursSr', ' environ {min} minute(s)', { min: Math.max(1, Math.ceil(total / 60)) });
      const maj = () => {
        const reste = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
        if (!reste) {
          clearInterval(minuteur);
          verrou.hidden = true; basculerChamps(false);
          $('#rebours-sr').textContent = '';
          NT.ui.toast(L('c.con.debloque', 'Vous pouvez de nouveau essayer de vous connecter.'), 'success');
          $('#motdepasse').focus();
          return;
        }
        $('#compte-rebours').textContent = String(Math.floor(reste / 60)).padStart(2, '0') + ':' + String(reste % 60).padStart(2, '0');
      };
      clearInterval(minuteur); maj(); minuteur = setInterval(maj, 1000);
      verrou.focus();
    }

    function reussite(r) {
      const dest = destination(r.utilisateur);
      if (r.alerteSecurite > 0) {
        const msg = L('c.con.alerteSecu', '{n} tentative(s) de connexion échouée(s) depuis votre dernière connexion.', { n: r.alerteSecurite });
        form.hidden = true; $('#demo-comptes').hidden = true;
        const etapeCode = $('#form-code'); if (etapeCode) etapeCode.hidden = true;
        $('#alerte-secu-texte').textContent = msg;
        $('#alerte-secu-lien').href = dest;
        $('#alerte-secu').hidden = false;
        NT.ui.toast(msg, 'warning', 9000);
        $('#alerte-secu').focus();
      } else location.href = dest;
    }
    if (NT.forte) NT.forte.connexion(destination);   // D02 : clé d'accès

    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = $('#email').value.trim(), mdp = $('#motdepasse').value;
      const err = [];
      // F71 : e-mail, identifiant TN-123456 ou numéro de téléphone
      if (!email || (!EMAIL.test(email) && !/^tn[\s-]?\d{6}$/i.test(email) && !TEL.test(email))) err.push({ id: 'email', msg: L('v13.con.erreur', 'Indiquez votre e-mail, votre identifiant (TN-123456) ou votre numéro de téléphone.') });
      if (!mdp) err.push({ id: 'motdepasse', msg: L('c.e.mdpSaisir', 'Saisissez votre mot de passe.') });
      let verifOk = false;
      if (verifVisible()) {
        if (parseInt($('#verif').value.trim(), 10) !== reponse) {
          err.push({ id: 'verif', msg: L('c.con.verifFausse', 'Ce n’est pas la bonne réponse. Voici une nouvelle question.') });
          nouvelleQuestion();
        } else verifOk = true;
      }
      poserErreurs(form, err);
      if (err.length) return;

      const r = NT.auth.connecter(email, mdp, verifOk);
      if (r.deuxEtapes && NT.forte) { poserErreurs(form, []); NT.forte.demanderCode(r, destination, reussite); return; }   // F53
      if (r.ok) { reussite(r); return; }
      if (r.verrouJusqu) { poserErreurs(form, []); verrouiller(r.verrouJusqu); return; }
      if (r.verification && r.restantes === undefined) {
        montrerVerif();
        poserErreurs(form, [{ id: 'verif', msg: L('c.con.verifDemandee', 'Par sécurité, répondez à la petite question ci-dessous pour confirmer que vous êtes une personne.') }]);
        return;
      }
      let msg = r.erreur;
      if (r.restantes != null) msg += ' ' + L('c.con.restantes', 'Il vous reste {n} essai(s) avant un blocage temporaire.', { n: r.restantes });
      if (r.verification) { montrerVerif(); msg += ' ' + L('c.con.verifAjoutee', 'Une petite vérification est maintenant demandée.'); }
      poserErreurs(form, [{ id: 'motdepasse', msg }]);
      $('#motdepasse').select();
    });
  };

  /* =====================================================================
     D03, D11, F26, D12, F35 — espace personnel du citoyen
     ===================================================================== */
  const ORDRE = ['recue', 'en_cours', 'traitee', 'cloturee'];
  const typeLabelDemande = t => ({ contact: L('c.t.contact', 'Question'), signalement: L('c.t.signalement', 'Signalement'), demarche: L('c.t.demarche', 'Démarche') }[t] || t);
  const nomService = d => { const s = d.serviceId && NT.services.get(d.serviceId); return s ? NT.i18n.choisir(s.nom) : '—'; };
  const statutTxt = c => L('statut.' + c, NT.STATUTS[c] || c);
  function jalons(statut) {
    const i = ORDRE.indexOf(statut);
    return '<span class="jalons-bloc"><ol class="jalons" aria-hidden="true">' + ORDRE.map((s, k) => '<li class="' + (k <= i ? 'faite' : '') + '"></li>').join('') + '</ol>' +
      '<span class="jalons-texte">' + E(L('c.esp.etape', 'Étape {i} sur {n}', { i: i + 1, n: ORDRE.length })) + '</span></span>';
  }

  C.espace = function () {
    const moi = () => NT.auth.utilisateur();
    $('#titre-espace').textContent = L('c.esp.bonjour', 'Bonjour {prenom}', { prenom: moi().prenom });
    const mesDemandes = () => NT.demandes.pour(moi().id);
    const f = { statut: '', q: '', ordre: 'desc' };

    /* --- KPI --- */
    function rendreKpis() {
      const u = moi();
      const enCours = mesDemandes().filter(d => d.statut === 'recue' || d.statut === 'en_cours').length;
      const rdvs = NT.rdv.pour(u.id).filter(r => r.statut === 'confirme' && new Date(r.debut) > new Date()).length;
      const nonLues = NT.notif.nonLues(u.id);
      const kpi = (n, txt, fort) => '<div class="kpi' + (fort && n ? ' fort' : '') + '"><div class="valeur">' + n + '</div><div class="libelle">' + E(txt) + '</div></div>';
      $('#kpis').innerHTML = kpi(enCours, L('c.esp.kEnCours', 'Demandes en cours'), true) + kpi(rdvs, L('c.esp.kRdv', 'Rendez-vous à venir'), false) + kpi(nonLues, L('c.esp.kNotifs', 'Notifications non lues'), true);
    }

    /* --- D11 : demandes en cours --- */
    function rendreEnCours() {
      const l = mesDemandes().filter(d => d.statut === 'recue' || d.statut === 'en_cours');
      $('#liste-encours').innerHTML = l.length ? l.map(d => {
        const h = d.historique && d.historique[d.historique.length - 1];
        return '<li class="demande"><div class="ligne entre"><h3><a href="suivi.html?id=' + E(d.id) + '">' + E(d.objet) + '</a></h3>' + NT.ui.statut(d.statut) + '</div>' +
          '<p class="doux meta">' + E(d.id) + ' · ' + E(typeLabelDemande(d.type)) + ' · ' + E(nomService(d)) + ' · ' + E(L('c.esp.envoyee', 'envoyée {date}', { date: NT.ui.date(d.cree) })) + '</p>' +
          (h ? '<p class="derniere"><strong>' + E(L('c.esp.derniere', 'Dernière étape :')) + '</strong> ' + E(h.note || statutTxt(h.statut)) + ' <span class="doux">(' + E(h.par) + ', ' + E(NT.ui.depuis(h.date)) + ')</span></p>' : '') +
          '<div class="ligne entre">' + jalons(d.statut) + '<a class="btn petit" href="suivi.html?id=' + E(d.id) + '">' + E(L('c.esp.suivre', 'Suivre cette demande')) + '</a></div></li>';
      }).join('') : '<li class="vide">' + E(L('c.esp.aucuneEnCours', 'Aucune demande en cours pour le moment.')) + ' <a href="demande.html?type=demarche">' + E(L('c.esp.faireDemande', 'Faire une demande')) + '</a></li>';
    }

    /* --- Rendez-vous --- */
    function rendreRdv() {
      const l = NT.rdv.pour(moi().id).filter(r => r.statut === 'confirme' && new Date(r.debut) > new Date()).slice(0, 3);
      $('#liste-rdv').innerHTML = l.length ? '<ul class="liste-simple">' + l.map(r => '<li><i class="ph-duotone ph-calendar-check" aria-hidden="true"></i><div><strong>' + E(r.libelle || L('c.esp.rdvDefaut', 'Rendez-vous')) + '</strong>' +
        '<span class="doux">' + E(NT.ui.dateHeure(r.debut)) + (r.lieu ? ' · ' + E(r.lieu) : '') + '</span></div></li>').join('') + '</ul><p><a href="rendez-vous.html">' + E(L('c.esp.voirRdv', 'Gérer mes rendez-vous')) + '</a></p>'
        : '<div class="vide"><p>' + E(L('c.esp.aucunRdv', 'Aucun rendez-vous prévu.')) + '</p><a class="btn" href="rendez-vous.html">' + E(L('c.esp.rdv', 'Prendre rendez-vous')) + '</a></div>';
    }

    /* --- Notifications --- */
    function rendreNotifs() {
      const l = NT.notif.pour(moi().id).slice(0, 4);
      $('#liste-notifs').innerHTML = l.length ? '<ul class="liste-simple">' + l.map(n => '<li><i class="ph-duotone ' + (n.niveau === 'alerte' ? 'ph-warning-octagon' : 'ph-bell-simple') + '" aria-hidden="true"></i><div>' +
        '<strong>' + (n.lu ? '' : '<span class="etiquette-nouveau">' + E(L('c.esp.nouveau', 'Nouveau')) + '</span> ') + E(n.titre) + '</strong>' +
        '<span class="doux">' + E(n.texte) + ' · ' + E(NT.ui.depuis(n.cree)) + '</span>' +
        (n.lien ? '<a href="' + E(n.lien) + '" data-lu="' + E(n.id) + '">' + E(L('ui.voir', 'Voir')) + '</a>' : '') + '</div></li>').join('') + '</ul>'
        : '<p class="vide">' + E(L('ui.aucuneNotif', 'Aucune notification pour le moment.')) + '</p>';
    }

    /* --- F26 : historique filtrable --- */
    function rendreHistorique() {
      const q = f.q.trim().toLowerCase();
      const toutes = mesDemandes();
      const l = toutes.filter(d => (!f.statut || d.statut === f.statut) && (!q || (d.objet + ' ' + d.id + ' ' + nomService(d)).toLowerCase().includes(q)))
        .sort((a, b) => (f.ordre === 'desc' ? b.cree.localeCompare(a.cree) : a.cree.localeCompare(b.cree)));
      $('#f-resultat').textContent = L('c.esp.resultats', '{n} demande(s) affichée(s) sur {total}.', { n: l.length, total: toutes.length });
      $('#tbody-hist').innerHTML = l.length ? l.map(d => '<tr><th scope="row" data-label="' + E(L('c.esp.cRef', 'Référence')) + '"><a href="suivi.html?id=' + E(d.id) + '">' + E(d.id) + '</a></th>' +
        '<td data-label="' + E(L('c.esp.cObjet', 'Objet')) + '">' + E(d.objet) + '</td>' +
        '<td data-label="' + E(L('c.esp.cType', 'Type')) + '">' + E(typeLabelDemande(d.type)) + '</td>' +
        '<td data-label="' + E(L('c.esp.cService', 'Service')) + '">' + E(nomService(d)) + '</td>' +
        '<td data-label="' + E(L('c.esp.cDate', 'Envoyée le')) + '">' + E(NT.ui.date(d.cree)) + '</td>' +
        '<td data-label="' + E(L('c.esp.cStatut', 'Statut')) + '">' + NT.ui.statut(d.statut) + '</td></tr>').join('')
        : '<tr><td colspan="6"><p class="vide">' + E(L('c.esp.aucuneHist', 'Aucune demande ne correspond à ce filtre.')) + '</p></td></tr>';
    }
    $('#f-statut').innerHTML = '<option value="">' + E(L('c.esp.tousStatuts', 'Tous les statuts')) + '</option>' + Object.keys(NT.STATUTS).map(k => '<option value="' + k + '">' + E(statutTxt(k)) + '</option>').join('');
    $('#f-statut').addEventListener('change', e => { f.statut = e.target.value; rendreHistorique(); });
    $('#f-q').addEventListener('input', e => { f.q = e.target.value; rendreHistorique(); });
    $('#f-ordre').addEventListener('change', e => { f.ordre = e.target.value; rendreHistorique(); });

    $('#btn-tout-lu').addEventListener('click', () => {
      NT.notif.toutLire(moi().id); rendreNotifs(); rendreKpis();
      const p = $('.pastille-compte'); if (p) p.remove();
      NT.ui.toast(L('c.esp.toutLuOk', 'Toutes vos notifications sont marquées comme lues.'), 'success');
    });
    $('#liste-notifs').addEventListener('click', e => { const a = e.target.closest('[data-lu]'); if (a) NT.notif.lire(a.dataset.lu); });

    /* --- D12 : parcours d'accueil en 3 étapes --- */
    const parcours = $('#parcours');
    const etatAccueil = () => NT.store.lire('accueil:' + moi().id, {});
    function terminerSiComplet() {
      const u = moi(), e = etatAccueil();
      if (u.profilComplet && e.service && e.demarche) {
        NT.store.update('utilisateurs', u.id, { premiereConnexion: false, profilComplet: true });
        NT.ui.toast(L('c.acc.accueilFini', 'Bravo, vous avez fait le tour. Bonne découverte de Terra Nova !'), 'success');
      }
    }
    function rendreParcours() {
      const u = moi();
      let masque = false; try { masque = !!sessionStorage.getItem('nt:accueilMasque'); } catch (e) { /* ignoré */ }
      const besoin = (u.premiereConnexion || !u.profilComplet) && !masque;
      parcours.hidden = !besoin;
      if (!besoin) { parcours.innerHTML = ''; return; }
      const e = etatAccueil();
      const faits = [!!u.profilComplet, !!e.service, !!e.demarche];
      const n = faits.filter(Boolean).length;
      const actuel = faits.indexOf(false);
      const etat = i => faits[i] ? ' faite' : (i === actuel ? ' courante' : '');
      const badge = i => faits[i] ? '<span class="etiquette-etape">' + E(L('c.acc.terminee', 'Terminée')) + '</span>' : '';
      const quartiers = NT.QUARTIERS.map(q => '<option' + (q === u.quartier ? ' selected' : '') + '>' + E(q) + '</option>').join('');
      parcours.innerHTML =
        '<div class="ligne entre"><h2 id="t-parcours" tabindex="-1">' + E(L('c.acc.titre', 'Bienvenue {prenom} : trois étapes pour bien démarrer', { prenom: u.prenom })) + '</h2>' +
        '<button class="btn" type="button" data-plus-tard>' + E(L('c.acc.plusTard', 'Plus tard')) + '</button></div>' +
        '<div class="progression"><div class="progression-barre" role="progressbar" aria-valuemin="0" aria-valuemax="3" aria-valuenow="' + n + '" aria-label="' + E(L('c.acc.progressionLabel', 'Progression de la prise en main')) + '"><span style="width:' + Math.round(n / 3 * 100) + '%"></span></div>' +
        '<p class="doux">' + E(L('c.acc.progression', '{n} étape(s) sur 3 terminée(s)', { n })) + '</p></div>' +
        '<ol class="etapes-accueil">' +
        '<li class="' + etat(0).trim() + '"' + (actuel === 0 ? ' aria-current="step"' : '') + '><span class="num" aria-hidden="true">1</span><div><h3>' + E(L('c.acc.e1', 'Complétez votre profil')) + ' ' + badge(0) + '</h3>' +
        '<p class="doux">' + E(L('c.acc.e1d', 'Votre quartier et votre téléphone nous permettent de vous prévenir au bon endroit.')) + '</p>' +
        (faits[0] ? '' : '<form id="form-accueil" novalidate><div class="resume-erreurs" role="alert"></div><div class="champs-2">' +
          '<div class="champ"><label for="a-quartier">' + E(L('c.ins.quartier', 'Votre quartier')) + '</label><select id="a-quartier"><option value="">' + E(L('c.ins.choisirQuartier', 'Choisissez votre quartier')) + '</option>' + quartiers + '</select></div>' +
          '<div class="champ"><label for="a-tel">' + E(L('c.ins.tel', 'Téléphone')) + '</label><input id="a-tel" type="tel" autocomplete="tel" inputmode="tel" value="' + E(u.telephone || '') + '"></div></div>' +
          '<button class="btn btn-primaire" type="submit">' + E(L('c.acc.enregistrer', 'Enregistrer mon profil')) + '</button></form>') + '</div></li>' +
        '<li class="' + etat(1).trim() + '"' + (actuel === 1 ? ' aria-current="step"' : '') + '><span class="num" aria-hidden="true">2</span><div><h3>' + E(L('c.acc.e2', 'Découvrez un service')) + ' ' + badge(1) + '</h3>' +
        '<p class="doux">' + E(L('c.acc.e2d', 'Santé, logement, état civil : trouvez le service qui correspond à votre besoin.')) + '</p>' +
        (faits[1] ? '' : '<a class="btn" href="services.html" data-etape="service"><i class="ph-duotone ph-compass" aria-hidden="true"></i><span>' + E(L('c.acc.e2b', 'Parcourir les services')) + '</span></a>') + '</div></li>' +
        '<li class="' + etat(2).trim() + '"' + (actuel === 2 ? ' aria-current="step"' : '') + '><span class="num" aria-hidden="true">3</span><div><h3>' + E(L('c.acc.e3', 'Commencez une démarche')) + ' ' + badge(2) + '</h3>' +
        '<p class="doux">' + E(L('c.acc.e3d', 'Une question, un signalement ou une démarche : on vous guide pas à pas.')) + '</p>' +
        (faits[2] ? '' : '<a class="btn ' + (actuel === 2 ? 'btn-primaire' : '') + '" href="demande.html?type=demarche" data-etape="demarche"><i class="ph-duotone ph-file-text" aria-hidden="true"></i><span>' + E(L('c.acc.e3b', 'Commencer une démarche')) + '</span></a>') + '</div></li></ol>' +
        '<p class="doux">' + E(L('c.acc.reviens', 'Vous pouvez quitter cette page et revenir : vos étapes sont gardées.')) + '</p>';
    }
    parcours.addEventListener('submit', e => {
      if (e.target.id !== 'form-accueil') return;
      e.preventDefault();
      const form = e.target, quartier = $('#a-quartier').value, tel = $('#a-tel').value.trim();
      const err = [];
      if (!quartier) err.push({ id: 'a-quartier', msg: L('c.e.quartier', 'Choisissez votre quartier dans la liste.') });
      if (!tel) err.push({ id: 'a-tel', msg: L('c.acc.telRequis', 'Indiquez un numéro de téléphone pour terminer votre profil.') });
      else if (!TEL.test(tel)) err.push({ id: 'a-tel', msg: L('c.e.tel', 'Le numéro de téléphone ne doit contenir que des chiffres, des espaces et le signe +.') });
      poserErreurs(form, err);
      if (err.length) return;
      NT.store.update('utilisateurs', moi().id, { quartier, telephone: tel, profilComplet: true });
      NT.ui.toast(L('c.acc.profilOk', 'Profil enregistré.'), 'success');
      terminerSiComplet(); rendreParcours();
      const t = $('#t-parcours'); if (t) t.focus();
    });
    parcours.addEventListener('click', e => {
      const lien = e.target.closest('[data-etape]');
      if (lien) { NT.store.ecrire('accueil:' + moi().id, Object.assign(etatAccueil(), { [lien.dataset.etape]: true })); terminerSiComplet(); return; }
      if (e.target.closest('[data-plus-tard]')) {
        NT.store.update('utilisateurs', moi().id, { premiereConnexion: false });
        try { sessionStorage.setItem('nt:accueilMasque', '1'); } catch (x) { /* ignoré */ }
        rendreParcours();
        NT.ui.toast(L('c.acc.plusTardOk', 'D’accord. Le guide reviendra tant que votre profil est incomplet.'), 'primary');
      }
    });

    rendreParcours(); rendreKpis(); rendreEnCours(); rendreRdv(); rendreNotifs(); rendreHistorique();

    /* --- F35 : astuces contextuelles, au bon moment --- */
    NT.ui.astuce($('#astuces-haut'), 'esp-signaler', L('c.tip.signaler', 'Un problème dans votre rue ? Le bouton « Signaler un problème » ci-dessous vous guide : dites quoi, puis où.'));
    if (mesDemandes().length >= 3) NT.ui.astuce($('#astuces-hist'), 'esp-filtre', L('c.tip.filtre', 'Beaucoup de demandes ? Filtrez par statut pour ne voir que celles qui attendent encore une réponse.'));
    if (NT.notif.nonLues(moi().id) > 0) NT.ui.astuce($('#astuces-notifs'), 'esp-notifs', L('c.tip.notifs', 'La cloche en haut de la page rassemble les réponses à vos demandes. Ici, vous voyez les plus récentes.'));
    else NT.ui.astuce($('#astuces-rdv'), 'esp-rdv', L('c.tip.rdv', 'Pour un dossier qui demande un échange, réservez un créneau avec un agent : un rappel vous sera envoyé.'));
  };

  /* =====================================================================
     D03, F33 — compte : profil, mot de passe, sécurité, suppression
     ===================================================================== */
  C.compte = function () {
    const moi = () => NT.auth.utilisateur();
    const u0 = moi();
    $('#cpt-sous').textContent = L('c.cpt.sousRole', 'Connecté en tant que {role} ({email}). Gérez votre profil et la sécurité de votre accès.', { role: rolePlein(u0.role), email: u0.email });

    /* --- Profil --- */
    $('#p-quartier').innerHTML = NT.QUARTIERS.map(q => '<option>' + E(q) + '</option>').join('');
    $('#p-langue').innerHTML = Object.entries(NT.i18n.LANGUES).map(([c, n]) => '<option value="' + c + '" lang="' + c + '">' + E(n) + '</option>').join('');
    function remplirProfil() {
      const u = moi();
      $('#p-prenom').value = u.prenom; $('#p-nom').value = u.nom; $('#p-email').value = u.email; $('#p-tel').value = u.telephone || '';
      $('#p-quartier').value = u.quartier || NT.QUARTIERS[0];
      $('#p-langue').value = u.langue || NT.i18n.langue;
      $('#p-alertes').checked = u.alertesQuartier !== false;
      $('#p-vulnerable').checked = !!u.vulnerable;
    }
    remplirProfil();
    const formProfil = $('#form-profil');
    formProfil.addEventListener('submit', e => {
      e.preventDefault();
      const v = id => $('#' + id).value.trim();
      const err = [];
      if (!v('p-prenom')) err.push({ id: 'p-prenom', msg: L('c.e.prenom', 'Indiquez votre prénom.') });
      if (!v('p-nom')) err.push({ id: 'p-nom', msg: L('c.e.nom', 'Indiquez votre nom.') });
      if (v('p-tel') && !TEL.test(v('p-tel'))) err.push({ id: 'p-tel', msg: L('c.e.tel', 'Le numéro de téléphone ne doit contenir que des chiffres, des espaces et le signe +.') });
      if (!v('p-quartier')) err.push({ id: 'p-quartier', msg: L('c.e.quartier', 'Choisissez votre quartier dans la liste.') });
      poserErreurs(formProfil, err);
      if (err.length) return;
      const langue = $('#p-langue').value;
      const avantU = moi();
      const diff = [['Prénom', avantU.prenom, v('p-prenom')], ['Nom', avantU.nom, v('p-nom')], ['Téléphone', avantU.telephone || '', v('p-tel')], ['Quartier', avantU.quartier || '', v('p-quartier')],
        ['Alertes du quartier', avantU.alertesQuartier !== false ? 'oui' : 'non', $('#p-alertes').checked ? 'oui' : 'non'], ['Personne vulnérable', avantU.vulnerable ? 'oui' : 'non', $('#p-vulnerable').checked ? 'oui' : 'non']]
        .filter(x => x[1] !== x[2]);
      if (diff.length) NT.audit.log({ categorie: 'compte', action: 'Modification du profil', objetId: avantU.email, objetLibelle: nomComplet(avantU),
        avant: diff.map(x => x[0] + ' : ' + (x[1] || '—')).join(' ; '), apres: diff.map(x => x[0] + ' : ' + (x[2] || '—')).join(' ; ') });
      NT.store.update('utilisateurs', moi().id, { prenom: v('p-prenom'), nom: v('p-nom'), telephone: v('p-tel'), quartier: v('p-quartier'), langue,
        alertesQuartier: $('#p-alertes').checked, vulnerable: $('#p-vulnerable').checked, profilComplet: !!(v('p-quartier') && v('p-tel')) });
      if (langue !== NT.i18n.langue) { NT.i18n.changer(langue); return; }
      NT.ui.toast(L('c.cpt.profilOk', 'Votre profil est enregistré.'), 'success');
    });

    /* --- Mot de passe --- */
    ['m-ancien', 'm-confirm'].forEach(id => brancherMdp($('#' + id), false));
    brancherMdp($('#m-nouveau'), true);
    const formMdp = $('#form-mdp');
    const gardeMdp = garde('mdp');
    formMdp.addEventListener('submit', e => {
      e.preventDefault();
      const u = moi();
      const ancien = $('#m-ancien').value, nouveau = $('#m-nouveau').value, conf = $('#m-confirm').value;
      const err = [];
      const attente = gardeMdp.restant();
      if (attente) { poserErreurs(formMdp, [{ id: 'm-ancien', msg: messageTrop(attente) }]); return; }
      if (!ancien) err.push({ id: 'm-ancien', msg: L('c.cpt.ancienVide', 'Saisissez votre mot de passe actuel.') });
      else if (!NT.auth.verifierMotDePasse(u, ancien)) {
        const r = gardeMdp.echec(u.email);
        err.push({ id: 'm-ancien', msg: r > 0 ? L('c.cpt.ancienFaux', 'Le mot de passe actuel est incorrect. Il vous reste {n} essai(s).', { n: r }) : messageTrop(5 * 60000) });
      }
      const manques = NT.auth.validerMotDePasse(nouveau);
      if (!nouveau) err.push({ id: 'm-nouveau', msg: L('c.cpt.nouveauVide', 'Choisissez un nouveau mot de passe.') });
      else if (manques.length) err.push({ id: 'm-nouveau', msg: L('c.e.mdpFaible', 'Le mot de passe est trop faible : il manque {liste}.', { liste: manques.join(', ') }) });
      else if (nouveau === ancien) err.push({ id: 'm-nouveau', msg: L('c.cpt.identique', 'Le nouveau mot de passe doit être différent de l’actuel.') });
      if (nouveau && conf !== nouveau) err.push({ id: 'm-confirm', msg: L('c.cpt.confirmDiff', 'La confirmation ne correspond pas au nouveau mot de passe.') });
      poserErreurs(formMdp, err);
      if (err.length) return;
      NT.auth.changerMotDePasse(u, nouveau);
      gardeMdp.ok();
      formMdp.reset();
      NT.ui.toast(L('c.cpt.mdpOk', 'Votre mot de passe a été changé.'), 'success');
      rendreSecurite();
    });

    /* --- Sécurité --- */
    function rendreSecurite() {
      const u = moi();
      const evts = NT.auth.journal().filter(x => x.email === u.email);
      const connexions = evts.filter(x => x.type === 'connexion');
      const precedente = connexions[1];
      let echecs = 0;
      if (connexions[0]) {
        const debut = evts.indexOf(connexions[0]);
        for (let i = debut + 1; i < evts.length && evts[i].type !== 'connexion'; i++) if (evts[i].type === 'echec_connexion') echecs++;
      }
      let depuis = '';
      try { depuis = (NT.store.lire('session', {}) || {}).depuis || ''; } catch (e) { /* ignoré */ }
      $('#secu-fiche').innerHTML =
        '<div><dt>' + E(L('c.cpt.depuis', 'Session en cours depuis')) + '</dt><dd>' + E(fmtDH(depuis)) + '</dd></div>' +
        '<div><dt>' + E(L('c.cpt.precedente', 'Connexion précédente')) + '</dt><dd>' + E(precedente ? fmtDH(precedente.date) : L('c.cpt.aucune', 'Aucune connexion précédente')) + '</dd></div>' +
        '<div><dt>' + E(L('c.cpt.echecs', 'Échecs depuis votre connexion précédente')) + '</dt><dd>' + (echecs ? '<strong>' + echecs + '</strong>' : '0') + '</dd></div>';
      $('#secu-protection').innerHTML =
        '<li>' + E(L('c.cpt.p1', 'Après {n} mots de passe incorrects, une petite question de vérification est demandée.', { n: NT.auth.SEUIL_VERIF })) + '</li>' +
        '<li>' + E(L('c.cpt.p2', 'Après {n} échecs, la connexion est suspendue 5 minutes (de plus en plus longtemps en cas de répétition) : votre compte n’est pas supprimé.', { n: NT.auth.SEUIL_BLOCAGE })) + '</li>' +
        '<li>' + E(L('c.cpt.p3', 'À votre prochaine connexion réussie, vous êtes prévenu du nombre de tentatives échouées.')) + '</li>' +
        '<li>' + E(L('c.cpt.p4', 'Chaque connexion, échec et action sensible est inscrit dans un journal contrôlé par la mairie.')) + '</li>';
      const recents = evts.slice(0, 6);
      $('#secu-activite').innerHTML = recents.length ? recents.map(x => '<li>' + pastilleType(x.type) + '<span class="doux">' + E(fmtDH(x.date)) + '</span></li>').join('')
        : '<li class="doux">' + E(L('c.cpt.aucuneActivite', 'Aucune activité enregistrée.')) + '</li>';
    }
    rendreSecurite();

    /* --- F33 : suppression du compte --- */
    function rendreSuppression() {
      const box = $('#suppr-contenu');
      if (moi().role !== 'citoyen') {
        box.innerHTML = '<div class="note-info"><p><strong>' + E(L('c.sup.interditTitre', 'Cette action n’est pas disponible pour votre profil.')) + '</strong></p>' +
          '<p>' + E(L('c.sup.interdit', 'Un compte agent ou administrateur ne peut pas être supprimé depuis cette page : cela garantit que la mairie garde toujours des personnes habilitées. Demandez à un autre administrateur de traiter votre demande.')) + '</p></div>';
        return;
      }
      box.innerHTML =
        '<p>' + E(L('c.sup.intro', 'Vous pouvez supprimer votre compte à tout moment. Voici ce qui se passera.')) + '</p>' +
        '<div class="grille-2"><div><h3>' + E(L('c.sup.supprime', 'Ce qui sera supprimé')) + '</h3><ul>' +
        '<li>' + E(L('c.sup.s1', 'Votre profil et vos coordonnées')) + '</li><li>' + E(L('c.sup.s2', 'Vos rendez-vous')) + '</li><li>' + E(L('c.sup.s3', 'Vos notifications')) + '</li><li>' + E(L('c.sup.s4', 'Votre accès : vous ne pourrez plus vous connecter')) + '</li></ul></div>' +
        '<div><h3>' + E(L('c.sup.conserve', 'Ce qui sera conservé, sans votre nom')) + '</h3><ul>' +
        '<li>' + E(L('c.sup.c1', 'Vos demandes et signalements, rendus anonymes, pour que la ville puisse finir de les traiter')) + '</li><li>' + E(L('c.sup.c2', 'Une trace de la suppression dans le journal de sécurité')) + '</li></ul></div></div>' +
        '<form id="form-suppr" novalidate><div class="resume-erreurs" role="alert"></div>' +
        '<p class="doux">' + E(L('c.sup.verif', 'Pour vérifier que c’est bien vous, confirmez avec votre mot de passe et recopiez le mot demandé.')) + '</p>' +
        '<div class="champ"><label for="s-mdp">' + E(L('c.cpt.ancien', 'Mot de passe actuel')) + '</label><div class="mdp-ligne"><input id="s-mdp" type="password" autocomplete="current-password" required></div></div>' +
        '<div class="champ"><label for="s-mot">' + E(L('c.sup.mot', 'Tapez le mot SUPPRIMER pour confirmer')) + '</label><input id="s-mot" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="aide-s-mot" required>' +
        '<p class="aide" id="aide-s-mot">' + E(L('c.sup.motAide', 'En lettres majuscules, exactement : SUPPRIMER')) + '</p></div>' +
        '<button class="btn btn-danger" type="submit"><i class="ph-duotone ph-trash" aria-hidden="true"></i><span>' + E(L('c.sup.bouton', 'Supprimer mon compte')) + '</span></button></form>';
      brancherMdp($('#s-mdp'), false);
      const form = $('#form-suppr');
      const g = garde('suppression');
      form.addEventListener('submit', e => {
        e.preventDefault();
        const u = moi();
        const mdp = $('#s-mdp').value, mot = $('#s-mot').value.trim();
        const err = [];
        const attente = g.restant();
        if (attente) { poserErreurs(form, [{ id: 's-mdp', msg: messageTrop(attente) }]); return; }
        if (!mdp) err.push({ id: 's-mdp', msg: L('c.cpt.ancienVide', 'Saisissez votre mot de passe actuel.') });
        else if (!NT.auth.verifierMotDePasse(u, mdp)) {
          const r = g.echec(u.email);
          err.push({ id: 's-mdp', msg: r > 0 ? L('c.cpt.ancienFaux', 'Le mot de passe actuel est incorrect. Il vous reste {n} essai(s).', { n: r }) : messageTrop(5 * 60000) });
        }
        if (mot !== 'SUPPRIMER') err.push({ id: 's-mot', msg: L('c.sup.motFaux', 'Recopiez exactement le mot SUPPRIMER, en majuscules.') });
        poserErreurs(form, err);
        if (err.length) return;
        confirmer({ titre: L('c.sup.dlgTitre', 'Supprimer définitivement votre compte ?'), danger: true, bouton: L('c.sup.dlgOk', 'Oui, supprimer mon compte'),
          texte: L('c.sup.dlgTexte', 'Cette action est irréversible. Votre accès, vos rendez-vous et vos notifications seront supprimés ; vos demandes seront conservées sans votre nom.') })
          .then(ok => {
            if (!ok) return;
            const cible = moi();
            if (!cible || cible.role !== 'citoyen') return;
            NT.audit.log({ categorie: 'compte', action: 'Suppression du compte par son titulaire', objetId: cible.email, objetLibelle: nomComplet(cible), avant: 'Actif', apres: 'Supprimé', motif: 'Demande de l’utilisateur' });
            NT.auth.supprimerCompte(cible);
            g.ok();
            try { sessionStorage.setItem('nt:compteSupprime', '1'); } catch (x) { /* ignoré */ }
            // retour à l'accueil en visiteur : l'en-tête n'affiche plus le compte, ui.js confirme la suppression
            location.replace('index.html'); return;
            $('#contenu').innerHTML = '<section class="panneau adieu" role="status"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i><h1 id="t-adieu" tabindex="-1">' + E(L('c.sup.adieu', 'Votre compte a été supprimé')) + '</h1>' +
              '<p>' + E(L('c.sup.adieuTexte', 'Vos données personnelles ont été effacées et vous êtes déconnecté. Merci d’avoir utilisé Terra Nova ; vous pouvez créer un nouveau compte à tout moment.')) + '</p>' +
              '<a class="btn btn-primaire" href="index.html">' + E(L('c.sup.accueil', 'Retourner à l’accueil')) + '</a></section>';
            NT.ui.annoncer(L('c.sup.adieu', 'Votre compte a été supprimé'));
            const t = $('#t-adieu'); if (t) t.focus();
          });
      });
    }
    rendreSuppression();
  };

  /* =====================================================================
     F34, D08, D09 — administration des comptes
     ===================================================================== */
  C.admin = function () {
    const moi = () => NT.auth.utilisateur();
    const estAdmin = () => !!moi() && moi().role === 'admin';
    const f = { q: '', role: '', etat: '' };
    const fj = { type: '', n: 25 };
    const verrouille = u => NT.auth.etatSecurite(u.email).verrouJusqu > Date.now();
    const etatDe = u => (u.actif === false ? 'desactive' : verrouille(u) ? 'verrouille' : 'actif');
    const badgeEtat = c => {
      const d = { actif: ['statut-ok', L('c.adm.actif', 'Actif')], desactive: ['statut-cloturee', L('c.adm.desactive', 'Désactivé')], verrouille: ['statut-incident', L('c.adm.verrouille', 'Verrouillé')] }[c];
      return '<span class="statut ' + d[0] + '">' + E(d[1]) + '</span>';
    };
    const refus = () => {
      const m = moi(); if (m) NT.auth.ecrireJournal('acces_refuse', m.email, 'action de gestion des comptes non autorisée');
      NT.ui.toast(L('c.adm.refus', 'Cette action est réservée à un autre profil.'), 'danger');
      rendreTout();
    };

    /* --- encarts selon le rôle (D08) --- */
    const admin0 = estAdmin();
    $('#adm-role-note').textContent = admin0 ? L('c.adm.noteAdmin', 'Vous pouvez gérer tous les comptes, sauf le vôtre.') : L('c.adm.noteAgent', 'Vous pouvez gérer les comptes des citoyens.');
    $('#adm-encart').innerHTML = admin0
      ? '<div class="note-info"><p><strong>' + E(L('c.adm.encartAdminT', 'Vous êtes administrateur.')) + '</strong></p><p>' + E(L('c.adm.encartAdmin', 'Vous pouvez changer le rôle d’un compte. Vous ne pouvez ni modifier votre propre rôle ni désactiver votre propre compte : la plateforme garde ainsi toujours au moins un administrateur actif.')) + '</p></div>'
      : '<div class="note-info"><p><strong>' + E(L('c.adm.encartAgentT', 'Vous êtes connecté en tant qu’agent municipal.')) + '</strong></p><p>' + E(L('c.adm.encartAgent', 'Vous pouvez désactiver, réactiver et débloquer les comptes des citoyens, et consulter le journal. Seuls les administrateurs peuvent changer le rôle d’un compte ou agir sur les comptes de l’équipe : c’est volontaire, pour qu’une erreur ou un accès usurpé ne puisse pas étendre les droits.')) + '</p></div>';

    const DROITS = [
      ['c.d.1', 'Faire une demande, signaler un problème, prendre rendez-vous', 1, 1, 1],
      ['c.d.2', 'Consulter l’espace personnel et l’historique de ses propres demandes', 1, 0, 0],
      ['c.d.3', 'Supprimer son propre compte depuis « Mon compte »', 1, 0, 0],
      ['c.d.4', 'Voir et traiter les demandes de tous les habitants', 0, 1, 1],
      ['c.d.5', 'Publier une annonce ou une alerte', 0, 1, 1],
      ['c.d.6', 'Voir la liste des comptes et le journal de sécurité', 0, 1, 1],
      ['c.d.7', 'Désactiver, réactiver ou débloquer un compte citoyen', 0, 1, 1],
      ['c.d.8', 'Agir sur les comptes agents et administrateurs', 0, 0, 1],
      ['c.d.9', 'Changer le rôle d’un compte', 0, 0, 1]
    ];
    const oui = () => '<span class="droit oui"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i>' + E(L('c.oui', 'Oui')) + '</span>';
    const non = () => '<span class="droit non"><i class="ph ph-minus-circle" aria-hidden="true"></i>' + E(L('c.non', 'Non')) + '</span>';
    $('#tbody-droits').innerHTML = DROITS.map(d => '<tr><th scope="row">' + E(L(d[0], d[1])) + '</th><td>' + (d[2] ? oui() : non()) + '</td><td>' + (d[3] ? oui() : non()) + '</td><td>' + (d[4] ? oui() : non()) + '</td></tr>').join('');

    /* --- filtres --- */
    $('#a-role').innerHTML = '<option value="">' + E(L('c.adm.tousRoles', 'Tous les rôles')) + '</option>' + Object.keys(NT.ROLES).map(r => '<option value="' + r + '">' + E(rolePlein(r)) + '</option>').join('');
    $('#a-etat').innerHTML = '<option value="">' + E(L('c.adm.tousEtats', 'Tous les états')) + '</option><option value="actif">' + E(L('c.adm.actif', 'Actif')) + '</option><option value="desactive">' + E(L('c.adm.desactive', 'Désactivé')) + '</option><option value="verrouille">' + E(L('c.adm.verrouille', 'Verrouillé')) + '</option>';
    $('#a-q').addEventListener('input', e => { f.q = e.target.value; rendreTableau(); });
    $('#a-role').addEventListener('change', e => { f.role = e.target.value; rendreTableau(); });
    $('#a-etat').addEventListener('change', e => { f.etat = e.target.value; rendreTableau(); });
    $('#j-type').innerHTML = '<option value="">' + E(L('c.adm.tousTypes', 'Tous les événements')) + '</option>' + Object.keys(TYPES).map(t => '<option value="' + t + '">' + E(typeLabel(t)) + '</option>').join('');
    $('#j-type').addEventListener('change', e => { fj.type = e.target.value; fj.n = 25; rendreJournal(); });
    $('#j-plus').addEventListener('click', () => { fj.n += 25; rendreJournal(); });

    /* --- KPI --- */
    function rendreKpis() {
      const l = NT.store.get('utilisateurs');
      const kpi = (n, txt, fort) => '<div class="kpi' + (fort && n ? ' fort' : '') + '"><div class="valeur">' + n + '</div><div class="libelle">' + E(txt) + '</div></div>';
      $('#adm-kpis').innerHTML = kpi(l.length, L('c.adm.kTotal', 'Comptes au total'), false) + kpi(l.filter(u => u.role === 'citoyen').length, L('c.adm.kCit', 'Citoyens'), false) +
        kpi(l.filter(u => u.role !== 'citoyen').length, L('c.adm.kEquipe', 'Équipe municipale'), false) + kpi(l.filter(u => u.actif === false).length, L('c.adm.kDesact', 'Comptes désactivés'), true) +
        kpi(l.filter(u => u.actif !== false && verrouille(u)).length, L('c.adm.kVerrou', 'Comptes verrouillés'), true);
    }

    /* --- Tableau des comptes --- */
    function rendreTableau(focus) {
      const m = moi(), admin = estAdmin();
      const lbl = { nom: L('c.adm.cNom', 'Nom'), email: L('c.adm.cEmail', 'E-mail'), role: L('c.adm.cRole', 'Rôle'), chg: L('c.adm.cChg', 'Changer le rôle'), q: L('c.adm.cQuartier', 'Quartier'), etat: L('c.adm.cEtat', 'État'), conn: L('c.adm.cConn', 'Dernière connexion'), act: L('c.adm.cAct', 'Actions') };
      $('#thead-comptes').innerHTML = '<tr><th scope="col">' + E(lbl.nom) + '</th><th scope="col">' + E(lbl.email) + '</th><th scope="col">' + E(lbl.role) + '</th>' + (admin ? '<th scope="col">' + E(lbl.chg) + '</th>' : '') +
        '<th scope="col">' + E(lbl.q) + '</th><th scope="col">' + E(lbl.etat) + '</th><th scope="col">' + E(lbl.conn) + '</th><th scope="col">' + E(lbl.act) + '</th></tr>';
      const q = f.q.trim().toLowerCase();
      const l = NT.store.get('utilisateurs').filter(u => (!q || (nomComplet(u) + ' ' + u.email).toLowerCase().includes(q)) && (!f.role || u.role === f.role) && (!f.etat || etatDe(u) === f.etat))
        .sort((a, b) => nomComplet(a).localeCompare(nomComplet(b)));
      $('#a-resultat').textContent = L('c.adm.resultats', '{n} compte(s) affiché(s).', { n: l.length });
      $('#tbody-comptes').innerHTML = l.length ? l.map(u => {
        const soi = m && u.id === m.id, nom = nomComplet(u), et = etatDe(u);
        const peut = !soi && (admin || u.role === 'citoyen');
        const btns = ['<button class="btn petit" type="button" data-act="detail" data-id="' + E(u.id) + '" aria-label="' + E(L('c.adm.detailDe', 'Voir le détail de {nom}', { nom })) + '">' + E(L('c.adm.detail', 'Détail')) + '</button>'];
        if (peut) btns.push('<button class="btn petit' + (u.actif === false ? '' : ' btn-danger') + '" type="button" data-act="toggle" data-id="' + E(u.id) + '" aria-label="' + E(u.actif === false ? L('c.adm.reactiverDe', 'Réactiver le compte de {nom}', { nom }) : L('c.adm.desactiverDe', 'Désactiver le compte de {nom}', { nom })) + '">' + E(u.actif === false ? L('c.adm.reactiver', 'Réactiver') : L('c.adm.desactiver', 'Désactiver')) + '</button>');
        if (peut && verrouille(u)) btns.push('<button class="btn petit" type="button" data-act="debloquer" data-id="' + E(u.id) + '" aria-label="' + E(L('c.adm.debloquerDe', 'Débloquer le compte de {nom}', { nom })) + '">' + E(L('c.adm.debloquer', 'Débloquer')) + '</button>');
        const selRole = admin ? '<td data-label="' + E(lbl.chg) + '"><label class="sr-only" for="role-' + E(u.id) + '">' + E(L('c.adm.roleDe', 'Rôle de {nom}', { nom })) + '</label>' +
          '<select id="role-' + E(u.id) + '" data-role-de="' + E(u.id) + '"' + (soi ? ' disabled aria-describedby="aide-soi"' : '') + '>' + Object.keys(NT.ROLES).map(r => '<option value="' + r + '"' + (r === u.role ? ' selected' : '') + '>' + E(rolePlein(r)) + '</option>').join('') + '</select>' +
          (soi ? '<span class="doux petit-texte" id="aide-soi">' + E(L('c.adm.pasSoi', 'Vous ne pouvez pas modifier votre propre rôle.')) + '</span>' : '') + '</td>' : '';
        return '<tr><th scope="row" data-label="' + E(lbl.nom) + '">' + E(nom) + (soi ? ' <span class="doux">(' + E(L('c.adm.vous', 'vous')) + ')</span>' : '') + '</th>' +
          '<td data-label="' + E(lbl.email) + '">' + E(u.email) + '</td>' +
          '<td data-label="' + E(lbl.role) + '"><span class="badge-role">' + E(rolePlein(u.role)) + '</span></td>' + selRole +
          '<td data-label="' + E(lbl.q) + '">' + E(u.quartier || '—') + '</td>' +
          '<td data-label="' + E(lbl.etat) + '">' + badgeEtat(et) + '</td>' +
          '<td data-label="' + E(lbl.conn) + '">' + E(fmtDH(u.derniereConnexion)) + '</td>' +
          '<td data-label="' + E(lbl.act) + '"><div class="actions-ligne">' + btns.join('') + '</div></td></tr>';
      }).join('') : '<tr><td colspan="8"><p class="vide">' + E(L('c.adm.aucun', 'Aucun compte ne correspond à cette recherche.')) + '</p></td></tr>';
      if (focus) { const b = document.querySelector(focus); if (b) b.focus(); }
    }

    /* --- Journal --- */
    function rendreJournal() {
      const tout = NT.auth.journal().filter(x => !fj.type || x.type === fj.type);
      const l = tout.slice(0, fj.n);
      $('#j-resultat').textContent = L('c.adm.jResultats', '{n} événement(s) affiché(s) sur {total}.', { n: l.length, total: tout.length });
      $('#tbody-journal').innerHTML = l.length ? l.map(x => '<tr><td data-label="' + E(L('c.adm.jDate', 'Date')) + '"><time datetime="' + E(x.date) + '">' + E(fmtDH(x.date)) + '</time></td>' +
        '<td data-label="' + E(L('c.adm.jEvt', 'Événement')) + '">' + pastilleType(x.type) + '</td>' +
        '<td data-label="' + E(L('c.adm.jCompte', 'Compte')) + '">' + E(x.email || '—') + '</td>' +
        '<td data-label="' + E(L('c.adm.jDetail', 'Détail')) + '">' + E(x.detail || '—') + '</td></tr>').join('')
        : '<tr><td colspan="4"><p class="vide">' + E(L('c.adm.jVide', 'Aucun événement pour ce filtre.')) + '</p></td></tr>';
      const plus = $('#j-plus');
      plus.hidden = tout.length <= fj.n;
      plus.textContent = L('c.adm.jPlus', 'Afficher 25 événements de plus');
    }
    function rendreTout() { rendreKpis(); rendreTableau(); rendreJournal(); }

    /* --- Détail d'un compte (tiroir) --- */
    let tiroir = null;
    function voirDetail(id) {
      const u = NT.store.find('utilisateurs', id); if (!u) return;
      if (!tiroir) { tiroir = document.createElement('sl-drawer'); document.body.append(tiroir); }
      const sec = NT.auth.etatSecurite(u.email);
      const evts = NT.auth.journal().filter(x => x.email === u.email).slice(0, 6);
      const dd = (k, v) => '<div><dt>' + E(k) + '</dt><dd>' + v + '</dd></div>';
      tiroir.label = L('c.adm.detailTitre', 'Détail du compte') + ' — ' + nomComplet(u);
      tiroir.innerHTML = '<dl class="fiche">' +
        dd(L('c.adm.cNom', 'Nom'), E(nomComplet(u))) + dd(L('c.adm.cEmail', 'E-mail'), E(u.email)) +
        dd(L('c.adm.cRole', 'Rôle'), '<span class="badge-role">' + E(rolePlein(u.role)) + '</span>') + dd(L('c.adm.cEtat', 'État'), badgeEtat(etatDe(u))) +
        dd(L('c.adm.cQuartier', 'Quartier'), E(u.quartier || '—')) + dd(L('c.ins.tel', 'Téléphone'), NT.sensible ? NT.sensible.telephone(u) : E(u.telephone || '—')) +
        dd(L('c.adm.cree', 'Compte créé le'), E(u.cree ? NT.ui.date(u.cree) : '—')) + dd(L('c.adm.cConn', 'Dernière connexion'), E(fmtDH(u.derniereConnexion))) +
        dd(L('c.adm.vuln', 'Personne vulnérable (alertes prioritaires)'), E(u.vulnerable ? L('c.oui', 'Oui') : L('c.non', 'Non'))) +
        dd(L('c.adm.nbDem', 'Demandes déposées'), String(NT.demandes.pour(u.id).length)) +
        dd(L('c.adm.echecsCours', 'Échecs de connexion en cours'), String(sec.echecs || 0)) +
        dd(L('c.adm.blocages', 'Verrouillages passés'), String(sec.blocages || 0)) + '</dl>' +
        (NT.sensible ? NT.sensible.dossier(u) : '') +   // vague 13 (F70) : dossier réservé aux agents habilités
        '<h3>' + E(L('c.adm.activite', 'Activité récente')) + '</h3>' +
        (evts.length ? '<ul class="liste-activite">' + evts.map(x => '<li>' + pastilleType(x.type) + '<span class="doux">' + E(fmtDH(x.date)) + '</span></li>').join('') + '</ul>' : '<p class="doux">' + E(L('c.cpt.aucuneActivite', 'Aucune activité enregistrée.')) + '</p>') +
        '<sl-button slot="footer" variant="primary" data-fermer>' + E(L('ui.fermer', 'Fermer')) + '</sl-button>';
      tiroir.querySelector('[data-fermer]').addEventListener('click', () => tiroir.hide());
      customElements.whenDefined('sl-drawer').then(() => tiroir.show());
    }

    /* --- Actions sensibles : revérification des droits, confirmation, journal --- */
    function actionToggle(id) {
      const m = moi(), cible = NT.store.find('utilisateurs', id);
      if (!m || !cible || cible.id === m.id || !(m.role === 'admin' || (m.role === 'agent' && cible.role === 'citoyen'))) { refus(); return; }
      const desactive = cible.actif !== false, nom = nomComplet(cible);
      confirmer({
        titre: desactive ? L('c.adm.cfDesT', 'Désactiver ce compte ?') : L('c.adm.cfReaT', 'Réactiver ce compte ?'), danger: desactive,
        texte: desactive ? L('c.adm.cfDes', '{nom} ne pourra plus se connecter tant que le compte n’est pas réactivé. Ses demandes sont conservées.', { nom }) : L('c.adm.cfRea', '{nom} pourra de nouveau se connecter.', { nom }),
        bouton: desactive ? L('c.adm.desactiver', 'Désactiver') : L('c.adm.reactiver', 'Réactiver')
      }).then(ok => {
        if (!ok) { rendreTableau('[data-act="toggle"][data-id="' + id + '"]'); return; }
        NT.store.update('utilisateurs', cible.id, { actif: !desactive });
        NT.audit.log({ categorie: 'compte', action: desactive ? 'Désactivation du compte' : 'Réactivation du compte', objetId: cible.email, objetLibelle: nom,
          avant: desactive ? 'Actif' : 'Désactivé', apres: desactive ? 'Désactivé' : 'Actif' });
        NT.auth.ecrireJournal(desactive ? 'desactivation' : 'reactivation', cible.email, L('c.adm.par', 'par {email}', { email: m.email }));
        NT.ui.toast(desactive ? L('c.adm.desOk', 'Compte de {nom} désactivé.', { nom }) : L('c.adm.reaOk', 'Compte de {nom} réactivé.', { nom }), 'success');
        rendreKpis(); rendreTableau('[data-act="toggle"][data-id="' + id + '"]'); rendreJournal();
      });
    }
    function actionDebloquer(id) {
      const m = moi(), cible = NT.store.find('utilisateurs', id);
      if (!m || !cible || cible.id === m.id || !(m.role === 'admin' || (m.role === 'agent' && cible.role === 'citoyen'))) { refus(); return; }
      NT.auth.debloquer(cible.email);
      NT.audit.log({ categorie: 'compte', action: 'Déblocage du compte', objetId: cible.email, objetLibelle: nomComplet(cible), avant: 'Verrouillé', apres: 'Actif' });
      NT.ui.toast(L('c.adm.debOk', 'Compte de {nom} débloqué.', { nom: nomComplet(cible) }), 'success');
      rendreKpis(); rendreTableau('[data-act="detail"][data-id="' + id + '"]'); rendreJournal();
    }
    function actionRole(id, nouveau) {
      const m = moi(), cible = NT.store.find('utilisateurs', id);
      if (!m || m.role !== 'admin' || !cible || cible.id === m.id || !NT.ROLES[nouveau]) { refus(); return; }
      if (nouveau === cible.role) return;
      const nom = nomComplet(cible);
      confirmer({
        titre: L('c.adm.cfRoleT', 'Changer le rôle de ce compte ?'), danger: nouveau !== 'citoyen' && cible.role === 'citoyen',
        texte: L('c.adm.cfRole', '{nom} passera de « {de} » à « {vers} ». Ses outils et ses accès changeront dès la prochaine page qu’il ouvrira.', { nom, de: rolePlein(cible.role), vers: rolePlein(nouveau) }),
        bouton: L('c.adm.cfRoleOk', 'Changer le rôle')
      }).then(ok => {
        const apres = '#role-' + id;
        if (!ok) { rendreTableau(apres); return; }
        NT.store.update('utilisateurs', cible.id, { role: nouveau });
        NT.audit.log({ categorie: 'compte', action: 'Changement de rôle', objetId: cible.email, objetLibelle: nom, avant: NT.ROLES[cible.role] || cible.role, apres: NT.ROLES[nouveau] || nouveau });
        NT.auth.ecrireJournal('changement_role', cible.email, cible.role + ' → ' + nouveau + ', ' + L('c.adm.par', 'par {email}', { email: m.email }));
        NT.ui.toast(L('c.adm.roleOk', 'Rôle de {nom} : {role}.', { nom, role: rolePlein(nouveau) }), 'success');
        rendreTout();
        const s = document.querySelector(apres); if (s) s.focus();
      });
    }
    $('#tbody-comptes').addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const id = b.dataset.id;
      if (b.dataset.act === 'detail') voirDetail(id);
      else if (b.dataset.act === 'toggle') actionToggle(id);
      else if (b.dataset.act === 'debloquer') actionDebloquer(id);
    });
    $('#tbody-comptes').addEventListener('change', e => {
      const s = e.target.closest('[data-role-de]'); if (s) actionRole(s.dataset.roleDe, s.value);
    });

    rendreTout();
  };

  /* ---------- Traductions (FR = repli dans le code) ---------- */
  NT.i18n.ajouter({ en: {
    'c.facultatif': '(optional)', 'c.afficher': 'Show', 'c.masquer': 'Hide', 'c.annuler': 'Cancel', 'c.oui': 'Yes', 'c.non': 'No',
    'c.resume.n': '{n} things to fix:', 'c.resume.1': 'One thing to fix:',
    'c.role.citoyen': 'Citizen', 'c.role.agent': 'Municipal staff', 'c.role.admin': 'Administrator',
    'c.regle.8': 'at least 8 characters', 'c.regle.maj': 'an uppercase letter', 'c.regle.chiffre': 'a digit', 'c.regle.titre': 'Your password must contain:',
    'c.regle.ok': 'met', 'c.regle.ko': 'to add', 'c.regle.conseil': 'Tip: 12 characters or more, with a lowercase letter and a symbol, make it stronger.',
    'c.force.1': 'Too weak', 'c.force.2': 'Fair', 'c.force.3': 'Good', 'c.force.4': 'Very strong', 'c.force.label': 'Strength: {n}', 'c.force.vide': 'Strength: type a password',
    'c.trop': 'Too many incorrect attempts. For your security, try again in {min} minute(s).',
    'c.e.prenom': 'Enter your first name.', 'c.e.nom': 'Enter your last name.', 'c.e.email': 'Enter your e-mail address.',
    'c.e.emailFormat': 'The e-mail address should look like name@example.com.', 'c.e.emailPris': 'An account already exists with this address. Sign in or use another address.',
    'c.e.mdp': 'Choose a password.', 'c.e.mdpFaible': 'The password is too weak: it needs {liste}.', 'c.e.mdpSaisir': 'Enter your password.',
    'c.e.quartier': 'Choose your district from the list.', 'c.e.tel': 'The phone number may only contain digits, spaces and the + sign.',
    'c.j.connexion': 'Successful sign-in', 'c.j.echec_connexion': 'Failed sign-in', 'c.j.verrouillage': 'Account locked', 'c.j.tentative_bloquee': 'Attempt during a lock',
    'c.j.deblocage': 'Account unlocked', 'c.j.acces_refuse': 'Access denied', 'c.j.inscription': 'Account created', 'c.j.mdp_change': 'Password changed',
    'c.j.echec_mdp': 'Wrong current password', 'c.j.desactivation': 'Account deactivated', 'c.j.reactivation': 'Account reactivated', 'c.j.changement_role': 'Role changed', 'c.j.suppression_compte': 'Account deleted',
    /* inscription */
    'c.ins.titre': 'Create my resident account', 'c.ins.sous': 'One minute is enough to open your personal space: track your requests, appointments and your district’s alerts.',
    'c.ins.formTitre': 'Sign-up form', 'c.ins.dejaTitre': 'You are already signed in.', 'c.ins.versEspace': 'Go to my space',
    'c.ins.dejaTexte': 'You are signed in as {nom}. Sign out to create another account.', 'c.ins.oblig': 'All fields are required, except the phone number.',
    'c.ins.prenom': 'First name', 'c.ins.nom': 'Last name', 'c.ins.email': 'E-mail address', 'c.ins.emailAide': 'You will use it to sign in.',
    'c.ins.mdp': 'Password', 'c.ins.mdpAide': 'Choose a password you do not use anywhere else.', 'c.ins.quartier': 'Your district', 'c.ins.choisirQuartier': 'Choose your district',
    'c.ins.quartierAide': 'It lets us warn you first when there is an alert near you.', 'c.ins.tel': 'Phone', 'c.ins.telAide': 'Only used to reach you about an appointment or a request.',
    'c.ins.alertes': 'I want to receive my district’s alerts', 'c.ins.submit': 'Create my account', 'c.ins.pourquoi': 'What you will find in your space',
    'c.ins.b1': 'All your requests and their progress, in one place.', 'c.ins.b2': 'Your appointments with the services, with a reminder.', 'c.ins.b3': 'Your district’s alerts, without searching for them.',
    'c.ins.deja': 'Already have an account?', 'c.ins.seconnecter': 'Sign in', 'c.ins.ok': 'Account created. Welcome to Terra Nova!',
    /* connexion */
    'c.con.titre': 'Sign in to my space', 'c.con.sous': 'Pick up your requests, appointments and notifications where you left them.', 'c.con.formTitre': 'Sign-in form',
    'c.con.dejaTitre': 'You are already signed in.', 'c.con.dejaTexte': 'You are signed in as {nom} ({role}).', 'c.con.continuer': 'Continue', 'c.con.changer': 'Switch account',
    'c.con.secuTitre': 'Signed in, with a security notice', 'c.con.secuAide': 'If it was not you, change your password from “My account”.',
    'c.con.alerteSecu': '{n} failed sign-in attempt(s) since your last sign-in.',
    'c.con.verrouTitre': 'Sign-in paused for a few minutes', 'c.con.verrouRebours': 'You can try again in', 'c.con.reboursSr': ' about {min} minute(s)',
    'c.con.verrouExplication': 'No need to worry: your account and data are safe. After several incorrect passwords, we briefly pause sign-in so nobody else can guess your password. A staff member can also unlock your account at the city hall desk.',
    'c.con.email': 'E-mail address', 'c.con.mdp': 'Password', 'c.con.verifAide': 'A small check to protect accounts from automated programs. Answer with a number.',
    'c.con.submit': 'Sign in', 'c.con.oublie': 'Forgot your password?', 'c.con.oubliTitre': 'Reset your password',
    'c.con.oubliTexte': 'For your security, a forgotten password is reset through the city hall: come to the front desk with an ID, or write to us from the contact page. A staff member will check your identity and unlock your access.',
    'c.con.oubliDemo': 'In this demo, a staff member can unlock a locked account from the “Accounts” page.', 'c.con.oubliLien': 'Contact the city hall',
    'c.con.pasDeCompte': 'No account yet?', 'c.con.creer': 'Create an account', 'c.con.demoTitre': 'Demo accounts',
    'c.con.demoAide': 'To try the three profiles: the button fills in the form, you just have to submit it.', 'c.con.utiliser': 'Use', 'c.con.utiliserAria': 'Use the {role} account',
    'c.con.rempli': 'Form filled with the {role} account. Submit to sign in.', 'c.con.question': 'What is {a} + {b}?',
    'c.con.verifFausse': 'That is not the right answer. Here is a new question.', 'c.con.debloque': 'You can try to sign in again.',
    'c.con.verifDemandee': 'For security, answer the small question below to confirm you are a person.', 'c.con.restantes': '{n} attempt(s) left before a temporary lock.',
    'c.con.verifAjoutee': 'A small check is now required.',
    /* espace */
    'c.esp.sous': 'Here is where your requests stand and what is coming up.', 'c.esp.bonjour': 'Hello {prenom}', 'c.esp.raccourcis': 'Quick links',
    'c.esp.signaler': 'Report a problem', 'c.esp.demarche': 'New request', 'c.esp.rdv': 'Book an appointment', 'c.esp.compte': 'My account',
    'c.esp.encours': 'My requests in progress', 'c.esp.encoursD': 'Each request with its current status and its latest step.',
    'c.esp.rdvTitre': 'My upcoming appointments', 'c.esp.notifs': 'Recent notifications', 'c.esp.toutLu': 'Mark all as read',
    'c.esp.hist': 'History of my requests', 'c.esp.histD': 'Every request since you signed up, so you can find what you already sent.',
    'c.esp.fStatut': 'Status', 'c.esp.fRech': 'Search', 'c.esp.fRechPh': 'Subject, number, service', 'c.esp.fOrdre': 'Sort by date', 'c.esp.recentes': 'Most recent first', 'c.esp.anciennes': 'Oldest first',
    'c.esp.fAide': 'The table updates as you type.', 'c.esp.histCap': 'History of all your requests',
    'c.esp.cRef': 'Reference', 'c.esp.cObjet': 'Subject', 'c.esp.cType': 'Type', 'c.esp.cService': 'Service', 'c.esp.cDate': 'Sent on', 'c.esp.cStatut': 'Status',
    'c.esp.kEnCours': 'Requests in progress', 'c.esp.kRdv': 'Upcoming appointments', 'c.esp.kNotifs': 'Unread notifications',
    'c.esp.envoyee': 'sent {date}', 'c.esp.derniere': 'Latest step:', 'c.esp.etape': 'Step {i} of {n}', 'c.esp.suivre': 'Follow this request',
    'c.esp.aucuneEnCours': 'No request in progress right now.', 'c.esp.faireDemande': 'Make a request', 'c.esp.rdvDefaut': 'Appointment',
    'c.esp.voirRdv': 'Manage my appointments', 'c.esp.aucunRdv': 'No appointment scheduled.', 'c.esp.nouveau': 'New',
    'c.esp.resultats': '{n} request(s) shown out of {total}.', 'c.esp.aucuneHist': 'No request matches this filter.', 'c.esp.tousStatuts': 'All statuses',
    'c.esp.toutLuOk': 'All your notifications are marked as read.',
    'c.t.contact': 'Question', 'c.t.signalement': 'Report', 'c.t.demarche': 'Procedure',
    'c.acc.titre': 'Welcome {prenom}: three steps to get started', 'c.acc.plusTard': 'Later', 'c.acc.progressionLabel': 'Getting started progress', 'c.acc.progression': '{n} of 3 step(s) done',
    'c.acc.terminee': 'Done', 'c.acc.e1': 'Complete your profile', 'c.acc.e1d': 'Your district and phone number let us warn you in the right place.', 'c.acc.enregistrer': 'Save my profile',
    'c.acc.e2': 'Discover a service', 'c.acc.e2d': 'Health, housing, civil registry: find the service that fits your need.', 'c.acc.e2b': 'Browse services',
    'c.acc.e3': 'Start a request', 'c.acc.e3d': 'A question, a report or a procedure: we guide you step by step.', 'c.acc.e3b': 'Start a request',
    'c.acc.reviens': 'You can leave this page and come back: your steps are saved.', 'c.acc.telRequis': 'Enter a phone number to finish your profile.',
    'c.acc.profilOk': 'Profile saved.', 'c.acc.plusTardOk': 'Okay. The guide will come back while your profile is incomplete.', 'c.acc.accueilFini': 'Well done, you have seen the essentials. Enjoy Terra Nova!',
    'c.tip.signaler': 'A problem on your street? The “Report a problem” button below guides you: say what, then where.',
    'c.tip.filtre': 'Lots of requests? Filter by status to see only those still waiting for an answer.',
    'c.tip.notifs': 'The bell at the top of the page gathers answers to your requests. Here you see the latest ones.',
    'c.tip.rdv': 'For a file that needs a discussion, book a slot with a staff member: you will get a reminder.',
    /* compte */
    'c.cpt.titre': 'My account', 'c.cpt.sous': 'Your profile, your password and the security of your access.',
    'c.cpt.sousRole': 'Signed in as {role} ({email}). Manage your profile and the security of your access.', 'c.cpt.nav': 'Page sections',
    'c.cpt.sProfil': 'Profile', 'c.cpt.sMdp': 'Password', 'c.cpt.sSecu': 'Security', 'c.cpt.sSuppr': 'Delete my account', 'c.cpt.profil': 'My profile',
    'c.cpt.emailFixe': 'Your sign-in identifier cannot be changed here.', 'c.cpt.langue': 'Preferred language', 'c.cpt.langueAide': 'The interface will appear in this language on every visit.',
    'c.cpt.vulnerable': 'I am a vulnerable person: send me health alerts first',
    'c.cpt.vulnerableAide': 'This information stays confidential. It is only used to warn you sooner during a heatwave, pollution or another health risk.',
    'c.cpt.enregistrer': 'Save my profile', 'c.cpt.profilOk': 'Your profile is saved.',
    'c.cpt.mdp': 'Change my password', 'c.cpt.ancien': 'Current password', 'c.cpt.nouveau': 'New password', 'c.cpt.confirm': 'Confirm the new password', 'c.cpt.changerMdp': 'Change my password',
    'c.cpt.ancienVide': 'Enter your current password.', 'c.cpt.ancienFaux': 'The current password is incorrect. {n} attempt(s) left.', 'c.cpt.nouveauVide': 'Choose a new password.',
    'c.cpt.identique': 'The new password must be different from the current one.', 'c.cpt.confirmDiff': 'The confirmation does not match the new password.', 'c.cpt.mdpOk': 'Your password has been changed.',
    'c.cpt.secu': 'Security of my access', 'c.cpt.depuis': 'Session in progress since', 'c.cpt.precedente': 'Previous sign-in', 'c.cpt.aucune': 'No previous sign-in',
    'c.cpt.echecs': 'Failures since your previous sign-in', 'c.cpt.protegeTitre': 'How your account is protected', 'c.cpt.activite': 'Recent activity on your account', 'c.cpt.aucuneActivite': 'No activity recorded.',
    'c.cpt.p1': 'After {n} incorrect passwords, a small verification question is asked.',
    'c.cpt.p2': 'After {n} failures, sign-in is paused for 5 minutes (longer if it repeats): your account is not deleted.',
    'c.cpt.p3': 'At your next successful sign-in, you are told how many attempts failed.',
    'c.cpt.p4': 'Every sign-in, failure and sensitive action is recorded in a log checked by the city hall.',
    'c.cpt.suppr': 'Delete my account',
    'c.esp.infos': 'My information', 'c.esp.recap': 'Summary of my requests', 'c.cpt.infos': 'The information the city keeps about me', 'c.cpt.infosD': 'View, print or download everything the city keeps about you, explained simply.', 'c.cpt.infosLien': 'See my information',
    'c.sup.interditTitre': 'This action is not available for your profile.',
    'c.sup.interdit': 'A staff or administrator account cannot be deleted from this page: this makes sure the city hall always keeps authorised people. Ask another administrator to handle your request.',
    'c.sup.intro': 'You can delete your account at any time. Here is what will happen.', 'c.sup.supprime': 'What will be deleted',
    'c.sup.s1': 'Your profile and contact details', 'c.sup.s2': 'Your appointments', 'c.sup.s3': 'Your notifications', 'c.sup.s4': 'Your access: you will no longer be able to sign in',
    'c.sup.conserve': 'What will be kept, without your name', 'c.sup.c1': 'Your requests and reports, made anonymous, so the city can finish handling them', 'c.sup.c2': 'A trace of the deletion in the security log',
    'c.sup.verif': 'To check it is really you, confirm with your password and type the requested word.', 'c.sup.mot': 'Type the word SUPPRIMER to confirm', 'c.sup.motAide': 'In capital letters, exactly: SUPPRIMER',
    'c.sup.bouton': 'Delete my account', 'c.sup.motFaux': 'Type exactly the word SUPPRIMER, in capital letters.',
    'c.sup.dlgTitre': 'Permanently delete your account?', 'c.sup.dlgOk': 'Yes, delete my account',
    'c.sup.dlgTexte': 'This cannot be undone. Your access, appointments and notifications will be deleted; your requests will be kept without your name.',
    'c.sup.adieu': 'Your account has been deleted', 'c.sup.adieuTexte': 'Your personal data has been erased and you are signed out. Thank you for using Terra Nova; you can create a new account at any time.', 'c.sup.accueil': 'Back to the home page',
    /* admin */
    'c.adm.titre': 'Account management', 'c.adm.sous': 'Follow the platform’s accounts, protect them and keep a trace of every sensitive action.',
    'c.adm.comptes': 'User accounts', 'c.adm.rechPh': 'Name or e-mail address', 'c.adm.fRole': 'Role', 'c.adm.fEtat': 'Status',
    'c.adm.cap': 'List of user accounts with their role, status and actions', 'c.adm.tousRoles': 'All roles', 'c.adm.tousEtats': 'All statuses',
    'c.adm.actif': 'Active', 'c.adm.desactive': 'Deactivated', 'c.adm.verrouille': 'Locked',
    'c.adm.noteAdmin': 'You can manage all accounts, except your own.', 'c.adm.noteAgent': 'You can manage citizens’ accounts.',
    'c.adm.encartAdminT': 'You are an administrator.', 'c.adm.encartAdmin': 'You can change an account’s role. You can neither change your own role nor deactivate your own account: the platform always keeps at least one active administrator.',
    'c.adm.encartAgentT': 'You are signed in as municipal staff.', 'c.adm.encartAgent': 'You can deactivate, reactivate and unlock citizens’ accounts, and read the log. Only administrators can change an account’s role or act on staff accounts: this is deliberate, so a mistake or a hijacked access cannot extend rights.',
    'c.adm.droits': 'Who can do what', 'c.adm.droitsD': 'Each profile only has the tools its mission needs. Reserved pages and actions are also blocked in the interface if someone tries to reach them directly.',
    'c.adm.droitsCap': 'Rights of the three profiles: citizen, municipal staff, administrator', 'c.adm.dAction': 'Action',
    'c.d.1': 'Make a request, report a problem, book an appointment', 'c.d.2': 'See one’s own personal space and request history', 'c.d.3': 'Delete one’s own account from “My account”',
    'c.d.4': 'See and handle all residents’ requests', 'c.d.5': 'Publish a notice or an alert', 'c.d.6': 'See the account list and the security log',
    'c.d.7': 'Deactivate, reactivate or unlock a citizen account', 'c.d.8': 'Act on staff and administrator accounts', 'c.d.9': 'Change an account’s role',
    'c.adm.journal': 'Security log', 'c.adm.journalD': 'Sign-ins, failures, locks, denied access and administration actions, newest first.', 'c.adm.jType': 'Event type', 'c.adm.jCap': 'Security event log',
    'c.adm.jDate': 'Date', 'c.adm.jEvt': 'Event', 'c.adm.jCompte': 'Account', 'c.adm.jDetail': 'Detail', 'c.adm.tousTypes': 'All events',
    'c.adm.jResultats': '{n} event(s) shown out of {total}.', 'c.adm.jVide': 'No event for this filter.', 'c.adm.jPlus': 'Show 25 more events',
    'c.adm.kTotal': 'Accounts in total', 'c.adm.kCit': 'Citizens', 'c.adm.kEquipe': 'Municipal team', 'c.adm.kDesact': 'Deactivated accounts', 'c.adm.kVerrou': 'Locked accounts',
    'c.adm.cNom': 'Name', 'c.adm.cEmail': 'E-mail', 'c.adm.cRole': 'Role', 'c.adm.cChg': 'Change role', 'c.adm.cQuartier': 'District', 'c.adm.cEtat': 'Status', 'c.adm.cConn': 'Last sign-in', 'c.adm.cAct': 'Actions',
    'c.adm.resultats': '{n} account(s) shown.', 'c.adm.aucun': 'No account matches this search.', 'c.adm.vous': 'you',
    'c.adm.detail': 'Details', 'c.adm.detailDe': 'See details for {nom}', 'c.adm.desactiver': 'Deactivate', 'c.adm.reactiver': 'Reactivate', 'c.adm.debloquer': 'Unlock',
    'c.adm.desactiverDe': 'Deactivate {nom}’s account', 'c.adm.reactiverDe': 'Reactivate {nom}’s account', 'c.adm.debloquerDe': 'Unlock {nom}’s account',
    'c.adm.roleDe': 'Role of {nom}', 'c.adm.pasSoi': 'You cannot change your own role.',
    'c.adm.detailTitre': 'Account details', 'c.adm.cree': 'Account created on', 'c.adm.vuln': 'Vulnerable person (priority alerts)', 'c.adm.nbDem': 'Requests submitted',
    'c.adm.activite': 'Recent activity', 'c.adm.echecsCours': 'Current sign-in failures', 'c.adm.blocages': 'Past locks',
    'c.adm.refus': 'This action is reserved for another profile.', 'c.adm.par': 'by {email}',
    'c.adm.cfDesT': 'Deactivate this account?', 'c.adm.cfReaT': 'Reactivate this account?',
    'c.adm.cfDes': '{nom} will no longer be able to sign in until the account is reactivated. Their requests are kept.', 'c.adm.cfRea': '{nom} will be able to sign in again.',
    'c.adm.desOk': '{nom}’s account deactivated.', 'c.adm.reaOk': '{nom}’s account reactivated.', 'c.adm.debOk': '{nom}’s account unlocked.',
    'c.adm.cfRoleT': 'Change this account’s role?', 'c.adm.cfRole': '{nom} will go from “{de}” to “{vers}”. Their tools and access change on the next page they open.',
    'c.adm.cfRoleOk': 'Change the role', 'c.adm.roleOk': '{nom}’s role: {role}.'
  } });
})();
