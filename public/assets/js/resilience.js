/* Terra Nova — tenue en charge côté navigateur (vague 15 : F77 surcharge du serveur, F78 affluence simultanée)
   Chargé par ui.js sur toutes les pages. S'appuie sur NT.charge (store.js), alimenté par l'en-tête X-Charge et les 503.
   - Avis calme, jamais de bandeau : une ligne en pied de page (« Forte affluence : l'essentiel reste disponible ») et une
     carte en tête du tiroir « Alertes » ; la balise prend une teinte discrète, sans clignoter.
   - Pendant la surcharge, les mises à jour en direct sont espacées (recul exponentiel + gigue, voir NT.econome.delai) et
     les widgets non essentiels se mettent en pause ; le retour à la normale est détecté par GET /api/charge.
   - Brouillons : le texte des formulaires (ceux qui ont une zone de texte) est gardé sur l'appareil pendant la saisie et
     proposé à nouveau à la prochaine visite ; effacé dès que l'envoi a réussi.
   - Envoi refusé par un serveur surchargé ou injoignable : nouvel essai automatique (3 au plus) avec un délai croissant,
     compte à rebours visible, « Réessayer maintenant » ou « Annuler ».
   - Copie hors connexion : petit Service Worker (sw.js) qui garde l'enveloppe des pages essentielles et les messages
     officiels ; toujours le réseau d'abord pour les pages et les scripts (jamais d'ancien script après un déploiement). */
(function () {
  'use strict';
  const NT = window.NT;
  if (!NT || !NT.charge || NT.resilience) return;
  NT.resilience = true;
  NT.i18n.ajouter({
    fr: { 'ch.pied': 'Forte affluence : l’essentiel reste disponible.', 'ch.horsLigne': 'Connexion au serveur interrompue : dernières informations connues affichées.', 'ch.savoir': 'En savoir plus',
      'ch.titre': 'Forte affluence : l’essentiel reste disponible', 'ch.texte': 'Beaucoup d’habitants se connectent en même temps. Les alertes, l’état des services, vos demandes et la connexion restent prioritaires. Certaines parties secondaires (statistiques, soutiens, avis…) se mettent en pause quelques instants et les mises à jour en direct sont espacées.',
      'ch.saisies': 'Vos saisies sont gardées sur cet appareil : rien n’est perdu.', 'ch.titreHL': 'Le serveur ne répond pas pour le moment', 'ch.texteHL': 'Les informations affichées sont les dernières connues sur cet appareil. La page se met à jour dès que la connexion revient.',
      'ch.date': 'Dernière mise à jour : {d}.', 'ch.annonce': 'Forte affluence sur la plateforme : l’essentiel reste disponible.', 'ch.retour': 'La plateforme fonctionne de nouveau normalement.',
      'ch.brouillon': 'Brouillon retrouvé (enregistré {d}) : votre texte a été remis en place.', 'ch.effacer': 'Effacer le brouillon', 'ch.efface': 'Brouillon effacé.',
      'ch.essai': 'L’envoi n’a pas pu partir (forte affluence ou connexion interrompue). Votre texte est gardé sur cet appareil. Nouvel essai automatique dans {n} s.',
      'ch.essaiMaintenant': 'Réessayer maintenant', 'ch.annuler': 'Annuler', 'ch.essaiAnnule': 'Nouvel essai annulé. Votre texte reste gardé sur cet appareil.',
      'ch.abandon': 'Toujours pas de réponse du serveur. Votre texte est gardé sur cet appareil : réessayez dans quelques minutes.', 'ch.envoiEnCours': 'Nouvel essai d’envoi…' },
    en: { 'ch.pied': 'High traffic: the essentials remain available.', 'ch.horsLigne': 'Connection to the server lost: last known information shown.', 'ch.savoir': 'Learn more',
      'ch.titre': 'High traffic: the essentials remain available', 'ch.texte': 'Many residents are connecting at the same time. Alerts, service status, your requests and sign-in keep priority. Some secondary parts (statistics, supports, reviews…) pause for a few moments and live updates are spaced out.',
      'ch.saisies': 'What you type is kept on this device: nothing is lost.', 'ch.titreHL': 'The server is not responding right now', 'ch.texteHL': 'The information shown is the last known on this device. The page updates as soon as the connection is back.',
      'ch.date': 'Last update: {d}.', 'ch.annonce': 'High traffic on the platform: the essentials remain available.', 'ch.retour': 'The platform is working normally again.',
      'ch.brouillon': 'Draft found (saved {d}): your text has been put back.', 'ch.effacer': 'Delete the draft', 'ch.efface': 'Draft deleted.',
      'ch.essai': 'Sending failed (high traffic or connection lost). Your text is kept on this device. Automatic new attempt in {n} s.',
      'ch.essaiMaintenant': 'Try again now', 'ch.annuler': 'Cancel', 'ch.essaiAnnule': 'New attempt cancelled. Your text stays on this device.',
      'ch.abandon': 'Still no answer from the server. Your text is kept on this device: try again in a few minutes.', 'ch.envoiEnCours': 'Sending again…' },
    es: { 'ch.pied': 'Mucha afluencia: lo esencial sigue disponible.', 'ch.horsLigne': 'Conexión con el servidor interrumpida: se muestra la última información conocida.', 'ch.savoir': 'Más información',
      'ch.titre': 'Mucha afluencia: lo esencial sigue disponible', 'ch.texte': 'Muchos habitantes se conectan a la vez. Las alertas, el estado de los servicios, sus solicitudes y el acceso siguen siendo prioritarios. Algunas partes secundarias (estadísticas, apoyos, opiniones…) se pausan unos instantes y las actualizaciones en directo se espacian.',
      'ch.saisies': 'Lo que escribe se guarda en este dispositivo: no se pierde nada.', 'ch.titreHL': 'El servidor no responde por ahora', 'ch.texteHL': 'La información mostrada es la última conocida en este dispositivo. La página se actualiza en cuanto vuelve la conexión.',
      'ch.date': 'Última actualización: {d}.', 'ch.annonce': 'Mucha afluencia en la plataforma: lo esencial sigue disponible.', 'ch.retour': 'La plataforma vuelve a funcionar con normalidad.',
      'ch.brouillon': 'Borrador recuperado (guardado {d}): su texto se ha vuelto a colocar.', 'ch.effacer': 'Borrar el borrador', 'ch.efface': 'Borrador eliminado.',
      'ch.essai': 'El envío no pudo salir (mucha afluencia o conexión interrumpida). Su texto se guarda en este dispositivo. Nuevo intento automático en {n} s.',
      'ch.essaiMaintenant': 'Reintentar ahora', 'ch.annuler': 'Cancelar', 'ch.essaiAnnule': 'Nuevo intento cancelado. Su texto sigue guardado en este dispositivo.',
      'ch.abandon': 'El servidor sigue sin responder. Su texto se guarda en este dispositivo: vuelva a intentarlo en unos minutos.', 'ch.envoiEnCours': 'Nuevo intento de envío…' },
    ar: { 'ch.pied': 'إقبال كبير: الأساسي يبقى متاحاً.', 'ch.horsLigne': 'انقطع الاتصال بالخادم: تُعرض آخر المعلومات المعروفة.', 'ch.savoir': 'معرفة المزيد',
      'ch.titre': 'إقبال كبير: الأساسي يبقى متاحاً', 'ch.texte': 'يتصل كثير من السكان في الوقت نفسه. التنبيهات وحالة الخدمات وطلباتك وتسجيل الدخول تبقى ذات أولوية. بعض الأجزاء الثانوية (الإحصاءات، الدعم، الآراء…) تتوقف لحظات، وتتباعد التحديثات المباشرة.',
      'ch.saisies': 'ما تكتبه محفوظ على هذا الجهاز: لن يضيع شيء.', 'ch.titreHL': 'الخادم لا يستجيب حالياً', 'ch.texteHL': 'المعلومات المعروضة هي آخر ما هو معروف على هذا الجهاز. تتحدث الصفحة فور عودة الاتصال.',
      'ch.date': 'آخر تحديث: {d}.', 'ch.annonce': 'إقبال كبير على المنصة: الأساسي يبقى متاحاً.', 'ch.retour': 'عادت المنصة تعمل بشكل طبيعي.',
      'ch.brouillon': 'تم العثور على مسودة (محفوظة {d}): أُعيد نصك إلى مكانه.', 'ch.effacer': 'حذف المسودة', 'ch.efface': 'حُذفت المسودة.',
      'ch.essai': 'تعذر الإرسال (إقبال كبير أو انقطاع الاتصال). نصك محفوظ على هذا الجهاز. محاولة جديدة تلقائية بعد {n} ث.',
      'ch.essaiMaintenant': 'إعادة المحاولة الآن', 'ch.annuler': 'إلغاء', 'ch.essaiAnnule': 'أُلغيت المحاولة الجديدة. يبقى نصك محفوظاً على هذا الجهاز.',
      'ch.abandon': 'لا يزال الخادم لا يجيب. نصك محفوظ على هذا الجهاز: أعد المحاولة بعد بضع دقائق.', 'ch.envoiEnCours': 'محاولة إرسال جديدة…' }
  });
  const C = NT.charge;
  const t = (k, v) => NT.t(k, v);
  const e = s => NT.ui.echap(s);
  const horsLigne = () => !!NT.horsLigne || C.injoignable >= 2 || (C.injoignable > 0 && navigator.onLine === false);
  const degrade = () => C.niveau !== 'normal';

  /* ---------- Avis calme : pied de page + carte du tiroir des alertes ---------- */
  const pied = document.querySelector('.pied .conteneur');
  const ligne = document.createElement('span');
  ligne.className = 'pied-charge';
  ligne.hidden = true;
  if (pied) pied.append(ligne);
  NT.ui.carteCharge = () => {
    if (horsLigne()) {
      const depuis = NT.horsLigne && NT.horsLigne.depuis;
      return `<article class="alerte-fiche niveau-charge" aria-labelledby="ch-h"><h3 id="ch-h"><i class="ph-duotone ph-wifi-slash" aria-hidden="true"></i>${e(t('ch.titreHL'))}</h3>
        <p>${e(t('ch.texteHL'))}</p>${depuis ? `<p class="doux">${e(t('ch.date', { d: NT.ui.dateHeure(depuis) }))}</p>` : ''}<p class="doux">${e(t('ch.saisies'))}</p></article>`;
    }
    if (!degrade()) return '';
    return `<article class="alerte-fiche niveau-charge" aria-labelledby="ch-h"><h3 id="ch-h"><i class="ph-duotone ph-users-three" aria-hidden="true"></i>${e(t('ch.titre'))}</h3>
      <p>${e(t('ch.texte'))}</p><p class="doux">${e(t('ch.saisies'))}</p></article>`;
  };
  let annonce = degrade() || horsLigne();
  function rendre() {
    const hl = horsLigne(), dg = degrade();
    ligne.hidden = !hl && !dg;
    document.documentElement.classList.toggle('affluence', dg || hl);
    ligne.innerHTML = hl || dg ? `<i class="ph ${hl ? 'ph-wifi-slash' : 'ph-users-three'}" aria-hidden="true"></i>${e(t(hl ? 'ch.horsLigne' : 'ch.pied'))} <button type="button" class="lien-bouton" id="nt-charge-savoir">${e(t('ch.savoir'))}</button>` : '';
    if (NT.ui.rafraichirAlertes) NT.ui.rafraichirAlertes();
    // une seule annonce vocale par changement d'état, pas de message qui s'impose
    if ((dg || hl) && !annonce) { annonce = true; NT.ui.annoncer(t('ch.annonce')); }
    else if (!dg && !hl && annonce) { annonce = false; NT.ui.annoncer(t('ch.retour')); }
  }
  ligne.addEventListener('click', ev => { if (ev.target.id === 'nt-charge-savoir' && NT.ui.tiroirAlertes) NT.ui.tiroirAlertes.show(); });
  C.surChangement(() => { rendre(); surveiller(); });

  /* ---------- Retour à la normale : GET /api/charge tant que la plateforme est chargée (recul exponentiel + gigue) ---------- */
  let minuterie = null;
  function surveiller() {
    clearTimeout(minuterie);
    if (!degrade() && C.echecs === 0 && !NT.horsLigne) return;
    minuterie = setTimeout(() => {
      if (document.hidden) return surveiller();
      fetch('/api/charge', { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then(j => {
        if (j) C.observer(200, j.niveau);
        if (j && NT.horsLigne) { NT.recharger(); if (!NT.horsLigne) location.reload(); }   // le serveur répond de nouveau : données fraîches
      }).catch(() => C.observer(0)).finally(surveiller);
    }, 15000 * C.facteur());
  }
  window.addEventListener('offline', () => { C.observer(0); C.observer(0); });
  window.addEventListener('online', () => { C.echecs = Math.max(0, C.echecs - 1); surveiller(); fetch('/api/charge', { cache: 'no-store' }).catch(() => {}); });

  /* ---------- Brouillons : rien n'est perdu ---------- */
  const EXCLUS = new Set(['password', 'hidden', 'file', 'submit', 'button', 'reset', 'search', 'email', 'tel', 'image']);
  const DUREE = 7 * 864e5;
  const eligible = f => f && f.tagName === 'FORM' && f.dataset.brouillon !== 'non' && !!f.querySelector('textarea');
  const cleDe = f => 'brouillon:' + location.pathname + location.search + '#' + (f.id || 'form' + [...document.forms].indexOf(f));
  const champs = f => [...f.elements].filter(c => c.id && !EXCLUS.has(c.type) && c.tagName !== 'BUTTON' && c.tagName !== 'FIELDSET' && c.autocomplete !== 'one-time-code' && !/mot-?de-?passe|code|secret/i.test(c.id));
  function sauver(f) {
    const v = {}; let plein = false;
    champs(f).forEach(c => {
      if (c.type === 'checkbox' || c.type === 'radio') { if (c.checked) v[c.id] = true; }
      else if (c.value) { v[c.id] = c.value; if (c.tagName === 'TEXTAREA' && c.value.trim()) plein = true; }
    });
    if (plein) NT.store.ecrire(cleDe(f), { date: new Date().toISOString(), v });
    else effacer(f);
  }
  function effacer(f) { try { localStorage.removeItem('nt:' + cleDe(f)); } catch (err) { /* stockage bloqué */ } const n = f.querySelector('.brouillon-note'); if (n) n.remove(); }
  function restaurer(f) {
    if (!eligible(f) || f.dataset.brouillonVu) return;
    f.dataset.brouillonVu = '1';
    const b = NT.store.lire(cleDe(f), null);
    if (!b || !b.v || Date.now() - Date.parse(b.date) > DUREE) return;
    // seulement si l'habitant n'a encore rien écrit dans les zones de texte
    if (champs(f).some(c => c.tagName === 'TEXTAREA' && c.value.trim())) return;
    let remis = 0;
    champs(f).forEach(c => {
      if (!(c.id in b.v)) return;
      if (c.type === 'checkbox' || c.type === 'radio') { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }
      else { c.value = b.v[c.id]; c.dispatchEvent(new Event('input', { bubbles: true })); c.dispatchEvent(new Event('change', { bubbles: true })); }
      remis++;
    });
    if (!remis) return;
    const note = document.createElement('p');
    note.className = 'brouillon-note'; note.setAttribute('role', 'status');
    note.innerHTML = `<i class="ph ph-floppy-disk" aria-hidden="true"></i><span>${e(t('ch.brouillon', { d: NT.ui.depuis(b.date) }))}</span> <button type="button" class="lien-bouton">${e(t('ch.effacer'))}</button>`;
    note.querySelector('button').addEventListener('click', () => {
      champs(f).forEach(c => { if (c.tagName === 'TEXTAREA' || (c.tagName === 'INPUT' && !['checkbox', 'radio'].includes(c.type))) c.value = ''; });
      effacer(f); NT.ui.annoncer(t('ch.efface'));
      const z = f.querySelector('textarea'); if (z) z.focus();
    });
    f.prepend(note);
  }
  const attente = new WeakMap();
  document.addEventListener('input', ev => {
    const f = ev.target.form || (ev.target.closest && ev.target.closest('form'));
    if (!eligible(f) || !ev.isTrusted) return;
    clearTimeout(attente.get(f));
    attente.set(f, setTimeout(() => sauver(f), 400));
  });
  document.addEventListener('focusin', ev => { const f = ev.target.closest && ev.target.closest('form'); if (f) restaurer(f); });
  const scanner = () => document.querySelectorAll('main form').forEach(restaurer);
  setTimeout(scanner, 400);

  /* ---------- Envoi : succès → brouillon effacé ; serveur surchargé → nouvel essai automatique ---------- */
  let envoi = null;   // { form, t, ok, ko }
  document.addEventListener('submit', ev => {
    const f = ev.target;
    if (!f || f.tagName !== 'FORM') return;
    if (eligible(f)) sauver(f);
    const snap = envoi = { form: f, t: Date.now(), ok: C.ecrituresOk, ko: C.echecsEcriture };
    setTimeout(() => {   // le gestionnaire de la page a fini (appels synchrones) : l'envoi a-t-il réussi ?
      if (C.ecrituresOk > snap.ok && C.echecsEcriture === snap.ko) { effacer(f); f._tnEssais = 0; const n = f.querySelector('.reessai-note'); if (n) n.remove(); }
    }, 0);
  }, true);

  C.reessayer = r => {
    const d = r.donnees || {};
    const f = envoi && Date.now() - envoi.t < 5000 && document.contains(envoi.form) ? envoi.form : null;
    // pas de formulaire en cause, ou une partie de l'envoi a déjà réussi (pas de doublon) : simple message calme
    if (!f || C.ecrituresOk > envoi.ok) { NT.ui.toast(d.erreur || t('ch.abandon'), 'warning', 8000); return; }
    const essais = f._tnEssais || 0;
    let note = f.querySelector('.reessai-note');
    if (!note) { note = document.createElement('div'); note.className = 'reessai-note'; note.setAttribute('role', 'status'); f.append(note); }
    clearInterval(f._tnCompte);
    if (essais >= 3) { note.innerHTML = `<i class="ph ph-floppy-disk" aria-hidden="true"></i><p>${e(t('ch.abandon'))}</p>`; f._tnEssais = 0; return; }
    const base = Number(d.reessayerDans) > 0 ? Math.min(Number(d.reessayerDans), 30) : Math.min(30, 3 * Math.pow(2, essais));
    let reste = Math.max(2, Math.round(base * (0.8 + Math.random() * 0.4)));
    const dessiner = () => { note.querySelector('p').textContent = t('ch.essai', { n: reste }); };
    note.innerHTML = `<i class="ph ph-clock-countdown" aria-hidden="true"></i><p></p><span class="ligne"><button type="button" class="btn" data-essai="maintenant">${e(t('ch.essaiMaintenant'))}</button><button type="button" class="lien-bouton" data-essai="annuler">${e(t('ch.annuler'))}</button></span>`;
    dessiner();
    const lancer = () => {
      clearInterval(f._tnCompte);
      if (!document.contains(f)) return;
      f._tnEssais = essais + 1;
      note.querySelector('p').textContent = t('ch.envoiEnCours');
      if (f.requestSubmit) f.requestSubmit(); else f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    };
    note.onclick = ev => {
      const b = ev.target.closest('[data-essai]'); if (!b) return;
      if (b.dataset.essai === 'maintenant') lancer();
      else { clearInterval(f._tnCompte); f._tnEssais = 0; note.innerHTML = `<i class="ph ph-floppy-disk" aria-hidden="true"></i><p>${e(t('ch.essaiAnnule'))}</p>`; }
    };
    f._tnCompte = setInterval(() => { reste--; if (reste <= 0) lancer(); else dessiner(); }, 1000);
  };

  /* ---------- Copie hors connexion (Service Worker) ---------- */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname))) {
    const inscrire = () => navigator.serviceWorker.register('/sw.js').catch(() => { /* navigateur sans prise en charge ou mode privé */ });
    if (document.readyState === 'complete') setTimeout(inscrire, 1000); else window.addEventListener('load', inscrire);
  }

  rendre();
  surveiller();
})();
