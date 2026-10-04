/* Terra Nova — vague 20 (F100, Direction du Numérique) : « Derniers événements de sécurité » des agents.
   Deux affichages : la page complète (agent-evenements.html : filtres gravité / type / période / statut, frise, « marquer comme
   vu », « marquer comme traité » avec une note, lien vers le détail) et le bloc compact de l'accueil des agents (agent.html).
   GET /api/veille-securite : données déjà minimisées par le serveur pour un agent (IP réduite, e-mail masqué, noms remplacés). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'ev.titre': 'Derniers événements de sécurité', 'nav.evenements': 'Sécurité', 'ev.intro': 'Le suivi quotidien : ce qui a été bloqué, ce qui demande votre attention et ce qui est déjà traité. Les données personnelles sont réduites au nécessaire.',
      'ev.g.info': 'Information', 'ev.g.faible': 'Faible', 'ev.g.moyenne': 'Moyenne', 'ev.g.haute': 'Haute', 'ev.g.critique': 'Critique', 'ev.ty.blocage': 'Tentative bloquée', 'ev.ty.incident': 'Incident', 'ev.ty.verrouillage': 'Verrouillage',
      'ev.ty.appareil': 'Nouvel appareil', 'ev.ty.habilitation': 'Données réservées', 'ev.ty.compte': 'Compte', 'ev.ty.integrite': 'Intégrité', 'ev.st.nouveau': 'Nouveau', 'ev.st.vu': 'Vu', 'ev.st.traite': 'Traité',
      'ev.f.gravite': 'Gravité minimale', 'ev.f.type': 'Type', 'ev.f.periode': 'Période', 'ev.f.statut': 'Statut', 'ev.toutes': 'Toutes', 'ev.tous': 'Tous', 'ev.p.24h': 'Dernières 24 heures', 'ev.p.7j': '7 derniers jours', 'ev.p.30j': '30 derniers jours',
      'ev.nonVus': '{n} non vu(s)', 'ev.aTraiter': 'À traiter par gravité', 'ev.toutVu': 'Tout marquer comme vu', 'ev.vu': 'Marquer comme vu', 'ev.traiter': 'Marquer comme traité', 'ev.note': 'Ce qui a été fait', 'ev.confirmer': 'Confirmer', 'ev.annuler': 'Annuler',
      'ev.detail': 'Voir le détail', 'ev.partie': 'Partie concernée : {p}', 'ev.compte': 'Compte : {c}', 'ev.ip': 'Réseau : {i}', 'ev.agent': 'Agent : {a}', 'ev.par': 'Traité par {p} : {n}', 'ev.aucun': 'Aucun événement sur cette période : rien à signaler.',
      'ev.minimise': 'Données réduites : adresses IP et e-mails masqués, noms des habitants et des autres agents remplacés. L’administrateur voit le détail dans le Centre de sécurité.', 'ev.nb': '{n} événement(s)',
      'ev.voirTout': 'Voir tous les événements', 'ev.compactTitre': 'Derniers événements de sécurité', 'ev.toutVuOk': 'Tout est marqué comme vu.', 'ev.traiteOk': 'Événement marqué traité.',
      'ev.pa.demandes': 'Demandes', 'ev.pa.connexion': 'Connexion', 'ev.pa.comptes': 'Comptes', 'ev.pa.donnees': 'Données', 'ev.pa.participation': 'Participation', 'ev.pa.sauvegardes': 'Sauvegardes', 'ev.pa.plateforme': 'Plateforme', 'ev.pa.api': 'Plateforme', 'ev.pa.exports': 'Exports',
      'ev.s.csrf': 'Requête venue d’un autre site bloquée (protection contre la falsification)', 'ev.s.debit': 'Trop de tentatives en peu de temps : envois ralentis', 'ev.s.validation': 'Données refusées : format inattendu', 'ev.s.acces': 'Accès refusé à une partie réservée (règles de rôle)',
      'ev.s.robot': 'Envoi automatique (robot) bloqué sur un formulaire', 'ev.s.verrouillage': 'Compte verrouillé après plusieurs mots de passe incorrects', 'ev.s.tentative_bloquee': 'Nouvelle tentative de connexion sur un compte verrouillé',
      'ev.s.nouvel_appareil': 'Connexion depuis un nouvel appareil (l’habitant a été prévenu)', 'ev.s.acces_sensible_refuse': 'Consultation de données réservées refusée (agent non habilité)', 'ev.s.cle_suspecte': 'Clé d’accès suspecte refusée',
      'ev.s.sessions_revoquees': 'Toutes les sessions d’un compte ont été fermées', 'ev.s.activite_contestee': 'Un habitant indique « Ce n’était pas moi » : autres sessions fermées', 'ev.s.habilitation_accordee': 'Habilitation aux données réservées accordée à un agent',
      'ev.s.habilitation_retiree': 'Habilitation aux données réservées retirée à un agent', 'ev.s.deblocage': 'Compte débloqué par un agent', 'ev.s.acces_sensible': 'Consultation de données réservées par un agent habilité' },
    en: { 'ev.titre': 'Latest security events', 'nav.evenements': 'Security', 'ev.intro': 'Daily follow-up: what was blocked, what needs your attention and what has already been handled. Personal data is kept to the minimum.',
      'ev.g.info': 'Information', 'ev.g.faible': 'Low', 'ev.g.moyenne': 'Medium', 'ev.g.haute': 'High', 'ev.g.critique': 'Critical', 'ev.ty.blocage': 'Blocked attempt', 'ev.ty.incident': 'Incident', 'ev.ty.verrouillage': 'Lockout',
      'ev.ty.appareil': 'New device', 'ev.ty.habilitation': 'Restricted data', 'ev.ty.compte': 'Account', 'ev.ty.integrite': 'Integrity', 'ev.st.nouveau': 'New', 'ev.st.vu': 'Seen', 'ev.st.traite': 'Handled',
      'ev.f.gravite': 'Minimum severity', 'ev.f.type': 'Type', 'ev.f.periode': 'Period', 'ev.f.statut': 'Status', 'ev.toutes': 'All', 'ev.tous': 'All', 'ev.p.24h': 'Last 24 hours', 'ev.p.7j': 'Last 7 days', 'ev.p.30j': 'Last 30 days',
      'ev.nonVus': '{n} unseen', 'ev.aTraiter': 'To handle by severity', 'ev.toutVu': 'Mark all as seen', 'ev.vu': 'Mark as seen', 'ev.traiter': 'Mark as handled', 'ev.note': 'What was done', 'ev.confirmer': 'Confirm', 'ev.annuler': 'Cancel',
      'ev.detail': 'See details', 'ev.partie': 'Area concerned: {p}', 'ev.compte': 'Account: {c}', 'ev.ip': 'Network: {i}', 'ev.agent': 'Staff member: {a}', 'ev.par': 'Handled by {p}: {n}', 'ev.aucun': 'No event over this period: nothing to report.',
      'ev.minimise': 'Reduced data: IP addresses and e-mails masked, names of residents and other staff replaced. The administrator sees details in the Security centre.', 'ev.nb': '{n} event(s)',
      'ev.voirTout': 'See all events', 'ev.compactTitre': 'Latest security events', 'ev.toutVuOk': 'Everything is marked as seen.', 'ev.traiteOk': 'Event marked as handled.',
      'ev.pa.demandes': 'Requests', 'ev.pa.connexion': 'Sign-in', 'ev.pa.comptes': 'Accounts', 'ev.pa.donnees': 'Data', 'ev.pa.participation': 'Participation', 'ev.pa.sauvegardes': 'Backups', 'ev.pa.plateforme': 'Platform', 'ev.pa.api': 'Platform', 'ev.pa.exports': 'Exports',
      'ev.s.csrf': 'Request from another website blocked (forgery protection)', 'ev.s.debit': 'Too many attempts in a short time: submissions slowed down', 'ev.s.validation': 'Data refused: unexpected format', 'ev.s.acces': 'Access refused to a restricted area (role rules)',
      'ev.s.robot': 'Automated (bot) submission blocked on a form', 'ev.s.verrouillage': 'Account locked after several wrong passwords', 'ev.s.tentative_bloquee': 'New sign-in attempt on a locked account',
      'ev.s.nouvel_appareil': 'Sign-in from a new device (the resident was notified)', 'ev.s.acces_sensible_refuse': 'Restricted data access refused (staff member not authorised)', 'ev.s.cle_suspecte': 'Suspicious passkey refused',
      'ev.s.sessions_revoquees': 'All sessions of an account were closed', 'ev.s.activite_contestee': 'A resident says “It was not me”: other sessions closed', 'ev.s.habilitation_accordee': 'Restricted data authorisation granted to a staff member',
      'ev.s.habilitation_retiree': 'Restricted data authorisation withdrawn from a staff member', 'ev.s.deblocage': 'Account unlocked by a staff member', 'ev.s.acces_sensible': 'Restricted data viewed by an authorised staff member' },
    es: { 'ev.titre': 'Últimos eventos de seguridad', 'nav.evenements': 'Seguridad', 'ev.intro': 'El seguimiento diario: lo que se bloqueó, lo que requiere su atención y lo que ya está tratado. Los datos personales se reducen a lo necesario.',
      'ev.g.info': 'Información', 'ev.g.faible': 'Baja', 'ev.g.moyenne': 'Media', 'ev.g.haute': 'Alta', 'ev.g.critique': 'Crítica', 'ev.ty.blocage': 'Intento bloqueado', 'ev.ty.incident': 'Incidente', 'ev.ty.verrouillage': 'Bloqueo de cuenta',
      'ev.ty.appareil': 'Nuevo dispositivo', 'ev.ty.habilitation': 'Datos reservados', 'ev.ty.compte': 'Cuenta', 'ev.ty.integrite': 'Integridad', 'ev.st.nouveau': 'Nuevo', 'ev.st.vu': 'Visto', 'ev.st.traite': 'Tratado',
      'ev.f.gravite': 'Gravedad mínima', 'ev.f.type': 'Tipo', 'ev.f.periode': 'Periodo', 'ev.f.statut': 'Estado', 'ev.toutes': 'Todas', 'ev.tous': 'Todos', 'ev.p.24h': 'Últimas 24 horas', 'ev.p.7j': 'Últimos 7 días', 'ev.p.30j': 'Últimos 30 días',
      'ev.nonVus': '{n} sin ver', 'ev.aTraiter': 'Por tratar según gravedad', 'ev.toutVu': 'Marcar todo como visto', 'ev.vu': 'Marcar como visto', 'ev.traiter': 'Marcar como tratado', 'ev.note': 'Qué se hizo', 'ev.confirmer': 'Confirmar', 'ev.annuler': 'Cancelar',
      'ev.detail': 'Ver el detalle', 'ev.partie': 'Parte afectada: {p}', 'ev.compte': 'Cuenta: {c}', 'ev.ip': 'Red: {i}', 'ev.agent': 'Agente: {a}', 'ev.par': 'Tratado por {p}: {n}', 'ev.aucun': 'Ningún evento en este periodo: nada que señalar.',
      'ev.minimise': 'Datos reducidos: direcciones IP y correos ocultos, nombres de habitantes y de otros agentes sustituidos. El administrador ve el detalle en el Centro de seguridad.', 'ev.nb': '{n} evento(s)',
      'ev.voirTout': 'Ver todos los eventos', 'ev.compactTitre': 'Últimos eventos de seguridad', 'ev.toutVuOk': 'Todo está marcado como visto.', 'ev.traiteOk': 'Evento marcado como tratado.',
      'ev.pa.demandes': 'Solicitudes', 'ev.pa.connexion': 'Conexión', 'ev.pa.comptes': 'Cuentas', 'ev.pa.donnees': 'Datos', 'ev.pa.participation': 'Participación', 'ev.pa.sauvegardes': 'Copias de seguridad', 'ev.pa.plateforme': 'Plataforma', 'ev.pa.api': 'Plataforma', 'ev.pa.exports': 'Exportaciones',
      'ev.s.csrf': 'Solicitud procedente de otro sitio bloqueada (protección contra falsificación)', 'ev.s.debit': 'Demasiados intentos en poco tiempo: envíos ralentizados', 'ev.s.validation': 'Datos rechazados: formato inesperado', 'ev.s.acces': 'Acceso denegado a una parte reservada (reglas de rol)',
      'ev.s.robot': 'Envío automático (robot) bloqueado en un formulario', 'ev.s.verrouillage': 'Cuenta bloqueada tras varias contraseñas incorrectas', 'ev.s.tentative_bloquee': 'Nuevo intento de conexión en una cuenta bloqueada',
      'ev.s.nouvel_appareil': 'Conexión desde un nuevo dispositivo (se avisó al habitante)', 'ev.s.acces_sensible_refuse': 'Consulta de datos reservados denegada (agente no habilitado)', 'ev.s.cle_suspecte': 'Clave de acceso sospechosa rechazada',
      'ev.s.sessions_revoquees': 'Se cerraron todas las sesiones de una cuenta', 'ev.s.activite_contestee': 'Un habitante indica «No era yo»: otras sesiones cerradas', 'ev.s.habilitation_accordee': 'Habilitación a datos reservados concedida a un agente',
      'ev.s.habilitation_retiree': 'Habilitación a datos reservados retirada a un agente', 'ev.s.deblocage': 'Cuenta desbloqueada por un agente', 'ev.s.acces_sensible': 'Consulta de datos reservados por un agente habilitado' },
    ar: { 'ev.titre': 'آخر الأحداث الأمنية', 'nav.evenements': 'الأمن', 'ev.intro': 'المتابعة اليومية: ما تم حظره، وما يحتاج انتباهك، وما تمت معالجته. البيانات الشخصية مقلّصة إلى الضروري.',
      'ev.g.info': 'معلومة', 'ev.g.faible': 'منخفضة', 'ev.g.moyenne': 'متوسطة', 'ev.g.haute': 'عالية', 'ev.g.critique': 'حرجة', 'ev.ty.blocage': 'محاولة محظورة', 'ev.ty.incident': 'حادث', 'ev.ty.verrouillage': 'قفل حساب',
      'ev.ty.appareil': 'جهاز جديد', 'ev.ty.habilitation': 'بيانات محفوظة', 'ev.ty.compte': 'حساب', 'ev.ty.integrite': 'السلامة', 'ev.st.nouveau': 'جديد', 'ev.st.vu': 'تم الاطلاع', 'ev.st.traite': 'تمت المعالجة',
      'ev.f.gravite': 'الحد الأدنى للخطورة', 'ev.f.type': 'النوع', 'ev.f.periode': 'الفترة', 'ev.f.statut': 'الحالة', 'ev.toutes': 'الكل', 'ev.tous': 'الكل', 'ev.p.24h': 'آخر 24 ساعة', 'ev.p.7j': 'آخر 7 أيام', 'ev.p.30j': 'آخر 30 يوماً',
      'ev.nonVus': '{n} غير مطّلع عليها', 'ev.aTraiter': 'للمعالجة حسب الخطورة', 'ev.toutVu': 'تعليم الكل كمطّلع عليه', 'ev.vu': 'تعليم كمطّلع عليه', 'ev.traiter': 'تعليم كمعالج', 'ev.note': 'ما تم القيام به', 'ev.confirmer': 'تأكيد', 'ev.annuler': 'إلغاء',
      'ev.detail': 'عرض التفاصيل', 'ev.partie': 'الجزء المعني: {p}', 'ev.compte': 'الحساب: {c}', 'ev.ip': 'الشبكة: {i}', 'ev.agent': 'الموظف: {a}', 'ev.par': 'عالجه {p}: {n}', 'ev.aucun': 'لا أحداث في هذه الفترة: لا شيء يُذكر.',
      'ev.minimise': 'بيانات مقلّصة: عناوين IP والبريد مخفية، وأسماء السكان والموظفين الآخرين مستبدلة. يرى المسؤول التفاصيل في مركز الأمن.', 'ev.nb': '{n} حدث',
      'ev.voirTout': 'عرض كل الأحداث', 'ev.compactTitre': 'آخر الأحداث الأمنية', 'ev.toutVuOk': 'تم تعليم الكل كمطّلع عليه.', 'ev.traiteOk': 'تم تعليم الحدث كمعالج.',
      'ev.pa.demandes': 'الطلبات', 'ev.pa.connexion': 'تسجيل الدخول', 'ev.pa.comptes': 'الحسابات', 'ev.pa.donnees': 'البيانات', 'ev.pa.participation': 'المشاركة', 'ev.pa.sauvegardes': 'النسخ الاحتياطية', 'ev.pa.plateforme': 'المنصة', 'ev.pa.api': 'المنصة', 'ev.pa.exports': 'التصدير',
      'ev.s.csrf': 'تم حظر طلب قادم من موقع آخر (حماية من التزوير)', 'ev.s.debit': 'محاولات كثيرة في وقت قصير: تم إبطاء الإرسال', 'ev.s.validation': 'بيانات مرفوضة: صيغة غير متوقعة', 'ev.s.acces': 'رفض الوصول إلى جزء محفوظ (قواعد الأدوار)',
      'ev.s.robot': 'تم حظر إرسال آلي (روبوت) في استمارة', 'ev.s.verrouillage': 'قُفل حساب بعد عدة كلمات مرور خاطئة', 'ev.s.tentative_bloquee': 'محاولة دخول جديدة على حساب مقفل',
      'ev.s.nouvel_appareil': 'دخول من جهاز جديد (تم تنبيه الساكن)', 'ev.s.acces_sensible_refuse': 'رفض الاطلاع على بيانات محفوظة (موظف غير مؤهل)', 'ev.s.cle_suspecte': 'رفض مفتاح دخول مشبوه',
      'ev.s.sessions_revoquees': 'أُغلقت كل جلسات حساب', 'ev.s.activite_contestee': 'ساكن يقول «لم أكن أنا»: أُغلقت الجلسات الأخرى', 'ev.s.habilitation_accordee': 'مُنح موظف تأهيلاً للبيانات المحفوظة',
      'ev.s.habilitation_retiree': 'سُحب تأهيل البيانات المحفوظة من موظف', 'ev.s.deblocage': 'فتح موظف حساباً مقفلاً', 'ev.s.acces_sensible': 'اطلاع موظف مؤهل على بيانات محفوظة' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const $ = (id) => document.getElementById(id);
  const zone = () => $('ev-zone');
  const compact = () => zone() && zone().dataset.mode === 'compact';
  const ICONE = { info: 'ph-info', faible: 'ph-shield', moyenne: 'ph-shield-warning', haute: 'ph-warning', critique: 'ph-warning-octagon' };
  const ICONE_T = { blocage: 'ph-hand-palm', incident: 'ph-siren', verrouillage: 'ph-lock-key', appareil: 'ph-device-mobile', habilitation: 'ph-folder-lock', compte: 'ph-user-circle-gear', integrite: 'ph-seal-warning' };
  let D = null;
  const f = { periode: '7j', gravite: '', type: '', statut: '' };

  function phrase(e) {
    if (e.type === 'incident') return t('ev.ty.incident') + ' · ' + e.phrase.replace(/^Incident\s+/, '');
    if (e.type === 'integrite') return e.phrase;
    const k = 'ev.s.' + e.source;
    const tr = NT.t(k, null, '');
    return tr && tr !== k ? tr : e.phrase;
  }
  function charger() {
    const q = compact() ? 'periode=7j' : Object.entries(f).filter(([, v]) => v).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
    const r = NT.api('GET', '/api/veille-securite?' + q);
    if (r.statut !== 200) { zone().innerHTML = `<p class="vide">${E((r.donnees && r.donnees.erreur) || '')}</p>`; return; }
    D = r.donnees; rendre();
  }
  function item(e) {
    const details = [e.partie ? t('ev.partie', { p: NT.t('ev.pa.' + e.partie, null, e.partie) }) : '', e.compte ? t('ev.compte', { c: e.compte }) : '', e.ip ? t('ev.ip', { i: e.ip }) : '', e.agent ? t('ev.agent', { a: e.agent }) : ''].filter(Boolean);
    return `<li class="ev-item ev-${E(e.gravite)} ev-st-${E(e.statut)}" id="ev-${E(e.id)}" tabindex="-1">
      <span class="ev-grav ev-grav-${E(e.gravite)}"><i class="ph-duotone ${ICONE[e.gravite]}" aria-hidden="true"></i>${E(t('ev.g.' + e.gravite))}</span>
      <div class="ev-corps"><p class="ev-phrase"><i class="ph ${ICONE_T[e.type] || 'ph-shield'}" aria-hidden="true"></i><strong>${E(phrase(e))}</strong></p>
        <p class="ev-meta"><time datetime="${E(e.date)}" title="${E(NT.ui.dateHeure(e.date))}">${E(NT.ui.depuis(e.date))}</time> · ${E(t('ev.ty.' + e.type))} · <span class="ev-st ev-st-b-${E(e.statut)}">${E(t('ev.st.' + e.statut))}</span></p>
        ${!compact() && details.length ? `<p class="ev-details">${details.map(E).join(' · ')}</p>` : ''}${!compact() && e.detail ? `<p class="ev-details doux" lang="fr">${E(e.detail)}</p>` : ''}
        ${e.traitement && !compact() ? `<p class="ev-details">${E(t('ev.par', { p: e.traitement.par, n: e.traitement.note || '' }))}</p>` : ''}
        <div class="ev-actions">${e.statut === 'nouveau' ? `<button type="button" class="btn petit" data-ev-vu="${E(e.id)}"><i class="ph ph-eye" aria-hidden="true"></i>${E(t('ev.vu'))}</button>` : ''}
          ${!compact() && e.statut !== 'traite' && e.type !== 'incident' ? `<button type="button" class="btn petit" data-ev-traiter="${E(e.id)}" aria-expanded="false"><i class="ph ph-check" aria-hidden="true"></i>${E(t('ev.traiter'))}</button>` : ''}
          ${e.lien ? `<a class="btn petit" href="${E(e.lien)}"><i class="ph ph-arrow-right" aria-hidden="true"></i>${E(t('ev.detail'))}</a>` : ''}</div>
        ${!compact() ? `<form class="ev-traiter" data-ev-form="${E(e.id)}" hidden><div class="champ"><label for="ev-n-${E(e.id)}">${E(t('ev.note'))}</label><input id="ev-n-${E(e.id)}" maxlength="300"></div>
          <div class="ev-actions"><button class="btn btn-primaire petit" type="submit">${E(t('ev.confirmer'))}</button><button class="btn petit" type="button" data-ev-fermer="${E(e.id)}">${E(t('ev.annuler'))}</button></div></form>` : ''}</div></li>`;
  }
  function rendre() {
    if (compact()) {
      const l = D.evenements.filter((e) => e.statut !== 'traite').slice(0, 5);
      zone().innerHTML = `<p class="ev-resume"><span class="ev-nonvus${D.nonVus ? ' actif' : ''}">${E(t('ev.nonVus', { n: D.nonVus }))}</span>${['critique', 'haute', 'moyenne'].filter((g) => D.parGravite[g]).map((g) => ` <span class="ev-grav ev-grav-${g}"><i class="ph-duotone ${ICONE[g]}" aria-hidden="true"></i>${E(t('ev.g.' + g))} · ${D.parGravite[g]}</span>`).join('')}</p>
        ${l.length ? `<ol class="ev-liste compact">${l.map(item).join('')}</ol>` : `<p class="vide">${E(t('ev.aucun'))}</p>`}
        <p><a class="btn" href="agent-evenements.html"><i class="ph ph-shield-check" aria-hidden="true"></i>${E(t('ev.voirTout'))}</a></p>`;
      return;
    }
    const opt = (v, l, sel) => `<option value="${E(v)}"${v === sel ? ' selected' : ''}>${E(l)}</option>`;
    zone().innerHTML = `<form class="ev-filtres" id="ev-filtres" role="search" aria-label="${E(t('ev.f.type'))}">
        <div class="champ"><label for="ev-f-gravite">${E(t('ev.f.gravite'))}</label><select id="ev-f-gravite">${opt('', t('ev.toutes'), f.gravite)}${D.gravites.map((g) => opt(g, t('ev.g.' + g), f.gravite)).join('')}</select></div>
        <div class="champ"><label for="ev-f-type">${E(t('ev.f.type'))}</label><select id="ev-f-type">${opt('', t('ev.tous'), f.type)}${D.types.map((ty) => opt(ty, t('ev.ty.' + ty), f.type)).join('')}</select></div>
        <div class="champ"><label for="ev-f-periode">${E(t('ev.f.periode'))}</label><select id="ev-f-periode">${['24h', '7j', '30j'].map((p) => opt(p, t('ev.p.' + p), f.periode)).join('')}</select></div>
        <div class="champ"><label for="ev-f-statut">${E(t('ev.f.statut'))}</label><select id="ev-f-statut">${opt('', t('ev.tous'), f.statut)}${['nouveau', 'vu', 'traite'].map((s) => opt(s, t('ev.st.' + s), f.statut)).join('')}</select></div></form>
      <div class="ev-barre"><p class="ev-resume" role="status"><span class="ev-nonvus${D.nonVus ? ' actif' : ''}">${E(t('ev.nonVus', { n: D.nonVus }))}</span> · ${E(t('ev.nb', { n: D.total }))}
        <span class="ev-agraver"> · ${E(t('ev.aTraiter'))} : ${['critique', 'haute', 'moyenne', 'faible'].map((g) => `<span class="ev-grav ev-grav-${g}"><i class="ph-duotone ${ICONE[g]}" aria-hidden="true"></i>${E(t('ev.g.' + g))} ${D.parGravite[g] || 0}</span>`).join(' ')}</span></p>
        ${D.nonVus ? `<button type="button" class="btn" id="ev-tout-vu"><i class="ph ph-checks" aria-hidden="true"></i>${E(t('ev.toutVu'))}</button>` : ''}</div>
      ${D.minimise ? `<p class="doux ev-mini"><i class="ph ph-eye-slash" aria-hidden="true"></i> ${E(t('ev.minimise'))}</p>` : ''}
      ${D.evenements.length ? `<ol class="ev-liste">${D.evenements.map(item).join('')}</ol>` : `<p class="vide">${E(t('ev.aucun'))}</p>`}`;
    const cible = location.hash && document.getElementById('ev-' + decodeURIComponent(location.hash.slice(1)));
    if (cible) { cible.classList.add('ev-cible'); cible.focus(); }
  }
  function marquer(ids) {
    const r = NT.api('POST', '/api/veille-securite/vu', { ids });
    if (r.statut === 200) { charger(); if (NT.v20lire) NT.v20lire(); }
    return r;
  }
  document.addEventListener('change', (e) => { if (e.target.closest && e.target.closest('#ev-filtres')) { f[e.target.id.replace('ev-f-', '')] = e.target.value; charger(); const el = $(e.target.id); if (el) el.focus(); } });
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('button'); if (!b) return;
    if (b.dataset.evVu) { const suiv = b.closest('.ev-item').nextElementSibling; marquer([b.dataset.evVu]); const s = suiv && document.getElementById(suiv.id); (s || zone()).focus && s && s.focus(); }
    else if (b.id === 'ev-tout-vu') { if (marquer(D.evenements.filter((x) => x.statut === 'nouveau').map((x) => x.id)).statut === 200) NT.ui.toast(t('ev.toutVuOk'), 'success'); }
    else if (b.dataset.evTraiter) { const fo = document.querySelector(`[data-ev-form="${CSS.escape(b.dataset.evTraiter)}"]`); fo.hidden = false; b.setAttribute('aria-expanded', 'true'); fo.querySelector('input').focus(); }
    else if (b.dataset.evFermer) { const fo = document.querySelector(`[data-ev-form="${CSS.escape(b.dataset.evFermer)}"]`); fo.hidden = true; const bt = document.querySelector(`[data-ev-traiter="${CSS.escape(b.dataset.evFermer)}"]`); bt.setAttribute('aria-expanded', 'false'); bt.focus(); }
  });
  document.addEventListener('submit', (e) => {
    const fo = e.target.closest && e.target.closest('[data-ev-form]');
    if (e.target.id === 'ev-filtres') { e.preventDefault(); return; }
    if (!fo) return;
    e.preventDefault();
    const r = NT.api('POST', '/api/veille-securite/traite', { id: fo.dataset.evForm, note: fo.querySelector('input').value });
    if (r.statut !== 200) { NT.ui.toast((r.donnees && r.donnees.erreur) || NT.t('ui.erreur'), 'danger', 8000); fo.querySelector('input').focus(); return; }
    NT.ui.toast(t('ev.traiteOk'), 'success'); const id = fo.dataset.evForm; charger(); if (NT.v20lire) NT.v20lire(); const it = document.getElementById('ev-' + id); if (it) it.focus();
  });
  function demarrer() { if (zone()) charger(); }
  if (document.readyState === 'complete') demarrer(); else document.addEventListener('DOMContentLoaded', demarrer);
})();
