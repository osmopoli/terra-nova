/* Terra Nova — vague 17 : veille en direct, chargée par ui.js pour toute personne connectée.
   - F86 : personnel → urgences médicales en cours en tête du tiroir « Alertes », balise teintée (sans son ni clignotement),
     message à l'écran à chaque nouvelle urgence ; habitant → statut de son urgence en cours et rappel 15 / 112.
   - F85 : « Activité inhabituelle sur votre compte » à confirmer (« C'était moi » / « Ce n'était pas moi ») dans le tiroir
     et sur la page « Sécurité de vos données » (#activite) ; fenêtre « Confirmez votre mot de passe » quand le serveur
     l'exige pour une action sensible (NT.reauth, appelée par store.js sur une réponse 428). */
(function () {
  'use strict';
  const NT = window.NT;
  if (!NT || NT.veille || !NT.auth) return;
  NT.veille = true;
  const u = NT.auth.utilisateur();
  if (!u) return;
  if (!document.querySelector('link[href*="vague17.css"]')) {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'assets/css/vague17.css'; document.head.append(l);
  }
  NT.i18n.ajouter({
    fr: { 'vl.rs.refus': 'Nombreux accès refusés', 'vl.rs.introuvables': 'Nombreuses pages introuvables', 'vl.rs.rafale': 'Rafale de requêtes', 'vl.rs.echecs-connexion': 'Échecs de connexion répétés', 'vl.rs.heure': 'Connexion à une heure inhabituelle', 'vl.rs.reseau': 'Connexion depuis un réseau inhabituel', 'vl.rs.pays': 'Connexion depuis un autre pays', 'vl.rs.appareil': 'Navigateur ou système inhabituel', 'vl.rs.lectures': 'Lecture en masse de données d’autres habitants', 'vl.rs.exports-nominatifs': 'Exports nominatifs répétés', 'vl.priseEn': 'pris en charge en {n} min', 'vl.urgTitre': 'Urgences médicales en cours ({n})', 'vl.urgIntro': 'Hors de la file normale : à prendre en charge tout de suite.', 'vl.signalee': 'Signalée il y a {n} min',
      'vl.aPrendre': 'À prendre en charge dans {n} min', 'vl.retard': 'En retard de {n} min — escaladée', 'vl.voir': 'Ouvrir le panneau des urgences', 'vl.nouvelle': 'Urgence médicale signalée : {id}. À prendre en charge maintenant.',
      'vl.monUrg': 'Votre urgence médicale {id}', 'vl.suivre': 'Voir le statut en direct', 'vl.appel15': 'Appeler le 15', 'vl.appel112': 'Appeler le 112',
      'vl.rappel': 'Terra Nova ne remplace pas les secours : en danger, appelez le 15 ou le 112.',
      'vl.s.signalee': 'Signalée', 'vl.s.prise_en_charge': 'Prise en charge', 'vl.s.transmise': 'Transmise aux secours', 'vl.s.close': 'Close',
      'vl.actTitre': 'Activité inhabituelle sur votre compte', 'vl.actQuestion': 'Était-ce vous ?', 'vl.moi': 'C’était moi', 'vl.pasMoi': 'Ce n’était pas moi',
      'vl.moiOk': 'Merci. Les protections temporaires sont levées.', 'vl.pasMoiOk': 'Vos autres sessions sont fermées ({n}). Changez votre mot de passe dès maintenant.', 'vl.changerMdp': 'Changer mon mot de passe',
      'vl.reauthTitre': 'Confirmez votre mot de passe', 'vl.reauthTexte': 'Par sécurité, cette action demande de confirmer votre mot de passe (une activité inhabituelle a été remarquée ou l’action est sensible).',
      'vl.mdp': 'Mot de passe', 'vl.confirmer': 'Confirmer', 'vl.annuler': 'Annuler', 'vl.reauthOk': 'Mot de passe confirmé : vous pouvez refaire l’action pendant 10 minutes.', 'vl.reauthKo': 'Mot de passe incorrect.',
      'vl.histTitre': 'Alertes d’activité inhabituelle', 'vl.histVide': 'Aucune activité inhabituelle détectée sur votre compte.', 'vl.r.a_confirmer': 'À confirmer', 'vl.r.moi': 'Confirmée : c’était vous', 'vl.r.pas_moi': 'Contestée : sessions fermées' },
    en: { 'vl.rs.refus': 'Many refused accesses', 'vl.rs.introuvables': 'Many pages not found', 'vl.rs.rafale': 'Burst of requests', 'vl.rs.echecs-connexion': 'Repeated sign-in failures', 'vl.rs.heure': 'Sign-in at an unusual time', 'vl.rs.reseau': 'Sign-in from an unusual network', 'vl.rs.pays': 'Sign-in from another country', 'vl.rs.appareil': 'Unusual browser or system', 'vl.rs.lectures': 'Mass reading of other residents’ data', 'vl.rs.exports-nominatifs': 'Repeated named exports', 'vl.priseEn': 'handled within {n} min', 'vl.urgTitre': 'Medical emergencies in progress ({n})', 'vl.urgIntro': 'Outside the normal queue: handle them right away.', 'vl.signalee': 'Reported {n} min ago',
      'vl.aPrendre': 'To be handled within {n} min', 'vl.retard': '{n} min late — escalated', 'vl.voir': 'Open the emergencies panel', 'vl.nouvelle': 'Medical emergency reported: {id}. Handle it now.',
      'vl.monUrg': 'Your medical emergency {id}', 'vl.suivre': 'See the live status', 'vl.appel15': 'Call 15', 'vl.appel112': 'Call 112',
      'vl.rappel': 'Terra Nova does not replace emergency services: if in danger, call 15 or 112.',
      'vl.s.signalee': 'Reported', 'vl.s.prise_en_charge': 'Being handled', 'vl.s.transmise': 'Passed to emergency services', 'vl.s.close': 'Closed',
      'vl.actTitre': 'Unusual activity on your account', 'vl.actQuestion': 'Was it you?', 'vl.moi': 'It was me', 'vl.pasMoi': 'It was not me',
      'vl.moiOk': 'Thank you. Temporary protections have been lifted.', 'vl.pasMoiOk': 'Your other sessions have been closed ({n}). Change your password now.', 'vl.changerMdp': 'Change my password',
      'vl.reauthTitre': 'Confirm your password', 'vl.reauthTexte': 'For security, this action requires you to confirm your password (unusual activity was noticed or the action is sensitive).',
      'vl.mdp': 'Password', 'vl.confirmer': 'Confirm', 'vl.annuler': 'Cancel', 'vl.reauthOk': 'Password confirmed: you can redo the action for 10 minutes.', 'vl.reauthKo': 'Incorrect password.',
      'vl.histTitre': 'Unusual activity alerts', 'vl.histVide': 'No unusual activity detected on your account.', 'vl.r.a_confirmer': 'To confirm', 'vl.r.moi': 'Confirmed: it was you', 'vl.r.pas_moi': 'Disputed: sessions closed' },
    es: { 'vl.rs.refus': 'Muchos accesos rechazados', 'vl.rs.introuvables': 'Muchas páginas no encontradas', 'vl.rs.rafale': 'Ráfaga de solicitudes', 'vl.rs.echecs-connexion': 'Fallos de conexión repetidos', 'vl.rs.heure': 'Conexión a una hora inusual', 'vl.rs.reseau': 'Conexión desde una red inusual', 'vl.rs.pays': 'Conexión desde otro país', 'vl.rs.appareil': 'Navegador o sistema inusual', 'vl.rs.lectures': 'Lectura masiva de datos de otros habitantes', 'vl.rs.exports-nominatifs': 'Exportaciones nominativas repetidas', 'vl.priseEn': 'atendida en {n} min', 'vl.urgTitre': 'Urgencias médicas en curso ({n})', 'vl.urgIntro': 'Fuera de la cola normal: atiéndalas de inmediato.', 'vl.signalee': 'Señalada hace {n} min',
      'vl.aPrendre': 'A atender en {n} min', 'vl.retard': '{n} min de retraso — escalada', 'vl.voir': 'Abrir el panel de urgencias', 'vl.nouvelle': 'Urgencia médica señalada: {id}. Atiéndala ahora.',
      'vl.monUrg': 'Su urgencia médica {id}', 'vl.suivre': 'Ver el estado en directo', 'vl.appel15': 'Llamar al 15', 'vl.appel112': 'Llamar al 112',
      'vl.rappel': 'Terra Nova no sustituye a los servicios de emergencia: en peligro, llame al 15 o al 112.',
      'vl.s.signalee': 'Señalada', 'vl.s.prise_en_charge': 'En atención', 'vl.s.transmise': 'Transmitida a emergencias', 'vl.s.close': 'Cerrada',
      'vl.actTitre': 'Actividad inusual en su cuenta', 'vl.actQuestion': '¿Era usted?', 'vl.moi': 'Era yo', 'vl.pasMoi': 'No era yo',
      'vl.moiOk': 'Gracias. Se han levantado las protecciones temporales.', 'vl.pasMoiOk': 'Sus otras sesiones se han cerrado ({n}). Cambie su contraseña ahora.', 'vl.changerMdp': 'Cambiar mi contraseña',
      'vl.reauthTitre': 'Confirme su contraseña', 'vl.reauthTexte': 'Por seguridad, esta acción requiere confirmar su contraseña (se ha notado una actividad inusual o la acción es sensible).',
      'vl.mdp': 'Contraseña', 'vl.confirmer': 'Confirmar', 'vl.annuler': 'Cancelar', 'vl.reauthOk': 'Contraseña confirmada: puede repetir la acción durante 10 minutos.', 'vl.reauthKo': 'Contraseña incorrecta.',
      'vl.histTitre': 'Alertas de actividad inusual', 'vl.histVide': 'No se ha detectado actividad inusual en su cuenta.', 'vl.r.a_confirmer': 'Por confirmar', 'vl.r.moi': 'Confirmada: era usted', 'vl.r.pas_moi': 'Impugnada: sesiones cerradas' },
    ar: { 'vl.rs.refus': 'رفض متكرر للوصول', 'vl.rs.introuvables': 'صفحات كثيرة غير موجودة', 'vl.rs.rafale': 'سلسلة طلبات متتالية', 'vl.rs.echecs-connexion': 'إخفاقات متكررة في تسجيل الدخول', 'vl.rs.heure': 'تسجيل دخول في وقت غير معتاد', 'vl.rs.reseau': 'تسجيل دخول من شبكة غير معتادة', 'vl.rs.pays': 'تسجيل دخول من بلد آخر', 'vl.rs.appareil': 'متصفح أو نظام غير معتاد', 'vl.rs.lectures': 'قراءة مكثفة لبيانات سكان آخرين', 'vl.rs.exports-nominatifs': 'عمليات تصدير متكررة بالأسماء', 'vl.priseEn': 'تم التكفل بها خلال {n} دقيقة', 'vl.urgTitre': 'حالات طبية طارئة جارية ({n})', 'vl.urgIntro': 'خارج قائمة الانتظار العادية: يجب التكفل بها فوراً.', 'vl.signalee': 'أُبلغ عنها قبل {n} دقيقة',
      'vl.aPrendre': 'يجب التكفل بها خلال {n} دقيقة', 'vl.retard': 'متأخرة {n} دقيقة — تم التصعيد', 'vl.voir': 'فتح لوحة الحالات الطارئة', 'vl.nouvelle': 'تم الإبلاغ عن حالة طبية طارئة: {id}. تكفّل بها الآن.',
      'vl.monUrg': 'حالتك الطبية الطارئة {id}', 'vl.suivre': 'عرض الحالة مباشرة', 'vl.appel15': 'اتصل بالرقم 15', 'vl.appel112': 'اتصل بالرقم 112',
      'vl.rappel': 'تيرا نوفا لا تحل محل خدمات الإسعاف: عند الخطر اتصل بالرقم 15 أو 112.',
      'vl.s.signalee': 'تم الإبلاغ', 'vl.s.prise_en_charge': 'قيد التكفل', 'vl.s.transmise': 'أُحيلت إلى الإسعاف', 'vl.s.close': 'مغلقة',
      'vl.actTitre': 'نشاط غير معتاد على حسابك', 'vl.actQuestion': 'هل كنت أنت؟', 'vl.moi': 'نعم، كنت أنا', 'vl.pasMoi': 'لم أكن أنا',
      'vl.moiOk': 'شكراً. تم رفع إجراءات الحماية المؤقتة.', 'vl.pasMoiOk': 'تم إغلاق جلساتك الأخرى ({n}). غيّر كلمة المرور الآن.', 'vl.changerMdp': 'تغيير كلمة المرور',
      'vl.reauthTitre': 'أكّد كلمة المرور', 'vl.reauthTexte': 'لدواعٍ أمنية، يتطلب هذا الإجراء تأكيد كلمة المرور (لوحظ نشاط غير معتاد أو أن الإجراء حساس).',
      'vl.mdp': 'كلمة المرور', 'vl.confirmer': 'تأكيد', 'vl.annuler': 'إلغاء', 'vl.reauthOk': 'تم تأكيد كلمة المرور: يمكنك إعادة الإجراء خلال 10 دقائق.', 'vl.reauthKo': 'كلمة المرور غير صحيحة.',
      'vl.histTitre': 'تنبيهات النشاط غير المعتاد', 'vl.histVide': 'لم يُكتشف أي نشاط غير معتاد على حسابك.', 'vl.r.a_confirmer': 'بانتظار التأكيد', 'vl.r.moi': 'مؤكدة: كنت أنت', 'vl.r.pas_moi': 'مرفوضة: أُغلقت الجلسات' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const staff = u.role !== 'citoyen';
  const raisons = (a) => ((a.raisons && a.raisons.length) ? a.raisons.map((r) => NT.t('vl.rs.' + r, null, r)) : a.libelles || []).join(' · ');
  const min = (a, b) => Math.max(0, Math.round(((b ? Date.parse(b) : Date.now()) - Date.parse(a)) / 60000));
  let donnees = null, connues = null;

  /* ---------- Confirmation du mot de passe (F85, step-up) ---------- */
  let dialogue = null, apresConfirmation = null;
  NT.reauth = function (o) {
    if (o && typeof o.apres === 'function') apresConfirmation = o.apres;
    else if (!(o && o.auto)) apresConfirmation = null;   // appel automatique de store.js : garde l'action prévue par la page
    if (!dialogue) {
      dialogue = document.createElement('sl-dialog');
      dialogue.label = t('vl.reauthTitre');
      dialogue.innerHTML = `<form id="vl-reauth" novalidate><p style="margin-top:0">${E(t('vl.reauthTexte'))}</p>
        <div class="champ"><label for="vl-mdp">${E(t('vl.mdp'))}</label><input id="vl-mdp" type="password" autocomplete="current-password" required aria-describedby="vl-mdp-err"><p class="erreur" id="vl-mdp-err" aria-live="polite"></p></div>
        <div class="v17-boutons"><button class="btn btn-primaire" type="submit">${E(t('vl.confirmer'))}</button><button class="btn" type="button" id="vl-annuler">${E(t('vl.annuler'))}</button></div></form>`;
      document.body.append(dialogue);
      dialogue.querySelector('#vl-annuler').addEventListener('click', () => { apresConfirmation = null; dialogue.hide(); });
      dialogue.addEventListener('sl-initial-focus', (e) => { e.preventDefault(); dialogue.querySelector('#vl-mdp').focus(); });
      dialogue.querySelector('#vl-reauth').addEventListener('submit', (e) => {
        e.preventDefault();
        const champ = dialogue.querySelector('#vl-mdp');
        const r = NT.api('POST', '/api/auth/verifier', { motdepasse: champ.value });
        champ.value = '';
        if (!(r.donnees && r.donnees.ok)) { dialogue.querySelector('#vl-mdp-err').textContent = t('vl.reauthKo'); champ.focus(); return; }
        dialogue.querySelector('#vl-mdp-err').textContent = '';
        dialogue.hide();
        if (apresConfirmation) { const f = apresConfirmation; apresConfirmation = null; f(); } else NT.ui.toast(t('vl.reauthOk'), 'success', 7000);
      });
    }
    customElements.whenDefined('sl-dialog').then(() => dialogue.show());
  };

  /* ---------- Contenu du tiroir « Alertes » ---------- */
  function appels() {
    return `<div class="v17-appel"><a class="btn btn-danger petit" href="tel:15"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i>${E(t('vl.appel15'))}</a>
      <a class="btn btn-danger petit" href="tel:112"><i class="ph-duotone ph-phone-call" aria-hidden="true"></i>${E(t('vl.appel112'))}</a></div>`;
  }
  function html() {
    if (!donnees) return { n: 0, html: '', urgent: false };
    let h = '';
    const urg = donnees.urgences || [];
    if (urg.length && staff) {
      h += `<article class="v17-carte urgence" aria-labelledby="vl-urg-t"><h3 id="vl-urg-t"><i class="ph-duotone ph-first-aid-kit" aria-hidden="true"></i>${E(t('vl.urgTitre', { n: urg.length }))}</h3>
        <p class="doux">${E(t('vl.urgIntro'))}</p><ul>${urg.map((x) => {
          const reste = Math.ceil((Date.parse(x.echeance) - Date.now()) / 60000);
          const delai = x.statut !== 'signalee' ? '' : reste > 0 ? t('vl.aPrendre', { n: reste }) : t('vl.retard', { n: -reste });
          return `<li><span><span class="v17-num">${E(x.id)}</span> · <strong>${E(t('vl.s.' + x.statut))}</strong>${x.quartier ? ' · ' + E(x.quartier) : ''}</span>
            <span>${E(x.objet || '')}</span><span class="doux">${E(t('vl.signalee', { n: min(x.signaleeLe) }))}${delai ? ' · <strong>' + E(delai) + '</strong>' : ''}</span></li>`;
        }).join('')}</ul><div class="actions"><a class="btn btn-primaire petit" href="agent-demandes.html?urgences=1#urgences">${E(t('vl.voir'))}</a></div></article>`;
    } else if (urg.length) {
      h += urg.map((x) => `<article class="v17-carte urgence"><h3><i class="ph-duotone ph-first-aid-kit" aria-hidden="true"></i>${E(t('vl.monUrg', { id: x.id }))}</h3>
        <p><strong>${E(t('vl.s.' + x.statut))}</strong>${x.priseEnCharge ? ' · ' + E(t('vl.priseEn', { n: x.priseEnCharge.minutes })) : ''}</p>
        <p class="doux">${E(t('vl.rappel'))}</p>${appels()}<div class="actions"><a class="btn petit" href="urgence.html?id=${encodeURIComponent(x.id)}">${E(t('vl.suivre'))}</a></div></article>`).join('');
    }
    const act = donnees.activite || [];
    h += act.map((a) => `<article class="v17-carte activite" data-activite="${E(a.id)}"><h3><i class="ph-duotone ph-shield-warning" aria-hidden="true"></i>${E(t('vl.actTitre'))}</h3>
      <p>${E(raisons(a))}</p><p class="doux">${E(NT.ui.dateHeure ? NT.ui.dateHeure(a.date) : a.date)}</p><p><strong>${E(t('vl.actQuestion'))}</strong></p>
      <div class="actions"><button class="btn petit" type="button" data-act-rep="moi" data-id="${E(a.id)}">${E(t('vl.moi'))}</button>
      <button class="btn btn-danger petit" type="button" data-act-rep="pas_moi" data-id="${E(a.id)}">${E(t('vl.pasMoi'))}</button></div></article>`).join('');
    return { n: urg.length + act.length, html: h, urgent: staff && urg.some((x) => x.statut === 'signalee') };
  }
  NT.ui.veille = html;

  function repondre(id, reponse) {
    const r = NT.api('POST', '/api/activite/' + encodeURIComponent(id) + '/reponse', { reponse });
    if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger'); return; }
    if (reponse === 'moi') NT.ui.toast(t('vl.moiOk'), 'success', 7000);
    else NT.ui.toast(t('vl.pasMoiOk', { n: r.donnees.sessionsFermees || 0 }), 'warning', 12000);
    lire(); historique();
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act-rep]');
    if (b) repondre(b.dataset.id, b.dataset.actRep);
  });

  /* ---------- Lecture périodique (15 s pour le personnel, 30 s pour l'habitant ; rien quand l'onglet est caché) ---------- */
  function lire() {
    if (document.hidden) return;
    fetch('/api/veille', { cache: 'no-store', credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : null)).then(traiter).catch(() => {});
  }
  function traiter(d) {   // vague 19 (F95) : pour l'habitant, alimenté par le « pouls » groupé (assets/js/continuite.js)
    {
      if (!d) return;
      const ids = new Set((d.urgences || []).filter((x) => x.statut === 'signalee').map((x) => x.id));
      if (staff && connues) for (const id of ids) if (!connues.has(id)) NT.ui.toast(t('vl.nouvelle', { id }), 'danger', 15000);
      connues = ids;
      donnees = d;
      if (NT.ui.rafraichirAlertes) NT.ui.rafraichirAlertes();
      document.dispatchEvent(new CustomEvent('nt:veille', { detail: d }));
    }
  }
  const rythme = () => (NT.leger && NT.leger.actif() ? 120000 : staff ? 15000 : 30000);
  let minuterie = null;
  const planifier = () => { clearTimeout(minuterie); minuterie = setTimeout(() => { lire(); planifier(); }, NT.econome ? NT.econome.delai(rythme()) : rythme()); };
  // vague 19 (F95) : habitant → même lecture groupée que les messages officiels ; personnel → 15 s (urgences médicales en direct)
  if (!staff && NT.pouls && !NT.horsLigne) NT.pouls.ecouter('veille', traiter);
  else {
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { lire(); planifier(); } });
    lire(); planifier();
  }

  /* ---------- Page « Sécurité de vos données » : historique des alertes (#activite) ---------- */
  function historique() {
    const zone = document.getElementById('activite-liste');
    if (!zone) return;
    const r = NT.api('GET', '/api/activite');
    const l = r.statut === 200 ? r.donnees : [];
    const sec = document.getElementById('activite');
    if (sec) sec.hidden = false;
    const titre = document.getElementById('t-activite');
    if (titre) titre.textContent = t('vl.histTitre');
    zone.innerHTML = l.length ? `<ul class="liste-sec">${l.map((a) => `<li><i class="ph-duotone ${a.statut === 'pas_moi' ? 'ph-shield-slash' : a.statut === 'moi' ? 'ph-shield-check' : 'ph-shield-warning'}" aria-hidden="true"></i>
      <div><strong>${E(raisons(a))}</strong><br><span class="doux">${E(NT.ui.dateHeure ? NT.ui.dateHeure(a.date) : a.date)} · ${E(a.appareil || '')} · ${E(t('vl.r.' + a.statut))}</span>
      ${a.statut === 'a_confirmer' ? `<div class="v17-boutons"><button class="btn petit" type="button" data-act-rep="moi" data-id="${E(a.id)}">${E(t('vl.moi'))}</button><button class="btn btn-danger petit" type="button" data-act-rep="pas_moi" data-id="${E(a.id)}">${E(t('vl.pasMoi'))}</button></div>` : ''}
      ${a.statut === 'pas_moi' ? `<p style="margin:.4rem 0 0"><a href="compte.html">${E(t('vl.changerMdp'))}</a></p>` : ''}</div></li>`).join('')}</ul>` : `<p class="doux">${E(t('vl.histVide'))}</p>`;
  }
  historique();
})();
