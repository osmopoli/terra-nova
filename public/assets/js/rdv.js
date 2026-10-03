/* Terra Nova — rendez-vous.html : parcours en 3 étapes (F39), rappel (F40), export .ics, gestion de mes rendez-vous. */
(function () {
  'use strict';
  const NT = window.NT;
  const EN = {
    'rdv.titre': 'Book an appointment', 'rdv.intro': 'Three steps: the service, the time slot, then confirmation. You will know exactly when to come and what to bring.',
    'rdv.e1': 'Choose the service and the reason', 'rdv.serviceLegende': 'Service', 'rdv.motif': 'Reason for the appointment', 'rdv.versJour': 'Choose the day',
    'rdv.e2': 'Choose the day and time', 'rdv.jour': 'Day', 'rdv.heure': 'Start time (30 minutes)', 'rdv.heureAide': 'Choose a day first to see the free slots.',
    'rdv.retour': 'Back', 'rdv.versRecap': 'See the summary', 'rdv.e3': 'Check and confirm', 'rdv.rappelLegende': 'Would you like a reminder?', 'rdv.confirmer': 'Confirm the appointment',
    'rdv.mes': 'My appointments', 'rdv.avenir': 'Upcoming', 'rdv.passes': 'Past and cancelled',
    'rdv.rappelTitre': 'How does the reminder work?',
    'rdv.rappelTexte': 'The reminder arrives as a notification in your space (the bell at the top of the page) at the time you chose: 24 h before, 2 h before, or both. The platform checks your appointments on every page you open.',
    'rdv.rappelCalendrier': 'For a reminder on your phone, also add the appointment to your calendar: the file contains the chosen alarm.',
    'rdv.exemple': 'See an example reminder'
  };
  const ES = {
    'rdv.titre': 'Pedir cita', 'rdv.intro': 'Tres pasos: el servicio, el horario y la confirmación. Sabrá exactamente cuándo venir y qué traer.',
    'rdv.e1': 'Elija el servicio y el motivo', 'rdv.serviceLegende': 'Servicio', 'rdv.motif': 'Motivo de la cita', 'rdv.versJour': 'Elegir el día',
    'rdv.e2': 'Elija el día y la hora', 'rdv.jour': 'Día', 'rdv.heure': 'Hora de inicio (30 minutos)', 'rdv.heureAide': 'Elija primero un día para ver los horarios libres.',
    'rdv.retour': 'Atrás', 'rdv.versRecap': 'Ver el resumen', 'rdv.e3': 'Compruebe y confirme', 'rdv.rappelLegende': '¿Desea un recordatorio?', 'rdv.confirmer': 'Confirmar la cita',
    'rdv.mes': 'Mis citas', 'rdv.avenir': 'Próximas', 'rdv.passes': 'Pasadas y canceladas',
    'rdv.rappelTitre': '¿Cómo funciona el recordatorio?',
    'rdv.rappelTexte': 'El recordatorio llega como notificación en su espacio (la campana en la parte superior de la página) en el momento elegido: 24 h antes, 2 h antes o ambos. La plataforma comprueba sus citas en cada página que abre.',
    'rdv.rappelCalendrier': 'Para un recordatorio en su teléfono, añada también la cita a su calendario: el archivo contiene la alarma elegida.',
    'rdv.exemple': 'Ver un ejemplo de recordatorio'
  };
  const AR = {
    'rdv.titre': 'حجز موعد', 'rdv.intro': 'ثلاث خطوات: الخدمة، ثم الوقت، ثم التأكيد. ستعرف بدقة متى تأتي وماذا تحضر.',
    'rdv.e1': 'اختر الخدمة والسبب', 'rdv.serviceLegende': 'الخدمة', 'rdv.motif': 'سبب الموعد', 'rdv.versJour': 'اختيار اليوم',
    'rdv.e2': 'اختر اليوم والساعة', 'rdv.jour': 'اليوم', 'rdv.heure': 'ساعة البداية (30 دقيقة)', 'rdv.heureAide': 'اختر يوماً أولاً لرؤية الأوقات المتاحة.',
    'rdv.retour': 'رجوع', 'rdv.versRecap': 'عرض الملخص', 'rdv.e3': 'تحقق وأكّد', 'rdv.rappelLegende': 'هل تريد تذكيراً؟', 'rdv.confirmer': 'تأكيد الموعد',
    'rdv.mes': 'مواعيدي', 'rdv.avenir': 'القادمة', 'rdv.passes': 'السابقة والملغاة',
    'rdv.rappelTitre': 'كيف يعمل التذكير؟',
    'rdv.rappelTexte': 'يصل التذكير كإشعار في فضائك (الجرس أعلى الصفحة) في الوقت الذي اخترته: قبل 24 ساعة، أو قبل ساعتين، أو كليهما. تتحقق المنصة من مواعيدك في كل صفحة تفتحها.',
    'rdv.rappelCalendrier': 'للحصول على تذكير على هاتفك، أضف الموعد أيضاً إلى تقويمك: يحتوي الملف على المنبّه المختار.',
    'rdv.exemple': 'عرض مثال على التذكير'
  };
  NT.i18n.ajouter({ en: EN, es: ES, ar: AR });

  /* Textes courts : FR et EN dans l'appel bi(fr, en) ; ES et AR dans cette table (clé = texte FR), repli sur EN. */
  const TR = {
    'à': ['a las', 'الساعة'], 'Étapes du rendez-vous': ['Pasos de la cita', 'خطوات الموعد'], 'étape ': ['paso ', 'الخطوة '],
    ', terminée': [', completada', '، مكتملة'], ', en cours': [', en curso', '، حالية'], 'Non réservable : ': ['No reservable: ', 'غير قابل للحجز: '],
    'Aucun service ne propose de rendez-vous pour le moment.': ['Ningún servicio ofrece citas por el momento.', 'لا توجد خدمة تقدم مواعيد حالياً.'],
    'Choisir le motif…': ['Elegir el motivo…', 'اختر السبب…'], 'Choisissez d’abord un service': ['Elija primero un servicio', 'اختر خدمة أولاً'],
    ' n’est pas réservable pour le moment. ': [' no admite reservas por el momento. ', ' غير قابلة للحجز حالياً. '],
    ' ne propose pas de rendez-vous en ligne. Choisissez un autre service.': [' no ofrece citas en línea. Elija otro servicio.', ' لا تقدم مواعيد عبر الإنترنت. اختر خدمة أخرى.'],
    'Choisissez un service pour continuer.': ['Elija un servicio para continuar.', 'اختر خدمة للمتابعة.'], 'Choisissez le motif du rendez-vous.': ['Elija el motivo de la cita.', 'اختر سبب الموعد.'],
    ' créneaux libres': [' horarios libres', ' أوقات متاحة'], 'complet': ['completo', 'ممتلئ'], 'libres': ['libres', 'متاحة'], 'Complet': ['Completo', 'ممتلئ'],
    'Jour choisi : ': ['Día elegido: ', 'اليوم المختار: '], 'indisponible': ['no disponible', 'غير متاح'], 'Pris': ['Ocupado', 'محجوز'],
    'Créneau choisi : ': ['Horario elegido: ', 'الوقت المختار: '], 'Aucun créneau choisi pour le moment.': ['Ningún horario elegido por el momento.', 'لم يُختر أي وقت بعد.'],
    'Choisissez une heure pour continuer.': ['Elija una hora para continuar.', 'اختر ساعة للمتابعة.'], 'Choisissez un jour puis une heure pour continuer.': ['Elija un día y luego una hora para continuar.', 'اختر يوماً ثم ساعة للمتابعة.'],
    'Votre rendez-vous : ': ['Su cita: ', 'موعدك: '], 'Service': ['Servicio', 'الخدمة'], 'Motif': ['Motivo', 'السبب'], 'Durée': ['Duración', 'المدة'], 'Lieu': ['Lugar', 'المكان'],
    'À confirmer': ['Por confirmar', 'قيد التأكيد'], 'Agent': ['Agente', 'العون'], 'Pièces à apporter': ['Documentos que debe traer', 'الوثائق المطلوبة'], 'minutes': ['minutos', 'دقيقة'],
    'Confirmation…': ['Confirmando…', 'جارٍ التأكيد…'], 'Confirmer le rendez-vous': ['Confirmar la cita', 'تأكيد الموعد'],
    'Ce créneau vient d’être pris. Choisissez-en un autre.': ['Este horario acaba de ocuparse. Elija otro.', 'تم حجز هذا الوقت للتو. اختر وقتاً آخر.'],
    'Votre rendez-vous est confirmé': ['Su cita está confirmada', 'تم تأكيد موعدك'], 'Rappel': ['Recordatorio', 'التذكير'], 'N’oubliez pas d’apporter': ['No olvide traer', 'لا تنسَ إحضار'],
    'Ajouter à mon calendrier': ['Añadir a mi calendario', 'إضافة إلى تقويمي'], 'Voir mes rendez-vous': ['Ver mis citas', 'عرض مواعيدي'], 'Prendre un autre rendez-vous': ['Pedir otra cita', 'حجز موعد آخر'],
    'Rendez-vous confirmé : ': ['Cita confirmada: ', 'تم تأكيد الموعد: '], 'Fichier du calendrier téléchargé.': ['Archivo de calendario descargado.', 'تم تنزيل ملف التقويم.'],
    'Annulé': ['Cancelada', 'ملغى'], 'Confirmé': ['Confirmada', 'مؤكد'], 'Passé': ['Pasada', 'منقضٍ'], 'Rappel : ': ['Recordatorio: ', 'تذكير: '], ' avant': [' antes', ' قبل الموعد'],
    'Sans rappel': ['Sin recordatorio', 'بدون تذكير'], 'Annuler ce rendez-vous': ['Cancelar esta cita', 'إلغاء هذا الموعد'],
    'Aucun rendez-vous à venir.': ['No hay citas próximas.', 'لا توجد مواعيد قادمة.'], 'Aucun rendez-vous passé ou annulé.': ['No hay citas pasadas ni canceladas.', 'لا توجد مواعيد سابقة أو ملغاة.'],
    'Annuler ce rendez-vous ?': ['¿Cancelar esta cita?', 'إلغاء هذا الموعد؟'], 'Le créneau sera de nouveau proposé aux autres habitants.': ['El horario volverá a ofrecerse a los demás habitantes.', 'سيُعرض هذا الوقت مجدداً على السكان الآخرين.'],
    'Garder le rendez-vous': ['Mantener la cita', 'الاحتفاظ بالموعد'], 'Oui, annuler': ['Sí, cancelar', 'نعم، إلغاء'], 'Rendez-vous annulé.': ['Cita cancelada.', 'تم إلغاء الموعد.'],
    'À apporter : ': ['Traer: ', 'أحضر: '], '⏰ Rappel : rendez-vous à ': ['⏰ Recordatorio: cita a las ', '⏰ تذكير: موعد الساعة '], ' (dans moins de 2 h)': [' (en menos de 2 h)', ' (خلال أقل من ساعتين)'],
    '⏰ Rappel : rendez-vous ': ['⏰ Recordatorio: cita ', '⏰ تذكير: موعد '],
    '⏰ Rappel (exemple) : rendez-vous demain à 10 h 30': ['⏰ Recordatorio (ejemplo): cita mañana a las 10:30', '⏰ تذكير (مثال): موعد غداً الساعة 10:30'],
    'État civil — Hôtel de ville, niveau 1. À apporter : pièce d’identité, justificatif de domicile.': ['Registro civil — Ayuntamiento, nivel 1. Traer: documento de identidad, justificante de domicilio.', 'الحالة المدنية — دار البلدية، الطابق 1. أحضر: وثيقة هوية، إثبات سكن.'],
    'Exemple de rappel ajouté : ouvrez la cloche en haut de la page pour le lire.': ['Ejemplo de recordatorio añadido: abra la campana en la parte superior de la página para leerlo.', 'تمت إضافة مثال على التذكير: افتح الجرس أعلى الصفحة لقراءته.'],
    /* étapes et rappels */
    'Service et motif': ['Servicio y motivo', 'الخدمة والسبب'], 'Jour et heure': ['Día y hora', 'اليوم والساعة'], 'Confirmation': ['Confirmación', 'التأكيد'],
    '24 heures avant': ['24 horas antes', 'قبل 24 ساعة'], '2 heures avant': ['2 horas antes', 'قبل ساعتين'], '24 heures et 2 heures avant': ['24 horas y 2 horas antes', 'قبل 24 ساعة وقبل ساعتين'], 'Aucun rappel': ['Sin recordatorio', 'بدون تذكير'],
    /* motifs */
    'Renseignement': ['Información', 'استفسار'], 'Autre motif': ['Otro motivo', 'سبب آخر'],
    'Acte de naissance ou de mariage': ['Certificado de nacimiento o de matrimonio', 'شهادة ميلاد أو عقد زواج'], 'Changement d’adresse': ['Cambio de domicilio', 'تغيير العنوان'], 'Papiers d’identité': ['Documentos de identidad', 'وثائق الهوية'],
    'Vaccination': ['Vacunación', 'تطعيم'], 'Consultation de prévention': ['Consulta de prevención', 'استشارة وقائية'], 'Suivi médical': ['Seguimiento médico', 'متابعة طبية'],
    'Demande de module d’habitation': ['Solicitud de módulo de vivienda', 'طلب وحدة سكنية'], 'Aide au logement': ['Ayuda a la vivienda', 'مساعدة السكن'], 'Travaux dans mon module': ['Obras en mi módulo', 'أشغال في وحدتي السكنية'],
    'Inscription scolaire': ['Inscripción escolar', 'التسجيل المدرسي'], 'Place en crèche': ['Plaza en guardería', 'مكان في الحضانة'], 'Cantine et périscolaire': ['Comedor y actividades extraescolares', 'المطعم المدرسي والأنشطة'],
    'Recherche d’emploi': ['Búsqueda de empleo', 'البحث عن عمل'], 'Formation': ['Formación', 'تكوين'], 'Arrivée dans la colonie': ['Llegada a la colonia', 'الوصول إلى المستعمرة'],
    'Aide d’urgence': ['Ayuda de urgencia', 'مساعدة طارئة'], 'Aide pour un dossier': ['Ayuda con un expediente', 'مساعدة في ملف'], 'Accompagnement': ['Acompañamiento', 'مرافقة'],
    'Permis d’extension de module': ['Licencia de ampliación de módulo', 'رخصة توسيع وحدة سكنية'], 'Plans du dôme': ['Planos de la cúpula', 'مخططات القبة'], 'Autorisation de travaux': ['Licencia de obras', 'رخصة أشغال']
  };
  const bi = (fr, en) => { const l = NT.i18n.langue; if (l === 'fr') return fr; const x = TR[fr]; return (l === 'es' && x && x[0]) || (l === 'ar' && x && x[1]) || en; };
  /* Pièces à apporter et agent générique : stockés en FR dans le rendez-vous, traduits à l'affichage [en, es, ar] */
  const PIECES = {
    'Pièce d’identité': ['ID document', 'Documento de identidad', 'وثيقة هوية'],
    'Justificatif de domicile de moins de 3 mois': ['Proof of address under 3 months old', 'Justificante de domicilio de menos de 3 meses', 'إثبات سكن لا يتجاوز 3 أشهر'],
    'Livret de famille (si acte concerné)': ['Family record book (if relevant)', 'Libro de familia (si procede)', 'دفتر العائلة (إن كان معنياً)'],
    'Carnet de santé ou de vaccination': ['Health or vaccination record', 'Cartilla sanitaria o de vacunación', 'الدفتر الصحي أو دفتر التطعيم'],
    'Carte de couverture santé de la colonie': ['Colony health coverage card', 'Tarjeta de cobertura sanitaria de la colonia', 'بطاقة التغطية الصحية للمستعمرة'],
    'Justificatif de revenus': ['Proof of income', 'Justificante de ingresos', 'إثبات الدخل'],
    'Dernier avis de charges du module': ['Latest module service-charge notice', 'Último aviso de gastos del módulo', 'آخر إشعار بمصاريف الوحدة السكنية'],
    'Pièce d’identité du responsable légal': ['Legal guardian’s ID', 'Documento de identidad del responsable legal', 'وثيقة هوية الولي الشرعي'],
    'Livret de famille': ['Family record book', 'Libro de familia', 'دفتر العائلة'],
    'Carnet de vaccination de l’enfant': ['Child’s vaccination record', 'Cartilla de vacunación del niño', 'دفتر تطعيم الطفل'],
    'Justificatif de domicile': ['Proof of address', 'Justificante de domicilio', 'إثبات سكن'],
    'CV à jour': ['Up-to-date CV', 'CV actualizado', 'سيرة ذاتية محدّثة'],
    'Diplômes ou attestations de formation': ['Diplomas or training certificates', 'Títulos o certificados de formación', 'شهادات أو إثباتات تكوين'],
    'Derniers justificatifs de ressources': ['Latest proof of resources', 'Últimos justificantes de recursos', 'آخر إثباتات الموارد'],
    'Plan du module concerné': ['Plan of the module concerned', 'Plano del módulo correspondiente', 'مخطط الوحدة السكنية المعنية'],
    'Description du projet de travaux': ['Description of the planned works', 'Descripción del proyecto de obras', 'وصف مشروع الأشغال'],
    'Agent d’accueil': ['Front desk officer', 'Agente de recepción', 'عون الاستقبال']
  };
  const piece = p => { const x = PIECES[p], i = { en: 0, es: 1, ar: 2 }[NT.i18n.langue]; return x && i !== undefined ? x[i] : p; };
  /* Motif stocké en FR dans le rendez-vous : retrouve sa version EN dans INFOS pour l'afficher dans la langue courante */
  const motifTxt = fr => { const m = [GENERIQUE].concat(Object.values(INFOS)).flatMap(i => i.motifs).find(x => x[0] === fr); return m ? bi(m[0], m[1]) : fr; };
  const { echap, $, $$ } = NT.ui;
  const loc = () => ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES', ar: 'ar' }[NT.i18n.langue] || 'fr-FR');
  const pad = n => String(n).padStart(2, '0');
  const cleJour = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const heureTxt = d => (NT.i18n.langue === 'fr' ? d.getHours() + ' h ' + pad(d.getMinutes()) : d.toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }));
  const jourLong = d => d.toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const quand = d => jourLong(d) + ' ' + bi('à', 'at') + ' ' + heureTxt(d);
  const nomService = s => NT.i18n.choisir(s.nom);

  const JOURS = 14, DUREE = 30;
  const HEURES = []; for (let m = 9 * 60; m <= 16 * 60 + 30; m += 30) HEURES.push(m);   // 9h00 → 16h30

  /* Informations par service : agent attribué (inventé), pièces à apporter, motifs fréquents */
  const GENERIQUE = { agent: 'Agent d’accueil', pieces: ['Pièce d’identité'], motifs: [['Renseignement', 'Information'], ['Autre motif', 'Other reason']] };
  const INFOS = {
    'etat-civil': { agent: 'Camille Aubert', pieces: ['Pièce d’identité', 'Justificatif de domicile de moins de 3 mois', 'Livret de famille (si acte concerné)'],
      motifs: [['Acte de naissance ou de mariage', 'Birth or marriage certificate'], ['Changement d’adresse', 'Change of address'], ['Papiers d’identité', 'ID papers']] },
    sante: { agent: 'Dr Nadia Okoye', pieces: ['Pièce d’identité', 'Carnet de santé ou de vaccination', 'Carte de couverture santé de la colonie'],
      motifs: [['Vaccination', 'Vaccination'], ['Consultation de prévention', 'Prevention check-up'], ['Suivi médical', 'Medical follow-up']] },
    logement: { agent: 'Hugo Delmas', pieces: ['Pièce d’identité', 'Justificatif de revenus', 'Dernier avis de charges du module'],
      motifs: [['Demande de module d’habitation', 'Housing module request'], ['Aide au logement', 'Housing aid'], ['Travaux dans mon module', 'Repairs in my module']] },
    education: { agent: 'Sonia Mercier', pieces: ['Pièce d’identité du responsable légal', 'Livret de famille', 'Carnet de vaccination de l’enfant', 'Justificatif de domicile'],
      motifs: [['Inscription scolaire', 'School enrolment'], ['Place en crèche', 'Nursery place'], ['Cantine et périscolaire', 'Canteen and after-school']] },
    emploi: { agent: 'Théo Lambert', pieces: ['Pièce d’identité', 'CV à jour', 'Diplômes ou attestations de formation'],
      motifs: [['Recherche d’emploi', 'Job search'], ['Formation', 'Training'], ['Arrivée dans la colonie', 'Arrival in the colony']] },
    social: { agent: 'Maëlle Fontaine', pieces: ['Pièce d’identité', 'Justificatif de domicile', 'Derniers justificatifs de ressources'],
      motifs: [['Aide d’urgence', 'Emergency aid'], ['Aide pour un dossier', 'Help with a file'], ['Accompagnement', 'Guidance']] },
    urbanisme: { agent: 'Paul Ribeiro', pieces: ['Pièce d’identité', 'Plan du module concerné', 'Description du projet de travaux'],
      motifs: [['Permis d’extension de module', 'Module extension permit'], ['Plans du dôme', 'Dome plans'], ['Autorisation de travaux', 'Building permit']] }
  };
  const info = id => INFOS[id] || GENERIQUE;
  const RAPPELS = {
    '24': { fr: '24 heures avant', en: '24 hours before', avants: [24], icone: 'ph-bell' },
    '2': { fr: '2 heures avant', en: '2 hours before', avants: [2], icone: 'ph-bell-simple' },
    both: { fr: '24 heures et 2 heures avant', en: '24 hours and 2 hours before', avants: [24, 2], icone: 'ph-bell-ringing' },
    none: { fr: 'Aucun rappel', en: 'No reminder', avants: [], icone: 'ph-bell-slash' }
  };

  NT.pret(() => {
    const u = NT.auth.utilisateur();
    const services = NT.services.tous().filter(s => s.rdv === true);
    const etat = { etape: 1, serviceId: '', motifIdx: '', jour: '', debut: null, rappel: '24' };
    let enCours = false;

    /* ---------- Créneaux ---------- */
    function pris(serviceId) {   // robuste au fuseau : on compare les instants, pas des chaînes de date
      const s = new Set();
      NT.store.get('rdv').forEach(r => { if (r.serviceId === serviceId && r.statut !== 'annule') s.add(new Date(r.debut).getTime()); });
      return s;
    }
    function creneauxDuJour(jour, serviceId) {
      const p = pris(serviceId), maintenant = Date.now();
      return HEURES.map(m => { const d = new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), Math.floor(m / 60), m % 60);
        return { date: d, libre: d.getTime() > maintenant && !p.has(d.getTime()) }; });
    }
    function jours() {
      const l = []; const base = new Date(); base.setHours(0, 0, 0, 0);
      for (let i = 0; i < JOURS; i++) { const d = new Date(base); d.setDate(base.getDate() + i); if (d.getDay() !== 0) l.push(d); }   // pas de dimanche
      return l;
    }

    /* ---------- Indicateur d'étapes ---------- */
    const NOMS = [['Service et motif', 'Service and reason'], ['Jour et heure', 'Day and time'], ['Confirmation', 'Confirmation']];
    function majIndicateur() {
      $('#indicateur').setAttribute('aria-label', bi('Étapes du rendez-vous', 'Appointment steps'));
      $('#indicateur').innerHTML = NOMS.map((n, i) => {
        const num = i + 1, fait = num < etat.etape, cour = num === etat.etape;
        return `<li class="${fait ? 'faite' : ''} ${cour ? 'courante' : ''}" ${cour ? 'aria-current="step"' : ''}>
          <span>${echap(bi(n[0], n[1]))}<span class="sr-only"> — ${echap(bi('étape ', 'step '))}${num}/3${fait ? echap(bi(', terminée', ', completed')) : cour ? echap(bi(', en cours', ', current')) : ''}</span></span></li>`;
      }).join('');
    }
    function allerA(n, focus) {
      etat.etape = n;
      [1, 2, 3].forEach(i => ($('#etape-' + i).hidden = i !== n));
      majIndicateur();
      if (focus) { const h = $('#h-e' + n); h.focus(); h.scrollIntoView({ block: 'start' }); NT.ui.annoncer($('#h-e' + n).textContent + ' — ' + bi('étape ', 'step ') + n + '/3'); }
    }

    /* ---------- Étape 1 : service et motif ---------- */
    const serviceUrl = NT.ui.param('service');
    $('#liste-services').innerHTML = services.map(s => {
      const ok = !s.etat || s.etat.code === 'ok';
      const altRdv = s.etat && s.etat.alternative && s.etat.alternative.texte ? ' ' + s.etat.alternative.texte : '';   // F63 : prochaine action possible
      return `<label class="dm-choix"><input type="radio" name="service" value="${echap(s.id)}" ${ok ? '' : 'disabled'} aria-describedby="sd-${echap(s.id)}">
        <span class="dm-choix-corps"><i class="ph-duotone ${echap(s.icone)} dm-ico" aria-hidden="true"></i><strong>${echap(nomService(s))}</strong>
          <span class="doux" id="sd-${echap(s.id)}">${ok ? echap(s.lieu || '') : `${NT.ui.niveauBadge(s)} ${echap(bi('Non réservable : ', 'Cannot be booked: '))}${echap(s.etat.message || '')} ${echap(s.etat.retour || '')}${echap(altRdv)}`}</span></span>
        <i class="ph-duotone ph-check-circle dm-coche" aria-hidden="true"></i></label>`;
    }).join('') || `<p class="vide">${echap(bi('Aucun service ne propose de rendez-vous pour le moment.', 'No service offers appointments at the moment.'))}</p>`;
    $('#indicateur').setAttribute('aria-label', bi('Étapes du rendez-vous', 'Appointment steps'));

    function peuplerMotifs() {
      const sel = $('#motif'), inf = info(etat.serviceId);
      sel.disabled = !etat.serviceId;
      sel.innerHTML = `<option value="">${echap(etat.serviceId ? bi('Choisir le motif…', 'Choose the reason…') : bi('Choisissez d’abord un service', 'Choose a service first'))}</option>` +
        (etat.serviceId ? inf.motifs.map((m, i) => `<option value="${i}">${echap(bi(m[0], m[1]))}</option>`).join('') : '');
      etat.motifIdx = '';
    }
    peuplerMotifs();
    function choisirService(id) {
      etat.serviceId = id; peuplerMotifs();
      $$('input[name=service]').forEach(r => (r.checked = r.value === id));
      effacer('service');
      if (etat.debut && etat.debut.service !== id) { etat.debut = null; etat.jour = ''; }
    }
    $$('input[name=service]').forEach(r => r.addEventListener('change', () => choisirService(r.value)));
    if (serviceUrl) {
      const s = NT.services.get(serviceUrl);
      if (s && s.rdv === true && (!s.etat || s.etat.code === 'ok')) choisirService(serviceUrl);
      else if (s) { const p = $('#err-service'); p.hidden = false; p.innerHTML = `<i class="ph ph-info" aria-hidden="true"></i><span>${echap(s.rdv === true ? nomService(s) + bi(' n’est pas réservable pour le moment. ', ' cannot be booked right now. ') + (s.etat.message || '') : nomService(s) + bi(' ne propose pas de rendez-vous en ligne. Choisissez un autre service.', ' does not offer online appointments. Choose another service.'))}</span>`; }
    }
    $('#motif').addEventListener('change', e => { etat.motifIdx = e.target.value; effacer('motif'); });

    function montrer(id, msg, champ) {
      const p = $('#err-' + id); p.innerHTML = `<i class="ph ph-warning-circle" aria-hidden="true"></i><span>${echap(msg)}</span>`; p.hidden = false;
      if (champ) champ.setAttribute('aria-invalid', 'true');
    }
    function effacer(id) { const p = $('#err-' + id); if (p) { p.hidden = true; p.textContent = ''; } if (id === 'motif') $('#motif').removeAttribute('aria-invalid'); }

    $('#suite-1').addEventListener('click', () => {
      effacer('service'); effacer('motif');
      if (!etat.serviceId) { montrer('service', bi('Choisissez un service pour continuer.', 'Choose a service to continue.')); $('input[name=service]:not([disabled])') && $('input[name=service]:not([disabled])').focus(); return; }
      if (etat.motifIdx === '') { montrer('motif', bi('Choisissez le motif du rendez-vous.', 'Choose the reason for the appointment.'), $('#motif')); $('#motif').focus(); return; }
      preparerJours(); allerA(2, true);
    });

    /* ---------- Étape 2 : jour puis créneau ---------- */
    function preparerJours() {
      const s = NT.services.get(etat.serviceId);
      $('#rappel-service').textContent = nomService(s) + ' · ' + bi(info(etat.serviceId).motifs[+etat.motifIdx][0], info(etat.serviceId).motifs[+etat.motifIdx][1]) + (s.lieu ? ' · ' + s.lieu : '');
      const l = jours();
      $('#liste-jours').innerHTML = l.map(d => {
        const libres = creneauxDuJour(d, etat.serviceId).filter(c => c.libre).length;
        const sel = etat.jour === cleJour(d);
        return `<li><button type="button" class="dm-pastille" data-jour="${cleJour(d)}" aria-pressed="${sel}" ${libres ? '' : 'disabled'}
          aria-label="${echap(jourLong(d) + ', ' + (libres ? libres + bi(' créneaux libres', ' free slots') : bi('complet', 'full')))}">
          <span>${echap(d.toLocaleDateString(loc(), { weekday: 'short', day: 'numeric', month: 'short' }))}</span>
          <small>${libres ? libres + ' ' + echap(bi('libres', 'free')) : echap(bi('Complet', 'Full'))}</small></button></li>`;
      }).join('');
      if (etat.jour) dessinerCreneaux(); else { $('#liste-creneaux').innerHTML = ''; $('#aide-creneaux').hidden = false; }
      majChoisi();
    }
    $('#liste-jours').addEventListener('click', e => {
      const b = e.target.closest('button[data-jour]'); if (!b || b.disabled) return;
      etat.jour = b.dataset.jour;
      if (etat.debut && cleJour(etat.debut.date) !== etat.jour) etat.debut = null;
      $$('#liste-jours button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      effacer('creneau');
      dessinerCreneaux(); majChoisi();
      NT.ui.annoncer(bi('Jour choisi : ', 'Day selected: ') + b.getAttribute('aria-label'));
    });
    function dessinerCreneaux() {
      const [a, m, j] = etat.jour.split('-').map(Number);
      const l = creneauxDuJour(new Date(a, m - 1, j), etat.serviceId);
      $('#aide-creneaux').hidden = true;
      $('#liste-creneaux').innerHTML = l.map(c => {
        const sel = etat.debut && etat.debut.date.getTime() === c.date.getTime();
        return `<li><button type="button" class="dm-pastille" data-ts="${c.date.getTime()}" aria-pressed="${!!sel}" ${c.libre ? '' : 'disabled'}
          aria-label="${echap(heureTxt(c.date) + (c.libre ? '' : ', ' + bi('indisponible', 'unavailable')))}">${echap(heureTxt(c.date))}${c.libre ? '' : `<small>${echap(bi('Pris', 'Taken'))}</small>`}</button></li>`;
      }).join('');
    }
    $('#liste-creneaux').addEventListener('click', e => {
      const b = e.target.closest('button[data-ts]'); if (!b || b.disabled) return;
      etat.debut = { date: new Date(+b.dataset.ts), service: etat.serviceId };
      $$('#liste-creneaux button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      effacer('creneau'); majChoisi();
    });
    function majChoisi() {
      const z = $('#choisi'), t = $('#choisi-texte');
      if (etat.debut) {
        z.classList.add('ok'); z.querySelector('i').className = 'ph-duotone ph-calendar-check';
        t.innerHTML = `${echap(bi('Créneau choisi : ', 'Selected slot: '))}<br><strong>${echap(quand(etat.debut.date))}</strong>`;
      } else {
        z.classList.remove('ok'); z.querySelector('i').className = 'ph-duotone ph-calendar-blank';
        t.textContent = bi('Aucun créneau choisi pour le moment.', 'No slot selected yet.');
      }
    }
    $('#retour-2').addEventListener('click', () => allerA(1, true));
    $('#suite-2').addEventListener('click', () => {
      effacer('creneau');
      if (!etat.debut) {
        montrer('creneau', etat.jour ? bi('Choisissez une heure pour continuer.', 'Choose a time to continue.') : bi('Choisissez un jour puis une heure pour continuer.', 'Choose a day then a time to continue.'));
        const cible = etat.jour ? $('#liste-creneaux button:not([disabled])') : $('#liste-jours button:not([disabled])');
        cible && cible.focus(); return;
      }
      recapitulatif(); allerA(3, true);
    });

    /* ---------- Étape 3 : récapitulatif + rappel ---------- */
    function ligne(lib, val) { return `<dt>${echap(lib)}</dt><dd>${val}</dd>`; }
    function recapitulatif() {
      const s = NT.services.get(etat.serviceId), inf = info(etat.serviceId), m = inf.motifs[+etat.motifIdx];
      $('#recap').innerHTML = `
        <div class="dm-choisi ok"><i class="ph-duotone ph-calendar-check" aria-hidden="true"></i><p>${echap(bi('Votre rendez-vous : ', 'Your appointment: '))}<br><strong>${echap(quand(etat.debut.date))}</strong></p></div>
        <dl class="dm-recap">
          ${ligne(bi('Service', 'Service'), echap(nomService(s)))}
          ${ligne(bi('Motif', 'Reason'), echap(bi(m[0], m[1])))}
          ${ligne(bi('Durée', 'Duration'), echap(DUREE + ' ' + bi('minutes', 'minutes')))}
          ${ligne(bi('Lieu', 'Place'), echap(s.lieu || bi('À confirmer', 'To be confirmed')))}
          ${ligne(bi('Agent', 'Staff member'), echap(piece(inf.agent)))}
        </dl>
        <div class="dm-bloc-conf"><h3><i class="ph-duotone ph-folder-simple" aria-hidden="true"></i>${echap(bi('Pièces à apporter', 'Documents to bring'))}</h3>
          <ul class="dm-pieces">${inf.pieces.map(p => `<li>${echap(piece(p))}</li>`).join('')}</ul></div>`;
      $('#liste-rappels').innerHTML = Object.keys(RAPPELS).map(k => `
        <label class="dm-choix compact"><input type="radio" name="rappel" value="${k}" ${etat.rappel === k ? 'checked' : ''}>
          <span class="dm-choix-corps"><i class="ph-duotone ${RAPPELS[k].icone} dm-ico" aria-hidden="true"></i><strong>${echap(bi(RAPPELS[k].fr, RAPPELS[k].en))}</strong></span>
          <i class="ph-duotone ph-check-circle dm-coche" aria-hidden="true"></i></label>`).join('');
      $$('input[name=rappel]').forEach(r => r.addEventListener('change', () => (etat.rappel = r.value)));
    }
    $('#retour-3').addEventListener('click', () => allerA(2, true));

    $('#form-rdv').addEventListener('submit', e => {
      e.preventDefault();
      if (enCours || etat.etape !== 3) return;
      enCours = true;
      const btn = $('#btn-confirmer'); btn.disabled = true; btn.setAttribute('aria-busy', 'true');
      $('#btn-confirmer-txt').textContent = bi('Confirmation…', 'Confirming…');
      const fin = () => { enCours = false; btn.disabled = false; btn.removeAttribute('aria-busy'); $('#btn-confirmer-txt').textContent = bi('Confirmer le rendez-vous', 'Confirm the appointment'); };
      // Le créneau a pu être pris entre-temps (autre onglet)
      if (pris(etat.serviceId).has(etat.debut.date.getTime()) || etat.debut.date.getTime() <= Date.now()) {
        fin(); etat.debut = null; preparerJours(); allerA(2, true);
        montrer('creneau', bi('Ce créneau vient d’être pris. Choisissez-en un autre.', 'This slot has just been taken. Choose another one.'));
        return;
      }
      const s = NT.services.get(etat.serviceId), inf = info(etat.serviceId), m = inf.motifs[+etat.motifIdx], rap = RAPPELS[etat.rappel];
      const r = NT.rdv.creer({
        serviceId: etat.serviceId, debut: etat.debut.date.toISOString(), duree: DUREE,
        libelle: nomService(s) + ' — ' + m[0], lieu: s.lieu || '', motif: m[0], pieces: inf.pieces.slice(), agent: inf.agent,
        rappel: { actif: rap.avants.length > 0, avant: rap.avants[0] || 24, avants: rap.avants.slice(), envoye: false }
      });
      NT.rdv.verifierRappels();      // si le rendez-vous est dans moins de 24 h : le rappel est émis tout de suite
      rappelsComplementaires();
      confirmer(r, s, inf, rap);
      rendreMesRdv();
      fin();
    });

    /* ---------- Confirmation ---------- */
    function confirmer(r, s, inf, rap) {
      const d = new Date(r.debut);
      const z = $('#confirmation');
      z.innerHTML = `
        <div class="dm-succes" aria-hidden="true"><i class="ph-duotone ph-calendar-check"></i></div>
        <h2 id="conf-titre" tabindex="-1">${echap(bi('Votre rendez-vous est confirmé', 'Your appointment is confirmed'))}</h2>
        <div class="dm-numero"><span class="nb" style="font-size:clamp(1.1rem,3.2vw,1.5rem)">${echap(quand(d))}</span></div>
        <div class="gauche">
          <div class="dm-bloc-conf"><dl class="dm-recap">
            ${ligne(bi('Service', 'Service'), echap(nomService(s)))}
            ${ligne(bi('Motif', 'Reason'), echap(motifTxt(r.motif)))}
            ${ligne(bi('Durée', 'Duration'), echap(DUREE + ' ' + bi('minutes', 'minutes')))}
            ${ligne(bi('Lieu', 'Place'), echap(r.lieu))}
            ${ligne(bi('Agent', 'Staff member'), echap(piece(info(r.serviceId).agent)))}
            ${ligne(bi('Rappel', 'Reminder'), echap(bi(rap.fr, rap.en)))}
          </dl></div>
          <div class="dm-bloc-conf"><h3><i class="ph-duotone ph-folder-simple" aria-hidden="true"></i>${echap(bi('N’oubliez pas d’apporter', 'Remember to bring'))}</h3>
            <ul class="dm-pieces">${(r.pieces || []).map(p => `<li>${echap(piece(p))}</li>`).join('')}</ul></div>
        </div>
        <div class="dm-actions">
          <button class="btn btn-primaire" type="button" id="btn-ics"><i class="ph ph-calendar-plus" aria-hidden="true"></i>${echap(bi('Ajouter à mon calendrier', 'Add to my calendar'))}</button>
          <a class="btn" href="#h-mes" id="lien-mes">${echap(bi('Voir mes rendez-vous', 'See my appointments'))}</a>
          <button class="btn" type="button" id="btn-autre">${echap(bi('Prendre un autre rendez-vous', 'Book another appointment'))}</button></div>`;
      $('#zone-parcours').hidden = true; z.hidden = false;
      $('#btn-ics').addEventListener('click', () => telechargerIcs(r));
      $('#lien-mes').addEventListener('click', e => { e.preventDefault(); const h = $('#h-mes'); h.scrollIntoView(); h.focus(); });
      $('#btn-autre').addEventListener('click', () => {
        Object.assign(etat, { serviceId: '', motifIdx: '', jour: '', debut: null, rappel: '24' });
        $$('input[name=service]').forEach(x => (x.checked = false)); peuplerMotifs();
        z.hidden = true; $('#zone-parcours').hidden = false; allerA(1, true);
      });
      window.scrollTo(0, 0);
      $('#conf-titre').focus();
      NT.ui.annoncer(bi('Rendez-vous confirmé : ', 'Appointment confirmed: ') + quand(d));
    }

    /* ---------- Export .ics (VALARM selon le rappel) ---------- */
    const fmtU = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const escIcs = s => String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
    function construireIcs(r) {
      const deb = new Date(r.debut), fin = new Date(deb.getTime() + (r.duree || DUREE) * 60000);
      const rp = r.rappel || {};
      const avants = rp.actif ? (rp.avants && rp.avants.length ? rp.avants : [rp.avant || 24]) : [];
      const l = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Terra Nova//Rendez-vous//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
        'UID:' + r.id + '@terra-nova.nova-terra', 'DTSTAMP:' + fmtU(new Date()), 'DTSTART:' + fmtU(deb), 'DTEND:' + fmtU(fin),
        'SUMMARY:' + escIcs(r.libelle || 'Rendez-vous Terra Nova'), 'LOCATION:' + escIcs(r.lieu),
        'DESCRIPTION:' + escIcs('Agent : ' + info(r.serviceId).agent + (r.pieces && r.pieces.length ? '\nÀ apporter : ' + r.pieces.join(', ') : '')), 'STATUS:CONFIRMED'];
      avants.forEach(h => l.push('BEGIN:VALARM', 'TRIGGER:-PT' + h + 'H', 'ACTION:DISPLAY', 'DESCRIPTION:' + escIcs('Rappel : ' + (r.libelle || 'rendez-vous') + ' dans ' + h + ' h'), 'END:VALARM'));
      l.push('END:VEVENT', 'END:VCALENDAR');
      return l.join('\r\n') + '\r\n';
    }
    function telechargerIcs(r) {
      const blob = new Blob([construireIcs(r)], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: 'rendez-vous-' + r.id + '.ics' });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      NT.ui.toast(bi('Fichier du calendrier téléchargé.', 'Calendar file downloaded.'), 'success');
    }

    /* ---------- Rappel « 2 h avant » (le socle gère un seul délai : on complète ici) ---------- */
    function rappelsComplementaires() {
      const t = Date.now();
      NT.rdv.pour(u.id).forEach(r => {
        const rp = r.rappel || {};
        if (r.statut !== 'confirme' || !rp.actif || !(rp.avants || []).includes(2) || rp.avant === 2 || rp.envoye2) return;   // avant===2 : géré par le socle
        const debut = new Date(r.debut).getTime();
        if (debut > t && debut - t <= 2 * 3600 * 1000) {
          NT.notif.ajouter(u.id, bi('⏰ Rappel : rendez-vous à ', '⏰ Reminder: appointment at ') + heureTxt(new Date(r.debut)) + bi(' (dans moins de 2 h)', ' (in less than 2 h)'), (r.libelle || '') + (r.lieu ? ' — ' + r.lieu : ''), 'rendez-vous.html', 'importante');
          NT.store.update('rdv', r.id, x => ({ rappel: Object.assign({}, x.rappel, { envoye2: true }) }));
        }
      });
    }
    rappelsComplementaires();

    /* ---------- Mes rendez-vous ---------- */
    function carteRdv(r, avenir) {
      const d = new Date(r.debut), s = NT.services.get(r.serviceId);
      const annule = r.statut === 'annule';
      const badge = annule ? `<span class="statut statut-incident"><i class="ph-duotone ph-x-circle" aria-hidden="true"></i>${echap(bi('Annulé', 'Cancelled'))}</span>`
        : avenir ? `<span class="statut statut-ok"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i>${echap(bi('Confirmé', 'Confirmed'))}</span>`
          : `<span class="statut statut-cloturee"><i class="ph-duotone ph-clock-counter-clockwise" aria-hidden="true"></i>${echap(bi('Passé', 'Past'))}</span>`;
      const rp = r.rappel && r.rappel.actif ? ((r.rappel.avants || [r.rappel.avant]).map(h => h + ' h').join(' + ')) : '';
      return `<li class="${annule ? 'annule' : ''}"><h4>${echap(s ? nomService(s) : r.libelle)} ${badge}</h4>
        <p style="margin:0"><strong>${echap(quand(d))}</strong></p>
        <p class="meta"><i class="ph ph-map-pin" aria-hidden="true"></i> ${echap(r.lieu || '')} · ${echap(piece(info(r.serviceId).agent))}${r.motif ? ' · ' + echap(motifTxt(r.motif)) : ''}</p>
        ${avenir && !annule ? `<p class="meta"><i class="ph ph-bell" aria-hidden="true"></i> ${echap(rp ? bi('Rappel : ', 'Reminder: ') + rp + bi(' avant', ' before') : bi('Sans rappel', 'No reminder'))}</p>
          <div class="ligne"><button class="btn" type="button" data-ics="${echap(r.id)}"><i class="ph ph-calendar-plus" aria-hidden="true"></i>${echap(bi('Ajouter à mon calendrier', 'Add to my calendar'))}</button>
          <button class="btn btn-danger" type="button" data-annuler="${echap(r.id)}"><i class="ph ph-x" aria-hidden="true"></i>${echap(bi('Annuler ce rendez-vous', 'Cancel this appointment'))}</button></div>` : ''}</li>`;
    }
    function rendreMesRdv() {
      const t = Date.now(), tous = NT.rdv.pour(u.id);
      const avenir = tous.filter(r => r.statut === 'confirme' && new Date(r.debut).getTime() > t);
      const passes = tous.filter(r => !avenir.includes(r)).sort((a, b) => b.debut.localeCompare(a.debut));
      $('#liste-avenir').innerHTML = avenir.length ? `<ul class="dm-rdv-liste" aria-labelledby="h-avenir">${avenir.map(r => carteRdv(r, true)).join('')}</ul>`
        : `<p class="vide">${echap(bi('Aucun rendez-vous à venir.', 'No upcoming appointment.'))}</p>`;
      $('#liste-passes').innerHTML = passes.length ? `<ul class="dm-rdv-liste" aria-labelledby="h-passes">${passes.map(r => carteRdv(r, false)).join('')}</ul>`
        : `<p class="vide">${echap(bi('Aucun rendez-vous passé ou annulé.', 'No past or cancelled appointment.'))}</p>`;
    }
    rendreMesRdv();

    const dlg = $('#dlg-annul');
    let aAnnuler = null, declencheur = null;
    document.addEventListener('click', e => {
      const bi_ = e.target.closest('[data-ics]');
      if (bi_) { const r = NT.store.find('rdv', bi_.dataset.ics); if (r) telechargerIcs(r); return; }
      const ba = e.target.closest('[data-annuler]'); if (!ba) return;
      const r = NT.store.find('rdv', ba.dataset.annuler); if (!r) return;
      aAnnuler = r; declencheur = ba;
      $('#dlg-titre').textContent = bi('Annuler ce rendez-vous ?', 'Cancel this appointment?');
      $('#dlg-texte').textContent = (NT.services.get(r.serviceId) ? nomService(NT.services.get(r.serviceId)) : r.libelle) + ' — ' + quand(new Date(r.debut)) + '. ' + bi('Le créneau sera de nouveau proposé aux autres habitants.', 'The slot will be offered again to other residents.');
      $('#dlg-garder').textContent = bi('Garder le rendez-vous', 'Keep the appointment');
      $('#dlg-ok').textContent = bi('Oui, annuler', 'Yes, cancel');
      dlg.showModal();
    });
    dlg.addEventListener('close', () => {
      if (dlg.returnValue === 'annuler' && aAnnuler) {
        NT.rdv.annuler(aAnnuler.id);
        NT.ui.toast(bi('Rendez-vous annulé.', 'Appointment cancelled.'), 'success');
        rendreMesRdv();
        if (etat.etape === 2 && etat.serviceId) preparerJours();
        const h = $('#h-mes'); h.focus();
      } else if (declencheur && document.contains(declencheur)) declencheur.focus();
      dlg.returnValue = ''; aAnnuler = null;
    });

    /* ---------- Exemple de rappel (démo F40) ---------- */
    $('#btn-exemple').addEventListener('click', () => {
      const prochain = NT.rdv.pour(u.id).filter(r => r.statut === 'confirme' && new Date(r.debut).getTime() > Date.now())[0];
      let titre, texte;
      if (prochain) {
        const d = new Date(prochain.debut);
        titre = bi('⏰ Rappel : rendez-vous ', '⏰ Reminder: appointment ') + d.toLocaleString(loc(), { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
        texte = (prochain.libelle || '') + (prochain.lieu ? ' — ' + prochain.lieu : '') + (prochain.pieces && prochain.pieces.length ? '. ' + bi('À apporter : ', 'Bring: ') + prochain.pieces.map(piece).join(', ') : '');
      } else {
        titre = bi('⏰ Rappel (exemple) : rendez-vous demain à 10 h 30', '⏰ Reminder (example): appointment tomorrow at 10:30');
        texte = bi('État civil — Hôtel de ville, niveau 1. À apporter : pièce d’identité, justificatif de domicile.', 'Civil registry — City hall, level 1. Bring: ID, proof of address.');
      }
      NT.notif.ajouter(u.id, titre, texte, 'rendez-vous.html', 'importante');
      NT.ui.toast(bi('Exemple de rappel ajouté : ouvrez la cloche en haut de la page pour le lire.', 'Example reminder added: open the bell at the top of the page to read it.'), 'primary', 7000);
    });

    allerA(1, false);
  });
})();
