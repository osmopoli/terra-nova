/* Terra Nova — connexion renforcée (vague 9)
   D02 : se connecter sans mot de passe avec une clé d'accès (Windows Hello, empreinte, visage, code du téléphone)
   F53 : vérification en deux étapes par code à usage unique (application d'authentification) + codes de secours
   F54 : appareils connectés au compte, alerte et retrait à distance
   Pages : connexion.html (NT.forte.connexion), compte.html (NT.forte.compte). */
(function () {
  'use strict';
  const NT = window.NT;
  const T = (cle, fr, vars) => NT.i18n.t(cle, vars, fr);
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = s => document.querySelector(s);
  const api = (m, url, corps) => NT.api(m, url, corps);
  const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const deB64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
  const clesPossibles = () => !!(window.PublicKeyCredential && navigator.credentials && window.isSecureContext);
  const date = iso => iso ? new Date(iso).toLocaleString(NT.i18n.langue === 'ar' ? 'ar' : NT.i18n.langue, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  NT.i18n.ajouter({
    en: {
      'f.cle.titre': 'Sign in without a password', 'f.cle.aide': 'Use the passkey saved on this device: fingerprint, face, Windows Hello or your phone’s PIN.',
      'f.cle.bouton': 'Sign in with a passkey', 'f.cle.ou': 'or with your password', 'f.cle.indispo': 'This browser cannot use passkeys. Sign in with your password.',
      'f.cle.annule': 'Passkey sign-in cancelled. You can try again or use your password.',
      'f.code.titre': 'Second step: verification code', 'f.code.aide': 'Open your authenticator app and type the 6-digit code shown for Terra Nova. It changes every 30 seconds.',
      'f.code.label': 'Verification code', 'f.code.valider': 'Verify and sign in', 'f.code.secours': 'Lost your phone? Type one of your backup codes (format ABCDE-FGHIJ) instead.',
      'f.code.retour': 'Start over', 'f.code.restantes': '{n} attempt(s) left.', 'f.code.secoursRestants': 'Backup code used. {n} code(s) left: keep them safe.',
      'f.cpt.titre': 'Sign-in security', 'f.cpt.intro': 'Strengthen access to your space. Each option can be removed at any time.',
      'f.cpt.cles': 'Passkeys', 'f.cpt.clesAide': 'Sign in without a password, with your device’s lock (fingerprint, face, PIN). Nothing to remember, impossible to phish.',
      'f.cpt.ajouterCle': 'Add a passkey on this device', 'f.cpt.aucuneCle': 'No passkey yet.', 'f.cpt.retirer': 'Remove', 'f.cpt.creeLe': 'added {d}', 'f.cpt.utiliseeLe': 'last used {d}', 'f.cpt.jamais': 'never used',
      'f.cpt.nomCle': 'Name of this passkey', 'f.cpt.nomCleAide': 'To recognise it later, e.g. “Work laptop”.', 'f.cpt.cleOk': 'Passkey added. Next time, choose “Sign in with a passkey”.',
      'f.cpt.deux': 'Two-step verification', 'f.cpt.deuxAide': 'After your password, a code from an app on your phone (Google Authenticator, Microsoft Authenticator, Aegis…) is requested. Someone who knows your password still cannot get in.',
      'f.cpt.deuxActive': 'Enabled since {d}. {n} backup code(s) left.', 'f.cpt.deuxInactive': 'Not enabled.', 'f.cpt.activer': 'Enable two-step verification', 'f.cpt.desactiver': 'Disable',
      'f.cpt.etape1': 'Scan this QR code with your authenticator app.', 'f.cpt.manuel': 'Can’t scan? Enter this key in the app:', 'f.cpt.etape2': 'Type the 6-digit code the app shows to confirm.',
      'f.cpt.confirmer': 'Confirm', 'f.cpt.secoursTitre': 'Your backup codes', 'f.cpt.secoursAide': 'Each code works once, if you lose your phone. Write them down or print them now: they will not be shown again.',
      'f.cpt.imprimer': 'Print the codes', 'f.cpt.fini': 'I have saved them', 'f.cpt.codeDesactiver': 'Type a code from your app (or a backup code) to disable it.',
      'f.cpt.appareils': 'Signed-in devices', 'f.cpt.appareilsAide': 'We notify you when a new device signs in to your account. Remove a device you don’t recognise: it is signed out immediately.',
      'f.cpt.actuel': 'This device', 'f.cpt.vuLe': 'last activity {d}', 'f.cpt.premiereFois': 'first sign-in {d}', 'f.cpt.appareilRetire': 'Device removed and signed out.',
      'f.cpt.mdpTitre': 'Confirm it’s you', 'f.cpt.mdpAide': 'For this security change, type your current password.', 'f.cpt.mdpFaux': 'Incorrect password.', 'f.cpt.continuer': 'Continue', 'f.cpt.annuler': 'Cancel'
    }
  });
  ['es', 'ar'].forEach(l => NT.i18n.ajouter({ [l]: {} }));

  /* Demande du mot de passe avant un changement de sécurité (même fenêtre de 10 min que F33) */
  function confirmerMotDePasse() {
    return new Promise(resoudre => {
      const d = document.createElement('sl-dialog');
      d.label = T('f.cpt.mdpTitre', 'Confirmez que c’est bien vous');
      d.innerHTML = `<form id="f-mdp-confirm" novalidate><p>${E(T('f.cpt.mdpAide', 'Pour ce changement de sécurité, saisissez votre mot de passe actuel.'))}</p>
        <div class="champ"><label for="f-mdp-c">${E(T('c.cpt.ancien', 'Mot de passe actuel'))}</label><input id="f-mdp-c" type="password" autocomplete="current-password" required></div>
        <p class="erreur-champ" id="f-mdp-err" role="alert" hidden></p>
        <div class="ligne"><button class="btn btn-primaire" type="submit">${E(T('f.cpt.continuer', 'Continuer'))}</button><button class="btn" type="button" data-annuler>${E(T('f.cpt.annuler', 'Annuler'))}</button></div></form>`;
      document.body.append(d);
      let ok = false;
      d.addEventListener('sl-after-hide', e => { if (e.target === d) { d.remove(); resoudre(ok); } });
      d.querySelector('[data-annuler]').addEventListener('click', () => d.hide());
      d.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        if (NT.auth.verifierMotDePasse(null, d.querySelector('#f-mdp-c').value)) { ok = true; d.hide(); return; }
        const err = d.querySelector('#f-mdp-err'); err.hidden = false; err.textContent = T('f.cpt.mdpFaux', 'Mot de passe incorrect.');
        d.querySelector('#f-mdp-c').select();
      });
      d.addEventListener('sl-after-show', () => d.querySelector('#f-mdp-c').focus(), { once: true });
      customElements.whenDefined('sl-dialog').then(() => d.show());
    });
  }
  // appel protégé : si le serveur demande une confirmation, on la demande puis on rejoue
  async function protege(m, url, corps) {
    let r = api(m, url, corps);
    if (r.statut === 403 && r.donnees && r.donnees.verification) {
      if (!(await confirmerMotDePasse())) return null;
      r = api(m, url, corps);
    }
    return r;
  }

  const F = NT.forte = {};

  /* =====================================================================
     connexion.html — clé d'accès (D02) et deuxième étape (F53)
     ===================================================================== */
  F.connexion = function (destination) {
    const form = $('#form-connexion');
    if (!form || form.hidden) return;
    const bloc = document.createElement('div');
    bloc.className = 'bloc-cle';
    bloc.innerHTML = `<button class="btn btn-cle" type="button" id="btn-cle"><i class="ph-duotone ph-fingerprint" aria-hidden="true"></i><span>${E(T('f.cle.bouton', 'Se connecter avec une clé d’accès'))}</span></button>
      <p class="aide" id="aide-cle">${E(T('f.cle.aide', 'Utilisez la clé enregistrée sur cet appareil : empreinte, visage, Windows Hello ou code de votre téléphone. Aucun mot de passe à retenir.'))}</p>
      <p class="erreur-cle" id="err-cle" role="alert" hidden></p>
      <p class="separateur-ou"><span>${E(T('f.cle.ou', 'ou avec votre mot de passe'))}</span></p>`;
    form.before(bloc);
    const bouton = bloc.querySelector('#btn-cle'), err = bloc.querySelector('#err-cle');
    bouton.setAttribute('aria-describedby', 'aide-cle');
    if (!clesPossibles()) { bouton.disabled = true; bloc.querySelector('#aide-cle').textContent = T('f.cle.indispo', 'Ce navigateur ne permet pas d’utiliser les clés d’accès. Connectez-vous avec votre mot de passe.'); }
    bouton.addEventListener('click', async () => {
      err.hidden = true; bouton.disabled = true; bouton.setAttribute('aria-busy', 'true');
      try {
        const o = api('POST', '/api/auth/cle/options').donnees;
        const cred = await navigator.credentials.get({ publicKey: { challenge: deB64u(o.challenge), rpId: o.rpId, userVerification: o.userVerification, timeout: o.timeout } });
        const r = cred.response;
        const rep = api('POST', '/api/auth/cle', { id: cred.id, clientDataJSON: b64u(r.clientDataJSON), authenticatorData: b64u(r.authenticatorData), signature: b64u(r.signature) }).donnees || {};
        if (rep.ok) { NT.store.ecrire('depuis', new Date().toISOString()); location.href = destination(rep.utilisateur); return; }
        err.textContent = rep.erreur || T('f.cle.annule', 'Connexion par clé annulée.'); err.hidden = false;
      } catch (e) {
        err.textContent = T('f.cle.annule', 'Connexion par clé d’accès annulée. Vous pouvez réessayer ou utiliser votre mot de passe.'); err.hidden = false;
      } finally { bouton.disabled = false; bouton.removeAttribute('aria-busy'); }
    });
  };

  // Mot de passe correct, code demandé : on remplace le formulaire par l'étape « code »
  F.demanderCode = function (rep, destination, apresSucces) {
    const form = $('#form-connexion'), blocCle = $('.bloc-cle');
    form.hidden = true; if (blocCle) blocCle.hidden = true;
    let etape = rep.etape;
    const zone = document.createElement('form');
    zone.id = 'form-code'; zone.noValidate = true; zone.className = 'etape-code';
    zone.innerHTML = `<h3 tabindex="-1"><i class="ph-duotone ph-shield-check" aria-hidden="true"></i> ${E(T('f.code.titre', 'Deuxième étape : code de vérification'))}</h3>
      <p>${E(T('f.code.aide', 'Ouvrez votre application d’authentification et saisissez le code à 6 chiffres affiché pour Terra Nova. Il change toutes les 30 secondes.'))}</p>
      <div class="champ"><label for="code-2">${E(T('f.code.label', 'Code de vérification'))}</label>
        <input id="code-2" class="saisie-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="11" required aria-describedby="aide-code-2 err-code-2">
        <p class="aide" id="aide-code-2">${E(T('f.code.secours', 'Téléphone perdu ? Saisissez plutôt l’un de vos codes de secours (format ABCDE-FGHIJ).'))}</p>
        <p class="erreur-champ" id="err-code-2" role="alert" hidden></p></div>
      <div class="ligne entre"><button class="btn btn-primaire" type="submit">${E(T('f.code.valider', 'Vérifier et me connecter'))}</button>
        <button class="lien-bouton" type="button" data-recommencer>${E(T('f.code.retour', 'Recommencer'))}</button></div>`;
    form.after(zone);
    const champ = zone.querySelector('#code-2'), err = zone.querySelector('#err-code-2');
    zone.querySelector('h3').focus();
    setTimeout(() => champ.focus(), 50);
    const recommencer = () => { zone.remove(); form.hidden = false; if (blocCle) blocCle.hidden = false; $('#motdepasse').value = ''; $('#motdepasse').focus(); };
    zone.querySelector('[data-recommencer]').addEventListener('click', recommencer);
    champ.addEventListener('input', () => { if (/^\d{6}$/.test(champ.value.trim())) zone.requestSubmit(); });
    zone.addEventListener('submit', e => {
      e.preventDefault();
      const code = champ.value.trim();
      if (!code) { err.hidden = false; err.textContent = T('f.code.label', 'Code de vérification') + ' ?'; champ.focus(); return; }
      const r = api('POST', '/api/auth/code', { etape, code }).donnees || {};
      if (r.ok) {
        NT.store.ecrire('depuis', new Date().toISOString());
        if (r.secoursRestants != null) sessionStorage.setItem('nt:secours', String(r.secoursRestants));
        apresSucces(r);
        return;
      }
      err.hidden = false;
      err.textContent = r.erreur + (r.restantes ? ' ' + T('f.code.restantes', 'Il vous reste {n} essai(s).', { n: r.restantes }) : '');
      champ.setAttribute('aria-invalid', 'true'); champ.select();
      if (r.expire) { zone.querySelector('[type=submit]').disabled = true; }
    });
  };

  /* =====================================================================
     compte.html — clés d'accès, deux étapes, appareils
     ===================================================================== */
  F.compte = function () {
    const section = $('#securite-connexion');
    if (!section) return;
    const restants = sessionStorage.getItem('nt:secours');
    if (restants != null) { sessionStorage.removeItem('nt:secours'); NT.ui.toast(T('f.code.secoursRestants', 'Code de secours utilisé. Il vous en reste {n} : gardez-les en lieu sûr.', { n: restants }), 'warning', 9000); }

    function rendre() {
      const s = (api('GET', '/api/securite/etat').donnees) || { cles: [], appareils: [], deuxEtapes: {} };
      section.querySelector('#bloc-cles').innerHTML = `
        <div class="secu-tete"><i class="ph-duotone ph-fingerprint" aria-hidden="true"></i><div><h3>${E(T('f.cpt.cles', 'Clés d’accès (sans mot de passe)'))}</h3>
          <p class="doux">${E(T('f.cpt.clesAide', 'Connectez-vous sans mot de passe, avec le verrouillage de votre appareil (empreinte, visage, code). Rien à retenir, impossible à hameçonner.'))}</p></div></div>
        ${s.cles.length ? `<ul class="secu-liste">${s.cles.map(c => `<li><span><strong>${E(c.nom)}</strong><span class="doux">${E(T('f.cpt.creeLe', 'ajoutée le {d}', { d: date(c.cree) }))} · ${E(c.utilisee ? T('f.cpt.utiliseeLe', 'dernière utilisation le {d}', { d: date(c.utilisee) }) : T('f.cpt.jamais', 'jamais utilisée'))}</span></span>
          <button class="btn petit" type="button" data-retirer-cle="${E(c.id)}" aria-label="${E(T('f.cpt.retirer', 'Retirer') + ' « ' + c.nom + ' »')}">${E(T('f.cpt.retirer', 'Retirer'))}</button></li>`).join('')}</ul>`
          : `<p class="secu-vide">${E(T('f.cpt.aucuneCle', 'Aucune clé d’accès pour le moment.'))}</p>`}
        ${clesPossibles() ? `<button class="btn" type="button" id="btn-ajouter-cle"><i class="ph ph-plus" aria-hidden="true"></i>${E(T('f.cpt.ajouterCle', 'Ajouter une clé d’accès sur cet appareil'))}</button>`
          : `<p class="doux">${E(T('f.cle.indispo', 'Ce navigateur ne permet pas d’utiliser les clés d’accès.'))}</p>`}`;

      const d = s.deuxEtapes;
      section.querySelector('#bloc-deux').innerHTML = `
        <div class="secu-tete"><i class="ph-duotone ph-device-mobile-camera" aria-hidden="true"></i><div><h3>${E(T('f.cpt.deux', 'Vérification en deux étapes'))}</h3>
          <p class="doux">${E(T('f.cpt.deuxAide', 'Après votre mot de passe, un code donné par une application de votre téléphone (Google Authenticator, Microsoft Authenticator, Aegis…) est demandé. Quelqu’un qui connaît votre mot de passe ne peut toujours pas entrer.'))}</p></div></div>
        <p class="secu-statut ${d.active ? 'actif' : ''}"><i class="ph-duotone ${d.active ? 'ph-check-circle' : 'ph-circle-dashed'}" aria-hidden="true"></i>
          ${E(d.active ? T('f.cpt.deuxActive', 'Activée depuis le {d}. Codes de secours restants : {n}.', { d: date(d.depuis), n: d.codesSecours }) : T('f.cpt.deuxInactive', 'Non activée.'))}</p>
        <div id="deux-action">${d.active
          ? `<button class="btn" type="button" id="btn-deux-off">${E(T('f.cpt.desactiver', 'Désactiver'))}</button>`
          : `<button class="btn btn-primaire" type="button" id="btn-deux-on">${E(T('f.cpt.activer', 'Activer la vérification en deux étapes'))}</button>`}</div>`;

      section.querySelector('#appareils').innerHTML = `
        <div class="secu-tete"><i class="ph-duotone ph-devices" aria-hidden="true"></i><div><h3>${E(T('f.cpt.appareils', 'Appareils connectés'))}</h3>
          <p class="doux">${E(T('f.cpt.appareilsAide', 'Nous vous prévenons dès qu’un nouvel appareil se connecte à votre compte. Retirez un appareil que vous ne reconnaissez pas : il est déconnecté immédiatement.'))}</p></div></div>
        <ul class="secu-liste">${s.appareils.map(a => `<li><span><strong>${E(a.libelle)}</strong>${a.actuel ? ` <span class="badge-actuel">${E(T('f.cpt.actuel', 'Cet appareil'))}</span>` : ''}
          <span class="doux">${E(T('f.cpt.vuLe', 'dernière activité le {d}', { d: date(a.derniere) }))} · ${E(T('f.cpt.premiereFois', 'première connexion le {d}', { d: date(a.premiere) }))}</span></span>
          ${a.actuel ? '' : `<button class="btn petit" type="button" data-retirer-appareil="${E(a.appareil)}" aria-label="${E(T('f.cpt.retirer', 'Retirer') + ' ' + a.libelle)}">${E(T('f.cpt.retirer', 'Retirer'))}</button>`}</li>`).join('')}</ul>`;
    }

    section.addEventListener('click', async e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.id === 'btn-ajouter-cle') return ajouterCle(b);
      if (b.id === 'btn-deux-on') return activerDeux();
      if (b.id === 'btn-deux-off') return desactiverDeux();
      if (b.dataset.retirerCle) { const r = await protege('DELETE', '/api/securite/cles/' + encodeURIComponent(b.dataset.retirerCle)); if (r && r.statut === 200) rendre(); return; }
      if (b.dataset.retirerAppareil) {
        const r = api('DELETE', '/api/securite/appareils/' + encodeURIComponent(b.dataset.retirerAppareil));
        if (r.statut === 200) { NT.ui.toast(T('f.cpt.appareilRetire', 'Appareil retiré et déconnecté.'), 'success'); rendre(); section.querySelector('#appareils h3').focus?.(); }
      }
    });

    async function ajouterCle(bouton) {
      const r = await protege('POST', '/api/securite/cles/options'); if (!r || r.statut !== 200) return;
      const o = r.donnees;
      bouton.disabled = true;
      try {
        const cred = await navigator.credentials.create({ publicKey: Object.assign({}, o, {
          challenge: deB64u(o.challenge), user: Object.assign({}, o.user, { id: deB64u(o.user.id) }),
          excludeCredentials: o.excludeCredentials.map(c => ({ type: 'public-key', id: deB64u(c.id) }))
        }) });
        const rep = cred.response;
        const nom = '';   // le serveur nomme la clé d'après l'appareil (« Chrome sur Windows »)
        const res = api('POST', '/api/securite/cles', { id: cred.id, clientDataJSON: b64u(rep.clientDataJSON), authenticatorData: b64u(rep.getAuthenticatorData()), publicKey: b64u(rep.getPublicKey()), publicKeyAlgorithm: rep.getPublicKeyAlgorithm(), nom }).donnees || {};
        if (res.ok) NT.ui.toast(T('f.cpt.cleOk', 'Clé d’accès ajoutée. La prochaine fois, choisissez « Se connecter avec une clé d’accès ».'), 'success', 8000);
        else NT.ui.toast(res.erreur, 'danger', 8000);
      } catch (e) { NT.ui.toast(T('f.cle.annule', 'Opération annulée.'), 'warning'); }
      bouton.disabled = false;
      rendre();
    }

    async function activerDeux() {
      const r = await protege('POST', '/api/securite/deux-etapes/preparer'); if (!r || r.statut !== 200) return;
      const zone = section.querySelector('#deux-action');
      zone.innerHTML = `<ol class="etapes-deux">
          <li><p>${E(T('f.cpt.etape1', 'Scannez ce QR code avec votre application d’authentification.'))}</p>
            <div class="qr" id="qr-deux" role="img" aria-label="QR code"></div>
            <p class="doux">${E(T('f.cpt.manuel', 'Impossible de scanner ? Saisissez cette clé dans l’application :'))} <code class="cle-manuelle">${E(r.donnees.secret)}</code></p></li>
          <li><form id="form-deux" novalidate><label for="code-activer">${E(T('f.cpt.etape2', 'Saisissez le code à 6 chiffres affiché par l’application pour confirmer.'))}</label>
            <div class="ligne"><input id="code-activer" class="saisie-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required aria-describedby="err-activer">
            <button class="btn btn-primaire" type="submit">${E(T('f.cpt.confirmer', 'Confirmer'))}</button></div>
            <p class="erreur-champ" id="err-activer" role="alert" hidden></p></form></li></ol>`;
      chargerQr().then(() => {
        new window.QRCode(zone.querySelector('#qr-deux'), { text: r.donnees.lien, width: 176, height: 176, colorDark: '#000000', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
      }).catch(() => { zone.querySelector('#qr-deux').hidden = true; });
      zone.querySelector('#code-activer').focus();
      zone.querySelector('#form-deux').addEventListener('submit', e => {
        e.preventDefault();
        const rep = api('POST', '/api/securite/deux-etapes/activer', { code: zone.querySelector('#code-activer').value.trim() }).donnees || {};
        if (!rep.ok) { const err = zone.querySelector('#err-activer'); err.hidden = false; err.textContent = rep.erreur; zone.querySelector('#code-activer').select(); return; }
        montrerCodesSecours(rep.codesSecours);
      });
    }

    function montrerCodesSecours(codes) {
      const zone = section.querySelector('#deux-action');
      zone.innerHTML = `<div class="codes-secours" tabindex="-1"><h4>${E(T('f.cpt.secoursTitre', 'Vos codes de secours'))}</h4>
        <p>${E(T('f.cpt.secoursAide', 'Chaque code fonctionne une seule fois, si vous perdez votre téléphone. Notez-les ou imprimez-les maintenant : ils ne seront plus affichés.'))}</p>
        <ul>${codes.map(c => `<li><code>${E(c)}</code></li>`).join('')}</ul>
        <div class="ligne"><button class="btn" type="button" id="btn-imprimer-codes"><i class="ph ph-printer" aria-hidden="true"></i>${E(T('f.cpt.imprimer', 'Imprimer les codes'))}</button>
        <button class="btn btn-primaire" type="button" id="btn-codes-ok">${E(T('f.cpt.fini', 'Je les ai notés'))}</button></div></div>`;
      zone.querySelector('.codes-secours').focus();
      zone.querySelector('#btn-imprimer-codes').addEventListener('click', () => { document.body.classList.add('impression-codes'); window.print(); document.body.classList.remove('impression-codes'); });
      zone.querySelector('#btn-codes-ok').addEventListener('click', rendre);
    }

    async function desactiverDeux() {
      const zone = section.querySelector('#deux-action');
      zone.innerHTML = `<form id="form-deux-off" novalidate><label for="code-off">${E(T('f.cpt.codeDesactiver', 'Saisissez un code de votre application (ou un code de secours) pour désactiver.'))}</label>
        <div class="ligne"><input id="code-off" class="saisie-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="11" required aria-describedby="err-off">
        <button class="btn btn-danger" type="submit">${E(T('f.cpt.desactiver', 'Désactiver'))}</button><button class="btn" type="button" data-annuler>${E(T('f.cpt.annuler', 'Annuler'))}</button></div>
        <p class="erreur-champ" id="err-off" role="alert" hidden></p></form>`;
      zone.querySelector('[data-annuler]').addEventListener('click', rendre);
      zone.querySelector('#code-off').focus();
      zone.querySelector('form').addEventListener('submit', async e => {
        e.preventDefault();
        const r = await protege('POST', '/api/securite/deux-etapes/desactiver', { code: zone.querySelector('#code-off').value.trim() }); if (!r) return;
        if (r.donnees && r.donnees.ok) return rendre();
        const err = zone.querySelector('#err-off'); err.hidden = false; err.textContent = (r.donnees || {}).erreur || '';
      });
    }

    let qr = null;
    function chargerQr() {
      if (window.QRCode) return Promise.resolve();
      return qr || (qr = new Promise((ok, ko) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; s.onload = ok; s.onerror = ko; document.head.append(s); }));
    }

    rendre();
    if (location.hash === '#appareils' || location.hash === '#securite-connexion') setTimeout(() => document.querySelector(location.hash).scrollIntoView({ block: 'start' }), 400);   // après le rendu des autres sections
  };
})();
