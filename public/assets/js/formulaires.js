/* Terra Nova — vague 16 : formulaires protégés (F81) et envois sans doublon (F82), côté navigateur.
   Chargé sur les pages qui envoient un formulaire public (demande, inscription, idées, avis, soutien, données, suivi…).
   Invisible d'abord, sans rien compliquer :
   - chaque formulaire reçoit un jeton signé par le serveur (nonce propre, heure d'émission) et un champ piège invisible
     (hors écran, inerte, ignoré du clavier, des lecteurs d'écran et des gestionnaires de mots de passe) ;
   - des signaux de comportement (nombre de touches, clics, saisies, collages, remplissages automatiques) accompagnent l'envoi ;
   - une courte ligne visible : « Formulaire protégé contre les envois automatiques » ;
   - bouton désactivé + « Envoi en cours… » pendant l'envoi, réactivé en cas d'erreur ; clé d'idempotence par envoi :
     un double clic ou un renvoi rend le même numéro, sans doublon ;
   - si le serveur demande une vérification (envoi suspect) : petite question accessible (comme à la connexion, F37),
     puis l'envoi repart tout seul ; si une demande presque identique vient d'être envoyée : « Vous avez déjà envoyé
     cette demande (NT-xxxx) il y a 2 minutes », lien vers elle, et « Envoyer quand même ».
   Les requêtes de l'application passent par XMLHttpRequest (store.js) : les en-têtes sont ajoutés ici, sans toucher aux pages. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'fv.protege': 'Formulaire protégé contre les envois automatiques', 'fv.piege': 'Laissez ce champ vide', 'fv.envoi': 'Envoi en cours…',
      'fv.verifTitre': 'Petite vérification', 'fv.verifTexte': 'Pour confirmer que vous êtes une personne, répondez à cette question. Cela arrive rarement, par exemple quand un formulaire est envoyé très vite.',
      'fv.question': 'Combien font {a} + {b} ?', 'fv.verifAide': 'Répondez avec un nombre.', 'fv.valider': 'Valider et envoyer', 'fv.annuler': 'Annuler', 'fv.verifVide': 'Indiquez un nombre, par exemple 7.',
      'fv.doublonTitre': 'Demande déjà envoyée', 'fv.doublonTexte': 'Vous avez déjà envoyé cette demande ({id}) {quand}.', 'fv.minutes': 'il y a {n} minute(s)', 'fv.instant': 'il y a moins d’une minute',
      'fv.doublonAide': 'Rien n’a été envoyé une deuxième fois. Si votre nouveau message est vraiment différent, vous pouvez l’envoyer quand même.',
      'fv.voir': 'Voir la demande {id}', 'fv.quandMeme': 'Envoyer quand même', 'fv.garder': 'Ne pas envoyer', 'fv.relancer': 'Vérification réussie : refaites votre action pour l’envoyer.' },
    en: { 'fv.protege': 'Form protected against automated submissions', 'fv.piege': 'Leave this field empty', 'fv.envoi': 'Sending…',
      'fv.verifTitre': 'Quick check', 'fv.verifTexte': 'To confirm you are a person, please answer this question. This rarely happens, for example when a form is sent very quickly.',
      'fv.question': 'What is {a} + {b}?', 'fv.verifAide': 'Answer with a number.', 'fv.valider': 'Confirm and send', 'fv.annuler': 'Cancel', 'fv.verifVide': 'Enter a number, for example 7.',
      'fv.doublonTitre': 'Request already sent', 'fv.doublonTexte': 'You already sent this request ({id}) {quand}.', 'fv.minutes': '{n} minute(s) ago', 'fv.instant': 'less than a minute ago',
      'fv.doublonAide': 'Nothing was sent a second time. If your new message is really different, you can send it anyway.',
      'fv.voir': 'See request {id}', 'fv.quandMeme': 'Send anyway', 'fv.garder': 'Do not send', 'fv.relancer': 'Check passed: please repeat your action to send it.' },
    es: { 'fv.protege': 'Formulario protegido contra los envíos automáticos', 'fv.piege': 'Deje este campo vacío', 'fv.envoi': 'Enviando…',
      'fv.verifTitre': 'Pequeña comprobación', 'fv.verifTexte': 'Para confirmar que es una persona, responda a esta pregunta. Ocurre pocas veces, por ejemplo cuando un formulario se envía muy rápido.',
      'fv.question': '¿Cuánto es {a} + {b}?', 'fv.verifAide': 'Responda con un número.', 'fv.valider': 'Validar y enviar', 'fv.annuler': 'Cancelar', 'fv.verifVide': 'Indique un número, por ejemplo 7.',
      'fv.doublonTitre': 'Solicitud ya enviada', 'fv.doublonTexte': 'Ya envió esta solicitud ({id}) {quand}.', 'fv.minutes': 'hace {n} minuto(s)', 'fv.instant': 'hace menos de un minuto',
      'fv.doublonAide': 'No se ha enviado nada por segunda vez. Si su nuevo mensaje es realmente diferente, puede enviarlo de todos modos.',
      'fv.voir': 'Ver la solicitud {id}', 'fv.quandMeme': 'Enviar de todos modos', 'fv.garder': 'No enviar', 'fv.relancer': 'Comprobación superada: repita su acción para enviarla.' },
    ar: { 'fv.protege': 'نموذج محمي من الإرسال الآلي', 'fv.piege': 'اترك هذا الحقل فارغاً', 'fv.envoi': 'جارٍ الإرسال…',
      'fv.verifTitre': 'تحقق بسيط', 'fv.verifTexte': 'لتأكيد أنك شخص حقيقي، أجب عن هذا السؤال. يحدث هذا نادراً، مثلاً عند إرسال نموذج بسرعة كبيرة.',
      'fv.question': 'كم يساوي {a} + {b}؟', 'fv.verifAide': 'أجب برقم.', 'fv.valider': 'تأكيد وإرسال', 'fv.annuler': 'إلغاء', 'fv.verifVide': 'أدخل رقماً، مثلاً 7.',
      'fv.doublonTitre': 'الطلب مُرسل مسبقاً', 'fv.doublonTexte': 'لقد أرسلت هذا الطلب ({id}) {quand}.', 'fv.minutes': 'منذ {n} دقيقة', 'fv.instant': 'منذ أقل من دقيقة',
      'fv.doublonAide': 'لم يُرسل أي شيء مرة ثانية. إذا كانت رسالتك الجديدة مختلفة فعلاً، يمكنك إرسالها رغم ذلك.',
      'fv.voir': 'عرض الطلب {id}', 'fv.quandMeme': 'الإرسال رغم ذلك', 'fv.garder': 'عدم الإرسال', 'fv.relancer': 'نجح التحقق: أعد الإجراء لإرساله.' }
  });
  const t = (k, v) => NT.t(k, v);
  const echap = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const F = (NT.formulaires = { pris: false });

  // Formulaires publics protégés (mêmes règles que src/modules/formulaires.js)
  const PROTEGES = [/^\/api\/docs\/demandes$/, /^\/api\/contributions$/, /^\/api\/auth\/inscrire$/, /^\/api\/accueil\/inscrire$/, /^\/api\/idees$/,
    /^\/api\/consultations\/[^/]+\/avis$/, /^\/api\/avis-services$/, /^\/api\/demandes\/[^/]+\/soutenir$/, /^\/api\/demandes\/[^/]+\/messages$/];
  const chemin = url => { try { return new URL(url, location.href).pathname; } catch (e) { return ''; } };
  const protege = (m, url) => String(m).toUpperCase() === 'POST' && PROTEGES.some(r => r.test(chemin(url)));
  const staff = () => !!(NT.auth && NT.auth.aRole('agent', 'admin'));

  let session = '';
  try { session = sessionStorage.getItem('nt:envoi') || ''; if (!session) { session = Math.random().toString(36).slice(2, 10); sessionStorage.setItem('nt:envoi', session); } }
  catch (e) { session = Math.random().toString(36).slice(2, 10); }
  // Empreinte courte du contenu envoyé (cyrb53) : même contenu → même clé d'idempotence
  const empreinte = s => { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); };

  /* ---------- État par formulaire : jeton, signaux, piège, clé ---------- */
  const etats = new Map();   // nom → état
  const nomDe = form => (form && form.id ? form.id.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) : '') || 'page';
  function etat(nom) {
    if (!etats.has(nom)) etats.set(nom, { nom, jeton: '', recu: 0, s: { k: 0, p: 0, i: 0, f: 0, c: 0, a: 0, cl: 0 }, debut: 0, cle: null, preuve: '', confirmer: false, form: null });
    return etats.get(nom);
  }
  function jeton(e) {
    fetch('/api/formulaires/jeton?f=' + encodeURIComponent(e.nom), { cache: 'no-store', credentials: 'same-origin' })
      .then(r => (r.ok ? r.json() : null)).then(j => { if (j && j.jeton) { e.jeton = j.jeton; e.recu = Date.now(); } }).catch(() => {});
  }
  function compter(e, ev) {
    const k = { keydown: 'k', pointerdown: 'p', input: 'i', focusin: 'f', paste: 'c', click: 'cl' }[ev.type];
    if (!k) return;
    e.s[k]++;
    if (ev.type === 'input' && (ev.inputType === undefined || ev.inputType === 'insertReplacementText')) e.s.a++;   // remplissage automatique, gestionnaire de mots de passe
    if (!e.debut) e.debut = Date.now();
  }
  const EVENEMENTS = ['keydown', 'pointerdown', 'input', 'focusin', 'paste', 'click'];
  const page = etat('page');
  EVENEMENTS.forEach(type => document.addEventListener(type, ev => compter(page, ev), true));

  /* ---------- Décoration des formulaires publics ---------- */
  const aSaisie = f => !!f.querySelector('textarea, input[type=text], input[type=email], input[type=password], input[type=tel], input:not([type]), input[type=radio]');
  // formulaires qui n'envoient rien au public (questionnaire du guide, changement de code personnel, connexion F37)
  const EXCLUS = new Set(['form-guide', 'form-code', 'form-connexion']);
  const cible = f => f.tagName === 'FORM' && !EXCLUS.has(f.id) && !f.dataset.tnProtege && f.getAttribute('role') !== 'search' && !f.hasAttribute('data-tn-libre') && !f.closest('dialog') && aSaisie(f)
    && !!f.querySelector('button[type=submit], button:not([type]), input[type=submit]');
  function decorer(f) {
    if (staff() || !cible(f)) return;
    f.dataset.tnProtege = '1';
    const e = etat(nomDe(f));
    e.form = f;
    EVENEMENTS.forEach(type => f.addEventListener(type, ev => compter(e, ev), true));
    // champ piège : hors écran, inerte (ni focus, ni lecteur d'écran), ignoré du remplissage automatique
    const piege = document.createElement('div');
    piege.className = 'tn-piege';
    piege.setAttribute('aria-hidden', 'true');
    piege.setAttribute('inert', '');
    piege.style.cssText = 'position:absolute!important;inset-inline-start:-10000px;top:auto;width:1px;height:1px;overflow:hidden;';
    const idp = 'tn-piege-' + e.nom;
    piege.innerHTML = `<label for="${idp}">${echap(t('fv.piege'))}</label><input type="text" id="${idp}" name="site_web" value="" tabindex="-1" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other">`;
    f.append(piege);
    if (!f.querySelector('.tn-protege')) {
      const p = document.createElement('p');
      p.className = 'tn-protege';
      p.innerHTML = `<i class="ph-duotone ph-shield-check" aria-hidden="true"></i><span data-i18n="fv.protege">${echap(t('fv.protege'))}</span>`;
      f.append(p);
    }
    jeton(e);
  }
  function parcourir(racine) {
    if (!racine || !racine.querySelectorAll) return;
    if (racine.tagName === 'FORM') decorer(racine);
    racine.querySelectorAll('form').forEach(decorer);
  }
  function demarrer() {
    if (staff()) return;
    jeton(page);
    parcourir(document);
    new MutationObserver(l => l.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && parcourir(n)))).observe(document.body, { childList: true, subtree: true });
    setInterval(() => etats.forEach(e => { if (e.recu && Date.now() - e.recu > 3 * 3600e3) jeton(e); }), 10 * 60e3);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();

  /* ---------- Envoi : état « Envoi en cours… », un seul envoi à la fois ---------- */
  let actif = null;     // { e, form, t } : formulaire en cours d'envoi
  let dernierClic = null;
  document.addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('button, a, [role=button]'); if (b) dernierClic = { el: b, t: Date.now() }; }, true);
  document.addEventListener('submit', ev => {
    const f = ev.target;
    if (!f.dataset || !f.dataset.tnProtege) return;
    if (f.dataset.tnEnvoi === '1') { ev.preventDefault(); ev.stopImmediatePropagation(); return; }   // double clic : ignoré
    const e = etat(nomDe(f));
    actif = { e, form: f, t: Date.now(), requete: false, ok: false };
    const btn = f.querySelector('button[type=submit], button:not([type]), input[type=submit]');
    f.dataset.tnEnvoi = '1';
    let memo = null;
    if (btn && !btn.disabled) {
      memo = { html: btn.innerHTML, valeur: btn.value };
      btn.disabled = true; btn.setAttribute('aria-busy', 'true');
      if (btn.tagName === 'INPUT') btn.value = t('fv.envoi');
      else if (!btn.querySelector('[id]')) btn.innerHTML = `<i class="ph ph-spinner" aria-hidden="true"></i><span>${echap(t('fv.envoi'))}</span>`;
    }
    const courant = actif;
    // les requêtes de l'application sont synchrones : à ce moment, la réponse est connue
    setTimeout(() => {
      const fin = () => {
        delete f.dataset.tnEnvoi;
        if (btn && memo) { btn.disabled = false; btn.removeAttribute('aria-busy'); if (btn.tagName === 'INPUT') btn.value = memo.valeur; else if (!btn.querySelector('[id]') || btn.innerHTML.includes('ph-spinner')) btn.innerHTML = memo.html; }
      };
      if (courant.requete && courant.ok) setTimeout(fin, 1500); else fin();   // après un succès, les clics répétés tombent sur un bouton désactivé
    }, 0);
  }, true);

  /* ---------- En-têtes ajoutés aux envois protégés ---------- */
  const proto = XMLHttpRequest.prototype;
  const ouvrir = proto.open, envoyer = proto.send;
  proto.open = function (m, url) { this._tn = { m, url }; return ouvrir.apply(this, arguments); };
  proto.send = function (corps) {
    const info = this._tn;
    if (!info || !protege(info.m, info.url) || staff()) return envoyer.apply(this, arguments);
    const e = actif && Date.now() - actif.t < 4000 ? actif.e : page;
    if (actif && e === actif.e) actif.requete = true;
    let brut = typeof corps === 'string' ? corps : '';
    try { const o = JSON.parse(brut); if (o && typeof o === 'object' && !Array.isArray(o)) { delete o.cree; brut = JSON.stringify(o); } } catch (x) { /* corps non JSON */ }
    const h = empreinte(chemin(info.url) + '|' + brut);
    if (!(e.cle && e.cle.h === h && (!e.cle.ok || Date.now() - e.cle.ok < 2000))) e.cle = { h, cle: `${session}.${e.nom}.${h}.${Math.random().toString(36).slice(2, 6)}`, ok: 0 };
    const s = e.s;
    const piege = (e.form && e.form.querySelector('input[name=site_web]')) || document.querySelector('input[name=site_web]');
    try {
      if (e.jeton) this.setRequestHeader('X-TN-Jeton', e.jeton);
      this.setRequestHeader('X-TN-Signaux', `k=${s.k};p=${s.p};i=${s.i};f=${s.f};c=${s.c};a=${s.a};cl=${s.cl};d=${e.debut ? Date.now() - e.debut : 0}`);
      if (piege && piege.value) this.setRequestHeader('X-TN-Piege', piege.value.slice(0, 100));
      this.setRequestHeader('Idempotency-Key', e.cle.cle);
      if (e.preuve) this.setRequestHeader('X-TN-Verification', e.preuve);
      if (e.confirmer) this.setRequestHeader('X-TN-Confirmer', 'doublon');
    } catch (x) { /* requête déjà partie */ }
    e.preuve = ''; e.confirmer = false;
    const xhr = this;
    const apres = () => reponse(e, xhr.status, xhr.responseText);
    xhr.addEventListener('loadend', function fin() { xhr.removeEventListener('loadend', fin); if (!xhr._tnVu) { xhr._tnVu = true; apres(); } });
    const r = envoyer.apply(this, arguments);
    if (xhr.readyState === 4 && !xhr._tnVu) { xhr._tnVu = true; apres(); }   // requête synchrone
    return r;
  };

  function reponse(e, statut, texte) {
    let d = null;
    try { d = texte ? JSON.parse(texte) : null; } catch (x) { /* non JSON */ }
    F.pris = false;
    if (statut >= 200 && statut < 300) {
      if (actif && actif.e === e) actif.ok = true;
      if (e.cle) e.cle.ok = Date.now();
      e.s = { k: 0, p: 0, i: 0, f: 0, c: 0, a: 0, cl: 0 }; e.debut = 0;
      jeton(e);   // nouveau nonce pour un éventuel envoi suivant
      return;
    }
    if (statut === 428 && d && d.verification) { F.pris = true; setTimeout(() => verification(e, d), 0); return; }
    if (statut === 409 && d && d.doublon) { F.pris = true; setTimeout(() => doublon(e, d.doublon), 0); }
  }
  // Rejouer l'action de l'habitant après la vérification ou « Envoyer quand même »
  function relancer(e) {
    if (e.form && document.contains(e.form) && e.form.requestSubmit) { e.form.requestSubmit(); return; }
    if (dernierClic && document.contains(dernierClic.el)) { dernierClic.el.click(); return; }
    if (NT.ui) NT.ui.toast(t('fv.relancer'), 'primary');
  }

  /* ---------- Fenêtres : vérification humaine, demande déjà envoyée ---------- */
  let dlg = null, retour = null;
  function fenetre(html, init) {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'tn-dialogue';
      dlg.setAttribute('aria-labelledby', 'tn-dlg-titre');
      document.body.append(dlg);
      dlg.addEventListener('close', () => { if (retour && document.contains(retour)) retour.focus(); });
    }
    retour = document.activeElement;
    dlg.innerHTML = html;
    if (!dlg.open) dlg.showModal();
    init(dlg);
  }
  function verification(e, d) {
    const v = d.verification;
    fenetre(`<form method="dialog" class="tn-dlg-form" novalidate>
        <h2 id="tn-dlg-titre"><i class="ph-duotone ph-shield-check" aria-hidden="true"></i> ${echap(t('fv.verifTitre'))}</h2>
        <p>${echap(t('fv.verifTexte'))}</p>
        ${d.erreur && /bonne réponse/.test(d.erreur) ? `<p class="erreur" role="alert">${echap(d.erreur)}</p>` : ''}
        <div class="champ"><label for="tn-verif">${echap(t('fv.question', { a: v.a, b: v.b }))}</label>
          <input id="tn-verif" type="text" inputmode="numeric" autocomplete="off" maxlength="3" aria-describedby="tn-verif-aide tn-verif-err" required>
          <p class="aide" id="tn-verif-aide">${echap(t('fv.verifAide'))}</p><p class="erreur" id="tn-verif-err" hidden></p></div>
        <div class="ligne"><button class="btn btn-primaire" type="submit" value="ok"><i class="ph ph-check" aria-hidden="true"></i>${echap(t('fv.valider'))}</button>
          <button class="btn" type="button" data-tn-fermer>${echap(t('fv.annuler'))}</button></div></form>`, z => {
      const champ = z.querySelector('#tn-verif');
      champ.focus();
      z.querySelector('[data-tn-fermer]').addEventListener('click', () => z.close());
      z.querySelector('form').addEventListener('submit', ev => {
        ev.preventDefault();
        const rep = champ.value.trim();
        if (!/^\d{1,3}$/.test(rep)) {
          const err = z.querySelector('#tn-verif-err'); err.textContent = t('fv.verifVide'); err.hidden = false; champ.setAttribute('aria-invalid', 'true'); champ.focus(); return;
        }
        e.preuve = v.jeton + ':' + rep;
        z.close();
        relancer(e);
      });
    });
  }
  function doublon(e, x) {
    const quand = x.minutes < 1 ? t('fv.instant') : t('fv.minutes', { n: x.minutes });
    const u = NT.auth && NT.auth.utilisateur();
    fenetre(`<div class="tn-dlg-form">
        <h2 id="tn-dlg-titre"><i class="ph-duotone ph-copy" aria-hidden="true"></i> ${echap(t('fv.doublonTitre'))}</h2>
        <p role="alert"><strong>${echap(t('fv.doublonTexte', { id: x.id, quand }))}</strong></p>
        <p class="doux">${echap(t('fv.doublonAide'))}</p>
        <div class="ligne">${u ? `<a class="btn btn-primaire" href="suivi.html?id=${encodeURIComponent(x.id)}"><i class="ph ph-list-checks" aria-hidden="true"></i>${echap(t('fv.voir', { id: x.id }))}</a>` : ''}
          <button class="btn" type="button" data-tn-garder>${echap(t('fv.garder'))}</button>
          <button class="btn" type="button" data-tn-quandmeme><i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>${echap(t('fv.quandMeme'))}</button></div></div>`, z => {
      (z.querySelector('a.btn') || z.querySelector('[data-tn-garder]')).focus();
      z.querySelector('[data-tn-garder]').addEventListener('click', () => z.close());
      z.querySelector('[data-tn-quandmeme]').addEventListener('click', () => { e.confirmer = true; z.close(); relancer(e); });
    });
  }
  F.etat = () => Array.from(etats.values()).map(e => ({ nom: e.nom, jeton: !!e.jeton, signaux: e.s }));
})();
