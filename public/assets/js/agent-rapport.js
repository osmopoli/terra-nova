/* Terra Nova — vague 22 (F103, Service Qualité) : page agents / responsables « Rapport d'activité ».
   Données : GET /api/rapport?periode=7|30|90 (ou du=…&au=…) &lang= — agrégées et rédigées par le serveur (src/modules/rapport.js),
   rôle contrôlé côté serveur. La page met en forme : chiffres clés avec évolution (texte + icône, jamais la couleur seule),
   points clés / d'attention / recommandations, tableaux par service et par quartier, comparaison avec la période précédente.
   « Télécharger le rapport » : impression du navigateur (feuille d'impression, couverture avec logo, date et période → PDF),
   CSV et JSON (historique des exports F88 + journal d'audit). */
(function () {
  'use strict';
  const NT = window.NT;
  NT.i18n.ajouter({
    fr: { 'ra.titre': 'Rapport d’activité', 'ra.intro': 'La synthèse de l’activité de la plateforme, prête à partager : chiffres clés comparés à la période précédente, ce qui va bien, ce qui doit être surveillé et quoi faire.',
      'ra.periode': 'Période', 'ra.p7': '7 jours', 'ra.p30': '30 jours', 'ra.p90': '90 jours', 'ra.perso': 'Personnalisée', 'ra.du': 'Du', 'ra.au': 'Au', 'ra.appliquer': 'Afficher', 'ra.pdf': 'Télécharger le rapport (PDF)',
      'ra.couvNote': 'Document interne · données agrégées, sans information personnelle', 'ra.periodeTxt': 'Du {du} au {au}, comparé au {duA} – {auA}.', 'ra.genere': 'Rapport établi le {d}',
      'ra.chiffres': 'L’essentiel en chiffres', 'ra.cles': 'Points clés', 'ra.attention': 'Points d’attention', 'ra.recos': 'Recommandations', 'ra.top': 'Services les plus utilisés',
      'ra.topD': 'Mesure anonyme de l’usage (demandes, rendez-vous, démarches commencées) — détail dans « Usage ».', 'ra.services': 'Par service', 'ra.quartiers': 'Par quartier', 'ra.comparaison': 'Comparaison avec la période précédente',
      'ra.k.recues': 'Demandes reçues', 'ra.k.traitees': 'Demandes traitées', 'ra.k.delai': 'Délai moyen de traitement', 'ra.k.attente': 'En attente', 'ra.k.objectif': 'Traitées dans le délai', 'ra.k.urgences': 'Urgences médicales',
      'ra.k.rdv': 'Rendez-vous', 'ra.k.satisfaction': 'Satisfaction', 'ra.k.participation': 'Participation', 'ra.k.securite': 'Incidents de sécurité', 'ra.k.dispo': 'Disponibilité de la plateforme',
      'ra.s.horsDelai': 'dont {n} hors délai', 'ra.s.objectif': 'objectif : {o}', 'ra.s.urgences': 'prise en charge en {m} min en moyenne', 'ra.s.rdv': '{n} annulé(s)', 'ra.s.avis': '{n} avis · {p} satisfaits',
      'ra.s.participation': 'votes et idées', 'ra.s.securite': 'dont {n} de gravité haute', 'ra.s.dispo': 'charge max {c} · réponse {ms} ms', 'ra.jours': '{n} j', 'ra.min': '{n} min',
      'ra.ev.hausse': 'en hausse de {n} %', 'ra.ev.baisse': 'en baisse de {n} %', 'ra.ev.stable': 'stable', 'ra.ev.nouveau': 'nouveau', 'ra.ev.mieux': 'mieux', 'ra.ev.moins': 'à surveiller', 'ra.vsAvant': 'vs période précédente : {v}',
      'ra.c.service': 'Service', 'ra.c.quartier': 'Quartier', 'ra.c.recues': 'Reçues', 'ra.c.evol': 'Évolution', 'ra.c.traitees': 'Traitées', 'ra.c.delai': 'Délai moyen', 'ra.c.objectif': 'Dans le délai', 'ra.c.attente': 'En attente',
      'ra.c.horsDelai': 'Hors délai', 'ra.c.satisfaction': 'Satisfaction', 'ra.c.urgences': 'Urgences', 'ra.c.idees': 'Idées', 'ra.c.indicateur': 'Indicateur', 'ra.c.actuelle': 'Cette période', 'ra.c.precedente': 'Période précédente',
      'ra.c.usages': 'Utilisations', 'ra.c.part': 'Part', 'ra.capServices': 'Activité par service', 'ra.capQuartiers': 'Activité par quartier', 'ra.capComparaison': 'Indicateurs de la période et de la période précédente', 'ra.capTop': 'Services les plus utilisés',
      'ra.aucun': 'Rien à signaler sur cette période.', 'ra.exportOk': 'Téléchargement prêt : il est inscrit dans l’historique des exports.', 'ra.impression': 'Choisissez « Enregistrer au format PDF » dans la fenêtre d’impression.',
      'ra.methode': 'Délai cible selon la priorité : urgente 1 jour, haute 3 jours, normale 7 jours, basse 14 jours ; objectif {o} % dans le délai. Urgence médicale : prise en charge en moins de {m} minutes. Chiffres agrégés, sans donnée personnelle ; rapport recalculé au plus toutes les minutes.',
      'ra.eDates': 'Choisissez une date de début et une date de fin.' },
    en: { 'ra.titre': 'Activity report', 'ra.intro': 'A summary of platform activity, ready to share: key figures compared with the previous period, what is going well, what needs watching and what to do.',
      'ra.periode': 'Period', 'ra.p7': '7 days', 'ra.p30': '30 days', 'ra.p90': '90 days', 'ra.perso': 'Custom', 'ra.du': 'From', 'ra.au': 'To', 'ra.appliquer': 'Show', 'ra.pdf': 'Download the report (PDF)',
      'ra.couvNote': 'Internal document · aggregated data, no personal information', 'ra.periodeTxt': 'From {du} to {au}, compared with {duA} – {auA}.', 'ra.genere': 'Report produced on {d}',
      'ra.chiffres': 'Key figures', 'ra.cles': 'Key points', 'ra.attention': 'Points to watch', 'ra.recos': 'Recommendations', 'ra.top': 'Most used services',
      'ra.topD': 'Anonymous usage measurement (requests, appointments, procedures started) — details in “Usage”.', 'ra.services': 'By service', 'ra.quartiers': 'By district', 'ra.comparaison': 'Comparison with the previous period',
      'ra.k.recues': 'Requests received', 'ra.k.traitees': 'Requests handled', 'ra.k.delai': 'Average handling time', 'ra.k.attente': 'Pending', 'ra.k.objectif': 'Handled on time', 'ra.k.urgences': 'Medical emergencies',
      'ra.k.rdv': 'Appointments', 'ra.k.satisfaction': 'Satisfaction', 'ra.k.participation': 'Participation', 'ra.k.securite': 'Security incidents', 'ra.k.dispo': 'Platform availability',
      'ra.s.horsDelai': '{n} overdue', 'ra.s.objectif': 'goal: {o}', 'ra.s.urgences': 'taken in charge in {m} min on average', 'ra.s.rdv': '{n} cancelled', 'ra.s.avis': '{n} reviews · {p} satisfied',
      'ra.s.participation': 'votes and ideas', 'ra.s.securite': '{n} high severity', 'ra.s.dispo': 'max load {c} · response {ms} ms', 'ra.jours': '{n} d', 'ra.min': '{n} min',
      'ra.ev.hausse': 'up {n}%', 'ra.ev.baisse': 'down {n}%', 'ra.ev.stable': 'stable', 'ra.ev.nouveau': 'new', 'ra.ev.mieux': 'better', 'ra.ev.moins': 'to watch', 'ra.vsAvant': 'vs previous period: {v}',
      'ra.c.service': 'Service', 'ra.c.quartier': 'District', 'ra.c.recues': 'Received', 'ra.c.evol': 'Change', 'ra.c.traitees': 'Handled', 'ra.c.delai': 'Average time', 'ra.c.objectif': 'On time', 'ra.c.attente': 'Pending',
      'ra.c.horsDelai': 'Overdue', 'ra.c.satisfaction': 'Satisfaction', 'ra.c.urgences': 'Emergencies', 'ra.c.idees': 'Ideas', 'ra.c.indicateur': 'Indicator', 'ra.c.actuelle': 'This period', 'ra.c.precedente': 'Previous period',
      'ra.c.usages': 'Uses', 'ra.c.part': 'Share', 'ra.capServices': 'Activity by service', 'ra.capQuartiers': 'Activity by district', 'ra.capComparaison': 'Indicators for this period and the previous one', 'ra.capTop': 'Most used services',
      'ra.aucun': 'Nothing to report for this period.', 'ra.exportOk': 'Download ready: it is recorded in the export history.', 'ra.impression': 'Choose “Save as PDF” in the print window.',
      'ra.methode': 'Target time by priority: urgent 1 day, high 3 days, normal 7 days, low 14 days; goal {o}% on time. Medical emergency: taken in charge in under {m} minutes. Aggregated figures, no personal data; report recalculated at most every minute.',
      'ra.eDates': 'Choose a start date and an end date.' },
    es: { 'ra.titre': 'Informe de actividad', 'ra.intro': 'La síntesis de la actividad de la plataforma, lista para compartir: cifras clave comparadas con el periodo anterior, lo que va bien, lo que hay que vigilar y qué hacer.',
      'ra.periode': 'Periodo', 'ra.p7': '7 días', 'ra.p30': '30 días', 'ra.p90': '90 días', 'ra.perso': 'Personalizado', 'ra.du': 'Del', 'ra.au': 'Al', 'ra.appliquer': 'Mostrar', 'ra.pdf': 'Descargar el informe (PDF)',
      'ra.couvNote': 'Documento interno · datos agregados, sin información personal', 'ra.periodeTxt': 'Del {du} al {au}, comparado con {duA} – {auA}.', 'ra.genere': 'Informe elaborado el {d}',
      'ra.chiffres': 'Lo esencial en cifras', 'ra.cles': 'Puntos clave', 'ra.attention': 'Puntos de atención', 'ra.recos': 'Recomendaciones', 'ra.top': 'Servicios más usados',
      'ra.topD': 'Medición anónima del uso (solicitudes, citas, trámites iniciados) — detalle en «Uso».', 'ra.services': 'Por servicio', 'ra.quartiers': 'Por barrio', 'ra.comparaison': 'Comparación con el periodo anterior',
      'ra.k.recues': 'Solicitudes recibidas', 'ra.k.traitees': 'Solicitudes tramitadas', 'ra.k.delai': 'Plazo medio de tramitación', 'ra.k.attente': 'Pendientes', 'ra.k.objectif': 'Tramitadas en plazo', 'ra.k.urgences': 'Urgencias médicas',
      'ra.k.rdv': 'Citas', 'ra.k.satisfaction': 'Satisfacción', 'ra.k.participation': 'Participación', 'ra.k.securite': 'Incidentes de seguridad', 'ra.k.dispo': 'Disponibilidad de la plataforma',
      'ra.s.horsDelai': '{n} fuera de plazo', 'ra.s.objectif': 'objetivo: {o}', 'ra.s.urgences': 'atendidas en {m} min de media', 'ra.s.rdv': '{n} anulada(s)', 'ra.s.avis': '{n} opiniones · {p} satisfechos',
      'ra.s.participation': 'votos e ideas', 'ra.s.securite': '{n} de gravedad alta', 'ra.s.dispo': 'carga máx. {c} · respuesta {ms} ms', 'ra.jours': '{n} d', 'ra.min': '{n} min',
      'ra.ev.hausse': 'sube un {n} %', 'ra.ev.baisse': 'baja un {n} %', 'ra.ev.stable': 'estable', 'ra.ev.nouveau': 'nuevo', 'ra.ev.mieux': 'mejor', 'ra.ev.moins': 'a vigilar', 'ra.vsAvant': 'vs periodo anterior: {v}',
      'ra.c.service': 'Servicio', 'ra.c.quartier': 'Barrio', 'ra.c.recues': 'Recibidas', 'ra.c.evol': 'Evolución', 'ra.c.traitees': 'Tramitadas', 'ra.c.delai': 'Plazo medio', 'ra.c.objectif': 'En plazo', 'ra.c.attente': 'Pendientes',
      'ra.c.horsDelai': 'Fuera de plazo', 'ra.c.satisfaction': 'Satisfacción', 'ra.c.urgences': 'Urgencias', 'ra.c.idees': 'Ideas', 'ra.c.indicateur': 'Indicador', 'ra.c.actuelle': 'Este periodo', 'ra.c.precedente': 'Periodo anterior',
      'ra.c.usages': 'Usos', 'ra.c.part': 'Parte', 'ra.capServices': 'Actividad por servicio', 'ra.capQuartiers': 'Actividad por barrio', 'ra.capComparaison': 'Indicadores del periodo y del periodo anterior', 'ra.capTop': 'Servicios más usados',
      'ra.aucun': 'Nada que señalar en este periodo.', 'ra.exportOk': 'Descarga lista: queda registrada en el historial de exportaciones.', 'ra.impression': 'Elija «Guardar como PDF» en la ventana de impresión.',
      'ra.methode': 'Plazo objetivo según la prioridad: urgente 1 día, alta 3 días, normal 7 días, baja 14 días; objetivo {o} % en plazo. Urgencia médica: atendida en menos de {m} minutos. Cifras agregadas, sin datos personales; informe recalculado como máximo cada minuto.',
      'ra.eDates': 'Elija una fecha de inicio y una fecha de fin.' },
    ar: { 'ra.titre': 'تقرير النشاط', 'ra.intro': 'خلاصة نشاط المنصة جاهزة للمشاركة: أرقام رئيسية مقارنة بالفترة السابقة، ما يسير جيداً، ما يجب مراقبته وما يجب فعله.',
      'ra.periode': 'الفترة', 'ra.p7': '7 أيام', 'ra.p30': '30 يوماً', 'ra.p90': '90 يوماً', 'ra.perso': 'مخصصة', 'ra.du': 'من', 'ra.au': 'إلى', 'ra.appliquer': 'عرض', 'ra.pdf': 'تنزيل التقرير (PDF)',
      'ra.couvNote': 'وثيقة داخلية · بيانات مجمعة دون معلومات شخصية', 'ra.periodeTxt': 'من {du} إلى {au}، مقارنة بـ {duA} – {auA}.', 'ra.genere': 'أُعد التقرير في {d}',
      'ra.chiffres': 'الأساسي بالأرقام', 'ra.cles': 'النقاط الرئيسية', 'ra.attention': 'نقاط تستدعي الانتباه', 'ra.recos': 'التوصيات', 'ra.top': 'الخدمات الأكثر استخداماً',
      'ra.topD': 'قياس مجهول للاستخدام (طلبات، مواعيد، إجراءات مبدوءة) — التفاصيل في «الاستخدام».', 'ra.services': 'حسب الخدمة', 'ra.quartiers': 'حسب الحي', 'ra.comparaison': 'مقارنة بالفترة السابقة',
      'ra.k.recues': 'الطلبات المستلمة', 'ra.k.traitees': 'الطلبات المعالجة', 'ra.k.delai': 'متوسط مدة المعالجة', 'ra.k.attente': 'معلقة', 'ra.k.objectif': 'معالجة في الأجل', 'ra.k.urgences': 'الطوارئ الطبية',
      'ra.k.rdv': 'المواعيد', 'ra.k.satisfaction': 'الرضا', 'ra.k.participation': 'المشاركة', 'ra.k.securite': 'حوادث أمنية', 'ra.k.dispo': 'توفر المنصة',
      'ra.s.horsDelai': 'منها {n} متجاوزة للأجل', 'ra.s.objectif': 'الهدف: {o}', 'ra.s.urgences': 'التكفل في {m} د في المتوسط', 'ra.s.rdv': '{n} ملغى', 'ra.s.avis': '{n} رأي · {p} راضون',
      'ra.s.participation': 'تصويت وأفكار', 'ra.s.securite': 'منها {n} عالية الخطورة', 'ra.s.dispo': 'أقصى حمل {c} · استجابة {ms} م ث', 'ra.jours': '{n} ي', 'ra.min': '{n} د',
      'ra.ev.hausse': 'ارتفاع {n}٪', 'ra.ev.baisse': 'انخفاض {n}٪', 'ra.ev.stable': 'مستقر', 'ra.ev.nouveau': 'جديد', 'ra.ev.mieux': 'أفضل', 'ra.ev.moins': 'للمراقبة', 'ra.vsAvant': 'مقارنة بالفترة السابقة: {v}',
      'ra.c.service': 'الخدمة', 'ra.c.quartier': 'الحي', 'ra.c.recues': 'مستلمة', 'ra.c.evol': 'التطور', 'ra.c.traitees': 'معالجة', 'ra.c.delai': 'متوسط المدة', 'ra.c.objectif': 'في الأجل', 'ra.c.attente': 'معلقة',
      'ra.c.horsDelai': 'متجاوزة للأجل', 'ra.c.satisfaction': 'الرضا', 'ra.c.urgences': 'الطوارئ', 'ra.c.idees': 'الأفكار', 'ra.c.indicateur': 'المؤشر', 'ra.c.actuelle': 'هذه الفترة', 'ra.c.precedente': 'الفترة السابقة',
      'ra.c.usages': 'الاستخدامات', 'ra.c.part': 'النسبة', 'ra.capServices': 'النشاط حسب الخدمة', 'ra.capQuartiers': 'النشاط حسب الحي', 'ra.capComparaison': 'مؤشرات الفترة والفترة السابقة', 'ra.capTop': 'الخدمات الأكثر استخداماً',
      'ra.aucun': 'لا شيء يُذكر في هذه الفترة.', 'ra.exportOk': 'التنزيل جاهز: مسجل في سجل التصدير.', 'ra.impression': 'اختر «حفظ بصيغة PDF» في نافذة الطباعة.',
      'ra.methode': 'الأجل المستهدف حسب الأولوية: عاجل يوم واحد، عالية 3 أيام، عادية 7 أيام، منخفضة 14 يوماً؛ الهدف {o}٪ في الأجل. الطوارئ الطبية: التكفل في أقل من {m} دقائق. أرقام مجمعة دون بيانات شخصية؛ يُعاد حساب التقرير كل دقيقة على الأكثر.',
      'ra.eDates': 'اختر تاريخ البداية وتاريخ النهاية.' }
  });
  const t = NT.t;
  const E = (s) => NT.ui.echap(s == null ? '' : String(s));
  const $ = (id) => document.getElementById(id);
  const L = () => NT.i18n.langue;
  const LOC = () => ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[L()] || 'fr-FR');
  const nf = (n, d) => (n == null ? '—' : Number(n).toLocaleString(LOC(), { maximumFractionDigits: d == null ? 1 : d }));
  const pc = (n) => (n == null ? '—' : nf(n) + (L() === 'en' ? '%' : ' %'));
  const dateL = (iso, h) => new Date(iso).toLocaleDateString(LOC(), Object.assign({ day: 'numeric', month: 'long', year: 'numeric' }, h ? { hour: '2-digit', minute: '2-digit' } : {}));
  const BAS_MIEUX = ['delaiMoyen', 'enAttente', 'horsDelai', 'urgencesDelai', 'urgencesLentes', 'securite', 'securiteHaute', 'rdvAnnules', 'chargeMax', 'p95'];
  const NEUTRES = ['recues', 'urgences'];
  let R = null;

  // Évolution : texte + icône ; « mieux » / « à surveiller » selon le sens de l'indicateur (jamais la couleur seule)
  function evolution(cle, v) {
    if (v == null) return `<span class="ra-ev">${E(t('ra.ev.nouveau'))}</span>`;
    if (Math.abs(v) < 3) return `<span class="ra-ev"><i class="ph ph-minus" aria-hidden="true"></i>${E(t('ra.ev.stable'))}</span>`;
    if (NEUTRES.includes(cle)) return `<span class="ra-ev"><i class="ph ${v > 0 ? 'ph-trend-up' : 'ph-trend-down'}" aria-hidden="true"></i>${E(t(v > 0 ? 'ra.ev.hausse' : 'ra.ev.baisse', { n: Math.abs(v) }))}</span>`;   // volume : ni mieux ni moins bien
    const bon = BAS_MIEUX.includes(cle) ? v < 0 : v > 0;
    return `<span class="ra-ev ${bon ? 'bon' : 'mauvais'}"><i class="ph ${v > 0 ? 'ph-trend-up' : 'ph-trend-down'}" aria-hidden="true"></i>${E(t(v > 0 ? 'ra.ev.hausse' : 'ra.ev.baisse', { n: Math.abs(v) }))}<span class="ra-ev-sens">· ${E(t(bon ? 'ra.ev.mieux' : 'ra.ev.moins'))}</span></span>`;
  }
  const ecart = (a, b) => (b ? Math.round(((a - b) / b) * 100) : a ? null : 0);
  const barre = (v, max) => `<span class="us-barre" aria-hidden="true"><span style="inline-size:${max ? Math.max(v > 0 ? 2 : 0, (v / max) * 100).toFixed(1) : 0}%"></span></span>`;

  function requete() {
    const p = (document.querySelector('[name="ra-p"]:checked') || {}).value || '30';
    if (p === 'perso') return `du=${encodeURIComponent($('ra-du').value)}&au=${encodeURIComponent($('ra-au').value)}`;
    return 'periode=' + p;
  }
  function charger() {
    const q = requete() + '&lang=' + L();
    $('ra-csv').href = '/api/rapport/export?format=csv&' + q; $('ra-csv').setAttribute('download', '');
    $('ra-json').href = '/api/rapport/export?format=json&' + q; $('ra-json').setAttribute('download', '');
    const r = NT.api('GET', '/api/rapport?' + q);
    $('ra-erreur').hidden = r.statut === 200;
    if (r.statut !== 200) { $('ra-erreur').textContent = (r.donnees && r.donnees.erreur) || 'Erreur'; return; }
    R = r.donnees;
    rendre();
  }

  function kpis() {
    const a = R.actuel, ev = R.tendances;
    const k = [
      ['ph-tray-arrow-down', 'ra.k.recues', nf(a.recues, 0), '', 'recues'],
      ['ph-check-square', 'ra.k.traitees', nf(a.traitees, 0), '', 'traitees'],
      ['ph-hourglass-medium', 'ra.k.delai', a.delaiMoyen == null ? '—' : t('ra.jours', { n: nf(a.delaiMoyen) }), '', 'delaiMoyen'],
      ['ph-stack', 'ra.k.attente', nf(a.enAttente, 0), t('ra.s.horsDelai', { n: a.horsDelai }), 'enAttente'],
      ['ph-target', 'ra.k.objectif', pc(a.dansObjectif), t('ra.s.objectif', { o: pc(R.objectif) }), 'dansObjectif'],
      ['ph-first-aid', 'ra.k.urgences', nf(a.urgences, 0), a.urgencesDelai != null ? t('ra.s.urgences', { m: a.urgencesDelai }) : '', 'urgences'],
      ['ph-calendar-check', 'ra.k.rdv', nf(a.rdv, 0), t('ra.s.rdv', { n: a.rdvAnnules }), 'rdv'],
      ['ph-smiley', 'ra.k.satisfaction', a.satisfaction == null ? '—' : nf(a.satisfaction) + ' / 5', t('ra.s.avis', { n: a.avis, p: pc(a.satisfaits) }), 'satisfaction'],
      ['ph-users-three', 'ra.k.participation', nf(a.participation, 0), t('ra.s.participation'), 'participation'],
      ['ph-shield-warning', 'ra.k.securite', nf(a.securite, 0), t('ra.s.securite', { n: a.securiteHaute }), 'securite'],
      ['ph-pulse', 'ra.k.dispo', pc(a.disponibilite), a.chargeMax != null ? t('ra.s.dispo', { c: pc(a.chargeMax), ms: nf(a.p95, 0) }) : '', 'disponibilite']
    ];
    $('ra-kpis').innerHTML = k.map(([ic, l, v, s, cle]) => `<li class="ra-kpi"><span class="ra-kpi-l"><i class="ph-duotone ${ic}" aria-hidden="true"></i>${E(t(l))}</span><strong>${E(v)}</strong>
      ${s ? `<span class="ra-kpi-s">${E(s)}</span>` : ''}<span class="ra-kpi-ev"><span class="sr-only">${E(t('ra.vsAvant', { v: '' }))}</span>${evolution(cle, ev[cle])}</span></li>`).join('');
  }
  const phrases = (id, l) => { $(id).innerHTML = l.length ? l.map((x) => `<li>${E(x.texte)}</li>`).join('') : `<li class="vide">${E(t('ra.aucun'))}</li>`; };

  function tableaux() {
    const maxS = Math.max(1, ...R.parService.map((s) => s.recues));
    $('ra-services').innerHTML = `<div class="table-defile"><table class="us-table ra-table"><caption class="sr-only">${E(t('ra.capServices'))}</caption>
      <thead><tr><th scope="col">${E(t('ra.c.service'))}</th><th scope="col">${E(t('ra.c.recues'))}</th><th scope="col">${E(t('ra.c.evol'))}</th><th scope="col">${E(t('ra.c.traitees'))}</th><th scope="col">${E(t('ra.c.delai'))}</th>
        <th scope="col">${E(t('ra.c.objectif'))}</th><th scope="col">${E(t('ra.c.attente'))}</th><th scope="col">${E(t('ra.c.horsDelai'))}</th><th scope="col">${E(t('ra.c.satisfaction'))}</th></tr></thead>
      <tbody>${R.parService.map((s) => `<tr><th scope="row">${E(s.nom)}</th><td class="us-cell-barre">${barre(s.recues, maxS)}<span class="num">${nf(s.recues, 0)}</span></td><td>${evolution('recues', s.tendance)}</td>
        <td class="num">${nf(s.traitees, 0)}</td><td class="num">${s.delaiMoyen == null ? '—' : E(t('ra.jours', { n: nf(s.delaiMoyen) }))}</td><td class="num${s.dansObjectif != null && s.dansObjectif < R.objectif ? ' ra-sous' : ''}">${pc(s.dansObjectif)}</td>
        <td class="num">${nf(s.enAttente, 0)}</td><td class="num${s.horsDelai ? ' ra-sous' : ''}">${nf(s.horsDelai, 0)}</td><td class="num">${s.satisfaction == null ? '—' : nf(s.satisfaction) + ' / 5'}</td></tr>`).join('')}</tbody></table></div>`;
    const maxQ = Math.max(1, ...R.parQuartier.map((q) => q.recues));
    $('ra-quartiers').innerHTML = `<div class="table-defile"><table class="us-table ra-table"><caption class="sr-only">${E(t('ra.capQuartiers'))}</caption>
      <thead><tr><th scope="col">${E(t('ra.c.quartier'))}</th><th scope="col">${E(t('ra.c.recues'))}</th><th scope="col">${E(t('ra.c.evol'))}</th><th scope="col">${E(t('ra.c.traitees'))}</th><th scope="col">${E(t('ra.c.delai'))}</th>
        <th scope="col">${E(t('ra.c.attente'))}</th><th scope="col">${E(t('ra.c.horsDelai'))}</th><th scope="col">${E(t('ra.c.urgences'))}</th><th scope="col">${E(t('ra.c.idees'))}</th></tr></thead>
      <tbody>${R.parQuartier.map((q) => `<tr><th scope="row">${E(q.nom)}</th><td class="us-cell-barre">${barre(q.recues, maxQ)}<span class="num">${nf(q.recues, 0)}</span></td><td>${evolution('recues', q.tendance)}</td>
        <td class="num">${nf(q.traitees, 0)}</td><td class="num">${q.delaiMoyen == null ? '—' : E(t('ra.jours', { n: nf(q.delaiMoyen) }))}</td><td class="num">${nf(q.enAttente, 0)}</td><td class="num${q.horsDelai ? ' ra-sous' : ''}">${nf(q.horsDelai, 0)}</td>
        <td class="num">${nf(q.urgences, 0)}</td><td class="num">${nf(q.participation, 0)}</td></tr>`).join('')}</tbody></table></div>`;
    const maxT = Math.max(1, ...R.top.map((s) => s.usages));
    $('ra-top').innerHTML = R.top.length ? `<div class="table-defile"><table class="us-table ra-table"><caption class="sr-only">${E(t('ra.capTop'))}</caption>
      <thead><tr><th scope="col">${E(t('ra.c.service'))}</th><th scope="col">${E(t('ra.c.usages'))}</th><th scope="col">${E(t('ra.c.part'))}</th><th scope="col">${E(t('ra.c.evol'))}</th></tr></thead>
      <tbody>${R.top.map((s) => `<tr><th scope="row">${E(s.nom)}</th><td class="us-cell-barre">${barre(s.usages, maxT)}<span class="num">${nf(s.usages, 0)}</span></td><td class="num">${pc(s.part)}</td><td>${evolution('recues', s.tendance)}</td></tr>`).join('')}</tbody></table></div>`
      : `<p class="vide">${E(t('ra.aucun'))}</p>`;
    // comparaison détaillée
    const lignes = [['ra.k.recues', 'recues', (v) => nf(v, 0)], ['ra.k.traitees', 'traitees', (v) => nf(v, 0)], ['ra.k.delai', 'delaiMoyen', (v) => (v == null ? '—' : t('ra.jours', { n: nf(v) }))],
      ['ra.k.objectif', 'dansObjectif', pc], ['ra.k.attente', 'enAttente', (v) => nf(v, 0)], ['ra.c.horsDelai', 'horsDelai', (v) => nf(v, 0)], ['ra.k.urgences', 'urgences', (v) => nf(v, 0)],
      ['ra.k.rdv', 'rdv', (v) => nf(v, 0)], ['ra.k.satisfaction', 'satisfaction', (v) => (v == null ? '—' : nf(v) + ' / 5')], ['ra.k.participation', 'participation', (v) => nf(v, 0)],
      ['ra.k.securite', 'securite', (v) => nf(v, 0)], ['ra.k.dispo', 'disponibilite', pc]];
    $('ra-comparaison').innerHTML = `<div class="table-defile"><table class="us-table ra-table"><caption class="sr-only">${E(t('ra.capComparaison'))}</caption>
      <thead><tr><th scope="col">${E(t('ra.c.indicateur'))}</th><th scope="col">${E(t('ra.c.actuelle'))}</th><th scope="col">${E(t('ra.c.precedente'))}</th><th scope="col">${E(t('ra.c.evol'))}</th></tr></thead>
      <tbody>${lignes.map(([l, k, f]) => `<tr><th scope="row">${E(t(l))}</th><td class="num">${E(f(R.actuel[k]))}</td><td class="num">${E(f(R.precedent[k]))}</td><td>${evolution(k, R.actuel[k] == null || R.precedent[k] == null ? 0 : ecart(R.actuel[k], R.precedent[k]))}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function rendre() {
    const P = R.periode;
    const txt = t('ra.periodeTxt', { du: dateL(P.du), au: dateL(P.au), duA: dateL(P.duAvant), auA: dateL(P.auAvant) });
    $('ra-periode-txt').textContent = txt + ' ' + t('ra.genere', { d: dateL(R.genere, true) });
    $('ra-couv-periode').textContent = txt;
    $('ra-couv-date').textContent = t('ra.genere', { d: dateL(R.genere, true) });
    kpis();
    phrases('ra-cles', R.pointsCles); phrases('ra-attention', R.pointsAttention); phrases('ra-recos', R.recommandations);
    tableaux();
    $('ra-methode').textContent = t('ra.methode', { o: R.objectif, m: R.urgenceMinutes });
    NT.ui.annoncer(t('ra.titre') + ' : ' + txt);
  }

  function demarrer() {
    const auj = new Date(), il30 = new Date(Date.now() - 29 * 864e5), iso = (d) => d.toISOString().slice(0, 10);
    $('ra-au').value = iso(auj); $('ra-du').value = iso(il30); $('ra-au').max = iso(auj); $('ra-du').max = iso(auj);
    document.querySelectorAll('[name="ra-p"]').forEach((i) => i.addEventListener('change', () => {
      const perso = i.value === 'perso' && i.checked;
      $('ra-dates').hidden = !perso;
      if (!perso) charger(); else $('ra-du').focus();
    }));
    $('ra-filtres').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!$('ra-du').value || !$('ra-au').value) { $('ra-erreur').hidden = false; $('ra-erreur').textContent = t('ra.eDates'); return; }
      charger();
    });
    [$('ra-csv'), $('ra-json')].forEach((a) => a.addEventListener('click', () => setTimeout(() => NT.ui.toast(t('ra.exportOk'), 'success', 6000), 600)));
    $('ra-pdf').addEventListener('click', () => {
      const p = (document.querySelector('[name="ra-p"]:checked') || {}).value || '30';
      NT.api('POST', '/api/rapport/imprime', p === 'perso' ? { du: $('ra-du').value, au: $('ra-au').value, lang: L() } : { periode: p, lang: L() });   // historique des exports F88
      NT.ui.toast(t('ra.impression'), 'info', 5000);
      setTimeout(() => window.print(), 150);
    });
    charger();
  }
  if (document.readyState === 'complete') demarrer(); else document.addEventListener('DOMContentLoaded', demarrer);
})();
