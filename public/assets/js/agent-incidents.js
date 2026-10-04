/* Terra Nova — vague 17 (F85) : Centre de sécurité › « Incidents », « Comptes et adresses sous surveillance »,
   « Intégrité des données » (administrateur).
   - Incidents : frise (ce qui a été observé, ce que la plateforme a fait), gravité, parties touchées, « Marquer résolu ».
   - Surveillance : score de risque par compte / adresse, signaux, mesures en cours (confirmation du mot de passe,
     ralentissement, sessions fermées), « Lever les mesures ».
   - Intégrité : registre d'audit scellé (« chaîne intacte » / « rompue à l'entrée N »), simulation sans rien abîmer,
     contrôles de cohérence avec réparations sûres à cocher puis confirmer.
   Les détails techniques (événements, anomalies) restent dans la langue du journal (français), comme le journal d'audit. */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'ic.titre': 'Incidents de sécurité', 'ic.intro': 'Activité inhabituelle détectée et réponses automatiques : chaque incident garde ce qui a été observé et ce que la plateforme a fait. L’usage normal n’est jamais ralenti.',
      'ic.kOuverts': 'Incidents ouverts', 'ic.kCritiques': 'Hauts ou critiques ouverts', 'ic.kSurv': 'Comptes ou adresses sous surveillance', 'ic.kChaine': 'Registre d’audit',
      'ic.fOuverts': 'Ouverts', 'ic.fResolus': 'Résolus', 'ic.fTous': 'Tous', 'ic.aucun': 'Aucun incident dans cette liste.', 'ic.ouvert': 'Ouvert le {d}', 'ic.maj': 'mis à jour {d}', 'ic.resoluPar': 'Résolu par {p} le {d}',
      'ic.resoudre': 'Marquer résolu', 'ic.note': 'Ce qui a été fait (visible dans le journal)', 'ic.confirmer': 'Confirmer', 'ic.annuler': 'Annuler', 'ic.resoluOk': 'Incident {id} marqué résolu.', 'ic.parties': 'Parties touchées',
      'ic.g.faible': 'Faible', 'ic.g.moyenne': 'Moyenne', 'ic.g.haute': 'Haute', 'ic.g.critique': 'Critique', 'ic.sujet.compte': 'Compte', 'ic.sujet.ip': 'Adresse', 'ic.sujet.donnees': 'Données',
      'ic.survTitre': 'Comptes et adresses sous surveillance', 'ic.survIntro': 'Score de risque sur 30 minutes. À partir de {a} : mot de passe redemandé pour les actions sensibles et alerte à l’habitant ; {b} : ralentissement temporaire ; {c} : sessions fermées.',
      'ic.survVide': 'Aucun compte ni aucune adresse sous surveillance en ce moment.', 'ic.cSujet': 'Compte ou adresse', 'ic.cScore': 'Score', 'ic.cSignaux': 'Signaux', 'ic.cMesures': 'Mesures', 'ic.cAction': 'Action',
      'ic.lever': 'Lever les mesures', 'ic.leverOk': 'Mesures levées.', 'ic.ralenti': 'ralenti jusqu’à {h}', 'ic.n.normal': 'Normal', 'ic.n.surveille': 'À surveiller', 'ic.n.eleve': 'Élevé', 'ic.n.critique': 'Critique',
      'ig.titre': 'Intégrité des données', 'ig.intro': 'Chaque entrée du journal d’audit est scellée et enchaînée à la précédente (SHA-256 + sceau HMAC) : une modification, une suppression ou un ajout direct dans la base casse la chaîne. Les données métier sont contrôlées toutes les {h} h.',
      'ig.verifier': 'Vérifier la chaîne maintenant', 'ig.simuler': 'Simuler une modification (démonstration)', 'ig.controler': 'Lancer un contrôle complet', 'ig.intacte': 'Chaîne intacte', 'ig.rompue': 'Chaîne rompue à l’entrée n° {n}',
      'ig.entrees': '{n} entrées vérifiées en {ms} ms', 'ig.horsRegistre': '{n} entrée(s) ajoutée(s) hors du registre', 'ig.simulation': 'Simulation : rien n’a été modifié dans la base. Voici ce que verrait l’administrateur si l’entrée n° {n} avait été changée.',
      'ig.dernier': 'Dernier contrôle : {d} ({par}) · prochain contrôle automatique : {p}', 'ig.aucunControle': 'Premier contrôle automatique dans quelques secondes.', 'ig.toutBon': 'Aucune incohérence dans les données métier.',
      'ig.nbAnom': '{n} incohérence(s) trouvée(s), dont {r} réparable(s) sans risque.', 'ig.cProbleme': 'Problème', 'ig.cOu': 'Où', 'ig.cDetail': 'Détail', 'ig.cRepa': 'Réparation proposée', 'ig.aucuneRepa': 'À vérifier à la main',
      'ig.appliquer': 'Appliquer les réparations cochées', 'ig.confirmRepa': 'Appliquer {n} réparation(s) ? Chacune sera inscrite au journal d’audit.', 'ig.repaOk': '{n} réparation(s) appliquée(s).', 'ig.choisir': 'Cochez au moins une réparation.',
      'ig.a.document-illisible': 'Document illisible', 'ig.a.schema': 'Champ obligatoire manquant', 'ig.a.statut-inconnu': 'Statut inconnu', 'ig.a.historique-vide': 'Historique vide', 'ig.a.statut-historique': 'Statut différent de la dernière étape',
      'ig.a.date-invalide': 'Date illisible', 'ig.a.date-future': 'Date dans le futur', 'ig.a.date-historique': 'Étape datée avant le dépôt', 'ig.a.groupe-casse': 'Lien vers une demande introuvable', 'ig.a.urgence-incoherente': 'Urgence médicale incohérente',
      'ig.a.auteur-inconnu': 'Compte de l’auteur introuvable', 'ig.a.notification-orpheline': 'Notification sans destinataire', 'ig.a.profil-sans-compte': 'Profil sans identifiant de connexion', 'ig.a.role-incoherent': 'Rôle incohérent',
      'ig.a.habilitation-incoherente': 'Habilitation incohérente', 'ig.a.compte-sans-profil': 'Identifiant sans profil', 'ig.a.aucun-admin': 'Aucun administrateur', 'ig.a.compteur-retard': 'Compteur de numérotation en retard' },
    en: { 'ic.titre': 'Security incidents', 'ic.intro': 'Unusual activity detected and automatic responses: each incident keeps what was observed and what the platform did. Normal use is never slowed down.',
      'ic.kOuverts': 'Open incidents', 'ic.kCritiques': 'High or critical open', 'ic.kSurv': 'Accounts or addresses under watch', 'ic.kChaine': 'Audit register',
      'ic.fOuverts': 'Open', 'ic.fResolus': 'Resolved', 'ic.fTous': 'All', 'ic.aucun': 'No incident in this list.', 'ic.ouvert': 'Opened on {d}', 'ic.maj': 'updated {d}', 'ic.resoluPar': 'Resolved by {p} on {d}',
      'ic.resoudre': 'Mark as resolved', 'ic.note': 'What was done (visible in the log)', 'ic.confirmer': 'Confirm', 'ic.annuler': 'Cancel', 'ic.resoluOk': 'Incident {id} marked as resolved.', 'ic.parties': 'Affected parts',
      'ic.g.faible': 'Low', 'ic.g.moyenne': 'Medium', 'ic.g.haute': 'High', 'ic.g.critique': 'Critical', 'ic.sujet.compte': 'Account', 'ic.sujet.ip': 'Address', 'ic.sujet.donnees': 'Data',
      'ic.survTitre': 'Accounts and addresses under watch', 'ic.survIntro': 'Risk score over 30 minutes. From {a}: password asked again for sensitive actions and alert to the resident; {b}: temporary slow-down; {c}: sessions closed.',
      'ic.survVide': 'No account or address under watch right now.', 'ic.cSujet': 'Account or address', 'ic.cScore': 'Score', 'ic.cSignaux': 'Signals', 'ic.cMesures': 'Measures', 'ic.cAction': 'Action',
      'ic.lever': 'Lift the measures', 'ic.leverOk': 'Measures lifted.', 'ic.ralenti': 'slowed down until {h}', 'ic.n.normal': 'Normal', 'ic.n.surveille': 'Under watch', 'ic.n.eleve': 'High', 'ic.n.critique': 'Critical',
      'ig.titre': 'Data integrity', 'ig.intro': 'Every audit log entry is sealed and chained to the previous one (SHA-256 + HMAC seal): a change, deletion or direct insertion in the database breaks the chain. Business data is checked every {h} h.',
      'ig.verifier': 'Check the chain now', 'ig.simuler': 'Simulate a change (demonstration)', 'ig.controler': 'Run a full check', 'ig.intacte': 'Chain intact', 'ig.rompue': 'Chain broken at entry no. {n}',
      'ig.entrees': '{n} entries checked in {ms} ms', 'ig.horsRegistre': '{n} entry(ies) added outside the register', 'ig.simulation': 'Simulation: nothing was changed in the database. This is what the administrator would see if entry no. {n} had been altered.',
      'ig.dernier': 'Last check: {d} ({par}) · next automatic check: {p}', 'ig.aucunControle': 'First automatic check in a few seconds.', 'ig.toutBon': 'No inconsistency in business data.',
      'ig.nbAnom': '{n} inconsistency(ies) found, {r} of which can be safely repaired.', 'ig.cProbleme': 'Problem', 'ig.cOu': 'Where', 'ig.cDetail': 'Detail', 'ig.cRepa': 'Proposed repair', 'ig.aucuneRepa': 'To check manually',
      'ig.appliquer': 'Apply the selected repairs', 'ig.confirmRepa': 'Apply {n} repair(s)? Each one will be written to the audit log.', 'ig.repaOk': '{n} repair(s) applied.', 'ig.choisir': 'Select at least one repair.',
      'ig.a.document-illisible': 'Unreadable document', 'ig.a.schema': 'Missing required field', 'ig.a.statut-inconnu': 'Unknown status', 'ig.a.historique-vide': 'Empty history', 'ig.a.statut-historique': 'Status differs from the last step',
      'ig.a.date-invalide': 'Unreadable date', 'ig.a.date-future': 'Date in the future', 'ig.a.date-historique': 'Step dated before submission', 'ig.a.groupe-casse': 'Link to a missing request', 'ig.a.urgence-incoherente': 'Inconsistent medical emergency',
      'ig.a.auteur-inconnu': 'Author account missing', 'ig.a.notification-orpheline': 'Notification without recipient', 'ig.a.profil-sans-compte': 'Profile without login', 'ig.a.role-incoherent': 'Inconsistent role',
      'ig.a.habilitation-incoherente': 'Inconsistent authorisation', 'ig.a.compte-sans-profil': 'Login without profile', 'ig.a.aucun-admin': 'No administrator', 'ig.a.compteur-retard': 'Numbering counter behind' },
    es: { 'ic.titre': 'Incidentes de seguridad', 'ic.intro': 'Actividad inusual detectada y respuestas automáticas: cada incidente guarda lo observado y lo que hizo la plataforma. El uso normal nunca se ralentiza.',
      'ic.kOuverts': 'Incidentes abiertos', 'ic.kCritiques': 'Altos o críticos abiertos', 'ic.kSurv': 'Cuentas o direcciones vigiladas', 'ic.kChaine': 'Registro de auditoría',
      'ic.fOuverts': 'Abiertos', 'ic.fResolus': 'Resueltos', 'ic.fTous': 'Todos', 'ic.aucun': 'Ningún incidente en esta lista.', 'ic.ouvert': 'Abierto el {d}', 'ic.maj': 'actualizado {d}', 'ic.resoluPar': 'Resuelto por {p} el {d}',
      'ic.resoudre': 'Marcar como resuelto', 'ic.note': 'Lo que se hizo (visible en el registro)', 'ic.confirmer': 'Confirmar', 'ic.annuler': 'Cancelar', 'ic.resoluOk': 'Incidente {id} marcado como resuelto.', 'ic.parties': 'Partes afectadas',
      'ic.g.faible': 'Baja', 'ic.g.moyenne': 'Media', 'ic.g.haute': 'Alta', 'ic.g.critique': 'Crítica', 'ic.sujet.compte': 'Cuenta', 'ic.sujet.ip': 'Dirección', 'ic.sujet.donnees': 'Datos',
      'ic.survTitre': 'Cuentas y direcciones vigiladas', 'ic.survIntro': 'Puntuación de riesgo en 30 minutos. Desde {a}: contraseña pedida de nuevo para acciones sensibles y alerta al habitante; {b}: ralentización temporal; {c}: sesiones cerradas.',
      'ic.survVide': 'Ninguna cuenta ni dirección vigilada en este momento.', 'ic.cSujet': 'Cuenta o dirección', 'ic.cScore': 'Puntuación', 'ic.cSignaux': 'Señales', 'ic.cMesures': 'Medidas', 'ic.cAction': 'Acción',
      'ic.lever': 'Levantar las medidas', 'ic.leverOk': 'Medidas levantadas.', 'ic.ralenti': 'ralentizada hasta las {h}', 'ic.n.normal': 'Normal', 'ic.n.surveille': 'Vigilada', 'ic.n.eleve': 'Alto', 'ic.n.critique': 'Crítico',
      'ig.titre': 'Integridad de los datos', 'ig.intro': 'Cada entrada del registro de auditoría está sellada y encadenada a la anterior (SHA-256 + sello HMAC): un cambio, una eliminación o una inserción directa en la base rompe la cadena. Los datos se controlan cada {h} h.',
      'ig.verifier': 'Verificar la cadena ahora', 'ig.simuler': 'Simular un cambio (demostración)', 'ig.controler': 'Lanzar un control completo', 'ig.intacte': 'Cadena intacta', 'ig.rompue': 'Cadena rota en la entrada n.º {n}',
      'ig.entrees': '{n} entradas verificadas en {ms} ms', 'ig.horsRegistre': '{n} entrada(s) añadida(s) fuera del registro', 'ig.simulation': 'Simulación: no se ha cambiado nada en la base. Esto es lo que vería el administrador si la entrada n.º {n} hubiera sido modificada.',
      'ig.dernier': 'Último control: {d} ({par}) · próximo control automático: {p}', 'ig.aucunControle': 'Primer control automático en unos segundos.', 'ig.toutBon': 'Ninguna incoherencia en los datos.',
      'ig.nbAnom': '{n} incoherencia(s) encontrada(s), {r} reparable(s) sin riesgo.', 'ig.cProbleme': 'Problema', 'ig.cOu': 'Dónde', 'ig.cDetail': 'Detalle', 'ig.cRepa': 'Reparación propuesta', 'ig.aucuneRepa': 'A verificar a mano',
      'ig.appliquer': 'Aplicar las reparaciones marcadas', 'ig.confirmRepa': '¿Aplicar {n} reparación(es)? Cada una quedará en el registro de auditoría.', 'ig.repaOk': '{n} reparación(es) aplicada(s).', 'ig.choisir': 'Marque al menos una reparación.',
      'ig.a.document-illisible': 'Documento ilegible', 'ig.a.schema': 'Falta un campo obligatorio', 'ig.a.statut-inconnu': 'Estado desconocido', 'ig.a.historique-vide': 'Historial vacío', 'ig.a.statut-historique': 'Estado distinto de la última etapa',
      'ig.a.date-invalide': 'Fecha ilegible', 'ig.a.date-future': 'Fecha en el futuro', 'ig.a.date-historique': 'Etapa fechada antes del envío', 'ig.a.groupe-casse': 'Enlace a una solicitud inexistente', 'ig.a.urgence-incoherente': 'Urgencia médica incoherente',
      'ig.a.auteur-inconnu': 'Cuenta del autor inexistente', 'ig.a.notification-orpheline': 'Notificación sin destinatario', 'ig.a.profil-sans-compte': 'Perfil sin identificador', 'ig.a.role-incoherent': 'Rol incoherente',
      'ig.a.habilitation-incoherente': 'Habilitación incoherente', 'ig.a.compte-sans-profil': 'Identificador sin perfil', 'ig.a.aucun-admin': 'Ningún administrador', 'ig.a.compteur-retard': 'Contador de numeración atrasado' },
    ar: { 'ic.titre': 'الحوادث الأمنية', 'ic.intro': 'نشاط غير معتاد تم رصده وردود تلقائية: يحتفظ كل حادث بما لوحظ وبما قامت به المنصة. لا يُبطَّأ الاستخدام العادي أبداً.',
      'ic.kOuverts': 'حوادث مفتوحة', 'ic.kCritiques': 'مفتوحة عالية أو حرجة', 'ic.kSurv': 'حسابات أو عناوين تحت المراقبة', 'ic.kChaine': 'سجل التدقيق',
      'ic.fOuverts': 'مفتوحة', 'ic.fResolus': 'محلولة', 'ic.fTous': 'الكل', 'ic.aucun': 'لا يوجد حادث في هذه القائمة.', 'ic.ouvert': 'فُتح في {d}', 'ic.maj': 'حُدّث {d}', 'ic.resoluPar': 'حلّه {p} في {d}',
      'ic.resoudre': 'وضع علامة «محلول»', 'ic.note': 'ما تم القيام به (يظهر في السجل)', 'ic.confirmer': 'تأكيد', 'ic.annuler': 'إلغاء', 'ic.resoluOk': 'تم وضع علامة «محلول» على الحادث {id}.', 'ic.parties': 'الأجزاء المتأثرة',
      'ic.g.faible': 'منخفضة', 'ic.g.moyenne': 'متوسطة', 'ic.g.haute': 'عالية', 'ic.g.critique': 'حرجة', 'ic.sujet.compte': 'حساب', 'ic.sujet.ip': 'عنوان', 'ic.sujet.donnees': 'بيانات',
      'ic.survTitre': 'حسابات وعناوين تحت المراقبة', 'ic.survIntro': 'درجة الخطر خلال 30 دقيقة. ابتداءً من {a}: طلب كلمة المرور مجدداً للإجراءات الحساسة وتنبيه الساكن؛ {b}: إبطاء مؤقت؛ {c}: إغلاق الجلسات.',
      'ic.survVide': 'لا يوجد حساب أو عنوان تحت المراقبة حالياً.', 'ic.cSujet': 'الحساب أو العنوان', 'ic.cScore': 'الدرجة', 'ic.cSignaux': 'الإشارات', 'ic.cMesures': 'الإجراءات', 'ic.cAction': 'إجراء',
      'ic.lever': 'رفع الإجراءات', 'ic.leverOk': 'تم رفع الإجراءات.', 'ic.ralenti': 'مُبطّأ حتى {h}', 'ic.n.normal': 'عادي', 'ic.n.surveille': 'تحت المراقبة', 'ic.n.eleve': 'مرتفع', 'ic.n.critique': 'حرج',
      'ig.titre': 'سلامة البيانات', 'ig.intro': 'كل مدخل في سجل التدقيق مختوم ومرتبط بالمدخل السابق (SHA-256 + ختم HMAC): أي تعديل أو حذف أو إضافة مباشرة في قاعدة البيانات يكسر السلسلة. تُفحص بيانات العمل كل {h} ساعات.',
      'ig.verifier': 'التحقق من السلسلة الآن', 'ig.simuler': 'محاكاة تعديل (عرض توضيحي)', 'ig.controler': 'إجراء فحص كامل', 'ig.intacte': 'السلسلة سليمة', 'ig.rompue': 'السلسلة مكسورة عند المدخل رقم {n}',
      'ig.entrees': 'تم التحقق من {n} مدخلاً في {ms} ملّي ثانية', 'ig.horsRegistre': '{n} مدخل(ات) أُضيفت خارج السجل', 'ig.simulation': 'محاكاة: لم يُغيَّر شيء في قاعدة البيانات. هذا ما سيراه المسؤول لو عُدّل المدخل رقم {n}.',
      'ig.dernier': 'آخر فحص: {d} ({par}) · الفحص التلقائي التالي: {p}', 'ig.aucunControle': 'أول فحص تلقائي خلال ثوانٍ.', 'ig.toutBon': 'لا يوجد أي تناقض في بيانات العمل.',
      'ig.nbAnom': 'تم العثور على {n} تناقض(ات)، منها {r} قابلة للإصلاح دون خطر.', 'ig.cProbleme': 'المشكلة', 'ig.cOu': 'المكان', 'ig.cDetail': 'التفاصيل', 'ig.cRepa': 'الإصلاح المقترح', 'ig.aucuneRepa': 'يُتحقق منه يدوياً',
      'ig.appliquer': 'تطبيق الإصلاحات المحددة', 'ig.confirmRepa': 'تطبيق {n} إصلاح(ات)؟ سيُسجَّل كل إصلاح في سجل التدقيق.', 'ig.repaOk': 'تم تطبيق {n} إصلاح(ات).', 'ig.choisir': 'حدد إصلاحاً واحداً على الأقل.',
      'ig.a.document-illisible': 'مستند غير مقروء', 'ig.a.schema': 'حقل إلزامي مفقود', 'ig.a.statut-inconnu': 'حالة غير معروفة', 'ig.a.historique-vide': 'سجل فارغ', 'ig.a.statut-historique': 'الحالة تختلف عن آخر مرحلة',
      'ig.a.date-invalide': 'تاريخ غير مقروء', 'ig.a.date-future': 'تاريخ في المستقبل', 'ig.a.date-historique': 'مرحلة مؤرخة قبل الإيداع', 'ig.a.groupe-casse': 'رابط إلى طلب غير موجود', 'ig.a.urgence-incoherente': 'حالة طبية طارئة متناقضة',
      'ig.a.auteur-inconnu': 'حساب صاحب الطلب غير موجود', 'ig.a.notification-orpheline': 'إشعار بدون مستلم', 'ig.a.profil-sans-compte': 'ملف بدون معرّف دخول', 'ig.a.role-incoherent': 'دور متناقض',
      'ig.a.habilitation-incoherente': 'تأهيل متناقض', 'ig.a.compte-sans-profil': 'معرّف بدون ملف', 'ig.a.aucun-admin': 'لا يوجد مسؤول', 'ig.a.compteur-retard': 'عدّاد الترقيم متأخر' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const dh = (iso) => (iso ? NT.ui.dateHeure(iso) : '—');
  const PARTIES = { 'Connexion': { en: 'Sign-in', es: 'Conexión', ar: 'تسجيل الدخول' }, 'API': { en: 'API', es: 'API', ar: 'واجهة البرمجة' }, 'Données réservées': { en: 'Reserved data', es: 'Datos reservados', ar: 'البيانات المحجوزة' },
    'Exports': { en: 'Exports', es: 'Exportaciones', ar: 'التصدير' }, 'Sauvegardes': { en: 'Backups', es: 'Copias de seguridad', ar: 'النسخ الاحتياطية' }, 'Demandes': { en: 'Requests', es: 'Solicitudes', ar: 'الطلبات' },
    'Comptes': { en: 'Accounts', es: 'Cuentas', ar: 'الحسابات' }, 'Journal d’audit': { en: 'Audit log', es: 'Registro de auditoría', ar: 'سجل التدقيق' }, 'Numérotation': { en: 'Numbering', es: 'Numeración', ar: 'الترقيم' },
    'Notifications': { en: 'Notifications', es: 'Notificaciones', ar: 'الإشعارات' }, 'Rendez-vous': { en: 'Appointments', es: 'Citas', ar: 'المواعيد' } };
  const partie = (p) => (NT.i18n.langue === 'fr' ? p : (PARTIES[p] || {})[NT.i18n.langue] || p);
  const etat = { filtre: 'ouverts', ouvert: null, inc: null, integ: null, chaine: null };

  function kpi(v, lib, fort) { return `<div class="kpi${fort ? ' fort' : ''}"><div class="valeur">${E(v)}</div><div class="libelle">${E(lib)}</div></div>`; }
  function chaineHtml(c) {
    if (!c) return '';
    const ok = c.intacte;
    return `<div class="chaine ${ok ? 'ok' : 'ko'}${c.simulation ? ' simulation' : ''}" role="status"><i class="ph-duotone ${ok ? 'ph-seal-check' : 'ph-seal-warning'}" aria-hidden="true"></i><div>
      <h3>${E(ok ? t('ig.intacte') : c.rupture ? t('ig.rompue', { n: c.rupture.entree }) : t('ig.horsRegistre', { n: c.horsRegistre }))}</h3>
      ${c.simulation ? `<p><strong>${E(t('ig.simulation', { n: c.rupture ? c.rupture.entree : '?' }))}</strong></p>` : ''}
      <p>${E(c.texte)}</p><p class="doux">${E(t('ig.entrees', { n: c.entrees, ms: c.dureeMs }))}${c.derniere ? ` · ${E(c.derniere.empreinte)}…` : ''} · ${E(dh(c.verifieLe))}</p></div></div>`;
  }
  function incidentHtml(i) {
    const frise = [].concat((i.evenements || []).map((e) => ({ date: e.date, texte: e.texte, action: false })), (i.actions || []).map((a) => ({ date: a.date, texte: a.texte, action: true })))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const form = etat.ouvert === i.id;
    return `<li class="inc g-${E(i.gravite)}${i.statut === 'resolu' ? ' resolu' : ''}" id="${E(i.id)}">
      <div class="tete"><span class="v17-num">${E(i.id)}</span><span class="gravite ${E(i.gravite)}">${E(t('ic.g.' + i.gravite))}</span>
        <span class="statut ${i.statut === 'resolu' ? 'statut-traitee' : 'statut-recue'}">${E(i.statut === 'resolu' ? t('ic.fResolus') : t('ic.fOuverts'))}</span>
        ${(i.parties || []).map((p) => `<span class="puce-partie">${E(partie(p))}</span>`).join('')}</div>
      <h3>${E(i.titre)}</h3>
      <p class="meta">${E(t('ic.ouvert', { d: dh(i.cree) }))} · ${E(t('ic.maj', { d: dh(i.maj) }))}${i.sujet ? ' · ' + E(t('ic.sujet.' + i.sujet.type)) : ''}</p>
      <ol class="frise">${frise.map((f) => `<li class="${f.action ? 'action' : ''}"><time datetime="${E(f.date)}">${E(dh(f.date))}</time>${f.action ? '<i class="ph ph-shield-check" aria-hidden="true"></i> ' : ''}${E(f.texte)}</li>`).join('')}</ol>
      ${i.statut === 'resolu' ? `<p class="meta" style="margin-top:.6rem">${E(t('ic.resoluPar', { p: i.resoluPar || '', d: dh(i.resoluLe) }))}${i.note ? ' — ' + E(i.note) : ''}</p>`
        : form ? `<form data-ic-form="${E(i.id)}"><label for="ic-note-${E(i.id)}">${E(t('ic.note'))}</label><textarea id="ic-note-${E(i.id)}" minlength="5" required></textarea>
          <div class="v17-boutons"><button class="btn btn-primaire petit" type="submit">${E(t('ic.confirmer'))}</button><button class="btn petit" type="button" data-ic="annuler">${E(t('ic.annuler'))}</button></div></form>`
          : `<div class="v17-boutons"><button class="btn petit" type="button" data-ic="resoudre" data-id="${E(i.id)}">${E(t('ic.resoudre'))}</button></div>`}
    </li>`;
  }

  let racine = null;
  function rendre() {
    const d = etat.inc || { incidents: [], surveillance: [], seuils: { surveille: 30, eleve: 60, critique: 85 } };
    const g = etat.integ || {};
    const dernier = g.dernier;
    const ouverts = d.incidents.filter((i) => i.statut === 'ouvert');
    const liste = d.incidents.filter((i) => etat.filtre === 'tous' || (etat.filtre === 'ouverts' ? i.statut === 'ouvert' : i.statut === 'resolu'));
    const chaine = etat.chaine || (dernier && dernier.chaine);
    const anomalies = dernier ? dernier.anomalies || [] : [];
    const focus = document.activeElement && racine.contains(document.activeElement) ? document.activeElement.id : '';
    racine.innerHTML = `
      <section class="bloc-sec" id="incidents" aria-labelledby="t-inc">
        <h2 id="t-inc"><i class="ph-duotone ph-siren" aria-hidden="true"></i> ${E(t('ic.titre'))}</h2>
        <p class="doux">${E(t('ic.intro'))}</p>
        <div class="kpis-sec">${kpi(ouverts.length, t('ic.kOuverts'), ouverts.length > 0)}${kpi(ouverts.filter((i) => i.gravite === 'haute' || i.gravite === 'critique').length, t('ic.kCritiques'))}${kpi(d.surveillance.length, t('ic.kSurv'))}${kpi(chaine ? (chaine.intacte ? '✓' : '✗') : '…', t('ic.kChaine'), chaine && !chaine.intacte)}</div>
        <div class="v17-filtres" role="group" aria-label="${E(t('ic.titre'))}">${['ouverts', 'resolus', 'tous'].map((f) => `<button type="button" class="btn petit" id="ic-f-${f}" data-ic-filtre="${f}" aria-pressed="${etat.filtre === f}">${E(t('ic.f' + f.charAt(0).toUpperCase() + f.slice(1)))}</button>`).join('')}</div>
        ${liste.length ? `<ol class="inc-liste">${liste.slice(0, 60).map(incidentHtml).join('')}</ol>` : `<p class="doux">${E(t('ic.aucun'))}</p>`}
      </section>
      <section class="bloc-sec" id="surveillance" aria-labelledby="t-surv">
        <h2 id="t-surv"><i class="ph-duotone ph-binoculars" aria-hidden="true"></i> ${E(t('ic.survTitre'))}</h2>
        <p class="doux">${E(t('ic.survIntro', { a: d.seuils.surveille, b: d.seuils.eleve, c: d.seuils.critique }))}</p>
        ${d.surveillance.length ? `<div class="table-defile"><table class="table-sec empilee"><caption class="sr-only">${E(t('ic.survTitre'))}</caption>
          <thead><tr><th scope="col">${E(t('ic.cSujet'))}</th><th scope="col">${E(t('ic.cScore'))}</th><th scope="col">${E(t('ic.cSignaux'))}</th><th scope="col">${E(t('ic.cMesures'))}</th><th scope="col">${E(t('ic.cAction'))}</th></tr></thead>
          <tbody>${d.surveillance.map((s) => `<tr><td data-label="${E(t('ic.cSujet'))}">${E(t('ic.sujet.' + s.type))} · ${E(s.libelle)}</td>
            <td data-label="${E(t('ic.cScore'))}"><strong>${E(s.score)}</strong> · ${E(t('ic.n.' + s.niveau))}</td>
            <td data-label="${E(t('ic.cSignaux'))}">${s.signaux.map((x) => `${E(x.libelle)} (+${E(x.points)})`).join('<br>')}</td>
            <td data-label="${E(t('ic.cMesures'))}">${s.ralentiJusqu ? E(t('ic.ralenti', { h: dh(s.ralentiJusqu) })) + '<br>' : ''}${(s.mesures || []).map((m) => E(m.texte)).join('<br>')}</td>
            <td data-label="${E(t('ic.cAction'))}"><button class="btn petit" type="button" data-ic="lever" data-cle="${E(s.cle)}">${E(t('ic.lever'))}</button></td></tr>`).join('')}</tbody></table></div>`
          : `<p class="doux">${E(t('ic.survVide'))}</p>`}
      </section>
      <section class="bloc-sec" id="integrite" aria-labelledby="t-integ">
        <h2 id="t-integ"><i class="ph-duotone ph-seal-check" aria-hidden="true"></i> ${E(t('ig.titre'))}</h2>
        <p class="doux">${E(t('ig.intro', { h: g.intervalleHeures || 6 }))}</p>
        <div id="ig-chaine" aria-live="polite">${chaineHtml(chaine)}</div>
        <div class="v17-boutons"><button class="btn" type="button" id="ig-verifier" data-ig="verifier"><i class="ph ph-seal-check" aria-hidden="true"></i>${E(t('ig.verifier'))}</button>
          <button class="btn" type="button" id="ig-simuler" data-ig="simuler"><i class="ph ph-flask" aria-hidden="true"></i>${E(t('ig.simuler'))}</button>
          <button class="btn btn-primaire" type="button" id="ig-controler" data-ig="controler"><i class="ph ph-list-checks" aria-hidden="true"></i>${E(t('ig.controler'))}</button></div>
        <p class="doux">${dernier ? E(t('ig.dernier', { d: dh(dernier.date), par: dernier.par, p: dh(g.prochainControle) })) : E(t('ig.aucunControle'))}</p>
        ${dernier ? (anomalies.length ? `<p><strong>${E(t('ig.nbAnom', { n: anomalies.length, r: dernier.reparables || 0 }))}</strong></p>
          <form id="ig-form"><div class="table-defile"><table class="table-sec empilee"><caption class="sr-only">${E(t('ig.titre'))}</caption>
          <thead><tr><th scope="col"><span class="sr-only">${E(t('ig.cRepa'))}</span></th><th scope="col">${E(t('ig.cProbleme'))}</th><th scope="col">${E(t('ig.cOu'))}</th><th scope="col">${E(t('ig.cDetail'))}</th><th scope="col">${E(t('ig.cRepa'))}</th></tr></thead>
          <tbody>${anomalies.map((a, k) => `<tr><td>${a.reparation ? `<input class="v17-coche" type="checkbox" id="ig-a-${k}" value="${E(a.id)}" aria-label="${E(a.reparation.libelle)}">` : ''}</td>
            <td data-label="${E(t('ig.cProbleme'))}"><span class="gravite ${E(a.gravite === 'critique' ? 'critique' : a.gravite)}">${E(t('ic.g.' + a.gravite))}</span> ${E(t('ig.a.' + a.code))}</td>
            <td data-label="${E(t('ig.cOu'))}"><span class="v17-num">${E(a.collection)} · ${E(a.docId)}</span></td><td data-label="${E(t('ig.cDetail'))}">${E(a.detail)}</td>
            <td data-label="${E(t('ig.cRepa'))}">${a.reparation ? `<label for="ig-a-${k}">${E(a.reparation.libelle)}</label>` : `<span class="doux">${E(t('ig.aucuneRepa'))}</span>`}</td></tr>`).join('')}</tbody></table></div>
          ${dernier.reparables ? `<div class="v17-boutons"><button class="btn btn-primaire" type="submit">${E(t('ig.appliquer'))}</button></div>` : ''}</form>`
          : `<p class="ex-note"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i>${E(t('ig.toutBon'))}</p>`) : ''}
      </section>`;
    if (focus) { const el = document.getElementById(focus); if (el) el.focus(); }
  }
  function charger() {
    const a = NT.api('GET', '/api/incidents'); if (a.statut === 200) etat.inc = a.donnees;
    const b = NT.api('GET', '/api/integrite'); if (b.statut === 200) etat.integ = b.donnees;
    rendre();
  }

  NT.pret(() => {
    if (!NT.auth.aRole('admin')) return;
    racine = document.getElementById('v17-securite');
    if (!racine) return;
    const kpis = document.getElementById('cs-kpis');
    if (kpis) kpis.after(racine);   // en tête du Centre de sécurité, avant les envois automatiques bloqués
    charger();
    racine.addEventListener('click', (e) => {
      const f = e.target.closest('[data-ic-filtre]');
      if (f) { etat.filtre = f.dataset.icFiltre; rendre(); return; }
      const b = e.target.closest('[data-ic], [data-ig]'); if (!b) return;
      const a = b.dataset.ic || b.dataset.ig;
      if (a === 'resoudre') { etat.ouvert = b.dataset.id; rendre(); const z = document.getElementById('ic-note-' + b.dataset.id); if (z) z.focus(); }
      if (a === 'annuler') { etat.ouvert = null; rendre(); }
      if (a === 'lever') { const r = NT.api('POST', '/api/incidents/sujets/lever', { cle: b.dataset.cle, motif: 'Levée depuis le Centre de sécurité' }); NT.ui.toast(r.statut === 200 ? t('ic.leverOk') : (r.donnees && r.donnees.erreur) || 'Erreur', r.statut === 200 ? 'success' : 'danger'); charger(); }
      if (a === 'verifier') { const r = NT.api('GET', '/api/integrite/chaine'); if (r.statut === 200) { etat.chaine = r.donnees; rendre(); NT.ui.annoncer && NT.ui.annoncer(r.donnees.texte); } }
      if (a === 'simuler') { const r = NT.api('POST', '/api/integrite/chaine/simulation', {}); if (r.statut === 200) { etat.chaine = r.donnees; rendre(); NT.ui.annoncer && NT.ui.annoncer(r.donnees.texte); } }
      if (a === 'controler') { const r = NT.api('POST', '/api/integrite/controler', {}); if (r.statut === 200) { etat.chaine = null; charger(); NT.ui.toast(r.donnees.chaine.texte, r.donnees.chaine.intacte ? 'success' : 'danger', 8000); } }
    });
    racine.addEventListener('submit', (e) => {
      e.preventDefault();
      const fi = e.target.closest('[data-ic-form]');
      if (fi) {
        const note = fi.querySelector('textarea').value.trim();
        if (note.length < 5) { fi.querySelector('textarea').focus(); return; }
        const r = NT.api('POST', '/api/incidents/' + encodeURIComponent(fi.dataset.icForm) + '/resoudre', { note });
        if (r.statut === 200) { NT.ui.toast(t('ic.resoluOk', { id: fi.dataset.icForm }), 'success'); etat.ouvert = null; charger(); }
        else NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger');
        return;
      }
      if (e.target.id === 'ig-form') {
        const ids = [...e.target.querySelectorAll('input[type=checkbox]:checked')].map((c) => c.value);
        if (!ids.length) { NT.ui.toast(t('ig.choisir'), 'warning'); return; }
        if (!window.confirm(t('ig.confirmRepa', { n: ids.length }))) return;
        const r = NT.api('POST', '/api/integrite/reparer', { ids });
        if (r.statut === 200) { NT.ui.toast(t('ig.repaOk', { n: r.donnees.faites.length }), 'success'); etat.chaine = null; charger(); }
        else if (r.statut !== 428) NT.ui.toast((r.donnees && r.donnees.erreur) || 'Erreur', 'danger');
      }
    });
    setInterval(() => { if (!document.hidden && !etat.ouvert && !(racine.contains(document.activeElement) && document.activeElement.matches('textarea, input'))) { const a = NT.api('GET', '/api/incidents'); if (a.statut === 200) { etat.inc = a.donnees; rendre(); } } }, 30000);
    if (location.hash === '#incidents') setTimeout(() => { const s = document.getElementById('incidents'); if (s) s.scrollIntoView(); }, 300);
  });
})();
