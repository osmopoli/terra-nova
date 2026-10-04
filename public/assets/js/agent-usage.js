/* Terra Nova — vague 20 (F98, Haut Conseil) : page agents « Usage des services ».
   Données : GET /api/usage/rapport?periode=7|30|90&quartier= (compteurs anonymes agrégés). La page traduit les conclusions
   calculées par le serveur en phrases simples (« ce qu'il faut retenir », « actions recommandées ») dans la langue de l'agent.
   Graphiques accessibles : chaque graphique est un vrai tableau (légende, en-têtes) avec des barres dessinées en CSS,
   valeurs toujours écrites ; jamais la couleur seule. Export CSV (historique des exports F88). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'us.titre': 'Usage des services', 'nav.usage': 'Usage', 'us.intro': 'Quels services les habitants utilisent le plus, où, quand, et où ils abandonnent : les chiffres sont anonymes (des totaux seulement) et les conclusions sont rédigées automatiquement.',
      'us.filtres': 'Filtres', 'us.periode': 'Période', 'us.quartier': 'Quartier', 'us.export': 'Exporter (CSV)', 'us.p7': '7 derniers jours', 'us.p30': '30 derniers jours', 'us.p90': '90 derniers jours', 'us.tous': 'Toute la ville',
      'us.periodeTxt': 'Du {du} au {au}, comparé au {duA} – {auA}.', 'us.chiffres': 'Chiffres clés', 'us.k.usages': 'Utilisations', 'us.k.vues': 'Consultations de services', 'us.k.taux': 'Démarches menées au bout', 'us.k.rdv': 'Rendez-vous pris', 'us.k.recherche': 'Trouvés par la recherche',
      'us.vsAvant': '{t} par rapport à la période précédente', 'us.retenir': 'Ce qu’il faut retenir', 'us.actions': 'Actions recommandées', 'us.classement': 'Services les plus utilisés',
      'us.classementD': 'Utilisations = demandes, rendez-vous et démarches commencées. Tendance : comparaison avec la période précédente de même durée.', 'us.demarches': 'Démarches menées au bout',
      'us.demarchesD': 'Commencées (service choisi) puis envoyées ; l’étape où les habitants s’arrêtent le plus est signalée.', 'us.quartiers': 'Par quartier', 'us.pointe': 'Heures et jours de pointe',
      'us.anonyme': 'Mesure anonyme : seulement des totaux par service, jour, heure et quartier ; aucun compte, cookie ni adresse IP n’est enregistré.',
      'us.c.rang': 'Rang', 'us.c.service': 'Service', 'us.c.usages': 'Utilisations', 'us.c.part': 'Part', 'us.c.tendance': 'Tendance', 'us.c.vues': 'Consultations', 'us.c.demandes': 'Demandes', 'us.c.rdv': 'Rendez-vous',
      'us.c.commencees': 'Commencées', 'us.c.nature': 'Type choisi', 'us.c.infos': 'Informations et pièces', 'us.c.envoyees': 'Envoyées', 'us.c.taux': 'Menées au bout', 'us.c.pire': 'Où ils s’arrêtent le plus', 'us.c.quartier': 'Quartier', 'us.c.top': 'Services les plus utilisés',
      'us.c.heure': 'Heure', 'us.c.jour': 'Jour', 'us.c.activite': 'Activité', 'us.capClassement': 'Classement des services par utilisations, avec tendance', 'us.capDemarches': 'Démarches commencées et envoyées par service', 'us.capQuartiers': 'Utilisations par quartier',
      'us.capHeures': 'Activité par heure de la journée', 'us.capJours': 'Activité par jour de la semaine', 'us.hausse': 'en hausse de {n} %', 'us.baisseT': 'en baisse de {n} %', 'us.stable': 'stable', 'us.nouveau': 'nouveau',
      'us.e.choix': 'choix du service', 'us.e.nature': 'type de démarche', 'us.e.informations': 'informations et pièces', 'us.aucun': 'Pas encore assez de données sur cette période.', 'us.voirDonnees': 'Voir les données heure par heure',
      'us.r.partDemarches': '{s} représente {p} % des démarches, {t} sur {j} jours.', 'us.r.premier': '{s} est le service le plus utilisé : {n} utilisations ({p} % du total), {t}.',
      'us.r.hausse': '{s} progresse fortement : +{t} % sur {j} jours.', 'us.r.baisse': '{s} recule : {t} % sur {j} jours.', 'us.r.abandon': '{p} % des démarches {s} sont abandonnées à l’étape « {e} ».',
      'us.r.pic': 'Le pic d’utilisation est le {jour} entre {h1} et {h2}.', 'us.r.quartier': 'Le quartier {q} utilise {r} fois plus le service {s} que la moyenne de la ville.', 'us.r.recherche': '{n} recherches ou questions à l’assistant ont mené à {s}.',
      'us.a.renforcer': 'Prévoir plus de créneaux et d’agents pour {s} (+{t} %).', 'us.a.simplifier': 'Simplifier l’étape « {e} » de {s} : liste des pièces avant de commencer, exemples, aide en ligne.',
      'us.a.pic': 'Renforcer l’accueil et les réponses le {jour} de {h1} à {h2} ; éviter les maintenances à ce moment-là.', 'us.a.quartier': 'Tenir une permanence {s} dans le quartier {q}.', 'us.a.retablir': 'Rétablir en priorité {s} (perturbé) : {n} utilisations et {v} consultations sur la période.',
      'us.a.aucune': 'Rien d’urgent : continuez le suivi.', 'us.exportOk': 'Export prêt : il est inscrit dans l’historique des exports.' },
    en: { 'us.titre': 'Service usage', 'nav.usage': 'Usage', 'us.intro': 'Which services residents use most, where, when, and where they give up: figures are anonymous (totals only) and conclusions are written automatically.',
      'us.filtres': 'Filters', 'us.periode': 'Period', 'us.quartier': 'District', 'us.export': 'Export (CSV)', 'us.p7': 'Last 7 days', 'us.p30': 'Last 30 days', 'us.p90': 'Last 90 days', 'us.tous': 'Whole city',
      'us.periodeTxt': 'From {du} to {au}, compared with {duA} – {auA}.', 'us.chiffres': 'Key figures', 'us.k.usages': 'Uses', 'us.k.vues': 'Service views', 'us.k.taux': 'Procedures completed', 'us.k.rdv': 'Appointments booked', 'us.k.recherche': 'Found through search',
      'us.vsAvant': '{t} compared with the previous period', 'us.retenir': 'Key takeaways', 'us.actions': 'Recommended actions', 'us.classement': 'Most used services',
      'us.classementD': 'Uses = requests, appointments and procedures started. Trend: compared with the previous period of the same length.', 'us.demarches': 'Procedures completed',
      'us.demarchesD': 'Started (service chosen) then sent; the step where residents stop most is highlighted.', 'us.quartiers': 'By district', 'us.pointe': 'Peak hours and days',
      'us.anonyme': 'Anonymous measurement: totals per service, day, hour and district only; no account, cookie or IP address is stored.',
      'us.c.rang': 'Rank', 'us.c.service': 'Service', 'us.c.usages': 'Uses', 'us.c.part': 'Share', 'us.c.tendance': 'Trend', 'us.c.vues': 'Views', 'us.c.demandes': 'Requests', 'us.c.rdv': 'Appointments',
      'us.c.commencees': 'Started', 'us.c.nature': 'Type chosen', 'us.c.infos': 'Information and documents', 'us.c.envoyees': 'Sent', 'us.c.taux': 'Completed', 'us.c.pire': 'Where they stop most', 'us.c.quartier': 'District', 'us.c.top': 'Most used services',
      'us.c.heure': 'Hour', 'us.c.jour': 'Day', 'us.c.activite': 'Activity', 'us.capClassement': 'Services ranked by uses, with trend', 'us.capDemarches': 'Procedures started and sent per service', 'us.capQuartiers': 'Uses per district',
      'us.capHeures': 'Activity per hour of the day', 'us.capJours': 'Activity per day of the week', 'us.hausse': 'up {n}%', 'us.baisseT': 'down {n}%', 'us.stable': 'stable', 'us.nouveau': 'new',
      'us.e.choix': 'choosing the service', 'us.e.nature': 'procedure type', 'us.e.informations': 'information and documents', 'us.aucun': 'Not enough data yet for this period.', 'us.voirDonnees': 'See hour-by-hour data',
      'us.r.partDemarches': '{s} accounts for {p}% of procedures, {t} over {j} days.', 'us.r.premier': '{s} is the most used service: {n} uses ({p}% of the total), {t}.',
      'us.r.hausse': '{s} is rising sharply: +{t}% over {j} days.', 'us.r.baisse': '{s} is falling: {t}% over {j} days.', 'us.r.abandon': '{p}% of {s} procedures are abandoned at the “{e}” step.',
      'us.r.pic': 'Peak use is on {jour} between {h1} and {h2}.', 'us.r.quartier': 'The {q} district uses {s} {r} times more than the city average.', 'us.r.recherche': '{n} searches or assistant questions led to {s}.',
      'us.a.renforcer': 'Plan more slots and staff for {s} (+{t}%).', 'us.a.simplifier': 'Simplify the “{e}” step of {s}: list of documents before starting, examples, online help.',
      'us.a.pic': 'Strengthen reception and answers on {jour} from {h1} to {h2}; avoid maintenance at that time.', 'us.a.quartier': 'Hold a {s} drop-in session in the {q} district.', 'us.a.retablir': 'Restore {s} first (disrupted): {n} uses and {v} views over the period.',
      'us.a.aucune': 'Nothing urgent: keep monitoring.', 'us.exportOk': 'Export ready: it is recorded in the export history.' },
    es: { 'us.titre': 'Uso de los servicios', 'nav.usage': 'Uso', 'us.intro': 'Qué servicios usan más los habitantes, dónde, cuándo y dónde abandonan: las cifras son anónimas (solo totales) y las conclusiones se redactan automáticamente.',
      'us.filtres': 'Filtros', 'us.periode': 'Periodo', 'us.quartier': 'Barrio', 'us.export': 'Exportar (CSV)', 'us.p7': 'Últimos 7 días', 'us.p30': 'Últimos 30 días', 'us.p90': 'Últimos 90 días', 'us.tous': 'Toda la ciudad',
      'us.periodeTxt': 'Del {du} al {au}, comparado con {duA} – {auA}.', 'us.chiffres': 'Cifras clave', 'us.k.usages': 'Usos', 'us.k.vues': 'Consultas de servicios', 'us.k.taux': 'Trámites completados', 'us.k.rdv': 'Citas reservadas', 'us.k.recherche': 'Encontrados con la búsqueda',
      'us.vsAvant': '{t} respecto al periodo anterior', 'us.retenir': 'Lo que hay que retener', 'us.actions': 'Acciones recomendadas', 'us.classement': 'Servicios más usados',
      'us.classementD': 'Usos = solicitudes, citas y trámites iniciados. Tendencia: comparación con el periodo anterior de igual duración.', 'us.demarches': 'Trámites completados',
      'us.demarchesD': 'Iniciados (servicio elegido) y luego enviados; se señala la etapa donde más se detienen.', 'us.quartiers': 'Por barrio', 'us.pointe': 'Horas y días punta',
      'us.anonyme': 'Medición anónima: solo totales por servicio, día, hora y barrio; no se guarda ninguna cuenta, cookie ni dirección IP.',
      'us.c.rang': 'Puesto', 'us.c.service': 'Servicio', 'us.c.usages': 'Usos', 'us.c.part': 'Parte', 'us.c.tendance': 'Tendencia', 'us.c.vues': 'Consultas', 'us.c.demandes': 'Solicitudes', 'us.c.rdv': 'Citas',
      'us.c.commencees': 'Iniciados', 'us.c.nature': 'Tipo elegido', 'us.c.infos': 'Información y documentos', 'us.c.envoyees': 'Enviados', 'us.c.taux': 'Completados', 'us.c.pire': 'Donde más se detienen', 'us.c.quartier': 'Barrio', 'us.c.top': 'Servicios más usados',
      'us.c.heure': 'Hora', 'us.c.jour': 'Día', 'us.c.activite': 'Actividad', 'us.capClassement': 'Servicios por número de usos, con tendencia', 'us.capDemarches': 'Trámites iniciados y enviados por servicio', 'us.capQuartiers': 'Usos por barrio',
      'us.capHeures': 'Actividad por hora del día', 'us.capJours': 'Actividad por día de la semana', 'us.hausse': 'sube un {n} %', 'us.baisseT': 'baja un {n} %', 'us.stable': 'estable', 'us.nouveau': 'nuevo',
      'us.e.choix': 'elección del servicio', 'us.e.nature': 'tipo de trámite', 'us.e.informations': 'información y documentos', 'us.aucun': 'Aún no hay suficientes datos en este periodo.', 'us.voirDonnees': 'Ver los datos hora por hora',
      'us.r.partDemarches': '{s} representa el {p} % de los trámites, {t} en {j} días.', 'us.r.premier': '{s} es el servicio más usado: {n} usos ({p} % del total), {t}.',
      'us.r.hausse': '{s} crece con fuerza: +{t} % en {j} días.', 'us.r.baisse': '{s} retrocede: {t} % en {j} días.', 'us.r.abandon': 'El {p} % de los trámites de {s} se abandonan en la etapa «{e}».',
      'us.r.pic': 'El pico de uso es el {jour} entre las {h1} y las {h2}.', 'us.r.quartier': 'El barrio {q} usa {r} veces más el servicio {s} que la media de la ciudad.', 'us.r.recherche': '{n} búsquedas o preguntas al asistente llevaron a {s}.',
      'us.a.renforcer': 'Prever más citas y personal para {s} (+{t} %).', 'us.a.simplifier': 'Simplificar la etapa «{e}» de {s}: lista de documentos antes de empezar, ejemplos, ayuda en línea.',
      'us.a.pic': 'Reforzar la atención el {jour} de {h1} a {h2}; evitar mantenimientos en ese momento.', 'us.a.quartier': 'Abrir una permanencia de {s} en el barrio {q}.', 'us.a.retablir': 'Restablecer primero {s} (con incidencias): {n} usos y {v} consultas en el periodo.',
      'us.a.aucune': 'Nada urgente: siga con el seguimiento.', 'us.exportOk': 'Exportación lista: queda registrada en el historial de exportaciones.' },
    ar: { 'us.titre': 'استخدام الخدمات', 'nav.usage': 'الاستخدام', 'us.intro': 'ما الخدمات الأكثر استخداماً، وأين ومتى، وأين يتوقف السكان: الأرقام مجهولة (مجاميع فقط) والاستنتاجات تُكتب تلقائياً.',
      'us.filtres': 'المرشحات', 'us.periode': 'الفترة', 'us.quartier': 'الحي', 'us.export': 'تصدير (CSV)', 'us.p7': 'آخر 7 أيام', 'us.p30': 'آخر 30 يوماً', 'us.p90': 'آخر 90 يوماً', 'us.tous': 'كل المدينة',
      'us.periodeTxt': 'من {du} إلى {au}، مقارنة بـ {duA} – {auA}.', 'us.chiffres': 'أرقام رئيسية', 'us.k.usages': 'الاستخدامات', 'us.k.vues': 'مشاهدات الخدمات', 'us.k.taux': 'إجراءات مكتملة', 'us.k.rdv': 'مواعيد محجوزة', 'us.k.recherche': 'عُثر عليها بالبحث',
      'us.vsAvant': '{t} مقارنة بالفترة السابقة', 'us.retenir': 'ما يجب تذكره', 'us.actions': 'إجراءات موصى بها', 'us.classement': 'الخدمات الأكثر استخداماً',
      'us.classementD': 'الاستخدامات = الطلبات والمواعيد والإجراءات المبدوءة. الاتجاه: مقارنة بالفترة السابقة بنفس المدة.', 'us.demarches': 'إجراءات مكتملة',
      'us.demarchesD': 'مبدوءة (اختيار الخدمة) ثم مرسلة؛ تُبرز المرحلة التي يتوقف فيها السكان أكثر.', 'us.quartiers': 'حسب الحي', 'us.pointe': 'ساعات وأيام الذروة',
      'us.anonyme': 'قياس مجهول: مجاميع فقط حسب الخدمة واليوم والساعة والحي؛ لا يُحفظ أي حساب أو ملف تعريف ارتباط أو عنوان IP.',
      'us.c.rang': 'الترتيب', 'us.c.service': 'الخدمة', 'us.c.usages': 'الاستخدامات', 'us.c.part': 'النسبة', 'us.c.tendance': 'الاتجاه', 'us.c.vues': 'المشاهدات', 'us.c.demandes': 'الطلبات', 'us.c.rdv': 'المواعيد',
      'us.c.commencees': 'مبدوءة', 'us.c.nature': 'نوع مختار', 'us.c.infos': 'المعلومات والوثائق', 'us.c.envoyees': 'مرسلة', 'us.c.taux': 'مكتملة', 'us.c.pire': 'أين يتوقفون أكثر', 'us.c.quartier': 'الحي', 'us.c.top': 'الخدمات الأكثر استخداماً',
      'us.c.heure': 'الساعة', 'us.c.jour': 'اليوم', 'us.c.activite': 'النشاط', 'us.capClassement': 'ترتيب الخدمات حسب الاستخدام مع الاتجاه', 'us.capDemarches': 'الإجراءات المبدوءة والمرسلة لكل خدمة', 'us.capQuartiers': 'الاستخدامات حسب الحي',
      'us.capHeures': 'النشاط حسب ساعة اليوم', 'us.capJours': 'النشاط حسب يوم الأسبوع', 'us.hausse': 'ارتفاع {n}٪', 'us.baisseT': 'انخفاض {n}٪', 'us.stable': 'مستقر', 'us.nouveau': 'جديد',
      'us.e.choix': 'اختيار الخدمة', 'us.e.nature': 'نوع الإجراء', 'us.e.informations': 'المعلومات والوثائق', 'us.aucun': 'لا توجد بيانات كافية لهذه الفترة بعد.', 'us.voirDonnees': 'عرض البيانات ساعة بساعة',
      'us.r.partDemarches': '{s} يمثل {p}٪ من الإجراءات، {t} خلال {j} يوماً.', 'us.r.premier': '{s} هي الخدمة الأكثر استخداماً: {n} استخدام ({p}٪ من المجموع)، {t}.',
      'us.r.hausse': '{s} يرتفع بقوة: +{t}٪ خلال {j} يوماً.', 'us.r.baisse': '{s} يتراجع: {t}٪ خلال {j} يوماً.', 'us.r.abandon': '{p}٪ من إجراءات {s} تُترك في مرحلة «{e}».',
      'us.r.pic': 'ذروة الاستخدام يوم {jour} بين {h1} و{h2}.', 'us.r.quartier': 'حي {q} يستخدم خدمة {s} أكثر بـ {r} مرات من متوسط المدينة.', 'us.r.recherche': '{n} عمليات بحث أو أسئلة للمساعد أدت إلى {s}.',
      'us.a.renforcer': 'توفير مواعيد وموظفين أكثر لـ {s} (+{t}٪).', 'us.a.simplifier': 'تبسيط مرحلة «{e}» في {s}: قائمة الوثائق قبل البدء، أمثلة، مساعدة إلكترونية.',
      'us.a.pic': 'تعزيز الاستقبال والردود يوم {jour} من {h1} إلى {h2}؛ تجنب الصيانة في هذا الوقت.', 'us.a.quartier': 'تنظيم مداومة لـ {s} في حي {q}.', 'us.a.retablir': 'إعادة {s} أولاً (مضطربة): {n} استخدام و{v} مشاهدة خلال الفترة.',
      'us.a.aucune': 'لا شيء عاجل: واصل المتابعة.', 'us.exportOk': 'التصدير جاهز: سُجّل في سجل التصدير.' }
  });
  const t = (k, v) => NT.t(k, v);
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const $ = (id) => document.getElementById(id);
  const LOC = () => ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[NT.i18n.langue] || 'fr-FR');
  const nf = (n) => Number(n || 0).toLocaleString(LOC());
  const pc = (n) => (n == null ? '—' : Number(n).toLocaleString(LOC(), { maximumFractionDigits: 1 }) + (NT.i18n.langue === 'en' ? '%' : ' %'));
  let R = null;
  const nomSvc = (id) => { const s = R.classement.find((x) => x.id === id); return s ? (s.nom && (s.nom[NT.i18n.langue] || s.nom.fr)) || id : id; };
  const jourNom = (d) => new Intl.DateTimeFormat(LOC(), { weekday: 'long' }).format(new Date(Date.UTC(2024, 0, 7 + d, 12)));
  const heure = (h) => (NT.i18n.langue === 'fr' ? h + ' h' : NT.i18n.langue === 'en' ? (h % 12 || 12) + (h < 12 ? ' am' : ' pm') : h + ':00');
  const dateC = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString(LOC(), { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const tend = (n, avant) => (avant === 0 && n > 0 ? t('us.nouveau') : n > 2 ? t('us.hausse', { n }) : n < -2 ? t('us.baisseT', { n: -n }) : t('us.stable'));
  const fleche = (n) => (n > 2 ? '<i class="ph ph-trend-up" aria-hidden="true"></i>' : n < -2 ? '<i class="ph ph-trend-down" aria-hidden="true"></i>' : '<i class="ph ph-minus" aria-hidden="true"></i>');
  const barre = (v, max, cl) => `<span class="us-barre${cl ? ' ' + cl : ''}" aria-hidden="true"><span style="inline-size:${max ? Math.max(v > 0 ? 2 : 0, (v / max) * 100).toFixed(1) : 0}%"></span></span>`;

  function filtres() {
    $('us-periode').innerHTML = [7, 30, 90].map((p) => `<option value="${p}"${p === 30 ? ' selected' : ''}>${E(t('us.p' + p))}</option>`).join('');
    $('us-quartier').innerHTML = `<option value="">${E(t('us.tous'))}</option>` + NT.QUARTIERS.map((q) => `<option value="${q}">${E(NT.t('tr.q.' + q, null, q))}</option>`).join('');
    $('us-periode').addEventListener('change', charger); $('us-quartier').addEventListener('change', charger);
    $('us-filtres').addEventListener('submit', (e) => e.preventDefault());
    $('us-export').addEventListener('click', () => setTimeout(() => NT.ui.toast(t('us.exportOk'), 'success', 6000), 600));
  }
  function charger() {
    const p = $('us-periode').value, q = $('us-quartier').value;
    $('us-export').href = '/api/usage/export?periode=' + p + (q ? '&quartier=' + encodeURIComponent(q) : '');
    $('us-export').setAttribute('download', '');
    const r = NT.api('GET', '/api/usage/rapport?periode=' + p + (q ? '&quartier=' + encodeURIComponent(q) : ''));
    if (r.statut !== 200) { $('us-kpis').innerHTML = `<li class="vide">${E((r.donnees && r.donnees.erreur) || '')}</li>`; return; }
    R = r.donnees;
    rendre();
  }
  function phrase(x, actions) {
    const s = x.service ? nomSvc(x.service) : '';
    const p = { s, p: x.part, t: x.tendance != null ? (x.code === 'baisse' ? x.tendance : x.code === 'hausse' || x.code === 'renforcer' ? x.tendance : tend(x.tendance, 1)) : '', j: x.jours, n: nf(x.n != null ? x.n : x.usages), v: nf(x.vues),
      e: x.etape ? t('us.e.' + x.etape) : '', q: x.quartier ? NT.t('tr.q.' + x.quartier, null, x.quartier) : '', r: x.ratio != null ? Number(x.ratio).toLocaleString(LOC()) : '',
      jour: x.jour != null ? jourNom(x.jour) : '', h1: x.heure != null ? heure(x.heure) : '', h2: x.heure != null ? heure(x.heure + 2) : '' };
    return t((actions ? 'us.a.' : 'us.r.') + x.code, p);
  }
  const ICONES_R = { partDemarches: 'ph-chart-pie-slice', premier: 'ph-trophy', hausse: 'ph-trend-up', baisse: 'ph-trend-down', abandon: 'ph-sign-out', pic: 'ph-clock', quartier: 'ph-map-pin', recherche: 'ph-magnifying-glass' };
  function rendre() {
    const T = R.totaux;
    $('us-periode-txt').textContent = t('us.periodeTxt', { du: dateC(R.periode.du), au: dateC(R.periode.au), duA: dateC(R.periode.duAvant), auA: dateC(R.periode.auAvant) });
    const tg = T.usagesAvant ? Math.round(((T.usages - T.usagesAvant) / T.usagesAvant) * 100) : 0;
    const taux = T.demarchesCommencees ? Math.round((T.demarchesTerminees / T.demarchesCommencees) * 100) : null;
    $('us-kpis').innerHTML = [
      ['ph-users-three', t('us.k.usages'), nf(T.usages), `${fleche(tg)} ${E(t('us.vsAvant', { t: tend(tg, T.usagesAvant) }))}`],
      ['ph-eye', t('us.k.vues'), nf(T.vues), ''], ['ph-flag-checkered', t('us.k.taux'), taux == null ? '—' : pc(taux), `${nf(T.demarchesTerminees)} / ${nf(T.demarchesCommencees)}`],
      ['ph-calendar-check', t('us.k.rdv'), nf(T.rdv), ''], ['ph-magnifying-glass', t('us.k.recherche'), nf(T.recherche), '']
    ].map(([ic, l, v, s]) => `<li class="us-kpi"><i class="ph-duotone ${ic}" aria-hidden="true"></i><span class="us-kpi-l">${E(l)}</span><strong>${E(v)}</strong>${s ? `<span class="us-kpi-s">${s}</span>` : ''}</li>`).join('');
    $('us-retenir').innerHTML = R.retenir.length ? R.retenir.map((x) => `<li><i class="ph-duotone ${ICONES_R[x.code] || 'ph-info'}" aria-hidden="true"></i><span>${E(phrase(x))}</span></li>`).join('') : `<li>${E(t('us.aucun'))}</li>`;
    $('us-actions').innerHTML = R.actions.length ? R.actions.map((x) => `<li><span>${E(phrase(x, true))}</span></li>`).join('') : `<li>${E(t('us.a.aucune'))}</li>`;
    // classement
    const max = Math.max(1, ...R.classement.map((s) => s.usages));
    $('us-classement').innerHTML = `<div class="table-defile"><table class="us-table"><caption class="sr-only">${E(t('us.capClassement'))}</caption>
      <thead><tr><th scope="col">${E(t('us.c.rang'))}</th><th scope="col">${E(t('us.c.service'))}</th><th scope="col">${E(t('us.c.usages'))}</th><th scope="col">${E(t('us.c.part'))}</th><th scope="col">${E(t('us.c.tendance'))}</th><th scope="col">${E(t('us.c.vues'))}</th><th scope="col">${E(t('us.c.demandes'))}</th><th scope="col">${E(t('us.c.rdv'))}</th></tr></thead>
      <tbody>${R.classement.map((s, i) => `<tr><td class="num">${i + 1}</td><th scope="row">${E(nomSvc(s.id))}${s.etat !== 'ok' ? ' ' + NT.ui.niveauBadge({ etat: { code: s.etat } }) : ''}</th>
        <td class="us-cell-barre">${barre(s.usages, max)}<span class="num">${nf(s.usages)}</span></td><td class="num">${pc(s.part)}</td>
        <td class="us-tend ${s.tendance > 2 ? 'hausse' : s.tendance < -2 ? 'baisse' : ''}">${fleche(s.tendance)} ${E(s.usagesAvant === 0 && s.usages > 0 ? t('us.nouveau') : (s.tendance > 0 ? '+' : '') + s.tendance + (NT.i18n.langue === 'en' ? '%' : ' %'))}</td>
        <td class="num">${nf(s.vues)}</td><td class="num">${nf(s.demandes)}</td><td class="num">${nf(s.rdv)}</td></tr>`).join('')}</tbody></table></div>`;
    // démarches
    const dem = R.classement.filter((s) => s.demarches.commencees > 0).sort((a, b) => b.demarches.commencees - a.demarches.commencees);
    $('us-demarches').innerHTML = dem.length ? `<div class="table-defile"><table class="us-table"><caption class="sr-only">${E(t('us.capDemarches'))}</caption>
      <thead><tr><th scope="col">${E(t('us.c.service'))}</th><th scope="col">${E(t('us.c.commencees'))}</th><th scope="col">${E(t('us.c.nature'))}</th><th scope="col">${E(t('us.c.infos'))}</th><th scope="col">${E(t('us.c.envoyees'))}</th><th scope="col">${E(t('us.c.taux'))}</th><th scope="col">${E(t('us.c.pire'))}</th></tr></thead>
      <tbody>${dem.map((s) => { const e = s.demarches.etapes; return `<tr><th scope="row">${E(nomSvc(s.id))}</th>${e.map((x) => `<td class="num">${nf(x[1])}</td>`).join('')}
        <td class="us-cell-barre">${barre(s.demarches.taux || 0, 100, (s.demarches.taux || 0) < 65 ? 'faible' : '')}<span class="num">${pc(s.demarches.taux)}</span></td>
        <td>${s.demarches.pireEtape ? `${E(t('us.e.' + s.demarches.pireEtape.etape))} <span class="doux">(${pc(s.demarches.pireEtape.part)})</span>` : '—'}</td></tr>`; }).join('')}</tbody></table></div>` : `<p class="vide">${E(t('us.aucun'))}</p>`;
    // quartiers
    const maxQ = Math.max(1, ...R.quartiers.map((q) => q.usages));
    $('us-quartiers').innerHTML = `<div class="table-defile"><table class="us-table"><caption class="sr-only">${E(t('us.capQuartiers'))}</caption>
      <thead><tr><th scope="col">${E(t('us.c.quartier'))}</th><th scope="col">${E(t('us.c.usages'))}</th><th scope="col">${E(t('us.c.top'))}</th></tr></thead>
      <tbody>${R.quartiers.map((q) => `<tr${R.quartier === q.quartier ? ' class="us-sel"' : ''}><th scope="row">${E(NT.t('tr.q.' + q.quartier, null, q.quartier))}</th><td class="us-cell-barre">${barre(q.usages, maxQ)}<span class="num">${nf(q.usages)} <span class="doux">(${pc(q.part)})</span></span></td>
        <td>${q.top.map((x) => `${E(nomSvc(x.id))} <span class="doux">${pc(x.part)}</span>`).join(' · ') || '—'}</td></tr>`).join('')}</tbody></table></div>`;
    // heures et jours
    const maxH = Math.max(1, ...R.heures), maxJ = Math.max(1, ...R.jours);
    const heures = R.heures.map((n, h) => ({ n, h })).slice(5, 24);
    $('us-pointe').innerHTML = `<p>${E(phrase({ code: 'pic', jour: R.pic.jour, heure: R.pic.heure }))}</p>
      <div class="us-histo" role="img" aria-label="${E(t('us.capHeures'))}">${heures.map((x) => `<span class="us-histo-col${x.h === R.pic.heure || x.h === R.pic.heure + 1 ? ' pic' : ''}"><span style="block-size:${((x.n / maxH) * 100).toFixed(1)}%"></span><small>${x.h}</small></span>`).join('')}</div>
      <div class="table-defile"><table class="us-table"><caption class="sr-only">${E(t('us.capJours'))}</caption><thead><tr><th scope="col">${E(t('us.c.jour'))}</th><th scope="col">${E(t('us.c.activite'))}</th></tr></thead>
      <tbody>${[1, 2, 3, 4, 5, 6, 0].map((d) => `<tr${d === R.pic.jour ? ' class="us-sel"' : ''}><th scope="row">${E(jourNom(d))}</th><td class="us-cell-barre">${barre(R.jours[d], maxJ)}<span class="num">${nf(R.jours[d])}</span></td></tr>`).join('')}</tbody></table></div>
      <details class="us-details"><summary>${E(t('us.voirDonnees'))}</summary><div class="table-defile"><table class="us-table"><caption class="sr-only">${E(t('us.capHeures'))}</caption><thead><tr><th scope="col">${E(t('us.c.heure'))}</th><th scope="col">${E(t('us.c.activite'))}</th></tr></thead>
      <tbody>${R.heures.map((n, h) => `<tr><th scope="row">${E(heure(h))}</th><td class="num">${nf(n)}</td></tr>`).join('')}</tbody></table></div></details>`;
    NT.ui.annoncer(t('us.k.usages') + ' : ' + nf(T.usages));
  }
  function demarrer() { filtres(); charger(); }
  if (document.readyState === 'complete') demarrer(); else document.addEventListener('DOMContentLoaded', demarrer);
})();
