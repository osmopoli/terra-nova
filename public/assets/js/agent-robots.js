/* Terra Nova — vague 16 (F81) : Centre de sécurité › « Envois automatiques bloqués ».
   Vue administrateur (GET /api/formulaires/robots) : envois refusés (piège rempli, jeton falsifié, rafale), vérifications
   demandées et réussies, renvois rendus sans doublon (F82), par raison, par formulaire et par jour. Les tentatives refusées
   apparaissent aussi dans le journal du bouclier avec le type « Envoi automatique ». */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'rb.titre': 'Envois automatiques bloqués (formulaires publics)', 'rb.intro': 'Chaque formulaire public porte un jeton signé, un champ piège invisible et compte quelques signaux de comportement. Un envoi suspect reçoit une petite vérification ; un robot évident est refusé et journalisé.',
      'rb.kRefusJ': 'Envois refusés aujourd’hui', 'rb.kRefus7': 'Envois refusés (7 jours)', 'rb.kVerif': 'Vérifications demandées (7 jours)', 'rb.kReussies': 'Vérifications réussies (7 jours)',
      'rb.kAcceptes': 'Envois acceptés sans friction (7 jours)', 'rb.kRenvois': 'Renvois rendus sans doublon (7 jours)', 'rb.kDoublons': 'Demandes en double évitées (7 jours)',
      'rb.pourquoi': 'Pourquoi', 'rb.formulaires': 'Quels formulaires', 'rb.nb': 'Nombre', 'rb.refus': 'Refus', 'rb.verifs': 'Vérifications', 'rb.jour': 'Jour', 'rb.parJour': 'Les 7 derniers jours',
      'rb.aucun': 'Rien à signaler.', 'rb.voir': 'Voir les tentatives refusées dans le journal', 'rb.pause': '{n} connexion(s) en pause anti-robots en ce moment',
      'rb.r.piege': 'Champ piège rempli', 'rb.r.jeton-falsifie': 'Jeton falsifié', 'rb.r.pause': 'Rafale d’envois suspects (pause)', 'rb.r.jeton-absent': 'Formulaire sans jeton',
      'rb.r.jeton-expire': 'Formulaire ouvert trop longtemps', 'rb.r.trop-rapide': 'Rempli trop vite', 'rb.r.jeton-rejoue': 'Jeton déjà utilisé', 'rb.r.signaux-absents': 'Aucun signal du navigateur',
      'rb.r.aucune-interaction': 'Aucune interaction (clavier, souris, saisie)',
      'rb.f.demande': 'Demande, contact, signalement', 'rb.f.contribution': 'Question sur les données', 'rb.f.inscription': 'Inscription', 'rb.f.inscription-sans-email': 'Inscription sans e-mail',
      'rb.f.idee': 'Idée', 'rb.f.avis-consultation': 'Avis sur une consultation', 'rb.f.avis-service': 'Avis sur un service', 'rb.f.soutien': 'Soutien', 'rb.f.message-habitant': 'Message à la mairie' },
    en: { 'rb.titre': 'Automated submissions blocked (public forms)', 'rb.intro': 'Every public form carries a signed token, an invisible trap field and counts a few behaviour signals. A suspicious submission gets a quick check; an obvious robot is refused and logged.',
      'rb.kRefusJ': 'Submissions refused today', 'rb.kRefus7': 'Submissions refused (7 days)', 'rb.kVerif': 'Checks requested (7 days)', 'rb.kReussies': 'Checks passed (7 days)',
      'rb.kAcceptes': 'Submissions accepted without friction (7 days)', 'rb.kRenvois': 'Resubmissions returned without duplicate (7 days)', 'rb.kDoublons': 'Duplicate requests avoided (7 days)',
      'rb.pourquoi': 'Why', 'rb.formulaires': 'Which forms', 'rb.nb': 'Count', 'rb.refus': 'Refused', 'rb.verifs': 'Checks', 'rb.jour': 'Day', 'rb.parJour': 'Last 7 days',
      'rb.aucun': 'Nothing to report.', 'rb.voir': 'See refused attempts in the log', 'rb.pause': '{n} connection(s) currently paused by the anti-robot protection',
      'rb.r.piege': 'Trap field filled', 'rb.r.jeton-falsifie': 'Forged token', 'rb.r.pause': 'Burst of suspicious submissions (pause)', 'rb.r.jeton-absent': 'Form without token',
      'rb.r.jeton-expire': 'Form open too long', 'rb.r.trop-rapide': 'Filled too fast', 'rb.r.jeton-rejoue': 'Token already used', 'rb.r.signaux-absents': 'No browser signal',
      'rb.r.aucune-interaction': 'No interaction (keyboard, mouse, typing)',
      'rb.f.demande': 'Request, contact, report', 'rb.f.contribution': 'Question about data', 'rb.f.inscription': 'Registration', 'rb.f.inscription-sans-email': 'Registration without e-mail',
      'rb.f.idee': 'Idea', 'rb.f.avis-consultation': 'Opinion on a consultation', 'rb.f.avis-service': 'Feedback on a service', 'rb.f.soutien': 'Support', 'rb.f.message-habitant': 'Message to the city hall' },
    es: { 'rb.titre': 'Envíos automáticos bloqueados (formularios públicos)', 'rb.intro': 'Cada formulario público lleva un token firmado, un campo trampa invisible y cuenta algunas señales de comportamiento. Un envío sospechoso recibe una pequeña comprobación; un robot evidente se rechaza y se registra.',
      'rb.kRefusJ': 'Envíos rechazados hoy', 'rb.kRefus7': 'Envíos rechazados (7 días)', 'rb.kVerif': 'Comprobaciones pedidas (7 días)', 'rb.kReussies': 'Comprobaciones superadas (7 días)',
      'rb.kAcceptes': 'Envíos aceptados sin fricción (7 días)', 'rb.kRenvois': 'Reenvíos devueltos sin duplicado (7 días)', 'rb.kDoublons': 'Solicitudes duplicadas evitadas (7 días)',
      'rb.pourquoi': 'Por qué', 'rb.formulaires': 'Qué formularios', 'rb.nb': 'Número', 'rb.refus': 'Rechazos', 'rb.verifs': 'Comprobaciones', 'rb.jour': 'Día', 'rb.parJour': 'Últimos 7 días',
      'rb.aucun': 'Nada que señalar.', 'rb.voir': 'Ver los intentos rechazados en el registro', 'rb.pause': '{n} conexión(es) en pausa antirrobots ahora mismo',
      'rb.r.piege': 'Campo trampa rellenado', 'rb.r.jeton-falsifie': 'Token falsificado', 'rb.r.pause': 'Ráfaga de envíos sospechosos (pausa)', 'rb.r.jeton-absent': 'Formulario sin token',
      'rb.r.jeton-expire': 'Formulario abierto demasiado tiempo', 'rb.r.trop-rapide': 'Rellenado demasiado rápido', 'rb.r.jeton-rejoue': 'Token ya utilizado', 'rb.r.signaux-absents': 'Ninguna señal del navegador',
      'rb.r.aucune-interaction': 'Ninguna interacción (teclado, ratón, escritura)',
      'rb.f.demande': 'Solicitud, contacto, aviso', 'rb.f.contribution': 'Pregunta sobre los datos', 'rb.f.inscription': 'Registro', 'rb.f.inscription-sans-email': 'Registro sin correo',
      'rb.f.idee': 'Idea', 'rb.f.avis-consultation': 'Opinión en una consulta', 'rb.f.avis-service': 'Opinión sobre un servicio', 'rb.f.soutien': 'Apoyo', 'rb.f.message-habitant': 'Mensaje al ayuntamiento' },
    ar: { 'rb.titre': 'عمليات إرسال آلية محظورة (النماذج العامة)', 'rb.intro': 'يحمل كل نموذج عام رمزاً موقّعاً وحقلاً مخفياً كفخ، ويحسب بعض إشارات السلوك. يخضع الإرسال المشبوه لتحقق بسيط؛ ويُرفض الروبوت الواضح ويُسجَّل.',
      'rb.kRefusJ': 'إرسالات مرفوضة اليوم', 'rb.kRefus7': 'إرسالات مرفوضة (7 أيام)', 'rb.kVerif': 'تحققات مطلوبة (7 أيام)', 'rb.kReussies': 'تحققات ناجحة (7 أيام)',
      'rb.kAcceptes': 'إرسالات مقبولة دون عائق (7 أيام)', 'rb.kRenvois': 'إعادات إرسال دون تكرار (7 أيام)', 'rb.kDoublons': 'طلبات مكررة تم تجنبها (7 أيام)',
      'rb.pourquoi': 'السبب', 'rb.formulaires': 'النماذج', 'rb.nb': 'العدد', 'rb.refus': 'مرفوضة', 'rb.verifs': 'تحققات', 'rb.jour': 'اليوم', 'rb.parJour': 'آخر 7 أيام',
      'rb.aucun': 'لا شيء يُذكر.', 'rb.voir': 'عرض المحاولات المرفوضة في السجل', 'rb.pause': '{n} اتصال(ات) موقوفة مؤقتاً بالحماية من الروبوتات حالياً',
      'rb.r.piege': 'تم ملء حقل الفخ', 'rb.r.jeton-falsifie': 'رمز مزوّر', 'rb.r.pause': 'سلسلة إرسالات مشبوهة (إيقاف مؤقت)', 'rb.r.jeton-absent': 'نموذج بدون رمز',
      'rb.r.jeton-expire': 'نموذج مفتوح لمدة طويلة', 'rb.r.trop-rapide': 'مُلئ بسرعة كبيرة', 'rb.r.jeton-rejoue': 'رمز مستعمل مسبقاً', 'rb.r.signaux-absents': 'لا توجد إشارة من المتصفح',
      'rb.r.aucune-interaction': 'لا تفاعل (لوحة مفاتيح، فأرة، كتابة)',
      'rb.f.demande': 'طلب، تواصل، بلاغ', 'rb.f.contribution': 'سؤال حول البيانات', 'rb.f.inscription': 'تسجيل', 'rb.f.inscription-sans-email': 'تسجيل بدون بريد',
      'rb.f.idee': 'فكرة', 'rb.f.avis-consultation': 'رأي في استشارة', 'rb.f.avis-service': 'رأي في خدمة', 'rb.f.soutien': 'دعم', 'rb.f.message-habitant': 'رسالة إلى البلدية' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = s => NT.ui.echap(s);
  const kpi = (v, lib, fort) => `<div class="kpi${fort ? ' fort' : ''}"><div class="valeur">${E(v)}</div><div class="libelle">${E(lib)}</div></div>`;
  const tableau = (cap, titre, o, pref) => {
    const l = Object.entries(o || {}).sort((a, b) => b[1] - a[1]);
    return `<div><h3>${E(titre)}</h3>${l.length ? `<table class="table-sec"><caption class="sr-only">${E(cap)}</caption>
      <thead><tr><th scope="col">${E(titre)}</th><th scope="col">${E(t('rb.nb'))}</th></tr></thead>
      <tbody>${l.map(([k, n]) => `<tr><td>${E(t(pref + k, null) === pref + k ? k : t(pref + k))}</td><td>${E(n)}</td></tr>`).join('')}</tbody></table>` : `<p class="doux">${E(t('rb.aucun'))}</p>`}</div>`;
  };

  NT.pret(() => {
    if (!NT.auth.aRole('admin')) return;
    const ancre = document.getElementById('cs-kpis');
    if (!ancre) return;
    const r = NT.api('GET', '/api/formulaires/robots');
    if (r.statut !== 200) return;
    const d = r.donnees, s = d.semaine;
    const sec = document.createElement('section');
    sec.className = 'bloc-sec'; sec.id = 'cs-robots'; sec.setAttribute('aria-labelledby', 't-robots');
    const raisons = Object.assign({}, d.raisonsRefus);
    Object.entries(d.raisonsVerification || {}).forEach(([k, n]) => { raisons[k] = (raisons[k] || 0) + n; });
    const formulaires = Object.assign({}, d.formulairesRefus);
    Object.entries(d.formulairesVerification || {}).forEach(([k, n]) => { formulaires[k] = (formulaires[k] || 0) + n; });
    sec.innerHTML = `<h2 id="t-robots"><i class="ph-duotone ph-robot" aria-hidden="true"></i> ${E(t('rb.titre'))}</h2>
      <p class="doux">${E(t('rb.intro'))}</p>
      <div class="kpis-sec">${kpi(d.aujourdhui.refus, t('rb.kRefusJ'), d.aujourdhui.refus > 0) + kpi(s.refus, t('rb.kRefus7')) + kpi(s.verifications, t('rb.kVerif')) +
        kpi(s.reussies, t('rb.kReussies')) + kpi(s.acceptes, t('rb.kAcceptes')) + kpi(s.renvois, t('rb.kRenvois')) + kpi(s.doublons, t('rb.kDoublons'))}</div>
      ${d.ipEnPause ? `<p class="sg-note"><i class="ph-duotone ph-pause-circle" aria-hidden="true"></i><span>${E(t('rb.pause', { n: d.ipEnPause }))}</span></p>` : ''}
      <div class="grille-2 rb-grille">${tableau(t('rb.pourquoi'), t('rb.pourquoi'), raisons, 'rb.r.')}${tableau(t('rb.formulaires'), t('rb.formulaires'), formulaires, 'rb.f.')}</div>
      <h3>${E(t('rb.parJour'))}</h3>
      <div class="table-defile"><table class="table-sec"><caption class="sr-only">${E(t('rb.parJour'))}</caption>
        <thead><tr><th scope="col">${E(t('rb.jour'))}</th><th scope="col">${E(t('rb.refus'))}</th><th scope="col">${E(t('rb.verifs'))}</th></tr></thead>
        <tbody>${Object.entries(d.parJour).map(([j, v]) => `<tr><td>${E(NT.ui.date(j + 'T12:00:00', { weekday: 'short', day: 'numeric', month: 'short' }))}</td><td>${E(v.refus)}</td><td>${E(v.verifications)}</td></tr>`).join('')}</tbody></table></div>
      <p><button class="btn" type="button" id="rb-voir"><i class="ph ph-list-magnifying-glass" aria-hidden="true"></i>${E(t('rb.voir'))}</button></p>`;
    ancre.after(sec);
    sec.querySelector('#rb-voir').addEventListener('click', () => {
      const sel = document.getElementById('cs-type');
      if (!sel) return;
      sel.value = 'robot'; sel.dispatchEvent(new Event('change'));
      sel.focus();
    });
  });
})();
